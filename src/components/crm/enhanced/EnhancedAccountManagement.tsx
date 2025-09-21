import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AccountProfilePage } from './AccountProfilePage'
import { AccountHistoryTimeline } from './AccountHistoryTimeline'
import { AccountEmailIntegration } from './AccountEmailIntegration'
import { AccountFinancialDashboard } from './AccountFinancialDashboard'
import { AccountActivityTracker } from './AccountActivityTracker'
import { AccountDocumentLibrary } from './AccountDocumentLibrary'
import { AccountInsightsDashboard } from './AccountInsightsDashboard'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { Account, Contact, Deal, Activity, CRMFile } from '@/types/crm'
import { mockAccounts, mockContacts, mockDeals } from '@/data/crmMockData'
import { 
  Buildings, 
  Plus, 
  MagnifyingGlass as Search,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  Users,
  CurrencyDollar as DollarSign,
  ChartLine,
  MapPin,
  Globe,
  Phone,
  Tag,
  FileText,
  CalendarBlank as Calendar,
  ClockClockwise as History,
  EnvelopeSimple as Mail,
  Warning,
  TrendUp,
  Briefcase,
  Download,
  Upload,
  Heart,
  Star
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

interface EnhancedAccount extends Account {
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

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function EnhancedAccountManagement({ companyId, userId, userRole }: EnhancedAccountManagementProps) {
  const [accounts, setAccounts] = useKV<EnhancedAccount[]>(`enhanced-accounts-${companyId}`, [])
  const [selectedAccount, setSelectedAccount] = useState<EnhancedAccount | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [activeView, setActiveView] = useState<'grid' | 'table' | 'timeline'>('grid')
  const [showProfileView, setShowProfileView] = useState(false)
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  
  // Form data
  const [formData, setFormData] = useState<Partial<EnhancedAccount>>({})

  // Generate enhanced mock data on first load
  useEffect(() => {
    if (accounts.length === 0) {
      const enhancedAccounts = mockAccounts.map(account => enhanceAccountData(account))
      setAccounts(enhancedAccounts)
    }
  }, [accounts.length, setAccounts])

  const enhanceAccountData = (account: Account): EnhancedAccount => {
    return {
      ...account,
      healthScore: Math.floor(Math.random() * 100),
      relationshipStrength: ['cold', 'warm', 'hot'][Math.floor(Math.random() * 3)] as 'cold' | 'warm' | 'hot',
      churnRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      growthPotential: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      communicationPreferences: {
        preferredChannel: ['email', 'phone', 'meeting'][Math.floor(Math.random() * 3)] as 'email' | 'phone' | 'meeting',
        frequency: ['weekly', 'biweekly', 'monthly', 'quarterly'][Math.floor(Math.random() * 4)] as 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
        bestTimeToContact: '9:00 AM - 5:00 PM',
        timezone: 'America/New_York'
      },
      hierarchy: {
        subsidiaryIds: [],
        isHeadquarters: Math.random() > 0.7
      },
      financials: {
        totalLifetimeValue: Math.floor(Math.random() * 1000000) + 50000,
        annualRecurringRevenue: Math.floor(Math.random() * 500000) + 10000,
        averageDealSize: Math.floor(Math.random() * 50000) + 5000,
        paymentTerms: 'Net 30',
        creditRating: ['A+', 'A', 'B+', 'B', 'C'][Math.floor(Math.random() * 5)],
        invoiceCount: Math.floor(Math.random() * 50) + 1,
        outstandingBalance: Math.floor(Math.random() * 10000)
      },
      social: {
        linkedinUrl: `https://linkedin.com/company/${account.name.toLowerCase().replace(/\s+/g, '-')}`,
        twitterHandle: `@${account.name.replace(/\s+/g, '')}`,
      },
      compliance: {
        dataRetentionPeriod: 7,
        gdprCompliant: Math.random() > 0.3,
        hipaaRequired: Math.random() > 0.8,
        lastComplianceReview: '2024-01-15'
      },
      integrations: {
        crmId: `crm_${account.id}`,
        erpId: `erp_${account.id}`
      },
      history: generateAccountHistory(account.id),
      insights: {
        aiScore: Math.floor(Math.random() * 100),
        riskFactors: ['Payment delays', 'Reduced engagement', 'Competitor activity'].slice(0, Math.floor(Math.random() * 3) + 1),
        opportunities: ['Upsell opportunity', 'New product fit', 'Expansion potential'].slice(0, Math.floor(Math.random() * 3) + 1),
        recommendations: ['Schedule quarterly review', 'Introduce new features', 'Expand relationship'].slice(0, Math.floor(Math.random() * 3) + 1),
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative',
        engagementTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as 'increasing' | 'stable' | 'decreasing'
      }
    }
  }

  const generateAccountHistory = (accountId: string): EnhancedAccountHistoryEntry[] => {
    const historyTypes = [
      'email_sent', 'email_received', 'meeting_held', 'quote_sent', 
      'quote_accepted', 'deal_won', 'payment_received', 'support_ticket',
      'document_shared', 'contact_added', 'status_changed'
    ]
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `hist_${accountId}_${i}`,
      accountId,
      type: historyTypes[Math.floor(Math.random() * historyTypes.length)] as any,
      title: `Activity ${i + 1}`,
      description: `Description for activity ${i + 1}`,
      metadata: {
        amount: Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : undefined
      },
      performedBy: userId,
      performedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      visibility: 'public',
      tags: []
    }))
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.owner.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter
    const matchesSize = sizeFilter === 'all' || account.size === sizeFilter
    const matchesHealth = healthFilter === 'all' || 
      (healthFilter === 'high' && account.healthScore >= 80) ||
      (healthFilter === 'medium' && account.healthScore >= 50 && account.healthScore < 80) ||
      (healthFilter === 'low' && account.healthScore < 50)
    const matchesRisk = riskFilter === 'all' || account.churnRisk === riskFilter

    return matchesSearch && matchesType && matchesSize && matchesHealth && matchesRisk
  })

  const handleAccountClick = (account: EnhancedAccount) => {
    setSelectedAccount(account)
    setSelectedAccountId(account.id)
    setShowProfileView(true)
  }

  const handleCreateAccount = () => {
    setFormData({})
    setShowAccountForm(true)
  }

  const handleEditAccount = (account: EnhancedAccount) => {
    setFormData(account)
    setShowAccountForm(true)
  }

  const handleDeleteAccount = async (accountId: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== accountId)
    setAccounts(updatedAccounts)
    toast.success('Account deleted successfully')
  }

  const handleSaveAccount = async () => {
    if (!formData.name || !formData.industry) {
      toast.error('Please fill in required fields')
      return
    }

    const accountData: EnhancedAccount = {
      ...formData,
      id: formData.id || `acc_${Date.now()}`,
      companyId,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as EnhancedAccount

    if (!accountData.healthScore) {
      accountData.healthScore = 75
      accountData.relationshipStrength = 'warm'
      accountData.churnRisk = 'low'
      accountData.growthPotential = 'medium'
      accountData.history = []
      accountData.insights = {
        aiScore: 75,
        riskFactors: [],
        opportunities: [],
        recommendations: [],
        sentiment: 'neutral',
        engagementTrend: 'stable'
      }
    }

    if (formData.id) {
      const updatedAccounts = accounts.map(a => a.id === formData.id ? accountData : a)
      setAccounts(updatedAccounts)
      toast.success('Account updated successfully')
    } else {
      setAccounts([...accounts, accountData])
      toast.success('Account created successfully')
    }

    setShowAccountForm(false)
    setFormData({})
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return 'Healthy'
    if (score >= 50) return 'At Risk'
    return 'Critical'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (showProfileView && selectedAccount) {
    return (
      <AccountProfilePage
        account={selectedAccount}
        companyId={companyId}
        userId={userId}
        userRole={userRole}
        onClose={() => {
          setShowProfileView(false)
          setSelectedAccount(null)
          setSelectedAccountId(null)
        }}
        onEdit={(account) => {
          setFormData(account)
          setShowAccountForm(true)
          setShowProfileView(false)
        }}
        onUpdate={(updatedAccount) => {
          const updatedAccounts = accounts.map(a => 
            a.id === updatedAccount.id ? updatedAccount : a
          )
          setAccounts(updatedAccounts)
          setSelectedAccount(updatedAccount)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Account Management</h2>
          <p className="text-muted-foreground">
            Comprehensive account intelligence with complete historical tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateAccount} className="flex items-center gap-2">
            <Plus size={16} />
            Create Account
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload size={16} />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Accounts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Upload CSV File</Label>
                  <Input type="file" accept=".csv" />
                </div>
                <Button onClick={() => setShowImportDialog(false)}>
                  Import Accounts
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search accounts by name, industry, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Health Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="high">Healthy (80+)</SelectItem>
                <SelectItem value="medium">At Risk (50-79)</SelectItem>
                <SelectItem value="low">Critical (&lt;50)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Churn Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={activeView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('grid')}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={activeView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('table')}
                className="rounded-none"
              >
                Table
              </Button>
              <Button
                variant={activeView === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('timeline')}
                className="rounded-l-none"
              >
                Timeline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{filteredAccounts.length}</p>
              </div>
              <Buildings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy Accounts</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAccounts.filter(a => a.healthScore >= 80).length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAccounts.filter(a => a.churnRisk === 'high').length}
                </p>
              </div>
              <Warning className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${filteredAccounts.reduce((sum, a) => sum + (a.financials?.totalLifetimeValue || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Display */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleAccountClick(account)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      <ClickableDataElement
                        type="account"
                        value={account.name}
                        data={account}
                        onClick={() => handleAccountClick(account)}
                        className="hover:text-primary"
                      />
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <ClickableDataElement
                        type="industry"
                        value={account.industry}
                        data={account}
                        className="hover:text-primary"
                      />
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleAccountClick(account)
                      }}>
                        <Eye size={16} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleEditAccount(account)
                      }}>
                        <Edit size={16} className="mr-2" />
                        Edit Account
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAccount(account.id)
                        }}
                      >
                        <Trash size={16} className="mr-2" />
                        Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={account.accountType === 'customer' ? 'default' : 'secondary'}>
                    {account.accountType}
                  </Badge>
                  <Badge variant={account.size === 'enterprise' ? 'default' : 'outline'}>
                    {account.size}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Health Score</span>
                    <span className={`font-semibold ${getHealthScoreColor(account.healthScore)}`}>
                      {account.healthScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        account.healthScore >= 80 ? 'bg-green-500' :
                        account.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${account.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Revenue:</span>
                    <ClickableDataElement
                      type="currency"
                      value={`$${(account.financials?.totalLifetimeValue || 0).toLocaleString()}`}
                      data={account.financials}
                      className="font-semibold block"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk:</span>
                    <span className={`font-semibold block ${getRiskColor(account.churnRisk)}`}>
                      {account.churnRisk}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={14} />
                  <ClickableDataElement
                    type="user"
                    value={account.owner}
                    data={{ userId: account.owner }}
                    className="hover:text-primary"
                  />
                </div>

                {account.address?.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <ClickableDataElement
                      type="location"
                      value={`${account.address.city}, ${account.address.state || account.address.country}`}
                      data={account.address}
                      className="hover:text-primary"
                    />
                  </div>
                )}

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Account Dialog */}
      <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.id ? 'Edit Account' : 'Create New Account'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter account name"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry || ''} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select value={formData.size || ''} onValueChange={(value) => setFormData({ ...formData, size: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={formData.accountType || ''} onValueChange={(value) => setFormData({ ...formData, accountType: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="competitor">Competitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="owner">Account Owner</Label>
                  <Input
                    id="owner"
                    value={formData.owner || ''}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Account owner"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Account description..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={formData.employees || ''}
                    onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Street Address"
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value } 
                  })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="City"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value } 
                    })}
                  />
                  <Input
                    placeholder="State"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value } 
                    })}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value } 
                    })}
                  />
                </div>
                <Input
                  placeholder="Country"
                  value={formData.address?.country || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value } 
                  })}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue || ''}
                    onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="totalRevenue">Total Revenue</Label>
                  <Input
                    id="totalRevenue"
                    type="number"
                    value={formData.totalRevenue || ''}
                    onChange={(e) => setFormData({ ...formData, totalRevenue: parseInt(e.target.value) || 0 })}
                    placeholder="5000000"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="enterprise, priority, tech"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAccountForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAccount}>
              {formData.id ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}