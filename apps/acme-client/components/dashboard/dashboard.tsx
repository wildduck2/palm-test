'use client'

import { Badge } from '@acme/ui/badge'
import { Button } from '@acme/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card'
import { Input } from '@acme/ui/input'
import { Skeleton } from '@acme/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Key,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { server_api } from '~/libs/axios'
import { ChartAreaInteractive } from './charts-area'
import { DataTable } from './data-table'

interface TokenOverview {
  total: number
  expired: number
  active: number
  expiringSoon: number
  deleted: number
}

interface TokenByStatus {
  status: string
  count: number
}

interface TokenByService {
  serviceId: string
  serviceName: string
  serviceDescription: string | null
  totalTokens: number
  activeTokens: number
  expiredTokens: number
}

interface ExpiringToken {
  id: string
  name: string
  serviceName: string
  userName: string | null
  userEmail: string | null
  expiresAt: string
  daysUntilExpiry: string
  status: string
}

interface RenewalStats {
  totalRenewed: number
  renewedThisMonth: number
  avgRenewalTimeSeconds: number | null
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  recentlyActive: number
  deletedUsers: number
}

interface TopUser {
  userId: string
  userName: string
  email: string
  totalTokens: number
  activeTokens: number
  expiredTokens: number
}

interface OtpStats {
  total: number
  active: number
  expired: number
  deleted: number
}

interface DashboardData {
  timestamp: string
  tokens: {
    overview: TokenOverview
    byStatus: TokenByStatus[]
    byService: TokenByService[]
    expiringSoon: ExpiringToken[]
    needingNotification: any[]
    renewalStats: RenewalStats
  }
  users: {
    stats: UserStats
    topUsers: TopUser[]
  }
  otp: OtpStats
}

function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  description,
  icon: Icon,
}: {
  title: string
  value: string | number
  trend?: 'up' | 'down'
  trendLabel?: string
  description: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>{trendLabel}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-bold text-3xl">{value}</div>
            <p className="mt-1 text-muted-foreground text-xs">{description}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-foreground p-3 shadow-lg">
        <p className="mb-1 font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p className="text-xs" key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsDashboard() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [timePeriod, setTimePeriod] = React.useState<'7d' | '30d' | '3m'>('30d')

  const { data, isLoading, isError, refetch, isFetching } = useQuery<DashboardData>({
    queryFn: async () => {
      const { data: res } = await server_api.get('/analytics/dashboard')
      return res.data
    },
    queryKey: ['analytics-dashboard'],
    refetchInterval: 30000,
  })

  const timeSeriesData = React.useMemo(() => {
    const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return {
        active: Math.floor(Math.random() * 50) + (data ? data.tokens.overview.active * 0.8 : 0),
        date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        expired: Math.floor(Math.random() * 20) + (data ? data.tokens.overview.expired * 0.5 : 0),
      }
    })
  }, [data, timePeriod])

  const filteredTokens = React.useMemo(() => {
    if (!searchQuery || !data) return []
    const query = searchQuery.toLowerCase()
    return data.tokens.expiringSoon.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.serviceName.toLowerCase().includes(query) ||
        token.userName?.toLowerCase().includes(query) ||
        token.userEmail?.toLowerCase().includes(query),
    )
  }, [data, searchQuery])

  const healthScore = data ? Math.round((data.tokens.overview.active / data.tokens.overview.total) * 100) : 0

  React.useEffect(() => {
    if (isError) {
      toast.error('Failed to load analytics')
    }
  }, [isError])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>Failed to load analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Monitor your token infrastructure</p>
          </div>
          <Button disabled={isFetching} onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            description="All tokens in system"
            icon={Key}
            title="Total Tokens"
            trend="up"
            trendLabel="+12.5%"
            value={data.tokens.overview.total.toLocaleString()}
          />
          <MetricCard
            description={`${healthScore}% of total`}
            icon={CheckCircle2}
            title="Active Tokens"
            trend="up"
            trendLabel="+8.2%"
            value={data.tokens.overview.active.toLocaleString()}
          />
          <MetricCard
            description="Next 30 days"
            icon={Clock}
            title="Expiring Soon"
            trend="down"
            trendLabel="-3.1%"
            value={data.tokens.overview.expiringSoon.toLocaleString()}
          />
          <MetricCard
            description="Registered users"
            icon={Users}
            title="Total Users"
            trend="up"
            trendLabel="+5.4%"
            value={data.users.stats.totalUsers.toLocaleString()}
          />
        </div>

        {/* Time Series Chart */}
        <ChartAreaInteractive />

        {/* Footer */}
        <div className="text-center text-muted-foreground text-xs">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
