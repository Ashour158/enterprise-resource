import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  TrendUp, 
  Star, 
  MessageCircle, 
  FileText, 
  Activity,
  Brain,
  Clock,
  ArrowLeft,
  Edit,
  Save,
  Plus,
  Paperclip,
  MapPin,
  Globe,
  LinkedIn,
  Target,
  Lightbulb,
  Users,
  DollarSign,
  PlayCircle,
  Heart,
  ShoppingCart,
  CreditCard,
  HandHeart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Contact {
  id: string
  contactNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  mobilePhone: string
  jobTitle: string
  department: string
  accountId: string
  accountName: string
  isPrimaryContact: boolean
  contactStatus: string
  leadSource: string
  createdAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  notes: string
  tags: string[]
  address: {
    line1: string
    city: string
    state: string
    country: string
  }
  socialProfiles: {
    linkedin?: string
    twitter?: string
  }
  preferences: {
    communicationMethod: string
    bestTimeToContact: string
    timezone: string
  }
  aiInsights: {
    relationshipStrength: number
    influenceLevel: string
    communicationPattern: string
    responsiveness: number
    interests: string[]
    painPoints: string[]
    personalityTraits: string[]
    buyingBehavior: {
      decisionMaker: boolean
      budget: string
      timeline: string
      priorities: string[]
    }
  }
  relatedDeals: Array<{
    id: string
    name: string
    value: number
    stage: string
    probability: number
  }>
  relatedCases: Array<{
    id: string
    subject: string
    status: string
    priority: string
  }>
}

interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'quote' | 'document' | 'support'
  subject: string
  description: string
  date: string
  duration?: number
  outcome?: string
  nextAction?: string
  createdBy: string
  createdByName: string
  attachments: any[]
  aiSentiment?: number
  aiIntent?: string
  metadata: Record<string, any>
}

interface CollaborativeNote {
  id: string
  content: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  isPrivate: boolean
  mentions: string[]
  reactions: Record<string, string[]>
  tags: string[]
}

interface ContactProfilePageProps {
  contactId: string
  companyId: string
  userId: string
  onBack: () => void
}

export function ContactProfilePage({ contactId, companyId, userId, onBack }: ContactProfilePageProps) {
  const [contact, setContact] = useKV<Contact | null>(`contact-${contactId}`, null)
  const [activities, setActivities] = useKV<Activity[]>(`contact-activities-${contactId}`, [])
  const [notes, setNotes] = useKV<CollaborativeNote[]>(`contact-notes-${contactId}`, [])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({})

  // Mock contact data if not exists
  useEffect(() => {
    if (!contact) {
      const mockContact: Contact = {
        id: contactId,
        contactNumber: 'CON-2024-001',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@globaltech.com',
        phone: '+1-555-0987',
        mobilePhone: '+1-555-1234',
        jobTitle: 'Chief Technology Officer',
        department: 'Technology',
        accountId: 'acc-001',
        accountName: 'GlobalTech Corporation',
        isPrimaryContact: true,
        contactStatus: 'active',
        leadSource: 'referral',
        createdAt: '2024-01-10T09:00:00Z',
        lastContactDate: '2024-01-22T15:30:00Z',
        nextFollowUpDate: '2024-01-30T10:00:00Z',
        notes: 'Key decision maker for technology purchases. Very responsive and detail-oriented.',
        tags: ['decision-maker', 'technical', 'responsive', 'key-contact'],
        address: {
          line1: '456 Innovation Drive',
          city: 'Austin',
          state: 'TX',
          country: 'United States'
        },
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/emily-rodriguez-cto',
          twitter: '@emily_tech_lead'
        },
        preferences: {
          communicationMethod: 'email',
          bestTimeToContact: 'Tuesday-Thursday, 9 AM - 5 PM CST',
          timezone: 'America/Chicago'
        },
        aiInsights: {
          relationshipStrength: 85,
          influenceLevel: 'High',
          communicationPattern: 'Direct and concise',
          responsiveness: 92,
          interests: ['Cloud Computing', 'AI/ML', 'Cybersecurity', 'DevOps'],
          painPoints: ['Legacy system migration', 'Integration complexity', 'Team scalability'],
          personalityTraits: ['Analytical', 'Detail-oriented', 'Innovation-focused', 'Team-oriented'],
          buyingBehavior: {
            decisionMaker: true,
            budget: '$500K+',
            timeline: 'Q1-Q2 2024',
            priorities: ['Security', 'Scalability', 'Integration', 'ROI']
          }
        },
        relatedDeals: [
          {
            id: 'deal-001',
            name: 'Enterprise Cloud Migration',
            value: 750000,
            stage: 'Proposal',
            probability: 75
          },
          {
            id: 'deal-002',
            name: 'Security Platform Upgrade',
            value: 250000,
            stage: 'Discovery',
            probability: 45
          }
        ],
        relatedCases: [
          {
            id: 'case-001',
            subject: 'API Integration Question',
            status: 'Resolved',
            priority: 'Medium'
          }
        ]
      }
      setContact(mockContact)
    }
  }, [contactId, contact, setContact])

  // Mock activities if not exists
  useEffect(() => {
    if (activities.length === 0) {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'meeting',
          subject: 'Q1 Technology Roadmap Discussion',
          description: 'Discussed upcoming technology initiatives and budget planning for Q1. Emily showed strong interest in cloud migration and security improvements.',
          date: '2024-01-22T15:30:00Z',
          duration: 60,
          outcome: 'Very positive',
          nextAction: 'Send detailed cloud migration proposal',
          createdBy: userId,
          createdByName: 'Sarah Johnson',
          attachments: [{ name: 'meeting-notes.pdf', size: '1.2 MB' }],
          aiSentiment: 0.9,
          aiIntent: 'High Purchase Intent',
          metadata: { attendees: ['Emily Rodriguez', 'IT Team Lead', 'Security Manager'] }
        },
        {
          id: '2',
          type: 'email',
          subject: 'Follow-up on Security Requirements',
          description: 'Sent detailed security compliance documentation and answered questions about data encryption standards.',
          date: '2024-01-20T11:15:00Z',
          outcome: 'Email opened and responded positively',
          nextAction: 'Schedule technical demo',
          createdBy: userId,
          createdByName: 'Mike Chen',
          attachments: [],
          aiSentiment: 0.8,
          aiIntent: 'Technical Validation',
          metadata: { emailOpened: true, linksClicked: 5, responseTime: '2 hours' }
        },
        {
          id: '3',
          type: 'call',
          subject: 'Technical Architecture Review',
          description: 'Detailed discussion about system architecture requirements and integration points with existing infrastructure.',
          date: '2024-01-18T14:00:00Z',
          duration: 45,
          outcome: 'Requirements clarified',
          nextAction: 'Prepare integration timeline',
          createdBy: 'user-003',
          createdByName: 'Alex Thompson',
          attachments: [],
          aiSentiment: 0.85,
          aiIntent: 'Solution Fit Assessment',
          metadata: { callQuality: 'excellent', technicalDepth: 'high' }
        },
        {
          id: '4',
          type: 'support',
          subject: 'API Documentation Request',
          description: 'Provided comprehensive API documentation and integration examples for the development team review.',
          date: '2024-01-15T10:30:00Z',
          outcome: 'Documentation well received',
          nextAction: 'Follow up on implementation questions',
          createdBy: 'user-004',
          createdByName: 'Support Team',
          attachments: [{ name: 'api-docs.zip', size: '5.8 MB' }],
          aiSentiment: 0.7,
          aiIntent: 'Technical Implementation',
          metadata: { documentDownloads: 3, teamAccess: true }
        }
      ]
      setActivities(mockActivities)
    }
  }, [activities, setActivities, userId])

  // Mock notes if not exists
  useEffect(() => {
    if (notes.length === 0) {
      const mockNotes: CollaborativeNote[] = [
        {
          id: '1',
          content: 'Emily is extremely technical and asks very detailed questions. She values security and compliance above all else. Her team trusts her recommendations completely.',
          createdBy: userId,
          createdByName: 'Sarah Johnson',
          createdAt: '2024-01-22T16:30:00Z',
          updatedAt: '2024-01-22T16:30:00Z',
          isPrivate: false,
          mentions: [],
          reactions: { '👍': ['user1', 'user2'], '🎯': ['user3'] },
          tags: ['personality', 'decision-maker']
        },
        {
          id: '2',
          content: 'Key insight: Emily mentioned their biggest challenge is migrating legacy systems without disrupting operations. This could be our primary value proposition.',
          createdBy: 'user2',
          createdByName: 'Mike Chen',
          createdAt: '2024-01-20T12:00:00Z',
          updatedAt: '2024-01-20T12:00:00Z',
          isPrivate: false,
          mentions: [userId],
          reactions: { '💡': ['user1', 'user4'], '🚀': ['user2'] },
          tags: ['pain-point', 'opportunity']
        },
        {
          id: '3',
          content: 'Emily prefers email communication and detailed documentation. She always reviews everything thoroughly before meetings. Send materials 2-3 days in advance.',
          createdBy: 'user3',
          createdByName: 'Alex Thompson',
          createdAt: '2024-01-18T17:00:00Z',
          updatedAt: '2024-01-18T17:00:00Z',
          isPrivate: false,
          mentions: [],
          reactions: { '📝': ['user1'], '✅': ['user2', 'user4'] },
          tags: ['communication-style', 'best-practices']
        }
      ]
      setNotes(mockNotes)
    }
  }, [notes, setNotes, userId])

  const handleSaveEdit = () => {
    if (contact && Object.keys(editedContact).length > 0) {
      setContact({ ...contact, ...editedContact })
      setEditedContact({})
      setIsEditing(false)
      toast.success('Contact profile updated successfully')
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: CollaborativeNote = {
      id: Date.now().toString(),
      content: newNote,
      createdBy: userId,
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: false,
      mentions: [],
      reactions: {},
      tags: []
    }

    setNotes([note, ...notes])
    setNewNote('')
    toast.success('Note added successfully')
  }

  const handleAddActivity = (type: Activity['type'], data: Partial<Activity>) => {
    const activity: Activity = {
      id: Date.now().toString(),
      type,
      subject: data.subject || '',
      description: data.description || '',
      date: new Date().toISOString(),
      createdBy: userId,
      createdByName: 'Current User',
      attachments: [],
      metadata: {},
      ...data
    }

    setActivities([activity, ...activities])
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logged successfully`)
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call': return <Phone size={16} />
      case 'email': return <Mail size={16} />
      case 'meeting': return <Calendar size={16} />
      case 'note': return <FileText size={16} />
      case 'quote': return <DollarSign size={16} />
      case 'document': return <Paperclip size={16} />
      case 'support': return <HandHeart size={16} />
      default: return <Activity size={16} />
    }
  }

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500'
    if (sentiment > 0.7) return 'text-green-600'
    if (sentiment > 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInfluenceBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contact profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Contacts
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.firstName} ${contact.lastName}`} />
              <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{contact.firstName} {contact.lastName}</h1>
              <p className="text-muted-foreground">{contact.jobTitle} at {contact.accountName}</p>
              <div className="flex items-center gap-2 mt-1">
                {contact.isPrimaryContact && (
                  <Badge variant="default" className="text-xs">Primary Contact</Badge>
                )}
                <Badge variant={getInfluenceBadgeColor(contact.aiInsights.influenceLevel)} className="text-xs">
                  {contact.aiInsights.influenceLevel} Influence
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{contact.contactStatus}</Badge>
          <Badge variant="secondary">{contact.department}</Badge>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={isEditing ? handleSaveEdit : () => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={16} className="mr-2" /> : <Edit size={16} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{contact.aiInsights.relationshipStrength}/100</div>
              <p className="text-sm text-muted-foreground">Relationship Strength</p>
              <Progress value={contact.aiInsights.relationshipStrength} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contact.aiInsights.responsiveness}%</div>
              <p className="text-sm text-muted-foreground">Responsiveness</p>
              <Progress value={contact.aiInsights.responsiveness} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contact.relatedDeals.length}</div>
              <p className="text-sm text-muted-foreground">Active Deals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activities.length}</div>
              <p className="text-sm text-muted-foreground">Total Interactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="notes">Team Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="deals">Related Deals</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                  {contact.mobilePhone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-muted-foreground" />
                      <a href={`tel:${contact.mobilePhone}`} className="text-primary hover:underline">
                        {contact.mobilePhone} (Mobile)
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-muted-foreground" />
                    <a href="#" className="text-primary hover:underline">
                      {contact.accountName}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{contact.address.city}, {contact.address.state}</span>
                  </div>
                  {contact.socialProfiles.linkedin && (
                    <div className="flex items-center gap-3">
                      <LinkedIn size={16} className="text-muted-foreground" />
                      <a href={contact.socialProfiles.linkedin} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => handleAddActivity('call', { subject: 'Quick Call' })}>
                  <Phone size={16} className="mr-2" />
                  Log Call
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddActivity('email', { subject: 'Follow-up Email' })}>
                  <Mail size={16} className="mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddActivity('meeting', { subject: 'Schedule Meeting' })}>
                  <Calendar size={16} className="mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign size={16} className="mr-2" />
                  Create Quote
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart size={16} className="mr-2" />
                  Create Opportunity
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HandHeart size={16} className="mr-2" />
                  Create Support Case
                </Button>
              </CardContent>
            </Card>

            {/* AI Communication Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  AI Communication Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Communication Pattern</Label>
                  <p className="text-muted-foreground">{contact.aiInsights.communicationPattern}</p>
                </div>
                <div>
                  <Label>Preferred Method</Label>
                  <p className="text-muted-foreground capitalize">{contact.preferences.communicationMethod}</p>
                </div>
                <div>
                  <Label>Best Contact Time</Label>
                  <p className="text-muted-foreground">{contact.preferences.bestTimeToContact}</p>
                </div>
                <div>
                  <Label>Personality Traits</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.aiInsights.personalityTraits.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Deals Quick View */}
          {contact.relatedDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} />
                  Related Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contact.relatedDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{deal.name}</h4>
                        <p className="text-sm text-muted-foreground">{deal.stage} • {deal.probability}% probability</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${deal.value.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {deal.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Activity Timeline</h3>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Add Activity
            </Button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <Card key={activity.id} className="relative">
                {index < activities.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-full bg-border"></div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{activity.subject}</h4>
                        <div className="flex items-center gap-2">
                          {activity.aiSentiment && (
                            <Badge variant="outline" className={getSentimentColor(activity.aiSentiment)}>
                              {activity.aiSentiment > 0.7 ? 'Very Positive' : activity.aiSentiment > 0.4 ? 'Positive' : activity.aiSentiment > 0.2 ? 'Neutral' : 'Negative'}
                            </Badge>
                          )}
                          {activity.aiIntent && (
                            <Badge variant="secondary">{activity.aiIntent}</Badge>
                          )}
                          <Badge variant="outline">{activity.type}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{activity.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                        </div>
                        {activity.duration && (
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-muted-foreground">{activity.duration} minutes</p>
                          </div>
                        )}
                        {activity.outcome && (
                          <div>
                            <span className="font-medium">Outcome:</span>
                            <p className="text-muted-foreground">{activity.outcome}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Created by:</span>
                          <p className="text-muted-foreground">{activity.createdByName}</p>
                        </div>
                      </div>
                      {activity.nextAction && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Next Action:</span>
                          </div>
                          <p className="text-blue-700 mt-1">{activity.nextAction}</p>
                        </div>
                      )}
                      {activity.attachments.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-2">Attachments:</h5>
                          <div className="flex flex-wrap gap-2">
                            {activity.attachments.map((attachment, idx) => (
                              <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                <Paperclip size={12} />
                                {attachment.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buying Behavior */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Buying Behavior Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Decision Maker</Label>
                    <p className="text-muted-foreground">
                      {contact.aiInsights.buyingBehavior.decisionMaker ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <Label>Budget Range</Label>
                    <p className="text-muted-foreground">{contact.aiInsights.buyingBehavior.budget}</p>
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <p className="text-muted-foreground">{contact.aiInsights.buyingBehavior.timeline}</p>
                  </div>
                  <div>
                    <Label>Influence Level</Label>
                    <Badge variant={getInfluenceBadgeColor(contact.aiInsights.influenceLevel)}>
                      {contact.aiInsights.influenceLevel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Key Priorities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contact.aiInsights.buyingBehavior.priorities.map((priority, index) => (
                      <Badge key={index} variant="outline">{priority}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests & Pain Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  Interests & Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Key Interests</Label>
                  <div className="space-y-2 mt-2">
                    {contact.aiInsights.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Pain Points</Label>
                  <div className="space-y-2 mt-2">
                    {contact.aiInsights.painPoints.map((pain, index) => (
                      <Badge key={index} variant="destructive" className="mr-2 mb-2">
                        {pain}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaborative Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={20} />
                Add Team Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share insights, observations, or important information about this contact..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Plus size={16} className="mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{note.createdByName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{note.createdByName}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                        {note.isPrivate && (
                          <Badge variant="secondary" className="text-xs">Private</Badge>
                        )}
                        {note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{note.content}</p>
                      
                      {/* Reactions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {Object.entries(note.reactions).map(([emoji, users]) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              {emoji} {users.length}
                            </Button>
                          ))}
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            + React
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Related Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {contact.relatedDeals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{deal.name}</h3>
                      <p className="text-muted-foreground">Stage: {deal.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${deal.value.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={deal.probability} className="w-20" />
                        <span className="text-sm text-muted-foreground">{deal.probability}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Documents & Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Paperclip size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload documents, contracts, and other files related to this contact.
                </p>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Number</Label>
                    <p className="text-muted-foreground">{contact.contactNumber}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-muted-foreground">{contact.department}</p>
                  </div>
                  <div>
                    <Label>Lead Source</Label>
                    <p className="text-muted-foreground capitalize">{contact.leadSource}</p>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <p className="text-muted-foreground">{new Date(contact.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-muted-foreground">
                      {contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <Label>Next Follow-up</Label>
                    <p className="text-muted-foreground">
                      {contact.nextFollowUpDate ? new Date(contact.nextFollowUpDate).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <p className="text-muted-foreground">
                    {contact.address.line1}<br />
                    {contact.address.city}, {contact.address.state}<br />
                    {contact.address.country}
                  </p>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <p className="text-muted-foreground">{contact.preferences.timezone}</p>
                </div>
                <div>
                  <Label>Communication Preference</Label>
                  <p className="text-muted-foreground capitalize">{contact.preferences.communicationMethod}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}