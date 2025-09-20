import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain, 
  TrendUp, 
  Target, 
  Clock, 
  Star, 
  Activity,
  Eye,
  Mail,
  Phone,
  Globe,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  jobTitle?: string
  leadStatus: string
  leadRating: string
  leadPriority: string
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  leadSource: string
  industry?: string
  companySize?: string
  annualRevenue?: number
  engagementScore: number
  contactAttempts: number
  createdAt: string
  lastContactDate?: string
  customFields: Record<string, any>
  tags: string[]
}

interface ScoringFactor {
  id: string
  name: string
  category: 'demographic' | 'behavioral' | 'engagement' | 'firmographic'
  weight: number
  value: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  confidence: number
}

interface AIInsight {
  id: string
  type: 'next_action' | 'buying_signal' | 'risk_factor' | 'opportunity'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  suggestedAction: string
  timing?: string
  channel?: string
}

interface AILeadScoringEngineProps {
  lead: Lead
  onScoreUpdate: (leadId: string, updates: Partial<Lead>) => void
  onInsightAction: (insight: AIInsight, action: string) => void
}

export function AILeadScoringEngine({ lead, onScoreUpdate, onInsightAction }: AILeadScoringEngineProps) {
  const [scoringFactors, setScoringFactors] = useState<ScoringFactor[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [personalityProfile, setPersonalityProfile] = useState<Record<string, any>>({})
  const [buyingSignals, setBuyingSignals] = useState<string[]>([])
  const [riskFactors, setRiskFactors] = useState<string[]>([])

  // Generate AI scoring analysis
  useEffect(() => {
    generateAIAnalysis()
  }, [lead])

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate scoring factors
      const factors = await generateScoringFactors(lead)
      setScoringFactors(factors)

      // Calculate overall score
      const totalScore = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0)
      const normalizedScore = Math.min(100, Math.max(0, totalScore))

      // Generate conversion probability
      const probability = calculateConversionProbability(factors, lead)

      // Estimate deal value
      const estimatedValue = estimateDealValue(lead, factors)

      // Generate AI insights
      const insights = await generateAIInsights(lead, factors)
      setAiInsights(insights)

      // Generate personality profile
      const profile = generatePersonalityProfile(lead)
      setPersonalityProfile(profile)

      // Detect buying signals
      const signals = detectBuyingSignals(lead, factors)
      setBuyingSignals(signals)

      // Identify risk factors
      const risks = identifyRiskFactors(lead, factors)
      setRiskFactors(risks)

      // Update lead with new AI data
      onScoreUpdate(lead.id, {
        aiLeadScore: Math.round(normalizedScore),
        aiConversionProbability: probability,
        aiEstimatedDealValue: estimatedValue
      })

    } catch (error) {
      console.error('AI analysis failed:', error)
      toast.error('Failed to analyze lead')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateScoringFactors = async (lead: Lead): Promise<ScoringFactor[]> => {
    const factors: ScoringFactor[] = []

    // Demographic factors
    if (lead.jobTitle) {
      const decisionMakerScore = calculateDecisionMakerScore(lead.jobTitle)
      factors.push({
        id: 'job-title',
        name: 'Job Title Authority',
        category: 'demographic',
        weight: 0.15,
        value: decisionMakerScore,
        impact: decisionMakerScore > 60 ? 'positive' : 'neutral',
        description: `${lead.jobTitle} indicates ${decisionMakerScore > 60 ? 'high' : 'moderate'} decision-making authority`,
        confidence: 0.85
      })
    }

    // Firmographic factors
    if (lead.companySize) {
      const sizeScore = calculateCompanySizeScore(lead.companySize)
      factors.push({
        id: 'company-size',
        name: 'Company Size Fit',
        category: 'firmographic',
        weight: 0.12,
        value: sizeScore,
        impact: sizeScore > 70 ? 'positive' : 'neutral',
        description: `Company size (${lead.companySize}) ${sizeScore > 70 ? 'matches' : 'partially matches'} ideal customer profile`,
        confidence: 0.90
      })
    }

    if (lead.industry) {
      const industryScore = calculateIndustryScore(lead.industry)
      factors.push({
        id: 'industry-fit',
        name: 'Industry Alignment',
        category: 'firmographic',
        weight: 0.10,
        value: industryScore,
        impact: industryScore > 70 ? 'positive' : 'neutral',
        description: `${lead.industry} industry shows ${industryScore > 70 ? 'strong' : 'moderate'} alignment with our solutions`,
        confidence: 0.80
      })
    }

    // Behavioral factors
    factors.push({
      id: 'engagement',
      name: 'Engagement Level',
      category: 'behavioral',
      weight: 0.20,
      value: lead.engagementScore,
      impact: lead.engagementScore > 60 ? 'positive' : lead.engagementScore < 30 ? 'negative' : 'neutral',
      description: `${lead.engagementScore}% engagement indicates ${lead.engagementScore > 60 ? 'high' : 'low'} interest level`,
      confidence: 0.95
    })

    const leadAge = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const timeScore = calculateTimeScore(leadAge, lead.contactAttempts)
    factors.push({
      id: 'timing',
      name: 'Lead Freshness',
      category: 'behavioral',
      weight: 0.08,
      value: timeScore,
      impact: timeScore > 70 ? 'positive' : timeScore < 40 ? 'negative' : 'neutral',
      description: `Lead is ${leadAge} days old with ${lead.contactAttempts} contact attempts`,
      confidence: 0.75
    })

    // Source quality
    const sourceScore = calculateSourceScore(lead.leadSource)
    factors.push({
      id: 'source-quality',
      name: 'Lead Source Quality',
      category: 'demographic',
      weight: 0.10,
      value: sourceScore,
      impact: sourceScore > 70 ? 'positive' : 'neutral',
      description: `${lead.leadSource} is a ${sourceScore > 70 ? 'high' : 'moderate'} quality lead source`,
      confidence: 0.85
    })

    // Budget indicators
    if (lead.customFields?.budget) {
      const budgetScore = calculateBudgetScore(lead.customFields.budget)
      factors.push({
        id: 'budget-fit',
        name: 'Budget Alignment',
        category: 'firmographic',
        weight: 0.15,
        value: budgetScore,
        impact: budgetScore > 70 ? 'positive' : budgetScore < 40 ? 'negative' : 'neutral',
        description: `Budget range (${lead.customFields.budget}) ${budgetScore > 70 ? 'aligns well' : 'partially aligns'} with our pricing`,
        confidence: 0.80
      })
    }

    // Timeline urgency
    if (lead.customFields?.timeline) {
      const timelineScore = calculateTimelineScore(lead.customFields.timeline)
      factors.push({
        id: 'timeline-urgency',
        name: 'Purchase Timeline',
        category: 'behavioral',
        weight: 0.10,
        value: timelineScore,
        impact: timelineScore > 70 ? 'positive' : 'neutral',
        description: `Purchase timeline (${lead.customFields.timeline}) indicates ${timelineScore > 70 ? 'urgent' : 'moderate'} need`,
        confidence: 0.75
      })
    }

    return factors
  }

  const generateAIInsights = async (lead: Lead, factors: ScoringFactor[]): Promise<AIInsight[]> => {
    const insights: AIInsight[] = []

    // Next best action recommendations
    const engagementFactor = factors.find(f => f.id === 'engagement')
    if (engagementFactor && engagementFactor.value < 30) {
      insights.push({
        id: 'low-engagement',
        type: 'next_action',
        title: 'Re-engage with personalized content',
        description: 'Low engagement score suggests need for more targeted communication',
        confidence: 0.85,
        priority: 'high',
        suggestedAction: 'Send personalized email with industry-specific case study',
        timing: 'Within 24 hours',
        channel: 'Email'
      })
    }

    // Buying signals
    if (lead.customFields?.timeline && lead.customFields.timeline.includes('Q1')) {
      insights.push({
        id: 'urgent-timeline',
        type: 'buying_signal',
        title: 'Urgent purchase timeline detected',
        description: 'Lead has indicated Q1 timeline, suggesting active buying process',
        confidence: 0.90,
        priority: 'high',
        suggestedAction: 'Schedule demo call within 3 days',
        timing: 'Immediate',
        channel: 'Phone'
      })
    }

    // Risk factors
    if (lead.contactAttempts > 5 && !lead.lastContactDate) {
      insights.push({
        id: 'high-contact-attempts',
        type: 'risk_factor',
        title: 'Multiple unsuccessful contact attempts',
        description: 'High contact attempts without response may indicate disinterest',
        confidence: 0.75,
        priority: 'medium',
        suggestedAction: 'Try alternative contact method or pause outreach',
        timing: 'Next business day',
        channel: 'LinkedIn'
      })
    }

    // Opportunities
    const budgetFactor = factors.find(f => f.id === 'budget-fit')
    if (budgetFactor && budgetFactor.value > 80) {
      insights.push({
        id: 'budget-opportunity',
        type: 'opportunity',
        title: 'Strong budget alignment detected',
        description: 'Lead\'s budget range aligns perfectly with our premium offerings',
        confidence: 0.88,
        priority: 'high',
        suggestedAction: 'Present premium solution package',
        timing: 'During next interaction',
        channel: 'Demo'
      })
    }

    return insights
  }

  const calculateConversionProbability = (factors: ScoringFactor[], lead: Lead): number => {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0)
    const weightedScore = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0)
    const normalizedScore = weightedScore / (totalWeight * 100)

    // Apply industry-specific multipliers
    let industryMultiplier = 1.0
    if (lead.industry === 'Technology') industryMultiplier = 1.2
    if (lead.industry === 'Healthcare') industryMultiplier = 1.1
    if (lead.industry === 'Finance') industryMultiplier = 1.15

    // Apply lead age penalty
    const leadAge = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const agePenalty = leadAge > 30 ? 0.9 : leadAge > 14 ? 0.95 : 1.0

    return Math.min(0.95, Math.max(0.05, normalizedScore * industryMultiplier * agePenalty))
  }

  const estimateDealValue = (lead: Lead, factors: ScoringFactor[]): number => {
    let baseValue = 50000 // Default base value

    // Company size multiplier
    if (lead.companySize) {
      const sizeMultipliers: Record<string, number> = {
        '1-10': 0.5,
        '11-50': 0.8,
        '51-200': 1.2,
        '201-1000': 2.0,
        '1000+': 3.5
      }
      baseValue *= sizeMultipliers[lead.companySize] || 1.0
    }

    // Industry multiplier
    if (lead.industry) {
      const industryMultipliers: Record<string, number> = {
        'Technology': 1.5,
        'Finance': 2.0,
        'Healthcare': 1.8,
        'Manufacturing': 1.3,
        'Retail': 1.0
      }
      baseValue *= industryMultipliers[lead.industry] || 1.0
    }

    // Budget alignment
    if (lead.customFields?.budget) {
      const budgetValue = extractBudgetValue(lead.customFields.budget)
      if (budgetValue > 0) {
        baseValue = Math.min(baseValue, budgetValue * 1.2) // Cap at 120% of stated budget
      }
    }

    // AI score multiplier
    const scoreMultiplier = 0.5 + (lead.aiLeadScore / 100) // 0.5 to 1.5
    baseValue *= scoreMultiplier

    return Math.round(baseValue)
  }

  const generatePersonalityProfile = (lead: Lead): Record<string, any> => {
    // Simulate AI personality analysis based on available data
    const profile: Record<string, any> = {
      communicationStyle: 'Professional',
      decisionMakingStyle: 'Analytical',
      riskTolerance: 'Moderate',
      preferredChannels: ['Email', 'Phone'],
      bestContactTimes: ['9-11 AM', '2-4 PM'],
      personalityTraits: []
    }

    // Infer traits from job title
    if (lead.jobTitle?.toLowerCase().includes('cto') || lead.jobTitle?.toLowerCase().includes('technical')) {
      profile.personalityTraits.push('Detail-oriented', 'Technical', 'Cautious')
      profile.decisionMakingStyle = 'Technical'
    } else if (lead.jobTitle?.toLowerCase().includes('ceo') || lead.jobTitle?.toLowerCase().includes('founder')) {
      profile.personalityTraits.push('Decisive', 'Strategic', 'Results-driven')
      profile.decisionMakingStyle = 'Quick'
    }

    // Infer from engagement patterns
    if (lead.engagementScore > 70) {
      profile.personalityTraits.push('Engaged', 'Responsive')
      profile.communicationStyle = 'Active'
    }

    return profile
  }

  const detectBuyingSignals = (lead: Lead, factors: ScoringFactor[]): string[] => {
    const signals: string[] = []

    if (lead.customFields?.timeline) {
      signals.push(`Active timeline: ${lead.customFields.timeline}`)
    }

    if (lead.customFields?.budget) {
      signals.push(`Budget defined: ${lead.customFields.budget}`)
    }

    if (lead.engagementScore > 70) {
      signals.push('High engagement level')
    }

    if (lead.contactAttempts > 0 && lead.lastContactDate) {
      signals.push('Responsive to outreach')
    }

    const jobTitleFactor = factors.find(f => f.id === 'job-title')
    if (jobTitleFactor && jobTitleFactor.value > 70) {
      signals.push('Decision-maker authority')
    }

    return signals
  }

  const identifyRiskFactors = (lead: Lead, factors: ScoringFactor[]): string[] => {
    const risks: string[] = []

    if (lead.contactAttempts > 5 && !lead.lastContactDate) {
      risks.push('Multiple unsuccessful contact attempts')
    }

    const leadAge = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (leadAge > 30) {
      risks.push('Lead is aging without progression')
    }

    if (lead.engagementScore < 30) {
      risks.push('Low engagement score')
    }

    const budgetFactor = factors.find(f => f.id === 'budget-fit')
    if (budgetFactor && budgetFactor.value < 40) {
      risks.push('Budget misalignment')
    }

    return risks
  }

  // Helper functions
  const calculateDecisionMakerScore = (jobTitle: string): number => {
    const title = jobTitle.toLowerCase()
    if (title.includes('ceo') || title.includes('founder') || title.includes('president')) return 95
    if (title.includes('cto') || title.includes('cmo') || title.includes('cfo')) return 90
    if (title.includes('vp') || title.includes('vice president')) return 85
    if (title.includes('director')) return 75
    if (title.includes('manager')) return 60
    if (title.includes('senior')) return 50
    return 30
  }

  const calculateCompanySizeScore = (size: string): number => {
    const sizeScores: Record<string, number> = {
      '1-10': 40,
      '11-50': 70,
      '51-200': 85,
      '201-1000': 95,
      '1000+': 100
    }
    return sizeScores[size] || 50
  }

  const calculateIndustryScore = (industry: string): number => {
    const industryScores: Record<string, number> = {
      'Technology': 95,
      'Finance': 90,
      'Healthcare': 85,
      'Manufacturing': 75,
      'Retail': 70,
      'Education': 65
    }
    return industryScores[industry] || 60
  }

  const calculateTimeScore = (leadAge: number, contactAttempts: number): number => {
    let score = 100
    if (leadAge > 30) score -= 40
    else if (leadAge > 14) score -= 20
    else if (leadAge > 7) score -= 10

    if (contactAttempts === 0) score -= 30
    else if (contactAttempts > 5) score -= 20

    return Math.max(0, score)
  }

  const calculateSourceScore = (source: string): number => {
    const sourceScores: Record<string, number> = {
      'Website': 85,
      'Referral': 95,
      'LinkedIn': 80,
      'Trade Show': 75,
      'Email Campaign': 70,
      'Cold Call': 45,
      'Social Media': 60
    }
    return sourceScores[source] || 50
  }

  const calculateBudgetScore = (budget: string): number => {
    const budgetValue = extractBudgetValue(budget)
    if (budgetValue >= 100000) return 95
    if (budgetValue >= 50000) return 85
    if (budgetValue >= 25000) return 70
    if (budgetValue >= 10000) return 55
    return 30
  }

  const calculateTimelineScore = (timeline: string): number => {
    const timelineScores: Record<string, number> = {
      'Q1 2024': 95,
      'Q2 2024': 85,
      'Q3 2024': 70,
      'Q4 2024': 60,
      '2024': 50,
      'Immediate': 100,
      'ASAP': 100
    }
    return timelineScores[timeline] || 40
  }

  const extractBudgetValue = (budget: string): number => {
    const match = budget.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)[Kk]?/)
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ''))
      if (budget.toLowerCase().includes('k')) value *= 1000
      return value
    }
    return 0
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* AI Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-500" size={20} />
            AI Lead Analysis
            {isAnalyzing && (
              <Badge variant="outline" className="ml-2">
                <Activity className="mr-1 animate-spin" size={12} />
                Analyzing...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(lead.aiLeadScore)}`}>
                {lead.aiLeadScore}
              </div>
              <div className="text-sm text-muted-foreground">AI Lead Score</div>
              <Progress value={lead.aiLeadScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(lead.aiConversionProbability * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Probability</div>
              <Progress value={lead.aiConversionProbability * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${lead.aiEstimatedDealValue?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Estimated Deal Value</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Based on company profile and scoring factors
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Brain size={16} />
              Re-analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={20} />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {insight.type === 'next_action' && <Target className="text-blue-500" size={16} />}
                      {insight.type === 'buying_signal' && <TrendUp className="text-green-500" size={16} />}
                      {insight.type === 'risk_factor' && <AlertTriangle className="text-red-500" size={16} />}
                      {insight.type === 'opportunity' && <Star className="text-yellow-500" size={16} />}
                      <h4 className="font-medium">{insight.title}</h4>
                    </div>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                      {insight.timing && <span>Timing: {insight.timing}</span>}
                      {insight.channel && <span>Channel: {insight.channel}</span>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onInsightAction(insight, insight.suggestedAction)}
                    >
                      {insight.suggestedAction}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buying Signals & Risk Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buyingSignals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Buying Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {buyingSignals.map((signal, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-500" size={14} />
                    {signal}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {riskFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="text-red-500" size={14} />
                    {risk}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analysis Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detailed AI Analysis - {lead.firstName} {lead.lastName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <Tabs defaultValue="factors" className="space-y-4">
              <TabsList>
                <TabsTrigger value="factors">Scoring Factors</TabsTrigger>
                <TabsTrigger value="personality">Personality Profile</TabsTrigger>
                <TabsTrigger value="timeline">Engagement Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="factors" className="space-y-4">
                <div className="space-y-4">
                  {scoringFactors.map((factor) => (
                    <div key={factor.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{factor.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{factor.category}</Badge>
                          <Badge variant={getScoreBadgeVariant(factor.value)}>
                            {Math.round(factor.value)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Weight: {Math.round(factor.weight * 100)}%</span>
                        <span>Confidence: {Math.round(factor.confidence * 100)}%</span>
                        <span>Impact: {factor.impact}</span>
                      </div>
                      <Progress value={factor.value} className="mt-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="personality" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Communication Style</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{personalityProfile.communicationStyle}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Decision Making</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{personalityProfile.decisionMakingStyle}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preferred Channels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {personalityProfile.preferredChannels?.map((channel: string, index: number) => (
                          <Badge key={index} variant="outline">{channel}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Best Contact Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {personalityProfile.bestContactTimes?.map((time: string, index: number) => (
                          <Badge key={index} variant="outline">{time}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {personalityProfile.personalityTraits?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personality Traits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {personalityProfile.personalityTraits.map((trait: string, index: number) => (
                          <Badge key={index} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Engagement Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Lead Created:</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                      {lead.lastContactDate && (
                        <div className="flex justify-between">
                          <span>Last Contact:</span>
                          <span>{new Date(lead.lastContactDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Contact Attempts:</span>
                        <span>{lead.contactAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Engagement:</span>
                        <span>{lead.engagementScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}