import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Account } from '@/types/crm'
import { 
  TrendUp, 
  TrendDown, 
  Users, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  ChartLine,
  Filter,
  Calendar,
  Brain,
  Warning,
  Heart,
  Activity
} from '@phosphor-icons/react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

interface AccountAnalyticsProps {
  companyId: string
  userId: string
  accounts: Account[]
}

interface AnalyticsData {
  totalAccounts: number
  totalRevenue: number
  averageHealthScore: number
  highRiskAccounts: number
  conversionRate: number
  retentionRate: number
  growthRate: number
  churnRate: number
  topPerformingAccounts: Account[]
  riskAccounts: Account[]
  revenueByMonth: { month: string; revenue: number; accounts: number }[]
  accountsByType: { type: string; count: number; value: number }[]
  accountsByIndustry: { industry: string; count: number; revenue: number }[]
  healthScoreDistribution: { range: string; count: number }[]
  engagementMetrics: { level: string; count: number; percentage: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AccountAnalyticsDashboard({ companyId, userId, accounts }: AccountAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate analytics data
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      calculateAnalytics()
    }
  }, [accounts, timeRange])

  const calculateAnalytics = async () => {
    setIsLoading(true)
    
    try {
      // Calculate basic metrics
      const totalAccounts = accounts.length
      const totalRevenue = accounts.reduce((sum, acc) => sum + (acc.totalRevenue || 0), 0)
      const averageHealthScore = accounts.reduce((sum, acc) => sum + (acc.healthScore || 50), 0) / totalAccounts
      const highRiskAccounts = accounts.filter(acc => acc.riskLevel === 'high' || acc.riskLevel === 'critical').length
      
      // Mock calculated metrics (in real implementation, these would be calculated from historical data)
      const conversionRate = 15.2
      const retentionRate = 87.5
      const growthRate = 12.8
      const churnRate = 4.2

      // Top performing accounts (by revenue and health score)
      const topPerformingAccounts = [...accounts]
        .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0) + (b.healthScore || 0) - (a.healthScore || 0))
        .slice(0, 5)

      // Risk accounts
      const riskAccounts = accounts
        .filter(acc => acc.riskLevel === 'high' || acc.riskLevel === 'critical')
        .sort((a, b) => (b.churnRisk || 0) - (a.churnRisk || 0))
        .slice(0, 5)

      // Revenue by month (mock data)
      const revenueByMonth = [
        { month: 'Jan', revenue: 245000, accounts: 12 },
        { month: 'Feb', revenue: 287000, accounts: 14 },
        { month: 'Mar', revenue: 332000, accounts: 16 },
        { month: 'Apr', revenue: 378000, accounts: 18 },
        { month: 'May', revenue: 425000, accounts: 21 },
        { month: 'Jun', revenue: 467000, accounts: 23 }
      ]

      // Accounts by type
      const accountTypeMap = new Map()
      accounts.forEach(acc => {
        const type = acc.accountType
        if (!accountTypeMap.has(type)) {
          accountTypeMap.set(type, { count: 0, value: 0 })
        }
        accountTypeMap.get(type).count++
        accountTypeMap.get(type).value += acc.totalRevenue || 0
      })
      
      const accountsByType = Array.from(accountTypeMap.entries()).map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: data.count,
        value: data.value
      }))

      // Accounts by industry
      const industryMap = new Map()
      accounts.forEach(acc => {
        const industry = acc.industry
        if (!industryMap.has(industry)) {
          industryMap.set(industry, { count: 0, revenue: 0 })
        }
        industryMap.get(industry).count++
        industryMap.get(industry).revenue += acc.totalRevenue || 0
      })
      
      const accountsByIndustry = Array.from(industryMap.entries()).map(([industry, data]) => ({
        industry,
        count: data.count,
        revenue: data.revenue
      }))

      // Health score distribution
      const healthRanges = [
        { range: '0-25', min: 0, max: 25 },
        { range: '26-50', min: 26, max: 50 },
        { range: '51-75', min: 51, max: 75 },
        { range: '76-100', min: 76, max: 100 }
      ]
      
      const healthScoreDistribution = healthRanges.map(range => ({
        range: range.range,
        count: accounts.filter(acc => 
          (acc.healthScore || 50) >= range.min && (acc.healthScore || 50) <= range.max
        ).length
      }))

      // Engagement metrics
      const engagementMap = new Map()
      accounts.forEach(acc => {
        const level = acc.engagementLevel || 'medium'
        engagementMap.set(level, (engagementMap.get(level) || 0) + 1)
      })
      
      const engagementMetrics = Array.from(engagementMap.entries()).map(([level, count]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count,
        percentage: (count / totalAccounts) * 100
      }))

      const analytics: AnalyticsData = {
        totalAccounts,
        totalRevenue,
        averageHealthScore,
        highRiskAccounts,
        conversionRate,
        retentionRate,
        growthRate,
        churnRate,
        topPerformingAccounts,
        riskAccounts,
        revenueByMonth,
        accountsByType,
        accountsByIndustry,
        healthScoreDistribution,
        engagementMetrics
      }

      setAnalyticsData(analytics)
    } catch (error) {
      console.error('Error calculating analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your account performance and health
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{analyticsData.totalAccounts}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendUp className="mr-1 h-3 w-3" />
                  +{formatPercent(analyticsData.growthRate)} growth
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendUp className="mr-1 h-3 w-3" />
                  +{formatPercent(analyticsData.growthRate)} YoY
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{Math.round(analyticsData.averageHealthScore)}</p>
                <p className="text-xs text-blue-600">
                  {analyticsData.averageHealthScore > 70 ? 'Excellent' : 
                   analyticsData.averageHealthScore > 50 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Accounts</p>
                <p className="text-2xl font-bold">{analyticsData.highRiskAccounts}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <Warning className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and account growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value as number) : value,
                  name === 'revenue' ? 'Revenue' : 'Accounts'
                ]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="accounts"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Account Distribution by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Account Distribution</CardTitle>
            <CardDescription>Accounts by type and revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.accountsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.accountsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Performance</CardTitle>
            <CardDescription>Revenue by industry vertical</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.accountsByIndustry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="industry" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Bar dataKey="revenue" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Score Distribution</CardTitle>
            <CardDescription>Account health across score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.healthScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Accounts</CardTitle>
            <CardDescription>Highest revenue and health score accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformingAccounts.map((account, index) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.industry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(account.totalRevenue || 0)}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={account.healthScore || 50} className="w-16 h-2" />
                      <span className="text-sm">{account.healthScore || 50}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Accounts Requiring Attention</CardTitle>
            <CardDescription>High-risk accounts that need immediate action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.riskAccounts.length > 0 ? (
                analyticsData.riskAccounts.map((account, index) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="mb-1">
                        {account.riskLevel} risk
                      </Badge>
                      <p className="text-sm text-red-600">
                        {account.churnRisk}% churn risk
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No high-risk accounts detected</p>
                  <p className="text-sm">All accounts are performing well</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercent(analyticsData.conversionRate)}</p>
                <p className="text-xs text-green-600">Above industry average</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">{formatPercent(analyticsData.retentionRate)}</p>
                <p className="text-xs text-green-600">Excellent retention</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{formatPercent(analyticsData.churnRate)}</p>
                <p className="text-xs text-red-600">Monitor closely</p>
              </div>
              <TrendDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}