import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  TrendUp, 
  Target, 
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  companyName?: string
  leadStatus: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
  leadRating: 'hot' | 'warm' | 'cold'
  leadPriority: 'high' | 'medium' | 'low'
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  leadSource: string
  createdAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  contactAttempts: number
  engagementScore: number
  tags: string[]
  industry?: string
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  affectedLeads: string[]
  suggestedAction?: string
  impact: {
    metric: string
    change: number
    timeframe: string
  }
}

interface LeadAIInsightsProps {
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
}

export function LeadAIInsights({ leads, onLeadUpdate }: LeadAIInsightsProps) {
  const insights = useMemo(() => {
    const generatedInsights: AIInsight[] = []
    
    // High-scoring leads not contacted recently
    const highScoreNotContacted = leads.filter(lead => 
      lead.aiLeadScore > 70 && 
      (!lead.lastContactDate || 
        new Date().getTime() - new Date(lead.lastContactDate).getTime() > 7 * 24 * 60 * 60 * 1000)
    )
    
    if (highScoreNotContacted.length > 0) {
      generatedInsights.push({
        id: 'high-score-neglected',
        type: 'opportunity',
        title: 'High-Value Leads Need Attention',
        description: `${highScoreNotContacted.length} high-scoring leads haven't been contacted in over a week`,
        priority: 'high',
        confidence: 85,
        actionable: true,
        affectedLeads: highScoreNotContacted.map(l => l.id),
        suggestedAction: 'Schedule immediate follow-up calls',
        impact: {
          metric: 'Conversion Rate',
          change: 15,
          timeframe: '30 days'
        }
      })
    }

    // Leads with declining engagement
    const decliningEngagement = leads.filter(lead => 
      lead.engagementScore < 30 && lead.contactAttempts > 2
    )
    
    if (decliningEngagement.length > 0) {
      generatedInsights.push({
        id: 'declining-engagement',
        type: 'warning',
        title: 'Engagement Dropping',
        description: `${decliningEngagement.length} leads showing declining engagement despite multiple contacts`,
        priority: 'medium',
        confidence: 78,
        actionable: true,
        affectedLeads: decliningEngagement.map(l => l.id),
        suggestedAction: 'Try different communication channels or personalized approach',
        impact: {
          metric: 'Lead Quality',
          change: -20,
          timeframe: 'ongoing'
        }
      })
    }

    // Source performance insights
    const sourcePerformance = leads.reduce((acc, lead) => {
      if (!acc[lead.leadSource]) {
        acc[lead.leadSource] = { count: 0, totalScore: 0, conversions: 0 }
      }
      acc[lead.leadSource].count++
      acc[lead.leadSource].totalScore += lead.aiLeadScore
      if (lead.leadStatus === 'converted') {
        acc[lead.leadSource].conversions++
      }
      return acc
    }, {} as Record<string, { count: number; totalScore: number; conversions: number }>)

    const bestSource = Object.entries(sourcePerformance)
      .map(([source, data]) => ({
        source,
        avgScore: data.totalScore / data.count,
        conversionRate: data.conversions / data.count,
        count: data.count
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)[0]

    if (bestSource && bestSource.count >= 3) {
      generatedInsights.push({
        id: 'best-source',
        type: 'recommendation',
        title: 'Optimize Lead Source Strategy',
        description: `${bestSource.source} is your best performing source with ${(bestSource.conversionRate * 100).toFixed(1)}% conversion rate`,
        priority: 'medium',
        confidence: 72,
        actionable: true,
        affectedLeads: [],
        suggestedAction: 'Increase investment in this lead source',
        impact: {
          metric: 'Lead Quality',
          change: 25,
          timeframe: '60 days'
        }
      })
    }

    // Industry trend insights
    const industryPerformance = leads.reduce((acc, lead) => {
      if (!lead.industry) return acc
      if (!acc[lead.industry]) {
        acc[lead.industry] = { count: 0, totalValue: 0, avgScore: 0 }
      }
      acc[lead.industry].count++
      acc[lead.industry].totalValue += lead.aiEstimatedDealValue
      acc[lead.industry].avgScore += lead.aiLeadScore
      return acc
    }, {} as Record<string, { count: number; totalValue: number; avgScore: number }>)

    const topIndustry = Object.entries(industryPerformance)
      .map(([industry, data]) => ({
        industry,
        avgValue: data.totalValue / data.count,
        avgScore: data.avgScore / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avgValue - a.avgValue)[0]

    if (topIndustry && topIndustry.count >= 2) {
      generatedInsights.push({
        id: 'industry-trend',
        type: 'trend',
        title: 'Industry Focus Opportunity',
        description: `${topIndustry.industry} leads show highest average deal value of $${Math.round(topIndustry.avgValue).toLocaleString()}`,
        priority: 'low',
        confidence: 65,
        actionable: true,
        affectedLeads: [],
        suggestedAction: 'Develop industry-specific marketing campaigns',
        impact: {
          metric: 'Deal Size',
          change: 30,
          timeframe: '90 days'
        }
      })
    }

    // Overdue follow-ups
    const overdueFollowups = leads.filter(lead => 
      lead.nextFollowUpDate && 
      new Date(lead.nextFollowUpDate) < new Date() &&
      lead.leadStatus !== 'converted' &&
      lead.leadStatus !== 'lost'
    )

    if (overdueFollowups.length > 0) {
      generatedInsights.push({
        id: 'overdue-followups',
        type: 'warning',
        title: 'Overdue Follow-ups',
        description: `${overdueFollowups.length} leads have overdue follow-up tasks`,
        priority: 'high',
        confidence: 95,
        actionable: true,
        affectedLeads: overdueFollowups.map(l => l.id),
        suggestedAction: 'Complete overdue follow-ups immediately',
        impact: {
          metric: 'Response Rate',
          change: -35,
          timeframe: 'immediate'
        }
      })
    }

    return generatedInsights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }, [leads])

  const handleApplyInsight = async (insight: AIInsight) => {
    switch (insight.id) {
      case 'high-score-neglected':
        // Update next follow-up date for affected leads
        insight.affectedLeads.forEach(leadId => {
          onLeadUpdate(leadId, {
            nextFollowUpDate: new Date().toISOString(),
            leadPriority: 'high'
          })
        })
        toast.success('Scheduled follow-ups for high-value leads')
        break
        
      case 'declining-engagement':
        // Mark leads for different approach
        insight.affectedLeads.forEach(leadId => {
          onLeadUpdate(leadId, {
            tags: ['needs-different-approach'],
            leadPriority: 'medium'
          })
        })
        toast.success('Tagged leads for different engagement approach')
        break
        
      case 'overdue-followups':
        // Reschedule overdue follow-ups
        insight.affectedLeads.forEach(leadId => {
          onLeadUpdate(leadId, {
            nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
          })
        })
        toast.success('Rescheduled overdue follow-ups')
        break
        
      default:
        toast.info(`Applied insight: ${insight.title}`)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendUp className="text-green-500" size={20} />
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />
      case 'recommendation': return <Brain className="text-blue-500" size={20} />
      case 'trend': return <Activity className="text-purple-500" size={20} />
      default: return <Star className="text-gray-500" size={20} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  // Calculate overall metrics
  const totalLeads = leads.length
  const avgScore = totalLeads > 0 ? leads.reduce((sum, lead) => sum + lead.aiLeadScore, 0) / totalLeads : 0
  const totalValue = leads.reduce((sum, lead) => sum + lead.aiEstimatedDealValue, 0)
  const highPriorityInsights = insights.filter(i => i.priority === 'high').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={20} />
          AI-Powered Lead Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
            <div className="text-sm text-blue-700">Total Leads</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round(avgScore)}</div>
            <div className="text-sm text-green-700">Avg AI Score</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(totalValue / 1000)}K
            </div>
            <div className="text-sm text-purple-700">Pipeline Value</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{insights.length}</div>
            <div className="text-sm text-orange-700">AI Insights</div>
          </div>
        </div>

        <Separator />

        {/* Priority Alert */}
        {highPriorityInsights > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={20} />
              <span className="font-medium text-red-800">
                {highPriorityInsights} High Priority Alert{highPriorityInsights > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-red-700">
              Immediate attention required for optimal lead management performance
            </p>
          </div>
        )}

        {/* Insights List */}
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border-l-4 rounded-lg ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold text-lg">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span className="font-medium">{insight.impact.metric}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {insight.impact.change > 0 ? (
                      <ArrowUp className="text-green-500" size={14} />
                    ) : (
                      <ArrowDown className="text-red-500" size={14} />
                    )}
                    <span className={insight.impact.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(insight.impact.change)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span className="text-muted-foreground">{insight.impact.timeframe}</span>
                  </div>
                </div>

                {/* Suggested Action */}
                {insight.suggestedAction && (
                  <div className="mb-3">
                    <p className="text-sm">
                      <span className="font-medium">Suggested Action:</span> {insight.suggestedAction}
                    </p>
                  </div>
                )}

                {/* Affected Leads */}
                {insight.affectedLeads.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">
                      Affects {insight.affectedLeads.length} lead{insight.affectedLeads.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {insight.actionable && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleApplyInsight(insight)}
                      size="sm"
                      variant={insight.priority === 'high' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                    >
                      <Zap size={14} />
                      Apply Recommendation
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
              <p className="text-sm">
                AI insights will appear here as your lead data grows and patterns emerge
              </p>
            </div>
          )}
        </div>

        {/* AI Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>AI analysis active</span>
            </div>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}