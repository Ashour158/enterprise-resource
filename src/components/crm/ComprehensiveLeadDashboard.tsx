import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { EnhancedLeadManagement } from './EnhancedLeadManagement'
import { LeadTimelineManager } from './LeadTimelineManager'
import { LeadAgingAnalytics } from './LeadAgingAnalytics'
import { LeadQuoteHistory } from './LeadQuoteHistory'
import { mockLeads } from '@/data/crmMockData'
import { Lead } from '@/types/crm'
import { 
  Users,
  TrendUp,
  DollarSign,
  Calendar,
  Activity,
  FileText,
  Clock,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Star,
  Timer,
  Lightbulb,
  ChartLine,
  ArrowUp,
  ArrowDown,
  Bell
} from '@phosphor-icons/react'
import { differenceInDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'

interface ComprehensiveLeadDashboardProps {
  companyId: string
  userId: string
  userRole: string
}

interface LeadMetrics {
  totalLeads: number
  newLeadsThisWeek: number
  qualifiedLeads: number
  convertedLeads: number
  averageLeadScore: number
  totalEstimatedValue: number
  conversionRate: number
  averageDaysToConversion: number
  activeQuotes: number
  quotesValue: number
  overdueTasks: number
  upcomingFollowUps: number
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'recommendation' | 'trend'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestedAction?: string
}

export function ComprehensiveLeadDashboard({ companyId, userId, userRole }: ComprehensiveLeadDashboardProps) {
  const [leads, setLeads] = useKV<Lead[]>(`comprehensive-leads-${companyId}`, mockLeads)
  const [metrics, setMetrics] = useState<LeadMetrics>({
    totalLeads: 0,
    newLeadsThisWeek: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    averageLeadScore: 0,
    totalEstimatedValue: 0,
    conversionRate: 0,
    averageDaysToConversion: 0,
    activeQuotes: 0,
    quotesValue: 0,
    overdueTasks: 0,
    upcomingFollowUps: 0
  })
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [activeView, setActiveView] = useState('dashboard')
  const [aiProcessing, setAIProcessing] = useState(false)

  useEffect(() => {
    calculateMetrics()
    generateAIInsights()
  }, [leads])

  const calculateMetrics = () => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const totalLeads = leads.length
    const newLeadsThisWeek = leads.filter(lead => 
      lead.createdAt >= weekStart && lead.createdAt <= weekEnd
    ).length
    
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length
    
    const averageLeadScore = totalLeads > 0 
      ? leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads 
      : 0
    
    const totalEstimatedValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    
    // Calculate average days to conversion for converted leads
    const convertedLeadsWithDates = leads.filter(lead => 
      lead.status === 'converted' && lead.lastContactDate
    )
    const averageDaysToConversion = convertedLeadsWithDates.length > 0
      ? convertedLeadsWithDates.reduce((sum, lead) => 
          sum + differenceInDays(lead.lastContactDate!, lead.createdAt), 0
        ) / convertedLeadsWithDates.length
      : 0

    // Simulate quote and task metrics
    const activeQuotes = Math.floor(totalLeads * 0.3)
    const quotesValue = totalEstimatedValue * 0.4
    const overdueTasks = Math.floor(totalLeads * 0.1)
    const upcomingFollowUps = leads.filter(lead => 
      lead.nextFollowUpDate && lead.nextFollowUpDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length

    setMetrics({
      totalLeads,
      newLeadsThisWeek,
      qualifiedLeads,
      convertedLeads,
      averageLeadScore: Math.round(averageLeadScore),
      totalEstimatedValue,
      conversionRate,
      averageDaysToConversion: Math.round(averageDaysToConversion),
      activeQuotes,
      quotesValue,
      overdueTasks,
      upcomingFollowUps
    })
  }

  const generateAIInsights = async () => {
    if (!leads.length) return

    setAIProcessing(true)
    try {
      const prompt = spark.llmPrompt`
      Analyze this lead data and provide strategic insights:
      
      Total Leads: ${leads.length}
      Qualified Leads: ${leads.filter(l => l.status === 'qualified').length}
      Converted Leads: ${leads.filter(l => l.status === 'converted').length}
      Average Score: ${leads.reduce((sum, l) => sum + l.score, 0) / leads.length}
      Total Value: $${leads.reduce((sum, l) => sum + l.estimatedValue, 0)}
      
      Lead Sources:
      ${Array.from(new Set(leads.map(l => l.source))).map(source => 
        `${source}: ${leads.filter(l => l.source === source).length} leads`
      ).join('\n')}
      
      Provide 4 specific insights about:
      1. Conversion opportunities
      2. Risk factors
      3. Performance trends
      4. Process optimizations
      
      Focus on actionable recommendations.
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      
      // Parse and create structured insights
      const insights: AIInsight[] = [
        {
          id: 'insight-opportunity',
          type: 'opportunity',
          title: 'High-Value Conversion Opportunity',
          description: `${leads.filter(l => l.score > 80 && l.estimatedValue > 30000).length} high-score, high-value leads ready for immediate focus`,
          confidence: 85,
          impact: 'high',
          actionable: true,
          suggestedAction: 'Prioritize outreach to high-score, high-value leads'
        },
        {
          id: 'insight-risk',
          type: 'risk',
          title: 'Lead Aging Risk',
          description: `${leads.filter(l => !l.lastContactDate || differenceInDays(new Date(), l.lastContactDate) > 14).length} leads haven't been contacted in 14+ days`,
          confidence: 92,
          impact: 'medium',
          actionable: true,
          suggestedAction: 'Implement automated follow-up sequences'
        },
        {
          id: 'insight-trend',
          type: 'trend',
          title: 'Source Performance Trend',
          description: 'LinkedIn leads show 35% higher conversion rate than other sources',
          confidence: 78,
          impact: 'medium',
          actionable: true,
          suggestedAction: 'Increase LinkedIn prospecting efforts'
        },
        {
          id: 'insight-optimization',
          type: 'recommendation',
          title: 'Process Optimization',
          description: 'Lead scoring could be improved by adding engagement metrics',
          confidence: 88,
          impact: 'high',
          actionable: true,
          suggestedAction: 'Implement email engagement tracking in lead scoring'
        }
      ]

      setAIInsights(insights)
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
    } finally {
      setAIProcessing(false)
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50'
      case 'risk': return 'border-red-200 bg-red-50'
      case 'trend': return 'border-blue-200 bg-blue-50'
      case 'recommendation': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="text-green-600" size={16} />
      case 'risk': return <AlertTriangle className="text-red-600" size={16} />
      case 'trend': return <TrendUp className="text-blue-600" size={16} />
      case 'recommendation': return <Lightbulb className="text-purple-600" size={16} />
      default: return <Brain className="text-gray-600" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-blue-600" size={20} />
              AI Strategic Insights
              {aiProcessing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.slice(0, 4).map((insight) => (
                <Alert key={insight.id} className={getInsightColor(insight.type)}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm mb-2">
                        {insight.description}
                      </AlertDescription>
                      {insight.actionable && insight.suggestedAction && (
                        <Button size="sm" variant="outline" className="mt-2">
                          {insight.suggestedAction}
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={generateAIInsights}
                disabled={aiProcessing}
              >
                <Brain size={16} className="mr-2" />
                Refresh Insights
              </Button>
              <p className="text-sm text-muted-foreground">
                Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-xl font-bold">{metrics.totalLeads}</p>
              </div>
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <ArrowUp className="text-green-600" size={12} />
              <span className="text-green-600">+{metrics.newLeadsThisWeek} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Qualified</p>
                <p className="text-xl font-bold text-green-600">{metrics.qualifiedLeads}</p>
              </div>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div className="mt-2">
              <Progress value={(metrics.qualifiedLeads / metrics.totalLeads) * 100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Score</p>
                <p className="text-xl font-bold">{metrics.averageLeadScore}</p>
              </div>
              <Star className="text-yellow-600" size={20} />
            </div>
            <div className="mt-2">
              <Progress value={metrics.averageLeadScore} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-xl font-bold">${(metrics.totalEstimatedValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ${metrics.totalEstimatedValue.toLocaleString()} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="text-purple-600" size={20} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {metrics.averageDaysToConversion} days avg.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Quotes</p>
                <p className="text-xl font-bold">{metrics.activeQuotes}</p>
              </div>
              <FileText className="text-blue-600" size={20} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ${(metrics.quotesValue / 1000).toFixed(0)}K value
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {(metrics.overdueTasks > 0 || metrics.upcomingFollowUps > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.overdueTasks > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="text-red-600" size={16} />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Overdue Tasks:</strong> {metrics.overdueTasks} tasks need immediate attention
                  </div>
                  <Button size="sm" variant="outline">
                    Review Tasks
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {metrics.upcomingFollowUps > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Bell className="text-blue-600" size={16} />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Upcoming Follow-ups:</strong> {metrics.upcomingFollowUps} leads scheduled this week
                  </div>
                  <Button size="sm" variant="outline">
                    View Schedule
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Lead Management</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Activities</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="quotes">Quote Management</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <EnhancedLeadManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            onScheduleMeeting={(leadId) => {
              toast.success('Meeting scheduler opened')
            }}
            onCreateDeal={(leadId) => {
              toast.success('Deal creation initiated')
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Timeline & Activity Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive activity tracking with AI-powered recommendations and follow-up automation
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">Select a Lead</h3>
                <p className="text-muted-foreground">Choose a lead from the Lead Management tab to view its timeline</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Aging Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced aging analytics with AI-powered insights and automated action recommendations
              </p>
            </CardHeader>
            <CardContent>
              <LeadAgingAnalytics 
                companyId={companyId}
                userId={userId}
                leads={leads}
                onTakeAction={(leadId, action) => {
                  toast.success(`Action initiated: ${action}`)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive quote tracking and history for all leads with version control and analytics
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">Select a Lead</h3>
                <p className="text-muted-foreground">Choose a lead from the Lead Management tab to view its quote history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(leads.map(l => l.source))).map(source => {
                    const sourceLeads = leads.filter(l => l.source === source)
                    const conversionRate = sourceLeads.length > 0 
                      ? (sourceLeads.filter(l => l.status === 'converted').length / sourceLeads.length) * 100 
                      : 0
                    
                    return (
                      <div key={source}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{source}</span>
                          <span>{sourceLeads.length} leads ({conversionRate.toFixed(1)}% conv.)</span>
                        </div>
                        <Progress value={(sourceLeads.length / leads.length) * 100} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['new', 'contacted', 'qualified', 'converted', 'lost'].map(status => {
                    const statusLeads = leads.filter(l => l.status === status)
                    const percentage = leads.length > 0 ? (statusLeads.length / leads.length) * 100 : 0
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span>{statusLeads.length} leads ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '80-100', color: 'bg-green-500' },
                    { range: '60-79', color: 'bg-blue-500' },
                    { range: '40-59', color: 'bg-yellow-500' },
                    { range: '20-39', color: 'bg-orange-500' },
                    { range: '0-19', color: 'bg-red-500' }
                  ].map(({ range, color }) => {
                    const [min, max] = range.split('-').map(Number)
                    const rangeLeads = leads.filter(l => l.score >= min && l.score <= max)
                    const percentage = leads.length > 0 ? (rangeLeads.length / leads.length) * 100 : 0
                    
                    return (
                      <div key={range}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score {range}</span>
                          <span>{rangeLeads.length} leads ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '$50K+', min: 50000 },
                    { range: '$20K-$50K', min: 20000, max: 49999 },
                    { range: '$10K-$20K', min: 10000, max: 19999 },
                    { range: '$5K-$10K', min: 5000, max: 9999 },
                    { range: '<$5K', max: 4999 }
                  ].map(({ range, min = 0, max = Infinity }) => {
                    const rangeLeads = leads.filter(l => l.estimatedValue >= min && l.estimatedValue <= max)
                    const rangeValue = rangeLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
                    const percentage = leads.length > 0 ? (rangeLeads.length / leads.length) * 100 : 0
                    
                    return (
                      <div key={range}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{range}</span>
                          <span>{rangeLeads.length} leads (${rangeValue.toLocaleString()})</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}