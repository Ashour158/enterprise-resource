import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { 
  Brain,
  TrendUp,
  TrendDown,
  Warning,
  CheckCircle,
  Lightbulb,
  Target,
  AlertTriangle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  Users,
  DollarSign,
  ChartLine,
  Shield,
  Heart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'recommendation' | 'prediction' | 'trend' | 'anomaly'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'revenue' | 'engagement' | 'health' | 'behavior' | 'market' | 'competitive'
  data: {
    currentValue?: number
    predictedValue?: number
    changePercentage?: number
    timeframe?: string
    factors?: string[]
    relatedMetrics?: { name: string; value: string | number }[]
  }
  actionable: boolean
  suggestedActions?: string[]
  createdAt: string
  updatedAt: string
}

interface AccountHealthMetrics {
  overallScore: number
  engagement: {
    score: number
    trend: 'increasing' | 'stable' | 'decreasing'
    lastActivity: string
    frequency: number
  }
  financial: {
    score: number
    paymentHistory: 'excellent' | 'good' | 'fair' | 'poor'
    creditRisk: 'low' | 'medium' | 'high'
    profitability: number
  }
  relationship: {
    score: number
    satisfaction: number
    stakeholderEngagement: number
    communicationQuality: 'high' | 'medium' | 'low'
  }
  growth: {
    score: number
    potential: 'high' | 'medium' | 'low'
    expansion: number
    retention: number
  }
}

interface EnhancedAccount {
  id: string
  name: string
  healthScore: number
  relationshipStrength: 'cold' | 'warm' | 'hot'
  churnRisk: 'low' | 'medium' | 'high'
  growthPotential: 'low' | 'medium' | 'high'
  insights: {
    aiScore: number
    riskFactors: string[]
    opportunities: string[]
    recommendations: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    engagementTrend: 'increasing' | 'stable' | 'decreasing'
  }
  financials: {
    totalLifetimeValue: number
    annualRecurringRevenue: number
    averageDealSize: number
    paymentTerms: string
    creditRating?: string
    invoiceCount: number
    outstandingBalance: number
  }
}

interface AccountInsightsDashboardProps {
  account: EnhancedAccount
  companyId: string
  userId: string
  userRole: string
}

export function AccountInsightsDashboard({
  account,
  companyId,
  userId,
  userRole
}: AccountInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [healthMetrics, setHealthMetrics] = useState<AccountHealthMetrics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Generate AI insights and health metrics
  useEffect(() => {
    generateAIInsights()
    generateHealthMetrics()
  }, [account.id])

  const generateAIInsights = () => {
    const mockInsights: AIInsight[] = [
      {
        id: 'insight_1',
        type: 'opportunity',
        title: 'Upsell Opportunity Detected',
        description: 'Based on usage patterns and growth metrics, this account shows strong potential for premium service upgrade.',
        confidence: 87,
        impact: 'high',
        priority: 'high',
        category: 'revenue',
        data: {
          currentValue: account.financials.annualRecurringRevenue,
          predictedValue: account.financials.annualRecurringRevenue * 1.4,
          changePercentage: 40,
          timeframe: '6 months',
          factors: ['Increased usage', 'Feature requests', 'Team growth'],
          relatedMetrics: [
            { name: 'Current ARR', value: `$${account.financials.annualRecurringRevenue.toLocaleString()}` },
            { name: 'Potential ARR', value: `$${(account.financials.annualRecurringRevenue * 1.4).toLocaleString()}` }
          ]
        },
        actionable: true,
        suggestedActions: [
          'Schedule upgrade discussion meeting',
          'Prepare custom proposal for premium features',
          'Identify key stakeholders for decision making'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'insight_2',
        type: 'risk',
        title: 'Engagement Decline Warning',
        description: 'Account engagement has decreased by 25% over the last 30 days. Immediate attention recommended.',
        confidence: 92,
        impact: 'medium',
        priority: 'urgent',
        category: 'engagement',
        data: {
          currentValue: 65,
          predictedValue: 45,
          changePercentage: -25,
          timeframe: '30 days',
          factors: ['Reduced login frequency', 'Fewer support interactions', 'Delayed responses'],
          relatedMetrics: [
            { name: 'Login Frequency', value: '3x/week (was 5x/week)' },
            { name: 'Response Time', value: '2.5 days (was 1 day)' }
          ]
        },
        actionable: true,
        suggestedActions: [
          'Schedule check-in call within 48 hours',
          'Review recent interactions for issues',
          'Offer additional support or training'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'insight_3',
        type: 'recommendation',
        title: 'Optimize Communication Frequency',
        description: 'Analysis suggests this account prefers monthly touchpoints over weekly check-ins for better relationship building.',
        confidence: 78,
        impact: 'medium',
        priority: 'medium',
        category: 'behavior',
        data: {
          timeframe: 'Last 6 months',
          factors: ['Response patterns', 'Meeting acceptance rates', 'Feedback scores'],
          relatedMetrics: [
            { name: 'Preferred Frequency', value: 'Monthly' },
            { name: 'Optimal Day', value: 'Tuesday' },
            { name: 'Best Time', value: '2-4 PM' }
          ]
        },
        actionable: true,
        suggestedActions: [
          'Adjust outreach cadence to monthly',
          'Schedule recurring monthly business reviews',
          'Update communication preferences in CRM'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'insight_4',
        type: 'prediction',
        title: 'Payment Delay Prediction',
        description: 'Based on historical patterns and current financial indicators, next invoice may be paid 5-7 days late.',
        confidence: 82,
        impact: 'low',
        priority: 'low',
        category: 'financial',
        data: {
          predictedValue: 7,
          timeframe: 'Next 30 days',
          factors: ['Seasonal patterns', 'Company budget cycles', 'Previous payment delays'],
          relatedMetrics: [
            { name: 'Average Delay', value: '3.2 days' },
            { name: 'Payment Pattern', value: 'Month-end preference' }
          ]
        },
        actionable: true,
        suggestedActions: [
          'Send invoice reminder 5 days before due date',
          'Offer flexible payment terms if needed',
          'Monitor accounts receivable closely'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'insight_5',
        type: 'trend',
        title: 'Positive Sentiment Trend',
        description: 'Customer sentiment analysis shows consistent improvement over the last quarter, indicating strong relationship health.',
        confidence: 91,
        impact: 'high',
        priority: 'low',
        category: 'engagement',
        data: {
          currentValue: 85,
          changePercentage: 15,
          timeframe: 'Last 3 months',
          factors: ['Positive feedback', 'Successful implementations', 'Proactive support'],
          relatedMetrics: [
            { name: 'Sentiment Score', value: '85/100' },
            { name: 'NPS Score', value: '9/10' },
            { name: 'Satisfaction', value: '92%' }
          ]
        },
        actionable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    setInsights(mockInsights)
  }

  const generateHealthMetrics = () => {
    const metrics: AccountHealthMetrics = {
      overallScore: account.healthScore,
      engagement: {
        score: Math.floor(Math.random() * 30) + 70,
        trend: account.insights.engagementTrend,
        lastActivity: '2 days ago',
        frequency: Math.floor(Math.random() * 10) + 5
      },
      financial: {
        score: Math.floor(Math.random() * 20) + 80,
        paymentHistory: 'good',
        creditRisk: account.churnRisk,
        profitability: Math.floor(Math.random() * 20) + 15
      },
      relationship: {
        score: Math.floor(Math.random() * 25) + 75,
        satisfaction: Math.floor(Math.random() * 20) + 80,
        stakeholderEngagement: Math.floor(Math.random() * 15) + 85,
        communicationQuality: 'high'
      },
      growth: {
        score: account.growthPotential === 'high' ? 90 : account.growthPotential === 'medium' ? 70 : 50,
        potential: account.growthPotential,
        expansion: Math.floor(Math.random() * 30) + 60,
        retention: Math.floor(Math.random() * 10) + 90
      }
    }

    setHealthMetrics(metrics)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="text-yellow-600" size={20} />
      case 'risk': return <Warning className="text-red-600" size={20} />
      case 'recommendation': return <Target className="text-blue-600" size={20} />
      case 'prediction': return <Crystal className="text-purple-600" size={20} />
      case 'trend': return <TrendUp className="text-green-600" size={20} />
      case 'anomaly': return <AlertTriangle className="text-orange-600" size={20} />
      default: return <Brain className="text-gray-600" size={20} />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-l-yellow-500 bg-yellow-50'
      case 'risk': return 'border-l-red-500 bg-red-50'
      case 'recommendation': return 'border-l-blue-500 bg-blue-50'
      case 'prediction': return 'border-l-purple-500 bg-purple-50'
      case 'trend': return 'border-l-green-500 bg-green-50'
      case 'anomaly': return 'border-l-orange-500 bg-orange-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp className="text-green-600" size={16} />
      case 'decreasing': return <TrendDown className="text-red-600" size={16} />
      default: return <div className="w-4 h-4" />
    }
  }

  const refreshInsights = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    generateAIInsights()
    generateHealthMetrics()
    setRefreshing(false)
    toast.success('AI insights refreshed successfully')
  }

  const handleActionClick = (insight: AIInsight, action: string) => {
    toast.success(`Action initiated: ${action}`)
  }

  const Crystal = ({ className, size }: { className?: string; size?: number }) => (
    <div className={`w-${size/4} h-${size/4} ${className}`}>
      <ChartLine size={size} />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain size={20} />
            AI-Powered Account Insights
          </h3>
          <p className="text-sm text-muted-foreground">
            Advanced analytics and recommendations for account optimization
          </p>
        </div>
        <Button
          onClick={refreshInsights}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Brain size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Insights'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(account.insights.aiScore)}`}>
                      {account.insights.aiScore}/100
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <Progress value={account.insights.aiScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(account.healthScore)}`}>
                      {account.healthScore}/100
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <Progress value={account.healthScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Insights</p>
                    <p className="text-2xl font-bold">{insights.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {insights.filter(i => i.priority === 'urgent' || i.priority === 'high').length} high priority
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold capitalize">{account.insights.sentiment}</span>
                      {account.insights.sentiment === 'positive' ? (
                        <ThumbsUp className="text-green-600" size={20} />
                      ) : account.insights.sentiment === 'negative' ? (
                        <ThumbsDown className="text-red-600" size={20} />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  {getTrendIcon(account.insights.engagementTrend)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Insights Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Insights</CardTitle>
              <CardDescription>
                Most important AI-generated insights requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights
                  .filter(insight => insight.priority === 'urgent' || insight.priority === 'high')
                  .slice(0, 3)
                  .map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <Badge className={getPriorityColor(insight.priority)}>
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insight.description}
                            </p>
                            {insight.suggestedActions && (
                              <div className="text-xs text-muted-foreground">
                                Suggested: {insight.suggestedActions[0]}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{insight.title}</h3>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline">
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Insight Data */}
                  {insight.data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {insight.data.relatedMetrics && (
                        <div>
                          <h4 className="font-medium mb-2">Key Metrics</h4>
                          <div className="space-y-1">
                            {insight.data.relatedMetrics.map((metric, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{metric.name}:</span>
                                <ClickableDataElement
                                  type="metric"
                                  value={metric.value.toString()}
                                  data={metric}
                                  className="font-medium hover:text-primary cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {insight.data.factors && (
                        <div>
                          <h4 className="font-medium mb-2">Contributing Factors</h4>
                          <div className="space-y-1">
                            {insight.data.factors.map((factor, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                • {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Suggested Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {insight.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionClick(insight, action)}
                            className="justify-start h-auto p-3 text-left"
                          >
                            <Target size={14} className="mr-2 flex-shrink-0" />
                            <span className="text-xs">{action}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {healthMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Health</CardTitle>
                  <CardDescription>Customer interaction and activity levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Score</span>
                    <span className={`font-bold ${getScoreColor(healthMetrics.engagement.score)}`}>
                      {healthMetrics.engagement.score}/100
                    </span>
                  </div>
                  <Progress value={healthMetrics.engagement.score} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity:</span>
                      <span>{healthMetrics.engagement.lastActivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{healthMetrics.engagement.frequency} interactions/month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trend:</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(healthMetrics.engagement.trend)}
                        <span className="capitalize">{healthMetrics.engagement.trend}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                  <CardDescription>Payment behavior and financial stability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Score</span>
                    <span className={`font-bold ${getScoreColor(healthMetrics.financial.score)}`}>
                      {healthMetrics.financial.score}/100
                    </span>
                  </div>
                  <Progress value={healthMetrics.financial.score} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment History:</span>
                      <Badge variant="outline" className="capitalize">
                        {healthMetrics.financial.paymentHistory}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Risk:</span>
                      <Badge variant={healthMetrics.financial.creditRisk === 'low' ? 'default' : healthMetrics.financial.creditRisk === 'medium' ? 'secondary' : 'destructive'}>
                        {healthMetrics.financial.creditRisk}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profitability:</span>
                      <span>{healthMetrics.financial.profitability}% margin</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relationship Health</CardTitle>
                  <CardDescription>Stakeholder engagement and satisfaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Score</span>
                    <span className={`font-bold ${getScoreColor(healthMetrics.relationship.score)}`}>
                      {healthMetrics.relationship.score}/100
                    </span>
                  </div>
                  <Progress value={healthMetrics.relationship.score} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Satisfaction:</span>
                      <span>{healthMetrics.relationship.satisfaction}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stakeholder Engagement:</span>
                      <span>{healthMetrics.relationship.stakeholderEngagement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Communication Quality:</span>
                      <Badge variant="outline" className="capitalize">
                        {healthMetrics.relationship.communicationQuality}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Potential</CardTitle>
                  <CardDescription>Expansion and retention opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Score</span>
                    <span className={`font-bold ${getScoreColor(healthMetrics.growth.score)}`}>
                      {healthMetrics.growth.score}/100
                    </span>
                  </div>
                  <Progress value={healthMetrics.growth.score} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth Potential:</span>
                      <Badge variant={healthMetrics.growth.potential === 'high' ? 'default' : healthMetrics.growth.potential === 'medium' ? 'secondary' : 'outline'}>
                        {healthMetrics.growth.potential}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expansion Score:</span>
                      <span>{healthMetrics.growth.expansion}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retention Score:</span>
                      <span>{healthMetrics.growth.retention}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-4">
            {insights
              .filter(insight => insight.type === 'prediction')
              .map((insight) => (
                <Card key={insight.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
                        <p className="text-muted-foreground mb-4">{insight.description}</p>
                        
                        {insight.data?.relatedMetrics && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insight.data.relatedMetrics.map((metric, index) => (
                              <div key={index} className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">{metric.name}</div>
                                <div className="text-lg font-semibold">{metric.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {insights
              .filter(insight => insight.type === 'recommendation' || insight.type === 'opportunity')
              .map((insight) => (
                <Card key={insight.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{insight.title}</h3>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{insight.description}</p>
                        
                        {insight.suggestedActions && (
                          <div>
                            <h4 className="font-medium mb-3">Recommended Actions</h4>
                            <div className="space-y-2">
                              {insight.suggestedActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => handleActionClick(insight, action)}
                                >
                                  <CheckCircle size={16} className="mr-2" />
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}