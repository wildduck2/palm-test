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



