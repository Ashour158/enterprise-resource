import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Robot, 
  Brain, 
  TrendUp, 
  TrendDown,
  Target, 
  WarningCircle, 
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  ChartBar,
  Lightbulb,
  Star,
  Flag,
  ArrowRight,
  Play,
  Phone,
  EnvelopeSimple as Mail,
  VideoCamera as Video,
  CalendarPlus,
  FileText,
  PresentationChart,
  Handshake
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
  aiScore: number
  aiRecommendations: string[]
  winProbability: number
  riskFactors: string[]
  nextBestActions: string[]
  daysInStage: number
  lastActivityDate: string
  customFields: Record<string, any>
}

interface AIInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'prediction'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  dealId?: string
  actionable: boolean
  suggestedActions: string[]
  dataPoints: string[]
  createdAt: string
}

interface DealAIInsightsProps {
  deals: Deal[]
  companyId: string
  userId: string
  focusDeal?: string
}

export function DealAIInsights({ deals, companyId, userId, focusDeal }: DealAIInsightsProps) {
  const [insights, setInsights] = useKV<AIInsight[]>(`deal-ai-insights-${companyId}`, [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Generate AI insights on component mount
  useEffect(() => {
    if (insights.length === 0) {
      generateAIInsights()
    }
  }, [deals])

  const generateAIInsights = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newInsights: AIInsight[] = [
        // High-value deal opportunities
        {
          id: `insight-${Date.now()}-1`,
          type: 'opportunity',
          title: 'High-Value Deal at Risk',
          description: 'Enterprise Software License deal ($450,000) has been in negotiation stage for 23 days, which is 13 days longer than average. Probability of closure is decreasing.',
          confidence: 89,
          impact: 'high',
          category: 'Deal Risk',
          dealId: deals.find(d => d.value > 400000)?.id,
          actionable: true,
          suggestedActions: [
            'Schedule executive-level meeting',
            'Provide additional technical documentation',
            'Offer limited-time incentives',
            'Engage customer success team'
          ],
          dataPoints: [
            '23 days in negotiation stage',
            'Average stage duration: 10 days',
            'Competitor mentioned in recent call',
            'Budget approval pending'
          ],
          createdAt: new Date().toISOString()
        },
        
        // Win probability insights
        {
          id: `insight-${Date.now()}-2`,
          type: 'prediction',
          title: 'Strong Win Signals Detected',
          description: 'Cloud Migration Project shows 94% win probability based on engagement patterns, budget confirmation, and decision-maker involvement.',
          confidence: 94,
          impact: 'high',
          category: 'Win Probability',
          dealId: deals.find(d => d.title.includes('Cloud'))?.id,
          actionable: true,
          suggestedActions: [
            'Prepare contract for signature',
            'Schedule implementation kickoff',
            'Introduce customer success team',
            'Send welcome package'
          ],
          dataPoints: [
            'Budget approved by CFO',
            'Technical requirements documented',
            'Implementation timeline agreed',
            'Multiple stakeholder meetings'
          ],
          createdAt: new Date().toISOString()
        },

        // Pipeline optimization
        {
          id: `insight-${Date.now()}-3`,
          type: 'recommendation',
          title: 'Pipeline Velocity Optimization',
          description: 'Deals in qualification stage are taking 40% longer than industry benchmarks. Implementing qualification framework could improve velocity.',
          confidence: 76,
          impact: 'medium',
          category: 'Process Optimization',
          actionable: true,
          suggestedActions: [
            'Implement BANT qualification framework',
            'Create qualification checklists',
            'Train sales team on qualification',
            'Set stage exit criteria'
          ],
          dataPoints: [
            'Average qualification time: 19 days',
            'Industry benchmark: 14 days',
            '23% of qualified leads stall',
            'Missing discovery calls'
          ],
          createdAt: new Date().toISOString()
        },

        // Market trends
        {
          id: `insight-${Date.now()}-4`,
          type: 'opportunity',
          title: 'Seasonal Buying Pattern Detected',
          description: 'Q4 enterprise deals show 65% higher closure rates. Current pipeline suggests $2.3M additional revenue opportunity.',
          confidence: 82,
          impact: 'high',
          category: 'Market Trends',
          actionable: true,
          suggestedActions: [
            'Accelerate Q4 enterprise deals',
            'Prepare year-end promotions',
            'Increase outreach to enterprise prospects',
            'Schedule executive business reviews'
          ],
          dataPoints: [
            'Q4 closure rate: 65%',
            'Q1-Q3 average: 39%',
            'Enterprise budget cycles',
            'Historical buying patterns'
          ],
          createdAt: new Date().toISOString()
        },

        // Risk factors
        {
          id: `insight-${Date.now()}-5`,
          type: 'warning',
          title: 'Competitor Threat Analysis',
          description: 'Competitor X mentioned in 4 recent deals. Their pricing strategy is 15% below our proposals.',
          confidence: 71,
          impact: 'medium',
          category: 'Competitive Intelligence',
          actionable: true,
          suggestedActions: [
            'Update competitive battlecards',
            'Emphasize unique value propositions',
            'Prepare price justification materials',
            'Schedule competitive training'
          ],
          dataPoints: [
            'Competitor mentioned in 4 deals',
            '15% pricing difference',
            'Similar feature set',
            'Aggressive sales tactics'
          ],
          createdAt: new Date().toISOString()
        },

        // Engagement insights
        {
          id: `insight-${Date.now()}-6`,
          type: 'recommendation',
          title: 'Engagement Optimization',
          description: 'Deals with 3+ stakeholder meetings have 73% higher win rates. Several high-value deals lack stakeholder engagement.',
          confidence: 85,
          impact: 'medium',
          category: 'Engagement Strategy',
          actionable: true,
          suggestedActions: [
            'Map stakeholder influence',
            'Schedule multi-stakeholder meetings',
            'Create stakeholder-specific content',
            'Assign account team members'
          ],
          dataPoints: [
            '73% higher win rate with 3+ meetings',
            'Current average: 1.8 meetings',
            'Decision committee size: 5.2 people',
            'Stakeholder mapping incomplete'
          ],
          createdAt: new Date().toISOString()
        }
      ]
      
      setInsights(newInsights)
      toast.success('AI insights generated successfully')
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights')
    } finally {
      setIsGenerating(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="h-5 w-5 text-blue-600" />
      case 'warning': return <WarningCircle className="h-5 w-5 text-amber-600" />
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />
      case 'prediction': return <Brain className="h-5 w-5 text-purple-600" />
      default: return <Robot className="h-5 w-5 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('call') || action.toLowerCase().includes('phone')) {
      return <Phone className="h-4 w-4" />
    } else if (action.toLowerCase().includes('email') || action.toLowerCase().includes('send')) {
      return <Mail className="h-4 w-4" />
    } else if (action.toLowerCase().includes('meeting') || action.toLowerCase().includes('schedule')) {
      return <Calendar className="h-4 w-4" />
    } else if (action.toLowerCase().includes('demo') || action.toLowerCase().includes('presentation')) {
      return <PresentationChart className="h-4 w-4" />
    } else if (action.toLowerCase().includes('contract') || action.toLowerCase().includes('proposal')) {
      return <FileText className="h-4 w-4" />
    } else {
      return <Play className="h-4 w-4" />
    }
  }

  const executeAction = async (insight: AIInsight, action: string) => {
    toast.success(`Executing: ${action}`)
    // Here you would integrate with your CRM actions
  }

  const getDealInsights = () => {
    return focusDeal 
      ? insights.filter(insight => insight.dealId === focusDeal)
      : insights
  }

  const getInsightsByCategory = () => {
    const categories: Record<string, AIInsight[]> = {}
    getDealInsights().forEach(insight => {
      if (!categories[insight.category]) {
        categories[insight.category] = []
      }
      categories[insight.category].push(insight)
    })
    return categories
  }

  const getHighPriorityInsights = () => {
    return getDealInsights()
      .filter(insight => insight.impact === 'high' && insight.actionable)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Robot className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>AI Deal Insights</CardTitle>
                <CardDescription>
                  AI-powered recommendations to optimize your sales pipeline
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={generateAIInsights} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="deal-specific">Deal Specific</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Insights</p>
                    <p className="text-2xl font-bold">{insights.length}</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Impact</p>
                    <p className="text-2xl font-bold">
                      {insights.filter(i => i.impact === 'high').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Actionable</p>
                    <p className="text-2xl font-bold">
                      {insights.filter(i => i.actionable).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">
                      {insights.length > 0 
                        ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)
                        : 0}%
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.slice(0, 6).map((insight) => (
              <Card key={insight.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}%
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{insight.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{insight.category}</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedInsight(insight)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-priority" className="space-y-4">
          <div className="space-y-4">
            {getHighPriorityInsights().map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Suggested Actions</h4>
                        <div className="space-y-2">
                          {insight.suggestedActions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                {getActionIcon(action)}
                                <span className="text-sm">{action}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => executeAction(insight, action)}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Key Data Points</h4>
                        <div className="space-y-1">
                          {insight.dataPoints.map((point, index) => (
                            <p key={index} className="text-sm text-muted-foreground">• {point}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-6">
          {Object.entries(getInsightsByCategory()).map(([category, categoryInsights]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" />
                  {category}
                  <Badge variant="outline">{categoryInsights.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categoryInsights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Progress value={insight.confidence} className="w-16 h-2" />
                              <span className="text-xs">{insight.confidence}%</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedInsight(insight)}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deal-specific" className="space-y-4">
          {focusDeal ? (
            <div className="space-y-4">
              {insights.filter(i => i.dealId === focusDeal).map((insight) => (
                <Card key={insight.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <h3 className="font-semibold">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Recommended Actions</h4>
                          <div className="space-y-2">
                            {insight.suggestedActions.map((action, index) => (
                              <Button 
                                key={index}
                                variant="outline" 
                                size="sm" 
                                className="w-full justify-start"
                                onClick={() => executeAction(insight, action)}
                              >
                                {getActionIcon(action)}
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Supporting Data</h4>
                          <div className="space-y-1">
                            {insight.dataPoints.map((point, index) => (
                              <p key={index} className="text-sm text-muted-foreground">• {point}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Select a specific deal to view deal-specific AI insights and recommendations.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}