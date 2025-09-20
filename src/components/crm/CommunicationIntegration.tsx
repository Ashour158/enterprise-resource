import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EmailIntegrationSystem } from '@/components/crm/email/EmailIntegrationSystem'
import { CalendarSchedulingSystem } from '@/components/crm/calendar/CalendarSchedulingSystem'
import { 
  EnvelopeSimple as Mail,
  Calendar as CalendarIcon,
  Robot,
  Lightning,
  Clock,
  Users,
  VideoCamera,
  Phone,
  Bell,
  Target,
  CheckCircle,
  Warning,
  ArrowRight,
  Gear,
  ChartLine,
  Link as LinkIcon
} from '@phosphor-icons/react'
import { format, addDays, isAfter, isBefore } from 'date-fns'
import { toast } from 'sonner'

interface CommunicationActivity {
  id: string
  type: 'email' | 'call' | 'meeting' | 'task'
  subject: string
  description?: string
  timestamp: Date
  status: 'completed' | 'scheduled' | 'pending' | 'cancelled'
  relatedTo: {
    type: 'lead' | 'contact' | 'deal' | 'account'
    id: string
    name: string
  }
  participants: Array<{
    email: string
    name: string
    role: 'organizer' | 'attendee' | 'optional'
  }>
  outcome?: string
  nextAction?: {
    type: 'email' | 'call' | 'meeting'
    dueDate: Date
    description: string
  }
}

interface AutomationRule {
  id: string
  name: string
  trigger: {
    type: 'email_received' | 'meeting_completed' | 'deal_stage_changed' | 'lead_score_changed'
    conditions: Record<string, any>
  }
  actions: Array<{
    type: 'send_email' | 'schedule_meeting' | 'create_task' | 'update_lead'
    parameters: Record<string, any>
    delay?: number // minutes
  }>
  isActive: boolean
  lastTriggered?: Date
  executionCount: number
}

interface SmartSuggestion {
  id: string
  type: 'email_template' | 'meeting_time' | 'follow_up_action' | 'contact_timing'
  title: string
  description: string
  confidence: number
  reasoning: string
  actionable: boolean
  parameters?: Record<string, any>
  createdAt: Date
}

interface CommunicationIntegrationProps {
  companyId: string
  userId: string
  userRole: string
  leadId?: string
  contactId?: string
  dealId?: string
}

export function CommunicationIntegration({ 
  companyId, 
  userId, 
  userRole, 
  leadId, 
  contactId, 
  dealId 
}: CommunicationIntegrationProps) {
  const [activities, setActivities] = useKV<CommunicationActivity[]>(`communication-activities-${companyId}`, [])
  const [automationRules, setAutomationRules] = useKV<AutomationRule[]>(`automation-rules-${companyId}`, [])
  const [suggestions, setSuggestions] = useKV<SmartSuggestion[]>(`smart-suggestions-${companyId}`, [])
  const [selectedActivity, setSelectedActivity] = useState<CommunicationActivity | null>(null)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Initialize with sample data
  useEffect(() => {
    if (activities.length === 0) {
      const sampleActivities: CommunicationActivity[] = [
        {
          id: 'activity-001',
          type: 'email',
          subject: 'Follow-up on product demo',
          description: 'Sent comprehensive follow-up email with pricing and next steps',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed',
          relatedTo: { type: 'lead', id: 'lead-001', name: 'Acme Corp Lead' },
          participants: [
            { email: 'john@acme.com', name: 'John Smith', role: 'attendee' },
            { email: 'sales@company.com', name: 'Sales Rep', role: 'organizer' }
          ],
          outcome: 'Positive response, requested additional information',
          nextAction: {
            type: 'call',
            dueDate: addDays(new Date(), 2),
            description: 'Schedule call to discuss implementation timeline'
          }
        },
        {
          id: 'activity-002',
          type: 'meeting',
          subject: 'Product Demo - TechStart Solutions',
          description: 'Comprehensive product demonstration and Q&A session',
          timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'scheduled',
          relatedTo: { type: 'deal', id: 'deal-001', name: 'TechStart Deal' },
          participants: [
            { email: 'cto@techstart.com', name: 'Tech CTO', role: 'attendee' },
            { email: 'ceo@techstart.com', name: 'Tech CEO', role: 'attendee' },
            { email: 'sales@company.com', name: 'Sales Rep', role: 'organizer' }
          ]
        }
      ]
      setActivities(sampleActivities)
    }
  }, [activities, setActivities])

  // Initialize automation rules
  useEffect(() => {
    if (automationRules.length === 0) {
      const sampleRules: AutomationRule[] = [
        {
          id: 'rule-001',
          name: 'New Lead Welcome Sequence',
          trigger: {
            type: 'lead_score_changed',
            conditions: { score: { gte: 50 }, status: 'new' }
          },
          actions: [
            {
              type: 'send_email',
              parameters: { templateId: 'welcome-template', delay: 0 }
            },
            {
              type: 'create_task',
              parameters: { 
                title: 'Call new lead',
                description: 'Follow up on welcome email'
              },
              delay: 60 // 1 hour delay
            }
          ],
          isActive: true,
          executionCount: 15
        },
        {
          id: 'rule-002',
          name: 'Meeting Follow-up Automation',
          trigger: {
            type: 'meeting_completed',
            conditions: { type: 'demo' }
          },
          actions: [
            {
              type: 'send_email',
              parameters: { templateId: 'meeting-followup', delay: 60 }
            },
            {
              type: 'schedule_meeting',
              parameters: { 
                type: 'follow_up',
                duration: 30,
                suggestedDays: 7
              },
              delay: 24 * 60 // 24 hour delay
            }
          ],
          isActive: true,
          executionCount: 8
        }
      ]
      setAutomationRules(sampleRules)
    }
  }, [automationRules, setAutomationRules])

  // Generate AI suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      if (suggestions.length === 0) {
        try {
          const prompt = spark.llmPrompt`Based on CRM communication patterns, generate smart suggestions for improving sales productivity. Consider:
          
          - Email timing optimization
          - Meeting scheduling recommendations  
          - Follow-up action suggestions
          - Contact prioritization

          Return 5 suggestions as JSON with fields: type, title, description, confidence (0-1), reasoning, actionable (boolean)`
          
          const result = await spark.llm(prompt, 'gpt-4o', true)
          const aiSuggestions = JSON.parse(result)
          
          const formattedSuggestions: SmartSuggestion[] = aiSuggestions.suggestions?.map((s: any, index: number) => ({
            id: `suggestion-${Date.now()}-${index}`,
            type: s.type || 'follow_up_action',
            title: s.title,
            description: s.description,
            confidence: s.confidence,
            reasoning: s.reasoning,
            actionable: s.actionable,
            createdAt: new Date()
          })) || []
          
          setSuggestions(formattedSuggestions)
        } catch (error) {
          console.error('Failed to generate AI suggestions:', error)
        }
      }
    }

    generateSuggestions()
  }, [suggestions, setSuggestions])

  const handleActivityAction = async (activityId: string, action: string) => {
    const activity = activities.find(a => a.id === activityId)
    if (!activity) return

    switch (action) {
      case 'complete':
        setActivities(prev => prev.map(a => 
          a.id === activityId ? { ...a, status: 'completed' as const } : a
        ))
        toast.success('Activity marked as completed')
        break
      case 'schedule_followup':
        // Open calendar scheduling
        toast.info('Opening scheduling interface...')
        break
      case 'send_email':
        // Open email composer
        toast.info('Opening email composer...')
        break
    }
  }

  const executeSuggestion = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return

    try {
      switch (suggestion.type) {
        case 'email_template':
          toast.success('Email template applied')
          break
        case 'meeting_time':
          toast.success('Meeting time suggestion applied')
          break
        case 'follow_up_action':
          toast.success('Follow-up action created')
          break
        case 'contact_timing':
          toast.success('Contact timing optimized')
          break
      }

      // Remove executed suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    } catch (error) {
      toast.error('Failed to execute suggestion')
    }
  }

  const getActivityStats = () => {
    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      todayActivities: activities.filter(a => 
        format(a.timestamp, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      ).length,
      weekActivities: activities.filter(a => isAfter(a.timestamp, thisWeek)).length,
      pendingActivities: activities.filter(a => a.status === 'pending').length,
      completedActivities: activities.filter(a => a.status === 'completed').length
    }
  }

  const getUpcomingActivities = () => {
    const now = new Date()
    return activities
      .filter(a => isAfter(a.timestamp, now) && a.status === 'scheduled')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(0, 5)
  }

  const stats = getActivityStats()
  const upcomingActivities = getUpcomingActivities()

  return (
    <div className="space-y-6">
      {/* Communication Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Activities</p>
                <p className="text-2xl font-bold">{stats.todayActivities}</p>
              </div>
              <Clock size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.weekActivities}</p>
              </div>
              <ChartLine size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold">{stats.pendingActivities}</p>
              </div>
              <Warning size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedActivities}</p>
              </div>
              <CheckCircle size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Communication Hub</TabsTrigger>
          <TabsTrigger value="email">Email Management</TabsTrigger>
          <TabsTrigger value="calendar">Calendar & Scheduling</TabsTrigger>
          <TabsTrigger value="automation">Smart Automation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Communication Activities</CardTitle>
                <CardDescription>
                  Track all email, calls, and meetings in one unified timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'meeting' ? 'bg-green-100 text-green-600' :
                        activity.type === 'call' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.type === 'email' ? <Mail size={16} /> :
                         activity.type === 'meeting' ? <VideoCamera size={16} /> :
                         activity.type === 'call' ? <Phone size={16} /> :
                         <Target size={16} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge variant="outline" className={
                            activity.status === 'completed' ? 'text-green-600' :
                            activity.status === 'scheduled' ? 'text-blue-600' :
                            activity.status === 'pending' ? 'text-orange-600' :
                            'text-red-600'
                          }>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.relatedTo.name} • {format(activity.timestamp, 'MMM d, h:mm a')}
                        </p>
                        {activity.outcome && (
                          <p className="text-sm mt-1">{activity.outcome}</p>
                        )}
                        {activity.nextAction && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                            <ArrowRight size={12} />
                            Next: {activity.nextAction.description} 
                            <span className="text-muted-foreground">
                              ({format(activity.nextAction.dueDate, 'MMM d')})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {activity.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivityAction(activity.id, 'complete')}
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedActivity(activity)
                            setShowActivityDialog(true)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Activities</CardTitle>
                  <CardDescription>
                    Your scheduled communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingActivities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No upcoming activities</p>
                      </div>
                    ) : (
                      upcomingActivities.map((activity) => (
                        <div key={activity.id} className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">{activity.subject}</h5>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.timestamp, 'MMM d, h:mm a')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {activity.participants.length} participants
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>
                    Smart recommendations to improve efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <Robot size={16} className="text-purple-600 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{suggestion.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </Badge>
                              {suggestion.actionable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={() => executeSuggestion(suggestion.id)}
                                >
                                  Apply
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailIntegrationSystem 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarSchedulingSystem 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            leadId={leadId}
            contactId={contactId}
            dealId={dealId}
          />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <AutomationRulesManager
            automationRules={automationRules}
            onRulesChange={setAutomationRules}
            onCreateRule={() => setShowAutomationBuilder(true)}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AIInsightsDashboard
            suggestions={suggestions}
            activities={activities}
            onExecuteSuggestion={executeSuggestion}
          />
        </TabsContent>
      </Tabs>

      {/* Activity Detail Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <ActivityDetailView
              activity={selectedActivity}
              onAction={handleActivityAction}
              onClose={() => setShowActivityDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Automation Rules Manager Component
function AutomationRulesManager({ 
  automationRules, 
  onRulesChange, 
  onCreateRule 
}: {
  automationRules: AutomationRule[]
  onRulesChange: (rules: AutomationRule[]) => void
  onCreateRule: () => void
}) {
  const toggleRule = (ruleId: string) => {
    onRulesChange(automationRules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Automate your communication workflows with smart rules
          </p>
        </div>
        <Button onClick={onCreateRule}>
          <Lightning size={16} className="mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {automationRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{rule.name}</CardTitle>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium">Trigger</h5>
                  <p className="text-xs text-muted-foreground">
                    When {rule.trigger.type.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium">Actions ({rule.actions.length})</h5>
                  <div className="space-y-1">
                    {rule.actions.map((action, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {action.type.replace('_', ' ')}
                        {action.delay && ` (${action.delay}min delay)`}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Executed {rule.executionCount} times
                  </span>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// AI Insights Dashboard Component
function AIInsightsDashboard({ 
  suggestions, 
  activities, 
  onExecuteSuggestion 
}: {
  suggestions: SmartSuggestion[]
  activities: CommunicationActivity[]
  onExecuteSuggestion: (suggestionId: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Personalized suggestions to improve your communication efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Robot size={20} className="text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reasoning: {suggestion.reasoning}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                        {suggestion.actionable && (
                          <Button
                            size="sm"
                            onClick={() => onExecuteSuggestion(suggestion.id)}
                          >
                            Apply Suggestion
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Analytics</CardTitle>
            <CardDescription>
              Insights into your communication patterns and effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-sm">Email Performance</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your emails have a 73% open rate and 24% response rate
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-sm">Meeting Efficiency</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  92% of your meetings end on time with clear next steps
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-medium text-sm">Follow-up Consistency</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You follow up within 24 hours 85% of the time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Activity Detail View Component
function ActivityDetailView({ 
  activity, 
  onAction, 
  onClose 
}: {
  activity: CommunicationActivity
  onAction: (activityId: string, action: string) => void
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
          activity.type === 'meeting' ? 'bg-green-100 text-green-600' :
          activity.type === 'call' ? 'bg-purple-100 text-purple-600' :
          'bg-orange-100 text-orange-600'
        }`}>
          {activity.type === 'email' ? <Mail size={20} /> :
           activity.type === 'meeting' ? <VideoCamera size={20} /> :
           activity.type === 'call' ? <Phone size={20} /> :
           <Target size={20} />}
        </div>
        <div>
          <h3 className="font-semibold">{activity.subject}</h3>
          <p className="text-sm text-muted-foreground">
            {format(activity.timestamp, 'MMMM d, yyyy at h:mm a')}
          </p>
        </div>
      </div>

      {activity.description && (
        <div>
          <h4 className="font-medium text-sm mb-2">Description</h4>
          <p className="text-sm">{activity.description}</p>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm mb-2">Participants</h4>
        <div className="space-y-1">
          {activity.participants.map((participant, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{participant.name} ({participant.email})</span>
              <Badge variant="outline" className="text-xs">
                {participant.role}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {activity.outcome && (
        <div>
          <h4 className="font-medium text-sm mb-2">Outcome</h4>
          <p className="text-sm">{activity.outcome}</p>
        </div>
      )}

      {activity.nextAction && (
        <div>
          <h4 className="font-medium text-sm mb-2">Next Action</h4>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">{activity.nextAction.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Due: {format(activity.nextAction.dueDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        {activity.status === 'pending' && (
          <Button onClick={() => onAction(activity.id, 'complete')}>
            Mark Complete
          </Button>
        )}
        <Button variant="outline" onClick={() => onAction(activity.id, 'schedule_followup')}>
          Schedule Follow-up
        </Button>
        <Button variant="outline" onClick={() => onAction(activity.id, 'send_email')}>
          Send Email
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}