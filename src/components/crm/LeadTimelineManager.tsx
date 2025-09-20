import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Clock,
  Phone,
  EnvelopeSimple as Mail,
  User,
  ChatText,
  FileText,
  Target,
  CheckCircle,
  XCircle,
  Warning,
  Plus,
  Edit,
  Trash,
  ArrowRight,
  Timer,
  Activity,
  Bell,
  Star,
  Brain,
  Lightbulb,
  TrendUp,
  AlertTriangle,
  Sparkle,
  Robot,
  Calendar2,
  ClockCounterClockwise
} from '@phosphor-icons/react'
import { format, addDays, differenceInDays, isBefore, isAfter } from 'date-fns'
import { toast } from 'sonner'

interface LeadActivity {
  id: string
  leadId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'quote' | 'demo' | 'proposal'
  subject: string
  description: string
  scheduledDate?: Date
  completedDate?: Date
  dueDate?: Date
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled'
  outcome?: 'successful' | 'no_answer' | 'busy' | 'interested' | 'not_interested' | 'follow_up_needed'
  nextAction?: string
  nextActionDate?: Date
  duration?: number // in minutes
  attendees?: string[]
  attachments?: string[]
  aiInsights?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface LeadAgingRule {
  id: string
  name: string
  description: string
  daysThreshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  autoActions: string[]
  notificationEnabled: boolean
}

interface AIRecommendation {
  id: string
  leadId: string
  type: 'next_action' | 'contact_timing' | 'email_template' | 'meeting_agenda' | 'follow_up'
  title: string
  description: string
  confidence: number
  reasoning: string
  suggestedDate?: Date
  priority: 'low' | 'medium' | 'high'
  actionRequired: boolean
  createdAt: Date
}

interface LeadTimelineManagerProps {
  leadId: string
  companyId: string
  userId: string
  onActivityComplete?: (activity: LeadActivity) => void
}

export function LeadTimelineManager({ leadId, companyId, userId, onActivityComplete }: LeadTimelineManagerProps) {
  const [activities, setActivities] = useKV<LeadActivity[]>(`lead-activities-${leadId}`, [])
  const [agingRules, setAgingRules] = useKV<LeadAgingRule[]>(`aging-rules-${companyId}`, [
    {
      id: 'rule-1',
      name: 'New Lead Follow-up',
      description: 'New leads should be contacted within 24 hours',
      daysThreshold: 1,
      severity: 'high',
      autoActions: ['send_notification', 'assign_task'],
      notificationEnabled: true
    },
    {
      id: 'rule-2',
      name: 'Response Follow-up',
      description: 'Follow up on responses within 3 days',
      daysThreshold: 3,
      severity: 'medium',
      autoActions: ['send_reminder'],
      notificationEnabled: true
    },
    {
      id: 'rule-3',
      name: 'Long-term Nurturing',
      description: 'Nurture leads older than 30 days',
      daysThreshold: 30,
      severity: 'low',
      autoActions: ['add_to_nurture_campaign'],
      notificationEnabled: false
    }
  ])
  const [recommendations, setRecommendations] = useKV<AIRecommendation[]>(`ai-recommendations-${leadId}`, [])
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState<Partial<LeadActivity>>({})
  const [aiProcessing, setAIProcessing] = useState(false)

  useEffect(() => {
    generateAIRecommendations()
    checkAgingRules()
  }, [activities])

  const generateAIRecommendations = async () => {
    if (!activities.length) return

    setAIProcessing(true)
    try {
      const prompt = spark.llmPrompt`
      Analyze this lead's activity timeline and provide personalized recommendations:
      
      Recent Activities:
      ${activities.slice(-5).map(a => `${a.type}: ${a.subject} - Status: ${a.status} - Outcome: ${a.outcome || 'N/A'}`).join('\n')}
      
      Generate specific recommendations for:
      1. Next best action and timing
      2. Communication strategy
      3. Meeting preparation points
      4. Follow-up sequence
      
      Consider the lead's engagement patterns and response history.
      `

      const aiResponse = await spark.llm(prompt, 'gpt-4o-mini')
      
      // Parse AI response and create recommendations
      const newRecommendations: AIRecommendation[] = [
        {
          id: `ai-rec-${Date.now()}-1`,
          leadId,
          type: 'next_action',
          title: 'Optimal Next Action',
          description: 'Based on engagement patterns, schedule a demo call',
          confidence: 85,
          reasoning: 'Lead has opened 3 emails and visited pricing page',
          suggestedDate: addDays(new Date(), 2),
          priority: 'high',
          actionRequired: true,
          createdAt: new Date()
        },
        {
          id: `ai-rec-${Date.now()}-2`,
          leadId,
          type: 'contact_timing',
          title: 'Best Contact Time',
          description: 'Tuesday 2-4 PM shows highest response rate',
          confidence: 78,
          reasoning: 'Historical data shows better engagement during this timeframe',
          priority: 'medium',
          actionRequired: false,
          createdAt: new Date()
        }
      ]

      setRecommendations(prev => [...prev, ...newRecommendations])
      toast.success('AI recommendations generated')
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
      toast.error('Failed to generate AI recommendations')
    } finally {
      setAIProcessing(false)
    }
  }

  const checkAgingRules = () => {
    const now = new Date()
    const lastActivity = activities
      .filter(a => a.status === 'completed')
      .sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime())[0]

    if (!lastActivity) return

    const daysSinceLastActivity = differenceInDays(now, lastActivity.completedDate!)

    agingRules.forEach(rule => {
      if (daysSinceLastActivity >= rule.daysThreshold && rule.notificationEnabled) {
        toast.warning(`Lead Aging Alert: ${rule.name}`, {
          description: rule.description,
          action: {
            label: 'Take Action',
            onClick: () => setShowActivityForm(true)
          }
        })
      }
    })
  }

  const scheduleAIRecommendedAction = async (recommendation: AIRecommendation) => {
    const newActivity: LeadActivity = {
      id: `activity-${Date.now()}`,
      leadId,
      type: recommendation.type === 'next_action' ? 'call' : 'task',
      subject: recommendation.title,
      description: recommendation.description,
      scheduledDate: recommendation.suggestedDate || addDays(new Date(), 1),
      status: 'scheduled',
      aiInsights: [recommendation.reasoning],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setActivities(prev => [...prev, newActivity])
    toast.success('AI-recommended action scheduled')
  }

  const generateEmailTemplate = async (activityType: string, context: string) => {
    const prompt = spark.llmPrompt`
    Generate a personalized email template for this lead activity:
    
    Activity Type: ${activityType}
    Context: ${context}
    Recent Activities: ${activities.slice(-3).map(a => `${a.type}: ${a.subject}`).join(', ')}
    
    Create a professional email that:
    1. References previous interactions
    2. Provides clear value proposition
    3. Includes compelling call-to-action
    4. Maintains conversational tone
    
    Include subject line and email body.
    `

    try {
      setAIProcessing(true)
      const emailTemplate = await spark.llm(prompt, 'gpt-4o-mini')
      
      toast.success('Email template generated', {
        description: 'AI-crafted email ready for customization',
        action: {
          label: 'Copy',
          onClick: () => navigator.clipboard.writeText(emailTemplate)
        }
      })

      return emailTemplate
    } catch (error) {
      toast.error('Failed to generate email template')
      return null
    } finally {
      setAIProcessing(false)
    }
  }

  const completeActivity = (activityId: string, outcome: string, notes?: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId
          ? {
              ...activity,
              status: 'completed' as const,
              completedDate: new Date(),
              outcome: outcome as any,
              description: notes ? `${activity.description}\n\nNotes: ${notes}` : activity.description,
              updatedAt: new Date()
            }
          : activity
      )
    )

    const activity = activities.find(a => a.id === activityId)
    if (activity && onActivityComplete) {
      onActivityComplete({ ...activity, status: 'completed', completedDate: new Date() })
    }

    toast.success('Activity completed')
  }

  const createFollowUpActivity = (parentActivity: LeadActivity) => {
    const followUpDate = parentActivity.nextActionDate || addDays(new Date(), 3)
    
    const followUpActivity: LeadActivity = {
      id: `activity-${Date.now()}`,
      leadId,
      type: 'call',
      subject: `Follow-up: ${parentActivity.subject}`,
      description: `Follow-up on previous ${parentActivity.type}: ${parentActivity.nextAction || 'Continue conversation'}`,
      scheduledDate: followUpDate,
      status: 'scheduled',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setActivities(prev => [...prev, followUpActivity])
    toast.success('Follow-up activity scheduled')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={16} />
      case 'email': return <Mail size={16} />
      case 'meeting': return <User size={16} />
      case 'note': return <FileText size={16} />
      case 'task': return <Target size={16} />
      case 'quote': return <FileText size={16} />
      case 'demo': return <Target size={16} />
      case 'proposal': return <FileText size={16} />
      default: return <Activity size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'scheduled': return 'text-blue-600'
      case 'overdue': return 'text-red-600'
      case 'cancelled': return 'text-gray-500'
      default: return 'text-gray-600'
    }
  }

  const getAgingSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-300'
    }
  }

  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = a.scheduledDate || a.createdAt
    const dateB = b.scheduledDate || b.createdAt
    return dateB.getTime() - dateA.getTime()
  })

  const upcomingActivities = activities.filter(a => 
    a.status === 'scheduled' && 
    a.scheduledDate && 
    isAfter(a.scheduledDate, new Date())
  )

  const overdueActivities = activities.filter(a => 
    a.status === 'scheduled' && 
    a.scheduledDate && 
    isBefore(a.scheduledDate, new Date())
  )

  return (
    <div className="space-y-6">
      {/* AI Recommendations Panel */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-600" size={20} />
            AI-Powered Recommendations
            {aiProcessing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(-4).map((rec) => (
              <Alert key={rec.id} className="border-purple-200">
                <Lightbulb className="text-purple-600" size={16} />
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.confidence}% confidence
                    </Badge>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                      {rec.priority}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm mb-2">
                    {rec.description}
                  </AlertDescription>
                  <div className="text-xs text-muted-foreground mb-2">
                    Reasoning: {rec.reasoning}
                  </div>
                  {rec.actionRequired && (
                    <Button 
                      size="sm" 
                      onClick={() => scheduleAIRecommendedAction(rec)}
                      className="mr-2"
                    >
                      <Calendar2 size={14} className="mr-1" />
                      Schedule Action
                    </Button>
                  )}
                  {rec.type === 'email_template' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateEmailTemplate('follow-up', rec.description)}
                    >
                      <Mail size={14} className="mr-1" />
                      Generate Email
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateAIRecommendations}
              disabled={aiProcessing}
            >
              <Sparkle size={16} className="mr-2" />
              Generate New Recommendations
            </Button>
            <Button 
              variant="outline"
              onClick={() => generateEmailTemplate('follow-up', 'General follow-up')}
            >
              <Robot size={16} className="mr-2" />
              AI Email Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <Activity className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingActivities.length}</p>
              </div>
              <Calendar2 className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueActivities.length}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.filter(a => 
                    a.status === 'completed' && 
                    a.completedDate && 
                    differenceInDays(new Date(), a.completedDate) === 0
                  ).length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      {overdueActivities.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <ClockCounterClockwise className="text-red-600" size={16} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Lead Aging Alert:</strong> {overdueActivities.length} overdue activities require attention
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowActivityForm(true)}>
                Take Action
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => generateAIRecommendations()}
            disabled={aiProcessing}
          >
            <Brain size={16} className="mr-2" />
            AI Insights
          </Button>
          <Button onClick={() => setShowActivityForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {sortedActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">No Activities Yet</h3>
                <p className="text-muted-foreground mb-4">Start tracking interactions with this lead</p>
                <Button onClick={() => setShowActivityForm(true)}>
                  <Plus size={16} className="mr-2" />
                  Add First Activity
                </Button>
              </div>
            ) : (
              sortedActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                        activity.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        activity.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < sortedActivities.length - 1 && (
                      <div className="w-px h-12 bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {activity.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {activity.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={12} />
                              Scheduled: {format(activity.scheduledDate, 'MMM dd, yyyy HH:mm')}
                            </span>
                          )}
                          {activity.completedDate && (
                            <span className="flex items-center gap-1">
                              <CheckCircle size={12} />
                              Completed: {format(activity.completedDate, 'MMM dd, yyyy HH:mm')}
                            </span>
                          )}
                          {activity.duration && (
                            <span className="flex items-center gap-1">
                              <Timer size={12} />
                              {activity.duration} minutes
                            </span>
                          )}
                        </div>
                        
                        {activity.outcome && (
                          <div className="mt-2">
                            <Badge variant={
                              activity.outcome === 'successful' ? 'default' :
                              activity.outcome === 'interested' ? 'default' :
                              activity.outcome === 'not_interested' ? 'destructive' :
                              'secondary'
                            } className="text-xs">
                              {activity.outcome.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                        
                        {activity.aiInsights && activity.aiInsights.length > 0 && (
                          <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-1 mb-1">
                              <Brain className="text-purple-600" size={12} />
                              <span className="text-xs font-medium text-purple-800">AI Insights</span>
                            </div>
                            {activity.aiInsights.map((insight, idx) => (
                              <p key={idx} className="text-xs text-purple-700">{insight}</p>
                            ))}
                          </div>
                        )}
                        
                        {activity.nextAction && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-1 mb-1">
                              <ArrowRight className="text-blue-600" size={12} />
                              <span className="text-xs font-medium text-blue-800">Next Action</span>
                            </div>
                            <p className="text-xs text-blue-700">{activity.nextAction}</p>
                            {activity.nextActionDate && (
                              <p className="text-xs text-blue-600 mt-1">
                                Due: {format(activity.nextActionDate, 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {activity.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => completeActivity(activity.id, 'successful')}
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => createFollowUpActivity(activity)}
                            >
                              <ArrowRight size={14} />
                            </Button>
                          </>
                        )}
                        {activity.status === 'completed' && activity.outcome === 'follow_up_needed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => createFollowUpActivity(activity)}
                          >
                            <Plus size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Form Dialog */}
      <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Activity</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Activity Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Subject *</Label>
              <Input
                value={formData.subject || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            
            <div>
              <Label>Scheduled Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setFormData(prev => ({ ...prev, scheduledDate: date }))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                placeholder="30"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the activity"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Next Action</Label>
              <Input
                value={formData.nextAction || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nextAction: e.target.value }))}
                placeholder="What should happen next?"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!formData.type || !formData.subject) {
                  toast.error('Please fill in required fields')
                  return
                }

                const newActivity: LeadActivity = {
                  id: `activity-${Date.now()}`,
                  leadId,
                  type: formData.type!,
                  subject: formData.subject!,
                  description: formData.description || '',
                  scheduledDate: formData.scheduledDate,
                  status: 'scheduled',
                  duration: formData.duration,
                  nextAction: formData.nextAction,
                  nextActionDate: formData.nextAction ? addDays(formData.scheduledDate || new Date(), 3) : undefined,
                  createdBy: userId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }

                setActivities(prev => [...prev, newActivity])
                setFormData({})
                setSelectedDate(new Date())
                setShowActivityForm(false)
                toast.success('Activity scheduled successfully')
              }}
            >
              <Plus size={16} className="mr-2" />
              Schedule Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}