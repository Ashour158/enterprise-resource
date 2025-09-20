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
  Edit,
  Trash,
  Plus,
  Filter,
  Download,
  Share,
  ChartLine,
  UserPlus,
  Robot,
  Lightning,
  MagicWand,
  ThumbsUp,
  ThumbsDown,
  Warning,
  Bell
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  score: number
  temperature: 'hot' | 'warm' | 'cold'
  assignedTo: string
  estimatedValue: number
  probability: number
  expectedCloseDate?: string
  lastActivity?: string
  notes: string
  tags: string[]
  aiInsights?: {
    score: number
    sentiment: 'positive' | 'neutral' | 'negative'
    engagementLevel: number
    conversionProbability: number
    nextBestAction: string
    riskFactors: string[]
    opportunities: string[]
    predictedRevenue: number
    timeToClose: number
    competitorMentions?: string[]
    decisionMakers?: string[]
  }
  interactions: Array<{
    id: string
    type: 'call' | 'email' | 'meeting' | 'note'
    date: string
    duration?: number
    outcome: string
    nextAction?: string
  }>
  created: string
  updated: string
}

interface AIEnhancedLeadManagementProps {
  companyId: string
  userId: string
  userRole: string
  onScheduleMeeting?: (leadId: string) => void
  onCreateDeal?: (leadId: string) => void
}

export function AIEnhancedLeadManagement({ 
  companyId, 
  userId, 
  userRole,
  onScheduleMeeting,
  onCreateDeal 
}: AIEnhancedLeadManagementProps) {
  const [leads, setLeads] = useKV<Lead[]>(`enhanced-leads-${companyId}`, [])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [aiAnalysisMode, setAiAnalysisMode] = useState(false)
  const [bulkActionMode, setBulkActionMode] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: '',
    temperature: '',
    source: '',
    assignedTo: '',
    scoreRange: { min: 0, max: 100 }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'created' | 'updated' | 'estimatedValue' | 'probability'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFullView, setShowFullView] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)

  // AI-powered lead scoring and insights
  const generateAIInsights = async (lead: Lead) => {
    setLoadingAI(true)
    try {
      const prompt = spark.llmPrompt`
        Analyze this lead data and provide comprehensive insights:
        
        Lead Details:
        - Name: ${lead.name}
        - Company: ${lead.company || 'Not specified'}
        - Position: ${lead.position || 'Not specified'}
        - Email: ${lead.email}
        - Phone: ${lead.phone || 'Not provided'}
        - Source: ${lead.source}
        - Current Status: ${lead.status}
        - Current Score: ${lead.score}/100
        - Estimated Value: $${lead.estimatedValue}
        - Notes: ${lead.notes}
        - Tags: ${lead.tags.join(', ')}
        - Recent Interactions: ${lead.interactions.slice(-3).map(i => `${i.type}: ${i.outcome}`).join('; ')}
        
        Provide analysis in this exact JSON format:
        {
          "score": number (0-100),
          "sentiment": "positive" | "neutral" | "negative",
          "engagementLevel": number (0-100),
          "conversionProbability": number (0-100),
          "nextBestAction": "string describing recommended next action",
          "riskFactors": ["risk1", "risk2"],
          "opportunities": ["opportunity1", "opportunity2"],
          "predictedRevenue": number,
          "timeToClose": number (days),
          "competitorMentions": ["competitor1", "competitor2"],
          "decisionMakers": ["person1", "person2"]
        }
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      
      // Update lead with AI insights
      setLeads(currentLeads => 
        currentLeads.map(l => 
          l.id === lead.id 
            ? { ...l, aiInsights: insights, updated: new Date().toISOString() }
            : l
        )
      )
      
      toast.success('AI insights generated successfully')
      return insights
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights')
      return null
    } finally {
      setLoadingAI(false)
    }
  }

  // AI-powered bulk lead recommendations
  const generateBulkRecommendations = async () => {
    setLoadingAI(true)
    try {
      const filteredLeads = getFilteredLeads().slice(0, 10) // Analyze top 10 leads
      
      const prompt = spark.llmPrompt`
        Analyze these leads and provide bulk action recommendations:
        
        Leads Data:
        ${filteredLeads.map(lead => `
        Lead ${lead.id}: ${lead.name} (${lead.company}) - Status: ${lead.status}, Score: ${lead.score}, Value: $${lead.estimatedValue}
        Recent Activity: ${lead.lastActivity || 'None'}
        Notes: ${lead.notes}
        `).join('\n')}
        
        Provide recommendations in this JSON format:
        {
          "recommendations": [
            {
              "leadId": "string",
              "action": "string",
              "priority": "high" | "medium" | "low",
              "reasoning": "string",
              "expectedOutcome": "string",
              "timeline": "string"
            }
          ],
          "overallInsights": {
            "topPriorities": ["action1", "action2"],
            "riskAlert": "string",
            "opportunityAlert": "string"
          }
        }
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const recommendations = JSON.parse(response)
      
      setAiRecommendations(recommendations.recommendations || [])
      toast.success(`Generated ${recommendations.recommendations?.length || 0} AI recommendations`)
      
    } catch (error) {
      console.error('Error generating bulk recommendations:', error)
      toast.error('Failed to generate bulk recommendations')
    } finally {
      setLoadingAI(false)
    }
  }

  // Smart lead scoring using AI
  const calculateAIScore = async (lead: Lead) => {
    try {
      const prompt = spark.llmPrompt`
        Calculate a lead score (0-100) based on these factors:
        
        Lead Info:
        - Company Size: ${lead.company ? 'Known company' : 'Individual/Unknown'}
        - Position: ${lead.position || 'Not specified'}
        - Email Domain: ${lead.email.split('@')[1]}
        - Phone Provided: ${lead.phone ? 'Yes' : 'No'}
        - Source: ${lead.source}
        - Engagement: ${lead.interactions.length} interactions
        - Recent Activity: ${lead.lastActivity ? 'Active' : 'Inactive'}
        - Estimated Value: $${lead.estimatedValue}
        - Notes Quality: ${lead.notes.length > 50 ? 'Detailed' : 'Basic'}
        
        Return only a number between 0-100.
      `
      
      const scoreResponse = await spark.llm(prompt, 'gpt-4o-mini')
      const score = parseInt(scoreResponse.trim())
      
      if (!isNaN(score) && score >= 0 && score <= 100) {
        return score
      }
      return lead.score // Fallback to existing score
    } catch (error) {
      console.error('Error calculating AI score:', error)
      return lead.score
    }
  }

  // Filter and sort leads
  const getFilteredLeads = () => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !filters.status || lead.status === filters.status
      const matchesTemperature = !filters.temperature || lead.temperature === filters.temperature
      const matchesSource = !filters.source || lead.source === filters.source
      const matchesAssignee = !filters.assignedTo || lead.assignedTo === filters.assignedTo
      const matchesScore = lead.score >= filters.scoreRange.min && lead.score <= filters.scoreRange.max
      
      return matchesSearch && matchesStatus && matchesTemperature && matchesSource && matchesAssignee && matchesScore
    })

    // Sort leads
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'estimatedValue':
          aValue = a.estimatedValue
          bValue = b.estimatedValue
          break
        case 'probability':
          aValue = a.probability
          bValue = b.probability
          break
        case 'created':
          aValue = new Date(a.created).getTime()
          bValue = new Date(b.created).getTime()
          break
        case 'updated':
          aValue = new Date(a.updated).getTime()
          bValue = new Date(b.updated).getTime()
          break
        default:
          aValue = a.score
          bValue = b.score
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }

  // Create sample leads with AI insights
  useEffect(() => {
    if (leads.length === 0) {
      const sampleLeads: Lead[] = [
        {
          id: 'lead-001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@techcorp.com',
          phone: '+1-555-0123',
          company: 'TechCorp Solutions',
          position: 'VP of Operations',
          source: 'Website Form',
          status: 'qualified',
          score: 85,
          temperature: 'hot',
          assignedTo: userId,
          estimatedValue: 125000,
          probability: 75,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Called and scheduled demo',
          notes: 'Very interested in our enterprise solution. Has budget approved and looking to implement Q1.',
          tags: ['enterprise', 'high-value', 'decision-maker'],
          interactions: [
            {
              id: 'int-001',
              type: 'email',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              outcome: 'Sent product demo video',
              nextAction: 'Follow up on demo feedback'
            },
            {
              id: 'int-002',
              type: 'call',
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 45,
              outcome: 'Discussed requirements and pricing',
              nextAction: 'Send formal proposal'
            }
          ],
          created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated: new Date().toISOString()
        },
        {
          id: 'lead-002',
          name: 'Michael Chen',
          email: 'mchen@startup.io',
          phone: '+1-555-0456',
          company: 'InnovateStartup',
          position: 'CTO',
          source: 'LinkedIn',
          status: 'contacted',
          score: 72,
          temperature: 'warm',
          assignedTo: userId,
          estimatedValue: 45000,
          probability: 45,
          notes: 'Small startup but growing fast. Interested in our SMB package.',
          tags: ['startup', 'technical', 'budget-conscious'],
          interactions: [
            {
              id: 'int-003',
              type: 'email',
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              outcome: 'Initial outreach response',
              nextAction: 'Schedule discovery call'
            }
          ],
          created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setLeads(sampleLeads)
    }
  }, [leads.length, setLeads, userId])

  // Generate AI insights for all leads on component mount
  useEffect(() => {
    const generateInsightsForNewLeads = async () => {
      const leadsWithoutInsights = leads.filter(lead => !lead.aiInsights)
      for (const lead of leadsWithoutInsights.slice(0, 3)) { // Limit to 3 to avoid rate limits
        await generateAIInsights(lead)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit
      }
    }
    
    if (leads.length > 0) {
      generateInsightsForNewLeads()
    }
  }, [leads.length])

  const handleLeadClick = async (lead: Lead) => {
    setSelectedLead(lead)
    setShowFullView(true)
    
    // Generate or refresh AI insights when lead is opened
    if (!lead.aiInsights || Date.now() - new Date(lead.updated).getTime() > 24 * 60 * 60 * 1000) {
      await generateAIInsights(lead)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads first')
      return
    }

    switch (action) {
      case 'ai-score':
        setLoadingAI(true)
        for (const leadId of selectedLeads) {
          const lead = leads.find(l => l.id === leadId)
          if (lead) {
            const newScore = await calculateAIScore(lead)
            setLeads(currentLeads => 
              currentLeads.map(l => 
                l.id === leadId ? { ...l, score: newScore, updated: new Date().toISOString() } : l
              )
            )
          }
        }
        setLoadingAI(false)
        toast.success(`Updated AI scores for ${selectedLeads.length} leads`)
        break
      
      case 'ai-insights':
        setLoadingAI(true)
        for (const leadId of selectedLeads.slice(0, 5)) { // Limit to 5 for performance
          const lead = leads.find(l => l.id === leadId)
          if (lead) {
            await generateAIInsights(lead)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit
          }
        }
        setLoadingAI(false)
        toast.success(`Generated AI insights for ${Math.min(selectedLeads.length, 5)} leads`)
        break
      
      case 'export':
        const selectedLeadsData = leads.filter(l => selectedLeads.includes(l.id))
        const csvData = selectedLeadsData.map(lead => ({
          name: lead.name,
          email: lead.email,
          company: lead.company,
          status: lead.status,
          score: lead.score,
          estimatedValue: lead.estimatedValue,
          aiScore: lead.aiInsights?.score || 'N/A',
          conversionProbability: lead.aiInsights?.conversionProbability || 'N/A'
        }))
        console.log('Exporting leads:', csvData)
        toast.success(`Exported ${selectedLeads.length} leads`)
        break
    }
    
    setSelectedLeads([])
    setBulkActionMode(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'text-red-500'
      case 'warm': return 'text-orange-500'
      case 'cold': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const filteredLeads = getFilteredLeads()

  return (
    <div className="space-y-6">
      {/* AI-Powered Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">AI-Enhanced Lead Management</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkle size={12} />
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
            onClick={() => generateBulkRecommendations()}
            disabled={loadingAI}
            className="flex items-center gap-2"
          >
            <MagicWand size={16} />
            AI Recommendations
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkActionMode(!bulkActionMode)}
            className="flex items-center gap-2"
          >
            <CheckCircle size={16} />
            {bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      {aiRecommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightning className="h-5 w-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommended actions for your leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.slice(0, 6).map((rec, index) => {
                const lead = leads.find(l => l.id === rec.leadId)
                return (
                  <div key={index} className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{lead?.name || 'Unknown Lead'}</h4>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.action}</p>
                    <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        if (lead) handleLeadClick(lead)
                      }}
                    >
                      Take Action
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.temperature} onValueChange={(value) => setFilters(prev => ({ ...prev, temperature: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Temperature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">AI Score</SelectItem>
                <SelectItem value="estimatedValue">Est. Value</SelectItem>
                <SelectItem value="probability">Probability</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>

            <Badge variant="outline">
              {filteredLeads.length} of {leads.length} leads
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {bulkActionMode && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedLeads.length} lead(s) selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLeads(filteredLeads.map(l => l.id))}
                >
                  Select All ({filteredLeads.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLeads([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('ai-score')}
                  disabled={selectedLeads.length === 0 || loadingAI}
                  className="flex items-center gap-1"
                >
                  <Brain size={14} />
                  Update AI Scores
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('ai-insights')}
                  disabled={selectedLeads.length === 0 || loadingAI}
                  className="flex items-center gap-1"
                >
                  <Sparkle size={14} />
                  Generate Insights
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('export')}
                  disabled={selectedLeads.length === 0}
                  className="flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card 
            key={lead.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
            style={{ borderLeftColor: lead.temperature === 'hot' ? '#ef4444' : lead.temperature === 'warm' ? '#f97316' : '#3b82f6' }}
            onClick={() => handleLeadClick(lead)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                    {bulkActionMode && (
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          if (e.target.checked) {
                            setSelectedLeads(prev => [...prev, lead.id])
                          } else {
                            setSelectedLeads(prev => prev.filter(id => id !== lead.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">{lead.position}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${getTemperatureColor(lead.temperature)}`} />
                    <span className="text-xs text-muted-foreground">{lead.temperature}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* AI Score and Insights */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={lead.aiInsights?.score || lead.score} className="w-16 h-2" />
                  <span className="text-sm font-bold">{lead.aiInsights?.score || lead.score}</span>
                </div>
              </div>

              {lead.aiInsights && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Conversion Probability</span>
                    <span className="font-medium">{lead.aiInsights.conversionProbability}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Predicted Revenue</span>
                    <span className="font-medium">${lead.aiInsights.predictedRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Next Action:</strong> {lead.aiInsights.nextBestAction}
                  </div>
                </div>
              )}

              <Separator />

              {/* Lead Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Estimated Value</span>
                  <span className="font-medium">${lead.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Probability</span>
                  <span className="font-medium">{lead.probability}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Source</span>
                  <span className="font-medium">{lead.source}</span>
                </div>
              </div>

              {/* Tags */}
              {lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lead.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {lead.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{lead.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toast.success('Calling ' + lead.name) }}>
                    <Phone size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toast.success('Emailing ' + lead.name) }}>
                    <Mail size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onScheduleMeeting?.(lead.id) }}>
                    <Calendar size={14} />
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); onCreateDeal?.(lead.id) }}
                  className="flex items-center gap-1"
                >
                  <Target size={14} />
                  Create Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full View Dialog */}
      {selectedLead && (
        <Dialog open={showFullView} onOpenChange={setShowFullView}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedLead.name} - Full Lead Profile
                {selectedLead.aiInsights && (
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
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="notes">Notes & Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <p className="text-lg">{selectedLead.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p>{selectedLead.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <p>{selectedLead.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Company</label>
                            <p>{selectedLead.company || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Position</label>
                            <p>{selectedLead.position || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Source</label>
                            <p>{selectedLead.source}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lead Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Progress & Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge className={getStatusColor(selectedLead.status)}>
                              {selectedLead.status}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Temperature</label>
                            <div className="flex items-center gap-2">
                              <Star className={`h-4 w-4 ${getTemperatureColor(selectedLead.temperature)}`} />
                              <span>{selectedLead.temperature}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Lead Score</label>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedLead.score} className="flex-1" />
                              <span className="font-bold">{selectedLead.score}/100</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Probability</label>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedLead.probability} className="flex-1" />
                              <span className="font-bold">{selectedLead.probability}%</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Estimated Value</label>
                            <p className="text-lg font-bold text-green-600">
                              ${selectedLead.estimatedValue.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Expected Close</label>
                            <p>{selectedLead.expectedCloseDate ? new Date(selectedLead.expectedCloseDate).toLocaleDateString() : 'Not set'}</p>
                          </div>
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
                          Call Lead
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
                          <Target size={16} />
                          Convert to Deal
                        </Button>
                        <Separator />
                        <Button 
                          className="w-full justify-start gap-2" 
                          variant="outline"
                          onClick={() => generateAIInsights(selectedLead)}
                          disabled={loadingAI}
                        >
                          <Brain size={16} />
                          {loadingAI ? 'Generating...' : 'Refresh AI Insights'}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.tags.map((tag, index) => (
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
                {selectedLead.aiInsights ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Scores */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          AI Analysis Scores
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Overall AI Score</span>
                              <span className="text-sm font-bold">{selectedLead.aiInsights.score}/100</span>
                            </div>
                            <Progress value={selectedLead.aiInsights.score} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Engagement Level</span>
                              <span className="text-sm font-bold">{selectedLead.aiInsights.engagementLevel}/100</span>
                            </div>
                            <Progress value={selectedLead.aiInsights.engagementLevel} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Conversion Probability</span>
                              <span className="text-sm font-bold">{selectedLead.aiInsights.conversionProbability}%</span>
                            </div>
                            <Progress value={selectedLead.aiInsights.conversionProbability} className="h-2" />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Sentiment</span>
                            <Badge variant={
                              selectedLead.aiInsights.sentiment === 'positive' ? 'default' :
                              selectedLead.aiInsights.sentiment === 'neutral' ? 'secondary' : 'destructive'
                            }>
                              {selectedLead.aiInsights.sentiment}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Predicted Revenue</span>
                            <span className="text-sm font-bold text-green-600">
                              ${selectedLead.aiInsights.predictedRevenue?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Time to Close</span>
                            <span className="text-sm font-bold">
                              {selectedLead.aiInsights.timeToClose} days
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightning className="h-5 w-5 text-yellow-600" />
                          AI Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Next Best Action</h4>
                          <p className="text-sm text-green-700">{selectedLead.aiInsights.nextBestAction}</p>
                        </div>

                        {selectedLead.aiInsights.opportunities && selectedLead.aiInsights.opportunities.length > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              Opportunities
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {selectedLead.aiInsights.opportunities.map((opp, index) => (
                                <li key={index}>• {opp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedLead.aiInsights.riskFactors && selectedLead.aiInsights.riskFactors.length > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-1">
                              <Warning className="h-4 w-4" />
                              Risk Factors
                            </h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              {selectedLead.aiInsights.riskFactors.map((risk, index) => (
                                <li key={index}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedLead.aiInsights.competitorMentions && selectedLead.aiInsights.competitorMentions.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Competitors Mentioned</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.aiInsights.competitorMentions.map((comp, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedLead.aiInsights.decisionMakers && selectedLead.aiInsights.decisionMakers.length > 0 && (
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">Decision Makers</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.aiInsights.decisionMakers.map((dm, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {dm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Robot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate AI-powered insights to get recommendations and predictions for this lead.
                      </p>
                      <Button 
                        onClick={() => generateAIInsights(selectedLead)}
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
              
              <TabsContent value="interactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Interaction History</CardTitle>
                    <CardDescription>
                      Complete timeline of all interactions with this lead
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedLead.interactions.map((interaction) => (
                        <div key={interaction.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {interaction.type === 'call' && <Phone className="h-5 w-5 text-blue-600" />}
                            {interaction.type === 'email' && <Mail className="h-5 w-5 text-green-600" />}
                            {interaction.type === 'meeting' && <Calendar className="h-5 w-5 text-purple-600" />}
                            {interaction.type === 'note' && <Activity className="h-5 w-5 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium capitalize">{interaction.type}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(interaction.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{interaction.outcome}</p>
                            {interaction.duration && (
                              <Badge variant="outline" className="text-xs">
                                {interaction.duration} minutes
                              </Badge>
                            )}
                            {interaction.nextAction && (
                              <p className="text-xs text-blue-600 mt-1">
                                Next: {interaction.nextAction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <Button className="w-full" variant="outline">
                        <Plus size={16} className="mr-2" />
                        Add New Interaction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notes & Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add notes about this lead..."
                      defaultValue={selectedLead.notes}
                      className="min-h-32"
                    />
                    <div className="flex justify-end">
                      <Button>Save Notes</Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Follow-up Tasks</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Initial contact made</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">Schedule discovery call</span>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Plus size={14} className="mr-1" />
                          Add Task
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or search term'
                : 'Start by adding your first lead to begin tracking potential customers'
              }
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Your First Lead
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}