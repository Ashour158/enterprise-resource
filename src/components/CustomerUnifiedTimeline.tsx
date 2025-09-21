import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  DollarSign, 
  Users, 
  Video,
  MessageCircle,
  Download,
  Eye,
  Filter,
  MagnifyingGlass as Search,
  Plus,
  PushPin as Pin,
  ShareNetwork,
  ExternalLink,
  Activity,
  Star,
  Clock,
  Brain,
  TrendUp,
  Warning,
  CheckCircle,
  XCircle,
  Globe,
  Handshake,
  Ticket,
  CreditCard,
  Monitor,
  Robot,
  ChatCircle,
  LinkSimple,
  ArrowRight,
  DotsThree as MoreHorizontal,
  CaretDown,
  CaretUp,
  Heart,
  ThumbsUp,
  ThumbsDown,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Enhanced interfaces based on the SQL schema
interface CustomerUnifiedTimelineEntry {
  id: string
  customerId: string
  companyId: string
  
  // Timeline Entry Details
  timelineType: 'email' | 'call' | 'meeting' | 'quote' | 'deal' | 'support' | 'payment' | 'document' | 'social' | 'website'
  timelineSubtype: string // email_sent, email_received, meeting_scheduled, quote_sent, deal_won, etc.
  
  // Entry Content
  title: string
  description?: string
  summary?: string // AI-generated summary for complex entries
  
  // Related Records
  relatedContactId?: string
  relatedDealId?: string
  relatedQuoteId?: string
  relatedSupportTicketId?: string
  relatedDocumentId?: string
  
  // External System References
  externalSystem?: string // gmail, outlook, zoom, teams, support_system
  externalId?: string
  externalUrl?: string // link to external system
  
  // Timeline Metadata
  timelineDate: Date
  durationMinutes?: number
  participants: TimelineParticipant[]
  attachments: TimelineAttachment[]
  
  // AI Analysis
  aiImportanceScore: number // AI-calculated importance (0-100)
  aiSentimentScore: number // AI sentiment analysis (-1 to 1)
  aiImpactOnRelationship: number // impact on customer relationship
  aiExtractedInsights: string[] // AI-extracted key insights
  
  // Visibility and Access
  isPublic: boolean // visible to all team members
  visibleToRoles: string[] // specific roles that can see this
  createdBy?: string
  
  // Real-time Features
  isPinned: boolean // pinned to top of timeline
  viewCount: number
  lastViewed?: Date
  
  createdAt: Date
  updatedAt: Date
}

interface TimelineParticipant {
  id: string
  name: string
  email?: string
  role?: string
  type: 'internal' | 'external'
  avatarUrl?: string
}

interface TimelineAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  thumbnailUrl?: string
}

interface CustomerUnifiedTimelineProps {
  customerId: string
  companyId: string
  userId: string
  onEntryClick?: (entry: CustomerUnifiedTimelineEntry) => void
}

const CustomerUnifiedTimeline: React.FC<CustomerUnifiedTimelineProps> = ({
  customerId,
  companyId,
  userId,
  onEntryClick
}) => {
  const [timelineEntries, setTimelineEntries] = useKV<CustomerUnifiedTimelineEntry[]>(`timeline-${customerId}`, [])
  const [filteredEntries, setFilteredEntries] = useState<CustomerUnifiedTimelineEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showOnlyPinned, setShowOnlyPinned] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CustomerUnifiedTimelineEntry | null>(null)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<CustomerUnifiedTimelineEntry>>({
    timelineType: 'email',
    timelineSubtype: 'email_sent',
    title: '',
    description: '',
    isPublic: true,
    isPinned: false
  })

  // Initialize with mock data if empty
  useEffect(() => {
    if (timelineEntries.length === 0) {
      const mockEntries: CustomerUnifiedTimelineEntry[] = [
        {
          id: 'timeline-001',
          customerId,
          companyId,
          timelineType: 'email',
          timelineSubtype: 'email_sent',
          title: 'Welcome Email Campaign',
          description: 'Automated welcome email with onboarding materials',
          summary: 'Customer received welcome package with 95% engagement score',
          timelineDate: new Date('2024-01-15T10:30:00'),
          participants: [
            {
              id: 'user-001',
              name: 'Sarah Marketing',
              email: 'sarah@company.com',
              role: 'Marketing Manager',
              type: 'internal'
            },
            {
              id: 'contact-001',
              name: 'John Customer',
              email: 'john@customer.com',
              role: 'CEO',
              type: 'external'
            }
          ],
          attachments: [
            {
              id: 'att-001',
              name: 'Welcome_Package.pdf',
              url: '/docs/welcome.pdf',
              type: 'pdf',
              size: 2048000
            }
          ],
          aiImportanceScore: 85,
          aiSentimentScore: 0.8,
          aiImpactOnRelationship: 0.7,
          aiExtractedInsights: ['High engagement', 'Positive response', 'Ready for next step'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: true,
          viewCount: 12,
          lastViewed: new Date(),
          createdBy: userId,
          createdAt: new Date('2024-01-15T10:30:00'),
          updatedAt: new Date('2024-01-15T10:30:00')
        },
        {
          id: 'timeline-002',
          customerId,
          companyId,
          timelineType: 'meeting',
          timelineSubtype: 'demo_scheduled',
          title: 'Product Demo Meeting',
          description: 'Comprehensive product demonstration and Q&A session',
          summary: 'Successful 45-minute demo with strong buying signals detected',
          relatedDealId: 'deal-001',
          externalSystem: 'zoom',
          externalId: 'zoom-meeting-123',
          externalUrl: 'https://zoom.us/j/123456789',
          timelineDate: new Date('2024-01-20T14:00:00'),
          durationMinutes: 45,
          participants: [
            {
              id: 'user-002',
              name: 'Mike Sales',
              email: 'mike@company.com',
              role: 'Sales Representative',
              type: 'internal'
            },
            {
              id: 'contact-001',
              name: 'John Customer',
              email: 'john@customer.com',
              role: 'CEO',
              type: 'external'
            },
            {
              id: 'contact-002',
              name: 'Jane Tech',
              email: 'jane@customer.com',
              role: 'CTO',
              type: 'external'
            }
          ],
          attachments: [
            {
              id: 'att-002',
              name: 'Demo_Recording.mp4',
              url: '/recordings/demo.mp4',
              type: 'video',
              size: 150000000
            }
          ],
          aiImportanceScore: 95,
          aiSentimentScore: 0.9,
          aiImpactOnRelationship: 0.85,
          aiExtractedInsights: ['Strong buying intent', 'Technical concerns addressed', 'Decision maker engaged'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: true,
          viewCount: 8,
          createdBy: userId,
          createdAt: new Date('2024-01-20T14:00:00'),
          updatedAt: new Date('2024-01-20T14:00:00')
        },
        {
          id: 'timeline-003',
          customerId,
          companyId,
          timelineType: 'quote',
          timelineSubtype: 'quote_sent',
          title: 'Enterprise Package Quote',
          description: 'Detailed quote for enterprise solution with custom integrations',
          summary: 'Quote sent for $50k annual contract with 30-day validity',
          relatedQuoteId: 'quote-001',
          timelineDate: new Date('2024-01-22T09:15:00'),
          participants: [
            {
              id: 'user-002',
              name: 'Mike Sales',
              email: 'mike@company.com',
              role: 'Sales Representative',
              type: 'internal'
            }
          ],
          attachments: [
            {
              id: 'att-003',
              name: 'Enterprise_Quote_v2.pdf',
              url: '/quotes/ent_quote.pdf',
              type: 'pdf',
              size: 1024000
            }
          ],
          aiImportanceScore: 90,
          aiSentimentScore: 0.6,
          aiImpactOnRelationship: 0.8,
          aiExtractedInsights: ['High-value opportunity', 'Custom requirements', 'Decision pending'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: false,
          viewCount: 15,
          createdBy: userId,
          createdAt: new Date('2024-01-22T09:15:00'),
          updatedAt: new Date('2024-01-22T09:15:00')
        },
        {
          id: 'timeline-004',
          customerId,
          companyId,
          timelineType: 'support',
          timelineSubtype: 'ticket_created',
          title: 'Integration Support Request',
          description: 'Customer needs help with API integration setup',
          summary: 'Technical support ticket for API configuration assistance',
          relatedSupportTicketId: 'ticket-001',
          timelineDate: new Date('2024-01-25T16:30:00'),
          participants: [
            {
              id: 'user-003',
              name: 'Alex Support',
              email: 'alex@company.com',
              role: 'Technical Support',
              type: 'internal'
            },
            {
              id: 'contact-002',
              name: 'Jane Tech',
              email: 'jane@customer.com',
              role: 'CTO',
              type: 'external'
            }
          ],
          attachments: [],
          aiImportanceScore: 70,
          aiSentimentScore: -0.2,
          aiImpactOnRelationship: 0.4,
          aiExtractedInsights: ['Technical challenge', 'Implementation concern', 'Needs immediate attention'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: false,
          viewCount: 5,
          createdBy: userId,
          createdAt: new Date('2024-01-25T16:30:00'),
          updatedAt: new Date('2024-01-25T16:30:00')
        },
        {
          id: 'timeline-005',
          customerId,
          companyId,
          timelineType: 'deal',
          timelineSubtype: 'deal_won',
          title: 'Deal Closed Successfully',
          description: 'Enterprise contract signed for $50,000 annual value',
          summary: 'Customer signed enterprise contract with 2-year commitment',
          relatedDealId: 'deal-001',
          timelineDate: new Date('2024-01-28T11:00:00'),
          participants: [
            {
              id: 'user-002',
              name: 'Mike Sales',
              email: 'mike@company.com',
              role: 'Sales Representative',
              type: 'internal'
            },
            {
              id: 'contact-001',
              name: 'John Customer',
              email: 'john@customer.com',
              role: 'CEO',
              type: 'external'
            }
          ],
          attachments: [
            {
              id: 'att-004',
              name: 'Signed_Contract.pdf',
              url: '/contracts/signed.pdf',
              type: 'pdf',
              size: 3072000
            }
          ],
          aiImportanceScore: 100,
          aiSentimentScore: 1.0,
          aiImpactOnRelationship: 1.0,
          aiExtractedInsights: ['Major milestone', 'Strong relationship', 'Expansion opportunity'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: true,
          viewCount: 25,
          createdBy: userId,
          createdAt: new Date('2024-01-28T11:00:00'),
          updatedAt: new Date('2024-01-28T11:00:00')
        }
      ]

      setTimelineEntries(mockEntries)
    }
  }, [customerId, companyId, userId, timelineEntries.length, setTimelineEntries])

  // Filter timeline entries
  useEffect(() => {
    let filtered = [...timelineEntries]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.participants.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.timelineType === typeFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setDate(now.getDate())
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          filterDate.setFullYear(1970)
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.timelineDate) >= filterDate
      )
    }

    // Pinned filter
    if (showOnlyPinned) {
      filtered = filtered.filter(entry => entry.isPinned)
    }

    // Sort by date (newest first) and pinned items first
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime()
    })

    setFilteredEntries(filtered)
  }, [timelineEntries, searchTerm, typeFilter, dateFilter, showOnlyPinned])

  const getTimelineIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'email':
        return <Mail size={16} className="text-blue-500" />
      case 'call':
        return <Phone size={16} className="text-green-500" />
      case 'meeting':
        return <Video size={16} className="text-purple-500" />
      case 'quote':
        return <FileText size={16} className="text-orange-500" />
      case 'deal':
        return subtype === 'deal_won' ? <CheckCircle size={16} className="text-green-600" /> : <DollarSign size={16} className="text-yellow-500" />
      case 'support':
        return <Ticket size={16} className="text-red-500" />
      case 'payment':
        return <CreditCard size={16} className="text-emerald-500" />
      case 'document':
        return <FileText size={16} className="text-gray-500" />
      case 'social':
        return <ShareNetwork size={16} className="text-pink-500" />
      case 'website':
        return <Globe size={16} className="text-indigo-500" />
      default:
        return <Activity size={16} className="text-gray-400" />
    }
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.5) return <ThumbsUp size={14} className="text-green-500" />
    if (score < -0.5) return <ThumbsDown size={14} className="text-red-500" />
    return <MessageCircle size={14} className="text-gray-400" />
  }

  const getImportanceColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-50'
    if (score >= 70) return 'text-orange-600 bg-orange-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const handleEntryClick = (entry: CustomerUnifiedTimelineEntry) => {
    setSelectedEntry(entry)
    
    // Update view count
    const updatedEntries = timelineEntries.map(e => 
      e.id === entry.id 
        ? { ...e, viewCount: e.viewCount + 1, lastViewed: new Date() }
        : e
    )
    setTimelineEntries(updatedEntries)
    
    onEntryClick?.(entry)
    toast.info(`Viewing: ${entry.title}`)
  }

  const handlePinToggle = (entryId: string) => {
    const updatedEntries = timelineEntries.map(entry =>
      entry.id === entryId
        ? { ...entry, isPinned: !entry.isPinned }
        : entry
    )
    setTimelineEntries(updatedEntries)
    toast.success('Timeline entry updated')
  }

  const handleAddEntry = () => {
    if (!newEntry.title) {
      toast.error('Please provide a title for the timeline entry')
      return
    }

    const entry: CustomerUnifiedTimelineEntry = {
      id: `timeline-${Date.now()}`,
      customerId,
      companyId,
      timelineType: newEntry.timelineType!,
      timelineSubtype: newEntry.timelineSubtype || '',
      title: newEntry.title,
      description: newEntry.description || '',
      summary: '', // Would be AI-generated in real system
      timelineDate: new Date(),
      participants: [],
      attachments: [],
      aiImportanceScore: 50, // Default score
      aiSentimentScore: 0,
      aiImpactOnRelationship: 0.5,
      aiExtractedInsights: [],
      isPublic: newEntry.isPublic!,
      visibleToRoles: [],
      isPinned: newEntry.isPinned!,
      viewCount: 0,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTimelineEntries(prev => [entry, ...prev])
    setNewEntry({
      timelineType: 'email',
      timelineSubtype: 'email_sent',
      title: '',
      description: '',
      isPublic: true,
      isPinned: false
    })
    setShowAddEntry(false)
    toast.success('Timeline entry added successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Complete interaction history with AI insights
          </p>
        </div>
        <Button onClick={() => setShowAddEntry(true)} size="sm">
          <Plus size={16} className="mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search timeline entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showOnlyPinned ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyPinned(!showOnlyPinned)}
            >
              <Pin size={16} className="mr-2" />
              Pinned Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity size={32} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' || showOnlyPinned
                  ? 'No timeline entries match your filters'
                  : 'No timeline entries found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className={`transition-all hover:shadow-md cursor-pointer ${entry.isPinned ? 'ring-1 ring-primary/20 bg-primary/5' : ''}`}
              onClick={() => handleEntryClick(entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTimelineIcon(entry.timelineType, entry.timelineSubtype)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entry.title}</h4>
                          {entry.isPinned && (
                            <Pin size={14} className="text-primary" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {entry.timelineType}
                          </Badge>
                          {entry.timelineSubtype && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.timelineSubtype.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.description}
                        </p>
                      </div>
                    </div>

                    {/* AI Summary */}
                    {entry.summary && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Robot size={14} className="text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">AI Summary</span>
                        </div>
                        <p className="text-sm text-blue-800">{entry.summary}</p>
                      </div>
                    )}

                    {/* Participants */}
                    {entry.participants.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-muted-foreground" />
                        <div className="flex -space-x-1">
                          {entry.participants.slice(0, 4).map((participant, index) => (
                            <Avatar key={participant.id} className="w-6 h-6 border border-background">
                              <AvatarFallback className="text-xs">
                                {participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {entry.participants.length > 4 && (
                            <div className="w-6 h-6 bg-muted rounded-full border border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">+{entry.participants.length - 4}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {entry.participants.length} participant{entry.participants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Attachments */}
                    {entry.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {entry.attachments.length} attachment{entry.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* AI Insights */}
                    {entry.aiExtractedInsights.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.aiExtractedInsights.map((insight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Brain size={10} className="mr-1" />
                            {insight}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* External Link */}
                    {entry.externalUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <LinkSimple size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {entry.externalSystem}
                        </span>
                        <ExternalLink size={12} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Importance Score */}
                    <Badge className={`text-xs ${getImportanceColor(entry.aiImportanceScore)}`}>
                      {entry.aiImportanceScore}/100
                    </Badge>

                    {/* Sentiment */}
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(entry.aiSentimentScore)}
                      <span className="text-xs text-muted-foreground">
                        {entry.aiSentimentScore > 0 ? '+' : ''}{(entry.aiSentimentScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timelineDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timelineDate).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePinToggle(entry.id)
                      }}
                    >
                      <Pin size={12} className={entry.isPinned ? 'text-primary' : 'text-muted-foreground'} />
                    </Button>
                  </div>
                </div>

                {/* View count */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{entry.viewCount} views</span>
                    </div>
                    {entry.durationMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{entry.durationMinutes} min</span>
                      </div>
                    )}
                    {entry.lastViewed && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Last viewed {new Date(entry.lastViewed).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {entry.externalUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(entry.externalUrl, '_blank')
                        }}
                      >
                        <ExternalLink size={12} />
                      </Button>
                    )}
                    <ArrowRight size={12} className="text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
          <CardHeader>
            <CardTitle>Add Timeline Entry</CardTitle>
            <CardDescription>
              Record a new customer interaction or event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={newEntry.timelineType} 
                  onValueChange={(value) => setNewEntry(prev => ({ ...prev, timelineType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subtype</label>
                <Input
                  placeholder="e.g., email_sent, meeting_scheduled"
                  value={newEntry.timelineSubtype}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, timelineSubtype: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Brief title for this entry"
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Detailed description of the interaction"
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEntry.isPublic}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <span className="text-sm">Visible to team</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEntry.isPinned}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, isPinned: e.target.checked }))}
                />
                <span className="text-sm">Pin to top</span>
              </label>
            </div>
          </CardContent>
          
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={() => setShowAddEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry}>
              Add Entry
            </Button>
          </div>
        </Card>
      )}

      {/* Detailed Entry View */}
      {selectedEntry && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTimelineIcon(selectedEntry.timelineType, selectedEntry.timelineSubtype)}
                  {selectedEntry.title}
                  {selectedEntry.isPinned && <Pin size={16} className="text-primary" />}
                </CardTitle>
                <CardDescription>
                  {selectedEntry.description}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Summary */}
            {selectedEntry.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Robot size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-700">AI Summary</span>
                </div>
                <p className="text-blue-800">{selectedEntry.summary}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Event Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(selectedEntry.timelineDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{selectedEntry.timelineType}</span>
                  </div>
                  {selectedEntry.timelineSubtype && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtype:</span>
                      <span className="capitalize">{selectedEntry.timelineSubtype.replace('_', ' ')}</span>
                    </div>
                  )}
                  {selectedEntry.durationMinutes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedEntry.durationMinutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">AI Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Importance:</span>
                    <Badge className={getImportanceColor(selectedEntry.aiImportanceScore)}>
                      {selectedEntry.aiImportanceScore}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentiment:</span>
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(selectedEntry.aiSentimentScore)}
                      <span>{(selectedEntry.aiSentimentScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Relationship Impact:</span>
                    <span>{(selectedEntry.aiImpactOnRelationship * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            {selectedEntry.participants.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Participants</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedEntry.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.email} • {participant.role} • {participant.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {selectedEntry.aiExtractedInsights.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">AI Insights</h4>
                <div className="space-y-2">
                  {selectedEntry.aiExtractedInsights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Brain size={14} className="text-blue-600" />
                      <span className="text-sm text-blue-800">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {selectedEntry.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attachments</h4>
                <div className="space-y-2">
                  {selectedEntry.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <FileText size={16} className="text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.type.toUpperCase()} • {(attachment.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External System */}
            {selectedEntry.externalUrl && (
              <div>
                <h4 className="font-medium mb-2">External System</h4>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Globe size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{selectedEntry.externalSystem}</p>
                    <p className="text-xs text-muted-foreground">ID: {selectedEntry.externalId}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.open(selectedEntry.externalUrl, '_blank')}>
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CustomerUnifiedTimeline