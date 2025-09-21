import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Account, Contact, Deal, CRMFile, AccountActivity, AIInsight } from '@/types/crm'
import { 
  Plus, 
  MagnifyingGlass as Search, 
  Download, 
  Upload, 
  Building,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  Users,
  CurrencyDollar as DollarSign,
  MapPin,
  Tag,
  FileText,
  Paperclip,
  Phone,
  EnvelopeSimple as Mail,
  Globe,
  Calendar,
  TrendUp,
  TrendDown,
  Brain,
  Clock,
  Warning,
  CheckCircle,
  Target,
  Lightning,
  ChatCircle,
  Handshake,
  Star,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Filter,
  SortAscending,
  SortDescending,
  ChartLine,
  Activity,
  Heart,
  VideoCamera,
  LinkSimple,
  Export,
  ListBullets,
  GridFour,
  Funnel
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ClickableElement } from '@/components/shared/ClickableElement'

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
  onAccountSelect?: (account: Account) => void
}

// Enhanced Account type with AI scoring and analytics
interface EnhancedAccount extends Account {
  healthScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  engagementLevel: 'high' | 'medium' | 'low'
  growthPotential: number
  churnRisk: number
  lifetimeValue: number
  satisfaction: number
  contactsCount: number
  dealsCount: number
  openOpportunities: number
  lastEngagement: string
  nextAction: string
  accountManager: string
  territory: string
  source: string
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  documents: CRMFile[]
  activities: AccountActivity[]
  aiInsights: AIInsight[]
}

const mockEnhancedAccounts: EnhancedAccount[] = [
  {
    id: 'acc-001',
    companyId: 'comp-001',
    name: 'TechFlow Solutions Inc',
    website: 'https://techflow.com',
    industry: 'Technology',
    size: 'medium',
    revenue: 5000000,
    employees: 150,
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    phone: '+1-555-0123',
    description: 'Leading AI-powered software solutions provider specializing in enterprise automation',
    accountType: 'customer',
    status: 'active',
    owner: 'user-001',
    tags: ['enterprise', 'technology', 'ai', 'strategic'],
    customFields: {
      vertical: 'SaaS',
      priority: 'high',
      segment: 'enterprise',
      contract_value: '$500K',
      renewal_date: '2024-12-15'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    totalRevenue: 750000,
    lastActivityDate: '2024-01-18T14:20:00Z',
    nextReviewDate: '2024-02-15T10:00:00Z',
    healthScore: 92,
    riskLevel: 'low',
    engagementLevel: 'high',
    growthPotential: 85,
    churnRisk: 8,
    lifetimeValue: 2500000,
    satisfaction: 4.8,
    contactsCount: 12,
    dealsCount: 8,
    openOpportunities: 3,
    lastEngagement: '2024-01-18T14:20:00Z',
    nextAction: 'Quarterly Business Review scheduled for Feb 15',
    accountManager: 'Sarah Johnson',
    territory: 'West Coast',
    source: 'Referral',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techflow',
      twitter: 'https://twitter.com/techflow'
    },
    documents: [],
    activities: [],
    aiInsights: []
  },
  {
    id: 'acc-002',
    companyId: 'comp-001',
    name: 'Global Manufacturing Corp',
    website: 'https://globalmanufacturing.com',
    industry: 'Manufacturing',
    size: 'large',
    revenue: 50000000,
    employees: 2500,
    address: {
      street: '789 Industrial Blvd',
      city: 'Detroit',
      state: 'MI',
      country: 'USA',
      zipCode: '48201'
    },
    phone: '+1-555-0789',
    description: 'Fortune 500 manufacturing company with global operations',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-002',
    tags: ['fortune500', 'manufacturing', 'global', 'high-value'],
    customFields: {
      vertical: 'Manufacturing',
      priority: 'high',
      segment: 'enterprise',
      potential_value: '$2M',
      decision_timeline: 'Q2 2024'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    totalRevenue: 0,
    lastActivityDate: '2024-01-20T16:30:00Z',
    nextReviewDate: '2024-02-10T09:00:00Z',
    healthScore: 68,
    riskLevel: 'medium',
    engagementLevel: 'medium',
    growthPotential: 95,
    churnRisk: 25,
    lifetimeValue: 8000000,
    satisfaction: 3.9,
    contactsCount: 18,
    dealsCount: 2,
    openOpportunities: 5,
    lastEngagement: '2024-01-20T16:30:00Z',
    nextAction: 'Product demo scheduled for next week',
    accountManager: 'Michael Chen',
    territory: 'Midwest',
    source: 'Trade Show',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/globalmanufacturing'
    },
    documents: [],
    activities: [],
    aiInsights: []
  },
  {
    id: 'acc-003',
    companyId: 'comp-001',
    name: 'HealthTech Innovations',
    website: 'https://healthtech-innovations.com',
    industry: 'Healthcare',
    size: 'medium',
    revenue: 8000000,
    employees: 180,
    address: {
      street: '456 Medical Center Dr',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      zipCode: '02115'
    },
    phone: '+1-555-0456',
    description: 'Healthcare technology startup revolutionizing patient care through AI',
    accountType: 'customer',
    status: 'active',
    owner: 'user-003',
    tags: ['healthcare', 'ai', 'startup', 'innovation'],
    customFields: {
      vertical: 'HealthTech',
      priority: 'medium',
      segment: 'mid-market',
      contract_value: '$150K',
      expansion_opportunity: 'High'
    },
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-19T09:15:00Z',
    totalRevenue: 320000,
    lastActivityDate: '2024-01-17T11:45:00Z',
    nextReviewDate: '2024-02-20T14:00:00Z',
    healthScore: 45,
    riskLevel: 'high',
    engagementLevel: 'low',
    growthPotential: 70,
    churnRisk: 60,
    lifetimeValue: 1200000,
    satisfaction: 3.2,
    contactsCount: 8,
    dealsCount: 3,
    openOpportunities: 1,
    lastEngagement: '2024-01-17T11:45:00Z',
    nextAction: 'Urgent: Schedule retention call within 48 hours',
    accountManager: 'Jennifer Davis',
    territory: 'Northeast',
    source: 'Website',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/healthtech-innovations',
      twitter: 'https://twitter.com/healthtechinno'
    },
    documents: [],
    activities: [],
    aiInsights: []
  }
]

const accountTypes = [
  { value: 'prospect', label: 'Prospect', color: 'bg-yellow-500' },
  { value: 'customer', label: 'Customer', color: 'bg-green-500' },
  { value: 'partner', label: 'Partner', color: 'bg-blue-500' },
  { value: 'vendor', label: 'Vendor', color: 'bg-purple-500' },
  { value: 'competitor', label: 'Competitor', color: 'bg-red-500' }
]

const accountSizes = ['startup', 'small', 'medium', 'large', 'enterprise']
const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Marketing', 'Consulting']

export function EnhancedAccountManagement({ companyId, userId, userRole, onAccountSelect }: EnhancedAccountManagementProps) {
  const [accounts, setAccounts] = useKV<EnhancedAccount[]>(`enhanced-accounts-${companyId}`, mockEnhancedAccounts)
  const [selectedAccount, setSelectedAccount] = useState<EnhancedAccount | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [engagementFilter, setEngagementFilter] = useState('all')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [showFullProfile, setShowFullProfile] = useState(false)
  const [formData, setFormData] = useState<Partial<EnhancedAccount>>({})

  // AI-powered insights for accounts
  const generateAIInsights = async (account: EnhancedAccount) => {
    try {
      const prompt = spark.llmPrompt`
        Analyze this account and provide actionable insights:
        
        Account: ${account.name}
        Industry: ${account.industry}
        Health Score: ${account.healthScore}
        Risk Level: ${account.riskLevel}
        Engagement: ${account.engagementLevel}
        Last Activity: ${account.lastActivityDate}
        Total Revenue: ${account.totalRevenue}
        Churn Risk: ${account.churnRisk}%
        
        Provide specific recommendations for:
        1. Immediate actions needed
        2. Expansion opportunities
        3. Risk mitigation strategies
        4. Engagement improvement tactics
        
        Format as JSON with actionable insights.
      `
      
      const insights = await spark.llm(prompt, 'gpt-4o', true)
      const parsedInsights = JSON.parse(insights)
      
      // Update account with AI insights
      setAccounts(current => {
        if (!current) return []
        return current.map(acc =>
          acc.id === account.id
            ? { ...acc, aiInsights: parsedInsights.insights || [] }
            : acc
        )
      })
      
      toast.success('AI insights generated successfully')
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights')
    }
  }

  const filteredAccounts = (accounts || []).filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.website && account.website.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter
    const matchesSize = sizeFilter === 'all' || account.size === sizeFilter
    const matchesRisk = riskFilter === 'all' || account.riskLevel === riskFilter
    const matchesEngagement = engagementFilter === 'all' || account.engagementLevel === engagementFilter
    
    return matchesSearch && matchesType && matchesSize && matchesRisk && matchesEngagement
  }).sort((a, b) => {
    const aValue = a[sortField as keyof EnhancedAccount] || ''
    const bValue = b[sortField as keyof EnhancedAccount] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleCreateAccount = () => {
    if (!formData.name || !formData.industry) {
      toast.error('Please fill in required fields')
      return
    }

    const newAccount: EnhancedAccount = {
      id: `acc-${Date.now()}`,
      companyId,
      name: formData.name,
      website: formData.website,
      industry: formData.industry,
      size: formData.size || 'small',
      revenue: formData.revenue,
      employees: formData.employees,
      address: formData.address || {},
      phone: formData.phone,
      description: formData.description,
      accountType: formData.accountType || 'prospect',
      status: 'active',
      owner: userId,
      tags: formData.tags || [],
      customFields: formData.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRevenue: 0,
      lastActivityDate: undefined,
      nextReviewDate: undefined,
      healthScore: 50,
      riskLevel: 'medium',
      engagementLevel: 'medium',
      growthPotential: 50,
      churnRisk: 30,
      lifetimeValue: 0,
      satisfaction: 3.0,
      contactsCount: 0,
      dealsCount: 0,
      openOpportunities: 0,
      lastEngagement: new Date().toISOString(),
      nextAction: 'Initial outreach required',
      accountManager: 'Unassigned',
      territory: 'Unassigned',
      source: 'Manual Entry',
      socialMedia: {},
      documents: [],
      activities: [],
      aiInsights: []
    }

    setAccounts(current => [...(current || []), newAccount])
    setFormData({})
    setShowAccountForm(false)
    toast.success('Account created successfully')
  }

  const handleBulkExport = () => {
    const csvContent = [
      ['Name', 'Industry', 'Type', 'Size', 'Revenue', 'Health Score', 'Risk Level', 'Engagement', 'Account Manager', 'Total Revenue'],
      ...filteredAccounts.map(account => [
        account.name,
        account.industry,
        account.accountType,
        account.size,
        account.revenue?.toString() || '',
        account.healthScore.toString(),
        account.riskLevel,
        account.engagementLevel,
        account.accountManager,
        account.totalRevenue.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-accounts-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Accounts exported successfully')
  }

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(revenue)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAccountClick = (account: EnhancedAccount) => {
    setSelectedAccount(account)
    setShowFullProfile(true)
    onAccountSelect?.(account)
  }

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(current =>
      current.includes(accountId)
        ? current.filter(id => id !== accountId)
        : [...current, accountId]
    )
  }

  const selectAllAccounts = () => {
    setSelectedAccounts(filteredAccounts.map(acc => acc.id))
  }

  const clearSelection = () => {
    setSelectedAccounts([])
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{formatNumber(filteredAccounts.length)}</p>
              </div>
              <Building size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatRevenue(filteredAccounts.reduce((sum, acc) => sum + acc.totalRevenue, 0))}
                </p>
              </div>
              <DollarSign size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredAccounts.reduce((sum, acc) => sum + acc.healthScore, 0) / filteredAccounts.length)}
                </p>
              </div>
              <Heart size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Accounts</p>
                <p className="text-2xl font-bold">
                  {filteredAccounts.filter(acc => acc.riskLevel === 'high' || acc.riskLevel === 'critical').length}
                </p>
              </div>
              <Warning size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {accountTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={engagementFilter} onValueChange={setEngagementFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engagement</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <ListBullets size={16} />
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <GridFour size={16} />
            </Button>
            
            <Button variant="outline" onClick={handleBulkExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            
            <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  New Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Enhanced Account</DialogTitle>
                </DialogHeader>
                {/* Enhanced form content here */}
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                  {/* Add more form fields as needed */}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAccountForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAccount}>
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAccounts.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm">{selectedAccounts.length} accounts selected</span>
            <Button size="sm" variant="outline">
              <Mail size={16} className="mr-2" />
              Send Email
            </Button>
            <Button size="sm" variant="outline">
              <Tag size={16} className="mr-2" />
              Add Tags
            </Button>
            <Button size="sm" variant="outline">
              <Users size={16} className="mr-2" />
              Assign Owner
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Accounts Display */}
      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Accounts ({filteredAccounts.length})</CardTitle>
            <CardDescription>
              AI-powered account management with health scoring and risk analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAccounts.length === filteredAccounts.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllAccounts()
                        } else {
                          clearSelection()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type & Health</TableHead>
                  <TableHead>Revenue & Value</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => toggleAccountSelection(account.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleAccountClick(account)}>
                      <ClickableElement type="company" data={account}>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Building size={16} />
                            {account.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{account.industry}</div>
                          {account.website && (
                            <ClickableElement type="website" data={account.website}>
                              <div className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Globe size={12} />
                                {account.website.replace('https://', '')}
                              </div>
                            </ClickableElement>
                          )}
                        </div>
                      </ClickableElement>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className={accountTypes.find(t => t.value === account.accountType)?.color + ' text-white'}>
                          {accountTypes.find(t => t.value === account.accountType)?.label}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getHealthScoreColor(account.healthScore)}`}>
                            {account.healthScore}%
                          </span>
                          <Progress value={account.healthScore} className="w-16 h-2" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <ClickableElement type="currency" data={account.totalRevenue}>
                          <div className="font-medium">{formatRevenue(account.totalRevenue)}</div>
                        </ClickableElement>
                        <div className="text-sm text-muted-foreground">
                          LTV: {formatRevenue(account.lifetimeValue)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getEngagementColor(account.engagementLevel)}>
                          {account.engagementLevel}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {account.contactsCount} contacts
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelColor(account.riskLevel)}>
                        {account.riskLevel}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {account.churnRisk}% churn risk
                      </div>
                    </TableCell>
                    <TableCell>
                      <ClickableElement type="user" data={account.accountManager}>
                        <div>
                          <div className="font-medium">{account.accountManager}</div>
                          <div className="text-sm text-muted-foreground">{account.territory}</div>
                        </div>
                      </ClickableElement>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleAccountClick(account)}>
                            <Eye size={14} className="mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={14} className="mr-2" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generateAIInsights(account)}>
                            <Brain size={14} className="mr-2" />
                            Generate AI Insights
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone size={14} className="mr-2" />
                            Call Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail size={14} className="mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar size={14} className="mr-2" />
                            Schedule Meeting
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAccountClick(account)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building size={18} />
                      {account.name}
                    </CardTitle>
                    <CardDescription>{account.industry}</CardDescription>
                  </div>
                  <Checkbox
                    checked={selectedAccounts.includes(account.id)}
                    onCheckedChange={() => toggleAccountSelection(account.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={accountTypes.find(t => t.value === account.accountType)?.color + ' text-white'}>
                    {accountTypes.find(t => t.value === account.accountType)?.label}
                  </Badge>
                  <Badge className={getRiskLevelColor(account.riskLevel)}>
                    {account.riskLevel} risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getHealthScoreColor(account.healthScore)}`}>
                      {account.healthScore}%
                    </span>
                    <Progress value={account.healthScore} className="w-16 h-2" />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">{formatRevenue(account.totalRevenue)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <Badge className={getEngagementColor(account.engagementLevel)}>
                    {account.engagementLevel}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Manager</span>
                  <span className="font-medium">{account.accountManager}</span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">{account.nextAction}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Profile Dialog */}
      {selectedAccount && showFullProfile && (
        <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building size={24} />
                {selectedAccount.name}
                <Badge className={getRiskLevelColor(selectedAccount.riskLevel)}>
                  {selectedAccount.riskLevel} risk
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="h-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({selectedAccount.contactsCount})</TabsTrigger>
                <TabsTrigger value="deals">Deals ({selectedAccount.dealsCount})</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-3 gap-6">
                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Key Metrics</h3>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Health Score</span>
                          <span className={`font-bold ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                            {selectedAccount.healthScore}%
                          </span>
                        </div>
                        <Progress value={selectedAccount.healthScore} className="h-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Satisfaction</span>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" />
                            <span className="font-bold">{selectedAccount.satisfaction}/5.0</span>
                          </div>
                        </div>
                        <Progress value={selectedAccount.satisfaction * 20} className="h-2" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Growth Potential</span>
                            <span className="font-medium">{selectedAccount.growthPotential}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Churn Risk</span>
                            <span className="font-medium text-red-600">{selectedAccount.churnRisk}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Lifetime Value</span>
                            <span className="font-medium">{formatRevenue(selectedAccount.lifetimeValue)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Company Information</h3>
                    
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Industry</span>
                          <p className="font-medium">{selectedAccount.industry}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Company Size</span>
                          <p className="font-medium">{selectedAccount.size}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Employees</span>
                          <p className="font-medium">{formatNumber(selectedAccount.employees || 0)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Annual Revenue</span>
                          <p className="font-medium">{formatRevenue(selectedAccount.revenue)}</p>
                        </div>
                        {selectedAccount.website && (
                          <div>
                            <span className="text-sm text-muted-foreground">Website</span>
                            <ClickableElement type="website" data={selectedAccount.website}>
                              <p className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                                <Globe size={14} />
                                {selectedAccount.website}
                              </p>
                            </ClickableElement>
                          </div>
                        )}
                        {selectedAccount.phone && (
                          <div>
                            <span className="text-sm text-muted-foreground">Phone</span>
                            <ClickableElement type="phone" data={selectedAccount.phone}>
                              <p className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                                <Phone size={14} />
                                {selectedAccount.phone}
                              </p>
                            </ClickableElement>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {selectedAccount.address && Object.keys(selectedAccount.address).length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <span className="text-sm text-muted-foreground">Address</span>
                          <ClickableElement type="address" data={selectedAccount.address}>
                            <div className="mt-1 text-blue-600 hover:underline cursor-pointer">
                              {selectedAccount.address.street && <div>{selectedAccount.address.street}</div>}
                              {(selectedAccount.address.city || selectedAccount.address.state) && (
                                <div>
                                  {selectedAccount.address.city}{selectedAccount.address.city && selectedAccount.address.state && ', '}{selectedAccount.address.state} {selectedAccount.address.zipCode}
                                </div>
                              )}
                              {selectedAccount.address.country && <div>{selectedAccount.address.country}</div>}
                            </div>
                          </ClickableElement>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Account Management */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Account Management</h3>
                    
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Account Manager</span>
                          <ClickableElement type="user" data={selectedAccount.accountManager}>
                            <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {selectedAccount.accountManager}
                            </p>
                          </ClickableElement>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Territory</span>
                          <p className="font-medium">{selectedAccount.territory}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Source</span>
                          <p className="font-medium">{selectedAccount.source}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Created</span>
                          <ClickableElement type="date" data={selectedAccount.createdAt}>
                            <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {new Date(selectedAccount.createdAt).toLocaleDateString()}
                            </p>
                          </ClickableElement>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Last Activity</span>
                          <ClickableElement type="date" data={selectedAccount.lastActivityDate}>
                            <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {selectedAccount.lastActivityDate ? new Date(selectedAccount.lastActivityDate).toLocaleDateString() : 'No activity'}
                            </p>
                          </ClickableElement>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <span className="text-sm text-muted-foreground">Next Action</span>
                        <p className="font-medium mt-1">{selectedAccount.nextAction}</p>
                        <Button size="sm" className="mt-3 w-full">
                          <Calendar size={14} className="mr-2" />
                          Schedule Follow-up
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {selectedAccount.tags.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <span className="text-sm text-muted-foreground">Tags</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedAccount.tags.map((tag, index) => (
                              <ClickableElement key={index} type="tag" data={tag}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                  <Tag size={12} className="mr-1" />
                                  {tag}
                                </Badge>
                              </ClickableElement>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts">
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Contact management will be integrated here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="deals">
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Deal pipeline will be integrated here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="activities">
                <div className="text-center py-8 text-muted-foreground">
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Activity timeline will be integrated here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Document management will be integrated here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI-Powered Insights</h3>
                    <Button onClick={() => generateAIInsights(selectedAccount)}>
                      <Brain size={16} className="mr-2" />
                      Generate New Insights
                    </Button>
                  </div>
                  
                  {selectedAccount.aiInsights.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAccount.aiInsights.map((insight, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Brain size={20} className="text-blue-600 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium">{insight.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                                {insight.actions && (
                                  <div className="flex gap-2 mt-3">
                                    {insight.actions.map((action, actionIndex) => (
                                      <Button key={actionIndex} size="sm" variant="outline">
                                        {action}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No AI insights generated yet</p>
                      <p className="text-sm">Click "Generate New Insights" to analyze this account</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}