import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Eye,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  User,
  Zap
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, isAfter, parseISO, differenceInMinutes } from 'date-fns'

interface FollowUpNotification {
  id: string
  type: 'reminder' | 'escalation' | 'overdue' | 'success'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  leadId: string
  leadName: string
  actionRequired: string
  dueDate?: string
  createdAt: string
  isRead: boolean
  isActionable: boolean
  metadata: {
    reminderType?: string
    escalationLevel?: number
    daysSinceContact?: number
    leadScore?: number
  }
}

interface FollowUpNotificationSystemProps {
  companyId: string
  userId: string
  onNotificationAction?: (notificationId: string, action: string) => void
}

export function FollowUpNotificationSystem({ companyId, userId, onNotificationAction }: FollowUpNotificationSystemProps) {
  const [notifications, setNotifications] = useKV<FollowUpNotification[]>(`followup-notifications-${companyId}`, [])
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<FollowUpNotification | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Initialize with mock notifications for demo
  useEffect(() => {
    if (notifications.length === 0) {
      const mockNotifications: FollowUpNotification[] = [
        {
          id: 'notif-1',
          type: 'reminder',
          priority: 'high',
          title: 'Follow-up Reminder Due',
          message: 'John Smith from TechCorp needs immediate follow-up',
          leadId: 'lead-1',
          leadName: 'John Smith',
          actionRequired: 'Call or email within 2 hours',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isRead: false,
          isActionable: true,
          metadata: {
            reminderType: 'hot_lead_urgency',
            daysSinceContact: 3,
            leadScore: 85
          }
        },
        {
          id: 'notif-2',
          type: 'overdue',
          priority: 'critical',
          title: 'Overdue Follow-up',
          message: 'Sarah Johnson follow-up is 2 days overdue',
          leadId: 'lead-2',
          leadName: 'Sarah Johnson',
          actionRequired: 'Contact immediately or escalate',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          isActionable: true,
          metadata: {
            reminderType: 'contact_gap',
            daysSinceContact: 14,
            leadScore: 92
          }
        },
        {
          id: 'notif-3',
          type: 'escalation',
          priority: 'medium',
          title: 'Escalation Required',
          message: 'Mike Davis case escalated to manager level',
          leadId: 'lead-3',
          leadName: 'Mike Davis',
          actionRequired: 'Manager review required',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          isActionable: false,
          metadata: {
            reminderType: 'new_lead_followup',
            escalationLevel: 1,
            daysSinceContact: 8,
            leadScore: 67
          }
        },
        {
          id: 'notif-4',
          type: 'success',
          priority: 'low',
          title: 'Follow-up Completed',
          message: 'Lisa Wilson responded to follow-up email',
          leadId: 'lead-4',
          leadName: 'Lisa Wilson',
          actionRequired: 'Schedule next meeting',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          isActionable: true,
          metadata: {
            reminderType: 'contact_gap',
            daysSinceContact: 0,
            leadScore: 78
          }
        },
        {
          id: 'notif-5',
          type: 'reminder',
          priority: 'medium',
          title: 'Weekly Check-in Due',
          message: 'Robert Chen weekly follow-up scheduled',
          leadId: 'lead-5',
          leadName: 'Robert Chen',
          actionRequired: 'Send check-in email',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          isRead: false,
          isActionable: true,
          metadata: {
            reminderType: 'weekly_checkin',
            daysSinceContact: 7,
            leadScore: 71
          }
        }
      ]
      setNotifications(mockNotifications)
    }
  }, [])

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    ))
  }

  // Dismiss notification
  const dismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId))
    toast.success('Notification dismissed')
  }

  // Handle notification action
  const handleNotificationAction = (notificationId: string, action: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (!notification) return

    markAsRead(notificationId)
    
    if (onNotificationAction) {
      onNotificationAction(notificationId, action)
    }

    switch (action) {
      case 'call':
        toast.success(`Initiating call to ${notification.leadName}`)
        break
      case 'email':
        toast.success(`Opening email composer for ${notification.leadName}`)
        break
      case 'schedule':
        toast.success(`Opening calendar to schedule meeting with ${notification.leadName}`)
        break
      case 'view_lead':
        toast.success(`Opening lead profile for ${notification.leadName}`)
        break
      case 'snooze':
        toast.success(`Notification snoozed for 1 hour`)
        break
      default:
        toast.success('Action completed')
    }
  }

  // Get notification icon
  const getNotificationIcon = (notification: FollowUpNotification) => {
    switch (notification.type) {
      case 'reminder':
        return <Bell size={16} className="text-blue-500" />
      case 'overdue':
        return <AlertTriangle size={16} className="text-red-500" />
      case 'escalation':
        return <ArrowRight size={16} className="text-orange-500" />
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />
      default:
        return <Bell size={16} className="text-gray-500" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50/50'
      case 'high':
        return 'border-orange-500 bg-orange-50/50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50/50'
      case 'low':
        return 'border-green-500 bg-green-50/50'
      default:
        return 'border-gray-500 bg-gray-50/50'
    }
  }

  // Get urgency level for overdue notifications
  const getUrgencyLevel = (notification: FollowUpNotification) => {
    if (notification.type === 'overdue' && notification.dueDate) {
      const minutesOverdue = differenceInMinutes(new Date(), parseISO(notification.dueDate))
      if (minutesOverdue > 48 * 60) return 'critical'
      if (minutesOverdue > 24 * 60) return 'high'
      if (minutesOverdue > 4 * 60) return 'medium'
      return 'low'
    }
    return notification.priority
  }

  // Filter and sort notifications
  const sortedNotifications = notifications
    .sort((a, b) => {
      // Priority sorting
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[getUrgencyLevel(a) as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[getUrgencyLevel(b) as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) return bPriority - aPriority
      
      // Then by read status
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
      
      // Finally by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const criticalCount = notifications.filter(n => getUrgencyLevel(n) === 'critical').length

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotificationPanel(true)}
        className="relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <Badge 
            variant={criticalCount > 0 ? "destructive" : "default"}
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Floating notification for critical alerts */}
      {criticalCount > 0 && (
        <div className="fixed top-20 right-6 z-50 animate-pulse">
          <Card className="border-red-500 bg-red-50/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {criticalCount} critical follow-up{criticalCount > 1 ? 's' : ''} overdue
                </span>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setShowNotificationPanel(true)}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Panel Dialog */}
      <Dialog open={showNotificationPanel} onOpenChange={setShowNotificationPanel}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell size={20} />
              Follow-up Notifications
              <Badge variant="outline">
                {notifications.length} total, {unreadCount} unread
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {sortedNotifications.length > 0 ? (
                sortedNotifications.map((notification) => {
                  const urgency = getUrgencyLevel(notification)
                  const isOverdue = notification.type === 'overdue' || 
                    (notification.dueDate && isAfter(new Date(), parseISO(notification.dueDate)))
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`${getPriorityColor(urgency)} ${!notification.isRead ? 'border-l-4' : ''} cursor-pointer transition-all hover:shadow-md`}
                      onClick={() => {
                        setSelectedNotification(notification)
                        setShowDetails(true)
                        markAsRead(notification.id)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notification)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge variant={
                                  urgency === 'critical' ? 'destructive' :
                                  urgency === 'high' ? 'destructive' :
                                  urgency === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {urgency}
                                </Badge>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {notification.leadName}
                                </span>
                                {notification.metadata.leadScore && (
                                  <span className="flex items-center gap-1">
                                    <Zap size={12} />
                                    Score: {notification.metadata.leadScore}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {format(parseISO(notification.createdAt), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                              {notification.actionRequired && (
                                <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                                  <span className="font-medium">Action Required:</span> {notification.actionRequired}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {notification.isActionable && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNotificationAction(notification.id, 'call')
                                  }}
                                >
                                  <Phone size={12} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNotificationAction(notification.id, 'email')
                                  }}
                                >
                                  <Mail size={12} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNotificationAction(notification.id, 'schedule')
                                  }}
                                >
                                  <Calendar size={12} />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissNotification(notification.id)
                              }}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <CheckCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No follow-up notifications</p>
                  <p className="text-xs">All caught up!</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })))
                toast.success('All notifications marked as read')
              }}
            >
              Mark All Read
            </Button>
            <Button onClick={() => setShowNotificationPanel(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {getNotificationIcon(selectedNotification)}
                <div className="flex-1">
                  <h3 className="font-medium">{selectedNotification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedNotification.message}
                  </p>
                </div>
                <Badge variant={
                  getUrgencyLevel(selectedNotification) === 'critical' ? 'destructive' :
                  getUrgencyLevel(selectedNotification) === 'high' ? 'destructive' :
                  getUrgencyLevel(selectedNotification) === 'medium' ? 'secondary' : 'outline'
                }>
                  {getUrgencyLevel(selectedNotification)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Lead:</span> {selectedNotification.leadName}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedNotification.type}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {format(parseISO(selectedNotification.createdAt), 'PPp')}
                </div>
                {selectedNotification.dueDate && (
                  <div>
                    <span className="font-medium">Due:</span> {format(parseISO(selectedNotification.dueDate), 'PPp')}
                  </div>
                )}
              </div>

              {selectedNotification.metadata && (
                <div className="space-y-2">
                  <h4 className="font-medium">Additional Info:</h4>
                  <div className="text-sm space-y-1">
                    {selectedNotification.metadata.daysSinceContact && (
                      <p>Days since last contact: {selectedNotification.metadata.daysSinceContact}</p>
                    )}
                    {selectedNotification.metadata.leadScore && (
                      <p>Lead score: {selectedNotification.metadata.leadScore}/100</p>
                    )}
                    {selectedNotification.metadata.escalationLevel && (
                      <p>Escalation level: {selectedNotification.metadata.escalationLevel}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedNotification.actionRequired && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Action Required:</h4>
                  <p className="text-sm">{selectedNotification.actionRequired}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleNotificationAction(selectedNotification.id, 'view_lead')
                    setShowDetails(false)
                  }}
                >
                  <Eye size={16} className="mr-2" />
                  View Lead
                </Button>
                {selectedNotification.isActionable && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleNotificationAction(selectedNotification.id, 'snooze')
                      setShowDetails(false)
                    }}
                  >
                    <Clock size={16} className="mr-2" />
                    Snooze
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FollowUpNotificationSystem