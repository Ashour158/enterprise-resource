import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock,
  Calendar,
  TrendUp,
  TrendDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Users,
  DollarSign,
  Activity,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
  ClockCounterClockwise,
  Timer,
  CalendarX,
  Brain,
  Lightbulb,
  Star,
  Warning
} from '@phosphor-icons/react'
import { differenceInDays, format, startOfDay, endOfDay, subDays, addDays } from 'date-fns'
import { toast } from 'sonner'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  status: string
  source: string
  score: number
  estimatedValue: number
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date
  nextFollowUpDate?: Date
}

interface AgingAnalysis {
  leadId: string
  daysInPipeline: number
  daysSinceLastContact: number
  daysUntilNextFollowUp: number
  agingCategory: 'new' | 'warm' | 'cold' | 'frozen' | 'stale'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: string
  aiInsights: string[]
  conversionProbability: number
  urgencyScore: number
}

interface AgingRule {
  id: string
  name: string
  description: string
  category: 'new' | 'warm' | 'cold' | 'frozen' | 'stale'
  minDays: number
  maxDays: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  autoActions: string[]
  notificationThreshold: number
  isActive: boolean
}

interface LeadAgingAnalyticsProps {
  companyId: string
  userId: string
  leads: Lead[]
  onTakeAction?: (leadId: string, action: string) => void
}

export function LeadAgingAnalytics({ companyId, userId, leads, onTakeAction }: LeadAgingAnalyticsProps) {
  const [agingAnalyses, setAgingAnalyses] = useState<AgingAnalysis[]>([])
  const [agingRules, setAgingRules] = useKV<AgingRule[]>(`aging-rules-${companyId}`, [
    {
      id: 'rule-new',
      name: 'New Leads',
      description: 'Recently created leads requiring immediate attention',
      category: 'new',
      minDays: 0,
      maxDays: 2,
      riskLevel: 'medium',
      autoActions: ['send_welcome_email', 'assign_to_rep'],
      notificationThreshold: 1,
      isActive: true
    },
    {
      id: 'rule-warm',
      name: 'Warm Leads',
      description: 'Engaged leads in active conversation',
      category: 'warm',
      minDays: 3,
      maxDays: 14,
      riskLevel: 'low',
      autoActions: ['schedule_follow_up'],
      notificationThreshold: 7,
      isActive: true
    },
    {
      id: 'rule-cold',
      name: 'Cold Leads',
      description: 'Leads with reduced engagement',
      category: 'cold',
      minDays: 15,
      maxDays: 30,
      riskLevel: 'medium',
      autoActions: ['nurture_campaign', 'manager_review'],
      notificationThreshold: 21,
      isActive: true
    },
    {
      id: 'rule-frozen',
      name: 'Frozen Leads',
      description: 'Long-term prospects with minimal activity',
      category: 'frozen',
      minDays: 31,
      maxDays: 90,
      riskLevel: 'high',
      autoActions: ['quarterly_review', 'special_offer'],
      notificationThreshold: 60,
      isActive: true
    },
    {
      id: 'rule-stale',
      name: 'Stale Leads',
      description: 'Inactive leads requiring cleanup decision',
      category: 'stale',
      minDays: 91,
      maxDays: 365,
      riskLevel: 'critical',
      autoActions: ['archive_review', 'final_attempt'],
      notificationThreshold: 120,
      isActive: true
    }
  ])
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [aiProcessing, setAIProcessing] = useState(false)

  useEffect(() => {
    analyzeLeadAging()
  }, [leads, agingRules])

  const analyzeLeadAging = async () => {
    const now = new Date()
    const analyses: AgingAnalysis[] = []

    for (const lead of leads) {
      const daysInPipeline = differenceInDays(now, lead.createdAt)
      const daysSinceLastContact = lead.lastContactDate 
        ? differenceInDays(now, lead.lastContactDate)
        : daysInPipeline
      const daysUntilNextFollowUp = lead.nextFollowUpDate
        ? differenceInDays(lead.nextFollowUpDate, now)
        : 0

      // Determine aging category based on rules
      const agingCategory = determineAgingCategory(daysInPipeline, daysSinceLastContact)
      const riskLevel = determineRiskLevel(agingCategory, daysSinceLastContact, lead)
      
      // Generate AI insights
      const aiInsights = await generateAgingInsights(lead, daysInPipeline, daysSinceLastContact)
      
      // Calculate conversion probability based on aging
      const conversionProbability = calculateConversionProbability(lead, daysInPipeline, daysSinceLastContact)
      
      // Calculate urgency score
      const urgencyScore = calculateUrgencyScore(lead, daysInPipeline, daysSinceLastContact, riskLevel)

      const analysis: AgingAnalysis = {
        leadId: lead.id,
        daysInPipeline,
        daysSinceLastContact,
        daysUntilNextFollowUp,
        agingCategory,
        riskLevel,
        recommendedAction: getRecommendedAction(agingCategory, riskLevel, lead),
        aiInsights,
        conversionProbability,
        urgencyScore
      }

      analyses.push(analysis)
    }

    setAgingAnalyses(analyses)
  }

  const determineAgingCategory = (daysInPipeline: number, daysSinceLastContact: number): AgingAnalysis['agingCategory'] => {
    const relevantDays = Math.max(daysInPipeline, daysSinceLastContact)
    
    if (relevantDays <= 2) return 'new'
    if (relevantDays <= 14) return 'warm'
    if (relevantDays <= 30) return 'cold'
    if (relevantDays <= 90) return 'frozen'
    return 'stale'
  }

  const determineRiskLevel = (category: AgingAnalysis['agingCategory'], daysSinceLastContact: number, lead: Lead): AgingAnalysis['riskLevel'] => {
    const rule = agingRules.find(r => r.category === category)
    if (!rule) return 'medium'

    // Adjust risk based on lead value and engagement
    let adjustedRisk = rule.riskLevel
    
    if (lead.estimatedValue > 50000 && daysSinceLastContact > 7) {
      adjustedRisk = adjustedRisk === 'low' ? 'medium' : adjustedRisk === 'medium' ? 'high' : 'critical'
    }
    
    if (lead.score > 80 && daysSinceLastContact > 5) {
      adjustedRisk = adjustedRisk === 'low' ? 'medium' : 'high'
    }

    return adjustedRisk
  }

  const generateAgingInsights = async (lead: Lead, daysInPipeline: number, daysSinceLastContact: number): Promise<string[]> => {
    try {
      const prompt = spark.llmPrompt`
      Analyze this lead's aging pattern and provide insights:
      
      Lead: ${lead.firstName} ${lead.lastName} at ${lead.company}
      Days in pipeline: ${daysInPipeline}
      Days since last contact: ${daysSinceLastContact}
      Lead score: ${lead.score}
      Estimated value: $${lead.estimatedValue}
      Current status: ${lead.status}
      Source: ${lead.source}
      
      Provide 2-3 specific insights about:
      1. Risk factors
      2. Opportunity indicators
      3. Recommended timing for next contact
      
      Keep each insight under 50 words.
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return response.split('\n').filter(line => line.trim()).slice(0, 3)
    } catch (error) {
      return [
        'Consider immediate follow-up due to aging',
        'Review engagement history for patterns',
        'Assess if lead criteria still match'
      ]
    }
  }

  const calculateConversionProbability = (lead: Lead, daysInPipeline: number, daysSinceLastContact: number): number => {
    let baseProbability = lead.score * 0.8 // Start with lead score

    // Adjust for aging
    if (daysInPipeline <= 7) baseProbability += 10 // Fresh leads
    else if (daysInPipeline <= 30) baseProbability += 5
    else if (daysInPipeline <= 60) baseProbability -= 5
    else baseProbability -= 15 // Old leads

    // Adjust for contact recency
    if (daysSinceLastContact <= 3) baseProbability += 15
    else if (daysSinceLastContact <= 7) baseProbability += 5
    else if (daysSinceLastContact <= 14) baseProbability -= 5
    else baseProbability -= 10

    // Adjust for lead value
    if (lead.estimatedValue > 50000) baseProbability += 10
    else if (lead.estimatedValue > 20000) baseProbability += 5

    // Adjust for source quality
    if (lead.source === 'Referral') baseProbability += 15
    else if (lead.source === 'Website') baseProbability += 10
    else if (lead.source === 'LinkedIn') baseProbability += 5

    return Math.max(5, Math.min(95, baseProbability))
  }

  const calculateUrgencyScore = (lead: Lead, daysInPipeline: number, daysSinceLastContact: number, riskLevel: string): number => {
    let urgency = 0

    // Base urgency on aging
    urgency += Math.min(50, daysInPipeline * 2)
    urgency += Math.min(30, daysSinceLastContact * 3)

    // Adjust for risk level
    const riskMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3,
      'critical': 1.6
    }
    urgency *= riskMultiplier[riskLevel as keyof typeof riskMultiplier]

    // Adjust for lead value
    if (lead.estimatedValue > 50000) urgency *= 1.4
    else if (lead.estimatedValue > 20000) urgency *= 1.2

    // Adjust for lead score
    if (lead.score > 80) urgency *= 1.3
    else if (lead.score > 60) urgency *= 1.1

    return Math.min(100, Math.max(0, urgency))
  }

  const getRecommendedAction = (category: AgingAnalysis['agingCategory'], riskLevel: AgingAnalysis['riskLevel'], lead: Lead): string => {
    const actions = {
      new: {
        low: 'Schedule introduction call within 24 hours',
        medium: 'Send personalized welcome email immediately',
        high: 'Assign to senior rep for immediate contact',
        critical: 'Priority assignment with same-day contact'
      },
      warm: {
        low: 'Continue regular follow-up sequence',
        medium: 'Schedule product demo or consultation',
        high: 'Escalate to manager for review',
        critical: 'Immediate intervention required'
      },
      cold: {
        low: 'Re-engage with value-added content',
        medium: 'Personal outreach with specific offer',
        high: 'Multi-channel re-engagement campaign',
        critical: 'Executive involvement in outreach'
      },
      frozen: {
        low: 'Add to long-term nurture sequence',
        medium: 'Quarterly check-in with industry updates',
        high: 'Special promotion or event invitation',
        critical: 'Final qualification attempt before archiving'
      },
      stale: {
        low: 'Archive with periodic newsletter inclusion',
        medium: 'One final personalized attempt',
        high: 'Manager review for archive decision',
        critical: 'Immediate archive or final executive outreach'
      }
    }

    return actions[category][riskLevel] || 'Review and determine next steps'
  }

  const generateAIActionPlan = async (analysis: AgingAnalysis) => {
    const lead = leads.find(l => l.id === analysis.leadId)
    if (!lead) return

    setAIProcessing(true)
    try {
      const prompt = spark.llmPrompt`
      Create a detailed action plan for this aging lead:
      
      Lead: ${lead.firstName} ${lead.lastName}
      Aging Category: ${analysis.agingCategory}
      Risk Level: ${analysis.riskLevel}
      Days in Pipeline: ${analysis.daysInPipeline}
      Days Since Contact: ${analysis.daysSinceLastContact}
      Conversion Probability: ${analysis.conversionProbability}%
      
      Create a 3-step action plan with:
      1. Immediate action (next 24-48 hours)
      2. Short-term strategy (next week)
      3. Long-term approach (next month)
      
      Include specific messaging suggestions and timing.
      `

      const actionPlan = await spark.llm(prompt, 'gpt-4o-mini')
      
      toast.success('AI Action Plan Generated', {
        description: 'Detailed recommendations created',
        action: {
          label: 'View',
          onClick: () => navigator.clipboard.writeText(actionPlan)
        }
      })
    } catch (error) {
      toast.error('Failed to generate action plan')
    } finally {
      setAIProcessing(false)
    }
  }

  const getAgingStats = () => {
    const periodDays = parseInt(selectedPeriod)
    const cutoffDate = subDays(new Date(), periodDays)
    const relevantAnalyses = agingAnalyses.filter(a => {
      const lead = leads.find(l => l.id === a.leadId)
      return lead && lead.createdAt >= cutoffDate
    })

    const totalLeads = relevantAnalyses.length
    const highRiskLeads = relevantAnalyses.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length
    const avgDaysInPipeline = totalLeads > 0 
      ? relevantAnalyses.reduce((sum, a) => sum + a.daysInPipeline, 0) / totalLeads 
      : 0
    const avgConversionProb = totalLeads > 0
      ? relevantAnalyses.reduce((sum, a) => sum + a.conversionProbability, 0) / totalLeads
      : 0

    const categoryDistribution = {
      new: relevantAnalyses.filter(a => a.agingCategory === 'new').length,
      warm: relevantAnalyses.filter(a => a.agingCategory === 'warm').length,
      cold: relevantAnalyses.filter(a => a.agingCategory === 'cold').length,
      frozen: relevantAnalyses.filter(a => a.agingCategory === 'frozen').length,
      stale: relevantAnalyses.filter(a => a.agingCategory === 'stale').length
    }

    return {
      totalLeads,
      highRiskLeads,
      avgDaysInPipeline: Math.round(avgDaysInPipeline),
      avgConversionProb: Math.round(avgConversionProb),
      categoryDistribution
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200'
      case 'warm': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'frozen': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'stale': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filteredAnalyses = agingAnalyses.filter(analysis => {
    if (selectedRisk === 'all') return true
    return analysis.riskLevel === selectedRisk
  })

  const stats = getAgingStats()

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskLeads}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Days in Pipeline</p>
                <p className="text-2xl font-bold">{stats.avgDaysInPipeline}</p>
              </div>
              <Timer className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversion Prob.</p>
                <p className="text-2xl font-bold">{stats.avgConversionProb}%</p>
              </div>
              <Target className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Aging Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm font-medium capitalize">{category}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Period:</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Risk Level:</label>
          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline"
          onClick={analyzeLeadAging}
          disabled={aiProcessing}
        >
          <Brain size={16} className="mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Aging Analysis List */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
                <p className="text-muted-foreground">No leads match the selected criteria</p>
              </div>
            ) : (
              filteredAnalyses
                .sort((a, b) => b.urgencyScore - a.urgencyScore)
                .map((analysis) => {
                  const lead = leads.find(l => l.id === analysis.leadId)
                  if (!lead) return null

                  return (
                    <div key={analysis.leadId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{lead.firstName} {lead.lastName}</h4>
                            <Badge className={getCategoryColor(analysis.agingCategory)}>
                              {analysis.agingCategory}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(analysis.riskLevel)}>
                              {analysis.riskLevel} risk
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {lead.company} • ${lead.estimatedValue.toLocaleString()} • Score: {lead.score}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Days in Pipeline:</span>
                              <div className="font-medium">{analysis.daysInPipeline} days</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Contact:</span>
                              <div className="font-medium">{analysis.daysSinceLastContact} days ago</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Conversion Prob:</span>
                              <div className="font-medium">{analysis.conversionProbability}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Urgency Score:</span>
                              <div className="font-medium">{Math.round(analysis.urgencyScore)}/100</div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <Progress value={analysis.urgencyScore} className="h-2" />
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateAIActionPlan(analysis)}
                            disabled={aiProcessing}
                          >
                            <Brain size={14} className="mr-1" />
                            AI Plan
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => onTakeAction?.(analysis.leadId, analysis.recommendedAction)}
                          >
                            Take Action
                          </Button>
                        </div>
                      </div>

                      <Alert className="border-blue-200 bg-blue-50">
                        <Lightbulb className="text-blue-600" size={16} />
                        <AlertDescription>
                          <div className="font-medium text-blue-800 mb-1">Recommended Action:</div>
                          <div className="text-blue-700">{analysis.recommendedAction}</div>
                        </AlertDescription>
                      </Alert>

                      {analysis.aiInsights.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium flex items-center gap-1">
                            <Brain size={14} />
                            AI Insights
                          </h5>
                          {analysis.aiInsights.map((insight, index) => (
                            <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Star className="text-yellow-500 mt-0.5" size={12} />
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}