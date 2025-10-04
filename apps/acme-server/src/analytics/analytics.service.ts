import { Inject, Injectable } from '@nestjs/common'
import { and, count, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DrizzleAsyncProvider, schema } from '~/drizzle'

const { accessTokens, users, services, otpCodes } = schema

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private drizzle: NodePgDatabase<typeof schema>,
  ) {}

  async getTokenOverview() {
    const now = new Date()
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await this.drizzle
      .select({
        active: count(
          sql`CASE WHEN ${accessTokens.expires_at} >= ${now} AND ${accessTokens.deleted_at} IS NULL THEN 1 END`,
        ),
        deleted: count(sql`CASE WHEN ${accessTokens.deleted_at} IS NOT NULL THEN 1 END`),
        expired: count(sql`CASE WHEN ${accessTokens.expires_at} < ${now} THEN 1 END`),
        expiringSoon: count(
          sql`CASE WHEN ${accessTokens.expires_at} BETWEEN ${now} AND ${sevenDaysFromNow} AND ${accessTokens.deleted_at} IS NULL THEN 1 END`,
        ),
        total: count(),
      })
      .from(accessTokens)

    return result[0]
  }

  async getTokensByStatus() {
    return await this.drizzle
      .select({
        count: count(),
        status: accessTokens.status,
      })
      .from(accessTokens)
      .where(isNull(accessTokens.deleted_at))
      .groupBy(accessTokens.status)
  }

  async getTokensByService() {
    const now = new Date()

    return await this.drizzle
      .select({
        activeTokens: count(
          sql`CASE WHEN ${accessTokens.expires_at} >= ${now} AND ${accessTokens.deleted_at} IS NULL THEN 1 END`,
        ),
        expiredTokens: count(sql`CASE WHEN ${accessTokens.expires_at} < ${now} THEN 1 END`),
        serviceDescription: services.description,
        serviceId: services.id,
        serviceName: services.name,
        totalTokens: count(),
      })
      .from(accessTokens)
      .innerJoin(services, eq(accessTokens.service_id, services.id))
      .where(isNull(services.deleted_at))
      .groupBy(services.id, services.name, services.description)
      .orderBy(desc(count()))
  }

  async getTokensExpiringInDays(days: number = 30) {
    const now = new Date()
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    return await this.drizzle
      .select({
        daysUntilExpiry: sql<number>`EXTRACT(DAY FROM ${accessTokens.expires_at} - ${now})`,
        expiresAt: accessTokens.expires_at,
        id: accessTokens.id,
        name: accessTokens.name,
        serviceName: services.name,
        status: accessTokens.status,
        userEmail: users.email,
        userName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
      })
      .from(accessTokens)
      .innerJoin(services, eq(accessTokens.service_id, services.id))
      .leftJoin(users, eq(accessTokens.user_id, users.id))
      .where(
        and(isNull(accessTokens.deleted_at), gt(accessTokens.expires_at, now), lt(accessTokens.expires_at, futureDate)),
      )
      .orderBy(accessTokens.expires_at)
  }

  async getUserTokenStats(limit: number = 10) {
    const now = new Date()

    return await this.drizzle
      .select({
        activeTokens: count(
          sql`CASE WHEN ${accessTokens.expires_at} >= ${now} AND ${accessTokens.deleted_at} IS NULL THEN 1 END`,
        ),
        email: users.email,
        expiredTokens: count(sql`CASE WHEN ${accessTokens.expires_at} < ${now} THEN 1 END`),
        totalTokens: count(),
        userId: users.id,
        userName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
      })
      .from(users)
      .leftJoin(accessTokens, eq(users.id, accessTokens.user_id))
      .where(isNull(users.deleted_at))
      .groupBy(users.id, users.first_name, users.last_name, users.email)
      .having(gt(count(), 0))
      .orderBy(desc(count()))
      .limit(limit)
  }

  async getTokensNeedingNotification() {
    const now = new Date()

    return await this.drizzle
      .select({
        expiresAt: accessTokens.expires_at,
        id: accessTokens.id,
        name: accessTokens.name,
        serviceName: services.name,
        status: accessTokens.status,
        userEmail: users.email,
      })
      .from(accessTokens)
      .innerJoin(services, eq(accessTokens.service_id, services.id))
      .leftJoin(users, eq(accessTokens.user_id, users.id))
      .where(and(isNull(accessTokens.deleted_at), lt(accessTokens.expires_at, now), eq(accessTokens.notified, false)))
      .orderBy(accessTokens.expires_at)
  }

  async getTokenRenewalStats() {
    const result = await this.drizzle
      .select({
        avgRenewalTimeSeconds: sql<number>`AVG(EXTRACT(EPOCH FROM (${accessTokens.renewed_at} - ${accessTokens.created_at})))`,
        renewedThisMonth: count(
          sql`CASE WHEN ${accessTokens.renewed_at} >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN 1 END`,
        ),
        totalRenewed: count(sql`CASE WHEN ${accessTokens.renewed_at} IS NOT NULL THEN 1 END`),
      })
      .from(accessTokens)
      .where(isNull(accessTokens.deleted_at))

    return result[0]
  }

  async getOtpCodeStats() {
    const now = new Date()

    const result = await this.drizzle
      .select({
        active: count(
          sql`CASE WHEN ${otpCodes.is_active} = true AND ${otpCodes.expires_at} >= ${now} AND ${otpCodes.deleted_at} IS NULL THEN 1 END`,
        ),
        deleted: count(sql`CASE WHEN ${otpCodes.deleted_at} IS NOT NULL THEN 1 END`),
        expired: count(sql`CASE WHEN ${otpCodes.expires_at} < ${now} THEN 1 END`),
        total: count(),
      })
      .from(otpCodes)

    return result[0]
  }

  async getActiveUsersStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await this.drizzle
      .select({
        activeUsers: count(sql`CASE WHEN ${users.is_active} = true AND ${users.deleted_at} IS NULL THEN 1 END`),
        deletedUsers: count(sql`CASE WHEN ${users.deleted_at} IS NOT NULL THEN 1 END`),
        recentlyActive: count(sql`CASE WHEN ${users.last_login_at} >= ${thirtyDaysAgo} THEN 1 END`),
        totalUsers: count(),
      })
      .from(users)

    return result[0]
  }

  async getComprehensiveDashboard() {
    const [
      overview,
      byStatus,
      byService,
      expiringTokens,
      userStats,
      renewalStats,
      otpStats,
      activeUsersStats,
      needingNotification,
    ] = await Promise.all([
      this.getTokenOverview(),
      this.getTokensByStatus(),
      this.getTokensByService(),
      this.getTokensExpiringInDays(30),
      this.getUserTokenStats(10),
      this.getTokenRenewalStats(),
      this.getOtpCodeStats(),
      this.getActiveUsersStats(),
      this.getTokensNeedingNotification(),
    ])

    return {
      otp: otpStats,
      timestamp: new Date().toISOString(),
      tokens: {
        byService,
        byStatus,
        expiringSoon: expiringTokens,
        needingNotification,
        overview,
        renewalStats,
      },
      users: {
        stats: activeUsersStats,
        topUsers: userStats,
      },
    }
  }
}
