import React, { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Users, 
  MessageCircle, 
  Bell, 
  Activity, 
  TrendUp, 
  TrendDown, 
  AlertTriangle,
  Plus,
  Send,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Edit,
  Reply,
  Heart,
  Share,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Target,
  DollarSign,
  UserPlus,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Star,
  Lightbulb,
  Shield,
  Flame
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CollaborativeNote {
  id: string
  accountId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isPrivate: boolean
  mentions: string[]
  tags: string[]
  attachments: string[]
  comments: NoteComment[]
  reactions: NoteReaction[]
  editHistory: NoteEdit[]
}

interface NoteComment {
  id: string
  noteId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  parentCommentId?: string
  reactions: NoteReaction[]
}

interface NoteReaction {
  id: string
  type: 'like' | 'love' | 'laugh' | 'insight' | 'important'
  userId: string
  userName: string
  createdAt: string
}

interface NoteEdit {
  id: string
  content: string
  editedBy: string
  editedByName: string
  editedAt: string
  changeDescription: string
}

interface RealTimeActivity {
  id: string
  accountId: string
  type: 'note_created' | 'note_updated' | 'note_commented' | 'health_score_changed' | 'opportunity_detected' | 'interaction_logged' | 'deal_updated' | 'quote_sent'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  userName: string
  userAvatar?: string
  timestamp: string
  metadata: Record<string, any>
  isRead: boolean
  requiresAction: boolean
}

interface AccountHealthMetrics {
  currentScore: number
  previousScore: number
  trend: 'increasing' | 'stable' | 'decreasing'
  factors: HealthFactor[]
  lastUpdated: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface HealthFactor {
  name: string
  impact: number
  trend: 'positive' | 'neutral' | 'negative'
  description: string
}

interface ExpansionOpportunity {
  id: string
  accountId: string
  type: 'upsell' | 'cross_sell' | 'renewal' | 'expansion'
  title: string
  description: string
  potentialValue: number
  probability: number
  timeframe: string
  identifiedBy: 'ai' | 'user' | 'system'
  identifiedAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  nextSteps: string[]
  assignedTo?: string
  status: 'identified' | 'qualified' | 'pursuing' | 'won' | 'lost'
}

interface NotificationSettings {
  accountUpdates: boolean
  healthScoreChanges: boolean
  opportunityAlerts: boolean
  teamNotes: boolean
  mentions: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  slackIntegration: boolean
  minimumHealthScoreChange: number
  minimumOpportunityValue: number
}

interface RealTimeAccountCollaborationProps {
  accountId: string
  companyId: string
  userId: string
  userName: string
  userAvatar?: string
}

const RealTimeAccountCollaboration: React.FC<RealTimeAccountCollaborationProps> = ({
  accountId,
  companyId,
  userId,
  userName,
  userAvatar
}) => {
  const [notes, setNotes] = useKV<CollaborativeNote[]>(`account-notes-${accountId}`, [])
  const [activities, setActivities] = useKV<RealTimeActivity[]>(`account-activities-${accountId}`, [])
  const [healthMetrics, setHealthMetrics] = useKV<AccountHealthMetrics>(`account-health-${accountId}`, {
    currentScore: 75,
    previousScore: 72,
    trend: 'increasing',
    factors: [
      { name: 'Engagement Level', impact: 15, trend: 'positive', description: 'Increased email open rates and meeting attendance' },
      { name: 'Payment History', impact: 20, trend: 'positive', description: 'Consistent on-time payments' },
      { name: 'Product Usage', impact: 10, trend: 'neutral', description: 'Steady usage patterns' },
      { name: 'Support Tickets', impact: -5, trend: 'negative', description: 'Slight increase in support requests' }
    ],
    lastUpdated: new Date().toISOString(),
    riskLevel: 'low'
  })
  const [opportunities, setOpportunities] = useKV<ExpansionOpportunity[]>(`account-opportunities-${accountId}`, [])
  const [notificationSettings, setNotificationSettings] = useKV<NotificationSettings>(`notification-settings-${userId}`, {
    accountUpdates: true,
    healthScoreChanges: true,
    opportunityAlerts: true,
    teamNotes: true,
    mentions: true,
    emailNotifications: true,
    pushNotifications: true,
    slackIntegration: false,
    minimumHealthScoreChange: 5,
    minimumOpportunityValue: 10000
  })

  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [selectedNote, setSelectedNote] = useState<CollaborativeNote | null>(null)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const notesEndRef = useRef<HTMLDivElement>(null)
  const activitiesEndRef = useRef<HTMLDivElement>(null)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random activities
      if (Math.random() > 0.7) {
        const activityTypes = [
          { type: 'interaction_logged', title: 'New Email Interaction', severity: 'low' },
          { type: 'deal_updated', title: 'Deal Stage Updated', severity: 'medium' },
          { type: 'health_score_changed', title: 'Health Score Improved', severity: 'high' },
          { type: 'opportunity_detected', title: 'New Expansion Opportunity', severity: 'high' }
        ]
        
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const newActivity: RealTimeActivity = {
          id: `activity-${Date.now()}`,
          accountId,
          type: randomActivity.type as any,
          title: randomActivity.title,
          description: `AI detected ${randomActivity.title.toLowerCase()} for this account`,
          severity: randomActivity.severity as any,
          userId: 'system',
          userName: 'AI Assistant',
          timestamp: new Date().toISOString(),
          metadata: {},
          isRead: false,
          requiresAction: randomActivity.severity === 'high'
        }

        setActivities(currentActivities => [newActivity, ...currentActivities].slice(0, 50))
        setUnreadCount(count => count + 1)

        // Show notification
        if (notificationSettings.accountUpdates) {
          toast.info(randomActivity.title, {
            description: `Account ${accountId}: ${newActivity.description}`
          })
        }
      }

      // Simulate active users
      const users = ['user1', 'user2', 'user3', userId]
      setActiveUsers(users.slice(0, Math.floor(Math.random() * 3) + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [accountId, userId, notificationSettings])

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    activitiesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activities])

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    const newNote: CollaborativeNote = {
      id: `note-${Date.now()}`,
      accountId,
      content: newNoteContent,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isPrivate: false,
      mentions: [],
      tags: [],
      attachments: [],
      comments: [],
      reactions: [],
      editHistory: []
    }

    setNotes(currentNotes => [newNote, ...currentNotes])
    setNewNoteContent('')
    setIsAddingNote(false)

    // Add activity
    const activity: RealTimeActivity = {
      id: `activity-${Date.now()}`,
      accountId,
      type: 'note_created',
      title: 'New Team Note Added',
      description: `${userName} added a new note to the account`,
      severity: 'low',
      userId,
      userName,
      userAvatar,
      timestamp: new Date().toISOString(),
      metadata: { noteId: newNote.id },
      isRead: false,
      requiresAction: false
    }

    setActivities(currentActivities => [activity, ...currentActivities])
    toast.success('Note added successfully')
  }

  const handleAddComment = (noteId: string) => {
    if (!newCommentContent.trim()) return

    const comment: NoteComment = {
      id: `comment-${Date.now()}`,
      noteId,
      content: newCommentContent,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      createdAt: new Date().toISOString(),
      reactions: []
    }

    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { ...note, comments: [...note.comments, comment] }
          : note
      )
    )

    setNewCommentContent('')
    toast.success('Comment added')
  }

  const handleReaction = (noteId: string, reactionType: NoteReaction['type']) => {
    const reaction: NoteReaction = {
      id: `reaction-${Date.now()}`,
      type: reactionType,
      userId,
      userName,
      createdAt: new Date().toISOString()
    }

    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              reactions: [...note.reactions.filter(r => r.userId !== userId || r.type !== reactionType), reaction]
            }
          : note
      )
    )
  }

  const togglePinNote = (noteId: string) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { ...note, isPinned: !note.isPinned }
          : note
      )
    )
  }

  const markActivityAsRead = (activityId: string) => {
    setActivities(currentActivities =>
      currentActivities.map(activity =>
        activity.id === activityId
          ? { ...activity, isRead: true }
          : activity
      )
    )
    setUnreadCount(count => Math.max(0, count - 1))
  }

  const simulateHealthScoreChange = () => {
    const newScore = Math.max(0, Math.min(100, healthMetrics.currentScore + (Math.random() - 0.5) * 20))
    const scoreDifference = Math.abs(newScore - healthMetrics.currentScore)
    
    if (scoreDifference >= notificationSettings.minimumHealthScoreChange) {
      const newMetrics: AccountHealthMetrics = {
        ...healthMetrics,
        previousScore: healthMetrics.currentScore,
        currentScore: newScore,
        trend: newScore > healthMetrics.currentScore ? 'increasing' : newScore < healthMetrics.currentScore ? 'decreasing' : 'stable',
        lastUpdated: new Date().toISOString(),
        riskLevel: newScore < 30 ? 'critical' : newScore < 50 ? 'high' : newScore < 70 ? 'medium' : 'low'
      }

      setHealthMetrics(newMetrics)

      const activity: RealTimeActivity = {
        id: `activity-${Date.now()}`,
        accountId,
        type: 'health_score_changed',
        title: `Health Score ${newScore > healthMetrics.currentScore ? 'Improved' : 'Declined'}`,
        description: `Account health score changed from ${healthMetrics.currentScore.toFixed(1)} to ${newScore.toFixed(1)}`,
        severity: newScore < healthMetrics.currentScore ? 'high' : 'medium',
        userId: 'system',
        userName: 'AI Health Monitor',
        timestamp: new Date().toISOString(),
        metadata: { oldScore: healthMetrics.currentScore, newScore },
        isRead: false,
        requiresAction: newScore < 50
      }

      setActivities(currentActivities => [activity, ...currentActivities])

      if (notificationSettings.healthScoreChanges) {
        toast[newScore < healthMetrics.currentScore ? 'warning' : 'success'](activity.title, {
          description: activity.description
        })
      }
    }
  }

  const detectExpansionOpportunity = () => {
    const opportunityTypes = [
      { type: 'upsell', title: 'Premium Plan Upgrade', value: 25000, probability: 75 },
      { type: 'cross_sell', title: 'Additional Module License', value: 15000, probability: 60 },
      { type: 'expansion', title: 'Team Size Increase', value: 30000, probability: 80 },
      { type: 'renewal', title: 'Early Renewal Incentive', value: 50000, probability: 90 }
    ]

    const randomOpp = opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)]

    if (randomOpp.value >= notificationSettings.minimumOpportunityValue) {
      const opportunity: ExpansionOpportunity = {
        id: `opp-${Date.now()}`,
        accountId,
        type: randomOpp.type as any,
        title: randomOpp.title,
        description: `AI identified potential ${randomOpp.type} opportunity based on usage patterns and engagement metrics`,
        potentialValue: randomOpp.value,
        probability: randomOpp.probability,
        timeframe: '30-60 days',
        identifiedBy: 'ai',
        identifiedAt: new Date().toISOString(),
        priority: randomOpp.value > 30000 ? 'high' : randomOpp.value > 15000 ? 'medium' : 'low',
        nextSteps: [
          'Schedule discovery call',
          'Prepare proposal',
          'Identify decision makers',
          'Create custom demo'
        ],
        status: 'identified'
      }

      setOpportunities(currentOpps => [opportunity, ...currentOpps])

      const activity: RealTimeActivity = {
        id: `activity-${Date.now()}`,
        accountId,
        type: 'opportunity_detected',
        title: 'New Expansion Opportunity Detected',
        description: `AI identified ${randomOpp.title} worth $${randomOpp.value.toLocaleString()}`,
        severity: 'high',
        userId: 'system',
        userName: 'AI Opportunity Engine',
        timestamp: new Date().toISOString(),
        metadata: { opportunityId: opportunity.id, value: randomOpp.value },
        isRead: false,
        requiresAction: true
      }

      setActivities(currentActivities => [activity, ...currentActivities])

      if (notificationSettings.opportunityAlerts) {
        toast.success('New Expansion Opportunity!', {
          description: `${randomOpp.title} - $${randomOpp.value.toLocaleString()}`
        })
      }
    }
  }

  const getActivityIcon = (type: RealTimeActivity['type']) => {
    switch (type) {
      case 'note_created': return <MessageCircle size={16} />
      case 'note_updated': return <Edit size={16} />
      case 'note_commented': return <Reply size={16} />
      case 'health_score_changed': return <Activity size={16} />
      case 'opportunity_detected': return <Target size={16} />
      case 'interaction_logged': return <Users size={16} />
      case 'deal_updated': return <DollarSign size={16} />
      case 'quote_sent': return <FileText size={16} />
      default: return <Info size={16} />
    }
  }

  const getActivityColor = (severity: RealTimeActivity['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-blue-500'
      case 'low': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const unreadActivities = activities.filter(a => !a.isRead)

  return (
    <div className="space-y-6">
      {/* Real-Time Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Collaboration Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeUsers.length} team member{activeUsers.length !== 1 ? 's' : ''} online
                </span>
              </div>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user, index) => (
                  <Avatar key={user} className="w-6 h-6 border-2 border-background">
                    <AvatarFallback className="text-xs">U{index + 1}</AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">+{activeUsers.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell size={16} className="mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account Updates</span>
                      <Switch
                        checked={notificationSettings.accountUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, accountUpdates: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Health Score Changes</span>
                      <Switch
                        checked={notificationSettings.healthScoreChanges}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, healthScoreChanges: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Opportunity Alerts</span>
                      <Switch
                        checked={notificationSettings.opportunityAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, opportunityAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Team Notes</span>
                      <Switch
                        checked={notificationSettings.teamNotes}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, teamNotes: checked }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm">Minimum Health Score Change</span>
                      <Slider
                        value={[notificationSettings.minimumHealthScoreChange]}
                        onValueChange={([value]) => 
                          setNotificationSettings(prev => ({ ...prev, minimumHealthScoreChange: value }))
                        }
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">
                        {notificationSettings.minimumHealthScoreChange} points
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm">Minimum Opportunity Value</span>
                      <Slider
                        value={[notificationSettings.minimumOpportunityValue / 1000]}
                        onValueChange={([value]) => 
                          setNotificationSettings(prev => ({ ...prev, minimumOpportunityValue: value * 1000 }))
                        }
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">
                        ${notificationSettings.minimumOpportunityValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Live Activity Feed
                {unreadActivities.length > 0 && (
                  <Badge variant="destructive">{unreadActivities.length} new</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={simulateHealthScoreChange}>
                  <TrendUp size={16} className="mr-2" />
                  Simulate Health Change
                </Button>
                <Button variant="outline" size="sm" onClick={detectExpansionOpportunity}>
                  <Target size={16} className="mr-2" />
                  Detect Opportunity
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activities yet</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activity.isRead ? 'bg-background' : 'bg-muted/30'
                      } hover:bg-muted/50`}
                      onClick={() => markActivityAsRead(activity.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${getActivityColor(activity.severity)} mt-1`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {activity.severity}
                            </Badge>
                            {activity.requiresAction && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={activity.userAvatar} />
                              <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{activity.userName}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                        {!activity.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={activitiesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Collaborative Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={20} />
                Team Notes
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNote(true)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isAddingNote && (
              <div className="space-y-3 mb-4">
                <Textarea
                  placeholder="Add a note about this account..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleAddNote}>
                    <Send size={16} className="mr-2" />
                    Add Note
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingNote(false)
                      setNewNoteContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No team notes yet</p>
                    <p className="text-xs">Add the first note to start collaborating</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id} className="relative">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={note.authorAvatar} />
                              <AvatarFallback className="text-xs">
                                {note.authorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{note.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(note.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => togglePinNote(note.id)}
                            >
                              {note.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3">{note.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleReaction(note.id, 'like')}
                            >
                              <Heart size={12} className="mr-1" />
                              {note.reactions.filter(r => r.type === 'like').length}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleReaction(note.id, 'insight')}
                            >
                              <Lightbulb size={12} className="mr-1" />
                              {note.reactions.filter(r => r.type === 'insight').length}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setSelectedNote(note)}
                            >
                              <Reply size={12} className="mr-1" />
                              {note.comments.length}
                            </Button>
                          </div>
                          {note.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Pin size={10} className="mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                <div ref={notesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Health Score Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Account Health Monitor
            <Badge variant={
              healthMetrics.riskLevel === 'critical' ? 'destructive' :
              healthMetrics.riskLevel === 'high' ? 'destructive' :
              healthMetrics.riskLevel === 'medium' ? 'secondary' : 'default'
            }>
              {healthMetrics.riskLevel.toUpperCase()} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Score</span>
                <div className="flex items-center gap-2">
                  {healthMetrics.trend === 'increasing' && <TrendUp size={16} className="text-green-500" />}
                  {healthMetrics.trend === 'decreasing' && <TrendDown size={16} className="text-red-500" />}
                  {healthMetrics.trend === 'stable' && <div className="w-4 h-4" />}
                  <span className="text-2xl font-bold">{healthMetrics.currentScore}</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    healthMetrics.currentScore >= 70 ? 'bg-green-500' :
                    healthMetrics.currentScore >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${healthMetrics.currentScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Previous: {healthMetrics.previousScore}</span>
                <span>Change: {(healthMetrics.currentScore - healthMetrics.previousScore).toFixed(1)}</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-medium">Health Factors</h4>
              {healthMetrics.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      factor.trend === 'positive' ? 'bg-green-500' :
                      factor.trend === 'negative' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{factor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      factor.impact > 0 ? 'text-green-600' :
                      factor.impact < 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {factor.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expansion Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Expansion Opportunities
            {opportunities.length > 0 && (
              <Badge variant="default">{opportunities.length} Active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Target size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No expansion opportunities detected</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={detectExpansionOpportunity}
              >
                <Zap size={16} className="mr-2" />
                Run AI Detection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{opportunity.title}</h4>
                        <p className="text-xs text-muted-foreground">{opportunity.type.replace('_', ' ')}</p>
                      </div>
                      <Badge variant={
                        opportunity.priority === 'urgent' ? 'destructive' :
                        opportunity.priority === 'high' ? 'default' :
                        opportunity.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {opportunity.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{opportunity.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potential Value:</span>
                        <span className="font-medium text-green-600">
                          ${opportunity.potentialValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Probability:</span>
                        <span className="font-medium">{opportunity.probability}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="font-medium">{opportunity.timeframe}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground">Next Steps:</h5>
                      {opportunity.nextSteps.slice(0, 2).map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle size={12} className="text-muted-foreground" />
                          <span>{step}</span>
                        </div>
                      ))}
                      {opportunity.nextSteps.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{opportunity.nextSteps.length - 2} more steps
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <UserPlus size={12} className="mr-1" />
                        Assign
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar size={12} className="mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Detail Dialog */}
      {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Note Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedNote.authorAvatar} />
                  <AvatarFallback>{selectedNote.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{selectedNote.authorName}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(selectedNote.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{selectedNote.content}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Comments ({selectedNote.comments.length})</h4>
                {selectedNote.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 pl-4 border-l-2 border-muted">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="text-xs">{comment.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment(selectedNote.id)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(selectedNote.id)}
                    disabled={!newCommentContent.trim()}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default RealTimeAccountCollaboration