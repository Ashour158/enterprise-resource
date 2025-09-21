import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendUp, 
  TrendDown, 
  Users, 
  FileText, 
  MessageCircle, 
  Video,
  Clock,
  Star,
  Heart,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  ExternalLink,
  Download,
  Share,
  Plus,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Shield,
  Zap,
  Target,
  Award,
  Lightbulb,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Account {
  id: string
  company_id: string
  customer_id: string
  company_name: string
  industry: string
  account_type: string
  account_status: string
  primary_contact_id: string
  account_manager_id: string
  
  // Historical tracking
  total_email_count: number
  total_meeting_count: number
  total_call_count: number
  total_quote_count: number
  total_deal_count: number
  total_support_tickets: number
  total_documents_shared: number
  
  // Recent activity
  last_email_date: string
  last_meeting_date: string
  last_call_date: string
  last_quote_date: string
  last_support_ticket_date: string
  last_login_date: string
  
  // AI Intelligence
  ai_engagement_trend: string
  ai_satisfaction_trend: string
  ai_expansion_readiness: number
  ai_retention_probability: number
  ai_advocacy_potential: number
  
  // Portal access
  portal_access_enabled: boolean
  portal_last_login: string
  portal_login_count: number
  
  // Social monitoring
  social_mentions_count: number
  social_sentiment_score: number
  last_social_mention: string
  
  // Financial
  annual_revenue: number
  total_contract_value: number
  lifetime_value: number
  
  // Contact info
  phone: string
  email: string
  website: string
  address: string
  
  created_at: string
  updated_at: string
}

interface TimelineEntry {
  id: string
  customer_id: string
  timeline_type: string
  timeline_subtype: string
  title: string
  description: string
  summary: string
  timeline_date: string
  duration_minutes?: number
  participants: string[]
  ai_importance_score: number
  ai_sentiment_score: number
  is_pinned: boolean
  created_by: string
}

interface AccountMetrics {
  customer_id: string
  nps_score: number
  csat_score: number
  ces_score: number
  support_ticket_volume: number
  payment_timeliness_score: number
  ai_overall_health_score: number
  ai_churn_risk_score: number
  ai_expansion_readiness: number
  ai_advocacy_potential: number
}

interface RelatedEntity {
  id: string
  entity_type: string
  entity_name: string
  relationship_nature: string
  relationship_strength: number
  influence_level: number
  revenue_impact: number
  strategic_importance: string
}

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function EnhancedAccountManagement({ companyId, userId, userRole }: EnhancedAccountManagementProps) {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, [])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Mock data for demonstration
  const mockTimelineEntries: TimelineEntry[] = [
    {
      id: 'timeline-001',
      customer_id: 'account-001',
      timeline_type: 'email',
      timeline_subtype: 'email_sent',
      title: 'Quarterly Business Review Invitation',
      description: 'Sent QBR invitation with agenda and meeting materials',
      summary: 'QBR scheduled for next week with key stakeholders',
      timeline_date: '2024-01-15T10:30:00Z',
      duration_minutes: null,
      participants: ['john.smith@techcorp.com', 'sarah.johnson@company.com'],
      ai_importance_score: 85,
      ai_sentiment_score: 0.7,
      is_pinned: true,
      created_by: 'user-001'
    },
    {
      id: 'timeline-002',
      customer_id: 'account-001',
      timeline_type: 'meeting',
      timeline_subtype: 'meeting_completed',
      title: 'Product Demo - Advanced Features',
      description: 'Demonstrated new AI capabilities and automation features',
      summary: 'High interest in AI features, requesting pilot program',
      timeline_date: '2024-01-12T14:00:00Z',
      duration_minutes: 60,
      participants: ['john.smith@techcorp.com', 'mike.chen@techcorp.com', 'sarah.johnson@company.com'],
      ai_importance_score: 92,
      ai_sentiment_score: 0.8,
      is_pinned: false,
      created_by: 'user-001'
    },
    {
      id: 'timeline-003',
      customer_id: 'account-001',
      timeline_type: 'quote',
      timeline_subtype: 'quote_sent',
      title: 'AI Features Pilot Program Quote',
      description: 'Custom quote for 6-month AI pilot program with training',
      summary: 'Quote sent for $150,000 pilot program',
      timeline_date: '2024-01-10T16:45:00Z',
      duration_minutes: null,
      participants: ['john.smith@techcorp.com'],
      ai_importance_score: 95,
      ai_sentiment_score: 0.6,
      is_pinned: true,
      created_by: 'user-001'
    }
  ]

  const mockAccountMetrics: AccountMetrics = {
    customer_id: 'account-001',
    nps_score: 8,
    csat_score: 87,
    ces_score: 92,
    support_ticket_volume: 3,
    payment_timeliness_score: 98,
    ai_overall_health_score: 89,
    ai_churn_risk_score: 0.12,
    ai_expansion_readiness: 78,
    ai_advocacy_potential: 85
  }

  const mockRelatedEntities: RelatedEntity[] = [
    {
      id: 'rel-001',
      entity_type: 'partner',
      entity_name: 'Integration Partner Solutions',
      relationship_nature: 'technology_partner',
      relationship_strength: 85,
      influence_level: 70,
      revenue_impact: 250000,
      strategic_importance: 'high'
    },
    {
      id: 'rel-002',
      entity_type: 'vendor',
      entity_name: 'Cloud Infrastructure Corp',
      relationship_nature: 'vendor',
      relationship_strength: 65,
      influence_level: 45,
      revenue_impact: 0,
      strategic_importance: 'medium'
    }
  ]

  // Initialize with mock data if empty
  useEffect(() => {
    if (accounts.length === 0) {
      const mockAccounts: Account[] = [
        {
          id: 'account-001',
          company_id: companyId,
          customer_id: 'customer-001',
          company_name: 'TechCorp Industries',
          industry: 'Technology',
          account_type: 'enterprise',
          account_status: 'active',
          primary_contact_id: 'contact-001',
          account_manager_id: userId,
          
          total_email_count: 247,
          total_meeting_count: 32,
          total_call_count: 89,
          total_quote_count: 12,
          total_deal_count: 8,
          total_support_tickets: 15,
          total_documents_shared: 45,
          
          last_email_date: '2024-01-15T10:30:00Z',
          last_meeting_date: '2024-01-12T14:00:00Z',
          last_call_date: '2024-01-14T09:15:00Z',
          last_quote_date: '2024-01-10T16:45:00Z',
          last_support_ticket_date: '2024-01-08T11:20:00Z',
          last_login_date: '2024-01-15T08:45:00Z',
          
          ai_engagement_trend: 'increasing',
          ai_satisfaction_trend: 'stable',
          ai_expansion_readiness: 78,
          ai_retention_probability: 0.92,
          ai_advocacy_potential: 85,
          
          portal_access_enabled: true,
          portal_last_login: '2024-01-15T08:45:00Z',
          portal_login_count: 156,
          
          social_mentions_count: 12,
          social_sentiment_score: 0.75,
          last_social_mention: '2024-01-13T16:20:00Z',
          
          annual_revenue: 50000000,
          total_contract_value: 2500000,
          lifetime_value: 8750000,
          
          phone: '+1 (555) 123-4567',
          email: 'contact@techcorp.com',
          website: 'https://techcorp.com',
          address: '123 Technology Ave, San Francisco, CA 94105',
          
          created_at: '2023-03-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'account-002',
          company_id: companyId,
          customer_id: 'customer-002',
          company_name: 'Global Manufacturing Ltd',
          industry: 'Manufacturing',
          account_type: 'mid_market',
          account_status: 'active',
          primary_contact_id: 'contact-002',
          account_manager_id: userId,
          
          total_email_count: 156,
          total_meeting_count: 18,
          total_call_count: 45,
          total_quote_count: 8,
          total_deal_count: 5,
          total_support_tickets: 8,
          total_documents_shared: 28,
          
          last_email_date: '2024-01-14T15:20:00Z',
          last_meeting_date: '2024-01-11T10:00:00Z',
          last_call_date: '2024-01-13T14:30:00Z',
          last_quote_date: '2024-01-09T11:15:00Z',
          last_support_ticket_date: '2024-01-05T09:45:00Z',
          last_login_date: '2024-01-14T07:30:00Z',
          
          ai_engagement_trend: 'stable',
          ai_satisfaction_trend: 'improving',
          ai_expansion_readiness: 65,
          ai_retention_probability: 0.88,
          ai_advocacy_potential: 72,
          
          portal_access_enabled: true,
          portal_last_login: '2024-01-14T07:30:00Z',
          portal_login_count: 89,
          
          social_mentions_count: 5,
          social_sentiment_score: 0.68,
          last_social_mention: '2024-01-10T12:15:00Z',
          
          annual_revenue: 25000000,
          total_contract_value: 850000,
          lifetime_value: 3200000,
          
          phone: '+1 (555) 987-6543',
          email: 'info@globalmanufacturing.com',
          website: 'https://globalmanufacturing.com',
          address: '456 Industrial Blvd, Chicago, IL 60601',
          
          created_at: '2023-06-20T14:00:00Z',
          updated_at: '2024-01-14T15:20:00Z'
        }
      ]
      setAccounts(mockAccounts)
    }
  }, [companyId, userId, accounts.length, setAccounts])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || account.account_status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    setActiveTab('overview')
    toast.success(`Opened account: ${account.company_name}`)
  }

  const handleClickableData = (type: string, value: string, account: Account) => {
    switch (type) {
      case 'phone':
        toast.success(`Initiating call to ${value}`)
        break
      case 'email':
        toast.success(`Opening email composer for ${value}`)
        break
      case 'website':
        toast.success(`Opening website: ${value}`)
        break
      case 'address':
        toast.success(`Opening map for: ${value}`)
        break
      case 'contact':
        toast.success(`Opening contact profile`)
        break
      default:
        toast.info(`Clicked: ${type} - ${value}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthColor = (score: number) => {
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

  const AccountOverview = ({ account }: { account: Account }) => (
    <div className="space-y-6">
      {/* Account Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Account Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Score</span>
              <span className={`text-2xl font-bold ${getHealthColor(mockAccountMetrics.ai_overall_health_score)}`}>
                {mockAccountMetrics.ai_overall_health_score}%
              </span>
            </div>
            <Progress value={mockAccountMetrics.ai_overall_health_score} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-xs text-muted-foreground">Engagement</div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(account.ai_engagement_trend)}
                  <span className="text-sm font-medium capitalize">{account.ai_engagement_trend}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Satisfaction</div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(account.ai_satisfaction_trend)}
                  <span className="text-sm font-medium capitalize">{account.ai_satisfaction_trend}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expansion Readiness</span>
                  <span className="font-medium">{account.ai_expansion_readiness}%</span>
                </div>
                <Progress value={account.ai_expansion_readiness} className="h-2 mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Advocacy Potential</span>
                  <span className="font-medium">{account.ai_advocacy_potential}%</span>
                </div>
                <Progress value={account.ai_advocacy_potential} className="h-2 mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retention Risk</span>
                  <span className="font-medium text-green-600">
                    {Math.round((1 - mockAccountMetrics.ai_churn_risk_score) * 100)}%
                  </span>
                </div>
                <Progress value={(1 - mockAccountMetrics.ai_churn_risk_score) * 100} className="h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Annual Revenue</span>
                <span className="font-medium">{formatCurrency(account.annual_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contract Value</span>
                <span className="font-medium">{formatCurrency(account.total_contract_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lifetime Value</span>
                <span className="font-medium text-green-600">{formatCurrency(account.lifetime_value)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Payment Score</span>
                <span className={`font-medium ${getHealthColor(mockAccountMetrics.payment_timeliness_score)}`}>
                  {mockAccountMetrics.payment_timeliness_score}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span 
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleClickableData('phone', account.phone, account)}
                >
                  {account.phone}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span 
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleClickableData('email', account.email, account)}
                >
                  {account.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span 
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleClickableData('website', account.website, account)}
                >
                  {account.website}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <span 
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleClickableData('address', account.address, account)}
                >
                  {account.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Industry:</span>
                <Badge variant="outline">{account.industry}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Account Type:</span>
                <Badge variant="secondary">{account.account_type}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Mail className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{account.total_email_count}</div>
              <div className="text-sm text-muted-foreground">Emails</div>
              <div className="text-xs text-muted-foreground mt-1">
                Last: {formatDate(account.last_email_date)}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{account.total_meeting_count}</div>
              <div className="text-sm text-muted-foreground">Meetings</div>
              <div className="text-xs text-muted-foreground mt-1">
                Last: {formatDate(account.last_meeting_date)}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Phone className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{account.total_call_count}</div>
              <div className="text-sm text-muted-foreground">Calls</div>
              <div className="text-xs text-muted-foreground mt-1">
                Last: {formatDate(account.last_call_date)}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{account.total_quote_count}</div>
              <div className="text-sm text-muted-foreground">Quotes</div>
              <div className="text-xs text-muted-foreground mt-1">
                Last: {formatDate(account.last_quote_date)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const TimelineView = ({ account }: { account: Account }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Timeline</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockTimelineEntries.map((entry, index) => (
          <Card key={entry.id} className={`relative ${entry.is_pinned ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
            {entry.is_pinned && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Pinned
                </Badge>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  {index < mockTimelineEntries.length - 1 && (
                    <div className="w-0.5 h-16 bg-border ml-0.75 mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{entry.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{entry.description}</p>
                      {entry.summary && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <Lightbulb className="w-4 h-4 inline mr-1" />
                            AI Summary: {entry.summary}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.timeline_date)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.timeline_type}
                        </Badge>
                        {entry.ai_importance_score > 80 && (
                          <Badge variant="destructive" className="text-xs">
                            High Impact
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {entry.participants.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {entry.participants.map((participant, idx) => (
                          <span 
                            key={idx}
                            className="text-blue-600 hover:underline cursor-pointer text-sm"
                            onClick={() => handleClickableData('contact', participant, account)}
                          >
                            {participant}
                            {idx < entry.participants.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Importance: {entry.ai_importance_score}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Sentiment: {Math.round(entry.ai_sentiment_score * 100)}%
                      </div>
                      {entry.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.duration_minutes}m
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-4">
        <Button variant="outline">
          Load More Timeline Entries
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const RelationshipsView = ({ account }: { account: Account }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Account Ecosystem</h3>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockRelatedEntities.map((entity) => (
          <Card key={entity.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{entity.entity_name}</h4>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {entity.relationship_nature.replace('_', ' ')}
                  </Badge>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Relationship Strength</span>
                      <span className="font-medium">{entity.relationship_strength}%</span>
                    </div>
                    <Progress value={entity.relationship_strength} className="h-1" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Influence Level</span>
                      <span className="font-medium">{entity.influence_level}%</span>
                    </div>
                    <Progress value={entity.influence_level} className="h-1" />
                    
                    {entity.revenue_impact > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Revenue Impact</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(entity.revenue_impact)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={
                  entity.strategic_importance === 'high' ? 'destructive' :
                  entity.strategic_importance === 'medium' ? 'default' : 'secondary'
                }>
                  {entity.strategic_importance}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relationship Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Interactive relationship network diagram</p>
              <p className="text-sm text-muted-foreground mt-1">Visual mapping of all connected entities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const MetricsView = ({ account }: { account: Account }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>NPS Score</span>
                  <span className="font-medium">{mockAccountMetrics.nps_score}/10</span>
                </div>
                <Progress value={mockAccountMetrics.nps_score * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CSAT Score</span>
                  <span className="font-medium">{mockAccountMetrics.csat_score}%</span>
                </div>
                <Progress value={mockAccountMetrics.csat_score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CES Score</span>
                  <span className="font-medium">{mockAccountMetrics.ces_score}%</span>
                </div>
                <Progress value={mockAccountMetrics.ces_score} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Support Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockAccountMetrics.support_ticket_volume}</div>
              <div className="text-sm text-muted-foreground">Active Tickets</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Resolution Rate</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg. Response Time</span>
                <span className="font-medium">2.4h</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Escalation Rate</span>
                <span className="font-medium">8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Portal Logins</span>
                <span className="font-medium">{account.portal_login_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Social Mentions</span>
                <span className="font-medium">{account.social_mentions_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Social Sentiment</span>
                <span className={`font-medium ${account.social_sentiment_score > 0.6 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {Math.round(account.social_sentiment_score * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Portal Login</span>
                <span className="text-xs">{formatDate(account.portal_last_login)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Success Metrics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Interactive metrics dashboard</p>
              <p className="text-sm text-muted-foreground mt-1">Real-time KPI visualization and trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (selectedAccount) {
    return (
      <div className="space-y-6">
        {/* Account Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedAccount(null)}
                    className="h-8 w-8 p-0"
                  >
                    ←
                  </Button>
                  <h1 className="text-2xl font-bold">{selectedAccount.company_name}</h1>
                  <Badge variant={selectedAccount.account_status === 'active' ? 'default' : 'secondary'}>
                    {selectedAccount.account_status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {selectedAccount.industry} • Account Manager: Sarah Johnson
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AccountOverview account={selectedAccount} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView account={selectedAccount} />
          </TabsContent>

          <TabsContent value="relationships">
            <RelationshipsView account={selectedAccount} />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsView account={selectedAccount} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Account Management</h1>
          <p className="text-muted-foreground">
            Complete 360-degree customer intelligence with AI-powered insights
          </p>
        </div>
        <Button onClick={() => setShowAccountForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts by name, industry, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">Status:</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card 
            key={account.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAccountClick(account)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{account.company_name}</CardTitle>
                  <CardDescription>{account.industry}</CardDescription>
                </div>
                <Badge variant={account.account_status === 'active' ? 'default' : 'secondary'}>
                  {account.account_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span 
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClickableData('phone', account.phone, account)
                    }}
                  >
                    {account.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span 
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClickableData('email', account.email, account)
                    }}
                  >
                    {account.email}
                  </span>
                </div>
              </div>

              {/* Health Score */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Account Health</span>
                  <span className={`font-medium ${getHealthColor(mockAccountMetrics.ai_overall_health_score)}`}>
                    {mockAccountMetrics.ai_overall_health_score}%
                  </span>
                </div>
                <Progress value={mockAccountMetrics.ai_overall_health_score} className="h-2" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-medium">{account.total_deal_count}</div>
                  <div className="text-muted-foreground">Deals</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-medium">{formatCurrency(account.total_contract_value)}</div>
                  <div className="text-muted-foreground">Contract Value</div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Last activity: {formatDate(account.last_email_date)}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(account.ai_engagement_trend)}
                  <span className="text-muted-foreground">
                    {account.ai_engagement_trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">
              No accounts match your current search criteria.
            </p>
            <Button onClick={() => setShowAccountForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedAccountManagement