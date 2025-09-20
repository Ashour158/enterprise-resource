import React, { useState } from 'react'
import { AILeadInsight, Lead } from '@/types/lead'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Zap, 
  Brain, 
  TrendUp, 
  Target, 
  Star, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Lightbulb
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AILeadInsightsProps {
  insights: AILeadInsight[]
  leads: Lead[]
  onLeadSelect: (lead: Lead) => void
  companyId: string
}

export function AILeadInsights({ insights, leads, onLeadSelect, companyId }: AILeadInsightsProps) {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [generatedInsights, setGeneratedInsights] = useState<AILeadInsight[]>(insights)
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')

  // Generate comprehensive AI insights for all leads
  const generateComprehensiveInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      const newInsights: AILeadInsight[] = []
      
      for (const lead of leads.slice(0, 10)) { // Limit to first 10 for demo
        const prompt = spark.llmPrompt`
          Analyze this lead profile and provide strategic insights for sales optimization:
          
          Lead Profile:
          - Name: ${lead.full_name}
          - Job Title: ${lead.job_title}
          - Company: ${lead.company_name} (${lead.industry})
          - Company Size: ${lead.company_size}
          - Annual Revenue: $${lead.annual_revenue || 0}
          - Lead Score: ${lead.ai_lead_score}
          - Status: ${lead.lead_status}
          - Rating: ${lead.lead_rating}
          - Source: ${lead.utm_source}
          
          Engagement Data:
          - Email Opens: ${lead.email_opens}
          - Email Clicks: ${lead.email_clicks}
          - Website Visits: ${lead.website_visits}
          - Contact Attempts: ${lead.contact_attempts}
          - Engagement Score: ${lead.engagement_score}
          
          Current AI Analysis:
          - Conversion Probability: ${lead.ai_conversion_probability}
          - Estimated Deal Value: $${lead.ai_estimated_deal_value}
          - Buying Signals: ${lead.ai_buying_signals?.join(', ') || 'None'}
          - Next Best Action: ${lead.ai_next_best_action}
          
          Please provide insights in the following JSON format:
          {
            "insights": [
              {
                "insight_type": "behavioral_pattern|engagement_trend|buying_intent|competitive_risk|timing_opportunity",
                "insight_title": "Brief, actionable title",
                "insight_description": "Detailed analysis and reasoning",
                "confidence_score": 0.85,
                "priority": "high|medium|low",
                "suggested_actions": ["specific action 1", "specific action 2"],
                "potential_impact": "High potential revenue impact|Medium conversion boost|Low engagement improvement",
                "timeline": "immediate|this_week|this_month|next_quarter"
              }
            ]
          }
          
          Focus on providing 2-3 high-value insights per lead that would help sales reps prioritize and optimize their approach.
        `
        
        try {
          const response = await spark.llm(prompt, 'gpt-4o', true)
          const aiAnalysis = JSON.parse(response)
          
          if (aiAnalysis.insights && Array.isArray(aiAnalysis.insights)) {
            aiAnalysis.insights.forEach((insight: any) => {
              newInsights.push({
                lead_id: lead.id,
                insight_type: insight.insight_type,
                insight_title: insight.insight_title,
                insight_description: insight.insight_description,
                confidence_score: insight.confidence_score,
                suggested_actions: insight.suggested_actions,
                created_at: new Date().toISOString(),
                priority: insight.priority,
                potential_impact: insight.potential_impact,
                timeline: insight.timeline
              })
            })
          }
        } catch (error) {
          console.error(`Error generating insights for lead ${lead.id}:`, error)
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      setGeneratedInsights([...insights, ...newInsights])
      toast.success(`Generated ${newInsights.length} new AI insights`)
      
    } catch (error) {
      console.error('Error generating comprehensive insights:', error)
      toast.error('Failed to generate AI insights')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const handleActionClick = (insight: AILeadInsight, action: string) => {
    const lead = leads.find(l => l.id === insight.lead_id)
    if (!lead) return

    switch (action) {
      case 'view_lead':
        onLeadSelect(lead)
        break
      case 'call':
        toast.info(`Initiating call to ${lead.full_name}`)
        break
      case 'email':
        toast.info(`Composing email to ${lead.email}`)
        break
      case 'schedule':
        toast.info(`Opening calendar to schedule meeting with ${lead.full_name}`)
        break
      default:
        toast.info(`Executing: ${action} for ${lead.full_name}`)
        break
    }
  }

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral_pattern': return 'bg-blue-100 text-blue-800'
      case 'engagement_trend': return 'bg-green-100 text-green-800'
      case 'buying_intent': return 'bg-purple-100 text-purple-800'
      case 'competitive_risk': return 'bg-red-100 text-red-800'
      case 'timing_opportunity': return 'bg-orange-100 text-orange-800'
      case 'score_change': return 'bg-yellow-100 text-yellow-800'
      case 'buying_signal': return 'bg-emerald-100 text-emerald-800'
      case 'engagement_pattern': return 'bg-indigo-100 text-indigo-800'
      case 'next_action': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />
      case 'medium': return <Target size={16} className="text-yellow-500" />
      case 'low': return <CheckCircle size={16} className="text-green-500" />
      default: return <Target size={16} className="text-gray-500" />
    }
  }

  const filteredInsights = selectedInsightType === 'all' 
    ? generatedInsights 
    : generatedInsights.filter(insight => insight.insight_type === selectedInsightType)

  const insightTypeStats = {
    behavioral_pattern: generatedInsights.filter(i => i.insight_type === 'behavioral_pattern').length,
    engagement_trend: generatedInsights.filter(i => i.insight_type === 'engagement_trend' || i.insight_type === 'engagement_pattern').length,
    buying_intent: generatedInsights.filter(i => i.insight_type === 'buying_intent' || i.insight_type === 'buying_signal').length,
    competitive_risk: generatedInsights.filter(i => i.insight_type === 'competitive_risk').length,
    timing_opportunity: generatedInsights.filter(i => i.insight_type === 'timing_opportunity').length,
    score_changes: generatedInsights.filter(i => i.insight_type === 'score_change').length
  }

  return (
    <div className="space-y-6">
      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Insights</p>
                <p className="text-2xl font-bold">{generatedInsights.length}</p>
              </div>
              <div className="text-blue-600">
                <Brain size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {generatedInsights.filter(i => (i as any).priority === 'high').length}
                </p>
              </div>
              <div className="text-red-600">
                <AlertTriangle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buying Intent</p>
                <p className="text-2xl font-bold text-purple-600">{insightTypeStats.buying_intent}</p>
              </div>
              <div className="text-purple-600">
                <Target size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold text-green-600">{insightTypeStats.engagement_trend}</p>
              </div>
              <div className="text-green-600">
                <TrendUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Behavioral</p>
                <p className="text-2xl font-bold text-blue-600">{insightTypeStats.behavioral_pattern}</p>
              </div>
              <div className="text-blue-600">
                <Zap size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Changes</p>
                <p className="text-2xl font-bold text-yellow-600">{insightTypeStats.score_changes}</p>
              </div>
              <div className="text-yellow-600">
                <Star size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI Lead Insights Dashboard
              </CardTitle>
              <CardDescription>
                AI-powered insights to optimize lead conversion and engagement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={generateComprehensiveInsights}
                disabled={isGeneratingInsights}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={isGeneratingInsights ? 'animate-spin' : ''} />
                {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedInsightType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('all')}
            >
              All Insights ({generatedInsights.length})
            </Button>
            <Button
              variant={selectedInsightType === 'buying_intent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('buying_intent')}
            >
              Buying Intent ({insightTypeStats.buying_intent})
            </Button>
            <Button
              variant={selectedInsightType === 'engagement_trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('engagement_trend')}
            >
              Engagement ({insightTypeStats.engagement_trend})
            </Button>
            <Button
              variant={selectedInsightType === 'behavioral_pattern' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('behavioral_pattern')}
            >
              Behavioral ({insightTypeStats.behavioral_pattern})
            </Button>
            <Button
              variant={selectedInsightType === 'score_change' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('score_change')}
            >
              Score Changes ({insightTypeStats.score_changes})
            </Button>
          </div>

          {/* Insights List */}
          {isGeneratingInsights ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Generating AI Insights</h3>
              <p className="text-muted-foreground">
                Analyzing lead behavior patterns and engagement data...
              </p>
            </div>
          ) : filteredInsights.length > 0 ? (
            <div className="space-y-4">
              {filteredInsights.map((insight, index) => {
                const lead = leads.find(l => l.id === insight.lead_id)
                if (!lead) return null

                return (
                  <Card key={index} className="border border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {lead.first_name[0]}{lead.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{lead.full_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lead.job_title} at {lead.company_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(insight as any).priority && getPriorityIcon((insight as any).priority)}
                          <Badge className={getInsightTypeColor(insight.insight_type)}>
                            {insight.insight_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-lg">{insight.insight_title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.insight_description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Progress value={insight.confidence_score * 100} className="w-20 h-2" />
                            <span className="text-xs font-medium">
                              {(insight.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          {(insight as any).timeline && (
                            <Badge variant="outline" className="text-xs">
                              {(insight as any).timeline.replace('_', ' ')}
                            </Badge>
                          )}
                          
                          {(insight as any).potential_impact && (
                            <span className="text-xs text-muted-foreground">
                              Impact: {(insight as any).potential_impact}
                            </span>
                          )}
                        </div>

                        {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Lightbulb size={14} />
                              Recommended Actions:
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {insight.suggested_actions.map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActionClick(insight, action)}
                                  className="text-xs"
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            Generated {new Date(insight.created_at).toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLeadSelect(lead)}
                              className="text-xs"
                            >
                              <Eye size={14} className="mr-1" />
                              View Lead
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionClick(insight, 'call')}
                              className="text-xs"
                            >
                              <Phone size={14} className="mr-1" />
                              Call
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionClick(insight, 'email')}
                              className="text-xs"
                            >
                              <Mail size={14} className="mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No AI Insights Available</h3>
              <p className="text-muted-foreground mb-6">
                {selectedInsightType === 'all' 
                  ? 'Generate AI insights to get intelligent recommendations for your leads'
                  : `No ${selectedInsightType.replace('_', ' ')} insights found. Try generating new insights.`
                }
              </p>
              <Button 
                onClick={generateComprehensiveInsights}
                disabled={isGeneratingInsights}
                className="flex items-center gap-2"
              >
                <Brain size={16} />
                Generate AI Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}