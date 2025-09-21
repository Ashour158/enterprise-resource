import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  User, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  MessageCircle,
  Video,
  FileText,
  Network,
  Activity,
  Star,
  ChartLine,
  Brain,
  Eye,
  Share,
  X as XIcon,
  Plus,
  Edit,
  Target,
  Warning,
  CheckCircle,
  Crown,
  Shield,
  Lightning,
  Heart,
  ThumbsUp,
  Gauge,
  Pulse,
  Globe,
  LinkSimple,
  ArrowsClockwise,
  TrendUp,
  TrendDown,
  ChatCircle,
  PaperPlaneTilt,
  Briefcase,
  GraduationCap,
  UserCircle,
  MoreHorizontal,
  Filter,
  SortAscending,
  SortDescending
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  title: string
  department: string
  seniority: 'junior' | 'mid' | 'senior' | 'executive' | 'c-level'
  role: 'primary' | 'secondary' | 'influencer' | 'user' | 'decision-maker' | 'champion' | 'blocker'
  accountId: string
  companyName: string
  profilePhoto?: string
  linkedInUrl?: string
  personalNotes: string
  tags: string[]
  
  // Relationship metrics
  relationshipStrength: number // 0-100
  influenceLevel: number // 0-100
  responsiveness: number // 0-100
  advocacyScore: number // 0-100
  decisionMakingPower: number // 0-100
  
  // Interaction metrics
  totalInteractions: number
  lastInteractionDate: string
  lastInteractionType: string
  preferredCommunicationMethod: 'email' | 'phone' | 'video' | 'in-person'
  responseTimeHours: number
  meetingAttendanceRate: number
  emailEngagementRate: number
  
  // AI insights
  personalityType: string
  communicationStyle: string
  motivators: string[]
  concerns: string[]
  decisionFactors: string[]
  nextBestAction: string
  
  createdAt: string
  updatedAt: string
}

interface Interaction {
  id: string
  contactId: string
  accountId: string
  type: 'email' | 'call' | 'meeting' | 'social' | 'event' | 'document'
  subtype: string
  title: string
  description: string
  date: string
  duration?: number
  sentiment: number // -1 to 1
  importance: number // 0-100
  outcome: 'positive' | 'neutral' | 'negative' | 'action-required'
  followUpRequired: boolean
  followUpDate?: string
  participants: string[]
  topics: string[]
  aiInsights: string[]
  attachments: string[]
  isConfidential: boolean
  createdBy: string
  createdAt: string
}

interface Relationship {
  id: string
  contactId: string
  relatedContactId: string
  relationshipType: 'reports-to' | 'peer' | 'subordinate' | 'mentor' | 'stakeholder' | 'collaborator'
  strength: number // 0-100
  influence: 'high' | 'medium' | 'low'
  description: string
  mappedAt: string
}

interface ClickableContactProfileProps {
  contactName: string
  contactId?: string
  accountId?: string
  companyId: string
  inline?: boolean
  showFullProfile?: boolean
  onContactSelect?: (contact: Contact) => void
}

function ClickableContactProfile({ 
  contactName, 
  contactId, 
  accountId,
  companyId,
  inline = true,
  showFullProfile = false,
  onContactSelect
}: ClickableContactProfileProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`contacts-${companyId}`, [])
  const [interactions, setInteractions] = useKV<Interaction[]>(`contact-interactions-${companyId}`, [])
  const [relationships, setRelationships] = useKV<Relationship[]>(`contact-relationships-${companyId}`, [])
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Initialize with sample data if needed
  useEffect(() => {
    if (contacts.length === 0) {
      const sampleContacts: Contact[] = [
        {
          id: 'contact-001',
          name: 'Michael Chen',
          email: 'michael.chen@techcorp.example.com',
          phone: '+1 (555) 123-4567',
          title: 'Chief Technology Officer',
          department: 'Technology',
          seniority: 'c-level',
          role: 'decision-maker',
          accountId: 'acc-001',
          companyName: 'TechCorp Solutions',
          profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          linkedInUrl: 'https://linkedin.com/in/michaelchen',
          personalNotes: 'Highly technical, prefers detailed demos. Strong advocate for AI solutions. Has final say on technology purchases.',
          tags: ['technical', 'decision-maker', 'ai-enthusiast'],
          relationshipStrength: 88,
          influenceLevel: 95,
          responsiveness: 92,
          advocacyScore: 85,
          decisionMakingPower: 98,
          totalInteractions: 47,
          lastInteractionDate: '2024-01-15T14:30:00Z',
          lastInteractionType: 'email',
          preferredCommunicationMethod: 'email',
          responseTimeHours: 4,
          meetingAttendanceRate: 95,
          emailEngagementRate: 88,
          personalityType: 'Analytical Driver',
          communicationStyle: 'Direct and fact-based',
          motivators: ['Innovation', 'Efficiency', 'Competitive advantage'],
          concerns: ['Security', 'Integration complexity', 'Team adoption'],
          decisionFactors: ['Technical feasibility', 'ROI', 'Vendor stability'],
          nextBestAction: 'Schedule technical deep-dive session with development team',
          createdAt: '2023-06-15T08:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'contact-002',
          name: 'Sarah Williams',
          email: 'sarah.williams@techcorp.example.com',
          phone: '+1 (555) 123-4568',
          title: 'Chief Executive Officer',
          department: 'Executive',
          seniority: 'c-level',
          role: 'decision-maker',
          accountId: 'acc-001',
          companyName: 'TechCorp Solutions',
          profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          linkedInUrl: 'https://linkedin.com/in/sarahwilliams',
          personalNotes: 'Business-focused, values ROI and strategic alignment. Joined mid-demo and expressed urgency for Q1 implementation.',
          tags: ['executive', 'roi-focused', 'strategic'],
          relationshipStrength: 75,
          influenceLevel: 100,
          responsiveness: 78,
          advocacyScore: 70,
          decisionMakingPower: 100,
          totalInteractions: 23,
          lastInteractionDate: '2024-01-14T10:15:00Z',
          lastInteractionType: 'meeting',
          preferredCommunicationMethod: 'video',
          responseTimeHours: 12,
          meetingAttendanceRate: 85,
          emailEngagementRate: 65,
          personalityType: 'Strategic Expressive',
          communicationStyle: 'High-level and outcome-focused',
          motivators: ['Growth', 'Market leadership', 'Team productivity'],
          concerns: ['Budget allocation', 'Change management', 'Timeline pressure'],
          decisionFactors: ['Business impact', 'Strategic fit', 'Executive consensus'],
          nextBestAction: 'Present business case with clear ROI projections',
          createdAt: '2023-06-15T08:00:00Z',
          updatedAt: '2024-01-14T10:15:00Z'
        },
        {
          id: 'contact-003',
          name: 'Alex Rodriguez',
          email: 'alex.rodriguez@techcorp.example.com',
          phone: '+1 (555) 123-4569',
          title: 'Lead Developer',
          department: 'Engineering',
          seniority: 'senior',
          role: 'influencer',
          accountId: 'acc-001',
          companyName: 'TechCorp Solutions',
          profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          personalNotes: 'Hands-on technical lead. Very engaged during technical demonstrations. Key influencer for development team adoption.',
          tags: ['technical', 'hands-on', 'team-lead'],
          relationshipStrength: 82,
          influenceLevel: 78,
          responsiveness: 95,
          advocacyScore: 88,
          decisionMakingPower: 65,
          totalInteractions: 35,
          lastInteractionDate: '2024-01-14T10:00:00Z',
          lastInteractionType: 'meeting',
          preferredCommunicationMethod: 'email',
          responseTimeHours: 2,
          meetingAttendanceRate: 100,
          emailEngagementRate: 92,
          personalityType: 'Technical Collaborator',
          communicationStyle: 'Detailed and practical',
          motivators: ['Code quality', 'Developer experience', 'Team efficiency'],
          concerns: ['Learning curve', 'Documentation quality', 'Support responsiveness'],
          decisionFactors: ['Technical merit', 'Team feedback', 'Integration ease'],
          nextBestAction: 'Provide access to developer sandbox environment',
          createdAt: '2023-06-15T08:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'contact-004',
          name: 'Jennifer Park',
          email: 'jennifer.park@techcorp.example.com',
          title: 'VP of Operations',
          department: 'Operations',
          seniority: 'executive',
          role: 'influencer',
          accountId: 'acc-001',
          companyName: 'TechCorp Solutions',
          profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
          personalNotes: 'Process-oriented, concerned with implementation timeline and change management. Strong voice in executive decisions.',
          tags: ['operations', 'process-focused', 'change-management'],
          relationshipStrength: 65,
          influenceLevel: 85,
          responsiveness: 72,
          advocacyScore: 58,
          decisionMakingPower: 80,
          totalInteractions: 18,
          lastInteractionDate: '2024-01-12T16:00:00Z',
          lastInteractionType: 'email',
          preferredCommunicationMethod: 'phone',
          responseTimeHours: 24,
          meetingAttendanceRate: 75,
          emailEngagementRate: 68,
          personalityType: 'Systematic Amiable',
          communicationStyle: 'Structured and relationship-focused',
          motivators: ['Process improvement', 'Team stability', 'Risk mitigation'],
          concerns: ['Implementation disruption', 'Training requirements', 'Support quality'],
          decisionFactors: ['Implementation plan', 'Change management', 'Risk assessment'],
          nextBestAction: 'Schedule implementation planning workshop',
          createdAt: '2023-08-20T09:00:00Z',
          updatedAt: '2024-01-12T16:00:00Z'
        },
        {
          id: 'contact-005',
          name: 'David Kim',
          email: 'david.kim@globaltech.example.com',
          title: 'Senior Product Manager',
          department: 'Product',
          seniority: 'senior',
          role: 'influencer',
          accountId: 'acc-002',
          companyName: 'GlobalTech Industries',
          profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          personalNotes: 'Product-focused, values user experience and market fit. Strong technical background with business acumen.',
          tags: ['product', 'user-focused', 'technical-business'],
          relationshipStrength: 78,
          influenceLevel: 72,
          responsiveness: 85,
          advocacyScore: 80,
          decisionMakingPower: 70,
          totalInteractions: 28,
          lastInteractionDate: '2024-01-13T09:30:00Z',
          lastInteractionType: 'call',
          preferredCommunicationMethod: 'phone',
          responseTimeHours: 6,
          meetingAttendanceRate: 88,
          emailEngagementRate: 75,
          personalityType: 'Collaborative Analyst',
          communicationStyle: 'Balanced and user-centered',
          motivators: ['User satisfaction', 'Product innovation', 'Market success'],
          concerns: ['User adoption', 'Competitive landscape', 'Feature complexity'],
          decisionFactors: ['User impact', 'Market differentiation', 'Technical feasibility'],
          nextBestAction: 'Conduct user experience workshop with product team',
          createdAt: '2023-07-10T10:00:00Z',
          updatedAt: '2024-01-13T09:30:00Z'
        }
      ]
      setContacts(sampleContacts)

      // Sample interactions
      const sampleInteractions: Interaction[] = [
        {
          id: 'int-001',
          contactId: 'contact-001',
          accountId: 'acc-001',
          type: 'email',
          subtype: 'follow_up',
          title: 'Technical Requirements Follow-up',
          description: 'Detailed discussion about API integration requirements and security protocols.',
          date: '2024-01-15T14:30:00Z',
          sentiment: 0.8,
          importance: 90,
          outcome: 'positive',
          followUpRequired: true,
          followUpDate: '2024-01-18T10:00:00Z',
          participants: ['michael.chen@techcorp.example.com', 'john.smith@company.com'],
          topics: ['API integration', 'Security', 'Technical requirements'],
          aiInsights: ['High engagement on security features', 'Requested additional technical documentation', 'Expressed urgency for implementation'],
          attachments: ['technical-specs.pdf', 'security-whitepaper.pdf'],
          isConfidential: false,
          createdBy: 'john.smith@company.com',
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'int-002',
          contactId: 'contact-002',
          accountId: 'acc-001',
          type: 'meeting',
          subtype: 'executive_briefing',
          title: 'Executive Strategic Alignment Discussion',
          description: 'High-level discussion about strategic alignment and business impact.',
          date: '2024-01-14T10:15:00Z',
          duration: 45,
          sentiment: 0.7,
          importance: 88,
          outcome: 'positive',
          followUpRequired: true,
          followUpDate: '2024-01-17T15:00:00Z',
          participants: ['sarah.williams@techcorp.example.com', 'jennifer.park@techcorp.example.com'],
          topics: ['Strategic alignment', 'ROI projections', 'Implementation timeline'],
          aiInsights: ['Expressed urgency for Q1 implementation', 'Focused on business outcomes', 'Requested ROI analysis'],
          attachments: ['executive-summary.pdf', 'roi-projections.xlsx'],
          isConfidential: false,
          createdBy: 'john.smith@company.com',
          createdAt: '2024-01-14T10:15:00Z'
        }
      ]
      setInteractions(sampleInteractions)

      // Sample relationships
      const sampleRelationships: Relationship[] = [
        {
          id: 'rel-001',
          contactId: 'contact-003',
          relatedContactId: 'contact-001',
          relationshipType: 'reports-to',
          strength: 85,
          influence: 'high',
          description: 'Alex reports directly to Michael and is his trusted technical advisor.',
          mappedAt: '2023-06-15T08:00:00Z'
        },
        {
          id: 'rel-002',
          contactId: 'contact-001',
          relatedContactId: 'contact-002',
          relationshipType: 'peer',
          strength: 78,
          influence: 'high',
          description: 'Executive team members who collaborate on strategic technology decisions.',
          mappedAt: '2023-06-15T08:00:00Z'
        }
      ]
      setRelationships(sampleRelationships)
    }
  }, [contacts.length, setContacts, setInteractions, setRelationships])

  // Find the contact by ID or name
  const findContact = () => {
    return contacts.find(c => 
      c.id === contactId || 
      c.name.toLowerCase() === contactName.toLowerCase() ||
      c.name === contactName
    )
  }

  const handleContactClick = () => {
    setLoading(true)
    const contact = findContact()
    
    if (contact) {
      setSelectedContact(contact)
      if (onContactSelect) {
        onContactSelect(contact)
      }
      toast.success(`Opening detailed profile for ${contact.name}`)
    } else {
      // Create placeholder contact if not found
      const placeholder: Contact = {
        id: contactId || `contact-${Date.now()}`,
        name: contactName,
        email: `${contactName.toLowerCase().replace(' ', '.')}@company.com`,
        title: 'Contact',
        department: 'Unknown',
        seniority: 'mid',
        role: 'user',
        accountId: accountId || 'unknown',
        companyName: 'Unknown Company',
        personalNotes: 'Contact information to be updated.',
        tags: ['new-contact'],
        relationshipStrength: 50,
        influenceLevel: 50,
        responsiveness: 50,
        advocacyScore: 50,
        decisionMakingPower: 50,
        totalInteractions: 0,
        lastInteractionDate: new Date().toISOString(),
        lastInteractionType: 'unknown',
        preferredCommunicationMethod: 'email',
        responseTimeHours: 24,
        meetingAttendanceRate: 0,
        emailEngagementRate: 0,
        personalityType: 'Unknown',
        communicationStyle: 'Unknown',
        motivators: [],
        concerns: [],
        decisionFactors: [],
        nextBestAction: 'Initial contact and relationship building',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setSelectedContact(placeholder)
      toast.info(`Creating new profile for ${contactName}`)
    }
    
    setIsOpen(true)
    setLoading(false)
  }

  const getContactInteractions = (contactId: string) => {
    return interactions.filter(interaction => interaction.contactId === contactId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getContactRelationships = (contactId: string) => {
    const directRelationships = relationships.filter(rel => rel.contactId === contactId)
    const inverseRelationships = relationships.filter(rel => rel.relatedContactId === contactId)
    
    return [...directRelationships, ...inverseRelationships.map(rel => ({
      ...rel,
      contactId: rel.relatedContactId,
      relatedContactId: rel.contactId,
      relationshipType: getInverseRelationshipType(rel.relationshipType)
    }))]
  }

  const getInverseRelationshipType = (type: string) => {
    switch (type) {
      case 'reports-to': return 'subordinate'
      case 'subordinate': return 'reports-to'
      default: return type
    }
  }

  const getSeniorityIcon = (seniority: string) => {
    switch (seniority) {
      case 'c-level': return <Crown className="w-4 h-4 text-purple-600" />
      case 'executive': return <Shield className="w-4 h-4 text-blue-600" />
      case 'senior': return <Star className="w-4 h-4 text-green-600" />
      case 'mid': return <UserCircle className="w-4 h-4 text-yellow-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'decision-maker': return <Lightning className="w-4 h-4 text-red-600" />
      case 'champion': return <Heart className="w-4 h-4 text-pink-600" />
      case 'influencer': return <Target className="w-4 h-4 text-orange-600" />
      case 'blocker': return <XIcon className="w-4 h-4 text-red-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRelationshipStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600'
    if (strength >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'meeting': return <Video className="w-4 h-4" />
      case 'social': return <ChatCircle className="w-4 h-4" />
      case 'event': return <Calendar className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.5) return <ThumbsUp className="w-4 h-4 text-green-600" />
    if (sentiment > -0.5) return <Activity className="w-4 h-4 text-yellow-600" />
    return <Warning className="w-4 h-4 text-red-600" />
  }

  if (inline) {
    return (
      <>
        <button 
          className="clickable-data hover:text-primary transition-colors cursor-pointer font-medium"
          onClick={handleContactClick}
          data-type="contact-name"
          disabled={loading}
        >
          {contactName}
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedContact && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedContact.profilePhoto} />
                      <AvatarFallback>
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>Contact Relationship Mapping</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            {selectedContact && (
              <div className="space-y-6">
                {/* Contact Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedContact.profilePhoto} />
                        <AvatarFallback className="text-lg">
                          {selectedContact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold">{selectedContact.name}</h3>
                          <div className="flex items-center space-x-2">
                            {getSeniorityIcon(selectedContact.seniority)}
                            {getRoleIcon(selectedContact.role)}
                          </div>
                        </div>
                        <p className="text-lg text-muted-foreground mb-1">{selectedContact.title}</p>
                        <p className="text-muted-foreground mb-3">{selectedContact.department} • {selectedContact.companyName}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{selectedContact.email}</span>
                          </div>
                          {selectedContact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{selectedContact.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedContact.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Relationship:</span>
                          <span className={`font-bold ${getRelationshipStrengthColor(selectedContact.relationshipStrength)}`}>
                            {selectedContact.relationshipStrength}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <ScrollArea className="h-[400px]">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="relationships">Relationships</TabsTrigger>
                      <TabsTrigger value="interactions">Interactions</TabsTrigger>
                      <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Key Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Relationship Strength</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={selectedContact.relationshipStrength} className="w-20" />
                                <span className="text-sm font-medium">{selectedContact.relationshipStrength}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Influence Level</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={selectedContact.influenceLevel} className="w-20" />
                                <span className="text-sm font-medium">{selectedContact.influenceLevel}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Responsiveness</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={selectedContact.responsiveness} className="w-20" />
                                <span className="text-sm font-medium">{selectedContact.responsiveness}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Department</label>
                              <p className="text-sm">{selectedContact.department}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Preferred Communication</label>
                              <p className="text-sm capitalize">{selectedContact.preferredCommunicationMethod}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Response Time</label>
                              <p className="text-sm">{selectedContact.responseTimeHours}h average</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{selectedContact.personalNotes}</p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="relationships" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getContactRelationships(selectedContact.id).slice(0, 4).map((relationship) => {
                          const relatedContact = contacts.find(c => c.id === relationship.relatedContactId)
                          if (!relatedContact) return null

                          return (
                            <Card key={relationship.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={relatedContact.profilePhoto} />
                                    <AvatarFallback>
                                      {relatedContact.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm">{relatedContact.name}</h4>
                                    <p className="text-xs text-muted-foreground">{relatedContact.title}</p>
                                    <Badge variant="outline" className="text-xs mt-1 capitalize">
                                      {relationship.relationshipType.replace('-', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="interactions" className="space-y-4">
                      <div className="space-y-3">
                        {getContactInteractions(selectedContact.id).slice(0, 5).map((interaction) => (
                          <Card key={interaction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  {getInteractionIcon(interaction.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm">{interaction.title}</h4>
                                    <div className="flex items-center space-x-2">
                                      {getSentimentIcon(interaction.sentiment)}
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(interaction.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{interaction.description}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {interaction.type}
                                    </Badge>
                                    <Badge 
                                      variant={
                                        interaction.outcome === 'positive' ? 'default' :
                                        interaction.outcome === 'negative' ? 'destructive' : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {interaction.outcome}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Brain className="w-5 h-5 mr-2" />
                            AI Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Personality Type</label>
                            <p className="font-medium">{selectedContact.personalityType}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Communication Style</label>
                            <p>{selectedContact.communicationStyle}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Next Best Action</label>
                            <p className="text-sm bg-blue-50 p-3 rounded">{selectedContact.nextBestAction}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Motivators</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedContact.motivators.map((motivator, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Target className="w-3 h-3 text-green-600" />
                                  <span className="text-xs">{motivator}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Concerns</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedContact.concerns.map((concern, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Warning className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs">{concern}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Decision Factors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedContact.decisionFactors.map((factor, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs">{factor}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // For full profile display
  return (
    <div>
      <Button onClick={handleContactClick} variant="outline">
        View Contact Profile: {contactName}
      </Button>
    </div>
  )
}

export default ClickableContactProfile