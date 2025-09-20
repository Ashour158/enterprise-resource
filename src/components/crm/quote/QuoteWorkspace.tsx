import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { QuoteList } from './QuoteList'
import { QuoteEditor } from './QuoteEditor'
import { QuoteNumberingConfig } from './QuoteNumberingConfig'
import { 
  QuoteTemplateManager, 
  QuoteSettingsPanel, 
  QuoteCustomActions, 
  QuoteAIAssistant, 
  QuoteExportSystem 
} from './QuoteModules'
import { Account, Contact, Quote, QuoteNumberingConfig as NumberingConfig, QuoteTemplate } from '@/types/crm'
import { mockAccounts } from '@/data/crmMockData'
import { 
  Plus, 
  Receipt, 
  Gear, 
  Brain, 
  FileText, 
  Template, 
  NumberCircleOne,
  Palette,
  EnvelopeSimple as Mail,
  Download,
  MagnifyingGlass as Search,
  FileDoc,
  FilePdf,
  FloppyDisk,
  Sparkle,
  ListBullets,
  PencilSimple as Edit
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteWorkspaceProps {
  companyId: string
  userId: string
  userRole: string
}

// Mock data for quotes with proper structure
const mockQuotes: Quote[] = [
  {
    id: 'quote-001',
    companyId: 'comp-001',
    quoteNumber: 'Q-2024-0001',
    accountId: 'acc-001',
    contactId: 'contact-001',
    dealId: 'deal-001',
    title: 'Enterprise Software Package',
    description: 'Complete enterprise software solution with support',
    status: 'sent',
    validUntil: new Date('2024-03-15'),
    currency: 'USD',
    subtotal: 85000,
    taxRate: 8.5,
    taxAmount: 7225,
    discountRate: 5,
    discountAmount: 4250,
    totalAmount: 87975,
    terms: 'Net 30 days. Quote valid for 30 days from issue date.',
    notes: 'Includes installation, training, and first-year support',
    customFields: {
      priority: 'high',
      paymentTerms: 'net30',
      deliveryDate: '2024-04-01'
    },
    templateId: 'template-enterprise',
    lineItems: [
      {
        id: 'item-001',
        productId: 'prod-001',
        name: 'Enterprise License',
        description: 'Annual license for up to 500 users',
        quantity: 1,
        unitPrice: 60000,
        discount: 5,
        discountAmount: 3000,
        lineTotal: 57000,
        order: 1,
        customFields: {}
      },
      {
        id: 'item-002',
        productId: 'prod-002',
        name: 'Professional Services',
        description: 'Implementation and training services',
        quantity: 40,
        unitPrice: 750,
        discount: 0,
        discountAmount: 0,
        lineTotal: 30000,
        order: 2,
        customFields: {}
      }
    ],
    assignedTo: 'user-001',
    lastModified: new Date(),
    createdAt: new Date('2024-01-15'),
    createdBy: 'user-001',
    attachments: [],
    approvalStatus: 'pending',
    version: 1,
    emailHistory: [],
    activities: []
  }
]

// Mock contacts with account relationships
const mockContacts: Contact[] = [
  {
    id: 'contact-001',
    companyId: 'comp-001',
    accountId: 'acc-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techsolutions.com',
    phone: '+1-555-0123',
    jobTitle: 'CTO',
    status: 'active',
    leadScore: 85,
    source: 'website',
    tags: ['decision-maker', 'technical'],
    customFields: {},
    assignedTo: 'user-001',
    lastActivity: new Date(),
    createdAt: new Date(),
    lastModified: new Date()
  },
  {
    id: 'contact-002',
    companyId: 'comp-001',
    accountId: 'acc-002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@globalcorp.com',
    phone: '+1-555-0124',
    jobTitle: 'VP of Operations',
    status: 'active',
    leadScore: 92,
    source: 'referral',
    tags: ['decision-maker', 'budget-holder'],
    customFields: {},
    assignedTo: 'user-001',
    lastActivity: new Date(),
    createdAt: new Date(),
    lastModified: new Date()
  }
]

// Default numbering configuration
const defaultNumberingConfig: NumberingConfig = {
  id: 'numbering-001',
  companyId: 'comp-001',
  prefix: 'Q',
  year: new Date().getFullYear(),
  nextNumber: 1,
  digits: 4,
  separator: '-',
  format: '{prefix}-{year}-{number}',
  resetYearly: true,
  isActive: true,
  createdAt: new Date(),
  lastModified: new Date()
}

export function QuoteWorkspace({ companyId, userId, userRole }: QuoteWorkspaceProps) {
  const [quotes, setQuotes] = useKV<Quote[]>(`quotes-${companyId}`, mockQuotes)
  const [accounts] = useKV<Account[]>(`accounts-${companyId}`, mockAccounts)
  const [contacts] = useKV<Contact[]>(`contacts-${companyId}`, mockContacts)
  const [numberingConfig, setNumberingConfig] = useKV<NumberingConfig>(`quote-numbering-${companyId}`, defaultNumberingConfig)
  const [activeTab, setActiveTab] = useState('quotes')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Generate next quote number
  const generateQuoteNumber = (): string => {
    const config = numberingConfig || defaultNumberingConfig
    const currentYear = new Date().getFullYear()
    
    // Reset counter if yearly reset is enabled and year changed
    if (config.resetYearly && config.year !== currentYear) {
      const updatedConfig = {
        ...config,
        year: currentYear,
        nextNumber: 1
      }
      setNumberingConfig(updatedConfig)
      return formatQuoteNumber(updatedConfig, 1)
    }
    
    return formatQuoteNumber(config, config.nextNumber)
  }

  const formatQuoteNumber = (config: NumberingConfig, number: number): string => {
    const paddedNumber = number.toString().padStart(config.digits, '0')
    return config.format
      .replace('{prefix}', config.prefix)
      .replace('{year}', config.year.toString())
      .replace('{number}', paddedNumber)
  }

  const handleCreateQuote = () => {
    setSelectedQuote(null)
    setIsCreating(true)
    setActiveTab('editor')
  }

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsCreating(false)
    setActiveTab('editor')
  }

  const handleSaveQuote = (quoteData: Partial<Quote>) => {
    if (isCreating) {
      // Create new quote
      const newQuoteNumber = generateQuoteNumber()
      const config = numberingConfig || defaultNumberingConfig
      
      const newQuote: Quote = {
        id: `quote-${Date.now()}`,
        companyId,
        quoteNumber: newQuoteNumber,
        title: quoteData.title || 'New Quote',
        description: quoteData.description || '',
        status: 'draft',
        validUntil: quoteData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        currency: quoteData.currency || 'USD',
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        totalAmount: 0,
        terms: quoteData.terms || 'Net 30 days',
        notes: quoteData.notes || '',
        customFields: quoteData.customFields || {},
        templateId: quoteData.templateId,
        lineItems: [],
        assignedTo: userId,
        lastModified: new Date(),
        createdAt: new Date(),
        createdBy: userId,
        attachments: [],
        approvalStatus: 'pending',
        version: 1,
        emailHistory: [],
        activities: [],
        accountId: quoteData.accountId,
        contactId: quoteData.contactId,
        dealId: quoteData.dealId,
        ...quoteData
      }

      const updatedQuotes = [...(quotes || []), newQuote]
      setQuotes(updatedQuotes)
      
      // Update numbering config
      setNumberingConfig({
        ...config,
        nextNumber: config.nextNumber + 1,
        lastModified: new Date()
      })
      
      toast.success(`Quote ${newQuoteNumber} created successfully`)
      setActiveTab('quotes')
    } else if (selectedQuote) {
      // Update existing quote
      const updatedQuotes = (quotes || []).map(quote =>
        quote.id === selectedQuote.id
          ? { ...quote, ...quoteData, lastModified: new Date(), version: quote.version + 1 }
          : quote
      )
      setQuotes(updatedQuotes)
      toast.success(`Quote ${selectedQuote.quoteNumber} updated successfully`)
      setActiveTab('quotes')
    }
  }

  const handleDeleteQuote = (quoteId: string) => {
    const updatedQuotes = (quotes || []).filter(quote => quote.id !== quoteId)
    setQuotes(updatedQuotes)
    toast.success('Quote deleted successfully')
  }

  const getQuoteStats = () => {
    const safeQuotes = quotes || []
    const total = safeQuotes.length
    const draft = safeQuotes.filter(q => q.status === 'draft').length
    const sent = safeQuotes.filter(q => q.status === 'sent').length
    const accepted = safeQuotes.filter(q => q.status === 'accepted').length
    const totalValue = safeQuotes.reduce((sum, q) => sum + q.totalAmount, 0)

    return { total, draft, sent, accepted, totalValue }
  }

  const stats = getQuoteStats()

  return (
    <div className="space-y-6">
      {/* Quote Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Quotes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Quote Management Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Quote Management System
              </CardTitle>
              <CardDescription>
                Comprehensive quote management with AI assistance, templates, and automation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateQuote} className="flex items-center gap-2">
                <Plus size={16} />
                Create Quote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <ListBullets size={16} />
                Quotes
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit size={16} />
                Editor
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Template size={16} />
                Templates
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Gear size={16} />
                Settings
              </TabsTrigger>
              <TabsTrigger value="numbering" className="flex items-center gap-2">
                <NumberCircleOne size={16} />
                Numbering
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Palette size={16} />
                Actions
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain size={16} />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search quotes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <QuoteList
                quotes={quotes || []}
                accounts={accounts || []}
                contacts={contacts || []}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onEdit={handleEditQuote}
                onDelete={handleDeleteQuote}
                onDuplicate={(quote) => {
                  const duplicatedQuote = {
                    ...quote,
                    id: `quote-${Date.now()}`,
                    quoteNumber: generateQuoteNumber(),
                    status: 'draft' as const,
                    createdAt: new Date(),
                    lastModified: new Date(),
                    version: 1
                  }
                  setQuotes([...(quotes || []), duplicatedQuote])
                  toast.success(`Quote duplicated as ${duplicatedQuote.quoteNumber}`)
                }}
              />
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <QuoteEditor
                companyId={companyId}
                userId={userId}
                userRole={userRole}
                quote={selectedQuote}
                accounts={accounts || []}
                contacts={contacts || []}
                isCreating={isCreating}
                onSave={handleSaveQuote}
                onCancel={() => setActiveTab('quotes')}
                generateQuoteNumber={generateQuoteNumber}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <QuoteTemplateManager
                companyId={companyId}
                userId={userId}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <QuoteSettingsPanel
                companyId={companyId}
                userId={userId}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="numbering" className="space-y-4">
              <QuoteNumberingConfig
                companyId={companyId}
                config={numberingConfig}
                onConfigUpdate={setNumberingConfig}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <QuoteCustomActions
                companyId={companyId}
                userId={userId}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <QuoteAIAssistant
                companyId={companyId}
                userId={userId}
                quotes={quotes || []}
                accounts={accounts || []}
                contacts={contacts || []}
              />
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <QuoteExportSystem
                companyId={companyId}
                quotes={quotes || []}
                accounts={accounts || []}
                contacts={contacts || []}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}