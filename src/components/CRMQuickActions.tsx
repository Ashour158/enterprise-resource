import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  PhoneCall, 
  VideoCamera, 
  Mail, 
  User, 
  Building, 
  Lightning, 
  CheckCircle,
  Clock,
  Target,
  TrendUp,
  Users
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CRMQuickActionsProps {
  companyId: string
  userId: string
  onScheduleMeeting: (type: string, entityId: string, entityType: string) => void
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  actionType: 'schedule_call' | 'schedule_demo' | 'send_email' | 'create_quote' | 'follow_up'
  entityType: 'lead' | 'contact' | 'account' | 'deal'
  entityId: string
  entityName: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  urgency: {
    lastContact: Date
    daysSinceContact: number
    nextActionDue: Date
  }
  aiRecommendation?: {
    confidence: number
    reasoning: string
    suggestedTime: Date
  }
}

export function CRMQuickActions({ companyId, userId, onScheduleMeeting }: CRMQuickActionsProps) {
  const [quickActions] = useState<QuickAction[]>([
    {
      id: 'action-001',
      title: 'Follow-up Call with TechCorp Inc.',
      description: 'Discovery call follow-up to discuss proposal timeline',
      icon: <PhoneCall size={16} />,
      actionType: 'schedule_call',
      entityType: 'lead',
      entityId: 'lead-001',
      entityName: 'TechCorp Inc.',
      priority: 'high',
      urgency: {
        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        daysSinceContact: 3,
        nextActionDue: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
      },
      aiRecommendation: {
        confidence: 87,
        reasoning: 'High engagement score, decision maker identified, proposal requested',
        suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      }
    },
    {
      id: 'action-002',
      title: 'Product Demo for RetailPlus',
      description: 'Schedule technical demo focusing on inventory management',
      icon: <VideoCamera size={16} />,
      actionType: 'schedule_demo',
      entityType: 'deal',
      entityId: 'deal-001',
      entityName: 'RetailPlus Solutions',
      priority: 'urgent',
      urgency: {
        lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        daysSinceContact: 5,
        nextActionDue: new Date(Date.now() + 12 * 60 * 60 * 1000) // Due in 12 hours
      },
      aiRecommendation: {
        confidence: 92,
        reasoning: 'Deal value >$100k, technical evaluation phase, competitor analysis needed',
        suggestedTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
      }
    },
    {
      id: 'action-003',
      title: 'Contract Review with Global Manufacturing',
      description: 'Final contract terms discussion before signing',
      icon: <Target size={16} />,
      actionType: 'schedule_call',
      entityType: 'deal',
      entityId: 'deal-002',
      entityName: 'Global Manufacturing',
      priority: 'urgent',
      urgency: {
        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        daysSinceContact: 1,
        nextActionDue: new Date(Date.now() + 8 * 60 * 60 * 1000) // Due in 8 hours
      },
      aiRecommendation: {
        confidence: 95,
        reasoning: 'Contract negotiation phase, legal team engaged, Q4 budget deadline approaching',
        suggestedTime: new Date(Date.now() + 48 * 60 * 60 * 1000) // In 2 days
      }
    },
    {
      id: 'action-004',
      title: 'Check-in with StartupXYZ',
      description: 'Quarterly business review and expansion opportunities',
      icon: <TrendUp size={16} />,
      actionType: 'follow_up',
      entityType: 'account',
      entityId: 'account-001',
      entityName: 'StartupXYZ',
      priority: 'medium',
      urgency: {
        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        daysSinceContact: 7,
        nextActionDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Due in 3 days
      },
      aiRecommendation: {
        confidence: 78,
        reasoning: 'Strong relationship, expansion potential, Q4 planning cycle',
        suggestedTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // In 3 days
      }
    }
  ])

  const handleQuickAction = (action: QuickAction) => {
    switch (action.actionType) {
      case 'schedule_call':
      case 'schedule_demo':
        onScheduleMeeting(action.actionType, action.entityId, action.entityType)
        toast.success(`Scheduling ${action.actionType.replace('_', ' ')} with ${action.entityName}`)
        break
      case 'send_email':
        toast.info(`Opening email composer for ${action.entityName}`)
        break
      case 'create_quote':
        toast.info(`Creating quote for ${action.entityName}`)
        break
      case 'follow_up':
        onScheduleMeeting('follow_up', action.entityId, action.entityType)
        toast.success(`Scheduling follow-up with ${action.entityName}`)
        break
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyBadgeVariant = (daysSinceContact: number) => {
    if (daysSinceContact >= 7) return 'destructive'
    if (daysSinceContact >= 3) return 'secondary'
    return 'outline'
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'lead': return <User size={14} />
      case 'contact': return <User size={14} />
      case 'account': return <Building size={14} />
      case 'deal': return <Target size={14} />
      default: return <User size={14} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightning size={18} />
          Smart CRM Actions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations for your next CRM activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(action.priority)}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {action.icon}
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      {action.aiRecommendation && (
                        <Badge variant="secondary" className="text-xs">
                          AI {action.aiRecommendation.confidence}%
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        {getEntityIcon(action.entityType)}
                        <span>{action.entityName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Last contact: {action.urgency.daysSinceContact}d ago</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Due: {action.urgency.nextActionDue.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {action.entityType}
                      </Badge>
                      <Badge variant={getUrgencyBadgeVariant(action.urgency.daysSinceContact)} className="text-xs">
                        {action.urgency.daysSinceContact >= 7 ? 'Overdue' : 
                         action.urgency.daysSinceContact >= 3 ? 'Due Soon' : 'On Track'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.priority} priority
                      </Badge>
                    </div>

                    {action.aiRecommendation && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>AI Insight:</strong> {action.aiRecommendation.reasoning}
                        </p>
                        <p className="text-blue-600 dark:text-blue-300 mt-1">
                          Suggested time: {action.aiRecommendation.suggestedTime.toLocaleDateString()} at {action.aiRecommendation.suggestedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="whitespace-nowrap"
                    >
                      <Calendar size={14} className="mr-2" />
                      Schedule
                    </Button>
                    
                    {action.actionType === 'schedule_call' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`Sending email to ${action.entityName}`)}
                        className="whitespace-nowrap"
                      >
                        <Mail size={14} className="mr-2" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {quickActions.filter(a => a.priority === 'urgent').length} urgent actions • 
                {quickActions.filter(a => a.urgency.daysSinceContact >= 7).length} overdue
              </span>
              <Button variant="ghost" size="sm">
                <Users size={14} className="mr-2" />
                View All CRM Tasks
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CRMQuickActions