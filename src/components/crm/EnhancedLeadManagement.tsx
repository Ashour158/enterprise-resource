import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { FileAttachmentSystem } from '@/components/shared/FileAttachmentSystem'
import { mockLeads } from '@/data/crmMockData'
import { Lead, LeadStatus, LeadSource } from '@/types/crm'
import { 
  Plus, 
  Pencil, 
  Trash, 
  UserPlus, 
  Phone, 
  EnvelopeSimple as Mail, 
  Calendar,
  TrendUp,
  MagnifyingGlass as Search,
  Filter,
  SortAscending as Sort,
  Eye,
  Star,
  Target,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Warning as AlertTriangle,
  Brain,
  Robot,
  Lightbulb,
  ChartLine,
  ArrowRight,
  Download,
  Share,
  Flag,
  MapPin,
  Briefcase,
  Globe,
  Lightning,
  Magic,
  Sparkle,
  ChatText,
  PersonSimpleRun as PersonIcon,
  Buildings,
  CurrencyDollar,
  ThumbsUp,
  ThumbsDown,
  ClockCounterClockwise,
  Confetti,
  ShieldCheck,
  Checks
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EnhancedLeadManagementProps {
  companyId: string
  userId: string
  userRole: string
  onScheduleMeeting?: (leadId: string) => void
  onCreateDeal?: (leadId: string) => void
}

interface AIInsight {
  id: string
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization'
  title: string
  description: string
  confidence: number
  actionable: boolean
  action?: () => void
  impact: 'high' | 'medium' | 'low'
}

interface LeadAIProfile {
  buyingSignals: string[]
  engagementScore: number
  conversionProbability: number
  nextBestAction: string
  personalityProfile: string
  communicationPreference: string
  decisionMakerLikelihood: number
  budgetProbability: number
  timeframePrediction: string
  competitorThreat: number
  aiNotes: string[]
}

export function EnhancedLeadManagement({ companyId, userId, userRole, onScheduleMeeting, onCreateDeal }: EnhancedLeadManagementProps) {
  const [leads, setLeads] = useKV<Lead[]>(`enhanced-leads-${companyId}`, mockLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('cards')
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState([0, 100])
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [leadAIProfiles, setLeadAIProfiles] = useKV<Record<string, LeadAIProfile>>(`lead-ai-profiles-${companyId}`, {})
  const [aiProcessing, setAIProcessing] = useState(false)
  const [bulkOperations, setBulkOperations] = useState<string[]>([])

  // AI-powered lead scoring and insights
  useEffect(() => {
    generateAIInsights()
    updateLeadScores()
  }, [leads])

  const generateAIInsights = async () => {
    if (!leads?.length) return

    setAIProcessing(true)
    try {
      // Simulate AI analysis
      const insights: AIInsight[] = [
        {
          id: 'insight-1',
          type: 'prediction',
          title: 'High-Value Lead Identified',
          description: `${leads.find(l => l.estimatedValue > 40000)?.firstName || 'John'} Smith shows 85% conversion probability based on engagement patterns`,
          confidence: 85,
          actionable: true,
          action: () => setSelectedLead(leads.find(l => l.estimatedValue > 40000) || leads[0]),
          impact: 'high'
        },
        {
          id: 'insight-2',
          type: 'recommendation',
          title: 'Optimal Contact Time',
          description: 'Tuesday 2-4 PM shows 40% higher response rates for enterprise leads',
          confidence: 78,
          actionable: true,
          impact: 'medium'
        },
        {
          id: 'insight-3',
          type: 'alert',
          title: 'Follow-up Required',
          description: `${leads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate < new Date()).length} leads need immediate follow-up`,
          confidence: 100,
          actionable: true,
          impact: 'high'
        },
        {
          id: 'insight-4',
          type: 'optimization',
          title: 'Email Subject Line Optimization',
          description: 'Personalized subject lines increase open rates by 26% for your industry',
          confidence: 92,
          actionable: true,
          impact: 'medium'
        }
      ]
      setAIInsights(insights)
    } catch (error) {
      console.error('AI insights generation failed:', error)
    } finally {
      setAIProcessing(false)
    }
  }

  const updateLeadScores = async () => {
    if (!leads?.length) return

    const updatedProfiles: Record<string, LeadAIProfile> = {}

    leads.forEach(lead => {
      // AI-generated lead profile
      const profile: LeadAIProfile = {
        buyingSignals: [
          'Downloaded pricing guide',
          'Visited enterprise features page',
          'Opened 3+ emails'
        ],
        engagementScore: Math.floor(Math.random() * 40) + 60,
        conversionProbability: Math.floor(Math.random() * 30) + 70,
        nextBestAction: getNextBestAction(lead),
        personalityProfile: getPersonalityProfile(),
        communicationPreference: getCommunicationPreference(),
        decisionMakerLikelihood: Math.floor(Math.random() * 40) + 60,
        budgetProbability: Math.floor(Math.random() * 30) + 70,
        timeframePrediction: getTimeframePrediction(),
        competitorThreat: Math.floor(Math.random() * 50) + 25,
        aiNotes: [
          'Shows strong buying intent based on website behavior',
          'Company is in growth phase - good timing',
          'Previous interactions suggest price sensitivity'
        ]
      }
      updatedProfiles[lead.id] = profile
    })

    setLeadAIProfiles(updatedProfiles)
  }

  const getNextBestAction = (lead: Lead): string => {
    const actions = [
      'Send personalized demo invitation',
      'Schedule discovery call',
      'Share case study relevant to their industry',
      'Send competitive comparison guide',
      'Follow up on pricing discussion'
    ]
    return actions[Math.floor(Math.random() * actions.length)]
  }

  const getPersonalityProfile = (): string => {
    const profiles = [
      'Analytical - prefers data-driven decisions',
      'Relationship-focused - values trust and connection',
      'Results-oriented - focuses on ROI and outcomes',
      'Innovation-driven - interested in cutting-edge solutions'
    ]
    return profiles[Math.floor(Math.random() * profiles.length)]
  }

  const getCommunicationPreference = (): string => {
    const preferences = ['Email', 'Phone calls', 'Video meetings', 'In-person meetings', 'Text messages']
    return preferences[Math.floor(Math.random() * preferences.length)]
  }

  const getTimeframePrediction = (): string => {
    const timeframes = ['0-30 days', '1-3 months', '3-6 months', '6+ months']
    return timeframes[Math.floor(Math.random() * timeframes.length)]
  }

  const generateAIRecommendation = async (leadId: string) => {
    const lead = leads?.find(l => l.id === leadId)
    if (!lead) return

    const prompt = spark.llmPrompt`
    Analyze this lead and provide personalized recommendations:
    
    Lead: ${lead.firstName} ${lead.lastName}
    Company: ${lead.company}
    Title: ${lead.title}
    Source: ${lead.source}
    Current Score: ${lead.score}
    Estimated Value: $${lead.estimatedValue}
    Notes: ${lead.notes}
    
    Provide specific recommendations for:
    1. Next best action
    2. Email subject line
    3. Meeting talking points
    4. Potential objections to prepare for
    `

    try {
      setAIProcessing(true)
      const recommendation = await spark.llm(prompt, 'gpt-4o-mini')
      
      toast.success('AI recommendation generated', {
        description: 'Check the AI insights panel for detailed recommendations',
        action: {
          label: 'View',
          onClick: () => setShowAIInsights(true)
        }
      })

      // Add to AI insights
      setAIInsights(prev => [...prev, {
        id: `rec-${Date.now()}`,
        type: 'recommendation',
        title: `AI Recommendation for ${lead.firstName} ${lead.lastName}`,
        description: recommendation.slice(0, 150) + '...',
        confidence: 88,
        actionable: true,
        impact: 'high'
      }])
    } catch (error) {
      toast.error('Failed to generate AI recommendation')
    } finally {
      setAIProcessing(false)
    }
  }

  const generateLeadEmail = async (leadId: string, type: 'follow-up' | 'introduction' | 'demo') => {
    const lead = leads?.find(l => l.id === leadId)
    if (!lead) return

    const prompt = spark.llmPrompt`
    Generate a personalized ${type} email for this lead:
    
    Lead: ${lead.firstName} ${lead.lastName}
    Company: ${lead.company}
    Title: ${lead.title}
    Industry: ${lead.customFields?.industry || 'Unknown'}
    Notes: ${lead.notes}
    
    Write a professional, engaging email that:
    1. Addresses their specific needs
    2. References their industry context
    3. Includes a clear call-to-action
    4. Maintains a conversational tone
    
    Include subject line and email body.
    `

    try {
      setAIProcessing(true)
      const emailContent = await spark.llm(prompt, 'gpt-4o-mini')
      
      // In real implementation, this would open email composer
      toast.success('AI-generated email ready', {
        description: 'Email draft has been created with personalized content',
        action: {
          label: 'Copy',
          onClick: () => navigator.clipboard.writeText(emailContent)
        }
      })
    } catch (error) {
      toast.error('Failed to generate email content')
    } finally {
      setAIProcessing(false)
    }
  }

  const predictLeadConversion = async (leadId: string) => {
    const lead = leads?.find(l => l.id === leadId)
    const profile = leadAIProfiles[leadId]
    if (!lead || !profile) return

    const factors = {
      score: lead.score,
      engagementScore: profile.engagementScore,
      estimatedValue: lead.estimatedValue,
      source: lead.source,
      daysSinceCreated: Math.floor((new Date().getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Simulate ML prediction
    const prediction = Math.min(95, Math.max(15, 
      (factors.score * 0.3) + 
      (factors.engagementScore * 0.25) +
      (factors.estimatedValue > 30000 ? 15 : 5) +
      (factors.source === 'Referral' ? 20 : 10) -
      (factors.daysSinceCreated > 30 ? 10 : 0)
    ))

    toast.success(`Conversion Probability: ${prediction.toFixed(1)}%`, {
      description: `Based on AI analysis of engagement patterns and lead characteristics`
    })

    return prediction
  }

  const filteredLeads = (leads || []).filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
    const matchesScore = lead.score >= scoreFilter[0] && lead.score <= scoreFilter[1]
    
    return matchesSearch && matchesStatus && matchesSource && matchesScore
  })

  const handleBulkAction = (action: string) => {
    if (bulkOperations.length === 0) {
      toast.error('Please select leads first')
      return
    }

    switch (action) {
      case 'qualify':
        setLeads(current => 
          current?.map(lead => 
            bulkOperations.includes(lead.id) 
              ? { ...lead, status: 'qualified' as LeadStatus, updatedAt: new Date() }
              : lead
          ) || []
        )
        toast.success(`${bulkOperations.length} leads qualified`)
        break
      case 'assign':
        toast.info('Bulk assignment dialog would open here')
        break
      case 'tag':
        toast.info('Bulk tagging dialog would open here')
        break
      case 'export':
        toast.success(`Exporting ${bulkOperations.length} selected leads`)
        break
    }
    setBulkOperations([])
  }

  const LeadCard = ({ lead }: { lead: Lead }) => {
    const profile = leadAIProfiles[lead.id]
    const isSelected = bulkOperations.includes(lead.id)

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setSelectedLead(lead)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setBulkOperations(prev => [...prev, lead.id])
                  } else {
                    setBulkOperations(prev => prev.filter(id => id !== lead.id))
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <CardTitle className="text-lg">{lead.firstName} {lead.lastName}</CardTitle>
                <CardDescription>{lead.title} at {lead.company}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{lead.source}</Badge>
              <Badge variant={lead.status === 'qualified' ? 'default' : 'secondary'}>
                {lead.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} />
              <span className="font-medium">{lead.score}/100</span>
            </div>
            <div className="text-right">
              <div className="font-medium">${lead.estimatedValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Est. Value</div>
            </div>
          </div>

          {profile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Conversion Probability</span>
                <span className="font-medium">{profile.conversionProbability}%</span>
              </div>
              <Progress value={profile.conversionProbability} className="h-2" />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain size={14} />
                <span>{profile.nextBestAction}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  generateLeadEmail(lead.id, 'follow-up')
                }}
              >
                <Mail size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onScheduleMeeting?.(lead.id)
                }}
              >
                <Calendar size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  generateAIRecommendation(lead.id)
                }}
              >
                <Brain size={14} />
              </Button>
            </div>
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCreateDeal?.(lead.id)
              }}
            >
              Convert
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary" size={20} />
                AI Insights & Recommendations
                {aiProcessing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAIInsights(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight) => (
                <Alert key={insight.id} className={`
                  ${insight.impact === 'high' ? 'border-red-200 bg-red-50' : 
                    insight.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                    'border-blue-200 bg-blue-50'}
                `}>
                  <div className="flex items-start gap-3">
                    <div className={`
                      ${insight.type === 'prediction' ? 'text-purple-600' :
                        insight.type === 'recommendation' ? 'text-blue-600' :
                        insight.type === 'alert' ? 'text-red-600' :
                        'text-green-600'}
                    `}>
                      {insight.type === 'prediction' ? <ChartLine size={16} /> :
                       insight.type === 'recommendation' ? <Lightbulb size={16} /> :
                       insight.type === 'alert' ? <AlertTriangle size={16} /> :
                       <Magic size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">
                        {insight.description}
                      </AlertDescription>
                      {insight.actionable && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={insight.action}
                        >
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Filters & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Score:</Label>
            <div className="w-32">
              <Slider
                value={scoreFilter}
                onValueChange={setScoreFilter}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {scoreFilter[0]}-{scoreFilter[1]}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button 
              size="sm" 
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
          </div>
          
          {bulkOperations.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{bulkOperations.length} selected</Badge>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('qualify')}>
                <Checks size={14} className="mr-1" />
                Qualify
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                <Download size={14} className="mr-1" />
                Export
              </Button>
            </div>
          )}
          
          <Button onClick={() => setShowLeadForm(true)}>
            <Plus size={16} className="mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Leads Display */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}

      {/* Enhanced Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <PersonIcon size={24} />
                {selectedLead.firstName} {selectedLead.lastName}
                <Badge variant="outline">{selectedLead.status}</Badge>
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="text-yellow-500" size={16} />
                  <span>{selectedLead.score}/100</span>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="h-[75vh]">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-profile">AI Profile</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <div className="overflow-y-auto h-full mt-4">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Name</Label>
                            <p className="text-sm">{selectedLead.firstName} {selectedLead.lastName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Title</Label>
                            <p className="text-sm">{selectedLead.title}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm">{selectedLead.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p className="text-sm">{selectedLead.phone}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Company</Label>
                            <p className="text-sm">{selectedLead.company}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source</Label>
                            <Badge variant="outline">{selectedLead.source}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lead Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Lead Score</span>
                              <span>{selectedLead.score}/100</span>
                            </div>
                            <Progress value={selectedLead.score} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Estimated Value</span>
                              <span>${selectedLead.estimatedValue.toLocaleString()}</span>
                            </div>
                          </div>
                          {leadAIProfiles[selectedLead.id] && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Conversion Probability</span>
                                <span>{leadAIProfiles[selectedLead.id].conversionProbability}%</span>
                              </div>
                              <Progress value={leadAIProfiles[selectedLead.id].conversionProbability} className="h-2" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightning className="text-yellow-500" size={20} />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex-col gap-2"
                          onClick={() => generateLeadEmail(selectedLead.id, 'follow-up')}
                        >
                          <Mail size={20} />
                          <span className="text-sm">Send Email</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex-col gap-2"
                          onClick={() => onScheduleMeeting?.(selectedLead.id)}
                        >
                          <Calendar size={20} />
                          <span className="text-sm">Schedule Meeting</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex-col gap-2"
                          onClick={() => generateAIRecommendation(selectedLead.id)}
                        >
                          <Brain size={20} />
                          <span className="text-sm">AI Recommendation</span>
                        </Button>
                        <Button 
                          className="h-auto p-4 flex-col gap-2"
                          onClick={() => onCreateDeal?.(selectedLead.id)}
                        >
                          <Target size={20} />
                          <span className="text-sm">Convert to Deal</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-profile" className="space-y-6">
                  {leadAIProfiles[selectedLead.id] ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="text-purple-500" size={20} />
                            AI Profile Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Personality Profile</Label>
                            <p className="text-sm text-muted-foreground">{leadAIProfiles[selectedLead.id].personalityProfile}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Communication Preference</Label>
                            <p className="text-sm text-muted-foreground">{leadAIProfiles[selectedLead.id].communicationPreference}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Predicted Timeframe</Label>
                            <p className="text-sm text-muted-foreground">{leadAIProfiles[selectedLead.id].timeframePrediction}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Next Best Action</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Lightbulb className="text-yellow-500" size={16} />
                              <p className="text-sm font-medium">{leadAIProfiles[selectedLead.id].nextBestAction}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Predictive Scores</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Decision Maker Likelihood</span>
                              <span>{leadAIProfiles[selectedLead.id].decisionMakerLikelihood}%</span>
                            </div>
                            <Progress value={leadAIProfiles[selectedLead.id].decisionMakerLikelihood} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Probability</span>
                              <span>{leadAIProfiles[selectedLead.id].budgetProbability}%</span>
                            </div>
                            <Progress value={leadAIProfiles[selectedLead.id].budgetProbability} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Competitor Threat</span>
                              <span>{leadAIProfiles[selectedLead.id].competitorThreat}%</span>
                            </div>
                            <Progress value={leadAIProfiles[selectedLead.id].competitorThreat} className="h-2 bg-red-100" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Engagement Score</span>
                              <span>{leadAIProfiles[selectedLead.id].engagementScore}%</span>
                            </div>
                            <Progress value={leadAIProfiles[selectedLead.id].engagementScore} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Buying Signals & AI Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Detected Buying Signals</Label>
                            <div className="mt-2 space-y-2">
                              {leadAIProfiles[selectedLead.id].buyingSignals.map((signal, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="text-green-500" size={16} />
                                  <span>{signal}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-sm font-medium">AI-Generated Notes</Label>
                            <div className="mt-2 space-y-2">
                              {leadAIProfiles[selectedLead.id].aiNotes.map((note, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <Robot className="text-blue-500 mt-0.5" size={16} />
                                  <span className="text-muted-foreground">{note}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Brain className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <h3 className="text-lg font-medium mb-2">AI Profile Analysis</h3>
                        <p className="text-muted-foreground mb-4">Generate AI-powered insights for this lead</p>
                        <Button onClick={() => updateLeadScores()}>
                          <Sparkle size={16} className="mr-2" />
                          Generate AI Profile
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activities">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Activity className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-lg font-medium mb-2">Activity Timeline</h3>
                      <p className="text-muted-foreground mb-4">Track all interactions and touchpoints</p>
                      <Button>
                        <Plus size={16} className="mr-2" />
                        Log Activity
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="communications">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ChatText className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-lg font-medium mb-2">Communication History</h3>
                      <p className="text-muted-foreground mb-4">All emails, calls, and messages in one place</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => generateLeadEmail(selectedLead.id, 'follow-up')}>
                          <Mail size={16} className="mr-2" />
                          AI Email
                        </Button>
                        <Button variant="outline">
                          <Phone size={16} className="mr-2" />
                          Log Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files">
                  <FileAttachmentSystem
                    entityId={selectedLead.id}
                    entityType="lead"
                    companyId={companyId}
                    userId={userId}
                    allowedTypes={['*']}
                    maxFileSize={50 * 1024 * 1024}
                    maxFiles={50}
                    showPreview={true}
                  />
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Journey</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="text-sm">
                              <div className="font-medium">Lead Created</div>
                              <div className="text-muted-foreground">{selectedLead.createdAt.toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div className="text-sm">
                              <div className="font-medium">First Contact</div>
                              <div className="text-muted-foreground">
                                {selectedLead.lastContactDate?.toLocaleDateString() || 'Not contacted'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="text-sm">
                              <div className="font-medium">Qualification</div>
                              <div className="text-muted-foreground">Pending</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm">Days in Pipeline</span>
                            <span className="text-sm font-medium">
                              {Math.floor((new Date().getTime() - selectedLead.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Touchpoints</span>
                            <span className="text-sm font-medium">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Email Opens</span>
                            <span className="text-sm font-medium">5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Website Visits</span>
                            <span className="text-sm font-medium">12</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Lead Creation Form */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={formData.firstName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={formData.company || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Value</Label>
              <Input
                type="number"
                value={formData.estimatedValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!formData.firstName || !formData.lastName || !formData.email) {
                toast.error('Please fill in required fields')
                return
              }

              const newLead: Lead = {
                id: `lead-${Date.now()}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone || '',
                company: formData.company || '',
                title: formData.title || '',
                source: formData.source || 'Manual',
                status: 'new',
                score: 0,
                estimatedValue: formData.estimatedValue || 0,
                assignedTo: userId,
                tags: formData.tags || [],
                notes: formData.notes || '',
                customFields: formData.customFields || {},
                activities: [],
                files: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                lastContactDate: null,
                nextFollowUpDate: null
              }

              setLeads(current => [...(current || []), newLead])
              setFormData({})
              setShowLeadForm(false)
              toast.success('Lead created successfully')
            }}>
              <Plus size={16} className="mr-2" />
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}