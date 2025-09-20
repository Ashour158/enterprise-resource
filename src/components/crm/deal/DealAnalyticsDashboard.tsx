import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown,
  DollarSign, 
  Target, 
  Calendar,
  Users,
  Clock,
  Award,
  Package,
  Filter,
  Download,
  Share,
  Eye,
  Activity
} from '@phosphor-icons/react'

interface Deal {
  id: string
  dealNumber: string
  title: string
  value: number
  stage: string
  probability: number
  closeDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'won' | 'lost' | 'on_hold'
  source: string
  ownerId: string
  createdAt: string
  daysInStage: number
  customFields: Record<string, any>
}

interface DealPipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  isActive: boolean
  dealCount: number
  dealValue: number
  avgDaysInStage: number
  conversionRate: number
}

interface DealAnalyticsDashboardProps {
  deals: Deal[]
  stages: DealPipelineStage[]
  companyId: string
}

export function DealAnalyticsDashboard({ deals, stages, companyId }: DealAnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate analytics based on timeframe
  const analytics = useMemo(() => {
    const now = new Date()
    const timeframeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeframe]

    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000)
    const filteredDeals = deals.filter(deal => new Date(deal.createdAt) >= cutoffDate)

    // Basic metrics
    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
    const weightedValue = filteredDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
    const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0
    const wonDeals = filteredDeals.filter(deal => deal.status === 'won')
    const lostDeals = filteredDeals.filter(deal => deal.status === 'lost')
    const winRate = (wonDeals.length + lostDeals.length) > 0 ? 
      (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0

    // Stage analytics
    const stageAnalytics = stages.map(stage => {
      const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id)
      const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      const avgStageTime = stageDeals.length > 0 ? 
        stageDeals.reduce((sum, deal) => sum + deal.daysInStage, 0) / stageDeals.length : 0

      return {
        ...stage,
        dealCount: stageDeals.length,
        totalValue: stageValue,
        avgDaysInStage: avgStageTime
      }
    })

    // Source analytics
    const sourceAnalytics = filteredDeals.reduce((acc, deal) => {
      if (!acc[deal.source]) {
        acc[deal.source] = { count: 0, value: 0, winRate: 0 }
      }
      acc[deal.source].count += 1
      acc[deal.source].value += deal.value
      return acc
    }, {} as Record<string, { count: number; value: number; winRate: number }>)

    // Calculate win rates for sources
    Object.keys(sourceAnalytics).forEach(source => {
      const sourceDeals = filteredDeals.filter(deal => deal.source === source)
      const sourceWon = sourceDeals.filter(deal => deal.status === 'won').length
      const sourceClosed = sourceDeals.filter(deal => deal.status === 'won' || deal.status === 'lost').length
      sourceAnalytics[source].winRate = sourceClosed > 0 ? (sourceWon / sourceClosed) * 100 : 0
    })

    // Priority analytics
    const priorityAnalytics = {
      high: filteredDeals.filter(deal => deal.priority === 'high'),
      medium: filteredDeals.filter(deal => deal.priority === 'medium'),
      low: filteredDeals.filter(deal => deal.priority === 'low')
    }

    // Time-based analytics (weekly breakdown)
    const weeklyAnalytics = []
    for (let i = 0; i < Math.min(timeframeDays / 7, 12); i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      
      const weekDeals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt)
        return dealDate >= weekStart && dealDate < weekEnd
      })

      weeklyAnalytics.unshift({
        week: `Week ${i + 1}`,
        dealCount: weekDeals.length,
        totalValue: weekDeals.reduce((sum, deal) => sum + deal.value, 0),
        avgDealSize: weekDeals.length > 0 ? weekDeals.reduce((sum, deal) => sum + deal.value, 0) / weekDeals.length : 0
      })
    }

    // Velocity analytics
    const avgSalesVelocity = filteredDeals.length > 0 ? 
      filteredDeals.reduce((sum, deal) => {
        const createdDate = new Date(deal.createdAt)
        const daysInPipeline = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        return sum + daysInPipeline
      }, 0) / filteredDeals.length : 0

    return {
      totalValue,
      weightedValue,
      avgDealSize,
      winRate,
      dealCount: filteredDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      stageAnalytics,
      sourceAnalytics,
      priorityAnalytics,
      weeklyAnalytics,
      avgSalesVelocity
    }
  }, [deals, stages, timeframe])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0
    
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deal Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your sales pipeline performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
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
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                    <div className="mt-1">
                      {getChangeIndicator(analytics.totalValue, analytics.totalValue * 0.9)}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Weighted Pipeline</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.weightedValue)}</p>
                    <div className="mt-1">
                      {getChangeIndicator(analytics.weightedValue, analytics.weightedValue * 0.85)}
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold">{analytics.winRate.toFixed(1)}%</p>
                    <div className="mt-1">
                      {getChangeIndicator(analytics.winRate, analytics.winRate * 0.95)}
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.avgDealSize)}</p>
                    <div className="mt-1">
                      {getChangeIndicator(analytics.avgDealSize, analytics.avgDealSize * 1.05)}
                    </div>
                  </div>
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                    <p className="text-2xl font-bold">{analytics.dealCount}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Sales Velocity</p>
                    <p className="text-2xl font-bold">{analytics.avgSalesVelocity.toFixed(0)} days</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deals Closed</p>
                    <p className="text-2xl font-bold">{analytics.wonDeals + analytics.lostDeals}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stage Overview</CardTitle>
              <CardDescription>Current distribution of deals across pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.stageAnalytics.map((stage) => (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{stage.dealCount} deals</span>
                        <span className="font-bold">{formatCurrency(stage.totalValue)}</span>
                        <span className="text-muted-foreground">{stage.avgDaysInStage.toFixed(0)} days avg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(stage.dealCount / analytics.dealCount) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {((stage.dealCount / analytics.dealCount) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Conversion Funnel</CardTitle>
                <CardDescription>Deal flow and conversion rates between stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.stageAnalytics.map((stage, index) => {
                    const isLast = index === analytics.stageAnalytics.length - 1
                    const nextStage = !isLast ? analytics.stageAnalytics[index + 1] : null
                    const conversionRate = nextStage && stage.dealCount > 0 ? 
                      (nextStage.dealCount / stage.dealCount) * 100 : 0

                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{stage.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{stage.dealCount} deals</span>
                            <span className="text-sm font-bold">{formatCurrency(stage.totalValue)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all"
                            style={{ 
                              width: `${(stage.dealCount / (analytics.stageAnalytics[0]?.dealCount || 1)) * 100}%`,
                              backgroundColor: stage.color 
                            }}
                          />
                        </div>
                        {!isLast && (
                          <div className="text-xs text-muted-foreground text-center">
                            {conversionRate.toFixed(1)}% conversion to next stage
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stage Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Stage Performance Metrics</CardTitle>
                <CardDescription>Average time and conversion rates by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.stageAnalytics.map((stage) => (
                    <div key={stage.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stage.name}</h4>
                        <Badge variant="outline">{stage.probability}% probability</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Deals</p>
                          <p className="font-bold">{stage.dealCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Days</p>
                          <p className="font-bold">{stage.avgDaysInStage.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Value</p>
                          <p className="font-bold">{formatCurrency(stage.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Deals by Priority</CardTitle>
                <CardDescription>Distribution and performance by deal priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.priorityAnalytics).map(([priority, deals]) => {
                    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
                    const winRate = deals.filter(d => d.status === 'won').length / 
                      Math.max(deals.filter(d => d.status === 'won' || d.status === 'lost').length, 1) * 100

                    const priorityColor = priority === 'high' ? 'text-red-600' : 
                                        priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium capitalize ${priorityColor}`}>{priority} Priority</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{deals.length} deals</span>
                            <span className="font-bold">{formatCurrency(totalValue)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>Win Rate: {winRate.toFixed(1)}%</div>
                          <div>Avg Size: {formatCurrency(totalValue / Math.max(deals.length, 1))}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Deal Activity</CardTitle>
                <CardDescription>Deal creation and value trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.weeklyAnalytics.slice(-8).map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{week.week}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{week.dealCount} deals</span>
                        <span className="font-bold">{formatCurrency(week.totalValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Performance</CardTitle>
              <CardDescription>Performance metrics by lead source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.sourceAnalytics)
                  .sort(([,a], [,b]) => b.value - a.value)
                  .map(([source, data]) => (
                    <div key={source} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{source}</h4>
                        <Badge variant="outline">{data.winRate.toFixed(1)}% win rate</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Deals</p>
                          <p className="font-bold">{data.count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-bold">{formatCurrency(data.value)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Deal Size</p>
                          <p className="font-bold">{formatCurrency(data.value / Math.max(data.count, 1))}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Performance Score</span>
                          <span>{((data.winRate + (data.value / 1000000) * 10) / 2).toFixed(0)}/100</span>
                        </div>
                        <Progress value={((data.winRate + (data.value / 1000000) * 10) / 2)} className="h-2" />
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Velocity Trends</CardTitle>
                <CardDescription>How quickly deals move through the pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6">
                    <div className="text-3xl font-bold">{analytics.avgSalesVelocity.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Average days in pipeline</div>
                  </div>
                  
                  <div className="space-y-2">
                    {analytics.stageAnalytics.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between text-sm">
                        <span>{stage.name}</span>
                        <span className="font-medium">{stage.avgDaysInStage.toFixed(0)} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Trends</CardTitle>
                <CardDescription>Stage-by-stage conversion analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.stageAnalytics.slice(0, -1).map((stage, index) => {
                    const nextStage = analytics.stageAnalytics[index + 1]
                    const conversionRate = stage.dealCount > 0 ? 
                      (nextStage.dealCount / stage.dealCount) * 100 : 0

                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{stage.name} → {nextStage.name}</span>
                          <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={conversionRate} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue based on current pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{formatCurrency(analytics.weightedValue)}</div>
                    <div className="text-sm text-muted-foreground">Weighted pipeline value</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conservative (50% of weighted)</span>
                      <span className="font-medium">{formatCurrency(analytics.weightedValue * 0.5)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Optimistic (80% of weighted)</span>
                      <span className="font-medium">{formatCurrency(analytics.weightedValue * 0.8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best case (100% of weighted)</span>
                      <span className="font-medium">{formatCurrency(analytics.weightedValue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Health Score</CardTitle>
                <CardDescription>Overall pipeline health assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round((analytics.winRate + (analytics.dealCount > 20 ? 100 : analytics.dealCount * 5)) / 2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Health Score (out of 100)</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Win Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={analytics.winRate} className="w-16 h-2" />
                        <span className="text-sm font-medium">{analytics.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pipeline Volume</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(analytics.dealCount * 5, 100)} className="w-16 h-2" />
                        <span className="text-sm font-medium">{analytics.dealCount} deals</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Velocity</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.max(100 - analytics.avgSalesVelocity, 0)} className="w-16 h-2" />
                        <span className="text-sm font-medium">{analytics.avgSalesVelocity.toFixed(0)} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}