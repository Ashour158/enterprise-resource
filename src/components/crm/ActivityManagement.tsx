import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Activity } from '@/types/crm'
import { 
  Plus, 
  MagnifyingGlass as Search, 
  Download, 
  Phone,
  VideoCamera as Video,
  Users,
  MapPin,
  Calendar,
  Clock,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  CheckCircle,
  XCircle,
  SmileyXEyes as Neutral,
  SmileyMeh as Negative,
  Smiley as Positive,
  Warning
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ActivityManagementProps {
  companyId: string
  userId: string
  userRole: string
  onScheduleMeeting?: (activityId: string) => void
}

const mockActivities: Activity[] = [
  {
    id: 'activity-001',
    companyId: 'comp-001',
    type: 'call',
    subject: 'Discovery Call with Tech Solutions',
    description: 'Initial discovery call to understand their requirements and pain points',
    startDate: '2024-01-22T10:00:00Z',
    endDate: '2024-01-22T11:00:00Z',
    duration: 60,
    status: 'completed',
    priority: 'high',
    outcome: 'positive',
    contactId: 'contact-001',
    accountId: 'acc-001',
    dealId: 'deal-001',
    assignedTo: 'user-001',
    participants: ['user-001', 'contact-001'],
    location: 'Phone',
    isRecurring: false,
    reminders: [{ minutes: 15, sent: true }],
    attachments: [],
    tags: ['discovery', 'enterprise'],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-22T11:30:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'activity-002',
    companyId: 'comp-001',
    type: 'meeting',
    subject: 'Product Demo - Marketing Pro',
    description: 'Demonstrate our marketing automation platform features',
    startDate: '2024-01-25T14:00:00Z',
    endDate: '2024-01-25T15:30:00Z',
    duration: 90,
    status: 'planned',
    priority: 'medium',
    contactId: 'contact-002',
    accountId: 'acc-002',
    assignedTo: 'user-002',
    participants: ['user-002', 'contact-002', 'user-003'],
    location: 'Zoom Meeting',
    isRecurring: false,
    reminders: [{ minutes: 30, sent: false }, { minutes: 5, sent: false }],
    attachments: [
      {
        id: 'att-001',
        name: 'Demo Presentation.pptx',
        url: '/demo-presentation.pptx',
        size: 2048576,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }
    ],
    tags: ['demo', 'marketing'],
    createdAt: '2024-01-23T16:00:00Z',
    updatedAt: '2024-01-23T16:00:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'activity-003',
    companyId: 'comp-001',
    type: 'task',
    subject: 'Follow up on quote approval',
    description: 'Check with decision maker on quote Q-2024-001 approval status',
    startDate: '2024-01-26T09:00:00Z',
    status: 'planned',
    priority: 'urgent',
    contactId: 'contact-001',
    accountId: 'acc-001',
    dealId: 'deal-001',
    assignedTo: 'user-001',
    participants: ['user-001'],
    isRecurring: false,
    reminders: [{ minutes: 0, sent: false }],
    attachments: [],
    tags: ['follow-up', 'quote'],
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
    createdBy: 'user-001'
  }
]

export function ActivityManagement({ companyId, userId, userRole, onScheduleMeeting }: ActivityManagementProps) {
  const [activities, setActivities] = useKV<Activity[]>(`activities-${companyId}`, mockActivities)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState<Partial<Activity>>({})

  const activityTypes = [
    { value: 'call', label: 'Call', icon: <Phone size={16} /> },
    { value: 'email', label: 'Email', icon: <Phone size={16} /> },
    { value: 'meeting', label: 'Meeting', icon: <Users size={16} /> },
    { value: 'task', label: 'Task', icon: <CheckCircle size={16} /> },
    { value: 'note', label: 'Note', icon: <Edit size={16} /> },
    { value: 'demo', label: 'Demo', icon: <Video size={16} /> },
    { value: 'proposal', label: 'Proposal', icon: <Edit size={16} /> },
    { value: 'contract', label: 'Contract', icon: <Edit size={16} /> }
  ]

  const activityStatuses = [
    { value: 'planned', label: 'Planned', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
    { value: 'no_show', label: 'No Show', color: 'bg-orange-500' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ]

  const outcomes = [
    { value: 'positive', label: 'Positive', icon: <Positive size={16} />, color: 'text-green-600' },
    { value: 'neutral', label: 'Neutral', icon: <Neutral size={16} />, color: 'text-yellow-600' },
    { value: 'negative', label: 'Negative', icon: <Negative size={16} />, color: 'text-red-600' }
  ]

  const filteredActivities = (activities || []).filter(activity => {
    const matchesSearch = 
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateActivity = () => {
    if (!formData.subject || !formData.type || !formData.startDate) {
      toast.error('Please fill in required fields')
      return
    }

    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      companyId,
      type: formData.type as Activity['type'],
      subject: formData.subject,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      status: 'planned',
      priority: formData.priority || 'medium',
      outcome: formData.outcome as Activity['outcome'],
      contactId: formData.contactId,
      accountId: formData.accountId,
      dealId: formData.dealId,
      assignedTo: formData.assignedTo || userId,
      participants: formData.participants || [userId],
      location: formData.location,
      isRecurring: formData.isRecurring || false,
      recurringPattern: formData.recurringPattern,
      reminders: formData.reminders || [{ minutes: 15, sent: false }],
      attachments: [],
      tags: formData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    }

    setActivities(current => [...(current || []), newActivity])
    setFormData({})
    setShowActivityForm(false)
    toast.success('Activity created successfully')

    // Integrate with calendar if it's a meeting
    if (newActivity.type === 'meeting' && onScheduleMeeting) {
      onScheduleMeeting(newActivity.id)
    }
  }

  const handleUpdateActivity = (activityId: string, updates: Partial<Activity>) => {
    setActivities(current => {
      if (!current) return []
      return current.map(activity =>
        activity.id === activityId
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      )
    })
    toast.success('Activity updated successfully')
  }

  const handleDeleteActivity = (activityId: string) => {
    setActivities(current => {
      if (!current) return []
      return current.filter(activity => activity.id !== activityId)
    })
    toast.success('Activity deleted successfully')
  }

  const handleCompleteActivity = (activityId: string, outcome?: Activity['outcome']) => {
    handleUpdateActivity(activityId, {
      status: 'completed',
      outcome: outcome || 'positive'
    })
  }

  const handleCancelActivity = (activityId: string) => {
    handleUpdateActivity(activityId, {
      status: 'cancelled'
    })
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = activityTypes.find(t => t.value === type)
    return typeConfig?.icon || <CheckCircle size={16} />
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = activityStatuses.find(s => s.value === status)
    return (
      <Badge variant="outline" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority)
    return (
      <Badge variant="outline" className={`${priorityConfig?.color} text-white`}>
        {priorityConfig?.label || priority}
      </Badge>
    )
  }

  const getOutcomeIcon = (outcome?: string) => {
    if (!outcome) return null
    const outcomeConfig = outcomes.find(o => o.value === outcome)
    return outcomeConfig ? (
      <span className={outcomeConfig.color}>
        {outcomeConfig.icon}
      </span>
    ) : null
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {activityTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {activityStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Activity</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Activity Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Subject *</Label>
                  <Input
                    value={formData.subject || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Start Date/Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date/Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Office, Zoom, Phone, etc."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Outcome (if completed)</Label>
                  <Select
                    value={formData.outcome}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, outcome: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomes.map(outcome => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          <div className="flex items-center gap-2">
                            {outcome.icon}
                            {outcome.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowActivityForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateActivity}>
                  Log Activity
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities ({filteredActivities.length})</CardTitle>
          <CardDescription>
            Track calls, meetings, visits and other customer interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {getTypeIcon(activity.type)}
                        {activity.subject}
                      </div>
                      {activity.description && (
                        <div className="text-sm text-muted-foreground mt-1">{activity.description}</div>
                      )}
                      {activity.location && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activity.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(activity.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(activity.startDate)}</div>
                      {activity.endDate && (
                        <div className="text-muted-foreground">
                          - {formatDateTime(activity.endDate)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(activity.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getOutcomeIcon(activity.outcome)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {activity.status === 'planned' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCompleteActivity(activity.id, 'positive')}
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCancelActivity(activity.id)}
                          >
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedActivity(activity)}>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={14} className="mr-2" />
                            Edit Activity
                          </DropdownMenuItem>
                          {activity.type === 'meeting' && activity.status === 'planned' && (
                            <DropdownMenuItem onClick={() => onScheduleMeeting?.(activity.id)}>
                              <Calendar size={14} className="mr-2" />
                              Update Calendar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteActivity(activity.id)}>
                            <Trash size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Detail Dialog */}
      {selectedActivity && (
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedActivity.type)}
                {selectedActivity.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedActivity.type)}
                    <span>{activityTypes.find(t => t.value === selectedActivity.type)?.label}</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedActivity.status)}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedActivity.priority)}</div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="mt-1">{formatDuration(selectedActivity.duration)}</div>
                </div>
              </div>

              <div>
                <Label>Schedule</Label>
                <div className="mt-1">
                  <div><strong>Start:</strong> {formatDateTime(selectedActivity.startDate)}</div>
                  {selectedActivity.endDate && (
                    <div><strong>End:</strong> {formatDateTime(selectedActivity.endDate)}</div>
                  )}
                </div>
              </div>

              {selectedActivity.location && (
                <div>
                  <Label>Location</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin size={16} />
                    {selectedActivity.location}
                  </div>
                </div>
              )}

              {selectedActivity.description && (
                <div>
                  <Label>Description</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    {selectedActivity.description}
                  </div>
                </div>
              )}

              {selectedActivity.outcome && (
                <div>
                  <Label>Outcome</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {getOutcomeIcon(selectedActivity.outcome)}
                    <span>{outcomes.find(o => o.value === selectedActivity.outcome)?.label}</span>
                  </div>
                </div>
              )}

              {selectedActivity.participants.length > 1 && (
                <div>
                  <Label>Participants</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      <Users size={12} className="mr-1" />
                      {selectedActivity.participants.length} participants
                    </Badge>
                  </div>
                </div>
              )}

              {selectedActivity.attachments.length > 0 && (
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-1 space-y-2">
                    {selectedActivity.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                        <Edit size={16} />
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedActivity.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedActivity.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}