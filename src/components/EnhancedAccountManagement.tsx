import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EnhancedAccount, CustomerTimelineEntry, AccountEngagementAlert, CustomerSuccessMetrics } from '@/types/enhanced-accounts'
import CustomerUnifiedTimeline from '@/components/CustomerUnifiedTimeline'
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
  MagnifyingGlass as Search,
  Plus,
  PencilSimple as Edit,
  DotsThree as MoreHorizontal,
  ChartBar,
  Target,
  CheckCircle,
  XCircle,
  Warning as AlertTriangle,
  Brain,
  Lightbulb,
  Handshake,
  TrendDown,
  Warning,
  ArrowsClockwise,
  PlayCircle,
  Bell,
  ShareNetwork,
  Globe,
  Robot,
  Heart,
  Fire,
  Shield,
  Ticket,
  FileDoc,
  CircleDot,
  Fingerprint,
  Monitor,
  ChartLine,
  House,
  Envelope,
  ChatCircle,
  VideoCamera,
  TreeStructure,
  Network,
  LinkSimple
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

const EnhancedAccountManagement: React.FC<EnhancedAccountManagementProps> = ({
  companyId,
  userId,
  userRole
}) => {
  const [accounts, setAccounts] = useKV<EnhancedAccount[]>('enhanced-accounts-v3', [])
  const [selectedAccount, setSelectedAccount] = useState<EnhancedAccount | null>(null)
  const [activeTab, setActiveTab] = useState('executive')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [timelineData, setTimelineData] = useKV<CustomerTimelineEntry[]>('customer-timeline-v2', [])
  const [successMetrics, setSuccessMetrics] = useKV<CustomerSuccessMetrics[]>('success-metrics-v2', [])
  const [engagementAlerts, setEngagementAlerts] = useKV<AccountEngagementAlert[]>('engagement-alerts-v2', [])

  // Enhanced mock data with new AI features and fixed schema
  useEffect(() => {
    if (accounts.length === 0) {
      const mockAccounts: EnhancedAccount[] = [
        {
          id: 'acc-001',
          companyId,
          accountNumber: 'ACC-2024-001',
          companyName: 'Acme Corporation',
          industry: 'Technology',
          companySize: '201-1000',
          annualRevenue: 5000000,
          numberOfEmployees: 250,
          websiteUrl: 'https://acme.com',
          accountType: 'customer',
          accountStatus: 'active',
          priorityLevel: 'high',
          territory: 'West Coast',
          accountManagerId: userId,
          primaryAddress: {
            line1: '123 Tech Boulevard',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            postalCode: '94105'
          },
          phone: '+1 (555) 123-4567',
          
          // Complete Historical Tracking
          totalEmailCount: 124,
          totalMeetingCount: 18,
          totalCallCount: 32,
          totalQuoteCount: 8,
          totalDealCount: 12,
          totalSupportTickets: 3,
          totalDocumentsShared: 25,
          totalInvoices: 15,
          totalPayments: 14,
          
          // Real-time Engagement Metrics
          lastEmailDate: new Date('2024-01-14T11:30:00Z'),
          lastMeetingDate: new Date('2024-01-10T14:00:00Z'),
          lastCallDate: new Date('2024-01-12T16:20:00Z'),
          lastQuoteDate: new Date('2024-01-08T09:15:00Z'),
          lastDealDate: new Date('2024-01-05T15:45:00Z'),
          lastInteractionDate: new Date('2024-01-14T16:45:00Z'),
          
          // Financial Information
          totalRevenue: 750000,
          lifetimeValue: 850000,
          averageDealSize: 62500,
          paymentTerms: 'net_30',
          creditLimit: 100000,
          creditRating: 'AAA',
          
          // Enhanced AI Intelligence
          aiHealthScore: 92,
          aiEngagementTrend: 'increasing',
          aiSatisfactionTrend: 'stable',
          aiExpansionReadiness: 85,
          aiRetentionProbability: 0.92,
          aiAdvocacyPotential: 78,
          aiChurnRiskScore: 0.08,
          aiNextBestAction: 'Schedule expansion planning meeting',
          aiInsights: [
            {
              id: 'insight-1',
              type: 'opportunity',
              title: 'Expansion Ready',
              description: 'High engagement and satisfaction indicate readiness for additional services',
              confidence: 85,
              impact: 'high',
              actionRequired: true,
              dueDate: new Date('2024-01-25T00:00:00Z'),
              createdAt: new Date()
            }
          ],
          
          // Customer Portal Integration
          portalAccessEnabled: true,
          portalLastLogin: new Date('2024-01-14T09:15:00Z'),
          portalLoginCount: 47,
          portalFeaturesEnabled: ['documents', 'support', 'billing'],
          
          // Social Media
          socialMentionsCount: 12,
          socialSentimentScore: 0.78,
          lastSocialMention: new Date('2024-01-13T14:22:00Z'),
          socialProfiles: {
            linkedin: 'https://linkedin.com/company/acme-corp',
            twitter: '@acmecorp'
          },
          
          // Metadata
          customFields: {
            preferredContactMethod: 'email',
            timezone: 'PST',
            marketSegment: 'Enterprise'
          },
          tags: ['High Value', 'Strategic', 'Expansion Ready'],
          notes: 'Excellent relationship with strong growth potential. Considering AI solution upgrade.',
          metadata: {},
          
          // System Fields
          isDeleted: false,
          createdBy: userId,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z')
        },
        {
          id: 'acc-002',
          companyId,
          accountNumber: 'ACC-2024-002',
          companyName: 'TechFlow Solutions',
          industry: 'Software',
          companySize: '51-200',
          annualRevenue: 2500000,
          numberOfEmployees: 85,
          websiteUrl: 'https://techflow.com',
          accountType: 'prospect',
          accountStatus: 'active',
          priorityLevel: 'medium',
          territory: 'East Coast',
          accountManagerId: userId,
          primaryAddress: {
            line1: '456 Innovation Drive',
            city: 'Boston',
            state: 'MA',
            country: 'United States',
            postalCode: '02101'
          },
          phone: '+1 (555) 987-6543',
          
          // Complete Historical Tracking
          totalEmailCount: 45,
          totalMeetingCount: 6,
          totalCallCount: 12,
          totalQuoteCount: 3,
          totalDealCount: 2,
          totalSupportTickets: 1,
          totalDocumentsShared: 8,
          totalInvoices: 0,
          totalPayments: 0,
          
          // Real-time Engagement Metrics
          lastEmailDate: new Date('2024-01-13T14:22:00Z'),
          lastMeetingDate: new Date('2024-01-08T11:00:00Z'),
          lastCallDate: new Date('2024-01-11T15:30:00Z'),
          lastQuoteDate: new Date('2024-01-09T16:45:00Z'),
          lastInteractionDate: new Date('2024-01-13T14:22:00Z'),
          
          // Financial Information
          totalRevenue: 0,
          lifetimeValue: 125000,
          averageDealSize: 62500,
          paymentTerms: 'net_30',
          
          // Enhanced AI Intelligence
          aiHealthScore: 73,
          aiEngagementTrend: 'stable',
          aiSatisfactionTrend: 'improving',
          aiExpansionReadiness: 45,
          aiRetentionProbability: 0.78,
          aiAdvocacyPotential: 55,
          aiChurnRiskScore: 0.22,
          aiNextBestAction: 'Follow up on proposal',
          aiInsights: [
            {
              id: 'insight-2',
              type: 'recommendation',
              title: 'Proposal Follow-up',
              description: 'Customer showed interest in recent proposal, good time for follow-up',
              confidence: 75,
              impact: 'medium',
              actionRequired: true,
              dueDate: new Date('2024-01-20T00:00:00Z'),
              createdAt: new Date()
            }
          ],
          
          // Customer Portal Integration
          portalAccessEnabled: false,
          portalLoginCount: 0,
          portalFeaturesEnabled: [],
          
          // Social Media
          socialMentionsCount: 3,
          socialSentimentScore: 0.65,
          lastSocialMention: new Date('2024-01-10T10:15:00Z'),
          socialProfiles: {
            linkedin: 'https://linkedin.com/company/techflow-solutions'
          },
          
          // Metadata
          customFields: {
            preferredContactMethod: 'phone',
            timezone: 'EST',
            marketSegment: 'Mid-Market'
          },
          tags: ['Prospect', 'Qualified', 'Decision Pending'],
          notes: 'Active prospect with strong interest in our platform. Decision expected within 2 weeks.',
          metadata: {},
          
          // System Fields
          isDeleted: false,
          createdBy: userId,
          createdAt: new Date('2024-01-05T00:00:00Z'),
          updatedAt: new Date('2024-01-13T14:22:00Z')
        }
      ]
      setAccounts(mockAccounts)
    }
  }, [accounts.length, companyId, userId, setAccounts])

  // Mock timeline data
  useEffect(() => {
    if (timelineData.length === 0) {
      const mockTimeline: CustomerTimelineEntry[] = [
        {
          id: 'timeline-1',
          accountId: 'acc-001',
          companyId,
          timelineType: 'email',
          timelineSubtype: 'email_sent',
          title: 'Product Demo Follow-up',
          description: 'Sent follow-up email after product demonstration with additional resources',
          timelineDate: new Date('2024-01-14T11:30:00Z'),
          durationMinutes: 0,
          participants: [
            { id: 'p1', name: 'John Smith', email: 'john@acme.com', type: 'external', role: 'CTO' },
            { id: 'p2', name: 'Sales Rep', email: 'sales@company.com', type: 'internal', role: 'Account Manager' }
          ],
          attachments: [
            { id: 'att1', name: 'Product Brochure.pdf', url: '/docs/brochure.pdf', type: 'pdf', size: 2048000 }
          ],
          tags: ['follow-up', 'demo', 'resources'],
          aiImportanceScore: 75,
          aiSentimentScore: 0.8,
          aiImpactOnRelationship: 0.15,
          aiExtractedInsights: ['Customer interested in enterprise features', 'Requested integration details'],
          aiKeywords: ['demo', 'integration', 'enterprise', 'pricing'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: false,
          viewCount: 3,
          createdAt: new Date('2024-01-14T11:30:00Z'),
          updatedAt: new Date('2024-01-14T11:30:00Z')
        },
        {
          id: 'timeline-2',
          accountId: 'acc-001',
          companyId,
          timelineType: 'meeting',
          timelineSubtype: 'meeting_completed',
          title: 'Quarterly Business Review',
          description: 'Conducted Q4 2023 business review and planning for 2024 expansion',
          timelineDate: new Date('2024-01-10T14:00:00Z'),
          durationMinutes: 60,
          participants: [
            { id: 'p3', name: 'John Smith', email: 'john@acme.com', type: 'external', role: 'CTO' },
            { id: 'p4', name: 'Sarah Johnson', email: 'sarah@acme.com', type: 'external', role: 'VP Operations' },
            { id: 'p5', name: 'Account Manager', email: 'am@company.com', type: 'internal', role: 'Account Manager' }
          ],
          attachments: [
            { id: 'att2', name: 'QBR Presentation.pptx', url: '/docs/qbr-q4-2023.pptx', type: 'pptx', size: 5120000 }
          ],
          tags: ['qbr', 'expansion', 'planning'],
          aiImportanceScore: 95,
          aiSentimentScore: 0.9,
          aiImpactOnRelationship: 0.25,
          aiExtractedInsights: ['Strong satisfaction with current service', 'Ready for expansion discussion', 'Budget approved for additional licenses'],
          aiKeywords: ['expansion', 'budget', 'satisfaction', 'additional', 'licenses'],
          isPublic: true,
          visibleToRoles: [],
          isPinned: true,
          viewCount: 8,
          createdAt: new Date('2024-01-10T14:00:00Z'),
          updatedAt: new Date('2024-01-10T14:00:00Z')
        }
      ]
      setTimelineData(mockTimeline)
    }
  }, [timelineData.length, companyId, setTimelineData])

  // Mock engagement alerts
  useEffect(() => {
    if (engagementAlerts.length === 0) {
      const mockAlerts: AccountEngagementAlert[] = [
        {
          id: 'alert-1',
          accountId: 'acc-002',
          companyId,
          alertType: 'expansion_opportunity',
          alertSeverity: 'high',
          alertTitle: 'Expansion Opportunity Detected',
          alertDescription: 'Account shows strong engagement and readiness for expansion',
          alertMessage: 'TechFlow Solutions has increased usage by 40% this month and expressed interest in additional features.',
          triggerConditions: { engagementIncrease: 40, featureInterest: true },
          thresholdValues: { engagementThreshold: 30 },
          status: 'active',
          recommendedActions: ['Schedule expansion meeting', 'Prepare custom proposal', 'Analyze usage patterns'],
          assignedTo: userId,
          dueDate: new Date('2024-01-20T00:00:00Z'),
          escalationLevel: 1,
          aiUrgencyScore: 85,
          aiImpactPrediction: { revenueIncrease: 125000, probability: 0.75 },
          aiRecommendedResponse: 'Schedule a meeting within 3 days to discuss expansion opportunities',
          createdAt: new Date('2024-01-14T10:00:00Z'),
          updatedAt: new Date('2024-01-14T10:00:00Z')
        }
      ]
      setEngagementAlerts(mockAlerts)
    }
  }, [engagementAlerts.length, companyId, userId, setEngagementAlerts])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || account.accountStatus === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleAccountSelect = (account: EnhancedAccount) => {
    setSelectedAccount(account)
    toast.success(`Opened account: ${account.companyName}`)
  }

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank')
    toast.info(`Opening email to ${email}`)
  }

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank')
    toast.info(`Calling ${phone}`)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEngagementTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp className="text-green-600" size={16} />
      case 'decreasing': return <TrendDown className="text-red-600" size={16} />
      case 'critical': return <Warning className="text-red-600" size={16} />
      default: return <Activity className="text-blue-600" size={16} />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!selectedAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Enhanced Account Management</h2>
            <p className="text-muted-foreground">
              Complete historical tracking, AI insights, and customer intelligence
            </p>
          </div>
          <Button onClick={() => toast.info('New account creation')}>
            <Plus size={16} className="mr-2" />
            New Account
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAccountSelect(account)}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{account.companyName}</CardTitle>
                    <CardDescription>{account.industry}</CardDescription>
                  </div>
                  <Badge variant={account.accountStatus === 'active' ? 'default' : 'secondary'}>
                    {account.accountStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getEngagementTrendIcon(account.aiEngagementTrend)}
                  <span className="text-sm text-muted-foreground">
                    {account.aiEngagementTrend} engagement
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Health Score</span>
                    <span className={`font-medium ${getHealthScoreColor(account.aiHealthScore)}`}>
                      {account.aiHealthScore}%
                    </span>
                  </div>
                  <Progress value={account.aiHealthScore} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">{formatCurrency(account.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employees</p>
                    <p className="font-medium">{account.numberOfEmployees}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {account.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {account.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{account.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {account.aiInsights.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                    <Brain size={14} className="text-blue-600" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {account.aiInsights[0].title}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <Building size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No accounts found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No accounts match "${searchTerm}"` : 'No accounts available'}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Full account detail view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setSelectedAccount(null)}>
          ← Back to Accounts
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{selectedAccount.companyName}</h1>
          <p className="text-muted-foreground">{selectedAccount.industry} • {selectedAccount.accountNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={selectedAccount.accountStatus === 'active' ? 'default' : 'secondary'}>
            {selectedAccount.accountStatus}
          </Badge>
          <Badge variant="outline" className={getHealthScoreColor(selectedAccount.aiHealthScore)}>
            Health: {selectedAccount.aiHealthScore}%
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="portal">Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Globe size={14} />
                          <a 
                            href={selectedAccount.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedAccount.websiteUrl}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <button 
                            onClick={() => handlePhoneClick(selectedAccount.phone || '')}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedAccount.phone}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>
                            {selectedAccount.primaryAddress?.city}, {selectedAccount.primaryAddress?.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Company Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{selectedAccount.companySize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employees:</span>
                          <span>{selectedAccount.numberOfEmployees?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span>{formatCurrency(selectedAccount.annualRevenue || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Territory:</span>
                          <span>{selectedAccount.territory}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Financial Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lifetime Value:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.lifetimeValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Deal Size:</span>
                          <span>{formatCurrency(selectedAccount.averageDealSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Terms:</span>
                          <span>{selectedAccount.paymentTerms}</span>
                        </div>
                        {selectedAccount.creditRating && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Credit Rating:</span>
                            <span>{selectedAccount.creditRating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Activity Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="font-medium">{selectedAccount.totalEmailCount}</p>
                          <p className="text-muted-foreground">Emails</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="font-medium">{selectedAccount.totalMeetingCount}</p>
                          <p className="text-muted-foreground">Meetings</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="font-medium">{selectedAccount.totalCallCount}</p>
                          <p className="text-muted-foreground">Calls</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="font-medium">{selectedAccount.totalDealCount}</p>
                          <p className="text-muted-foreground">Deals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAccount.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      {selectedAccount.notes}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAccount.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={18} />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Health Score</span>
                      <span className={`font-medium ${getHealthScoreColor(selectedAccount.aiHealthScore)}`}>
                        {selectedAccount.aiHealthScore}%
                      </span>
                    </div>
                    <Progress value={selectedAccount.aiHealthScore} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retention Probability</span>
                      <span className="font-medium text-green-600">
                        {(selectedAccount.aiRetentionProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={selectedAccount.aiRetentionProbability * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expansion Readiness</span>
                      <span className="font-medium text-blue-600">
                        {selectedAccount.aiExpansionReadiness}%
                      </span>
                    </div>
                    <Progress value={selectedAccount.aiExpansionReadiness} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity size={14} />
                      <span className="text-sm font-medium">Engagement Trend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEngagementTrendIcon(selectedAccount.aiEngagementTrend)}
                      <span className="text-sm capitalize">{selectedAccount.aiEngagementTrend}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart size={14} />
                      <span className="text-sm font-medium">Satisfaction Trend</span>
                    </div>
                    <span className="text-sm capitalize">{selectedAccount.aiSatisfactionTrend}</span>
                  </div>

                  {selectedAccount.aiNextBestAction && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb size={14} />
                        <span className="text-sm font-medium">Next Best Action</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                        {selectedAccount.aiNextBestAction}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedAccount.aiInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAccount.aiInsights.map((insight) => (
                      <div key={insight.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {insight.type === 'opportunity' && <Target size={14} className="text-green-600" />}
                            {insight.type === 'risk' && <Warning size={14} className="text-red-600" />}
                            {insight.type === 'recommendation' && <Lightbulb size={14} className="text-blue-600" />}
                            <span className="font-medium text-sm">{insight.title}</span>
                          </div>
                          <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'} className="text-xs">
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {insight.confidence}%
                          </span>
                          {insight.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {engagementAlerts.filter(alert => alert.accountId === selectedAccount.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell size={18} />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {engagementAlerts
                      .filter(alert => alert.accountId === selectedAccount.id)
                      .map((alert) => (
                        <div key={alert.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm">{alert.alertTitle}</span>
                            <Badge variant={alert.alertSeverity === 'high' ? 'destructive' : 'default'} className="text-xs">
                              {alert.alertSeverity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{alert.alertMessage}</p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              View Details
                            </Button>
                            <Button size="sm" className="text-xs h-6">
                              Take Action
                            </Button>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <CustomerUnifiedTimeline
            customerId={selectedAccount.id}
            companyId={companyId}
            userId={userId}
            onEntryClick={(entry) => {
              toast.info(`Viewing timeline entry: ${entry.title}`)
            }}
          />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Ecosystem</CardTitle>
              <CardDescription>Relationship mapping and stakeholder analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Network size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Relationship Map</h3>
                <p className="text-muted-foreground">
                  Interactive relationship visualization coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Risk</p>
                    <p className="text-xl font-bold">
                      {(selectedAccount.aiChurnRiskScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Warning className={selectedAccount.aiChurnRiskScore > 0.3 ? 'text-red-500' : 'text-green-500'} size={20} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Portal Logins</p>
                    <p className="text-xl font-bold">{selectedAccount.portalLoginCount}</p>
                  </div>
                  <Monitor className="text-blue-500" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Social Sentiment</p>
                    <p className="text-xl font-bold">
                      {(selectedAccount.socialSentimentScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Heart className="text-pink-500" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Advocacy Score</p>
                    <p className="text-xl font-bold">{selectedAccount.aiAdvocacyPotential}%</p>
                  </div>
                  <Star className="text-yellow-500" size={20} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ChartLine size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Comprehensive performance charts and trends visualization
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>Shared documents and knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileDoc size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Document Management</h3>
                <p className="text-muted-foreground">
                  Centralized document library with version control and access tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portal Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Portal Enabled</span>
                  <Badge variant={selectedAccount.portalAccessEnabled ? 'default' : 'secondary'}>
                    {selectedAccount.portalAccessEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                {selectedAccount.portalAccessEnabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Logins:</span>
                        <span>{selectedAccount.portalLoginCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Login:</span>
                        <span>
                          {selectedAccount.portalLastLogin?.toLocaleDateString() || 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Available Features</h4>
                      <div className="space-y-1">
                        {selectedAccount.portalFeaturesEnabled.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-sm capitalize">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portal Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Monitor size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Recent portal activity will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedAccountManagement