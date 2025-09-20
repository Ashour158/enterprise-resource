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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
  Circle,
  CurrencyDollar,
  TrendDown,
  HandCoins,
  Calendar
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Contact {
  id: string
  contact_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  mobile?: string
  job_title?: string
  department?: string
  account_id?: string
  account_name?: string
  contact_type: string
  contact_status: string
  primary_contact: boolean
  decision_maker: boolean
  ai_influence_score: number
  ai_engagement_level: string
  last_contact_date?: string
  next_follow_up_date?: string
  social_profiles: {
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  address_line1?: string
  city?: string
  state?: string
  country?: string
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

interface Deal {
  id: string
  deal_name: string
  deal_value: number
  stage: string
  probability: number
  close_date: string
  status: string
}

interface CollaborationUser {
  id: string
  name: string
  avatar: string
  cursor_position?: { x: number; y: number }
  current_section?: string
  last_seen: string
}

interface ContactProfilePageProps {
  contactId: string
  companyId: string
  userId: string
  onClose: () => void
}

export function ContactProfilePage({ contactId, companyId, userId, onClose }: ContactProfilePageProps) {
  const [contact, setContact] = useKV<Contact>(`contact-${contactId}`, {
    id: contactId,
    contact_number: 'CON-2024-001',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@innovatetech.com',
    phone: '+1 (555) 234-5678',
    mobile: '+1 (555) 876-5432',
    job_title: 'CTO',
    department: 'Technology',
    account_id: 'acc-001',
    account_name: 'InnovateTech Solutions',
    contact_type: 'customer',
    contact_status: 'active',
    primary_contact: true,
    decision_maker: true,
    ai_influence_score: 92,
    ai_engagement_level: 'highly_engaged',
    last_contact_date: '2024-01-16T14:30:00Z',
    next_follow_up_date: '2024-01-20T10:00:00Z',
    social_profiles: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/michaelchen_cto'
    },
    address_line1: '456 Tech Boulevard',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    tags: ['Decision Maker', 'Technical Stakeholder', 'Strategic Partner'],
    notes: 'Key technical decision maker for enterprise solutions. Strong advocate for innovative technologies.',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-16T15:00:00Z'
  })

  const [activities, setActivities] = useKV<Activity[]>(`contact-activities-${contactId}`, [
    {
      id: 'act-c001',
      activity_type: 'meeting',
      activity_subject: 'Technical Architecture Review',
      activity_description: 'Detailed discussion about system architecture and integration requirements.',
      activity_date: '2024-01-16T14:30:00Z',
      duration_minutes: 90,
      outcome: 'very_interested',
      next_action: 'Prepare technical proposal',
      next_action_date: '2024-01-20T10:00:00Z',
      ai_sentiment_score: 0.91,
      ai_intent_detected: 'technical_evaluation',
      created_by: 'user-001',
      created_by_name: 'John Smith',
      attachments: ['technical-requirements.pdf']
    },
    {
      id: 'act-c002',
      activity_type: 'call',
      activity_subject: 'Quarterly Business Review',
      activity_description: 'Quarterly check-in on platform performance and upcoming initiatives.',
      activity_date: '2024-01-10T11:00:00Z',
      duration_minutes: 60,
      outcome: 'successful',
      ai_sentiment_score: 0.88,
      ai_intent_detected: 'relationship_building',
      created_by: 'user-002',
      created_by_name: 'Emma Davis',
      attachments: []
    }
  ])

  const [relatedDeals, setRelatedDeals] = useKV<Deal[]>(`contact-deals-${contactId}`, [
    {
      id: 'deal-001',
      deal_name: 'Enterprise Platform Upgrade',
      deal_value: 250000,
      stage: 'negotiation',
      probability: 85,
      close_date: '2024-02-15T00:00:00Z',
      status: 'active'
    },
    {
      id: 'deal-002',
      deal_name: 'AI Analytics Module',
      deal_value: 75000,
      stage: 'proposal',
      probability: 60,
      close_date: '2024-03-01T00:00:00Z',
      status: 'active'
    }
  ])

  const [collaborativeUsers, setCollaborativeUsers] = useKV<CollaborationUser[]>(`contact-collaboration-${contactId}`, [
    {
      id: 'user-003',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg',
      current_section: 'deals',
      last_seen: '2024-01-16T15:45:00Z'
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      case 'partner': return 'bg-purple-100 text-purple-800'
      case 'vendor': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'highly_engaged': return 'bg-green-100 text-green-800'
      case 'moderately_engaged': return 'bg-yellow-100 text-yellow-800'
      case 'low_engagement': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalDealValue = () => {
    return relatedDeals.reduce((sum, deal) => sum + deal.deal_value, 0)
  }

  const getWeightedProbability = () => {
    if (relatedDeals.length === 0) return 0
    const totalValue = getTotalDealValue()
    const weightedSum = relatedDeals.reduce((sum, deal) => 
      sum + (deal.deal_value * deal.probability / 100), 0
    )
    return Math.round((weightedSum / totalValue) * 100)
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Header */}
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
                      {contact.first_name[0]}{contact.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {contact.first_name} {contact.last_name}
                    </h1>
                    <p className="text-muted-foreground">
                      {contact.job_title} at {contact.account_name}
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
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar size={16} className="mr-2" />
                    Schedule
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
                  <Badge className={getContactTypeColor(contact.contact_type)}>
                    {contact.contact_type}
                  </Badge>
                  <Badge className={getStatusColor(contact.contact_status)}>
                    {contact.contact_status}
                  </Badge>
                  <Badge className={getEngagementColor(contact.ai_engagement_level)}>
                    {contact.ai_engagement_level.replace('_', ' ')}
                  </Badge>
                  {contact.primary_contact && (
                    <Badge variant="outline">Primary Contact</Badge>
                  )}
                  {contact.decision_maker && (
                    <Badge variant="outline">Decision Maker</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span>Influence Score: {contact.ai_influence_score}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyDollar size={16} className="text-green-500" />
                    <span>Total Deals: ${getTotalDealValue().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-500" />
                    <span>Avg. Probability: {getWeightedProbability()}%</span>
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
                </TabsTrigger>
                <TabsTrigger value="deals" className="flex items-center gap-2">
                  <HandCoins size={16} />
                  Deals
                  {collaborativeUsers.find(u => u.current_section === 'deals') && (
                    <Circle size={6} className="text-green-500 fill-current ml-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="communications" className="flex items-center gap-2">
                  <ChatCircle size={16} />
                  Communications
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText size={16} />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="flex items-center gap-2">
                  <Brain size={16} />
                  AI Insights
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
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-muted-foreground" />
                            <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.mobile && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-muted-foreground" />
                            <a href={`tel:${contact.mobile}`} className="text-primary hover:underline">
                              {contact.mobile} (Mobile)
                            </a>
                          </div>
                        )}
                        <Separator />
                        <div className="space-y-2">
                          {contact.social_profiles.linkedin && (
                            <div className="flex items-center gap-3">
                              <LinkedinLogo size={16} className="text-muted-foreground" />
                              <a href={contact.social_profiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {contact.social_profiles.twitter && (
                            <div className="flex items-center gap-3">
                              <TwitterLogo size={16} className="text-muted-foreground" />
                              <a href={contact.social_profiles.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                Twitter Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Buildings size={20} />
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Account</Label>
                          <a href="#" className="text-sm text-primary hover:underline block">
                            {contact.account_name}
                          </a>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Job Title</Label>
                          <p className="text-sm">{contact.job_title}</p>
                        </div>
                        {contact.department && (
                          <div>
                            <Label className="text-sm font-medium">Department</Label>
                            <p className="text-sm">{contact.department}</p>
                          </div>
                        )}
                        {(contact.address_line1 || contact.city) && (
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm">
                              {[contact.address_line1, contact.city, contact.state, contact.country]
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
                            <Label className="text-sm font-medium">Influence Score</Label>
                            <span className="text-sm font-bold">{contact.ai_influence_score}/100</span>
                          </div>
                          <Progress value={contact.ai_influence_score} className="h-2" />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Contact Type</span>
                            <Badge className={getContactTypeColor(contact.contact_type)} variant="secondary">
                              {contact.contact_type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Engagement Level</span>
                            <Badge className={getEngagementColor(contact.ai_engagement_level)} variant="secondary">
                              {contact.ai_engagement_level.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Last Contact</span>
                            <span className="text-sm font-medium">
                              {contact.last_contact_date ? format(new Date(contact.last_contact_date), 'MMM d, yyyy') : 'Never'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Next Follow-up</span>
                            <span className="text-sm font-medium">
                              {contact.next_follow_up_date ? format(new Date(contact.next_follow_up_date), 'MMM d, yyyy') : 'Not scheduled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Deals Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HandCoins size={20} />
                      Related Deals Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{relatedDeals.length}</div>
                        <div className="text-sm text-muted-foreground">Active Deals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${getTotalDealValue().toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{getWeightedProbability()}%</div>
                        <div className="text-sm text-muted-foreground">Avg. Probability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          ${Math.round(getTotalDealValue() * getWeightedProbability() / 100).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Expected Value</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                        {contact.tags.map((tag, index) => (
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
                          placeholder="Add a quick note about this contact..."
                          value={contact.notes || ''}
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
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Activity Timeline</h3>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Activity
                    </Button>
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Deals Tab */}
              <TabsContent value="deals" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Related Deals</h3>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Create Deal
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {relatedDeals.map((deal) => (
                      <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-primary hover:underline">
                                  {deal.deal_name}
                                </h4>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                  ${deal.deal_value.toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {deal.stage}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Probability</span>
                                <span className="font-medium">{deal.probability}%</span>
                              </div>
                              <Progress value={deal.probability} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Expected Close</span>
                              <span className="font-medium">
                                {format(new Date(deal.close_date), 'MMM d, yyyy')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Expected Value</span>
                              <span className="font-medium text-blue-600">
                                ${Math.round(deal.deal_value * deal.probability / 100).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Other tabs would be implemented similarly */}
              <TabsContent value="communications" className="p-6">
                <div className="text-center py-12">
                  <ChatCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Communications History</h3>
                  <p className="text-muted-foreground">View all email threads, calls, and messages with this contact.</p>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Documents & Files</h3>
                  <p className="text-muted-foreground">Access all documents, contracts, and files shared with this contact.</p>
                </div>
              </TabsContent>

              <TabsContent value="ai-insights" className="p-6">
                <div className="text-center py-12">
                  <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights & Recommendations</h3>
                  <p className="text-muted-foreground">AI-powered insights about engagement patterns, next best actions, and relationship recommendations.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}