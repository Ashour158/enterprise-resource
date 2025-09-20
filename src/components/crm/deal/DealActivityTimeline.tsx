import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  CheckCircle,
  XCircle,
  MessageCircle,
  VideoCamera,
  PresentationChart,
  Plus
} from '@phosphor-icons/react'

interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'demo' | 'proposal'
  subject: string
  description: string
  timestamp: string
  userId: string
  userName: string
  userAvatar?: string
  outcome?: string
  duration?: number
  attachments?: string[]
  metadata?: Record<string, any>
}

interface DealActivityTimelineProps {
  dealId: string
}

export function DealActivityTimeline({ dealId }: DealActivityTimelineProps) {
  const [activities, setActivities] = useKV<Activity[]>(`deal-activities-${dealId}`, [])
  const [showAddActivity, setShowAddActivity] = useState(false)

  // Generate mock activities if none exist
  React.useEffect(() => {
    if (activities.length === 0) {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'email',
          subject: 'Initial contact and introduction',
          description: 'Sent initial email introducing our solutions and requesting a discovery call.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: 'Sarah Johnson',
          outcome: 'responded',
          metadata: { opened: true, clicked: true }
        },
        {
          id: '2',
          type: 'call',
          subject: 'Discovery call',
          description: '45-minute discovery call to understand their requirements and pain points.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: 'Sarah Johnson',
          duration: 45,
          outcome: 'interested',
          metadata: { nextSteps: 'Send technical documentation' }
        },
        {
          id: '3',
          type: 'note',
          subject: 'Technical requirements gathered',
          description: 'Documented key technical requirements: 500+ users, SSO integration, API access needed.',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-2',
          userName: 'Mike Chen',
          metadata: { tags: ['technical', 'requirements'] }
        },
        {
          id: '4',
          type: 'demo',
          subject: 'Product demonstration',
          description: 'Conducted comprehensive product demo focusing on enterprise features and security.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: 'Sarah Johnson',
          duration: 60,
          outcome: 'very_interested',
          metadata: { attendees: 4, demo_type: 'enterprise' }
        },
        {
          id: '5',
          type: 'proposal',
          subject: 'Proposal sent',
          description: 'Sent comprehensive proposal including technical specifications and pricing.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: 'Sarah Johnson',
          attachments: ['proposal_v1.pdf'],
          metadata: { value: 250000, valid_until: '2024-01-15' }
        },
        {
          id: '6',
          type: 'meeting',
          subject: 'Stakeholder meeting scheduled',
          description: 'Scheduled meeting with IT director and procurement team for next week.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: 'Sarah Johnson',
          metadata: { meeting_type: 'stakeholder', attendees: ['IT Director', 'Procurement Manager'] }
        }
      ]
      setActivities(mockActivities)
    }
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4 text-blue-600" />
      case 'email': return <Mail className="h-4 w-4 text-green-600" />
      case 'meeting': return <Calendar className="h-4 w-4 text-purple-600" />
      case 'note': return <FileText className="h-4 w-4 text-gray-600" />
      case 'task': return <CheckCircle className="h-4 w-4 text-orange-600" />
      case 'demo': return <PresentationChart className="h-4 w-4 text-pink-600" />
      case 'proposal': return <FileText className="h-4 w-4 text-indigo-600" />
      default: return <MessageCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return null
    
    const variants = {
      'responded': 'bg-green-100 text-green-800',
      'interested': 'bg-blue-100 text-blue-800',
      'very_interested': 'bg-purple-100 text-purple-800',
      'not_interested': 'bg-red-100 text-red-800',
      'follow_up_needed': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <Badge className={variants[outcome as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {outcome.replace('_', ' ')}
      </Badge>
    )
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return time.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddActivity(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center z-10">
                {getActivityIcon(activity.type)}
              </div>
              
              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <Card className="mb-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{activity.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getOutcomeBadge(activity.outcome)}
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {activity.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{activity.userName}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {activity.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.duration}m
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Activity metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="border-t pt-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace('_', ' ')}:
                                </span>
                                <span className="font-medium">
                                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {activity.attachments && activity.attachments.length > 0 && (
                        <div className="border-t pt-3">
                          <h5 className="text-xs font-medium mb-2">Attachments:</h5>
                          <div className="flex flex-wrap gap-1">
                            {activity.attachments.map((attachment, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-medium mb-2">No activities yet</h3>
          <p className="text-sm">Start by adding your first activity or interaction</p>
          <Button className="mt-4" onClick={() => setShowAddActivity(true)}>
            Add First Activity
          </Button>
        </div>
      )}
    </div>
  )
}