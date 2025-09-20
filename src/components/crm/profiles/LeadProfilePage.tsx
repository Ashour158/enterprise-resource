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
  PlayCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  jobTitle: string
  industry: string
  leadStatus: string
  leadRating: string
  aiLeadScore: number
  aiConversionProbability: number
  estimatedDealValue: number
  assignedTo: string
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
  customFields: Record<string, any>
  aiInsights: {
    buyingSignals: string[]
    personalityProfile: {
      communicationStyle: string
      decisionMakingStyle: string
      riskTolerance: string
    }
    nextBestActions: string[]
    bestContactTime: string
    competitorMentions: string[]
    painPoints: string[]
  }
}

interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'quote' | 'document'
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
}

interface LeadProfilePageProps {
  leadId: string
  companyId: string
  userId: string
  onBack: () => void
}

export function LeadProfilePage({ leadId, companyId, userId, onBack }: LeadProfilePageProps) {
  const [lead, setLead] = useKV<Lead | null>(`lead-${leadId}`, null)
  const [activities, setActivities] = useKV<Activity[]>(`lead-activities-${leadId}`, [])
  const [notes, setNotes] = useKV<CollaborativeNote[]>(`lead-notes-${leadId}`, [])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({})

  // Mock lead data if not exists
  useEffect(() => {
    if (!lead) {
      const mockLead: Lead = {
        id: leadId,
        leadNumber: 'LEAD-2024-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        companyName: 'TechCorp Solutions',
        jobTitle: 'VP of Technology',
        industry: 'Software',
        leadStatus: 'qualified',
        leadRating: 'hot',
        aiLeadScore: 85,
        aiConversionProbability: 0.72,
        estimatedDealValue: 125000,
        assignedTo: userId,
        createdAt: '2024-01-15T10:30:00Z',
        lastContactDate: '2024-01-20T14:15:00Z',
        nextFollowUpDate: '2024-01-25T09:00:00Z',
        notes: 'Highly interested in our enterprise solution. Budget approved for Q1.',
        tags: ['enterprise', 'high-value', 'decision-maker'],
        address: {
          line1: '123 Tech Plaza',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States'
        },
        customFields: {
          companySize: '500-1000',
          budget: '$100K-$200K',
          timeline: 'Q1 2024'
        },
        aiInsights: {
          buyingSignals: [
            'Asked about implementation timeline',
            'Requested detailed pricing',
            'Mentioned budget allocation',
            'Scheduled follow-up meeting'
          ],
          personalityProfile: {
            communicationStyle: 'Direct and analytical',
            decisionMakingStyle: 'Data-driven',
            riskTolerance: 'Moderate'
          },
          nextBestActions: [
            'Send detailed proposal',
            'Schedule technical demo',
            'Introduce to implementation team'
          ],
          bestContactTime: 'Tuesday-Thursday, 10 AM - 4 PM PST',
          competitorMentions: ['Salesforce', 'Microsoft Dynamics'],
          painPoints: [
            'Current system lacks integration',
            'Manual reporting processes',
            'Poor user adoption'
          ]
        }
      }
      setLead(mockLead)
    }
  }, [leadId, lead, setLead, userId])

  // Mock activities if not exists
  useEffect(() => {
    if (activities.length === 0) {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'email',
          subject: 'Follow-up on ERP Solution Discussion',
          description: 'Sent detailed information about our enterprise package and pricing options.',
          date: '2024-01-20T14:15:00Z',
          outcome: 'Positive response',
          nextAction: 'Schedule demo',
          createdBy: userId,
          createdByName: 'Sarah Johnson',
          attachments: [],
          aiSentiment: 0.8,
          aiIntent: 'Purchase Intent',
          metadata: { emailOpened: true, linksClicked: 3 }
        },
        {
          id: '2',
          type: 'call',
          subject: 'Discovery Call',
          description: 'Initial discovery call to understand requirements and pain points.',
          date: '2024-01-18T11:00:00Z',
          duration: 45,
          outcome: 'Qualified lead',
          nextAction: 'Send proposal',
          createdBy: userId,
          createdByName: 'Sarah Johnson',
          attachments: [],
          aiSentiment: 0.9,
          aiIntent: 'High Interest',
          metadata: { callQuality: 'excellent' }
        },
        {
          id: '3',
          type: 'meeting',
          subject: 'Technical Requirements Review',
          description: 'Reviewed technical requirements and integration needs with IT team.',
          date: '2024-01-22T15:30:00Z',
          duration: 60,
          outcome: 'Requirements clarified',
          nextAction: 'Prepare technical proposal',
          createdBy: userId,
          createdByName: 'Mike Chen',
          attachments: [{ name: 'requirements.pdf', size: '2.1 MB' }],
          aiSentiment: 0.7,
          aiIntent: 'Technical Validation',
          metadata: { attendees: ['John Smith', 'CTO', 'IT Manager'] }
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
          content: 'John mentioned they are evaluating 3 vendors. We are in the final round. Key decision factors: price, integration capabilities, and support.',
          createdBy: userId,
          createdByName: 'Sarah Johnson',
          createdAt: '2024-01-20T16:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
          isPrivate: false,
          mentions: [],
          reactions: { '👍': ['user1', 'user2'], '💡': ['user3'] }
        },
        {
          id: '2',
          content: 'Technical team is very engaged. They asked detailed questions about API capabilities and data migration. This is a strong buying signal.',
          createdBy: 'user2',
          createdByName: 'Mike Chen',
          createdAt: '2024-01-22T17:00:00Z',
          updatedAt: '2024-01-22T17:00:00Z',
          isPrivate: false,
          mentions: [userId],
          reactions: { '🎯': ['user1'], '✅': ['user4'] }
        }
      ]
      setNotes(mockNotes)
    }
  }, [notes, setNotes, userId])

  const handleSaveEdit = () => {
    if (lead && Object.keys(editedLead).length > 0) {
      setLead({ ...lead, ...editedLead })
      setEditedLead({})
      setIsEditing(false)
      toast.success('Lead profile updated successfully')
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
      reactions: {}
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
      default: return <Activity size={16} />
    }
  }

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500'
    if (sentiment > 0.6) return 'text-green-500'
    if (sentiment > 0.3) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lead profile...</p>
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
            Back to Leads
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.firstName} ${lead.lastName}`} />
              <AvatarFallback>{lead.firstName[0]}{lead.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h1>
              <p className="text-muted-foreground">{lead.jobTitle} at {lead.companyName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={lead.leadRating === 'hot' ? 'destructive' : lead.leadRating === 'warm' ? 'default' : 'secondary'}>
            {lead.leadRating.toUpperCase()}
          </Badge>
          <Badge variant="outline">{lead.leadStatus}</Badge>
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

      {/* AI Score Banner */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{lead.aiLeadScore}/100</div>
              <p className="text-sm text-muted-foreground">AI Lead Score</p>
              <Progress value={lead.aiLeadScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(lead.aiConversionProbability * 100)}%</div>
              <p className="text-sm text-muted-foreground">Conversion Probability</p>
              <Progress value={lead.aiConversionProbability * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${lead.estimatedDealValue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Estimated Deal Value</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{lead.aiInsights.buyingSignals.length}</div>
              <p className="text-sm text-muted-foreground">Buying Signals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="notes">Team Notes ({notes.length})</TabsTrigger>
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
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-muted-foreground" />
                    <span>{lead.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{lead.address.city}, {lead.address.state}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, index) => (
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
                  <Users size={16} className="mr-2" />
                  Convert to Deal
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.date).toLocaleDateString()} • {activity.createdByName}
                        </p>
                        {activity.aiSentiment && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${getSentimentColor(activity.aiSentiment)}`}>
                              Sentiment: {activity.aiSentiment > 0.6 ? 'Positive' : activity.aiSentiment > 0.3 ? 'Neutral' : 'Negative'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                              {activity.aiSentiment > 0.6 ? 'Positive' : activity.aiSentiment > 0.3 ? 'Neutral' : 'Negative'}
                            </Badge>
                          )}
                          <Badge variant="secondary">{activity.type}</Badge>
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
            {/* Buying Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Buying Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.aiInsights.buyingSignals.map((signal, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-green-800">{signal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Best Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.aiInsights.nextBestActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{action}</span>
                      <Button size="sm" variant="outline">
                        <PlayCircle size={16} className="mr-2" />
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personality Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  Personality Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Communication Style</Label>
                  <p className="text-muted-foreground">{lead.aiInsights.personalityProfile.communicationStyle}</p>
                </div>
                <div>
                  <Label>Decision Making</Label>
                  <p className="text-muted-foreground">{lead.aiInsights.personalityProfile.decisionMakingStyle}</p>
                </div>
                <div>
                  <Label>Risk Tolerance</Label>
                  <p className="text-muted-foreground">{lead.aiInsights.personalityProfile.riskTolerance}</p>
                </div>
                <div>
                  <Label>Best Contact Time</Label>
                  <p className="text-muted-foreground">{lead.aiInsights.bestContactTime}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pain Points & Competitors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={20} />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pain Points</Label>
                  <div className="space-y-2 mt-2">
                    {lead.aiInsights.painPoints.map((pain, index) => (
                      <Badge key={index} variant="destructive" className="mr-2 mb-2">
                        {pain}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Competitor Mentions</Label>
                  <div className="space-y-2 mt-2">
                    {lead.aiInsights.competitorMentions.map((competitor, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {competitor}
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
                  placeholder="Share insights, observations, or important information with your team..."
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
                  Upload documents, quotes, contracts, and other files related to this lead.
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
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lead Number</Label>
                    <p className="text-muted-foreground">{lead.leadNumber}</p>
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <p className="text-muted-foreground">{lead.industry}</p>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <p className="text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-muted-foreground">
                      {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(lead.customFields).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <p className="text-muted-foreground">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}