import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  Users, 
  Plus,
  Brain,
  Target,
  FileText,
  Attachment,
  CheckCircle,
  AlertTriangle,
  TrendUp,
  Activity,
  Star,
  Eye,
  Edit,
  Send,
  Download,
  Upload,
  Warning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { QuoteAttachmentManager } from './QuoteAttachmentManager'
import { AIActivityScheduler } from './AIActivityScheduler'
import { format, differenceInDays, isAfter, addDays } from 'date-fns'

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
  aiLeadScore: number
  createdAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  assignedTo?: string
}

interface TimelineActivity {
  id: string
  leadId: string
  activityType: 'call' | 'email' | 'meeting' | 'note' | 'quote' | 'task' | 'ai_insight'
  activitySubject: string
  activityDescription: string
  activityDate: string
  duration?: number
  outcome?: string
  nextAction?: string
  nextActionDate?: string
  createdBy: string
  attachments?: Attachment[]
  aiSentimentScore?: number
  aiIntentDetected?: string
  aiBuyingSignals?: string[]
  quoteId?: string
  quoteValue?: number
}

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
}

interface AIRecommendation {
  id: string
  leadId: string
  recommendationType: 'next_action' | 'follow_up_timing' | 'content_suggestion' | 'channel_optimization'
  title: string
  description: string
  confidence: number
  reasoning: string
  suggestedDate?: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

interface Quote {
  id: string
  quoteNumber: string
  leadId?: string
  accountId?: string
  contactId?: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  status: string
  createdAt: string
  validUntil?: string
  attachments?: Attachment[]
}

interface LeadTimelineManagerProps {
  leadId: string
  companyId: string
  userId: string
  onClose?: () => void
}

export function LeadTimelineManager({ leadId, companyId, userId, onClose }: LeadTimelineManagerProps) {
  const [lead, setLead] = useKV<Lead>(`lead-${leadId}`, null)
  const [activities, setActivities] = useKV<TimelineActivity[]>(`lead-activities-${leadId}`, [])
  const [aiRecommendations, setAIRecommendations] = useKV<AIRecommendation[]>(`lead-ai-recommendations-${leadId}`, [])
  const [attachedQuotes, setAttachedQuotes] = useKV<Quote[]>(`lead-quotes-${leadId}`, [])
  
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(true)
  const [showQuoteManager, setShowQuoteManager] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [newActivity, setNewActivity] = useState({
    activityType: 'call' as const,
    activitySubject: '',
    activityDescription: '',
    activityDate: new Date().toISOString(),
    duration: 0,
    outcome: '',
    nextAction: '',
    nextActionDate: ''
  })

  // Calculate lead aging
  const getLeadAge = () => {
    if (!lead?.createdAt) return 0
    return differenceInDays(new Date(), new Date(lead.createdAt))
  }

  // Calculate days since last contact
  const getDaysSinceLastContact = () => {
    if (!lead?.lastContactDate) return getLeadAge()
    return differenceInDays(new Date(), new Date(lead.lastContactDate))
  }

  // Check if follow-up is overdue
  const isFollowUpOverdue = () => {
    if (!lead?.nextFollowUpDate) return false
    return isAfter(new Date(), new Date(lead.nextFollowUpDate))
  }

  // Generate AI recommendations
  const generateAIRecommendations = async () => {
    if (!lead) return

    try {
      const leadAge = getLeadAge()
      const daysSinceContact = getDaysSinceLastContact()
      const recentActivities = activities.slice(-5)
      const leadScore = lead.aiLeadScore || 0

      const prompt = spark.llmPrompt`
        Analyze this lead and provide smart recommendations for next actions:
        
        Lead Details:
        - Name: ${lead.firstName} ${lead.lastName}
        - Company: ${lead.companyName || 'Unknown'}
        - Status: ${lead.leadStatus}
        - Rating: ${lead.leadRating}
        - AI Score: ${leadScore}/100
        - Lead Age: ${leadAge} days
        - Days Since Last Contact: ${daysSinceContact}
        - Recent Activities: ${JSON.stringify(recentActivities)}
        
        Generate 3-5 actionable recommendations with timing, priority, and reasoning.
        Focus on lead nurturing, engagement optimization, and conversion strategies.
        
        Return as JSON with recommendations array containing:
        - recommendationType (next_action, follow_up_timing, content_suggestion, channel_optimization)
        - title
        - description
        - confidence (0-100)
        - reasoning
        - suggestedDate (ISO string)
        - priority (high, medium, low)
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      if (result.recommendations) {
        const newRecommendations: AIRecommendation[] = result.recommendations.map((rec: any, index: number) => ({
          id: `ai-rec-${Date.now()}-${index}`,
          leadId,
          recommendationType: rec.recommendationType,
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence,
          reasoning: rec.reasoning,
          suggestedDate: rec.suggestedDate,
          priority: rec.priority,
          createdAt: new Date().toISOString()
        }))

        setAIRecommendations(prev => [...newRecommendations, ...prev.slice(0, 10)])
        toast.success('AI recommendations updated')
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      toast.error('Failed to generate AI recommendations')
    }
  }

  // Add new activity
  const addActivity = async () => {
    if (!newActivity.activitySubject.trim()) {
      toast.error('Please enter an activity subject')
      return
    }

    try {
      const activity: TimelineActivity = {
        id: `activity-${Date.now()}`,
        leadId,
        ...newActivity,
        createdBy: userId,
        attachments: []
      }

      setActivities(prev => [activity, ...prev])

      // Update lead's last contact date if it's a contact activity
      if (['call', 'email', 'meeting'].includes(newActivity.activityType)) {
        setLead(prev => prev ? {
          ...prev,
          lastContactDate: newActivity.activityDate,
          nextFollowUpDate: newActivity.nextActionDate || undefined
        } : null)
      }

      // Reset form
      setNewActivity({
        activityType: 'call',
        activitySubject: '',
        activityDescription: '',
        activityDate: new Date().toISOString(),
        duration: 0,
        outcome: '',
        nextAction: '',
        nextActionDate: ''
      })

      setShowNewActivity(false)
      toast.success('Activity added successfully')

      // Generate new AI recommendations based on the activity
      setTimeout(generateAIRecommendations, 1000)
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error('Failed to add activity')
    }
  }

  // Attach quote to lead
  const attachQuoteToLead = (quote: Quote) => {
    setAttachedQuotes(prev => {
      const exists = prev.find(q => q.id === quote.id)
      if (exists) return prev
      return [quote, ...prev]
    })

    // Add quote activity to timeline
    const quoteActivity: TimelineActivity = {
      id: `activity-quote-${Date.now()}`,
      leadId,
      activityType: 'quote',
      activitySubject: `Quote ${quote.quoteNumber} attached`,
      activityDescription: `Quote "${quote.title}" for ${quote.totalAmount} ${quote.currency} has been attached to this lead`,
      activityDate: new Date().toISOString(),
      createdBy: userId,
      quoteId: quote.id,
      quoteValue: quote.totalAmount
    }

    setActivities(prev => [quoteActivity, ...prev])
    toast.success('Quote attached to lead successfully')
  }

  // Execute AI recommendation
  const executeRecommendation = (recommendation: AIRecommendation) => {
    // Pre-fill activity form based on recommendation
    setNewActivity(prev => ({
      ...prev,
      activitySubject: recommendation.title,
      activityDescription: recommendation.description,
      activityDate: recommendation.suggestedDate || new Date().toISOString(),
      nextAction: recommendation.description
    }))
    setShowNewActivity(true)
    toast.info(`Recommendation applied to new activity`)
  }

  // Load initial data
  useEffect(() => {
    if (leadId && !lead) {
      // Mock lead data - in real app, this would come from API
      setLead({
        id: leadId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1 (555) 123-4567',
        companyName: 'TechCorp Solutions',
        jobTitle: 'IT Director',
        leadStatus: 'qualified',
        leadRating: 'warm',
        aiLeadScore: 78,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    if (activities.length === 0) {
      generateAIRecommendations()
    }
  }, [leadId])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={16} />
      case 'email': return <Mail size={16} />
      case 'meeting': return <Users size={16} />
      case 'note': return <FileText size={16} />
      case 'quote': return <FileText size={16} />
      case 'task': return <CheckCircle size={16} />
      case 'ai_insight': return <Brain size={16} />
      default: return <Activity size={16} />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-500'
      case 'email': return 'bg-green-500'
      case 'meeting': return 'bg-purple-500'
      case 'note': return 'bg-gray-500'
      case 'quote': return 'bg-orange-500'
      case 'task': return 'bg-indigo-500'
      case 'ai_insight': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading lead timeline...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lead Summary & Aging Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Lead Timeline - {lead.firstName} {lead.lastName}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Age: {getLeadAge()} days</span>
                <span>Last Contact: {getDaysSinceLastContact()} days ago</span>
                {isFollowUpOverdue() && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Warning size={12} />
                    Follow-up Overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Score: {lead.aiLeadScore}/100</Badge>
              <Badge variant={lead.leadRating === 'hot' ? 'destructive' : lead.leadRating === 'warm' ? 'default' : 'secondary'}>
                {lead.leadRating}
              </Badge>
              <Button onClick={() => setShowNewActivity(true)}>
                <Plus size={16} className="mr-2" />
                Add Activity
              </Button>
              <Button variant="outline" onClick={() => setShowQuoteManager(true)}>
                <FileText size={16} className="mr-2" />
                Manage Quotes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.activityType)} flex items-center justify-center text-white`}>
                            {getActivityIcon(activity.activityType)}
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-px h-12 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.activitySubject}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(activity.activityDate), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.activityDescription}
                          </p>
                          
                          {/* Activity Details */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {activity.outcome && (
                              <Badge variant="outline" className="text-xs">
                                Outcome: {activity.outcome}
                              </Badge>
                            )}
                            {activity.duration && activity.duration > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {activity.duration} min
                              </Badge>
                            )}
                            {activity.aiSentimentScore && (
                              <Badge 
                                variant={activity.aiSentimentScore > 0.6 ? 'default' : activity.aiSentimentScore > 0.3 ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                Sentiment: {Math.round(activity.aiSentimentScore * 100)}%
                              </Badge>
                            )}
                            {activity.quoteValue && (
                              <Badge variant="outline" className="text-xs bg-orange-50">
                                ${activity.quoteValue.toLocaleString()}
                              </Badge>
                            )}
                          </div>

                          {/* Next Action */}
                          {activity.nextAction && (
                            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 text-xs">
                                <Target size={12} />
                                <span className="font-medium">Next Action:</span>
                                <span>{activity.nextAction}</span>
                                {activity.nextActionDate && (
                                  <span className="text-muted-foreground">
                                    - {format(new Date(activity.nextActionDate), 'MMM dd')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* AI Buying Signals */}
                          {activity.aiBuyingSignals && activity.aiBuyingSignals.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {activity.aiBuyingSignals.map((signal, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-green-50">
                                    <Star size={10} className="mr-1" />
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Attachments */}
                          {activity.attachments && activity.attachments.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-2">
                                {activity.attachments.map((attachment) => (
                                  <Button key={attachment.id} variant="outline" size="sm" className="h-auto p-2">
                                    <Attachment size={12} className="mr-1" />
                                    <span className="text-xs">{attachment.fileName}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No activities yet. Start by adding your first interaction.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          {showAIRecommendations && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} />
                    AI Recommendations
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateAIRecommendations}
                  >
                    <Brain size={14} className="mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {aiRecommendations.map((rec) => (
                      <div key={rec.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rec.priority}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Progress value={rec.confidence} className="w-12 h-2" />
                            <span className="text-xs text-muted-foreground">{rec.confidence}%</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          {rec.suggestedDate && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(rec.suggestedDate), 'MMM dd')}
                            </span>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => executeRecommendation(rec)}
                            className="h-6 px-2 text-xs"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Attached Quotes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Attached Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attachedQuotes.length > 0 ? (
                  attachedQuotes.map((quote) => (
                    <div key={quote.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{quote.quoteNumber}</h4>
                          <p className="text-xs text-muted-foreground">{quote.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {quote.totalAmount.toLocaleString()} {quote.currency}
                            </Badge>
                            <Badge variant={quote.status === 'accepted' ? 'default' : quote.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs">
                              {quote.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="outline" size="sm" className="h-6 px-2">
                            <Eye size={12} />
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 px-2">
                            <Download size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <FileText size={16} className="mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No quotes attached</p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => {
                  // Mock quote attachment - in real app, this would open quote selection dialog
                  const mockQuote: Quote = {
                    id: `quote-${Date.now()}`,
                    quoteNumber: `Q-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    leadId,
                    title: 'IT Infrastructure Solution',
                    totalAmount: 25000,
                    currency: 'USD',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    validUntil: addDays(new Date(), 30).toISOString()
                  }
                  attachQuoteToLead(mockQuote)
                }}
              >
                <Plus size={14} className="mr-1" />
                Attach Quote
              </Button>
            </CardContent>
          </Card>

          {/* AI Activity Scheduler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI Activity Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIActivityScheduler
                leadId={leadId}
                companyId={companyId}
                userId={userId}
                onScheduleActivity={(activity) => {
                  // Auto-fill the new activity form with AI suggestion
                  setNewActivity(prev => ({
                    ...prev,
                    activityType: activity.activityType,
                    activitySubject: activity.activitySubject,
                    activityDescription: activity.activityDescription,
                    activityDate: activity.activityDate,
                    duration: activity.duration,
                    nextAction: activity.nextAction,
                    nextActionDate: activity.nextActionDate
                  }))
                  setShowNewActivity(true)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Activity Dialog */}
      <Dialog open={showNewActivity} onOpenChange={setShowNewActivity}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Select 
                  value={newActivity.activityType} 
                  onValueChange={(value: any) => setNewActivity(prev => ({ ...prev, activityType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="Duration in minutes"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={newActivity.activitySubject}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activitySubject: e.target.value }))}
                placeholder="Brief description of the activity"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newActivity.activityDescription}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activityDescription: e.target.value }))}
                placeholder="Detailed description of what happened"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Select 
                  value={newActivity.outcome} 
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, outcome: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="follow_up_requested">Follow-up Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Activity Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon size={16} className="mr-2" />
                      {format(new Date(newActivity.activityDate), 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(newActivity.activityDate)}
                      onSelect={(date) => {
                        if (date) {
                          setNewActivity(prev => ({ ...prev, activityDate: date.toISOString() }))
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium">Next Action</label>
              <Input
                value={newActivity.nextAction}
                onChange={(e) => setNewActivity(prev => ({ ...prev, nextAction: e.target.value }))}
                placeholder="What should be done next?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Next Action Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon size={16} className="mr-2" />
                    {newActivity.nextActionDate ? format(new Date(newActivity.nextActionDate), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newActivity.nextActionDate ? new Date(newActivity.nextActionDate) : undefined}
                    onSelect={(date) => {
                      setNewActivity(prev => ({ ...prev, nextActionDate: date ? date.toISOString() : '' }))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewActivity(false)}>
                Cancel
              </Button>
              <Button onClick={addActivity}>
                <Plus size={16} className="mr-2" />
                Add Activity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Management Dialog */}
      <Dialog open={showQuoteManager} onOpenChange={setShowQuoteManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Management for Lead</DialogTitle>
          </DialogHeader>
          <QuoteAttachmentManager
            leadId={leadId}
            companyId={companyId}
            userId={userId}
            onClose={() => setShowQuoteManager(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeadTimelineManager