import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain,
  Sparkle,
  TrendUp,
  Users,
  Phone,
  EnvelopeSimple as Mail,
  Calendar,
  Star,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Plus,
  Download,
  Share,
  ChartLine,
  Robot,
  Lightning,
  MagicWand,
  ThumbsUp,
  Warning,
  CurrencyDollar as DollarSign,
  Handshake,
  Trophy,
  Timer,
  Funnel,
  ArrowRight,
  Calculator,
  Briefcase,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  GraduationCap,
  PresentationChart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Deal {
  id: string
  name: string
  amount: number
  probability: number
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  contactName: string
  contactEmail: string
  companyName: string
  assignedTo: string
  source: string
  closeDate: string
  createdDate: string
  lastActivity: string
  nextAction: string
  notes: string
  tags: string[]
  products: Array<{
    id: string
    name: string
    quantity: number
    unitPrice: number
    discount: number
  }>
  aiInsights?: {
    winProbability: number
    riskScore: number
    dealHealth: 'excellent' | 'good' | 'at-risk' | 'critical'
    predictedCloseDate: string
    predictedAmount: number
    nextBestActions: string[]
    competitiveThreat: number
    buyerEngagement: number
    decisionTimeframe: string
    riskFactors: string[]
    accelerators: string[]
    similarDealsWon: number
    averageTimeToClose: number
    recommendedDiscount: number
    upsellOpportunities: string[]
  }
  activities: Array<{
    id: string
    type: 'call' | 'email' | 'meeting' | 'proposal' | 'demo'
    date: string
    duration?: number
    outcome: string
    nextAction?: string
    participants: string[]
  }>
}

interface PipelineStage {
  id: string
  name: string
  probability: number
  color: string
  deals: Deal[]
}

interface AIEnhancedDealPipelineProps {
  companyId: string
  userId: string
  userRole: string
}

export function AIEnhancedDealPipeline({ companyId, userId, userRole }: AIEnhancedDealPipelineProps) {
  const [deals, setDeals] = useKV<Deal[]>(`enhanced-deals-${companyId}`, [])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showFullView, setShowFullView] = useState(false)
  const [aiAnalysisMode, setAiAnalysisMode] = useState(false)
  const [pipelineMetrics, setPipelineMetrics] = useState({
    totalValue: 0,
    weightedValue: 0,
    avgDealSize: 0,
    conversionRate: 0,
    avgTimeToClose: 0,
    totalDeals: 0
  })
  const [loadingAI, setLoadingAI] = useState(false)
  const [pipelineInsights, setPipelineInsights] = useState<any>(null)
  const [stagePerformance, setStagePerformance] = useState<any[]>([])

  const stages: PipelineStage[] = [
    { id: 'prospect', name: 'Prospect', probability: 10, color: 'bg-gray-100 border-gray-300', deals: [] },
    { id: 'qualification', name: 'Qualification', probability: 25, color: 'bg-blue-100 border-blue-300', deals: [] },
    { id: 'proposal', name: 'Proposal', probability: 50, color: 'bg-yellow-100 border-yellow-300', deals: [] },
    { id: 'negotiation', name: 'Negotiation', probability: 75, color: 'bg-orange-100 border-orange-300', deals: [] },
    { id: 'closed-won', name: 'Closed Won', probability: 100, color: 'bg-green-100 border-green-300', deals: [] },
    { id: 'closed-lost', name: 'Closed Lost', probability: 0, color: 'bg-red-100 border-red-300', deals: [] }
  ]

  // Populate stages with deals
  stages.forEach(stage => {
    stage.deals = deals.filter(deal => deal.stage === stage.id)
  })

  // AI-powered deal analysis
  const generateAIDealInsights = async (deal: Deal) => {
    setLoadingAI(true)
    try {
      const prompt = spark.llmPrompt`
        Analyze this sales deal and provide comprehensive AI insights:
        
        Deal Details:
        - Name: ${deal.name}
        - Amount: $${deal.amount}
        - Current Stage: ${deal.stage}
        - Current Probability: ${deal.probability}%
        - Contact: ${deal.contactName} (${deal.contactEmail})
        - Company: ${deal.companyName}
        - Source: ${deal.source}
        - Expected Close Date: ${deal.closeDate}
        - Created: ${deal.createdDate}
        - Last Activity: ${deal.lastActivity}
        - Next Action: ${deal.nextAction}
        - Notes: ${deal.notes}
        - Tags: ${deal.tags.join(', ')}
        - Products: ${deal.products.map(p => `${p.name} (${p.quantity} × $${p.unitPrice})`).join(', ')}
        - Recent Activities: ${deal.activities.slice(-3).map(a => `${a.type}: ${a.outcome}`).join('; ')}
        
        Provide analysis in this exact JSON format:
        {
          "winProbability": number (0-100),
          "riskScore": number (0-100),
          "dealHealth": "excellent" | "good" | "at-risk" | "critical",
          "predictedCloseDate": "YYYY-MM-DD",
          "predictedAmount": number,
          "nextBestActions": ["action1", "action2", "action3"],
          "competitiveThreat": number (0-100),
          "buyerEngagement": number (0-100),
          "decisionTimeframe": "string describing timeline",
          "riskFactors": ["risk1", "risk2"],
          "accelerators": ["accelerator1", "accelerator2"],
          "similarDealsWon": number,
          "averageTimeToClose": number (days),
          "recommendedDiscount": number (0-30),
          "upsellOpportunities": ["opportunity1", "opportunity2"]
        }
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      
      // Update deal with AI insights
      setDeals(currentDeals => 
        currentDeals?.map(d => 
          d.id === deal.id 
            ? { ...d, aiInsights: insights }
            : d
        ) || []
      )
      
      toast.success('AI deal insights generated successfully')
      return insights
    } catch (error) {
      console.error('Error generating AI deal insights:', error)
      toast.error('Failed to generate AI insights')
      return null
    } finally {
      setLoadingAI(false)
    }
  }

  // AI-powered pipeline analysis
  const generatePipelineInsights = async () => {
    setLoadingAI(true)
    try {
      const prompt = spark.llmPrompt`
        Analyze this sales pipeline and provide comprehensive insights:
        
        Pipeline Data:
        Total Deals: ${deals.length}
        Total Pipeline Value: $${pipelineMetrics.totalValue.toLocaleString()}
        Weighted Pipeline Value: $${pipelineMetrics.weightedValue.toLocaleString()}
        Average Deal Size: $${pipelineMetrics.avgDealSize.toLocaleString()}
        
        Deals by Stage:
        ${stages.map(stage => `${stage.name}: ${stage.deals.length} deals ($${stage.deals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()})`).join('\n')}
        
        Top Deals:
        ${deals.slice(0, 5).map(deal => `$${deal.amount.toLocaleString()} - ${deal.name} (${deal.stage})`).join('\n')}
        
        Provide analysis in this exact JSON format:
        {
          "overallHealth": "excellent" | "good" | "concerning" | "critical",
          "healthScore": number (0-100),
          "topRisks": ["risk1", "risk2", "risk3"],
          "topOpportunities": ["opp1", "opp2", "opp3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "predictedQuarterRevenue": number,
          "forecastAccuracy": number (0-100),
          "conversionBottlenecks": ["bottleneck1", "bottleneck2"],
          "stageRecommendations": {
            "prospect": "recommendation",
            "qualification": "recommendation",
            "proposal": "recommendation",
            "negotiation": "recommendation"
          },
          "urgentActions": ["action1", "action2"],
          "pipelineVelocity": "fast" | "normal" | "slow",
          "dealSizeOptimization": "string with recommendations"
        }
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      
      setPipelineInsights(insights)
      toast.success('Pipeline AI insights generated')
      
    } catch (error) {
      console.error('Error generating pipeline insights:', error)
      toast.error('Failed to generate pipeline insights')
    } finally {
      setLoadingAI(false)
    }
  }

  // Calculate pipeline metrics
  useEffect(() => {
    if (deals && deals.length > 0) {
      const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0)
      const weightedValue = deals.reduce((sum, deal) => {
        const stage = stages.find(s => s.id === deal.stage)
        return sum + (deal.amount * (stage?.probability || 0) / 100)
      }, 0)
      const closedWonDeals = deals.filter(d => d.stage === 'closed-won')
      const totalClosedDeals = deals.filter(d => d.stage === 'closed-won' || d.stage === 'closed-lost')
      
      setPipelineMetrics({
        totalValue,
        weightedValue,
        avgDealSize: totalValue / deals.length || 0,
        conversionRate: totalClosedDeals.length > 0 ? (closedWonDeals.length / totalClosedDeals.length) * 100 : 0,
        avgTimeToClose: 45, // This would be calculated from actual data
        totalDeals: deals.length
      })
    }
  }, [deals])

  // Create sample deals
  useEffect(() => {
    if (!deals || deals.length === 0) {
      const sampleDeals: Deal[] = [
        {
          id: 'deal-001',
          name: 'Enterprise Software License - TechCorp',
          amount: 150000,
          probability: 75,
          stage: 'negotiation',
          contactName: 'Sarah Johnson',
          contactEmail: 'sarah@techcorp.com',
          companyName: 'TechCorp Solutions',
          assignedTo: userId,
          source: 'Website Form',
          closeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Pricing discussion completed',
          nextAction: 'Send final proposal with terms',
          notes: 'Strong interest in enterprise features. Budget approved. Decision by month-end.',
          tags: ['enterprise', 'high-value', 'urgent'],
          products: [
            { id: 'prod-001', name: 'Enterprise License', quantity: 500, unitPrice: 300, discount: 0 }
          ],
          activities: [
            {
              id: 'act-001',
              type: 'demo',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 60,
              outcome: 'Positive response to enterprise features',
              participants: ['Sarah Johnson', 'CTO Mike Smith']
            },
            {
              id: 'act-002',
              type: 'proposal',
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              outcome: 'Initial proposal sent',
              nextAction: 'Follow up on pricing',
              participants: ['Sarah Johnson']
            }
          ]
        },
        {
          id: 'deal-002',
          name: 'SMB Package - InnovateStartup',
          amount: 25000,
          probability: 50,
          stage: 'proposal',
          contactName: 'Michael Chen',
          contactEmail: 'mchen@startup.io',
          companyName: 'InnovateStartup',
          assignedTo: userId,
          source: 'LinkedIn',
          closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Discovery call completed',
          nextAction: 'Prepare custom proposal',
          notes: 'Growing startup with tight budget but clear need for our solution.',
          tags: ['startup', 'budget-conscious', 'technical'],
          products: [
            { id: 'prod-002', name: 'SMB License', quantity: 50, unitPrice: 500, discount: 10 }
          ],
          activities: [
            {
              id: 'act-003',
              type: 'call',
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 45,
              outcome: 'Requirements gathering complete',
              participants: ['Michael Chen']
            }
          ]
        }
      ]
      setDeals(sampleDeals)
    }
  }, [deals, setDeals, userId])

  const handleDealClick = async (deal: Deal) => {
    setSelectedDeal(deal)
    setShowFullView(true)
    
    // Generate AI insights if not available or outdated
    if (!deal.aiInsights) {
      await generateAIDealInsights(deal)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'qualification': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'proposal': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'negotiation': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'closed-won': return 'bg-green-100 text-green-800 border-green-300'
      case 'closed-lost': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDealHealthColor = (health?: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'at-risk': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const moveDealToStage = (dealId: string, newStage: string) => {
    setDeals(currentDeals => 
      currentDeals?.map(deal => 
        deal.id === dealId 
          ? { ...deal, stage: newStage as any }
          : deal
      ) || []
    )
    toast.success(`Deal moved to ${newStage}`)
  }

  return (
    <div className="space-y-6">
      {/* AI-Powered Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Funnel className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">AI-Enhanced Sales Pipeline</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <Brain size={12} />
              AI Powered
            </Badge>
          </div>
          {loadingAI && (
            <Badge variant="outline" className="flex items-center gap-1 animate-pulse">
              <Robot size={12} />
              AI Analyzing...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generatePipelineInsights}
            disabled={loadingAI}
            className="flex items-center gap-2"
          >
            <MagicWand size={16} />
            Pipeline AI Analysis
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                <p className="text-xl font-bold">${pipelineMetrics.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weighted Value</p>
                <p className="text-xl font-bold">${pipelineMetrics.weightedValue.toLocaleString()}</p>
              </div>
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-xl font-bold">${pipelineMetrics.avgDealSize.toLocaleString()}</p>
              </div>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold">{pipelineMetrics.conversionRate.toFixed(1)}%</p>
              </div>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time to Close</p>
                <p className="text-xl font-bold">{pipelineMetrics.avgTimeToClose} days</p>
              </div>
              <Timer className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold">{pipelineMetrics.totalDeals}</p>
              </div>
              <Briefcase className="h-5 w-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Pipeline Insights */}
      {pipelineInsights && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Pipeline Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive AI insights and recommendations for your sales pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Pipeline Health
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={pipelineInsights.healthScore} className="flex-1" />
                    <span className="font-bold">{pipelineInsights.healthScore}/100</span>
                  </div>
                  <Badge variant={
                    pipelineInsights.overallHealth === 'excellent' ? 'default' :
                    pipelineInsights.overallHealth === 'good' ? 'secondary' :
                    pipelineInsights.overallHealth === 'concerning' ? 'destructive' : 'destructive'
                  }>
                    {pipelineInsights.overallHealth}
                  </Badge>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Predicted Q Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${pipelineInsights.predictedQuarterRevenue?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pipelineInsights.forecastAccuracy}% forecast accuracy
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Warning className="h-4 w-4 text-red-600" />
                    Top Risks
                  </h4>
                  <ul className="text-sm space-y-1">
                    {pipelineInsights.topRisks?.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    Top Opportunities
                  </h4>
                  <ul className="text-sm space-y-1">
                    {pipelineInsights.topOpportunities?.map((opp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightning className="h-4 w-4 text-yellow-600" />
                    Urgent Actions
                  </h4>
                  <ul className="text-sm space-y-2">
                    {pipelineInsights.urgentActions?.map((action: string, index: number) => (
                      <li key={index} className="p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-2">Pipeline Velocity</h4>
                  <Badge variant={
                    pipelineInsights.pipelineVelocity === 'fast' ? 'default' :
                    pipelineInsights.pipelineVelocity === 'normal' ? 'secondary' : 'destructive'
                  }>
                    {pipelineInsights.pipelineVelocity}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pipelineInsights.dealSizeOptimization}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className={`min-h-96 ${stage.color}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{stage.name}</span>
                <Badge variant="outline" className="text-xs">
                  {stage.deals.length}
                </Badge>
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                ${stage.deals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {stage.probability}% probability
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stage.deals.map((deal) => (
                <Card 
                  key={deal.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white border-l-4"
                  style={{ 
                    borderLeftColor: deal.aiInsights?.dealHealth === 'excellent' ? '#22c55e' :
                                   deal.aiInsights?.dealHealth === 'good' ? '#3b82f6' :
                                   deal.aiInsights?.dealHealth === 'at-risk' ? '#f59e0b' :
                                   deal.aiInsights?.dealHealth === 'critical' ? '#ef4444' : '#6b7280'
                  }}
                  onClick={() => handleDealClick(deal)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight">{deal.name}</h4>
                        {deal.aiInsights && (
                          <Badge variant="outline" className="text-xs ml-2">
                            <Brain size={10} className="mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">${deal.amount.toLocaleString()}</span>
                        </div>
                        
                        {deal.aiInsights && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">AI Win Prob.</span>
                            <span className="font-medium">{deal.aiInsights.winProbability}%</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Close Date</span>
                          <span className="font-medium">
                            {new Date(deal.closeDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span>{deal.companyName}</span>
                      </div>

                      {deal.aiInsights && (
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDealHealthColor(deal.aiInsights.dealHealth)}`}
                          >
                            {deal.aiInsights.dealHealth}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Progress 
                              value={deal.aiInsights.winProbability} 
                              className="w-12 h-1" 
                            />
                            <span className="text-xs font-medium">
                              {deal.aiInsights.winProbability}%
                            </span>
                          </div>
                        </div>
                      )}

                      {deal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {deal.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs py-0 px-1">
                              {tag}
                            </Badge>
                          ))}
                          {deal.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs py-0 px-1">
                              +{deal.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => { 
                              e.stopPropagation()
                              toast.success('Calling ' + deal.contactName)
                            }}
                          >
                            <Phone size={12} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => { 
                              e.stopPropagation()
                              toast.success('Emailing ' + deal.contactName)
                            }}
                          >
                            <Mail size={12} />
                          </Button>
                        </div>
                        
                        {stage.id !== 'closed-won' && stage.id !== 'closed-lost' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              const nextStageIndex = stages.findIndex(s => s.id === stage.id) + 1
                              if (nextStageIndex < stages.length - 2) { // Exclude closed stages
                                moveDealToStage(deal.id, stages[nextStageIndex].id)
                              }
                            }}
                          >
                            <ArrowRight size={10} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stage.deals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Target size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No deals in this stage</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Deal View Dialog */}
      {selectedDeal && (
        <Dialog open={showFullView} onOpenChange={setShowFullView}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {selectedDeal.name}
                {selectedDeal.aiInsights && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brain size={12} />
                    AI Enhanced
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Deal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Deal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Deal Name</label>
                            <p className="text-lg">{selectedDeal.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount</label>
                            <p className="text-lg font-bold text-green-600">
                              ${selectedDeal.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Stage</label>
                            <Badge className={getStageColor(selectedDeal.stage)}>
                              {selectedDeal.stage}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Probability</label>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedDeal.probability} className="flex-1" />
                              <span className="font-bold">{selectedDeal.probability}%</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Contact</label>
                            <p>{selectedDeal.contactName}</p>
                            <p className="text-sm text-muted-foreground">{selectedDeal.contactEmail}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Company</label>
                            <p>{selectedDeal.companyName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Expected Close</label>
                            <p>{new Date(selectedDeal.closeDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Source</label>
                            <p>{selectedDeal.source}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes and Next Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Notes & Next Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea 
                            defaultValue={selectedDeal.notes}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Next Action</label>
                          <Input defaultValue={selectedDeal.nextAction} className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full justify-start gap-2">
                          <Phone size={16} />
                          Call Contact
                        </Button>
                        <Button className="w-full justify-start gap-2" variant="outline">
                          <Mail size={16} />
                          Send Email
                        </Button>
                        <Button className="w-full justify-start gap-2" variant="outline">
                          <Calendar size={16} />
                          Schedule Meeting
                        </Button>
                        <Button className="w-full justify-start gap-2" variant="outline">
                          <PresentationChart size={16} />
                          Create Proposal
                        </Button>
                        <Separator />
                        <Button 
                          className="w-full justify-start gap-2" 
                          variant="outline"
                          onClick={() => generateAIDealInsights(selectedDeal)}
                          disabled={loadingAI}
                        >
                          <Brain size={16} />
                          {loadingAI ? 'Generating...' : 'Refresh AI Insights'}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Deal Health */}
                    {selectedDeal.aiInsights && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Deal Health
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Overall Health</span>
                              <Badge 
                                variant="outline" 
                                className={getDealHealthColor(selectedDeal.aiInsights.dealHealth)}
                              >
                                {selectedDeal.aiInsights.dealHealth}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">AI Win Probability</span>
                              <span className="font-bold">{selectedDeal.aiInsights.winProbability}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Risk Score</span>
                              <span className="font-bold text-red-600">{selectedDeal.aiInsights.riskScore}/100</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Competitive Threat</span>
                              <span className="font-bold">{selectedDeal.aiInsights.competitiveThreat}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tags */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedDeal.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-4">
                {selectedDeal.aiInsights ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Predictions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          AI Predictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-sm font-medium">Predicted Close Date</p>
                            <p className="text-lg font-bold">
                              {new Date(selectedDeal.aiInsights.predictedCloseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-sm font-medium">Predicted Amount</p>
                            <p className="text-lg font-bold text-green-600">
                              ${selectedDeal.aiInsights.predictedAmount.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-sm font-medium">Avg Time to Close</p>
                            <p className="text-lg font-bold">
                              {selectedDeal.aiInsights.averageTimeToClose} days
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-sm font-medium">Similar Deals Won</p>
                            <p className="text-lg font-bold text-blue-600">
                              {selectedDeal.aiInsights.similarDealsWon}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Decision Timeframe</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedDeal.aiInsights.decisionTimeframe}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recommended Discount</p>
                          <p className="text-lg font-bold text-orange-600">
                            {selectedDeal.aiInsights.recommendedDiscount}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightning className="h-5 w-5 text-yellow-600" />
                            Next Best Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedDeal.aiInsights.nextBestActions.map((action, index) => (
                              <li key={index} className="p-2 bg-yellow-50 rounded border-l-2 border-yellow-400 text-sm">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                            Accelerators
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {selectedDeal.aiInsights.accelerators.map((acc, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {acc}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Warning className="h-5 w-5 text-red-600" />
                            Risk Factors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {selectedDeal.aiInsights.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {selectedDeal.aiInsights.upsellOpportunities.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendUp className="h-5 w-5 text-blue-600" />
                              Upsell Opportunities
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {selectedDeal.aiInsights.upsellOpportunities.map((opp, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  {opp}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Robot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate AI-powered insights to get predictions and recommendations for this deal.
                      </p>
                      <Button 
                        onClick={() => generateAIDealInsights(selectedDeal)}
                        disabled={loadingAI}
                        className="flex items-center gap-2"
                      >
                        <Brain size={16} />
                        {loadingAI ? 'Generating AI Insights...' : 'Generate AI Insights'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Activities</CardTitle>
                    <CardDescription>
                      Complete timeline of all activities for this deal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDeal.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === 'call' && <Phone className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'email' && <Mail className="h-5 w-5 text-green-600" />}
                            {activity.type === 'meeting' && <Calendar className="h-5 w-5 text-purple-600" />}
                            {activity.type === 'demo' && <PresentationChart className="h-5 w-5 text-orange-600" />}
                            {activity.type === 'proposal' && <Briefcase className="h-5 w-5 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium capitalize">{activity.type}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{activity.outcome}</p>
                            {activity.participants.length > 0 && (
                              <div className="flex items-center gap-2 mb-2">
                                <UsersIcon size={14} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {activity.participants.join(', ')}
                                </span>
                              </div>
                            )}
                            {activity.duration && (
                              <Badge variant="outline" className="text-xs">
                                {activity.duration} minutes
                              </Badge>
                            )}
                            {activity.nextAction && (
                              <p className="text-xs text-blue-600 mt-1">
                                Next: {activity.nextAction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <Button className="w-full" variant="outline">
                        <Plus size={16} className="mr-2" />
                        Add New Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Products & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDeal.products.map((product) => (
                        <div key={product.id} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium">Product</label>
                              <p>{product.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Quantity</label>
                              <p>{product.quantity}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Unit Price</label>
                              <p>${product.unitPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Total</label>
                              <p className="font-bold">
                                ${(product.quantity * product.unitPrice * (1 - product.discount / 100)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {product.discount > 0 && (
                            <div className="mt-2">
                              <Badge variant="secondary">
                                {product.discount}% discount applied
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <Button className="w-full" variant="outline">
                        <Plus size={16} className="mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deal Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Current Amount</span>
                          <span className="font-bold">${selectedDeal.amount.toLocaleString()}</span>
                        </div>
                        
                        {selectedDeal.aiInsights && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">AI Predicted Amount</span>
                              <span className="font-bold text-green-600">
                                ${selectedDeal.aiInsights.predictedAmount.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Weighted Value</span>
                              <span className="font-bold text-blue-600">
                                ${(selectedDeal.aiInsights.predictedAmount * selectedDeal.aiInsights.winProbability / 100).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Current Probability</span>
                          <span className="font-bold">{selectedDeal.probability}%</span>
                        </div>
                        
                        {selectedDeal.aiInsights && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">AI Win Probability</span>
                            <span className="font-bold text-purple-600">
                              {selectedDeal.aiInsights.winProbability}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Expected Close</span>
                          <span className="font-bold">
                            {new Date(selectedDeal.closeDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {selectedDeal.aiInsights && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">AI Predicted Close</span>
                              <span className="font-bold text-green-600">
                                {new Date(selectedDeal.aiInsights.predictedCloseDate).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Avg Time to Close</span>
                              <span className="font-bold">
                                {selectedDeal.aiInsights.averageTimeToClose} days
                              </span>
                            </div>
                          </>
                        )}
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Days Remaining</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.max(0, 100 - (new Date().getTime() - new Date(selectedDeal.createdDate).getTime()) / (new Date(selectedDeal.closeDate).getTime() - new Date(selectedDeal.createdDate).getTime()) * 100)} 
                              className="flex-1" 
                            />
                            <span className="text-sm font-bold">
                              {Math.ceil((new Date(selectedDeal.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}