import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement, ClickableDataGroup, QuickActions } from '@/components/shared/ClickableDataElements'
import { FileAttachmentSystem } from '@/components/shared/FileAttachmentSystem'
import { 
  User, 
  Building, 
  EnvelopeSimple as Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Tag, 
  TrendUp, 
  ChartLine, 
  Users, 
  Activity, 
  FileText, 
  Brain, 
  Edit, 
  Save, 
  X, 
  Plus,
  Clock,
  Target,
  CurrencyDollar,
  NotePencil,
  PaperPlaneRight,
  VideoCamera,
  Globe,
  LinkedinLogo,
  TwitterLogo,
  FacebookLogo,
  Star,
  Warning,
  CheckCircle,
  Calendar as CalendarIcon,
  Export
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Types for entity data
export interface EntityData {
  id: string
  type: 'lead' | 'contact' | 'account' | 'deal' | 'quote'
  name: string
  email?: string
  phone?: string
  mobile?: string
  company?: string
  jobTitle?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  tags?: string[]
  status?: string
  priority?: string
  value?: number
  probability?: number
  closeDate?: string
  source?: string
  assignedTo?: string
  description?: string
  notes?: string
  customFields?: Record<string, any>
  socialProfiles?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  aiInsights?: {
    score?: number
    conversionProbability?: number
    nextBestAction?: string
    buyingSignals?: string[]
    risks?: string[]
    opportunities?: string[]
  }
  lastActivity?: {
    type: string
    date: string
    description: string
    outcome?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface ActivityData {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'visit'
  subject: string
  description: string
  date: string
  duration?: number
  outcome?: string
  relatedRecords?: { type: string; id: string; name: string }[]
  attachments?: string[]
  createdBy: string
  participants?: string[]
  location?: string
  status?: 'completed' | 'scheduled' | 'cancelled'
}

export interface EmailData {
  id: string
  subject: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  body: string
  date: string
  status: 'sent' | 'draft' | 'failed'
  isRead?: boolean
  attachments?: string[]
  inReplyTo?: string
  threadId?: string
}

interface FullPageDetailViewProps {
  entityData: EntityData
  companyId: string
  userId: string
  onClose: () => void
  onUpdate: (updatedData: EntityData) => void
  onAction: (action: string, data: any) => void
}

export function FullPageDetailView({
  entityData,
  companyId,
  userId,
  onClose,
  onUpdate,
  onAction
}: FullPageDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<EntityData>(entityData)
  const [activities, setActivities] = useKV<ActivityData[]>(`${entityData.type}-activities-${entityData.id}`, [])
  const [emails, setEmails] = useKV<EmailData[]>(`${entityData.type}-emails-${entityData.id}`, [])
  const [notes, setNotes] = useKV<string[]>(`${entityData.type}-notes-${entityData.id}`, [])
  const [newNote, setNewNote] = useState('')
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [emailDraft, setEmailDraft] = useState({
    to: entityData.email || '',
    subject: '',
    body: ''
  })

  useEffect(() => {
    // Simulate loading activities
    if (activities.length === 0) {
      const mockActivities: ActivityData[] = [
        {
          id: 'activity-1',
          type: 'call',
          subject: 'Initial Discovery Call',
          description: 'Discussed project requirements and timeline',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          outcome: 'qualified',
          createdBy: 'John Smith',
          status: 'completed'
        },
        {
          id: 'activity-2',
          type: 'email',
          subject: 'Follow-up Information',
          description: 'Sent proposal and pricing information',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Jane Doe',
          status: 'completed'
        },
        {
          id: 'activity-3',
          type: 'meeting',
          subject: 'Product Demo',
          description: 'Scheduled product demonstration',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          createdBy: 'Mike Johnson',
          status: 'scheduled',
          location: 'Video Conference'
        }
      ]
      setActivities(mockActivities)
    }

    // Simulate loading emails
    if (emails.length === 0) {
      const mockEmails: EmailData[] = [
        {
          id: 'email-1',
          subject: 'Re: Project Discussion',
          from: entityData.email || 'contact@example.com',
          to: ['sales@company.com'],
          body: 'Thank you for the information. We are very interested in proceeding with the project.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          isRead: true,
          threadId: 'thread-1'
        },
        {
          id: 'email-2',
          subject: 'Project Timeline',
          from: 'sales@company.com',
          to: [entityData.email || 'contact@example.com'],
          body: 'Here is the proposed timeline for your project implementation.',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          isRead: false,
          threadId: 'thread-1'
        }
      ]
      setEmails(mockEmails)
    }
  }, [])

  const handleSave = () => {
    onUpdate(editedData)
    setIsEditing(false)
    toast.success(`${entityData.type} updated successfully`)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString()
      setNotes(prev => [`[${timestamp}] ${newNote}`, ...prev])
      setNewNote('')
      toast.success('Note added')
    }
  }

  const handleQuickAction = (action: string, data: any) => {
    switch (action) {
      case 'call':
        onAction('call', data)
        break
      case 'email':
        setEmailDraft(prev => ({ ...prev, to: data.email }))
        setShowEmailComposer(true)
        break
      case 'meeting':
        onAction('meeting', data)
        break
    }
  }

  const handleSendEmail = () => {
    const newEmail: EmailData = {
      id: `email-${Date.now()}`,
      subject: emailDraft.subject,
      from: 'user@company.com',
      to: [emailDraft.to],
      body: emailDraft.body,
      date: new Date().toISOString(),
      status: 'sent',
      threadId: `thread-${Date.now()}`
    }
    
    setEmails(prev => [newEmail, ...prev])
    setEmailDraft({ to: '', subject: '', body: '' })
    setShowEmailComposer(false)
    toast.success('Email sent successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hot':
      case 'qualified':
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'warm':
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800'
      case 'cold':
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'lost':
      case 'unqualified':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Star className="text-red-500" size={16} />
      case 'medium':
        return <Warning className="text-yellow-500" size={16} />
      case 'low':
        return <CheckCircle className="text-green-500" size={16} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onClose}>
                <X size={16} />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://avatar.vercel.sh/${entityData.name}`} />
                <AvatarFallback>
                  {entityData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? (
                    <Input
                      value={editedData.name}
                      onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    entityData.name
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(entityData.status || '')}>
                    {entityData.status}
                  </Badge>
                  {entityData.priority && getPriorityIcon(entityData.priority)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {entityData.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <QuickActions
                entityType={entityData.type}
                entityId={entityData.id}
                entityData={entityData}
                companyId={companyId}
                userId={userId}
                onAction={handleQuickAction}
              />
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity size={16} />
              Activity Timeline
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail size={16} />
              Email History
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <CalendarIcon size={16} />
              Meetings & Calls
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText size={16} />
              Documents
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <NotePencil size={16} />
              Team Notes
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain size={16} />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.email || ''}
                          onChange={(e) => setEditedData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        entityData.email ? (
                          <ClickableDataElement
                            type="email"
                            value={entityData.email}
                            companyId={companyId}
                            userId={userId}
                            onEmailCompose={(email) => {
                              setEmailDraft(prev => ({ ...prev, to: email }))
                              setShowEmailComposer(true)
                            }}
                          />
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.phone || ''}
                          onChange={(e) => setEditedData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        entityData.phone ? (
                          <ClickableDataElement
                            type="phone"
                            value={entityData.phone}
                            companyId={companyId}
                            userId={userId}
                            onPhoneCall={(phone) => onAction('call', { phone, entityId: entityData.id })}
                          />
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Company</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.company || ''}
                          onChange={(e) => setEditedData(prev => ({ ...prev, company: e.target.value }))}
                        />
                      ) : (
                        entityData.company ? (
                          <ClickableDataElement
                            type="company"
                            value={entityData.company}
                            entityId={entityData.id}
                            companyId={companyId}
                            userId={userId}
                            onProfileView={(id, type) => onAction('view_company', { id, type })}
                          />
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      {isEditing ? (
                        <Input
                          value={editedData.jobTitle || ''}
                          onChange={(e) => setEditedData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        />
                      ) : (
                        <span>{entityData.jobTitle || 'Not provided'}</span>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      {isEditing ? (
                        <Textarea
                          value={editedData.address || ''}
                          onChange={(e) => setEditedData(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                        />
                      ) : (
                        entityData.address ? (
                          <ClickableDataElement
                            type="address"
                            value={entityData.address}
                            companyId={companyId}
                            userId={userId}
                            onMapView={(address) => onAction('view_map', { address })}
                          />
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Social Profiles */}
                  {entityData.socialProfiles && (
                    <div className="space-y-2">
                      <Label>Social Profiles</Label>
                      <div className="flex items-center gap-4">
                        {entityData.socialProfiles.linkedin && (
                          <ClickableDataElement
                            type="website"
                            value={entityData.socialProfiles.linkedin}
                            displayValue="LinkedIn"
                            companyId={companyId}
                            userId={userId}
                            className="flex items-center gap-1 text-blue-600"
                          />
                        )}
                        {entityData.socialProfiles.twitter && (
                          <ClickableDataElement
                            type="website"
                            value={entityData.socialProfiles.twitter}
                            displayValue="Twitter"
                            companyId={companyId}
                            userId={userId}
                            className="flex items-center gap-1 text-blue-400"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entityData.tags && entityData.tags.length > 0 && (
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {entityData.tags.map((tag, index) => (
                          <ClickableDataElement
                            key={index}
                            type="tag"
                            value={tag}
                            companyId={companyId}
                            userId={userId}
                            onTagFilter={(tag) => onAction('filter_by_tag', { tag })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entityData.value && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value</span>
                      <ClickableDataElement
                        type="currency"
                        value={entityData.value.toString()}
                        displayValue={`$${entityData.value.toLocaleString()}`}
                        companyId={companyId}
                        userId={userId}
                        onFinancialView={(amount) => onAction('view_financial', { amount, entityId: entityData.id })}
                      />
                    </div>
                  )}
                  
                  {entityData.probability && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Probability</span>
                      <Badge variant="outline">{entityData.probability}%</Badge>
                    </div>
                  )}

                  {entityData.closeDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Close Date</span>
                      <ClickableDataElement
                        type="date"
                        value={entityData.closeDate}
                        companyId={companyId}
                        userId={userId}
                        onCalendarView={(date) => onAction('view_calendar', { date })}
                      />
                    </div>
                  )}

                  {entityData.source && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Source</span>
                      <Badge variant="outline">{entityData.source}</Badge>
                    </div>
                  )}

                  {entityData.lastActivity && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Last Activity</span>
                      <div className="text-sm">
                        <div className="font-medium">{entityData.lastActivity.type}</div>
                        <div className="text-muted-foreground">
                          {new Date(entityData.lastActivity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Timeline Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Complete interaction history with filtering options</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'call' && <Phone size={20} className="text-blue-500" />}
                          {activity.type === 'email' && <Mail size={20} className="text-green-500" />}
                          {activity.type === 'meeting' && <VideoCamera size={20} className="text-purple-500" />}
                          {activity.type === 'note' && <NotePencil size={20} className="text-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.subject}</h4>
                            <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(activity.date).toLocaleString()}</span>
                            <span>{activity.createdBy}</span>
                            {activity.duration && <span>{activity.duration} min</span>}
                            {activity.outcome && (
                              <Badge variant="outline" className="text-xs">
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email History Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Communications</h3>
              <Button onClick={() => setShowEmailComposer(true)}>
                <PaperPlaneRight size={16} className="mr-2" />
                Compose Email
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-4 p-4">
                    {emails.map((email) => (
                      <div key={email.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{email.subject}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={email.status === 'sent' ? 'default' : 'outline'}>
                              {email.status}
                            </Badge>
                            {!email.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>From: {email.from}</span>
                          <span>To: {email.to.join(', ')}</span>
                          <span>{new Date(email.date).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{email.body}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Related Documents</CardTitle>
                <CardDescription>All files and quotes associated with this {entityData.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <FileAttachmentSystem
                  entityId={entityData.id}
                  entityType={entityData.type}
                  companyId={companyId}
                  userId={userId}
                  allowedTypes={['*']}
                  maxFileSize={25 * 1024 * 1024}
                  maxFiles={50}
                  showPreview={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Notes</CardTitle>
                <CardDescription>Collaborative notes with real-time editing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Plus size={16} />
                  </Button>
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {notes.map((note, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {entityData.aiInsights && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Score & Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {entityData.aiInsights.score && (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{entityData.aiInsights.score}</div>
                          <div className="text-sm text-muted-foreground">AI Score</div>
                        </div>
                      )}
                      
                      {entityData.aiInsights.conversionProbability && (
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-green-600">
                            {(entityData.aiInsights.conversionProbability * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Conversion Probability</div>
                        </div>
                      )}

                      {entityData.aiInsights.nextBestAction && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-sm text-blue-900">Next Best Action</h4>
                          <p className="text-sm text-blue-700 mt-1">{entityData.aiInsights.nextBestAction}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {entityData.aiInsights.buyingSignals && entityData.aiInsights.buyingSignals.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-green-600 mb-2">Buying Signals</h4>
                          <ul className="space-y-1">
                            {entityData.aiInsights.buyingSignals.map((signal, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entityData.aiInsights.risks && entityData.aiInsights.risks.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-red-600 mb-2">Risks</h4>
                          <ul className="space-y-1">
                            {entityData.aiInsights.risks.map((risk, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <Warning size={14} className="text-red-500" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entityData.aiInsights.opportunities && entityData.aiInsights.opportunities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-blue-600 mb-2">Opportunities</h4>
                          <ul className="space-y-1">
                            {entityData.aiInsights.opportunities.map((opportunity, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <Target size={14} className="text-blue-500" />
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Composer Modal */}
      <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={emailDraft.to}
                onChange={(e) => setEmailDraft(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailDraft.subject}
                onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                rows={8}
                value={emailDraft.body}
                onChange={(e) => setEmailDraft(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEmailComposer(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <PaperPlaneRight size={16} className="mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}