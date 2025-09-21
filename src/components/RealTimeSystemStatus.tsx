import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Clock, 
  MessageCircle, 
  Users, 
  Star, 
  TrendUp, 
  TrendDown, 
  Activity, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Heart,
  Zap,
  Calendar,
  FileText,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lightbulb,
  Shield,
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  Settings,
  Filter,
  Search,
  ChevronUp,
  ChevronDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LiveNotification {
  id: string
  type: 'account_update' | 'health_change' | 'opportunity' | 'team_note' | 'activity' | 'mention' | 'alert'
  title: string
  message: string
  accountId: string
  accountName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  isRead: boolean
  actionRequired: boolean
  sourceUser?: {
    id: string
    name: string
    avatar?: string
  }
  metadata: Record<string, any>
}

interface TeamActivity {
  id: string
  type: 'note_added' | 'comment_added' | 'file_shared' | 'meeting_scheduled' | 'task_assigned' | 'status_changed'
  userId: string
  userName: string
  userAvatar?: string
  accountId: string
  accountName: string
  description: string
  timestamp: string
  isHighlighted: boolean
}

interface CollaborationMetrics {
  totalActiveUsers: number
  accountsBeingViewed: number
  notesAddedToday: number
  activitiesLoggedToday: number
  averageResponseTime: string
  teamProductivityScore: number
}

interface RealTimeSystemStatusProps {
  companyId: string
  userId: string
  userName: string
}

const RealTimeSystemStatus: React.FC<RealTimeSystemStatusProps> = ({
  companyId,
  userId,
  userName
}) => {
  const [notifications, setNotifications] = useKV<LiveNotification[]>(`live-notifications-${companyId}`, [])
  const [teamActivities, setTeamActivities] = useKV<TeamActivity[]>(`team-activities-${companyId}`, [])
  const [collaborationMetrics, setCollaborationMetrics] = useKV<CollaborationMetrics>(`collab-metrics-${companyId}`, {
    totalActiveUsers: 8,
    accountsBeingViewed: 15,
    notesAddedToday: 23,
    activitiesLoggedToday: 67,
    averageResponseTime: '4.2 min',
    teamProductivityScore: 87
  })

  const [expandedNotifications, setExpandedNotifications] = useState(true)
  const [expandedActivities, setExpandedActivities] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [isLiveUpdatesEnabled, setIsLiveUpdatesEnabled] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveUpdatesEnabled) return

    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.6) {
        const notificationTypes = [
          { type: 'health_change', title: 'Health Score Update', severity: 'medium', actionRequired: false },
          { type: 'opportunity', title: 'New Expansion Opportunity', severity: 'high', actionRequired: true },
          { type: 'team_note', title: 'Team Note Added', severity: 'low', actionRequired: false },
          { type: 'account_update', title: 'Account Information Updated', severity: 'low', actionRequired: false },
          { type: 'mention', title: 'You were mentioned', severity: 'medium', actionRequired: true },
          { type: 'alert', title: 'Account Risk Alert', severity: 'critical', actionRequired: true }
        ]

        const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const accounts = ['TechCorp Solutions', 'Innovation Labs', 'Global Industries', 'NextGen Systems']
        const randomAccount = accounts[Math.floor(Math.random() * accounts.length)]

        const newNotification: LiveNotification = {
          id: `notif-${Date.now()}`,
          type: randomNotif.type as any,
          title: randomNotif.title,
          message: `${randomNotif.title} for ${randomAccount}`,
          accountId: `acc-${Math.floor(Math.random() * 100)}`,
          accountName: randomAccount,
          severity: randomNotif.severity as any,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionRequired: randomNotif.actionRequired,
          sourceUser: {
            id: 'user-123',
            name: 'Sarah Johnson',
            avatar: '/api/placeholder/32/32'
          },
          metadata: {}
        }

        setNotifications(current => [newNotification, ...current].slice(0, 50))

        // Show toast notification for high severity items
        if (randomNotif.severity === 'high' || randomNotif.severity === 'critical') {
          toast[randomNotif.severity === 'critical' ? 'error' : 'warning'](
            randomNotif.title,
            { description: `${randomAccount}: ${newNotification.message}` }
          )
        }
      }

      // Simulate team activities
      if (Math.random() > 0.7) {
        const activityTypes = [
          { type: 'note_added', description: 'added a team note to' },
          { type: 'comment_added', description: 'commented on' },
          { type: 'file_shared', description: 'shared a document with' },
          { type: 'meeting_scheduled', description: 'scheduled a meeting for' },
          { type: 'task_assigned', description: 'assigned a task for' },
          { type: 'status_changed', description: 'updated the status of' }
        ]

        const teamMembers = ['Alex Chen', 'Maria Rodriguez', 'David Kim', 'Lisa Thompson', 'John Miller']
        const accounts = ['TechCorp Solutions', 'Innovation Labs', 'Global Industries', 'NextGen Systems']
        
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)]
        const randomAccount = accounts[Math.floor(Math.random() * accounts.length)]

        const newActivity: TeamActivity = {
          id: `activity-${Date.now()}`,
          type: randomActivity.type as any,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          userName: randomMember,
          userAvatar: '/api/placeholder/32/32',
          accountId: `acc-${Math.floor(Math.random() * 100)}`,
          accountName: randomAccount,
          description: `${randomMember} ${randomActivity.description} ${randomAccount}`,
          timestamp: new Date().toISOString(),
          isHighlighted: Math.random() > 0.7
        }

        setTeamActivities(current => [newActivity, ...current].slice(0, 30))
      }

      // Update collaboration metrics occasionally
      if (Math.random() > 0.8) {
        setCollaborationMetrics(current => ({
          ...current,
          totalActiveUsers: Math.max(1, current.totalActiveUsers + (Math.random() > 0.5 ? 1 : -1)),
          accountsBeingViewed: Math.max(0, current.accountsBeingViewed + (Math.random() > 0.5 ? 2 : -1)),
          notesAddedToday: current.notesAddedToday + (Math.random() > 0.7 ? 1 : 0),
          activitiesLoggedToday: current.activitiesLoggedToday + (Math.random() > 0.6 ? 1 : 0),
          teamProductivityScore: Math.min(100, Math.max(0, current.teamProductivityScore + (Math.random() - 0.5) * 5))
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLiveUpdatesEnabled, setNotifications, setTeamActivities, setCollaborationMetrics])

  const unreadNotifications = notifications.filter(n => !n.isRead)
  const criticalNotifications = notifications.filter(n => n.severity === 'critical')
  const actionRequiredNotifications = notifications.filter(n => n.actionRequired && !n.isRead)

  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.isRead) return false
    if (filterSeverity !== 'all' && notification.severity !== filterSeverity) return false
    if (filterType !== 'all' && notification.type !== filterType) return false
    return true
  })

  const markAsRead = (notificationId: string) => {
    setNotifications(current =>
      current.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(current =>
      current.map(n => ({ ...n, isRead: true }))
    )
  }

  const getNotificationIcon = (type: LiveNotification['type']) => {
    switch (type) {
      case 'health_change': return <Activity size={16} />
      case 'opportunity': return <Target size={16} />
      case 'team_note': return <MessageCircle size={16} />
      case 'account_update': return <Building size={16} />
      case 'mention': return <User size={16} />
      case 'alert': return <AlertTriangle size={16} />
      default: return <Bell size={16} />
    }
  }

  const getSeverityColor = (severity: LiveNotification['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActivityIcon = (type: TeamActivity['type']) => {
    switch (type) {
      case 'note_added': return <MessageCircle size={14} />
      case 'comment_added': return <MessageCircle size={14} />
      case 'file_shared': return <FileText size={14} />
      case 'meeting_scheduled': return <Calendar size={14} />
      case 'task_assigned': return <CheckCircle size={14} />
      case 'status_changed': return <Activity size={14} />
      default: return <Activity size={14} />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return time.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Collaboration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Live Collaboration Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveUpdatesEnabled(!isLiveUpdatesEnabled)}
              >
                {isLiveUpdatesEnabled ? <Pause size={16} /> : <Play size={16} />}
                {isLiveUpdatesEnabled ? 'Pause' : 'Resume'}
              </Button>
              <Badge variant={isLiveUpdatesEnabled ? 'default' : 'secondary'}>
                {isLiveUpdatesEnabled ? 'Live' : 'Paused'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-700">{collaborationMetrics.totalActiveUsers}</p>
              <p className="text-xs text-blue-600">Active Users</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700">{collaborationMetrics.accountsBeingViewed}</p>
              <p className="text-xs text-green-600">Accounts Viewed</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-purple-700">{collaborationMetrics.notesAddedToday}</p>
              <p className="text-xs text-purple-600">Notes Today</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-orange-700">{collaborationMetrics.activitiesLoggedToday}</p>
              <p className="text-xs text-orange-600">Activities Today</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-lg font-bold text-yellow-700">{collaborationMetrics.averageResponseTime}</p>
              <p className="text-xs text-yellow-600">Avg Response</p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-lg font-bold text-indigo-700">{Math.round(collaborationMetrics.teamProductivityScore)}%</p>
              <p className="text-xs text-indigo-600">Productivity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Notifications Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedNotifications(!expandedNotifications)}
                  className="h-auto p-0"
                >
                  {expandedNotifications ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Live Notifications
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive">{unreadNotifications.length}</Badge>
                  )}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings size={16} />
                </Button>
              </div>
            </div>
            {expandedNotifications && (
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-sm px-2 py-1 border rounded"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm px-2 py-1 border rounded"
                >
                  <option value="all">All Types</option>
                  <option value="health_change">Health Changes</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="team_note">Team Notes</option>
                  <option value="account_update">Account Updates</option>
                  <option value="mention">Mentions</option>
                  <option value="alert">Alerts</option>
                </select>
                <Button
                  variant={showOnlyUnread ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                >
                  Unread Only
                </Button>
              </div>
            )}
          </CardHeader>
          {expandedNotifications && (
            <CardContent>
              {/* Critical Alerts Banner */}
              {criticalNotifications.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      {criticalNotifications.length} Critical Alert{criticalNotifications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-red-700">
                    Immediate attention required for high-priority accounts
                  </div>
                </div>
              )}

              {/* Action Required Banner */}
              {actionRequiredNotifications.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {actionRequiredNotifications.length} Action{actionRequiredNotifications.length !== 1 ? 's' : ''} Required
                    </span>
                  </div>
                  <div className="text-sm text-yellow-700">
                    Tasks and opportunities waiting for your response
                  </div>
                </div>
              )}

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications matching your filters</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          notification.isRead ? 'bg-background' : 'bg-muted/30'
                        } hover:shadow-md ${getSeverityColor(notification.severity)}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.severity}
                              </Badge>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {notification.sourceUser && (
                                  <>
                                    <Avatar className="w-4 h-4">
                                      <AvatarImage src={notification.sourceUser.avatar} />
                                      <AvatarFallback>{notification.sourceUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{notification.sourceUser.name}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          )}
        </Card>

        {/* Team Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedActivities(!expandedActivities)}
                  className="h-auto p-0"
                >
                  {expandedActivities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Team Activity Feed
                  <Badge variant="outline">{teamActivities.length}</Badge>
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Filter size={16} />
              </Button>
            </div>
          </CardHeader>
          {expandedActivities && (
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {teamActivities.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Users size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No team activities yet</p>
                    </div>
                  ) : (
                    teamActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          activity.isHighlighted 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-background hover:bg-muted/30'
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.userAvatar} />
                          <AvatarFallback className="text-xs">
                            {activity.userName.split(' ').map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-muted-foreground">
                              {getActivityIcon(activity.type)}
                            </div>
                            <span className="text-sm font-medium">{activity.userName}</span>
                            {activity.isHighlighted && (
                              <Badge variant="secondary" className="text-xs">
                                Important
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <ArrowRight size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      </div>

      {/* System Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Real-Time System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-800">Collaboration Status</p>
                <p className="text-xs text-green-600">All systems operational</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-medium text-blue-800">Data Sync</p>
                <p className="text-xs text-blue-600">Real-time updates active</p>
              </div>
              <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm font-medium text-yellow-800">AI Processing</p>
                <p className="text-xs text-yellow-600">Running analytics</p>
              </div>
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="text-sm font-medium text-purple-800">Notifications</p>
                <p className="text-xs text-purple-600">{unreadNotifications.length} pending</p>
              </div>
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeSystemStatus