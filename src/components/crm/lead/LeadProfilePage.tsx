import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  User, 
  Phone, 
  EnvelopeSimple as Mail, 
  MapPin, 
  Buildings, 
  Calendar as CalendarIcon,
  Clock,
  TrendUp,
  Star,
  Target,
  Brain,
  FileText,
  PaperclipHorizontal,
  ChatCircle,
  Users,
  Eye,
  PencilSimple,
  Plus,
  Download,
  Share,
  X,
  Check,
  Warning,
  Lightning,
  Heart,
  ThumbsUp,
  Chat,
  VideoCamera,
  ClockCounterClockwise,
  Tag,
  Flag,
  Sparkle,
  Robot,
  Lightbulb,
  ChartLine,
  Globe,
  LinkedinLogo,
  TwitterLogo,
  InstagramLogo,
  ArrowRight,
  Cursor,
  Circle
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Lead {
  id: string
  lead_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  mobile?: string
  job_title?: string
  company_name?: string
  company_website?: string
  industry?: string
  lead_status: string
  lead_rating: string
  lead_priority: string
  ai_lead_score: number
  ai_conversion_probability: number
  ai_estimated_deal_value: number
  ai_next_best_action?: string
  assigned_to?: string
  last_contact_date?: string
  next_follow_up_date?: string
  contact_attempts: number
  engagement_score: number
  address_line1?: string
  city?: string
  state?: string
  country?: string
  linkedin_url?: string
  tags: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface Activity {
  id: string
  activity_type: string
  activity_subject: string
  activity_description: string
  activity_date: string
  duration_minutes?: number
  outcome?: string
  next_action?: string
  next_action_date?: string
  ai_sentiment_score?: number
  ai_intent_detected?: string
  created_by: string
  created_by_name: string
  attachments: string[]
}

interface EmailThread {
  id: string
  subject: string
  from: string
  to: string[]
  cc?: string[]
  body: string
  timestamp: string
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'delivered' | 'opened' | 'clicked'
  attachments: string[]
}

interface Meeting {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location?: string
  meeting_type: 'call' | 'video' | 'in_person'
  attendees: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  outcome?: string
  recording_url?: string
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_by: string
  uploaded_at: string
  category: string
}

interface TeamNote {
  id: string
  content: string
  author: string
  author_name: string
  created_at: string
  updated_at: string
  is_pinned: boolean
  tags: string[]
}

interface AIInsight {
  id: string
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  action_items: string[]
  generated_at: string
}

interface CollaborationUser {
  id: string
  name: string
  avatar: string
  cursor_position?: { x: number; y: number }
  current_section?: string
  last_seen: string
}

interface LeadProfilePageProps {
  leadId: string
  companyId: string
  userId: string
  onClose: () => void
}

export function LeadProfilePage({ leadId, companyId, userId, onClose }: LeadProfilePageProps) {
  const [lead, setLead] = useKV<Lead>(`lead-${leadId}`, {
    id: leadId,
    lead_number: 'LEAD-2024-001',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    mobile: '+1 (555) 987-6543',
    job_title: 'VP of Engineering',
    company_name: 'TechCorp Solutions',
    company_website: 'https://techcorp.com',
    industry: 'Software Development',
    lead_status: 'qualified',
    lead_rating: 'hot',
    lead_priority: 'high',
    ai_lead_score: 85,
    ai_conversion_probability: 0.78,
    ai_estimated_deal_value: 125000,
    ai_next_best_action: 'Schedule demo call within 48 hours',
    assigned_to: 'user-001',
    last_contact_date: '2024-01-15T10:30:00Z',
    next_follow_up_date: '2024-01-17T14:00:00Z',
    contact_attempts: 3,
    engagement_score: 92,
    address_line1: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    tags: ['Enterprise', 'High Value', 'Technical Decision Maker'],
    notes: 'Highly engaged prospect with strong technical background. Interested in our enterprise solution.',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-15T15:30:00Z'
  })

  const [activities, setActivities] = useKV<Activity[]>(`lead-activities-${leadId}`, [
    {
      id: 'act-001',
      activity_type: 'call',
      activity_subject: 'Discovery Call',
      activity_description: 'Initial discovery call to understand requirements and pain points.',
      activity_date: '2024-01-15T10:30:00Z',
      duration_minutes: 45,
      outcome: 'interested',
      next_action: 'Send product demo',
      next_action_date: '2024-01-17T14:00:00Z',
      ai_sentiment_score: 0.85,
      ai_intent_detected: 'purchase_consideration',
      created_by: 'user-001',
      created_by_name: 'John Smith',
      attachments: []
    },
    {
      id: 'act-002',
      activity_type: 'email',
      activity_subject: 'Follow-up Email',
      activity_description: 'Sent follow-up email with product information and case studies.',
      activity_date: '2024-01-14T16:20:00Z',
      duration_minutes: 0,
      outcome: 'email_opened',
      ai_sentiment_score: 0.72,
      created_by: 'user-001',
      created_by_name: 'John Smith',
      attachments: ['case-study.pdf', 'product-overview.pdf']
    }
  ])

  const [emailThreads, setEmailThreads] = useKV<EmailThread[]>(`lead-emails-${leadId}`, [
    {
      id: 'email-001',
      subject: 'Product Demo Request',
      from: 'sarah.johnson@techcorp.com',
      to: ['john.smith@company.com'],
      body: 'Hi John, I\'m interested in learning more about your enterprise solution. Could we schedule a demo?',
      timestamp: '2024-01-13T14:30:00Z',
      direction: 'inbound',
      status: 'delivered',
      attachments: []
    },
    {
      id: 'email-002',
      subject: 'Re: Product Demo Request',
      from: 'john.smith@company.com',
      to: ['sarah.johnson@techcorp.com'],
      body: 'Hi Sarah, Thank you for your interest! I\'d be happy to show you our solution. Here are some times that work for me...',
      timestamp: '2024-01-13T15:45:00Z',
      direction: 'outbound',
      status: 'opened',
      attachments: ['calendar-invite.ics']
    }
  ])

  const [meetings, setMeetings] = useKV<Meeting[]>(`lead-meetings-${leadId}`, [
    {
      id: 'meeting-001',
      title: 'Product Demo',
      description: 'Comprehensive product demonstration focusing on enterprise features',
      start_time: '2024-01-17T14:00:00Z',
      end_time: '2024-01-17T15:00:00Z',
      location: 'Zoom Meeting',
      meeting_type: 'video',
      attendees: ['sarah.johnson@techcorp.com', 'john.smith@company.com'],
      status: 'scheduled',
      outcome: undefined
    }
  ])

  const [documents, setDocuments] = useKV<Document[]>(`lead-documents-${leadId}`, [
    {
      id: 'doc-001',
      name: 'Enterprise Solution Overview.pdf',
      type: 'application/pdf',
      size: 2048576,
      url: '/documents/enterprise-overview.pdf',
      uploaded_by: 'user-001',
      uploaded_at: '2024-01-14T16:20:00Z',
      category: 'Product Information'
    },
    {
      id: 'doc-002',
      name: 'Case Study - TechCorp Implementation.pdf',
      type: 'application/pdf',
      size: 1536000,
      url: '/documents/case-study.pdf',
      uploaded_by: 'user-001',
      uploaded_at: '2024-01-14T16:22:00Z',
      category: 'Case Studies'
    }
  ])

  const [teamNotes, setTeamNotes] = useKV<TeamNote[]>(`lead-notes-${leadId}`, [
    {
      id: 'note-001',
      content: 'Sarah is very technical and asks detailed questions about security and scalability. She mentioned they\'re evaluating 3 solutions.',
      author: 'user-001',
      author_name: 'John Smith',
      created_at: '2024-01-15T11:15:00Z',
      updated_at: '2024-01-15T11:15:00Z',
      is_pinned: true,
      tags: ['technical', 'competition']
    },
    {
      id: 'note-002',
      content: 'Budget discussion: They have $150K allocated for this project. Decision timeline is end of Q1.',
      author: 'user-002',
      author_name: 'Emma Davis',
      created_at: '2024-01-15T14:30:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      is_pinned: false,
      tags: ['budget', 'timeline']
    }
  ])

  const [aiInsights, setAIInsights] = useKV<AIInsight[]>(`lead-ai-insights-${leadId}`, [
    {
      id: 'ai-001',
      type: 'prediction',
      title: 'High Conversion Probability',
      description: 'Based on engagement patterns and profile analysis, this lead has an 78% probability of conversion within 30 days.',
      confidence: 85,
      impact: 'high',
      action_items: [
        'Schedule demo within 48 hours',
        'Prepare enterprise-focused presentation',
        'Include security and compliance information'
      ],
      generated_at: '2024-01-15T12:00:00Z'
    },
    {
      id: 'ai-002',
      type: 'recommendation',
      title: 'Optimal Contact Time',
      description: 'Analysis shows this lead is most responsive to calls on Tuesday-Thursday between 2-4 PM PST.',
      confidence: 92,
      impact: 'medium',
      action_items: [
        'Schedule follow-up calls during optimal times',
        'Set automated reminders for best contact windows'
      ],
      generated_at: '2024-01-15T12:05:00Z'
    }
  ])

  const [collaborativeUsers, setCollaborativeUsers] = useKV<CollaborationUser[]>(`lead-collaboration-${leadId}`, [
    {
      id: 'user-002',
      name: 'Emma Davis',
      avatar: '/avatars/emma.jpg',
      current_section: 'activities',
      last_seen: '2024-01-15T15:30:00Z'
    },
    {
      id: 'user-003',
      name: 'Mike Wilson',
      avatar: '/avatars/mike.jpg',
      current_section: 'ai-insights',
      last_seen: '2024-01-15T15:25:00Z'
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  // Real-time collaboration simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate user activity updates
      setCollaborativeUsers(currentUsers => 
        currentUsers.map(user => ({
          ...user,
          last_seen: new Date().toISOString()
        }))
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [setCollaborativeUsers])

  const handleSaveNote = () => {
    if (!newNote.trim()) return

    const note: TeamNote = {
      id: `note-${Date.now()}`,
      content: newNote,
      author: userId,
      author_name: 'Current User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: false,
      tags: []
    }

    setTeamNotes(currentNotes => [note, ...currentNotes])
    setNewNote('')
    toast.success('Note added successfully')
  }

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) return

    const email: EmailThread = {
      id: `email-${Date.now()}`,
      subject: emailSubject,
      from: 'current.user@company.com',
      to: [lead.email],
      body: emailBody,
      timestamp: new Date().toISOString(),
      direction: 'outbound',
      status: 'sent',
      attachments: []
    }

    setEmailThreads(currentEmails => [email, ...currentEmails])
    setEmailSubject('')
    setEmailBody('')
    setShowEmailComposer(false)
    toast.success('Email sent successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'unqualified': return 'bg-red-100 text-red-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'hot': return 'bg-red-100 text-red-800'
      case 'warm': return 'bg-orange-100 text-orange-800'
      case 'cold': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="flex h-full">
        {/* Header */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {lead.first_name[0]}{lead.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {lead.first_name} {lead.last_name}
                    </h1>
                    <p className="text-muted-foreground">
                      {lead.job_title} at {lead.company_name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Collaboration indicators */}
                <div className="flex items-center gap-2">
                  {collaborativeUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <Circle size={8} className="text-green-500 fill-current" />
                        <span className="text-xs text-muted-foreground">{user.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator orientation="vertical" className="h-6" />
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share size={16} className="mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <PencilSimple size={16} className="mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {/* Status bars */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(lead.lead_status)}>
                    {lead.lead_status}
                  </Badge>
                  <Badge className={getRatingColor(lead.lead_rating)}>
                    {lead.lead_rating}
                  </Badge>
                  <Badge className={getPriorityColor(lead.lead_priority)}>
                    {lead.lead_priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span>AI Score: {lead.ai_lead_score}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-green-500" />
                    <span>Conversion: {Math.round(lead.ai_conversion_probability * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendUp size={16} className="text-blue-500" />
                    <span>Est. Value: ${lead.ai_estimated_deal_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mx-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User size={16} />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <ClockCounterClockwise size={16} />
                  Activities
                  {collaborativeUsers.find(u => u.current_section === 'activities') && (
                    <Circle size={6} className="text-green-500 fill-current ml-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center gap-2">
                  <Mail size={16} />
                  Emails
                </TabsTrigger>
                <TabsTrigger value="meetings" className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Meetings
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText size={16} />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <ChatCircle size={16} />
                  Team Notes
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="flex items-center gap-2">
                  <Brain size={16} />
                  AI Insights
                  {collaborativeUsers.find(u => u.current_section === 'ai-insights') && (
                    <Circle size={6} className="text-green-500 fill-current ml-1" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User size={20} />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-muted-foreground" />
                          <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                        {lead.mobile && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-muted-foreground" />
                            <a href={`tel:${lead.mobile}`} className="text-primary hover:underline">
                              {lead.mobile} (Mobile)
                            </a>
                          </div>
                        )}
                        {lead.linkedin_url && (
                          <div className="flex items-center gap-3">
                            <LinkedinLogo size={16} className="text-muted-foreground" />
                            <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Company Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Buildings size={20} />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Company</Label>
                          <p className="text-sm">{lead.company_name}</p>
                        </div>
                        {lead.company_website && (
                          <div>
                            <Label className="text-sm font-medium">Website</Label>
                            <a href={lead.company_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">
                              {lead.company_website}
                            </a>
                          </div>
                        )}
                        {lead.industry && (
                          <div>
                            <Label className="text-sm font-medium">Industry</Label>
                            <p className="text-sm">{lead.industry}</p>
                          </div>
                        )}
                        {(lead.address_line1 || lead.city) && (
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm">
                              {[lead.address_line1, lead.city, lead.state, lead.country]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendUp size={20} />
                        Engagement Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">AI Lead Score</Label>
                            <span className="text-sm font-bold">{lead.ai_lead_score}/100</span>
                          </div>
                          <Progress value={lead.ai_lead_score} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Engagement Score</Label>
                            <span className="text-sm font-bold">{lead.engagement_score}/100</span>
                          </div>
                          <Progress value={lead.engagement_score} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Conversion Probability</Label>
                            <span className="text-sm font-bold">{Math.round(lead.ai_conversion_probability * 100)}%</span>
                          </div>
                          <Progress value={lead.ai_conversion_probability * 100} className="h-2" />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Contact Attempts</span>
                            <span className="text-sm font-medium">{lead.contact_attempts}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Est. Deal Value</span>
                            <span className="text-sm font-medium">${lead.ai_estimated_deal_value.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Last Contact</span>
                            <span className="text-sm font-medium">
                              {lead.last_contact_date ? format(new Date(lead.last_contact_date), 'MMM d, yyyy') : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tags and Notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag size={20} />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-6 px-2">
                          <Plus size={12} className="mr-1" />
                          Add Tag
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChatCircle size={20} />
                        Quick Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add a quick note about this lead..."
                          value={lead.notes || ''}
                          className="min-h-[100px]"
                          readOnly={!isEditing}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Next Best Action */}
                {lead.ai_next_best_action && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Lightbulb size={20} />
                        AI Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start justify-between">
                        <p className="text-sm">{lead.ai_next_best_action}</p>
                        <Button size="sm" className="ml-4">
                          Take Action
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Activity Timeline</h3>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter activities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Activities</SelectItem>
                          <SelectItem value="calls">Calls</SelectItem>
                          <SelectItem value="emails">Emails</SelectItem>
                          <SelectItem value="meetings">Meetings</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Activity
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <Card key={activity.id} className="relative">
                          {index < activities.length - 1 && (
                            <div className="absolute left-8 top-12 w-px h-20 bg-border" />
                          )}
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  {activity.activity_type === 'call' && <Phone size={16} className="text-primary" />}
                                  {activity.activity_type === 'email' && <Mail size={16} className="text-primary" />}
                                  {activity.activity_type === 'meeting' && <VideoCamera size={16} className="text-primary" />}
                                  {activity.activity_type === 'note' && <ChatCircle size={16} className="text-primary" />}
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{activity.activity_subject}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {activity.created_by_name} • {format(new Date(activity.activity_date), 'MMM d, yyyy at h:mm a')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {activity.duration_minutes && (
                                      <Badge variant="outline" className="text-xs">
                                        {activity.duration_minutes}m
                                      </Badge>
                                    )}
                                    {activity.outcome && (
                                      <Badge variant="secondary" className="text-xs">
                                        {activity.outcome}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm">{activity.activity_description}</p>
                                
                                {activity.ai_sentiment_score && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Brain size={12} />
                                    <span>AI Sentiment: {Math.round(activity.ai_sentiment_score * 100)}% positive</span>
                                    {activity.ai_intent_detected && (
                                      <span>• Intent: {activity.ai_intent_detected}</span>
                                    )}
                                  </div>
                                )}

                                {activity.next_action && (
                                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Flag size={12} className="text-orange-500" />
                                      <span className="font-medium">Next Action:</span>
                                      <span>{activity.next_action}</span>
                                      {activity.next_action_date && (
                                        <span className="text-muted-foreground">
                                          by {format(new Date(activity.next_action_date), 'MMM d, yyyy')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {activity.attachments.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <PaperclipHorizontal size={12} />
                                    <span>{activity.attachments.length} attachment(s)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Emails Tab */}
              <TabsContent value="emails" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Email History</h3>
                    <Button 
                      size="sm"
                      onClick={() => setShowEmailComposer(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Compose Email
                    </Button>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {emailThreads.map((email) => (
                        <Card key={email.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">{email.subject}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                      {email.direction === 'outbound' ? 'To:' : 'From:'} {email.direction === 'outbound' ? email.to.join(', ') : email.from}
                                    </span>
                                    <span>•</span>
                                    <span>{format(new Date(email.timestamp), 'MMM d, yyyy at h:mm a')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={email.direction === 'outbound' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {email.direction === 'outbound' ? 'Sent' : 'Received'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {email.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="prose prose-sm max-w-none">
                                <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                              </div>

                              {email.attachments.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <PaperclipHorizontal size={12} />
                                  <span>{email.attachments.length} attachment(s)</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Button variant="ghost" size="sm">
                                  Reply
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Forward
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Email Composer Dialog */}
                <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Compose Email</DialogTitle>
                      <DialogDescription>
                        Send an email to {lead.first_name} {lead.last_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>To</Label>
                          <Input value={lead.email} disabled />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <Input 
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Email subject..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea 
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your message..."
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEmailComposer(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendEmail}>
                          Send Email
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Meetings Tab */}
              <TabsContent value="meetings" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Meetings & Calls</h3>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {meetings.map((meeting) => (
                        <Card key={meeting.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{meeting.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {meeting.description}
                                  </p>
                                </div>
                                <Badge 
                                  variant={meeting.status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {meeting.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon size={16} className="text-muted-foreground" />
                                  <span>
                                    {format(new Date(meeting.start_time), 'MMM d, yyyy at h:mm a')} - 
                                    {format(new Date(meeting.end_time), 'h:mm a')}
                                  </span>
                                </div>
                                {meeting.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-muted-foreground" />
                                    <span>{meeting.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users size={16} className="text-muted-foreground" />
                                  <span>{meeting.attendees.length} attendees</span>
                                </div>
                              </div>

                              {meeting.outcome && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm"><strong>Outcome:</strong> {meeting.outcome}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Reschedule
                                </Button>
                                {meeting.status === 'scheduled' && (
                                  <Button variant="ghost" size="sm">
                                    Join Meeting
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Documents & Files</h3>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Upload File
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText size={20} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate" title={doc.name}>
                                    {doc.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.size)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Category: {doc.category}</p>
                              <p>Uploaded: {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</p>
                            </div>

                            <div className="flex items-center gap-1 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <Download size={12} className="mr-1" />
                                Download
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <Eye size={12} className="mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Team Notes Tab */}
              <TabsContent value="notes" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Notes</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users size={16} />
                        <span>{collaborativeUsers.length + 1} online</span>
                      </div>
                    </div>
                  </div>

                  {/* Add new note */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a team note..."
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm"
                            onClick={handleSaveNote}
                            disabled={!newNote.trim()}
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes list */}
                  <div className="space-y-4">
                    {teamNotes.map((note) => (
                      <Card key={note.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {note.author_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{note.author_name}</span>
                                    {note.is_pinned && (
                                      <Star size={12} className="text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(note.created_at), 'MMM d, yyyy at h:mm a')}
                                    {note.updated_at !== note.created_at && ' (edited)'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <PencilSimple size={12} />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Star size={12} className={note.is_pinned ? 'text-yellow-500 fill-current' : ''} />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="ai-insights" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">AI Insights & Recommendations</h3>
                    <Button size="sm" variant="outline">
                      <Robot size={16} className="mr-2" />
                      Refresh Insights
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {aiInsights.map((insight) => (
                      <Card key={insight.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  {insight.type === 'prediction' && <ChartLine size={20} className="text-primary" />}
                                  {insight.type === 'recommendation' && <Lightbulb size={20} className="text-primary" />}
                                  {insight.type === 'alert' && <Warning size={20} className="text-orange-500" />}
                                  {insight.type === 'opportunity' && <Target size={20} className="text-green-500" />}
                                </div>
                                <div>
                                  <h4 className="font-medium">{insight.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {insight.impact} impact
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {insight.confidence}% confidence
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            
                            {insight.action_items.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium">Recommended Actions:</h5>
                                <ul className="space-y-1">
                                  {insight.action_items.map((action, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-xs text-muted-foreground">
                                Generated {format(new Date(insight.generated_at), 'MMM d, h:mm a')}
                              </span>
                              <Button size="sm" variant="outline">
                                Take Action
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* AI Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkle size={20} />
                        AI Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">94%</div>
                          <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">87%</div>
                          <div className="text-sm text-muted-foreground">Recommendation Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">12.5%</div>
                          <div className="text-sm text-muted-foreground">Conversion Improvement</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}