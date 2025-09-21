import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building, 
  Users, 
  TrendUp, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Star,
  Clock,
  MessageCircle,
  Video,
  PaperPlaneTilt,
  Download,
  Eye,
  CaretDown,
  CaretUp,
  Filter,
  Search,
  Plus,
  Edit,
  MoreHorizontal,
  ChartBar,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Lightbulb,
  Handshake,
  TrendDown,
  Warning,
  ArrowsClockwise,
  PlayCircle,
  Microphone,
  CreditCard,
  Receipt,
  PiggyBank,
  TrendUp as TrendUpIcon,
  FileArrowUp,
  FilePdf,
  FileDoc,
  FileXls,
  LinkSimple,
  Globe,
  SpeakerHigh,
  Headphones,
  ChatCircle,
  TicketX,
  Question,
  Wrench,
  CheckSquare,
  X as XIcon,
  Archive,
  Share,
  Copy,
  Folders,
  Tag,
  CalendarCheck,
  Timer,
  Gauge,
  Pulse,
  CaretRight,
  List,
  Kanban,
  FunnelSimple,
  GraphicsCard,
  Notebook,
  UserCircle,
  EnvelopeOpen,
  Reply,
  Paperclip,
  PushPin,
  SortAscending,
  SortDescending,
  DotsThreeVertical,
  PlayCircle as Play,
  PauseCircle as Pause,
  SkipForward,
  VolumeHigh,
  Subtitles,
  Download as DownloadIcon,
  Upload,
  CloudArrowUp,
  CloudArrowDown,
  Trash,
  Warning as WarningIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Account {
  id: string
  accountNumber: string
  companyName: string
  industry: string
  website: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  accountOwner: string
  accountType: 'prospect' | 'customer' | 'partner' | 'vendor'
  accountStatus: 'active' | 'inactive' | 'pending' | 'suspended'
  companySize: string
  annualRevenue: number
  employees: number
  founded: string
  description: string
  tags: string[]
  customFields: Record<string, any>
  
  // Enhanced tracking fields
  totalEmailCount: number
  totalMeetingCount: number
  totalCallCount: number
  totalQuoteCount: number
  totalDealCount: number
  totalSupportTickets: number
  totalDocumentsShared: number
  
  lastEmailDate?: string
  lastMeetingDate?: string
  lastCallDate?: string
  lastQuoteDate?: string
  lastSupportTicketDate?: string
  lastLoginDate?: string
  
  // AI Intelligence
  aiEngagementTrend: 'increasing' | 'stable' | 'decreasing' | 'critical'
  aiSatisfactionTrend: 'improving' | 'stable' | 'declining'
  aiExpansionReadiness: number // 0-100
  aiRetentionProbability: number // 0-1
  aiAdvocacyPotential: number // 0-100
  
  // Customer Success Metrics
  healthScore: number // 0-100
  engagementScore: number // 0-100
  npsScore?: number // -100 to 100
  csatScore?: number // 0-100
  churnRisk: 'low' | 'medium' | 'high' | 'critical'
  
  createdAt: string
  updatedAt: string
}

interface TimelineEntry {
  id: string
  accountId: string
  timelineType: 'email' | 'call' | 'meeting' | 'quote' | 'deal' | 'support' | 'payment' | 'document' | 'social' | 'website'
  timelineSubtype: string
  title: string
  description: string
  summary?: string
  relatedContactId?: string
  relatedDealId?: string
  relatedQuoteId?: string
  timelineDate: string
  durationMinutes?: number
  participants: string[]
  attachments: string[]
  aiImportanceScore: number // 0-100
  aiSentimentScore: number // -1 to 1
  aiImpactOnRelationship: number // -1 to 1
  aiExtractedInsights: string[]
  isPublic: boolean
  isPinned: boolean
  viewCount: number
  lastViewed?: string
  createdBy: string
  createdAt: string
}

interface CustomerSuccessMetric {
  id: string
  accountId: string
  measurementDate: string
  productUsageScore: number
  featureAdoptionRate: number
  userActivityScore: number
  loginFrequencyScore: number
  npsScore?: number
  csatScore?: number
  cesScore?: number
  supportTicketVolume: number
  averageResolutionTimeHours: number
  escalationRate: number
  firstContactResolutionRate: number
  paymentTimelinessScore: number
  contractUtilizationRate: number
  expansionRevenue: number
  emailEngagementScore: number
  meetingAttendanceRate: number
  responseTimeScore: number
  aiOverallHealthScore: number
  aiChurnRiskScore: number
  aiExpansionReadiness: number
  aiAdvocacyPotential: number
  createdAt: string
}

interface AccountDocument {
  id: string
  accountId: string
  documentName: string
  documentType: 'contract' | 'proposal' | 'presentation' | 'manual' | 'report' | 'invoice'
  documentCategory: 'sales' | 'legal' | 'technical' | 'financial' | 'marketing'
  fileUrl: string
  fileType: string
  fileSize: number
  documentVersion: string
  isLatestVersion: boolean
  isSharedWithCustomer: boolean
  customerAccessLevel: 'view' | 'download' | 'comment'
  viewCount: number
  downloadCount: number
  lastAccessed?: string
  aiDocumentSummary?: string
  aiKeyTopics: string[]
  aiImportanceScore: number
  createdBy: string
  createdAt: string
}

interface EmailThread {
  id: string
  accountId: string
  subject: string
  participants: string[]
  messageCount: number
  lastMessageDate: string
  isRead: boolean
  importance: 'high' | 'medium' | 'low'
  tags: string[]
  messages: EmailMessage[]
}

interface EmailMessage {
  id: string
  threadId: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  htmlBody?: string
  sentDate: string
  isRead: boolean
  hasAttachments: boolean
  attachments: EmailAttachment[]
  aiSentiment?: number
  aiExtractedTasks?: string[]
  aiSummary?: string
}

interface EmailAttachment {
  id: string
  filename: string
  fileType: string
  fileSize: number
  downloadUrl: string
}

interface Meeting {
  id: string
  accountId: string
  title: string
  description: string
  startDate: string
  endDate: string
  duration: number
  meetingType: 'in-person' | 'video' | 'phone'
  location?: string
  meetingUrl?: string
  organizer: string
  attendees: MeetingAttendee[]
  agenda: string[]
  outcomes: string[]
  actionItems: ActionItem[]
  recordingUrl?: string
  transcriptUrl?: string
  meetingNotes: string
  aiMeetingSummary?: string
  aiKeyDecisions?: string[]
  aiNextSteps?: string[]
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  followUpRequired: boolean
}

interface MeetingAttendee {
  email: string
  name: string
  attended: boolean
  joinTime?: string
  leaveTime?: string
}

interface ActionItem {
  id: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: 'high' | 'medium' | 'low'
}

interface Quote {
  id: string
  accountId: string
  quoteNumber: string
  version: string
  title: string
  description: string
  totalAmount: number
  currency: string
  validUntil: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  sentDate?: string
  viewedDate?: string
  respondedDate?: string
  items: QuoteItem[]
  terms: string
  notes: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  rejectionReason?: string
  customerFeedback?: string
  aiWinProbability?: number
  aiCompetitorAnalysis?: string[]
  previousVersions: string[]
  parentQuoteId?: string
}

interface QuoteItem {
  id: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

interface Deal {
  id: string
  accountId: string
  dealName: string
  description: string
  value: number
  currency: string
  stage: string
  probability: number
  expectedCloseDate: string
  actualCloseDate?: string
  dealSource: string
  salesRep: string
  stageHistory: DealStageHistory[]
  competitors: string[]
  nextSteps: string[]
  keyStakeholders: string[]
  status: 'open' | 'won' | 'lost' | 'on-hold'
  lossReason?: string
  winReason?: string
  aiInsights?: string[]
}

interface DealStageHistory {
  stage: string
  enteredDate: string
  exitDate?: string
  duration?: number
  notes: string
}

interface SupportTicket {
  id: string
  accountId: string
  ticketNumber: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated'
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'bug'
  assignedTo: string
  reporter: string
  createdDate: string
  resolvedDate?: string
  firstResponseTime?: number
  resolutionTime?: number
  escalationLevel: number
  satisfactionRating?: number
  resolution: string
  internalNotes: string[]
  customerCommunications: TicketCommunication[]
}

interface TicketCommunication {
  id: string
  from: string
  to: string
  message: string
  timestamp: string
  isInternal: boolean
  attachments: string[]
}

interface Transaction {
  id: string
  accountId: string
  type: 'payment' | 'refund' | 'credit' | 'debit' | 'adjustment'
  amount: number
  currency: string
  description: string
  referenceNumber: string
  invoiceId?: string
  paymentMethod: 'credit-card' | 'bank-transfer' | 'check' | 'cash' | 'other'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transactionDate: string
  dueDate?: string
  paidDate?: string
  fees: number
  taxes: number
  notes: string
  relatedDocuments: string[]
}

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

function EnhancedAccountManagement({ companyId, userId, userRole }: EnhancedAccountManagementProps) {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, [])
  const [timeline, setTimeline] = useKV<TimelineEntry[]>(`account-timeline-${companyId}`, [])
  const [metrics, setMetrics] = useKV<CustomerSuccessMetric[]>(`customer-metrics-${companyId}`, [])
  const [documents, setDocuments] = useKV<AccountDocument[]>(`account-documents-${companyId}`, [])
  const [emailThreads, setEmailThreads] = useKV<EmailThread[]>(`email-threads-${companyId}`, [])
  const [meetings, setMeetings] = useKV<Meeting[]>(`meetings-${companyId}`, [])
  const [quotes, setQuotes] = useKV<Quote[]>(`quotes-${companyId}`, [])
  const [deals, setDeals] = useKV<Deal[]>(`deals-${companyId}`, [])
  const [supportTickets, setSupportTickets] = useKV<SupportTicket[]>(`support-tickets-${companyId}`, [])
  const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${companyId}`, [])
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterHealthScore, setFilterHealthScore] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [timelineSort, setTimelineSort] = useState<'asc' | 'desc'>('desc')
  const [selectedEmailThread, setSelectedEmailThread] = useState<EmailThread | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [emailViewMode, setEmailViewMode] = useState<'threads' | 'chronological'>('threads')

  // Initialize with sample data
  useEffect(() => {
    if (accounts.length === 0) {
      const sampleAccounts: Account[] = [
        {
          id: 'acc-001',
          accountNumber: 'ACC-2024-001',
          companyName: 'TechCorp Solutions',
          industry: 'Technology',
          website: 'https://techcorp.example.com',
          phone: '+1 (555) 123-4567',
          email: 'contact@techcorp.example.com',
          address: {
            street: '123 Innovation Drive',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'United States'
          },
          accountOwner: 'John Smith',
          accountType: 'customer',
          accountStatus: 'active',
          companySize: '501-1000',
          annualRevenue: 25000000,
          employees: 750,
          founded: '2015',
          description: 'Leading provider of enterprise software solutions with focus on AI and automation.',
          tags: ['enterprise', 'ai', 'high-value'],
          customFields: {},
          totalEmailCount: 147,
          totalMeetingCount: 23,
          totalCallCount: 45,
          totalQuoteCount: 8,
          totalDealCount: 12,
          totalSupportTickets: 7,
          totalDocumentsShared: 34,
          lastEmailDate: '2024-01-15T14:30:00Z',
          lastMeetingDate: '2024-01-14T10:00:00Z',
          lastCallDate: '2024-01-13T16:45:00Z',
          lastQuoteDate: '2024-01-10T09:15:00Z',
          aiEngagementTrend: 'increasing',
          aiSatisfactionTrend: 'improving',
          aiExpansionReadiness: 85,
          aiRetentionProbability: 0.92,
          aiAdvocacyPotential: 78,
          healthScore: 87,
          engagementScore: 82,
          npsScore: 65,
          csatScore: 4.3,
          churnRisk: 'low',
          createdAt: '2023-06-15T08:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'acc-002',
          accountNumber: 'ACC-2024-002',
          companyName: 'Global Manufacturing Inc',
          industry: 'Manufacturing',
          website: 'https://globalmfg.example.com',
          phone: '+1 (555) 987-6543',
          email: 'info@globalmfg.example.com',
          address: {
            street: '456 Industrial Blvd',
            city: 'Detroit',
            state: 'MI',
            postalCode: '48201',
            country: 'United States'
          },
          accountOwner: 'Sarah Johnson',
          accountType: 'prospect',
          accountStatus: 'active',
          companySize: '1001-5000',
          annualRevenue: 150000000,
          employees: 2300,
          founded: '1987',
          description: 'Traditional manufacturing company exploring digital transformation opportunities.',
          tags: ['manufacturing', 'digital-transformation', 'large-enterprise'],
          customFields: {},
          totalEmailCount: 67,
          totalMeetingCount: 12,
          totalCallCount: 28,
          totalQuoteCount: 3,
          totalDealCount: 2,
          totalSupportTickets: 2,
          totalDocumentsShared: 18,
          lastEmailDate: '2024-01-14T11:20:00Z',
          lastMeetingDate: '2024-01-12T14:00:00Z',
          lastCallDate: '2024-01-11T09:30:00Z',
          lastQuoteDate: '2024-01-08T15:45:00Z',
          aiEngagementTrend: 'stable',
          aiSatisfactionTrend: 'stable',
          aiExpansionReadiness: 62,
          aiRetentionProbability: 0.78,
          aiAdvocacyPotential: 45,
          healthScore: 72,
          engagementScore: 68,
          npsScore: 32,
          csatScore: 3.8,
          churnRisk: 'medium',
          createdAt: '2023-09-20T10:00:00Z',
          updatedAt: '2024-01-14T11:20:00Z'
        }
      ]
      setAccounts(sampleAccounts)

      // Sample email threads
      const sampleEmailThreads: EmailThread[] = [
        {
          id: 'thread-001',
          accountId: 'acc-001',
          subject: 'Product Demo Follow-up & Pricing Discussion',
          participants: ['john.smith@company.com', 'cto@techcorp.example.com', 'ceo@techcorp.example.com'],
          messageCount: 8,
          lastMessageDate: '2024-01-15T14:30:00Z',
          isRead: false,
          importance: 'high',
          tags: ['pricing', 'demo', 'decision-maker'],
          messages: [
            {
              id: 'msg-001',
              threadId: 'thread-001',
              from: 'john.smith@company.com',
              to: ['cto@techcorp.example.com'],
              cc: ['ceo@techcorp.example.com'],
              subject: 'Re: Product Demo Follow-up & Pricing Discussion',
              body: 'Thank you for the demo yesterday. The technical team was very impressed with the AI capabilities. We would like to discuss pricing for a pilot program with 100 users.',
              sentDate: '2024-01-15T14:30:00Z',
              isRead: false,
              hasAttachments: true,
              attachments: [
                {
                  id: 'att-001',
                  filename: 'pilot-requirements.pdf',
                  fileType: 'pdf',
                  fileSize: 245760,
                  downloadUrl: '/downloads/pilot-requirements.pdf'
                }
              ],
              aiSentiment: 0.8,
              aiExtractedTasks: ['Prepare pilot program pricing', 'Schedule technical integration call'],
              aiSummary: 'Positive response to demo, ready to discuss pilot program pricing for 100 users'
            }
          ]
        }
      ]
      setEmailThreads(sampleEmailThreads)

      // Sample meetings
      const sampleMeetings: Meeting[] = [
        {
          id: 'meeting-001',
          accountId: 'acc-001',
          title: 'Product Demonstration & Technical Deep Dive',
          description: 'Comprehensive product demonstration for technical team and key decision makers',
          startDate: '2024-01-14T10:00:00Z',
          endDate: '2024-01-14T11:30:00Z',
          duration: 90,
          meetingType: 'video',
          meetingUrl: 'https://zoom.us/j/123456789',
          organizer: 'john.smith@company.com',
          attendees: [
            { email: 'cto@techcorp.example.com', name: 'Michael Chen', attended: true, joinTime: '2024-01-14T10:02:00Z', leaveTime: '2024-01-14T11:28:00Z' },
            { email: 'ceo@techcorp.example.com', name: 'Sarah Williams', attended: true, joinTime: '2024-01-14T10:15:00Z', leaveTime: '2024-01-14T11:30:00Z' },
            { email: 'dev-lead@techcorp.example.com', name: 'Alex Rodriguez', attended: true, joinTime: '2024-01-14T10:00:00Z', leaveTime: '2024-01-14T11:30:00Z' }
          ],
          agenda: [
            'Product overview and key features',
            'AI capabilities demonstration',
            'Technical architecture discussion',
            'Integration requirements',
            'Q&A session'
          ],
          outcomes: [
            'Strong interest in AI capabilities',
            'Technical feasibility confirmed',
            'Request for pilot program',
            'Budget approved for Q1 implementation'
          ],
          actionItems: [
            {
              id: 'action-001',
              description: 'Prepare detailed technical integration document',
              assignedTo: 'john.smith@company.com',
              dueDate: '2024-01-17T17:00:00Z',
              status: 'in-progress',
              priority: 'high'
            },
            {
              id: 'action-002',
              description: 'Schedule follow-up call with procurement team',
              assignedTo: 'sales@company.com',
              dueDate: '2024-01-16T12:00:00Z',
              status: 'completed',
              priority: 'medium'
            }
          ],
          recordingUrl: 'https://storage.company.com/meetings/recording-001.mp4',
          transcriptUrl: 'https://storage.company.com/meetings/transcript-001.txt',
          meetingNotes: 'Excellent engagement from all attendees. Technical team showed strong interest in AI capabilities and confirmed technical feasibility. CEO expressed urgency for Q1 implementation.',
          aiMeetingSummary: 'Highly successful product demonstration with strong technical validation and executive buy-in. Clear path to pilot program identified.',
          aiKeyDecisions: ['Proceed with pilot program planning', 'Technical integration to begin in Q1', 'Budget allocation approved'],
          aiNextSteps: ['Prepare pilot program proposal', 'Technical integration planning', 'Contract negotiation'],
          status: 'completed',
          followUpRequired: true
        }
      ]
      setMeetings(sampleMeetings)

      // Sample quotes
      const sampleQuotes: Quote[] = [
        {
          id: 'quote-001',
          accountId: 'acc-001',
          quoteNumber: 'QUO-2024-001',
          version: '2.1',
          title: 'Enterprise AI Platform - Pilot Program',
          description: 'Comprehensive AI platform implementation for 100 users with full technical support',
          totalAmount: 125000,
          currency: 'USD',
          validUntil: '2024-02-15T23:59:59Z',
          status: 'sent',
          sentDate: '2024-01-10T09:15:00Z',
          viewedDate: '2024-01-11T14:22:00Z',
          items: [
            {
              id: 'item-001',
              productName: 'AI Platform License (100 users)',
              description: 'Enterprise AI platform with advanced analytics',
              quantity: 100,
              unitPrice: 500,
              discount: 10,
              totalPrice: 45000
            },
            {
              id: 'item-002',
              productName: 'Professional Services',
              description: 'Implementation and training services',
              quantity: 1,
              unitPrice: 50000,
              discount: 0,
              totalPrice: 50000
            },
            {
              id: 'item-003',
              productName: 'Premium Support (1 year)',
              description: '24/7 technical support and maintenance',
              quantity: 1,
              unitPrice: 30000,
              discount: 0,
              totalPrice: 30000
            }
          ],
          terms: 'Net 30 payment terms. Implementation begins within 2 weeks of contract signing.',
          notes: 'Pricing valid for pilot program only. Production pricing available upon request.',
          approvalStatus: 'approved',
          approvedBy: 'sales-manager@company.com',
          aiWinProbability: 78,
          aiCompetitorAnalysis: ['Strong technical differentiation vs competitors', 'Pricing competitive for value provided'],
          previousVersions: ['QUO-2024-001-v1.0', 'QUO-2024-001-v2.0'],
          parentQuoteId: undefined
        }
      ]
      setQuotes(sampleQuotes)

      // Sample deals
      const sampleDeals: Deal[] = [
        {
          id: 'deal-001',
          accountId: 'acc-001',
          dealName: 'TechCorp AI Platform Implementation',
          description: 'Enterprise AI platform pilot program leading to full deployment',
          value: 125000,
          currency: 'USD',
          stage: 'Proposal Sent',
          probability: 75,
          expectedCloseDate: '2024-02-28T23:59:59Z',
          dealSource: 'Inbound Marketing',
          salesRep: 'john.smith@company.com',
          stageHistory: [
            {
              stage: 'Lead',
              enteredDate: '2023-12-01T10:00:00Z',
              exitDate: '2023-12-15T16:00:00Z',
              duration: 14,
              notes: 'Initial inquiry about AI capabilities'
            },
            {
              stage: 'Qualified',
              enteredDate: '2023-12-15T16:00:00Z',
              exitDate: '2024-01-05T14:00:00Z',
              duration: 21,
              notes: 'Budget and timeline confirmed'
            },
            {
              stage: 'Demo Scheduled',
              enteredDate: '2024-01-05T14:00:00Z',
              exitDate: '2024-01-14T11:30:00Z',
              duration: 9,
              notes: 'Product demonstration scheduled and completed'
            },
            {
              stage: 'Proposal Sent',
              enteredDate: '2024-01-14T11:30:00Z',
              notes: 'Proposal and quote sent following successful demo'
            }
          ],
          competitors: ['CompetitorA AI', 'Enterprise Solutions Inc'],
          nextSteps: ['Follow up on proposal', 'Address technical questions', 'Schedule contract discussion'],
          keyStakeholders: ['Michael Chen (CTO)', 'Sarah Williams (CEO)', 'Alex Rodriguez (Dev Lead)'],
          status: 'open',
          aiInsights: ['High engagement from technical team', 'CEO showing urgency for Q1 implementation', 'Budget pre-approved']
        }
      ]
      setDeals(sampleDeals)

      // Sample support tickets
      const sampleTickets: SupportTicket[] = [
        {
          id: 'ticket-001',
          accountId: 'acc-001',
          ticketNumber: 'SUP-2024-001',
          subject: 'API Integration Authentication Issues',
          description: 'Experiencing intermittent authentication failures when making API calls during peak hours',
          priority: 'high',
          status: 'resolved',
          category: 'technical',
          assignedTo: 'support@company.com',
          reporter: 'alex.rodriguez@techcorp.example.com',
          createdDate: '2024-01-12T09:30:00Z',
          resolvedDate: '2024-01-13T14:45:00Z',
          firstResponseTime: 45,
          resolutionTime: 1755,
          escalationLevel: 1,
          satisfactionRating: 4.8,
          resolution: 'Identified and resolved rate limiting issue in authentication service. Implemented additional monitoring.',
          internalNotes: ['Initial investigation showed high API volume', 'Rate limiting configuration updated', 'Monitoring alerts configured'],
          customerCommunications: [
            {
              id: 'comm-001',
              from: 'support@company.com',
              to: 'alex.rodriguez@techcorp.example.com',
              message: 'Thank you for reporting this issue. We are investigating the authentication failures and will update you within 2 hours.',
              timestamp: '2024-01-12T10:15:00Z',
              isInternal: false,
              attachments: []
            }
          ]
        }
      ]
      setSupportTickets(sampleTickets)

      // Sample transactions
      const sampleTransactions: Transaction[] = [
        {
          id: 'trans-001',
          accountId: 'acc-001',
          type: 'payment',
          amount: 62500,
          currency: 'USD',
          description: 'Q4 2023 Subscription Payment',
          referenceNumber: 'PAY-2023-Q4-001',
          invoiceId: 'INV-2023-012',
          paymentMethod: 'bank-transfer',
          status: 'completed',
          transactionDate: '2024-01-05T10:30:00Z',
          dueDate: '2024-01-15T23:59:59Z',
          paidDate: '2024-01-05T10:30:00Z',
          fees: 25,
          taxes: 6250,
          notes: 'Quarterly subscription payment received on time',
          relatedDocuments: ['invoice-2023-012.pdf', 'payment-confirmation.pdf']
        }
      ]
      setTransactions(sampleTransactions)

      // Sample documents
      const sampleDocuments: AccountDocument[] = [
        {
          id: 'doc-001',
          accountId: 'acc-001',
          documentName: 'Enterprise AI Platform Contract',
          documentType: 'contract',
          documentCategory: 'legal',
          fileUrl: '/documents/contract-001.pdf',
          fileType: 'pdf',
          fileSize: 2048576,
          documentVersion: '2.1',
          isLatestVersion: true,
          isSharedWithCustomer: true,
          customerAccessLevel: 'view',
          viewCount: 15,
          downloadCount: 8,
          lastAccessed: '2024-01-14T16:30:00Z',
          aiDocumentSummary: 'Enterprise software license agreement with 2-year term, auto-renewal clause, and standard SLA provisions.',
          aiKeyTopics: ['license terms', 'SLA', 'payment terms', 'intellectual property'],
          aiImportanceScore: 95,
          createdBy: 'legal@company.com',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: 'doc-002',
          accountId: 'acc-001',
          documentName: 'Product Demonstration Recording',
          documentType: 'presentation',
          documentCategory: 'sales',
          fileUrl: '/documents/demo-recording-001.mp4',
          fileType: 'mp4',
          fileSize: 157286400,
          documentVersion: '1.0',
          isLatestVersion: true,
          isSharedWithCustomer: true,
          customerAccessLevel: 'view',
          viewCount: 12,
          downloadCount: 3,
          lastAccessed: '2024-01-15T09:15:00Z',
          aiDocumentSummary: 'Comprehensive product demonstration highlighting AI capabilities and technical architecture.',
          aiKeyTopics: ['AI features', 'technical demo', 'integration options', 'ROI analysis'],
          aiImportanceScore: 85,
          createdBy: 'sales@company.com',
          createdAt: '2024-01-14T11:30:00Z'
        },
        {
          id: 'doc-003',
          accountId: 'acc-001',
          documentName: 'Technical Integration Guide',
          documentType: 'manual',
          documentCategory: 'technical',
          fileUrl: '/documents/integration-guide-001.pdf',
          fileType: 'pdf',
          fileSize: 5242880,
          documentVersion: '3.2',
          isLatestVersion: true,
          isSharedWithCustomer: true,
          customerAccessLevel: 'download',
          viewCount: 28,
          downloadCount: 15,
          lastAccessed: '2024-01-13T14:45:00Z',
          aiDocumentSummary: 'Step-by-step technical integration guide with API documentation and best practices.',
          aiKeyTopics: ['API integration', 'authentication', 'data formats', 'error handling'],
          aiImportanceScore: 90,
          createdBy: 'tech-docs@company.com',
          createdAt: '2024-01-08T09:00:00Z'
        }
      ]
      setDocuments(sampleDocuments)

      // Sample timeline data with more comprehensive entries
      const sampleTimeline: TimelineEntry[] = [
        {
          id: 'timeline-001',
          accountId: 'acc-001',
          timelineType: 'email',
          timelineSubtype: 'email_sent',
          title: 'Product Demo Follow-up',
          description: 'Sent follow-up email after product demonstration with pricing information.',
          summary: 'Positive response regarding pricing. Ready to move forward with pilot program.',
          relatedContactId: 'contact-001',
          timelineDate: '2024-01-15T14:30:00Z',
          participants: ['john.smith@company.com', 'cto@techcorp.example.com'],
          attachments: ['pricing-sheet.pdf', 'pilot-proposal.docx'],
          aiImportanceScore: 85,
          aiSentimentScore: 0.7,
          aiImpactOnRelationship: 0.8,
          aiExtractedInsights: ['Strong buying signals', 'Budget approved', 'Timeline: Q1 2024'],
          isPublic: true,
          isPinned: false,
          viewCount: 3,
          createdBy: userId,
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'timeline-002',
          accountId: 'acc-001',
          timelineType: 'meeting',
          timelineSubtype: 'product_demo',
          title: 'Product Demonstration',
          description: 'Live product demonstration for technical team and decision makers.',
          summary: 'Very positive reception. Technical team impressed with AI capabilities.',
          relatedContactId: 'contact-001',
          timelineDate: '2024-01-14T10:00:00Z',
          durationMinutes: 90,
          participants: ['john.smith@company.com', 'cto@techcorp.example.com', 'ceo@techcorp.example.com'],
          attachments: ['demo-recording.mp4', 'technical-specs.pdf'],
          aiImportanceScore: 95,
          aiSentimentScore: 0.9,
          aiImpactOnRelationship: 0.85,
          aiExtractedInsights: ['Strong technical fit', 'CEO engagement high', 'Request for pilot program'],
          isPublic: true,
          isPinned: true,
          viewCount: 7,
          createdBy: userId,
          createdAt: '2024-01-14T10:00:00Z'
        },
        {
          id: 'timeline-003',
          accountId: 'acc-001',
          timelineType: 'quote',
          timelineSubtype: 'quote_sent',
          title: 'Pilot Program Quote Sent',
          description: 'Comprehensive quote for AI platform pilot program sent to client.',
          summary: 'Quote viewed within 24 hours. Positive initial feedback received.',
          relatedQuoteId: 'quote-001',
          timelineDate: '2024-01-10T09:15:00Z',
          participants: ['john.smith@company.com', 'cto@techcorp.example.com'],
          attachments: ['quote-QUO-2024-001.pdf'],
          aiImportanceScore: 90,
          aiSentimentScore: 0.6,
          aiImpactOnRelationship: 0.7,
          aiExtractedInsights: ['Quick quote review', 'Pricing within budget', 'Technical requirements met'],
          isPublic: true,
          isPinned: false,
          viewCount: 5,
          createdBy: userId,
          createdAt: '2024-01-10T09:15:00Z'
        }
      ]
      setTimeline(sampleTimeline)
    }
  }, [accounts.length, setAccounts, setTimeline, setEmailThreads, setMeetings, setQuotes, setDeals, setSupportTickets, setTransactions, userId])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.accountOwner.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || account.accountStatus === filterStatus
    
    const matchesHealth = filterHealthScore === 'all' || 
      (filterHealthScore === 'high' && account.healthScore >= 80) ||
      (filterHealthScore === 'medium' && account.healthScore >= 60 && account.healthScore < 80) ||
      (filterHealthScore === 'low' && account.healthScore < 60)
    
    return matchesSearch && matchesStatus && matchesHealth
  })

  const getAccountTimeline = (accountId: string) => {
    return timeline
      .filter(entry => entry.accountId === accountId)
      .filter(entry => timelineFilter === 'all' || entry.timelineType === timelineFilter)
      .sort((a, b) => {
        const dateA = new Date(a.timelineDate).getTime()
        const dateB = new Date(b.timelineDate).getTime()
        return timelineSort === 'desc' ? dateB - dateA : dateA - dateB
      })
  }

  const getAccountEmailThreads = (accountId: string) => {
    return emailThreads.filter(thread => thread.accountId === accountId)
  }

  const getAccountMeetings = (accountId: string) => {
    return meetings.filter(meeting => meeting.accountId === accountId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  const getAccountQuotes = (accountId: string) => {
    return quotes.filter(quote => quote.accountId === accountId)
      .sort((a, b) => new Date(b.sentDate || b.createdAt || '').getTime() - new Date(a.sentDate || a.createdAt || '').getTime())
  }

  const getAccountDeals = (accountId: string) => {
    return deals.filter(deal => deal.accountId === accountId)
      .sort((a, b) => new Date(b.expectedCloseDate).getTime() - new Date(a.expectedCloseDate).getTime())
  }

  const getAccountSupportTickets = (accountId: string) => {
    return supportTickets.filter(ticket => ticket.accountId === accountId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
  }

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(transaction => transaction.accountId === accountId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
  }

  const getAccountDocuments = (accountId: string) => {
    return documents.filter(doc => doc.accountId === accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <TrendUp className="w-4 h-4 text-green-600" />
      case 'decreasing':
      case 'declining':
        return <TrendDown className="w-4 h-4 text-red-600" />
      case 'critical':
        return <Warning className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'meeting': return <Video className="w-4 h-4" />
      case 'quote': return <FileText className="w-4 h-4" />
      case 'deal': return <Handshake className="w-4 h-4" />
      case 'support': return <MessageCircle className="w-4 h-4" />
      case 'payment': return <DollarSign className="w-4 h-4" />
      case 'document': return <Download className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getFileIcon = (fileType: string) => {
    const lowerType = fileType.toLowerCase()
    if (lowerType.includes('pdf')) return <FilePdf className="w-4 h-4 text-red-600" />
    if (lowerType.includes('doc') || lowerType.includes('docx')) return <FileDoc className="w-4 h-4 text-blue-600" />
    if (lowerType.includes('xls') || lowerType.includes('xlsx')) return <FileXls className="w-4 h-4 text-green-600" />
    if (lowerType.includes('video') || lowerType.includes('mp4')) return <PlayCircle className="w-4 h-4 text-purple-600" />
    if (lowerType.includes('audio') || lowerType.includes('mp3')) return <SpeakerHigh className="w-4 h-4 text-orange-600" />
    return <FileText className="w-4 h-4 text-gray-600" />
  }

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'sent': return 'text-blue-600 bg-blue-100'
      case 'viewed': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDealStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      'Lead': 'text-gray-600 bg-gray-100',
      'Qualified': 'text-blue-600 bg-blue-100',
      'Demo Scheduled': 'text-purple-600 bg-purple-100',
      'Proposal Sent': 'text-yellow-600 bg-yellow-100',
      'Negotiation': 'text-orange-600 bg-orange-100',
      'Closed Won': 'text-green-600 bg-green-100',
      'Closed Lost': 'text-red-600 bg-red-100'
    }
    return stageColors[stage] || 'text-gray-600 bg-gray-100'
  }

  const getSupportPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    setActiveTab('overview')
    toast.success(`Opened ${account.companyName}`)
  }

  const handleTimelineEntryClick = (entry: TimelineEntry) => {
    // Update view count
    setTimeline(current => 
      current.map(item => 
        item.id === entry.id 
          ? { ...item, viewCount: item.viewCount + 1, lastViewed: new Date().toISOString() }
          : item
      )
    )
    toast.info(`Viewing: ${entry.title}`)
  }

  const renderAccountCard = (account: Account) => (
    <Card 
      key={account.id} 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20"
      onClick={() => handleAccountClick(account)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${account.companyName}`} />
              <AvatarFallback>{account.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg clickable-data" data-type="company-name">
                {account.companyName}
              </h3>
              <p className="text-sm text-muted-foreground">{account.industry}</p>
              <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={
              account.accountStatus === 'active' ? 'default' :
              account.accountStatus === 'pending' ? 'secondary' :
              account.accountStatus === 'suspended' ? 'destructive' : 'outline'
            }>
              {account.accountStatus}
            </Badge>
            {getHealthScoreBadge(account.healthScore)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="clickable-data cursor-pointer hover:text-primary" data-type="phone">
                {account.phone}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="clickable-data cursor-pointer hover:text-primary" data-type="email">
                {account.email}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="clickable-data cursor-pointer hover:text-primary" data-type="address">
                {account.address.city}, {account.address.state}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{account.employees.toLocaleString()} employees</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="clickable-data cursor-pointer hover:text-primary" data-type="revenue">
                ${(account.annualRevenue / 1000000).toFixed(1)}M revenue
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Building className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{account.accountType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {account.totalEmailCount}
            </span>
            <span className="flex items-center">
              <Video className="w-3 h-3 mr-1" />
              {account.totalMeetingCount}
            </span>
            <span className="flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              {account.totalQuoteCount}
            </span>
            <span className="flex items-center">
              <Handshake className="w-3 h-3 mr-1" />
              {account.totalDealCount}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getHealthScoreColor(account.healthScore)}`}>
              {account.healthScore}% Health
            </span>
            {getTrendIcon(account.aiEngagementTrend)}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {account.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs clickable-data cursor-pointer hover:bg-primary/10" 
              data-type="tag"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderAccountDetails = () => {
    if (!selectedAccount) return null

    const accountTimeline = getAccountTimeline(selectedAccount.id)
    const recentMetrics = metrics.filter(m => m.accountId === selectedAccount.id).slice(0, 5)
    const accountDocuments = documents.filter(d => d.accountId === selectedAccount.id)

    return (
      <div className="space-y-6">
        {/* Account Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedAccount.companyName}`} />
                  <AvatarFallback>{selectedAccount.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{selectedAccount.companyName}</CardTitle>
                  <CardDescription className="text-lg">{selectedAccount.industry}</CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">{selectedAccount.accountNumber}</Badge>
                    <Badge variant={
                      selectedAccount.accountStatus === 'active' ? 'default' :
                      selectedAccount.accountStatus === 'pending' ? 'secondary' :
                      selectedAccount.accountStatus === 'suspended' ? 'destructive' : 'outline'
                    }>
                      {selectedAccount.accountStatus}
                    </Badge>
                    <Badge>{selectedAccount.accountType}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-muted-foreground">Health Score:</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                    {selectedAccount.healthScore}%
                  </span>
                  {getTrendIcon(selectedAccount.aiEngagementTrend)}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="emails">Email History</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="deals">Deals & Quotes</TabsTrigger>
            <TabsTrigger value="support">Support Journey</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="clickable-data cursor-pointer hover:text-primary" data-type="website">
                        {selectedAccount.website}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Founded</label>
                      <p>{selectedAccount.founded}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                      <p>{selectedAccount.companySize}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Annual Revenue</label>
                      <p className="clickable-data cursor-pointer hover:text-primary" data-type="revenue">
                        ${selectedAccount.annualRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="clickable-data cursor-pointer hover:text-primary" data-type="address">
                      {selectedAccount.address.street}<br />
                      {selectedAccount.address.city}, {selectedAccount.address.state} {selectedAccount.address.postalCode}<br />
                      {selectedAccount.address.country}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{selectedAccount.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Engagement Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Emails</span>
                      <span className="font-medium">{selectedAccount.totalEmailCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Meetings</span>
                      <span className="font-medium">{selectedAccount.totalMeetingCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Calls</span>
                      <span className="font-medium">{selectedAccount.totalCallCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quotes</span>
                      <span className="font-medium">{selectedAccount.totalQuoteCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Deals</span>
                      <span className="font-medium">{selectedAccount.totalDealCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expansion Readiness</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedAccount.aiExpansionReadiness}%</span>
                        <Target className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Retention Probability</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{Math.round(selectedAccount.aiRetentionProbability * 100)}%</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Advocacy Potential</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedAccount.aiAdvocacyPotential}%</span>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Churn Risk</span>
                      <Badge variant={
                        selectedAccount.churnRisk === 'low' ? 'default' :
                        selectedAccount.churnRisk === 'medium' ? 'secondary' :
                        'destructive'
                      }>
                        {selectedAccount.churnRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Unified Activity Timeline</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setTimelineSort(timelineSort === 'desc' ? 'asc' : 'desc')}
                >
                  {timelineSort === 'desc' ? <SortDescending className="w-4 h-4 mr-2" /> : <SortAscending className="w-4 h-4 mr-2" />}
                  Sort {timelineSort === 'desc' ? 'Newest' : 'Oldest'}
                </Button>
                <select 
                  value={timelineFilter} 
                  onChange={(e) => setTimelineFilter(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Activities</option>
                  <option value="email">Emails</option>
                  <option value="meeting">Meetings</option>
                  <option value="call">Calls</option>
                  <option value="quote">Quotes</option>
                  <option value="deal">Deals</option>
                  <option value="support">Support</option>
                  <option value="payment">Payments</option>
                  <option value="document">Documents</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {accountTimeline.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleTimelineEntryClick(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getTimelineIcon(entry.timelineType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm clickable-data" data-type="timeline-title">
                            {entry.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {entry.isPinned && <PushPin className="w-4 h-4 text-yellow-500" />}
                            <Badge variant="outline" className="text-xs">
                              {entry.timelineType}
                            </Badge>
                            <span className="text-xs text-muted-foreground clickable-data" data-type="date">
                              {new Date(entry.timelineDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        {entry.summary && (
                          <div className="mt-2 p-2 bg-muted/50 rounded">
                            <p className="text-sm font-medium">AI Summary:</p>
                            <p className="text-sm">{entry.summary}</p>
                          </div>
                        )}
                        {entry.aiExtractedInsights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.aiExtractedInsights.map((insight, index) => (
                              <Badge key={index} variant="secondary" className="text-xs clickable-data" data-type="ai-insight">
                                <Brain className="w-3 h-3 mr-1" />
                                {insight}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {entry.viewCount} views
                            </span>
                            {entry.durationMinutes && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {entry.durationMinutes}m
                              </span>
                            )}
                            <span>Importance: {entry.aiImportanceScore}/100</span>
                            <span>Sentiment: {entry.aiSentimentScore > 0 ? '+' : ''}{(entry.aiSentimentScore * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {entry.attachments.map((attachment, index) => (
                              <Badge key={index} variant="outline" className="text-xs clickable-data" data-type="attachment">
                                <Paperclip className="w-3 h-3 mr-1" />
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emails" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Email History</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={emailViewMode === 'threads' ? 'default' : 'outline'}
                  onClick={() => setEmailViewMode('threads')}
                >
                  <ChatCircle className="w-4 h-4 mr-2" />
                  Threads
                </Button>
                <Button
                  size="sm"
                  variant={emailViewMode === 'chronological' ? 'default' : 'outline'}
                  onClick={() => setEmailViewMode('chronological')}
                >
                  <List className="w-4 h-4 mr-2" />
                  Chronological
                </Button>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Compose
                </Button>
              </div>
            </div>

            {selectedEmailThread ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEmailThread(null)}
                  >
                    ← Back to {emailViewMode === 'threads' ? 'Threads' : 'Emails'}
                  </Button>
                  <h4 className="text-lg font-semibold">{selectedEmailThread.subject}</h4>
                </div>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{selectedEmailThread.subject}</CardTitle>
                        <CardDescription>
                          {selectedEmailThread.participants.join(', ')} • {selectedEmailThread.messageCount} messages
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          <PaperPlaneTilt className="w-4 h-4 mr-2" />
                          Forward
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmailThread.messages.map((message) => (
                      <div key={message.id} className="border-l-2 border-primary/20 pl-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium clickable-data" data-type="email-sender">{message.from}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              to {message.to.join(', ')}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground clickable-data" data-type="email-date">
                            {new Date(message.sentDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm bg-muted/30 p-3 rounded">
                          {message.body}
                        </div>
                        {message.aiSummary && (
                          <div className="text-sm bg-blue-50 p-2 rounded">
                            <span className="font-medium">AI Summary: </span>
                            {message.aiSummary}
                          </div>
                        )}
                        {message.hasAttachments && (
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {getAccountEmailThreads(selectedAccount.id).map((thread) => (
                  <Card 
                    key={thread.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => setSelectedEmailThread(thread)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <EnvelopeOpen className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-medium clickable-data" data-type="email-subject">
                              {thread.subject}
                            </h4>
                            {!thread.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {thread.participants.join(', ')}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{thread.messageCount} messages</span>
                            <span className="clickable-data" data-type="email-date">
                              Last: {new Date(thread.lastMessageDate).toLocaleDateString()}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                thread.importance === 'high' ? 'border-red-200 text-red-700' :
                                thread.importance === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {thread.importance} priority
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <CaretRight className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {thread.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs clickable-data" data-type="tag">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Meeting History</h3>
              <Button size="sm" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>

            {selectedMeeting ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMeeting(null)}
                  >
                    ← Back to Meetings
                  </Button>
                  <h4 className="text-lg font-semibold">{selectedMeeting.title}</h4>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{selectedMeeting.title}</CardTitle>
                    <CardDescription>
                      {new Date(selectedMeeting.startDate).toLocaleString()} • {selectedMeeting.duration} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Meeting Details</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="clickable-data" data-type="meeting-date">
                              {new Date(selectedMeeting.startDate).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedMeeting.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="capitalize">{selectedMeeting.meetingType}</span>
                          </div>
                          {selectedMeeting.meetingUrl && (
                            <div className="flex items-center">
                              <LinkSimple className="w-4 h-4 mr-2 text-muted-foreground" />
                              <a href={selectedMeeting.meetingUrl} className="text-primary clickable-data" data-type="meeting-link">
                                Join Meeting
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Attendees ({selectedMeeting.attendees.length})</h5>
                        <div className="space-y-2">
                          {selectedMeeting.attendees.map((attendee, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="clickable-data" data-type="attendee-name">{attendee.name}</span>
                              <Badge variant={attendee.attended ? 'default' : 'outline'}>
                                {attendee.attended ? 'Attended' : 'No Show'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="font-medium mb-2">Agenda</h5>
                      <ul className="space-y-1 text-sm">
                        {selectedMeeting.agenda.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Key Outcomes</h5>
                      <ul className="space-y-1 text-sm">
                        {selectedMeeting.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Action Items</h5>
                      <div className="space-y-2">
                        {selectedMeeting.actionItems.map((action) => (
                          <div key={action.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex-1">
                              <p className="text-sm">{action.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Assigned to: <span className="clickable-data" data-type="assignee">{action.assignedTo}</span> • 
                                Due: <span className="clickable-data" data-type="due-date">{new Date(action.dueDate).toLocaleDateString()}</span>
                              </p>
                            </div>
                            <Badge variant={
                              action.status === 'completed' ? 'default' :
                              action.status === 'overdue' ? 'destructive' :
                              action.status === 'in-progress' ? 'secondary' : 'outline'
                            }>
                              {action.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedMeeting.aiMeetingSummary && (
                      <div className="bg-blue-50 p-4 rounded">
                        <h5 className="font-medium mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Meeting Summary
                        </h5>
                        <p className="text-sm">{selectedMeeting.aiMeetingSummary}</p>
                      </div>
                    )}

                    {selectedMeeting.recordingUrl && (
                      <div className="flex items-center space-x-4">
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Play Recording
                        </Button>
                        {selectedMeeting.transcriptUrl && (
                          <Button size="sm" variant="outline">
                            <Subtitles className="w-4 h-4 mr-2" />
                            View Transcript
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {getAccountMeetings(selectedAccount.id).map((meeting) => (
                  <Card 
                    key={meeting.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-medium clickable-data" data-type="meeting-title">
                              {meeting.title}
                            </h4>
                            <Badge variant={
                              meeting.status === 'completed' ? 'default' :
                              meeting.status === 'scheduled' ? 'secondary' :
                              meeting.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {meeting.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span className="clickable-data" data-type="meeting-date">
                                {new Date(meeting.startDate).toLocaleDateString()}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {meeting.duration}m
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {meeting.attendees.length} attendees
                            </span>
                            {meeting.recordingUrl && (
                              <span className="flex items-center text-green-600">
                                <PlayCircle className="w-3 h-3 mr-1" />
                                Recorded
                              </span>
                            )}
                          </div>
                        </div>
                        <CaretRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Expansion Opportunity</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Account shows strong expansion signals. Recent increase in feature usage (+35%) 
                          and positive sentiment in communications suggest readiness for upsell.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">
                          Create Expansion Plan
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">High Retention Probability</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Strong engagement patterns and positive feedback indicate 92% retention probability. 
                          Consider requesting case study or referral.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">
                          Request Testimonial
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Follow-up Required</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          No contact in 5 days after product demo. Recommend follow-up email with 
                          pricing proposal by end of week.
                        </p>
                        <Button size="sm" className="mt-2" variant="outline">
                          Schedule Follow-up
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relationship Health Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">Engagement Trend</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(selectedAccount.aiEngagementTrend)}
                        <span className="text-sm font-medium capitalize">{selectedAccount.aiEngagementTrend}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">Satisfaction Trend</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(selectedAccount.aiSatisfactionTrend)}
                        <span className="text-sm font-medium capitalize">{selectedAccount.aiSatisfactionTrend}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">Overall Health Score</span>
                      <span className={`text-sm font-medium ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                        {selectedAccount.healthScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">NPS Score</span>
                      <span className="text-sm font-medium">
                        {selectedAccount.npsScore || 'Not Available'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Deals & Quote Evolution</h3>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Handshake className="w-4 h-4 mr-2" />
                  New Deal
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  New Quote
                </Button>
              </div>
            </div>

            <Tabs defaultValue="deals" className="space-y-4">
              <TabsList>
                <TabsTrigger value="deals">Active Deals</TabsTrigger>
                <TabsTrigger value="quotes">Quote History</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
              </TabsList>

              <TabsContent value="deals" className="space-y-4">
                {getAccountDeals(selectedAccount.id).map((deal) => (
                  <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg clickable-data" data-type="deal-name">
                            {deal.dealName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{deal.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold clickable-data" data-type="deal-value">
                            ${deal.value.toLocaleString()} {deal.currency}
                          </p>
                          <Badge className={getDealStageColor(deal.stage)}>
                            {deal.stage}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Probability</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{deal.probability}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Expected Close</span>
                          <p className="text-sm font-medium clickable-data" data-type="close-date">
                            {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Sales Rep</span>
                          <p className="text-sm font-medium clickable-data" data-type="sales-rep">
                            {deal.salesRep}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Source</span>
                          <p className="text-sm font-medium">{deal.dealSource}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Stage History:</span>
                          <div className="mt-1 space-y-1">
                            {deal.stageHistory.map((stage, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className={`px-2 py-1 rounded ${getDealStageColor(stage.stage)}`}>
                                  {stage.stage}
                                </span>
                                <span className="text-muted-foreground">
                                  {new Date(stage.enteredDate).toLocaleDateString()}
                                  {stage.duration && ` (${stage.duration} days)`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {deal.nextSteps.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Next Steps:</span>
                            <ul className="mt-1 space-y-1">
                              {deal.nextSteps.map((step, index) => (
                                <li key={index} className="text-sm flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {deal.aiInsights && deal.aiInsights.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">AI Insights:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {deal.aiInsights.map((insight, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Brain className="w-3 h-3 mr-1" />
                                  {insight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="quotes" className="space-y-4">
                {getAccountQuotes(selectedAccount.id).map((quote) => (
                  <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium clickable-data" data-type="quote-title">
                              {quote.title}
                            </h4>
                            <Badge variant="outline">{quote.quoteNumber}</Badge>
                            <Badge variant="outline">v{quote.version}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{quote.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold clickable-data" data-type="quote-amount">
                            ${quote.totalAmount.toLocaleString()} {quote.currency}
                          </p>
                          <Badge className={getQuoteStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Sent Date</span>
                          <p className="text-sm font-medium clickable-data" data-type="quote-sent-date">
                            {quote.sentDate ? new Date(quote.sentDate).toLocaleDateString() : 'Not sent'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Valid Until</span>
                          <p className="text-sm font-medium clickable-data" data-type="quote-valid-date">
                            {new Date(quote.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Win Probability</span>
                          <p className="text-sm font-medium">
                            {quote.aiWinProbability ? `${quote.aiWinProbability}%` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Items ({quote.items.length}):</span>
                          <div className="mt-1 space-y-1">
                            {quote.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="clickable-data" data-type="quote-item">
                                  {item.productName} (x{item.quantity})
                                </span>
                                <span className="font-medium clickable-data" data-type="item-price">
                                  ${item.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {quote.items.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{quote.items.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>

                        {quote.previousVersions.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Version History:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {quote.previousVersions.map((version, index) => (
                                <Badge key={index} variant="outline" className="text-xs clickable-data" data-type="quote-version">
                                  {version}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pipeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Pipeline Visualization</CardTitle>
                    <CardDescription>
                      Visual representation of deal progression through stages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Pipeline visualization will be implemented here with stage progression charts.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Support Journey</h3>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <div className="space-y-4">
              {getAccountSupportTickets(selectedAccount.id).map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium clickable-data" data-type="ticket-subject">
                            {ticket.subject}
                          </h4>
                          <Badge variant="outline">{ticket.ticketNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getSupportPriorityColor(ticket.priority)}>
                          {ticket.priority} priority
                        </Badge>
                        <Badge variant={
                          ticket.status === 'resolved' ? 'default' :
                          ticket.status === 'in-progress' ? 'secondary' :
                          ticket.status === 'escalated' ? 'destructive' : 'outline'
                        }>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Created</span>
                        <p className="text-sm font-medium clickable-data" data-type="ticket-created">
                          {new Date(ticket.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Response Time</span>
                        <p className="text-sm font-medium">
                          {ticket.firstResponseTime ? `${ticket.firstResponseTime}m` : 'Pending'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Assigned To</span>
                        <p className="text-sm font-medium clickable-data" data-type="ticket-assigned">
                          {ticket.assignedTo}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Satisfaction</span>
                        <p className="text-sm font-medium">
                          {ticket.satisfactionRating ? `${ticket.satisfactionRating}/5 ⭐` : 'Not rated'}
                        </p>
                      </div>
                    </div>

                    {ticket.status === 'resolved' && ticket.resolution && (
                      <div className="bg-green-50 p-3 rounded">
                        <span className="text-sm font-medium text-green-800">Resolution:</span>
                        <p className="text-sm text-green-700 mt-1">{ticket.resolution}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {ticket.customerCommunications.length} messages
                        </span>
                        {ticket.escalationLevel > 0 && (
                          <span className="flex items-center text-orange-600">
                            <Warning className="w-3 h-3 mr-1" />
                            Level {ticket.escalationLevel} escalation
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Financial Timeline</h3>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
                <Button size="sm" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${getAccountTransactions(selectedAccount.id)
                          .filter(t => t.type === 'payment' && t.status === 'completed')
                          .reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Payments</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${getAccountTransactions(selectedAccount.id)
                          .filter(t => t.type === 'payment' && t.status === 'pending')
                          .reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">
                        {getAccountTransactions(selectedAccount.id).length}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {getAccountTransactions(selectedAccount.id).map((transaction) => (
                <Card key={transaction.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium clickable-data" data-type="transaction-description">
                            {transaction.description}
                          </h4>
                          <Badge variant="outline">{transaction.referenceNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {transaction.type} via {transaction.paymentMethod.replace('-', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold clickable-data" data-type="transaction-amount">
                          ${transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                        <Badge className={getTransactionStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Transaction Date</span>
                        <p className="text-sm font-medium clickable-data" data-type="transaction-date">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Due Date</span>
                        <p className="text-sm font-medium clickable-data" data-type="due-date">
                          {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Fees</span>
                        <p className="text-sm font-medium clickable-data" data-type="transaction-fees">
                          ${transaction.fees.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Taxes</span>
                        <p className="text-sm font-medium clickable-data" data-type="transaction-taxes">
                          ${transaction.taxes.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {transaction.notes && (
                      <div className="mt-3 p-2 bg-muted/30 rounded">
                        <p className="text-sm">{transaction.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document Archive</h3>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <CloudArrowUp className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button size="sm" variant="outline">
                  <Folders className="w-4 h-4 mr-2" />
                  Organize
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAccountDocuments(selectedAccount.id).map((doc) => (
                <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm clickable-data truncate" data-type="document-name">
                          {doc.documentName}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {doc.documentType} • {doc.documentCategory}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            v{doc.documentVersion}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {doc.viewCount}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              {doc.downloadCount}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                          </span>
                          {doc.isSharedWithCustomer && (
                            <Badge variant="outline" className="text-xs">
                              <Share className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        {doc.aiDocumentSummary && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-700">{doc.aiDocumentSummary}</p>
                          </div>
                        )}
                        {doc.aiKeyTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.aiKeyTopics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs clickable-data" data-type="document-topic">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Customer Success Metrics</h3>
              <Button size="sm" variant="outline">
                <ChartBar className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Health Score</p>
                      <p className={`text-2xl font-bold ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                        {selectedAccount.healthScore}%
                      </p>
                    </div>
                    <Gauge className={`w-8 h-8 ${getHealthScoreColor(selectedAccount.healthScore)}`} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedAccount.engagementScore}%
                      </p>
                    </div>
                    <Pulse className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">NPS Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedAccount.npsScore || 'N/A'}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">CSAT Score</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedAccount.csatScore}/5
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Interactions</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted h-2 rounded-full">
                          <div className="w-3/4 bg-blue-500 h-2 rounded-full" />
                        </div>
                        <span className="text-sm font-medium">{selectedAccount.totalEmailCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meeting Participation</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted h-2 rounded-full">
                          <div className="w-4/5 bg-green-500 h-2 rounded-full" />
                        </div>
                        <span className="text-sm font-medium">{selectedAccount.totalMeetingCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Support Interactions</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted h-2 rounded-full">
                          <div className="w-1/4 bg-yellow-500 h-2 rounded-full" />
                        </div>
                        <span className="text-sm font-medium">{selectedAccount.totalSupportTickets}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Sharing</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted h-2 rounded-full">
                          <div className="w-3/5 bg-purple-500 h-2 rounded-full" />
                        </div>
                        <span className="text-sm font-medium">{selectedAccount.totalDocumentsShared}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Predictive Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Retention Probability</span>
                        <span className="text-green-700 font-bold">
                          {Math.round(selectedAccount.aiRetentionProbability * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-green-200 h-2 rounded-full">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedAccount.aiRetentionProbability * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Expansion Readiness</span>
                        <span className="text-blue-700 font-bold">
                          {selectedAccount.aiExpansionReadiness}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 h-2 rounded-full">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedAccount.aiExpansionReadiness}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Advocacy Potential</span>
                        <span className="text-yellow-700 font-bold">
                          {selectedAccount.aiAdvocacyPotential}%
                        </span>
                      </div>
                      <div className="w-full bg-yellow-200 h-2 rounded-full">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${selectedAccount.aiAdvocacyPotential}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-red-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Churn Risk</span>
                        <Badge variant={
                          selectedAccount.churnRisk === 'low' ? 'default' :
                          selectedAccount.churnRisk === 'medium' ? 'secondary' :
                          'destructive'
                        }>
                          {selectedAccount.churnRisk}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historical Trend Analysis</CardTitle>
                <CardDescription>
                  Track changes in customer success metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(selectedAccount.aiEngagementTrend)}
                    </div>
                    <p className="text-sm font-medium">Engagement</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedAccount.aiEngagementTrend}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(selectedAccount.aiSatisfactionTrend)}
                    </div>
                    <p className="text-sm font-medium">Satisfaction</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedAccount.aiSatisfactionTrend}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <TrendUpIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">Revenue Growth</p>
                    <p className="text-xs text-muted-foreground">+15% QoQ</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Product Adoption</p>
                    <p className="text-xs text-muted-foreground">78% features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Account Management</h2>
          <p className="text-muted-foreground">
            Complete 360-degree customer views with AI insights and historical tracking
          </p>
        </div>
        <Button onClick={() => setShowNewAccount(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {selectedAccount ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedAccount(null)}
            className="mb-4"
          >
            ← Back to Accounts
          </Button>
          {renderAccountDetails()}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search accounts by name, industry, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select 
                  value={filterHealthScore} 
                  onChange={(e) => setFilterHealthScore(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Health Scores</option>
                  <option value="high">High (80-100)</option>
                  <option value="medium">Medium (60-79)</option>
                  <option value="low">Low (0-59)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAccounts.map(renderAccountCard)}
          </div>

          {filteredAccounts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or create a new account.
                </p>
                <Button onClick={() => setShowNewAccount(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedAccountManagement