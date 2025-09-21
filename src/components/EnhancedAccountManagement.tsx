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
  Warning
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

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function EnhancedAccountManagement({ companyId, userId, userRole }: EnhancedAccountManagementProps) {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, [])
  const [timeline, setTimeline] = useKV<TimelineEntry[]>(`account-timeline-${companyId}`, [])
  const [metrics, setMetrics] = useKV<CustomerSuccessMetric[]>(`customer-metrics-${companyId}`, [])
  const [documents, setDocuments] = useKV<AccountDocument[]>(`account-documents-${companyId}`, [])
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterHealthScore, setFilterHealthScore] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [timelineFilter, setTimelineFilter] = useState<string>('all')
  const [showNewAccount, setShowNewAccount] = useState(false)

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

      // Sample timeline data
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
        }
      ]
      setTimeline(sampleTimeline)
    }
  }, [accounts.length, setAccounts, setTimeline, userId])

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
      .sort((a, b) => new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime())
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="deals">Deals & Quotes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
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
              <h3 className="text-lg font-semibold">Activity Timeline</h3>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
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
                          <h4 className="font-medium text-sm">{entry.title}</h4>
                          <div className="flex items-center space-x-2">
                            {entry.isPinned && <Star className="w-4 h-4 text-yellow-500" />}
                            <Badge variant="outline" className="text-xs">
                              {entry.timelineType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.timelineDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        {entry.summary && (
                          <p className="text-sm mt-2 p-2 bg-muted/50 rounded">{entry.summary}</p>
                        )}
                        {entry.aiExtractedInsights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.aiExtractedInsights.map((insight, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
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
                          </div>
                          <div className="flex items-center space-x-1">
                            {entry.attachments.map((attachment, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                📎 {attachment}
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

          {/* Placeholder tabs for other content */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  Manage all contacts associated with this account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contact management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Deals & Quotes</CardTitle>
                <CardDescription>
                  Track all deals and quotes for this account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Deals and quotes interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  All documents shared with this account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Customer Success Metrics</CardTitle>
                <CardDescription>
                  Track customer health and success indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customer success metrics dashboard will be implemented here.</p>
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