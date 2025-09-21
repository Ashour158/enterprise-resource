import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AccountHistoryTimeline } from './AccountHistoryTimeline'
import { AccountEmailIntegration } from './AccountEmailIntegration'
import { AccountFinancialDashboard } from './AccountFinancialDashboard'
import { AccountActivityTracker } from './AccountActivityTracker'
import { AccountDocumentLibrary } from './AccountDocumentLibrary'
import { AccountInsightsDashboard } from './AccountInsightsDashboard'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { Contact, Deal, Activity, Quote, CRMFile } from '@/types/crm'
import { mockContacts, mockDeals, mockActivities } from '@/data/crmMockData'
import { 
  ArrowLeft,
  PencilSimple as Edit,
  Star,
  StarFill,
  Heart,
  HeartFill,
  Warning,
  TrendUp,
  TrendDown,
  Buildings,
  Users,
  Globe,
  Phone,
  MapPin,
  EnvelopeSimple as Mail,
  Calendar,
  CurrencyDollar as DollarSign,
  ChartLine,
  FileText,
  ClockClockwise as History,
  Shield,
  LinkSimple as Link,
  Tag,
  Bell,
  CheckCircle,
  XCircle,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EnhancedAccountHistoryEntry {
  id: string
  accountId: string
  type: 'created' | 'updated' | 'email_sent' | 'email_received' | 'meeting_held' | 'quote_sent' | 'quote_accepted' | 'deal_won' | 'deal_lost' | 'payment_received' | 'support_ticket' | 'document_shared' | 'contact_added' | 'status_changed'
  title: string
  description: string
  metadata: {
    amount?: number
    contactId?: string
    dealId?: string
    quoteId?: string
    documentId?: string
    oldValue?: any
    newValue?: any
    relatedData?: any
  }
  performedBy: string
  performedAt: string
  visibility: 'public' | 'internal' | 'admin'
  tags: string[]
}

interface EnhancedAccount {
  id: string
  companyId: string
  name: string
  website?: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  revenue?: number
  employees?: number
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  phone?: string
  description?: string
  parentAccountId?: string
  accountType: 'prospect' | 'customer' | 'partner' | 'vendor' | 'competitor'
  status: 'active' | 'inactive' | 'churned'
  owner: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
  totalRevenue: number
  lastActivityDate?: string
  nextReviewDate?: string
  healthScore: number
  relationshipStrength: 'cold' | 'warm' | 'hot'
  churnRisk: 'low' | 'medium' | 'high'
  growthPotential: 'low' | 'medium' | 'high'
  communicationPreferences: {
    preferredChannel: 'email' | 'phone' | 'meeting'
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
    bestTimeToContact: string
    timezone: string
  }
  hierarchy: {
    parentAccountId?: string
    subsidiaryIds: string[]
    isHeadquarters: boolean
  }
  financials: {
    totalLifetimeValue: number
    annualRecurringRevenue: number
    averageDealSize: number
    paymentTerms: string
    creditRating?: string
    invoiceCount: number
    outstandingBalance: number
  }
  social: {
    linkedinUrl?: string
    twitterHandle?: string
    facebookPage?: string
    youtubeChannel?: string
  }
  compliance: {
    dataRetentionPeriod: number
    gdprCompliant: boolean
    hipaaRequired: boolean
    lastComplianceReview?: string
  }
  integrations: {
    crmId?: string
    erpId?: string
    marketingAutomationId?: string
    supportSystemId?: string
    billingSystemId?: string
  }
  history: EnhancedAccountHistoryEntry[]
  insights: {
    aiScore: number
    riskFactors: string[]
    opportunities: string[]
    recommendations: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    engagementTrend: 'increasing' | 'stable' | 'decreasing'
  }
}

interface AccountProfilePageProps {
  account: EnhancedAccount
  companyId: string
  userId: string
  userRole: string
  onClose: () => void
  onEdit: (account: EnhancedAccount) => void
  onUpdate: (account: EnhancedAccount) => void
}

export function AccountProfilePage({
  account,
  companyId,
  userId,
  userRole,
  onClose,
  onEdit,
  onUpdate
}: AccountProfilePageProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`account-contacts-${account.id}`, [])
  const [deals, setDeals] = useKV<Deal[]>(`account-deals-${account.id}`, [])
  const [activities, setActivities] = useKV<Activity[]>(`account-activities-${account.id}`, [])
  const [quotes, setQuotes] = useKV<Quote[]>(`account-quotes-${account.id}`, [])
  const [documents, setDocuments] = useKV<CRMFile[]>(`account-documents-${account.id}`, [])
  const [isWatching, setIsWatching] = useKV(`account-watching-${account.id}-${userId}`, false)
  const [isFavorite, setIsFavorite] = useKV(`account-favorite-${account.id}-${userId}`, false)
  const [activeTab, setActiveTab] = useState('overview')

  // Generate related data on first load
  useEffect(() => {
    if (contacts.length === 0) {
      const relatedContacts = mockContacts.filter(c => c.accountId === account.id)
      setContacts(relatedContacts)
    }
    if (deals.length === 0) {
      const relatedDeals = mockDeals.filter(d => d.accountId === account.id)
      setDeals(relatedDeals)
    }
    if (activities.length === 0) {
      const relatedActivities = mockActivities.filter(a => a.accountId === account.id)
      setActivities(relatedActivities)
    }
  }, [account.id, contacts.length, deals.length, activities.length, setContacts, setDeals, setActivities])

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="text-green-600" size={16} />
      case 'negative': return <XCircle className="text-red-600" size={16} />
      default: return <Info className="text-yellow-600" size={16} />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp className="text-green-600" size={16} />
      case 'decreasing': return <TrendDown className="text-red-600" size={16} />
      default: return <div className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft size={16} className="mr-2" />
                Back to Accounts
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=0066cc&color=fff`} />
                  <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{account.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={account.accountType === 'customer' ? 'default' : 'secondary'}>
                      {account.accountType}
                    </Badge>
                    <Badge variant="outline">{account.size}</Badge>
                    <Badge variant="outline">{account.industry}</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsWatching(!isWatching)}
                className={isWatching ? 'text-blue-600' : ''}
              >
                <Bell size={16} className="mr-2" />
                {isWatching ? 'Watching' : 'Watch'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? 'text-yellow-600' : ''}
              >
                {isFavorite ? <StarFill size={16} /> : <Star size={16} />}
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
                <Edit size={16} className="mr-2" />
                Edit Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Score Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className={account.healthScore >= 80 ? 'text-green-600' : account.healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'} size={20} />
                  Account Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(account.healthScore)}`}>
                    {account.healthScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                  <Progress value={account.healthScore} className="mt-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Relationship</span>
                    <Badge variant={account.relationshipStrength === 'hot' ? 'default' : 'outline'}>
                      {account.relationshipStrength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Churn Risk</span>
                    <Badge variant={account.churnRisk === 'high' ? 'destructive' : account.churnRisk === 'medium' ? 'secondary' : 'outline'}>
                      {account.churnRisk}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Potential</span>
                    <Badge variant={account.growthPotential === 'high' ? 'default' : 'outline'}>
                      {account.growthPotential}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(account.insights.sentiment)}
                    <span className="text-sm">Sentiment: {account.insights.sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(account.insights.engagementTrend)}
                    <span className="text-sm">Engagement: {account.insights.engagementTrend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {account.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground" />
                    <ClickableDataElement
                      type="url"
                      value={account.website}
                      data={{ url: account.website }}
                      className="text-sm hover:text-primary"
                    />
                  </div>
                )}
                
                {account.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <ClickableDataElement
                      type="phone"
                      value={account.phone}
                      data={{ phone: account.phone, accountId: account.id }}
                      className="text-sm hover:text-primary"
                    />
                  </div>
                )}
                
                {account.address?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <ClickableDataElement
                      type="location"
                      value={`${account.address.city}, ${account.address.state || account.address.country}`}
                      data={account.address}
                      className="text-sm hover:text-primary"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <ClickableDataElement
                    type="user"
                    value={account.owner}
                    data={{ userId: account.owner }}
                    className="text-sm hover:text-primary"
                  />
                </div>

                {account.employees && (
                  <div className="flex items-center gap-2">
                    <Buildings size={16} className="text-muted-foreground" />
                    <span className="text-sm">{account.employees.toLocaleString()} employees</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lifetime Value</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(account.financials?.totalLifetimeValue || 0)}
                      data={account.financials}
                      className="text-sm font-semibold hover:text-primary"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annual Revenue</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(account.financials?.annualRecurringRevenue || 0)}
                      data={account.financials}
                      className="text-sm font-semibold hover:text-primary"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(account.financials?.averageDealSize || 0)}
                      data={account.financials}
                      className="text-sm font-semibold hover:text-primary"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Outstanding</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(account.financials?.outstandingBalance || 0)}
                      data={account.financials}
                      className={`text-sm font-semibold hover:text-primary ${account.financials?.outstandingBalance > 0 ? 'text-red-600' : ''}`}
                    />
                  </div>
                </div>
                
                {account.financials?.creditRating && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Credit Rating</span>
                      <Badge variant="outline">{account.financials.creditRating}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {account.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {account.tags.map((tag) => (
                      <ClickableDataElement
                        key={tag}
                        type="tag"
                        value={tag}
                        data={{ tag, accountId: account.id }}
                        render={(value) => (
                          <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer">
                            {value}
                          </Badge>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
                <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
                <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
                <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Open Deals</p>
                          <p className="text-2xl font-bold">{deals.filter(d => !['won', 'lost'].includes(d.stage.toLowerCase())).length}</p>
                        </div>
                        <ChartLine className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                          <p className="text-2xl font-bold">{contacts.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest interactions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {activities.slice(0, 10).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <ClickableDataElement
                                  type="activity"
                                  value={activity.subject}
                                  data={activity}
                                  className="font-medium hover:text-primary"
                                />
                                <Badge variant="outline" className="text-xs">
                                  {activity.type}
                                </Badge>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Calendar size={12} />
                                <ClickableDataElement
                                  type="date"
                                  value={formatDate(activity.startDate)}
                                  data={{ date: activity.startDate }}
                                  className="hover:text-primary"
                                />
                                <span>•</span>
                                <ClickableDataElement
                                  type="user"
                                  value={activity.assignedTo}
                                  data={{ userId: activity.assignedTo }}
                                  className="hover:text-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Open Deals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Open Deals</CardTitle>
                    <CardDescription>Active deals in the pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deals.filter(d => !['won', 'lost'].includes(d.stage.toLowerCase())).slice(0, 5).map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <ClickableDataElement
                              type="deal"
                              value={deal.name}
                              data={deal}
                              className="font-medium hover:text-primary"
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {deal.stage}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {deal.probability}% probability
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <ClickableDataElement
                              type="currency"
                              value={formatCurrency(deal.value)}
                              data={deal}
                              className="font-semibold hover:text-primary"
                            />
                            <div className="text-xs text-muted-foreground">
                              Close: {formatDate(deal.closeDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <AccountActivityTracker
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                  type="contacts"
                />
              </TabsContent>

              <TabsContent value="deals">
                <AccountActivityTracker
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                  type="deals"
                />
              </TabsContent>

              <TabsContent value="activities">
                <AccountActivityTracker
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                  type="activities"
                />
              </TabsContent>

              <TabsContent value="documents">
                <AccountDocumentLibrary
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                />
              </TabsContent>

              <TabsContent value="email">
                <AccountEmailIntegration
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                />
              </TabsContent>

              <TabsContent value="timeline">
                <AccountHistoryTimeline
                  accountId={account.id}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                />
              </TabsContent>

              <TabsContent value="insights">
                <AccountInsightsDashboard
                  account={account}
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}