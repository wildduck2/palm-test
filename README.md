# `@gentleduck/duck-kit`
Monorepo template with full-stack TypeScript, Docker, and pnpm workspaces.

---

## 🧠 1. `acme-server` – NestJS Backend

* Modular backend API using **NestJS**
* Integrates PostgreSQL, Redis, MinIO, Mailer
* Hot reload via `start:dev`
* **Directory**: `apps/acme-server`

---

## 🖥️ 2. `acme-client` – Next.js Frontend

* App Router + Tailwind + modular folders
* Connected to backend and shared packages
* **Directory**: `apps/acme-client`

---

## 🐘 3. `acme-postgres` – PostgreSQL

* Persistent database with Docker volume
* Used by backend and Drizzle ORM
* **Docker Service Only**

---

## 🧊 4. `acme-redis` – Redis Cache

* In-memory store for sessions, caching, queues
* Auto-restart and fast boot
* **Docker Service Only**

---

## ☁️ 5. `acme-minio` – S3-Compatible Storage

* S3-compatible object storage with web console
* Used for file uploads and asset storage
* **Docker Service Only**

---

## 🧬 6. `acme-drizzle` – Drizzle Studio

* GUI for inspecting PostgreSQL schema
* Runs from custom Dockerfile
* **Directory**: `packages/db`

---

## 💌 7. `acme-mailhog` – Email Tester

* Catches and displays outgoing emails
* SMTP + web UI for local testing
* **Docker Service Only**

---

### Sketch Token Expiry Automation

**Overview**

This section outlines the proposed implementation for a feature that automatically emails engineers when their access token is due to expire within a 3-day window. The system will be designed to avoid sending notifications for tokens that have already been renewed or for which a notification has already been sent.

The plan leverages the existing project structure, including the NestJS backend, the Drizzle ORM, and the pre-configured email service.

**1. Trigger Mechanism: Scheduled Cron Job**

The automation will be triggered by a scheduled task running once per day.

-   **Implementation:** A new method will be created within the `apps/acme-server/src/access-tokens/access-tokens.service.ts` file.
-   **Technology:** We will use the `@nestjs/schedule` package. The new method will be decorated with `@Cron(CronExpression.EVERY_DAY_AT_3AM)` to ensure it runs at a consistent time.
-   **Setup:** The `ScheduleModule.forRoot()` will be added to the imports array in `apps/acme-server/src/app.module.ts` to enable scheduling.

**2. State Tracking & Data Model**

The existing `accessTokens` table in the PostgreSQL database is already well-suited for this task. We will use the following columns:

-   `expires_at` (timestamp): To determine which tokens are nearing expiry.
-   `renewed_at` (timestamp): A `NULL` value in this column indicates the token has not been renewed.
-   `notified` (boolean): This flag will be used to track whether an expiry notification has been sent, preventing duplicate emails.
-   `status` (enum): To ensure we only process tokens that are currently `'active'`.
-   `user_id` (uuid): To link the token back to the user who needs to be notified.

**3. Core Logic & Pseudocode**

The cron job will execute the following logic within the `access-tokens.service.ts`:

```typescript
// In apps/acme-server/src/access-tokens/access-tokens.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, isNull, lte, gte, inArray } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { EmailService } from '../email/email.service';
import { accessTokens, users } from '@acme/db/src/tables';

@Injectable()
export class AccessTokensService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleTokenExpiryAutomation() {
    // 1. Define the expiry window (now + 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // 2. Find relevant tokens using Drizzle ORM
    const expiringTokens = await this.drizzle.db.query.accessTokens.findMany({
      with: {
        user: true, // Join with the user table to get email
      },
      where: and(
        eq(accessTokens.status, 'active'),
        eq(accessTokens.notified, false),
        isNull(accessTokens.renewed_at),
        lte(accessTokens.expires_at, threeDaysFromNow),
        gte(accessTokens.expires_at, new Date()), // Ensure it hasn't already expired
        eq(users.is_active, true) // Ensure user is still active
      ),
    });

    if (expiringTokens.length === 0) {
      return; // No tokens to process
    }

    // 3. Send notifications
    for (const token of expiringTokens) {
      if (token.user) {
        await this.emailService.sendExpiringTokenEmail(token.user, token);
      }
    }

    // 4. Mark tokens as notified to prevent spam
    const tokenIds = expiringTokens.map(t => t.id);
    if (tokenIds.length > 0) {
      await this.drizzle.db
        .update(accessTokens)
        .set({ notified: true })
        .where(inArray(accessTokens.id, tokenIds));
    }
  }
}
```

**4. Bonus: Edge Cases & Considerations**

-   **Timezones:** All dates (`expires_at`, `created_at`, etc.) are stored with timezones in the database (`timestamp with time zone`). The cron job logic must be written to handle timezones correctly, and all server-side date operations should be in UTC to maintain consistency.
-   **Job Failure & Idempotency:** If the cron job fails after sending some emails but before marking them as `notified`, the next run might send duplicate emails. The current logic minimizes this, but for a fully robust system, one could update the `notified` flag inside the loop for each token. However, this is less performant. The current batch update is a good trade-off.
-   **User Deactivated:** The query includes a check (`users.is_active`) to ensure notifications are not sent for tokens belonging to deactivated users.
-   **Email Service Failure:** If the `emailService` fails, the error will be caught by NestJS's global error handling. The `notified` flag will not be set, so the system will automatically retry sending the notification on the next daily run.
-   **Performance:** For very large `accessTokens` tables, the daily query could become slow. The existing indexes on `expires_at`, `status`, and `user_id` are beneficial and should be maintained.