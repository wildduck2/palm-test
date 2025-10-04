import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ResponseType } from '~/common/types'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(): Promise<ResponseType<typeof this.analyticsService.getComprehensiveDashboard, string>> {
    const data = await this.analyticsService.getComprehensiveDashboard()
    return { data, message: 'ANALYTICS_GET_DASHBOARD_FAILED', state: 'success' }
  }

  @Get('tokens/overview')
  async getTokenOverview() {
    return this.analyticsService.getTokenOverview()
  }

  @Get('tokens/by-status')
  async getTokensByStatus() {
    return this.analyticsService.getTokensByStatus()
  }

  @Get('tokens/by-service')
  async getTokensByService() {
    return this.analyticsService.getTokensByService()
  }

  @Get('tokens/expiring')
  async getExpiringTokens(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analyticsService.getTokensExpiringInDays(days)
  }

  @Get('tokens/needing-notification')
  async getTokensNeedingNotification() {
    return this.analyticsService.getTokensNeedingNotification()
  }

  @Get('tokens/renewal-stats')
  async getTokenRenewalStats() {
    return this.analyticsService.getTokenRenewalStats()
  }

  @Get('users/stats')
  async getUserStats(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.analyticsService.getUserTokenStats(limit)
  }

  @Get('users/overview')
  async getActiveUsersStats() {
    return this.analyticsService.getActiveUsersStats()
  }

  @Get('otp/stats')
  async getOtpStats() {
    return this.analyticsService.getOtpCodeStats()
  }
}
