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
import { Account, CustomerUnifiedTimeline, AccountEcosystemMap, CustomerSuccessMetrics, CustomerDocumentLibrary, CustomerPortalActivity, CustomerEngagementAlert } from '@/types/crm'

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
  const [accounts, setAccounts] = useKV<Account[]>('enhanced-accounts-v2', [])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [activeTab, setActiveTab] = useState('executive')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [timelineData, setTimelineData] = useKV<CustomerUnifiedTimeline[]>('customer-timeline', [])
  const [ecosystemMap, setEcosystemMap] = useKV<AccountEcosystemMap[]>('account-ecosystem', [])
  const [successMetrics, setSuccessMetrics] = useKV<CustomerSuccessMetrics[]>('success-metrics', [])
  const [documentLibrary, setDocumentLibrary] = useKV<CustomerDocumentLibrary[]>('document-library', [])
  const [portalActivity, setPortalActivity] = useKV<CustomerPortalActivity[]>('portal-activity', [])
  const [engagementAlerts, setEngagementAlerts] = useKV<CustomerEngagementAlert[]>('engagement-alerts', [])

  // Enhanced mock data with new AI features
  useEffect(() => {
    if (accounts.length === 0) {
      const mockAccounts: Account[] = [
        {
          id: 'acc-001',
          companyId,
          name: 'Acme Corporation',
          website: 'https://acme.com',
          industry: 'Technology',
          size: 'enterprise',
          revenue: 5000000,
          employees: 250,
          address: {
            street: '123 Tech Boulevard',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            zipCode: '94105'
          },
          phone: '+1 (555) 123-4567',
          description: 'Leading technology solutions provider',
          accountType: 'customer',
          status: 'active',
          owner: userId,
          tags: ['High Value', 'Strategic', 'Expansion Ready'],
          customFields: {},
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          totalRevenue: 750000,
          lastActivityDate: '2024-01-14T16:45:00Z',
          nextReviewDate: '2024-01-20T14:00:00Z',
          
          // Enhanced AI Intelligence
          aiEngagementTrend: 'increasing',
          aiSatisfactionTrend: 'stable',
          aiExpansionReadiness: 85,
          aiRetentionProbability: 0.92,
          aiAdvocacyPotential: 78,
          
          // Customer Portal Integration
          portalAccessEnabled: true,
          portalLastLogin: '2024-01-14T09:15:00Z',
          portalLoginCount: 47,
          
          // Complete Historical Tracking
          totalEmailCount: 124,
          totalMeetingCount: 18,
          totalCallCount: 32,
          totalQuoteCount: 8,
          totalDealCount: 12,
          totalSupportTickets: 3,
          totalDocumentsShared: 25,
          
          // Real-time Engagement Metrics
          lastEmailDate: '2024-01-14T11:30:00Z',
          lastMeetingDate: '2024-01-10T14:00:00Z',
          lastCallDate: '2024-01-12T16:20:00Z',
          lastQuoteDate: '2024-01-08T10:15:00Z',
          lastSupportTicketDate: '2024-01-05T13:45:00Z',
          
          // Social Media Monitoring
          socialMentionsCount: 15,
          socialSentimentScore: 0.75,
          lastSocialMention: '2024-01-13T08:30:00Z',
          
          // Enhanced Analytics
          customerHealthScore: 87,
          engagementScore: 92,
          satisfactionScore: 89,
          churnRisk: 'low',
          expansionOpportunities: ['Enterprise Package', 'Additional Licenses', 'Professional Services']
        },
        {
          id: 'acc-002',
          companyId,
          name: 'TechFlow Solutions',
          website: 'https://techflow.com',
          industry: 'Software',
          size: 'medium',
          revenue: 2500000,
          employees: 120,
          address: {
            street: '456 Innovation Drive',
            city: 'Austin',
            state: 'TX',
            country: 'United States',
            zipCode: '78701'
          },
          phone: '+1 (555) 987-6543',
          description: 'Innovative software development company',
          accountType: 'prospect',
          status: 'active',
          owner: userId,
          tags: ['Growth Potential', 'Tech Savvy', 'Mid-Market'],
          customFields: {},
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-12T09:15:00Z',
          totalRevenue: 320000,
          lastActivityDate: '2024-01-11T15:30:00Z',
          nextReviewDate: '2024-01-18T11:00:00Z',
          
          // Enhanced AI Intelligence
          aiEngagementTrend: 'stable',
          aiSatisfactionTrend: 'improving',
          aiExpansionReadiness: 68,
          aiRetentionProbability: 0.84,
          aiAdvocacyPotential: 65,
          
          // Customer Portal Integration
          portalAccessEnabled: false,
          portalLastLogin: undefined,
          portalLoginCount: 0,
          
          // Complete Historical Tracking
          totalEmailCount: 89,
          totalMeetingCount: 12,
          totalCallCount: 24,
          totalQuoteCount: 5,
          totalDealCount: 8,
          totalSupportTickets: 1,
          totalDocumentsShared: 15,
          
          // Real-time Engagement Metrics
          lastEmailDate: '2024-01-11T10:45:00Z',
          lastMeetingDate: '2024-01-08T15:30:00Z',
          lastCallDate: '2024-01-09T13:15:00Z',
          lastQuoteDate: '2024-01-07T09:20:00Z',
          lastSupportTicketDate: '2024-01-03T14:30:00Z',
          
          // Social Media Monitoring
          socialMentionsCount: 8,
          socialSentimentScore: 0.65,
          lastSocialMention: '2024-01-10T12:45:00Z',
          
          // Enhanced Analytics
          customerHealthScore: 73,
          engagementScore: 78,
          satisfactionScore: 81,
          churnRisk: 'medium',
          expansionOpportunities: ['Premium Features', 'Training Services']
        }
      ]
      setAccounts(mockAccounts)
      setSelectedAccount(mockAccounts[0])
    }

    // Mock timeline data
    if (timelineData.length === 0) {
      const mockTimeline: CustomerUnifiedTimeline[] = [
        {
          id: 'timeline-001',
          customerId: 'acc-001',
          timelineType: 'email',
          timelineSubtype: 'email_sent',
          title: 'Proposal Follow-up Email Sent',
          description: 'Sent follow-up email regarding enterprise package proposal',
          summary: 'Follow-up on enterprise package pricing and implementation timeline',
          relatedQuoteId: 'quote-001',
          timelineDate: '2024-01-14T11:30:00Z',
          participants: ['John Smith', 'Sarah Johnson'],
          attachments: [],
          aiImportanceScore: 85,
          aiSentimentScore: 0.8,
          aiImpactOnRelationship: 0.75,
          aiExtractedInsights: ['Customer interested in Q2 implementation', 'Budget approved for enterprise features'],
          isPublic: true,
          visibleToRoles: [],
          createdBy: userId,
          isPinned: true,
          viewCount: 5,
          lastViewed: '2024-01-14T12:00:00Z',
          createdAt: '2024-01-14T11:30:00Z',
          updatedAt: '2024-01-14T11:30:00Z'
        },
        {
          id: 'timeline-002',
          customerId: 'acc-001',
          timelineType: 'meeting',
          timelineSubtype: 'demo_completed',
          title: 'Product Demo Session',
          description: 'Conducted comprehensive product demonstration for key stakeholders',
          summary: 'Successful demo covering enterprise features, integration capabilities, and ROI analysis',
          relatedDealId: 'deal-001',
          timelineDate: '2024-01-10T14:00:00Z',
          durationMinutes: 90,
          participants: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wong'],
          attachments: [],
          aiImportanceScore: 95,
          aiSentimentScore: 0.9,
          aiImpactOnRelationship: 0.85,
          aiExtractedInsights: ['Strong interest in API integrations', 'Security compliance concerns addressed', 'Implementation timeline acceptable'],
          isPublic: true,
          visibleToRoles: [],
          createdBy: userId,
          isPinned: false,
          viewCount: 8,
          lastViewed: '2024-01-12T09:30:00Z',
          createdAt: '2024-01-10T14:00:00Z',
          updatedAt: '2024-01-10T14:00:00Z'
        }
      ]
      setTimelineData(mockTimeline)
    }

    // Mock engagement alerts
    if (engagementAlerts.length === 0) {
      const mockAlerts: CustomerEngagementAlert[] = [
        {
          id: 'alert-001',
          customerId: 'acc-001',
          alertType: 'portal_inactivity',
          severity: 'medium',
          message: 'Customer portal activity decreased by 40%',
          description: 'Acme Corporation has shown reduced portal engagement over the past week',
          triggeredBy: 'ai_analysis',
          triggerConditions: { portal_sessions: 'decreased', threshold: 40 },
          status: 'active',
          recommendedActions: ['Send engagement email', 'Schedule check-in call', 'Offer training session'],
          assignedTo: userId,
          dueDate: '2024-01-17T17:00:00Z',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      ]
      setEngagementAlerts(mockAlerts)
    }
  }, [accounts, setAccounts, timelineData, setTimelineData, engagementAlerts, setEngagementAlerts, userId, companyId])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || account.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    toast.success(`Viewing ${account.name} details`)
  }

  const handleEmailClick = (email: string) => {
    toast.info(`Opening email composer for ${email}`)
  }

  const handlePhoneClick = (phone: string) => {
    toast.info(`Initiating call to ${phone}`)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendUp className="w-4 h-4 text-green-600" />
      case 'decreasing':
        return <TrendDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const renderAccountsList = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Enhanced Account Management
          </span>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </CardTitle>
        <CardDescription>
          Comprehensive account intelligence with AI insights, portal integration, and real-time collaboration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search accounts by name, industry, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="space-y-3">
          {filteredAccounts.map((account) => {
            const accountAlerts = engagementAlerts.filter(alert => 
              alert.customerId === account.id && alert.status === 'active'
            )
            
            return (
              <div
                key={account.id}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleAccountClick(account)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="relative">
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                      {account.portalAccessEnabled && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{account.name}</h3>
                        {accountAlerts.length > 0 && (
                          <Badge variant="destructive" className="px-1 py-0 text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            {accountAlerts.length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.industry} • {account.size}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-xs">
                          {getTrendIcon(account.aiEngagementTrend)}
                          <span className="ml-1 capitalize">{account.aiEngagementTrend}</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded border ${getChurnRiskColor(account.churnRisk)}`}>
                          {account.churnRisk.toUpperCase()} RISK
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <div className={`text-sm font-medium ${getHealthScoreColor(account.customerHealthScore)}`}>
                        {account.customerHealthScore}% Health
                      </div>
                      <div className="text-xs text-muted-foreground">
                        AI Score: {account.aiExpansionReadiness}/100
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${account.totalRevenue.toLocaleString()} revenue
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button
                        className="block text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEmailClick('contact@' + account.name.toLowerCase().replace(/\s+/g, '') + '.com')
                        }}
                      >
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </button>
                      <button
                        className="block text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePhoneClick(account.phone || '+1 (555) 000-0000')
                        }}
                      >
                        <Phone className="w-4 h-4 inline mr-1" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const renderAccountDetails = () => {
    if (!selectedAccount) return null

    const accountTimeline = timelineData.filter(item => item.customerId === selectedAccount.id)
    const accountAlerts = engagementAlerts.filter(alert => alert.customerId === selectedAccount.id)

    return (
      <div className="space-y-6">
        {/* Enhanced Account Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 relative">
                  <AvatarImage src={`/api/placeholder/64/64`} />
                  <AvatarFallback className="text-lg">
                    {selectedAccount.name.charAt(0)}
                  </AvatarFallback>
                  {selectedAccount.portalAccessEnabled && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <Monitor className="w-3 h-3 text-white" />
                    </div>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">{selectedAccount.name}</h2>
                    <Badge variant={selectedAccount.status === 'active' ? 'default' : 'secondary'}>
                      {selectedAccount.status.toUpperCase()}
                    </Badge>
                    <div className={`px-2 py-1 rounded text-xs border ${getChurnRiskColor(selectedAccount.churnRisk)}`}>
                      {selectedAccount.churnRisk.toUpperCase()} CHURN RISK
                    </div>
                  </div>
                  <p className="text-muted-foreground">{selectedAccount.industry} • {selectedAccount.size}</p>
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>${(selectedAccount.revenue! / 1000000).toFixed(1)}M revenue</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{selectedAccount.employees} employees</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{selectedAccount.accountType}</span>
                    </div>
                    {selectedAccount.portalAccessEnabled && (
                      <div className="flex items-center text-sm">
                        <Monitor className="w-4 h-4 mr-2 text-green-600" />
                        <span>Portal Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* AI Health Metrics Bar */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Health Score</div>
                <div className={`text-lg font-bold ${getHealthScoreColor(selectedAccount.customerHealthScore)}`}>
                  {selectedAccount.customerHealthScore}%
                </div>
                <Progress value={selectedAccount.customerHealthScore} className="h-2" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Engagement</div>
                <div className="text-lg font-bold text-blue-600">
                  {selectedAccount.engagementScore}%
                </div>
                <Progress value={selectedAccount.engagementScore} className="h-2" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Expansion Ready</div>
                <div className="text-lg font-bold text-purple-600">
                  {selectedAccount.aiExpansionReadiness}%
                </div>
                <Progress value={selectedAccount.aiExpansionReadiness} className="h-2" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Retention</div>
                <div className="text-lg font-bold text-green-600">
                  {(selectedAccount.aiRetentionProbability * 100).toFixed(0)}%
                </div>
                <Progress value={selectedAccount.aiRetentionProbability * 100} className="h-2" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Active Alerts */}
        {accountAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <Bell className="w-5 h-5 mr-2" />
                Active Engagement Alerts ({accountAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accountAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded border ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.message}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(alert.dueDate!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {alert.recommendedActions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="executive">Executive</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="portal">Portal Activity</TabsTrigger>
            <TabsTrigger value="success">Success Metrics</TabsTrigger>
            <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Contact Information</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleEmailClick('contact@' + selectedAccount.name.toLowerCase() + '.com')}
                            >
                              contact@{selectedAccount.name.toLowerCase().replace(/\s+/g, '')}.com
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handlePhoneClick(selectedAccount.phone || '+1 (555) 000-0000')}
                            >
                              {selectedAccount.phone || '+1 (555) 000-0000'}
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                            <a
                              href={selectedAccount.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {selectedAccount.website}
                            </a>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p>{selectedAccount.address?.street}</p>
                              <p>{selectedAccount.address?.city}, {selectedAccount.address?.state} {selectedAccount.address?.zipCode}</p>
                              <p>{selectedAccount.address?.country}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Key Metrics</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Customer Health:</span>
                            <span className={getHealthScoreColor(selectedAccount.customerHealthScore)}>
                              {selectedAccount.customerHealthScore}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engagement Score:</span>
                            <span className="text-blue-600">{selectedAccount.engagementScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span className="font-medium">${selectedAccount.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Portal Logins:</span>
                            <span>{selectedAccount.portalLoginCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Support Tickets:</span>
                            <span>{selectedAccount.totalSupportTickets}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Activity Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Envelope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{selectedAccount.totalEmailCount}</div>
                        <div className="text-sm text-muted-foreground">Total Emails</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(selectedAccount.lastEmailDate!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <VideoCamera className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">{selectedAccount.totalMeetingCount}</div>
                        <div className="text-sm text-muted-foreground">Total Meetings</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(selectedAccount.lastMeetingDate!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <FileDoc className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{selectedAccount.totalQuoteCount}</div>
                        <div className="text-sm text-muted-foreground">Total Quotes</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(selectedAccount.lastQuoteDate!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Meeting
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Quote
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Monitor className="w-4 h-4 mr-2" />
                      Portal Access
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Ticket className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Unified Customer Timeline
                  </span>
                  <Button variant="outline" size="sm">
                    <ArrowsClockwise className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Complete chronological view of all customer interactions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {accountTimeline.map((item, index) => (
                      <div key={item.id} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.timelineType === 'email' ? 'bg-blue-100 text-blue-600' :
                            item.timelineType === 'meeting' ? 'bg-green-100 text-green-600' :
                            item.timelineType === 'call' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {item.timelineType === 'email' && <Envelope className="w-4 h-4" />}
                            {item.timelineType === 'meeting' && <VideoCamera className="w-4 h-4" />}
                            {item.timelineType === 'call' && <Phone className="w-4 h-4" />}
                            {item.timelineType === 'document' && <FileDoc className="w-4 h-4" />}
                          </div>
                          {index < accountTimeline.length - 1 && (
                            <div className="w-px h-16 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center space-x-2">
                              {item.isPinned && <Star className="w-4 h-4 text-yellow-500" />}
                              <Badge variant="outline" className="text-xs">
                                AI Score: {item.aiImportanceScore}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.timelineDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          {item.summary && (
                            <p className="text-sm mt-2 p-2 bg-muted/50 rounded italic">
                              AI Summary: {item.summary}
                            </p>
                          )}
                          {item.participants && item.participants.length > 0 && (
                            <div className="flex items-center mt-2">
                              <Users className="w-4 h-4 text-muted-foreground mr-2" />
                              <span className="text-xs text-muted-foreground">
                                {item.participants.join(', ')}
                              </span>
                            </div>
                          )}
                          {item.aiExtractedInsights && item.aiExtractedInsights.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">AI Insights:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.aiExtractedInsights.map((insight, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    <Brain className="w-3 h-3 mr-1" />
                                    {insight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Portal Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Portal Access:</span>
                      <Badge variant={selectedAccount.portalAccessEnabled ? 'default' : 'secondary'}>
                        {selectedAccount.portalAccessEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Logins:</span>
                      <span className="font-medium">{selectedAccount.portalLoginCount}</span>
                    </div>
                    {selectedAccount.portalLastLogin && (
                      <div className="flex items-center justify-between">
                        <span>Last Login:</span>
                        <span>{new Date(selectedAccount.portalLastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                    <Button className="w-full">
                      <LinkSimple className="w-4 h-4 mr-2" />
                      Open Customer Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portal Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Session Frequency</span>
                        <span>8.5/10</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Feature Adoption</span>
                        <span>6.7/10</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Document Downloads</span>
                        <span>9.2/10</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Support Usage</span>
                        <span>3.1/10</span>
                      </div>
                      <Progress value={31} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="success" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-lg font-bold">{selectedAccount.satisfactionScore}%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(selectedAccount.aiEngagementTrend)}
                    </div>
                    <p className="text-lg font-bold capitalize">{selectedAccount.aiEngagementTrend}</p>
                    <p className="text-xs text-muted-foreground">Engagement Trend</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Fire className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-lg font-bold">{selectedAccount.aiExpansionReadiness}%</p>
                    <p className="text-xs text-muted-foreground">Expansion Ready</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-lg font-bold">{(selectedAccount.aiRetentionProbability * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Retention Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expansion Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedAccount.expansionOpportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span>{opportunity}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Explore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecosystem" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="w-5 h-5 mr-2" />
                  Account Ecosystem & Relationships
                </CardTitle>
                <CardDescription>
                  Visualize and manage the complete business relationship network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TreeStructure className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Relationship Mapping</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interactive visualization of all business relationships, partnerships, and connections
                  </p>
                  <Button>
                    <Network className="w-4 h-4 mr-2" />
                    Launch Relationship Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI-Powered Intelligence & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">High Expansion Opportunity</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          AI analysis shows {selectedAccount.aiExpansionReadiness}% readiness for upselling. 
                          Based on usage patterns and growth trajectory, consider presenting enterprise features.
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <ChartLine className="w-3 h-3 mr-1" />
                            Usage +45%
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Team Growth
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Excellent Retention Probability</h4>
                        <p className="text-sm text-green-700 mt-1">
                          {(selectedAccount.aiRetentionProbability * 100).toFixed(0)}% probability of renewal based on:
                        </p>
                        <ul className="text-sm text-green-700 mt-2 ml-4 list-disc">
                          <li>High engagement scores ({selectedAccount.engagementScore}%)</li>
                          <li>Positive trend in satisfaction metrics</li>
                          <li>Regular portal usage and feature adoption</li>
                          <li>Strong relationship indicators</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                    <div className="flex items-start space-x-3">
                      <Handshake className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Strong Advocacy Potential</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          {selectedAccount.aiAdvocacyPotential}% advocacy potential. This account could become a reference customer.
                          Consider inviting them to case study opportunities or user conferences.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-start space-x-3">
                      <Robot className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">AI Recommendations</h4>
                        <p className="text-sm text-orange-700 mt-1">Next best actions based on AI analysis:</p>
                        <ul className="text-sm text-orange-700 mt-2 ml-4 list-disc">
                          <li>Schedule quarterly business review within 2 weeks</li>
                          <li>Present enterprise security features demo</li>
                          <li>Introduce advanced analytics package</li>
                          <li>Connect with their IT director for technical alignment</li>
                        </ul>
                      </div>
                    </div>
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
      {renderAccountsList()}
      {selectedAccount && renderAccountDetails()}
    </div>
  )
}

export default EnhancedAccountManagement