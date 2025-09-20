import React, { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown,
  Target,
  CurrencyDollar as DollarSign,
  CalendarCheck,
  Users,
  Funnel,
  Export,
  File as Filter,
  ArrowClockwise as Refresh,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Lightbulb,
  ChartPie,
  ChartBar as BarChart,
  Download,
  Share,
  Calendar,
  Eye
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { DateRange } from 'react-day-picker'

interface SalesReportingDashboardProps {
  companyId: string
  userId: string
  userRole: string
}

interface SalesFunnelStage {
  id: string
  name: string
  deals: number
  value: number
  conversionRate: number
  averageTime: number
  color: string
}

interface ConversionMetrics {
  stage: string
  currentPeriod: number
  previousPeriod: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface PerformanceData {
  user: string
  userId: string
  dealsWon: number
  revenue: number
  activities: number
  conversionRate: number
  averageDealSize: number
  rank: number
}

interface SalesReport {
  id: string
  name: string
  type: 'funnel' | 'conversion' | 'performance' | 'forecast'
  dateRange: DateRange
  filters: Record<string, any>
  data: any
  generatedAt: Date
  generatedBy: string
}

export function SalesReportingDashboard({ companyId, userId, userRole }: SalesReportingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [reports, setReports] = useKV<SalesReport[]>(`sales-reports-${companyId}`, [])

  // Mock data - in a real app, this would come from your API
  const salesFunnelData: SalesFunnelStage[] = [
    {
      id: 'leads',
      name: 'Leads',
      deals: 150,
      value: 750000,
      conversionRate: 100,
      averageTime: 0,
      color: 'bg-blue-500'
    },
    {
      id: 'qualified',
      name: 'Qualified',
      deals: 75,
      value: 600000,
      conversionRate: 50,
      averageTime: 3.5,
      color: 'bg-indigo-500'
    },
    {
      id: 'proposal',
      name: 'Proposal',
      deals: 45,
      value: 450000,
      conversionRate: 30,
      averageTime: 7.2,
      color: 'bg-purple-500'
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      deals: 25,
      value: 325000,
      conversionRate: 16.7,
      averageTime: 12.1,
      color: 'bg-pink-500'
    },
    {
      id: 'closed-won',
      name: 'Closed Won',
      deals: 15,
      value: 225000,
      conversionRate: 10,
      averageTime: 18.5,
      color: 'bg-green-500'
    }
  ]

  const conversionMetrics: ConversionMetrics[] = [
    {
      stage: 'Lead → Qualified',
      currentPeriod: 50,
      previousPeriod: 45,
      change: 11.1,
      trend: 'up'
    },
    {
      stage: 'Qualified → Proposal',
      currentPeriod: 60,
      previousPeriod: 58,
      change: 3.4,
      trend: 'up'
    },
    {
      stage: 'Proposal → Negotiation',
      currentPeriod: 55.6,
      previousPeriod: 62.1,
      change: -10.5,
      trend: 'down'
    },
    {
      stage: 'Negotiation → Closed Won',
      currentPeriod: 60,
      previousPeriod: 55,
      change: 9.1,
      trend: 'up'
    }
  ]

  const performanceData: PerformanceData[] = [
    {
      user: 'Sarah Johnson',
      userId: 'user-001',
      dealsWon: 12,
      revenue: 285000,
      activities: 145,
      conversionRate: 24.5,
      averageDealSize: 23750,
      rank: 1
    },
    {
      user: 'Mike Chen',
      userId: 'user-002',
      dealsWon: 10,
      revenue: 220000,
      activities: 132,
      conversionRate: 21.3,
      averageDealSize: 22000,
      rank: 2
    },
    {
      user: 'Emily Davis',
      userId: 'user-003',
      dealsWon: 8,
      revenue: 195000,
      activities: 118,
      conversionRate: 19.8,
      averageDealSize: 24375,
      rank: 3
    },
    {
      user: 'James Wilson',
      userId: 'user-004',
      dealsWon: 7,
      revenue: 165000,
      activities: 98,
      conversionRate: 17.2,
      averageDealSize: 23571,
      rank: 4
    }
  ]

  const overviewMetrics = useMemo(() => {
    const totalDeals = salesFunnelData[0]?.deals || 0
    const wonDeals = salesFunnelData[salesFunnelData.length - 1]?.deals || 0
    const totalValue = salesFunnelData[0]?.value || 0
    const wonValue = salesFunnelData[salesFunnelData.length - 1]?.value || 0
    const overallConversion = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0
    const avgDealSize = wonDeals > 0 ? wonValue / wonDeals : 0

    return {
      totalDeals,
      wonDeals,
      totalValue,
      wonValue,
      overallConversion,
      avgDealSize,
      activitiesCompleted: performanceData.reduce((sum, p) => sum + p.activities, 0),
      teamSize: performanceData.length
    }
  }, [salesFunnelData, performanceData])

  // Simulated real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      toast.info('Sales data updated', { duration: 2000 })
    }, 30000)

    return () => clearInterval(interval)
  }, [realTimeUpdates])

  const generateReport = async (type: string) => {
    const newReport: SalesReport = {
      id: `report-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type: type as any,
      dateRange,
      filters: { period: selectedPeriod, team: selectedTeam },
      data: type === 'funnel' ? salesFunnelData : type === 'conversion' ? conversionMetrics : performanceData,
      generatedAt: new Date(),
      generatedBy: userId
    }

    setReports(prev => [...(prev || []), newReport])
    toast.success(`${newReport.name} generated successfully`)
  }

  const exportReport = (reportId: string) => {
    toast.info('Exporting report to CSV...')
    // In a real app, this would trigger a download
  }

  const FunnelVisualization = () => (
    <div className="space-y-4">
      {salesFunnelData.map((stage, index) => {
        const maxWidth = salesFunnelData[0]?.deals || 1
        const widthPercentage = (stage.deals / maxWidth) * 100
        
        return (
          <div key={stage.id} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                <span className="font-medium">{stage.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {stage.averageTime > 0 && `${stage.averageTime} days avg`}
              </div>
            </div>
            
            <div className="relative bg-muted rounded-lg p-4 mb-2">
              <div 
                className={`${stage.color} rounded-lg p-4 transition-all duration-500`}
                style={{ width: `${widthPercentage}%` }}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="font-bold text-lg">{stage.deals}</div>
                    <div className="text-sm opacity-90">deals</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${(stage.value / 1000).toFixed(0)}k</div>
                    <div className="text-sm opacity-90">{stage.conversionRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {index < salesFunnelData.length - 1 && (
              <div className="flex items-center justify-center py-2">
                <TrendDown size={16} className="text-muted-foreground" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const ConversionAnalysis = () => (
    <div className="space-y-4">
      {conversionMetrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{metric.stage}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-2xl font-bold">{metric.currentPeriod}%</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {metric.trend === 'up' ? <TrendUp size={14} /> : 
                     metric.trend === 'down' ? <TrendDown size={14} /> : null}
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={metric.currentPeriod} className="h-2" />
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground ml-4">
                <div>Previous: {metric.previousPeriod}%</div>
                <div>Current Period</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const PerformanceLeaderboard = () => (
    <div className="space-y-3">
      {performanceData.map((performer, index) => (
        <Card key={performer.userId} className={index === 0 ? 'ring-2 ring-yellow-500' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {performer.rank}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {performer.user}
                    {index === 0 && <Trophy size={16} className="text-yellow-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {performer.dealsWon} deals • {performer.activities} activities
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${(performer.revenue / 1000).toFixed(0)}k</div>
                <div className="text-sm text-muted-foreground">
                  {performer.conversionRate}% conversion
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avg Deal:</span>
                <span className="ml-2 font-medium">${performer.averageDealSize.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rank:</span>
                <span className="ml-2 font-medium">#{performer.rank}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Reporting</h2>
          <p className="text-muted-foreground">Comprehensive sales analytics and performance insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="real-time" 
              checked={realTimeUpdates}
              onCheckedChange={setRealTimeUpdates}
            />
            <Label htmlFor="real-time" className="text-sm">Real-time</Label>
          </div>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
          
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="sales">Sales Team</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="smb">SMB</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => toast.info('Refreshing data...')}>
            <Refresh size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{overviewMetrics.totalDeals}</p>
              </div>
              <Target size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Won Deals</p>
                <p className="text-2xl font-bold text-green-600">{overviewMetrics.wonDeals}</p>
              </div>
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">${(overviewMetrics.totalValue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{overviewMetrics.overallConversion.toFixed(1)}%</p>
              </div>
              <TrendUp size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">${(overviewMetrics.avgDealSize / 1000).toFixed(0)}k</p>
              </div>
              <ChartLine size={20} className="text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{overviewMetrics.activitiesCompleted}</p>
              </div>
              <Activity size={20} className="text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Reporting Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Funnel size={16} />
            Sales Funnel
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <TrendUp size={16} />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Trophy size={16} />
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb size={16} />
            Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download size={16} />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Funnel size={20} />
                  Sales Funnel Summary
                </CardTitle>
                <CardDescription>
                  Visual representation of your sales pipeline conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesFunnelData.map((stage, index) => (
                    <div key={stage.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stage.deals}</div>
                        <div className="text-sm text-muted-foreground">{stage.conversionRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Leading sales team members this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.slice(0, 3).map((performer, index) => (
                    <div key={performer.userId} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          #{performer.rank}
                        </Badge>
                        <span className="font-medium">{performer.user}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${(performer.revenue / 1000).toFixed(0)}k</div>
                        <div className="text-sm text-muted-foreground">{performer.conversionRate}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Funnel size={20} />
                Sales Funnel Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of deal progression through your sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelVisualization />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp size={20} />
                Conversion Rate Analysis
              </CardTitle>
              <CardDescription>
                Stage-by-stage conversion rates and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} />
                Sales Performance Leaderboard
              </CardTitle>
              <CardDescription>
                Individual and team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceLeaderboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendUp size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Conversion Opportunity</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your Proposal → Negotiation conversion rate is 10.5% below average. 
                        Consider improving proposal quality or follow-up timing.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Trophy size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Top Performer Insight</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Sarah Johnson's conversion rate is 24.5% - 5% above team average. 
                        Consider sharing her qualification techniques with the team.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Pipeline Velocity</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Average deal cycle time has increased by 2.3 days. Focus on 
                        accelerating the negotiation stage to improve velocity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Goal Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Monthly Revenue Goal</span>
                    <span className="text-sm text-muted-foreground">$500k / $600k</span>
                  </div>
                  <Progress value={83.3} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">83% complete - on track</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">New Deals Goal</span>
                    <span className="text-sm text-muted-foreground">42 / 50</span>
                  </div>
                  <Progress value={84} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">84% complete - ahead of schedule</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Activity Goal</span>
                    <span className="text-sm text-muted-foreground">493 / 600</span>
                  </div>
                  <Progress value={82.2} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">82% complete - needs attention</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Generated Reports</h3>
              <p className="text-sm text-muted-foreground">Export and share sales reports</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => generateReport('funnel')} variant="outline" size="sm">
                <ChartPie size={14} className="mr-2" />
                Generate Funnel Report
              </Button>
              <Button onClick={() => generateReport('performance')} variant="outline" size="sm">
                <BarChart size={14} className="mr-2" />
                Generate Performance Report
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {(reports || []).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Download size={32} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No reports generated yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate your first sales report to get started
                  </p>
                  <Button onClick={() => generateReport('funnel')}>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (reports || []).map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Generated {report.generatedAt.toLocaleDateString()}</span>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => exportReport(report.id)} variant="outline" size="sm">
                          <Export size={14} className="mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share size={14} className="mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}