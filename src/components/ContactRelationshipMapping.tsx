import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Handshake,
  TrendUp,
  TrendDown,
  Activity,
  Star,
  ChartLine,
  Network,
  UserCircle,
  Briefcase,
  GraduationCap,
  Globe,
  LinkSimple,
  ChatCircle,
  PaperPlaneTilt,
  Heart,
  ThumbsUp,
  Warning,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  Crown,
  Shield,
  Lightning,
  Target,
  Gauge,
  Brain,
  Eye,
  Share,
  CaretDown,
  CaretUp,
  X as XIcon,
  Plus,
  Edit,
  MoreHorizontal,
  Filter,
  SortAscending,
  SortDescending,
  Pulse
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

interface ContactRelationshipMappingProps {
  contactId: string
  contactName: string
  accountId: string
  companyId: string
  onClose: () => void
}

function ContactRelationshipMapping({ 
  contactId, 
  contactName, 
  accountId, 
  companyId, 
  onClose 
}: ContactRelationshipMappingProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`contacts-${companyId}`, [])
  const [interactions, setInteractions] = useKV<Interaction[]>(`contact-interactions-${companyId}`, [])
  const [relationships, setRelationships] = useKV<Relationship[]>(`contact-relationships-${companyId}`, [])
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [interactionFilter, setInteractionFilter] = useState<string>('all')
  const [interactionSort, setInteractionSort] = useState<'asc' | 'desc'>('desc')
  const [showAllRelationships, setShowAllRelationships] = useState(false)

  // Initialize with sample data
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
          contactId: 'contact-001',
          accountId: 'acc-001',
          type: 'meeting',
          subtype: 'product_demo',
          title: 'AI Platform Technical Demonstration',
          description: 'Comprehensive technical demonstration of AI capabilities with hands-on exploration.',
          date: '2024-01-14T10:00:00Z',
          duration: 90,
          sentiment: 0.9,
          importance: 95,
          outcome: 'positive',
          followUpRequired: true,
          followUpDate: '2024-01-16T14:00:00Z',
          participants: ['michael.chen@techcorp.example.com', 'alex.rodriguez@techcorp.example.com', 'john.smith@company.com'],
          topics: ['AI capabilities', 'Technical architecture', 'Integration options'],
          aiInsights: ['Very engaged throughout demo', 'Asked detailed technical questions', 'Showed strong interest in AI features'],
          attachments: ['demo-recording.mp4', 'technical-slides.pdf'],
          isConfidential: false,
          createdBy: 'john.smith@company.com',
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'int-003',
          contactId: 'contact-002',
          accountId: 'acc-001',
          type: 'meeting',
          subtype: 'executive_briefing',
          title: 'Executive Strategic Alignment Discussion',
          description: 'High-level discussion about strategic alignment and business impact of AI platform implementation.',
          date: '2024-01-14T10:15:00Z',
          duration: 45,
          sentiment: 0.7,
          importance: 88,
          outcome: 'positive',
          followUpRequired: true,
          followUpDate: '2024-01-17T15:00:00Z',
          participants: ['sarah.williams@techcorp.example.com', 'jennifer.park@techcorp.example.com', 'john.smith@company.com'],
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
        },
        {
          id: 'rel-003',
          contactId: 'contact-004',
          relatedContactId: 'contact-002',
          relationshipType: 'reports-to',
          strength: 72,
          influence: 'medium',
          description: 'Jennifer reports to Sarah and provides operational perspective on executive decisions.',
          mappedAt: '2023-08-20T09:00:00Z'
        }
      ]
      setRelationships(sampleRelationships)
    }
  }, [contacts.length, setContacts, setInteractions, setRelationships])

  // Find the contact by ID or name
  useEffect(() => {
    const contact = contacts.find(c => c.id === contactId || c.name === contactName)
    if (contact) {
      setSelectedContact(contact)
    } else if (contacts.length > 0) {
      // If no exact match, create a placeholder contact
      const placeholderContact: Contact = {
        id: contactId || 'unknown',
        name: contactName,
        email: `${contactName.toLowerCase().replace(' ', '.')}@company.com`,
        title: 'Contact',
        department: 'Unknown',
        seniority: 'mid',
        role: 'user',
        accountId: accountId,
        companyName: 'Unknown Company',
        personalNotes: 'Contact information to be updated.',
        tags: [],
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
      setSelectedContact(placeholderContact)
    }
  }, [contactId, contactName, contacts, accountId])

  const getContactInteractions = (contactId: string) => {
    return interactions
      .filter(interaction => interaction.contactId === contactId)
      .filter(interaction => interactionFilter === 'all' || interaction.type === interactionFilter)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return interactionSort === 'desc' ? dateB - dateA : dateA - dateB
      })
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

  const getRelatedContact = (relationshipContactId: string) => {
    return contacts.find(c => c.id === relationshipContactId)
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
      case 'blocker': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRelationshipStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600'
    if (strength >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRelationshipStrengthBadge = (strength: number) => {
    if (strength >= 80) return <Badge className="bg-green-100 text-green-800">Strong</Badge>
    if (strength >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
    return <Badge className="bg-red-100 text-red-800">Weak</Badge>
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

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-600'
    if (sentiment > -0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.5) return <ThumbsUp className="w-4 h-4 text-green-600" />
    if (sentiment > -0.5) return <Activity className="w-4 h-4 text-yellow-600" />
    return <Warning className="w-4 h-4 text-red-600" />
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    toast.success(`Viewing relationship mapping for ${contact.name}`)
  }

  const handleInteractionClick = (interaction: Interaction) => {
    toast.info(`Viewing interaction: ${interaction.title}`)
    // In a real app: open detailed interaction view
  }

  if (!selectedContact) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Contact Not Found</h3>
          <p className="text-muted-foreground mb-4">
            Unable to find contact information for "{contactName}".
          </p>
          <Button onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  const contactInteractions = getContactInteractions(selectedContact.id)
  const contactRelationships = getContactRelationships(selectedContact.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onClose}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Contact Relationship Mapping</h2>
            <p className="text-muted-foreground">
              Complete relationship view and interaction history for {selectedContact.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Contact
          </Button>
          <Button size="sm" variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>
      </div>

      {/* Contact Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={selectedContact.profilePhoto} />
              <AvatarFallback className="text-lg">
                {selectedContact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-2xl font-bold">{selectedContact.name}</h3>
                <div className="flex items-center space-x-2">
                  {getSeniorityIcon(selectedContact.seniority)}
                  {getRoleIcon(selectedContact.role)}
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-1">{selectedContact.title}</p>
              <p className="text-muted-foreground mb-3">{selectedContact.department} • {selectedContact.companyName}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <button 
                    className="clickable-data hover:text-primary transition-colors text-sm"
                    onClick={() => toast.info(`Email: ${selectedContact.email}`)}
                  >
                    {selectedContact.email}
                  </button>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <button 
                      className="clickable-data hover:text-primary transition-colors text-sm"
                      onClick={() => toast.info(`Phone: ${selectedContact.phone}`)}
                    >
                      {selectedContact.phone}
                    </button>
                  </div>
                )}
                {selectedContact.linkedInUrl && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <button 
                      className="clickable-data hover:text-primary transition-colors text-sm"
                      onClick={() => window.open(selectedContact.linkedInUrl, '_blank')}
                    >
                      LinkedIn Profile
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Last: {new Date(selectedContact.lastInteractionDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedContact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="capitalize">
                  {selectedContact.role}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedContact.seniority}
                </Badge>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Relationship Strength:</span>
                <span className={`text-lg font-bold ${getRelationshipStrengthColor(selectedContact.relationshipStrength)}`}>
                  {selectedContact.relationshipStrength}%
                </span>
              </div>
              {getRelationshipStrengthBadge(selectedContact.relationshipStrength)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile & Insights</TabsTrigger>
          <TabsTrigger value="relationships">Relationship Map</TabsTrigger>
          <TabsTrigger value="interactions">Interaction History</TabsTrigger>
          <TabsTrigger value="metrics">Engagement Metrics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p>{selectedContact.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Seniority Level</label>
                    <div className="flex items-center space-x-2">
                      {getSeniorityIcon(selectedContact.seniority)}
                      <span className="capitalize">{selectedContact.seniority}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role in Decision</label>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedContact.role)}
                      <span className="capitalize">{selectedContact.role.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Communication</label>
                    <p className="capitalize">{selectedContact.preferredCommunicationMethod}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Personal Notes</label>
                  <p className="text-sm mt-1">{selectedContact.personalNotes}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relationship Strength</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted h-2 rounded-full">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${selectedContact.relationshipStrength}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedContact.relationshipStrength}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Influence Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted h-2 rounded-full">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedContact.influenceLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedContact.influenceLevel}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Responsiveness</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted h-2 rounded-full">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedContact.responsiveness}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedContact.responsiveness}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Advocacy Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted h-2 rounded-full">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${selectedContact.advocacyScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedContact.advocacyScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Decision Making Power</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted h-2 rounded-full">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${selectedContact.decisionMakingPower}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedContact.decisionMakingPower}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Motivators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedContact.motivators.map((motivator, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{motivator}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Concerns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedContact.concerns.map((concern, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Warning className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">{concern}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedContact.decisionFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Relationship Network</h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={showAllRelationships ? "default" : "outline"}
                onClick={() => setShowAllRelationships(!showAllRelationships)}
              >
                <Network className="w-4 h-4 mr-2" />
                {showAllRelationships ? 'Direct Only' : 'Show All'}
              </Button>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Map Relationship
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactRelationships.slice(0, showAllRelationships ? undefined : 6).map((relationship) => {
              const relatedContact = getRelatedContact(relationship.relatedContactId)
              if (!relatedContact) return null

              return (
                <Card 
                  key={relationship.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleContactClick(relatedContact)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={relatedContact.profilePhoto} />
                        <AvatarFallback>
                          {relatedContact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            <button 
                              className="clickable-data hover:text-primary transition-colors"
                              data-type="related-contact"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleContactClick(relatedContact)
                              }}
                            >
                              {relatedContact.name}
                            </button>
                          </h4>
                          {getSeniorityIcon(relatedContact.seniority)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{relatedContact.title}</p>
                        
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {relationship.relationshipType.replace('-', ' ')}
                          </Badge>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Strength</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-muted h-1 rounded-full">
                                <div 
                                  className="bg-primary h-1 rounded-full"
                                  style={{ width: `${relationship.strength}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{relationship.strength}%</span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              relationship.influence === 'high' ? 'border-red-200 text-red-700' :
                              relationship.influence === 'medium' ? 'border-yellow-200 text-yellow-700' :
                              'border-green-200 text-green-700'
                            }`}
                          >
                            {relationship.influence} influence
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {relationship.description && (
                      <div className="mt-3 p-2 bg-muted/30 rounded">
                        <p className="text-xs">{relationship.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {contactRelationships.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Relationships Mapped</h3>
                <p className="text-muted-foreground mb-4">
                  Start mapping relationships to build a complete network view.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Map First Relationship
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Interaction History</h3>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setInteractionSort(interactionSort === 'desc' ? 'asc' : 'desc')}
              >
                {interactionSort === 'desc' ? <SortDescending className="w-4 h-4 mr-2" /> : <SortAscending className="w-4 h-4 mr-2" />}
                Sort {interactionSort === 'desc' ? 'Newest' : 'Oldest'}
              </Button>
              <select 
                value={interactionFilter} 
                onChange={(e) => setInteractionFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Interactions</option>
                <option value="email">Emails</option>
                <option value="meeting">Meetings</option>
                <option value="call">Calls</option>
                <option value="social">Social</option>
                <option value="document">Documents</option>
              </select>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Interaction
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {contactInteractions.map((interaction) => (
              <Card 
                key={interaction.id} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleInteractionClick(interaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          <button 
                            className="clickable-data hover:text-primary transition-colors"
                            data-type="interaction-title"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInteractionClick(interaction)
                            }}
                          >
                            {interaction.title}
                          </button>
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(interaction.sentiment)}
                          <Badge variant="outline" className="text-xs">
                            {interaction.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            <button 
                              className="clickable-data hover:text-primary transition-colors"
                              data-type="interaction-date"
                              onClick={(e) => {
                                e.stopPropagation()
                                toast.info(`Interaction date: ${new Date(interaction.date).toLocaleString()}`)
                              }}
                            >
                              {new Date(interaction.date).toLocaleDateString()}
                            </button>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{interaction.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Gauge className="w-3 h-3 mr-1" />
                            Importance: {interaction.importance}/100
                          </span>
                          <span className={`flex items-center ${getSentimentColor(interaction.sentiment)}`}>
                            <Pulse className="w-3 h-3 mr-1" />
                            Sentiment: {(interaction.sentiment * 100).toFixed(0)}%
                          </span>
                          {interaction.duration && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {interaction.duration}m
                            </span>
                          )}
                          <Badge 
                            variant={
                              interaction.outcome === 'positive' ? 'default' :
                              interaction.outcome === 'negative' ? 'destructive' :
                              interaction.outcome === 'action-required' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {interaction.outcome}
                          </Badge>
                        </div>
                        {interaction.followUpRequired && (
                          <Badge variant="outline" className="text-xs">
                            <ArrowsClockwise className="w-3 h-3 mr-1" />
                            Follow-up required
                          </Badge>
                        )}
                      </div>

                      {interaction.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {interaction.topics.slice(0, 3).map((topic, index) => (
                            <button
                              key={index} 
                              className="clickable-data hover:bg-muted/80 transition-colors text-xs px-2 py-1 border rounded-full" 
                              data-type="interaction-topic"
                              onClick={(e) => {
                                e.stopPropagation()
                                toast.info(`Topic: ${topic}`)
                              }}
                            >
                              {topic}
                            </button>
                          ))}
                          {interaction.topics.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{interaction.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {interaction.aiInsights.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <div className="flex items-center space-x-1 mb-1">
                            <Brain className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">AI Insights:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {interaction.aiInsights.slice(0, 2).map((insight, index) => (
                              <button
                                key={index} 
                                className="clickable-data hover:bg-blue-200 transition-colors text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full" 
                                data-type="ai-insight"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.info(`AI Insight: ${insight}`)
                                }}
                              >
                                {insight}
                              </button>
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

          {contactInteractions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Interactions Recorded</h3>
                <p className="text-muted-foreground mb-4">
                  Start recording interactions to build a complete history.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record First Interaction
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                    <p className="text-2xl font-bold">{selectedContact.totalInteractions}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{selectedContact.responseTimeHours}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Attendance</p>
                    <p className="text-2xl font-bold">{selectedContact.meetingAttendanceRate}%</p>
                  </div>
                  <Video className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Email Engagement</p>
                    <p className="text-2xl font-bold">{selectedContact.emailEngagementRate}%</p>
                  </div>
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
              <CardDescription>
                Track interaction frequency and relationship strength over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Engagement timeline chart will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Personality & Communication
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

            <Card>
              <CardHeader>
                <CardTitle>Relationship Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Strong Relationship</h4>
                      <p className="text-sm text-green-700 mt-1">
                        High engagement and advocacy score indicate a strong relationship. 
                        Consider requesting referrals or case study participation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Expand Influence</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        High decision-making power suggests focusing on deepening technical 
                        discussions and providing detailed ROI analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightning className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Maintain Momentum</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Continue regular technical updates and ensure quick response 
                        to questions to maintain high responsiveness score.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shared Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Upcoming Meetings</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Pending Action Items</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Shared Documents</span>
                    <span className="text-sm font-medium">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Share contact insights with your team for better collaboration.
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Share className="w-4 h-4 mr-2" />
                      Share Contact Profile
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ContactRelationshipMapping