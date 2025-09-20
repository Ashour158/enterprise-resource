import React, { useState, useEffect } from 'react'
import { Lead } from '@/types/lead'
import { mockLeadScoringRules } from '@/data/mockLeadData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Brain, 
  Target, 
  TrendUp, 
  Settings, 
  Plus, 
  Edit, 
  Trash,
  Star,
  Activity,
  Users,
  Building,
  Zap,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadScoringEngineProps {
  leads: Lead[]
  onLeadUpdate: (lead: Lead) => void
  companyId: string
  userId: string
  userRole: string
}

interface ScoringInsight {
  lead_id: string
  score_change: number
  reason: string
  confidence: number
  timestamp: string
}

export function LeadScoringEngine({ 
  leads, 
  onLeadUpdate, 
  companyId, 
  userId, 
  userRole 
}: LeadScoringEngineProps) {
  const [scoringRules, setScoringRules] = useState(mockLeadScoringRules)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [scoringInsights, setScoringInsights] = useState<ScoringInsight[]>([])
  const [newRule, setNewRule] = useState({
    rule_name: '',
    rule_type: 'demographic',
    criteria: '',
    score_value: 0,
    is_active: true
  })
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)

  // AI-powered lead scoring recalculation
  const recalculateLeadScores = async () => {
    setIsRecalculating(true)
    try {
      const insights: ScoringInsight[] = []
      
      for (const lead of leads) {
        const prompt = spark.llmPrompt`
          Calculate an AI lead score for this prospect based on the following data:
          
          Lead Information:
          - Name: ${lead.full_name}
          - Job Title: ${lead.job_title}
          - Company: ${lead.company_name}
          - Industry: ${lead.industry}
          - Company Size: ${lead.company_size}
          - Annual Revenue: $${lead.annual_revenue || 0}
          - Email Engagement: ${lead.email_opens} opens, ${lead.email_clicks} clicks
          - Website Visits: ${lead.website_visits}
          - Contact Attempts: ${lead.contact_attempts}
          - Lead Status: ${lead.lead_status}
          - Lead Rating: ${lead.lead_rating}
          - Source: UTM Source: ${lead.utm_source}, UTM Medium: ${lead.utm_medium}
          - Buying Signals: ${lead.ai_buying_signals?.join(', ') || 'None'}
          - Notes: ${lead.notes || 'None'}
          
          Current Score: ${lead.ai_lead_score}
          
          Scoring Criteria:
          1. Demographic Fit (0-25 points): Job title relevance, company size, industry match
          2. Engagement Level (0-25 points): Email opens/clicks, website visits, response rate
          3. Buying Intent (0-25 points): Buying signals, urgency indicators, timeline
          4. Firmographic Match (0-25 points): Company revenue, size, growth potential
          
          Please provide a JSON response with:
          {
            "new_score": 0-100,
            "score_breakdown": {
              "demographic_fit": 0-25,
              "engagement_level": 0-25,
              "buying_intent": 0-25,
              "firmographic_match": 0-25
            },
            "key_factors": ["factor1", "factor2", "factor3"],
            "score_change_reason": "Brief explanation of score change",
            "confidence": 0.0-1.0,
            "conversion_probability": 0.0-1.0,
            "estimated_deal_value": 0,
            "next_best_action": "Specific recommended next action"
          }
        `
        
        try {
          const response = await spark.llm(prompt, 'gpt-4o', true)
          const scoring = JSON.parse(response)
          
          const scoreChange = scoring.new_score - lead.ai_lead_score
          
          if (Math.abs(scoreChange) > 2) {
            insights.push({
              lead_id: lead.id,
              score_change: scoreChange,
              reason: scoring.score_change_reason,
              confidence: scoring.confidence,
              timestamp: new Date().toISOString()
            })
          }
          
          // Update lead with new AI scoring
          const updatedLead: Lead = {
            ...lead,
            ai_lead_score: scoring.new_score,
            ai_conversion_probability: scoring.conversion_probability,
            ai_estimated_deal_value: scoring.estimated_deal_value,
            ai_next_best_action: scoring.next_best_action,
            updated_at: new Date().toISOString()
          }
          
          onLeadUpdate(updatedLead)
          
        } catch (error) {
          console.error(`Error scoring lead ${lead.id}:`, error)
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setScoringInsights(insights)
      toast.success(`AI scoring completed. ${insights.length} leads updated.`)
      
    } catch (error) {
      console.error('Error recalculating lead scores:', error)
      toast.error('Failed to recalculate lead scores')
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleAddRule = () => {
    if (!newRule.rule_name.trim()) {
      toast.error('Rule name is required')
      return
    }

    const rule = {
      id: `rule-${Date.now()}`,
      company_id: companyId,
      rule_name: newRule.rule_name,
      rule_type: newRule.rule_type as any,
      criteria: JSON.parse(newRule.criteria || '{}'),
      score_value: newRule.score_value,
      is_active: newRule.is_active,
      ai_effectiveness_score: 0,
      created_by: userId,
      created_at: new Date().toISOString()
    }

    setScoringRules(prev => [...prev, rule])
    setNewRule({
      rule_name: '',
      rule_type: 'demographic',
      criteria: '',
      score_value: 0,
      is_active: true
    })
    setShowNewRuleForm(false)
    toast.success('Scoring rule added successfully')
  }

  const handleToggleRule = (ruleId: string) => {
    setScoringRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, is_active: !rule.is_active }
          : rule
      )
    )
  }

  const handleDeleteRule = (ruleId: string) => {
    setScoringRules(prev => prev.filter(rule => rule.id !== ruleId))
    toast.success('Scoring rule deleted')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'demographic': return 'bg-blue-100 text-blue-800'
      case 'behavioral': return 'bg-green-100 text-green-800'
      case 'engagement': return 'bg-purple-100 text-purple-800'
      case 'firmographic': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreDistribution = () => {
    const ranges = [
      { label: '80-100 (Hot)', min: 80, max: 100, color: 'bg-green-500' },
      { label: '60-79 (Warm)', min: 60, max: 79, color: 'bg-yellow-500' },
      { label: '40-59 (Cool)', min: 40, max: 59, color: 'bg-orange-500' },
      { label: '0-39 (Cold)', min: 0, max: 39, color: 'bg-red-500' }
    ]

    return ranges.map(range => {
      const count = leads.filter(lead => 
        lead.ai_lead_score >= range.min && lead.ai_lead_score <= range.max
      ).length
      const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0
      
      return { ...range, count, percentage }
    })
  }

  const topScoredLeads = [...leads]
    .sort((a, b) => b.ai_lead_score - a.ai_lead_score)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Scoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {leads.length > 0 
                    ? (leads.reduce((sum, lead) => sum + lead.ai_lead_score, 0) / leads.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
              <div className="text-primary">
                <Target size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Score Leads</p>
                <p className="text-2xl font-bold text-green-600">
                  {leads.filter(lead => lead.ai_lead_score >= 80).length}
                </p>
              </div>
              <div className="text-green-600">
                <Star size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">
                  {scoringRules.filter(rule => rule.is_active).length}
                </p>
              </div>
              <div className="text-blue-600">
                <Settings size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Updates</p>
                <p className="text-2xl font-bold">
                  {scoringInsights.length}
                </p>
              </div>
              <div className="text-purple-600">
                <TrendUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain size={16} />
              AI Scoring Dashboard
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings size={16} />
              Scoring Rules
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap size={16} />
              Scoring Insights
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Star size={16} />
              Lead Leaderboard
            </TabsTrigger>
          </TabsList>

          <Button 
            onClick={recalculateLeadScores}
            disabled={isRecalculating}
            className="flex items-center gap-2"
          >
            <Brain size={16} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate AI Scores'}
          </Button>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of lead scores across different ranges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getScoreDistribution().map((range, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{range.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {range.count} leads ({range.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${range.color}`}
                        style={{ width: `${range.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scoring Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring Performance</CardTitle>
                <CardDescription>
                  Effectiveness of scoring rules and AI predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Model Accuracy</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prediction Confidence</span>
                    <span className="text-sm font-medium">87.5%</span>
                  </div>
                  <Progress value={87.5} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Correlation</span>
                    <span className="text-sm font-medium">91.8%</span>
                  </div>
                  <Progress value={91.8} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">73%</div>
                      <div className="text-xs text-muted-foreground">Scores ≥80 Convert</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">23%</div>
                      <div className="text-xs text-muted-foreground">Scores &lt;40 Convert</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scoring Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scoring Activity</CardTitle>
              <CardDescription>
                Latest AI scoring updates and significant score changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRecalculating ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Recalculating lead scores...</p>
                </div>
              ) : scoringInsights.length > 0 ? (
                <div className="space-y-4">
                  {scoringInsights.slice(0, 10).map((insight, index) => {
                    const lead = leads.find(l => l.id === insight.lead_id)
                    if (!lead) return null

                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getScoreBgColor(lead.ai_lead_score)}`}>
                            <span className={getScoreColor(lead.ai_lead_score)}>
                              {Math.round(lead.ai_lead_score)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{lead.full_name}</div>
                            <div className="text-sm text-muted-foreground">{insight.reason}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${insight.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {insight.score_change > 0 ? '+' : ''}{insight.score_change.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground">
                    Click "Recalculate AI Scores" to generate new scoring insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Scoring Rules</h3>
              <p className="text-muted-foreground">
                Configure automated scoring rules and AI weighting
              </p>
            </div>
            <Button 
              onClick={() => setShowNewRuleForm(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Rule
            </Button>
          </div>

          {showNewRuleForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Scoring Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input
                      id="ruleName"
                      value={newRule.rule_name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, rule_name: e.target.value }))}
                      placeholder="e.g., Enterprise Company Size"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ruleType">Rule Type</Label>
                    <Select 
                      value={newRule.rule_type} 
                      onValueChange={(value) => setNewRule(prev => ({ ...prev, rule_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demographic">Demographic</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="firmographic">Firmographic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="criteria">Criteria (JSON)</Label>
                  <Input
                    id="criteria"
                    value={newRule.criteria}
                    onChange={(e) => setNewRule(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder='{"company_size": ["201-1000", "1000+"]}'
                  />
                </div>

                <div>
                  <Label htmlFor="scoreValue">Score Value</Label>
                  <Input
                    id="scoreValue"
                    type="number"
                    value={newRule.score_value}
                    onChange={(e) => setNewRule(prev => ({ ...prev, score_value: parseInt(e.target.value) }))}
                    placeholder="25"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active Rule</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddRule}>
                    Add Rule
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score Value</TableHead>
                    <TableHead>Effectiveness</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell>
                        <Badge className={getRuleTypeColor(rule.rule_type)}>
                          {rule.rule_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={rule.score_value > 0 ? 'text-green-600' : 'text-red-600'}>
                          {rule.score_value > 0 ? '+' : ''}{rule.score_value}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rule.ai_effectiveness_score || 0} className="w-16 h-2" />
                          <span className="text-sm">
                            {(rule.ai_effectiveness_score || 0).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Scoring Insights</CardTitle>
              <CardDescription>
                Real-time insights about lead scoring patterns and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoringInsights.length > 0 ? (
                <div className="space-y-4">
                  {scoringInsights.map((insight, index) => {
                    const lead = leads.find(l => l.id === insight.lead_id)
                    if (!lead) return null

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreBgColor(lead.ai_lead_score)}`}>
                              <span className={getScoreColor(lead.ai_lead_score)}>
                                {Math.round(lead.ai_lead_score)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{lead.full_name}</div>
                              <div className="text-sm text-muted-foreground">{lead.company_name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={insight.score_change > 0 ? "default" : "destructive"}>
                              {insight.score_change > 0 ? '+' : ''}{insight.score_change.toFixed(1)}
                            </Badge>
                            <div className="text-right text-xs text-muted-foreground">
                              {new Date(insight.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{insight.reason}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Progress value={insight.confidence * 100} className="w-20 h-2" />
                            <span className="text-xs">{(insight.confidence * 100).toFixed(0)}%</span>
                          </div>
                          
                          {insight.confidence > 0.8 && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle size={12} className="mr-1" />
                              High Confidence
                            </Badge>
                          )}
                          
                          {insight.confidence < 0.6 && (
                            <Badge variant="outline" className="text-yellow-600">
                              <AlertTriangle size={12} className="mr-1" />
                              Review Needed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground">
                    Run AI scoring to generate insights about score changes and patterns
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Scored Leads</CardTitle>
              <CardDescription>
                Highest scoring leads based on AI analysis and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topScoredLeads.map((lead, index) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-bold rounded-full text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getScoreBgColor(lead.ai_lead_score)}`}>
                          <span className={getScoreColor(lead.ai_lead_score)}>
                            {Math.round(lead.ai_lead_score)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{lead.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {lead.job_title} at {lead.company_name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {((lead.ai_conversion_probability || 0) * 100).toFixed(0)}% conversion
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${(lead.ai_estimated_deal_value || 0).toLocaleString()} est. value
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {lead.ai_buying_signals?.slice(0, 2).map((signal, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}