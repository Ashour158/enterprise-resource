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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Quote, QuoteLineItem, QuoteTemplate, QuoteNumberingConfig, QuoteCustomAction, QuoteExportConfig } from '@/types/crm'
import { 
  Plus, 
  MagnifyingGlass as Search, 
  Download, 
  Upload, 
  FileText,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  CurrencyDollar as DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  PaperPlaneTilt as Send,
  Brain,
  FilePdf,
  FileDoc,
  FileCsv,
  Gear,
  MagicWand,
  Copy,
  ShareNetwork,
  EnvelopeSimple as Mail,
  Palette,
  NumberCircleOne,
  Warning,
  CloudArrowUp,
  FolderOpen,
  FloppyDisk,
  Star,
  Code,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { FileAttachmentSystem } from '@/components/shared/FileAttachmentSystem'

interface EnhancedQuoteManagementProps {
  companyId: string
  userId: string
  userRole: string
}

// Extended mock data with new features
const mockQuotes: Quote[] = [
  {
    id: 'quote-001',
    companyId: 'comp-001',
    quoteNumber: 'Q-2024-001',
    accountId: 'acc-001',
    contactId: 'contact-001',
    dealId: 'deal-001',
    title: 'Enterprise Software License',
    description: 'Annual software license for enterprise package',
    status: 'sent',
    validUntil: new Date('2024-02-15'),
    currency: 'USD',
    subtotal: 48000,
    taxRate: 8.5,
    taxAmount: 4080,
    discountRate: 5,
    discountAmount: 2400,
    totalAmount: 49680,
    terms: 'Net 30 payment terms. Quote valid for 30 days.',
    notes: 'Includes setup and first year support',
    customFields: {
      priority: 'high',
      industry: 'technology',
      leadSource: 'referral'
    },
    templateId: 'template-001',
    lineItems: [
      {
        id: 'item-001',
        productId: 'prod-001',
        name: 'Enterprise Software License',
        description: 'Annual license for up to 100 users',
        quantity: 1,
        unitPrice: 48000,
        discount: 5,
        discountAmount: 2400,
        lineTotal: 45600,
        order: 1
      }
    ],
    createdBy: 'user-001',
    assignedTo: 'user-001',
    sentDate: new Date('2024-01-20'),
    viewedDate: new Date('2024-01-22'),
    files: [],
    activities: [],
    emailSettings: {
      subject: 'Your Enterprise Software Quote',
      body: 'Please find attached your personalized quote for our enterprise software solution.',
      ccEmails: ['manager@company.com'],
      bccEmails: [],
      attachPdf: true,
      sendReminders: true,
      reminderDays: [7, 3, 1]
    },
    customActions: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  }
]

const mockTemplates: QuoteTemplate[] = [
  {
    id: 'template-001',
    companyId: 'comp-001',
    name: 'Standard Enterprise Quote',
    description: 'Professional template for enterprise clients',
    type: 'system_default',
    format: 'pdf',
    templateData: 'base64EncodedTemplate',
    variables: [
      { id: 'var-001', name: 'companyLogo', label: 'Company Logo', type: 'image', required: true },
      { id: 'var-002', name: 'paymentTerms', label: 'Payment Terms', type: 'text', required: true, defaultValue: 'Net 30' }
    ],
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'template-002',
    companyId: 'comp-001',
    name: 'AI-Generated Modern Template',
    description: 'Modern, AI-optimized template with conversion focus',
    type: 'ai_generated',
    format: 'pdf',
    templateData: 'base64EncodedTemplate',
    variables: [
      { id: 'var-003', name: 'clientPersonalization', label: 'Client Personalization', type: 'text', required: false },
      { id: 'var-004', name: 'urgencyIndicator', label: 'Urgency Level', type: 'text', required: false }
    ],
    isActive: true,
    isDefault: false,
    aiPrompt: 'Create a modern, conversion-focused quote template with personalized elements',
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]

const defaultNumberingConfig: QuoteNumberingConfig = {
  prefix: 'Q',
  suffix: '',
  digitCount: 4,
  startNumber: 1,
  resetPeriod: 'yearly',
  lastNumber: 125,
  lastResetDate: new Date('2024-01-01')
}

const availableCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
]

export function EnhancedQuoteManagement({ companyId, userId, userRole }: EnhancedQuoteManagementProps) {
  // State management
  const [quotes, setQuotes] = useKV<Quote[]>(`enhanced-quotes-${companyId}`, mockQuotes)
  const [templates, setTemplates] = useKV<QuoteTemplate[]>(`quote-templates-${companyId}`, mockTemplates)
  const [numberingConfig, setNumberingConfig] = useKV<QuoteNumberingConfig>(`quote-numbering-${companyId}`, defaultNumberingConfig)
  const [customActions, setCustomActions] = useKV<QuoteCustomAction[]>(`quote-actions-${companyId}`, [])
  
  // UI state
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAITemplateDialog, setShowAITemplateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  
  // Form state
  const [formData, setFormData] = useState<Partial<Quote>>({})
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [aiTemplatePrompt, setAiTemplatePrompt] = useState('')
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false)

  const quoteStatuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-500' },
    { value: 'viewed', label: 'Viewed', color: 'bg-yellow-500' },
    { value: 'accepted', label: 'Accepted', color: 'bg-green-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    { value: 'expired', label: 'Expired', color: 'bg-orange-500' }
  ]

  // Filtering logic
  const filteredQuotes = (quotes || []).filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.description && quote.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    const matchesCurrency = currencyFilter === 'all' || quote.currency === currencyFilter
    
    return matchesSearch && matchesStatus && matchesCurrency
  })

  // Generate next quote number based on config
  const generateQuoteNumber = (): string => {
    const config = numberingConfig || defaultNumberingConfig
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    let nextNumber = (config.lastNumber || 0) + 1
    
    // Reset numbering if needed
    if (config.resetPeriod === 'yearly' && config.lastResetDate && 
        config.lastResetDate.getFullYear() !== year) {
      nextNumber = config.startNumber
    } else if (config.resetPeriod === 'monthly' && config.lastResetDate &&
               (config.lastResetDate.getFullYear() !== year || 
                config.lastResetDate.getMonth() !== now.getMonth())) {
      nextNumber = config.startNumber
    }
    
    const numberStr = String(nextNumber).padStart(config.digitCount, '0')
    const yearStr = config.resetPeriod === 'yearly' ? `-${year}` : ''
    const monthStr = config.resetPeriod === 'monthly' ? `-${year}-${month}` : ''
    
    return `${config.prefix}${yearStr}${monthStr}-${numberStr}${config.suffix}`
  }

  // AI Template Generation
  const generateAITemplate = async () => {
    if (!aiTemplatePrompt.trim()) {
      toast.error('Please enter a template description')
      return
    }

    setIsGeneratingTemplate(true)
    try {
      const prompt = (window as any).spark.llmPrompt`Create a professional quote template based on this description: ${aiTemplatePrompt}. 
      Focus on conversion optimization, clear pricing presentation, and professional branding. 
      Include placeholders for company information, client details, line items, terms, and personalized elements.
      The template should be modern, clean, and trustworthy.`
      
      const response = await (window as any).spark.llm(prompt)
      
      const newTemplate: QuoteTemplate = {
        id: `template-ai-${Date.now()}`,
        companyId,
        name: `AI Generated: ${aiTemplatePrompt.slice(0, 30)}...`,
        description: `AI-generated template: ${aiTemplatePrompt}`,
        type: 'ai_generated',
        format: 'pdf',
        templateData: btoa(response), // Convert to base64
        variables: [
          { id: 'var-ai-1', name: 'companyLogo', label: 'Company Logo', type: 'image', required: true },
          { id: 'var-ai-2', name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { id: 'var-ai-3', name: 'personalization', label: 'Personalized Message', type: 'text', required: false }
        ],
        isActive: true,
        isDefault: false,
        aiPrompt: aiTemplatePrompt,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setTemplates(current => [...(current || []), newTemplate])
      setAiTemplatePrompt('')
      setShowAITemplateDialog(false)
      toast.success('AI template generated successfully!')
    } catch (error) {
      console.error('Error generating AI template:', error)
      toast.error('Failed to generate AI template')
    } finally {
      setIsGeneratingTemplate(false)
    }
  }

  // Quote operations
  const handleCreateQuote = async () => {
    if (!formData.title || lineItems.length === 0) {
      toast.error('Please fill in required fields and add at least one line item')
      return
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const discountAmount = subtotal * ((formData.discountRate || 0) / 100)
    const discountedSubtotal = subtotal - discountAmount
    const taxAmount = discountedSubtotal * ((formData.taxRate || 0) / 100)
    const totalAmount = discountedSubtotal + taxAmount

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      companyId,
      quoteNumber: generateQuoteNumber(),
      accountId: formData.accountId,
      contactId: formData.contactId,
      dealId: formData.dealId,
      title: formData.title,
      description: formData.description,
      status: 'draft',
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currency: formData.currency || 'USD',
      subtotal,
      taxRate: formData.taxRate || 0,
      taxAmount,
      discountRate: formData.discountRate || 0,
      discountAmount,
      totalAmount,
      terms: formData.terms || 'Net 30 payment terms',
      notes: formData.notes,
      lineItems,
      customFields: formData.customFields || {},
      templateId: selectedTemplate,
      createdBy: userId,
      assignedTo: userId,
      files: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setQuotes(current => [...(current || []), newQuote])
    
    // Update numbering config
    const currentConfig = numberingConfig || defaultNumberingConfig
    const nextNumber = (currentConfig.lastNumber || 0) + 1
    setNumberingConfig({
      ...currentConfig,
      lastNumber: nextNumber,
      lastResetDate: new Date()
    })
    
    resetForm()
    toast.success('Quote created successfully')
  }

  const resetForm = () => {
    setFormData({})
    setLineItems([])
    setSelectedTemplate('')
    setShowQuoteForm(false)
  }

  const handleExportQuote = async (quoteId: string, format: 'pdf' | 'docx' | 'csv') => {
    const quote = quotes?.find(q => q.id === quoteId)
    if (!quote) return

    try {
      // Simulate export process
      toast.success(`Exporting quote as ${format.toUpperCase()}...`)
      
      // Here you would integrate with your document generation service
      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        toast.success(`Quote exported successfully as ${format.toUpperCase()}`)
      }, 2000)
    } catch (error) {
      toast.error(`Failed to export quote as ${format.toUpperCase()}`)
    }
  }

  const handleSendEmail = async (quoteId: string) => {
    const quote = quotes?.find(q => q.id === quoteId)
    if (!quote) return

    try {
      // Simulate email sending
      toast.success('Sending quote via email...')
      
      // Update quote status
      setQuotes(current => {
        if (!current) return []
        return current.map(q =>
          q.id === quoteId
            ? { ...q, status: 'sent' as const, sentDate: new Date(), updatedAt: new Date() }
            : q
        )
      })
      
      setTimeout(() => {
        toast.success('Quote sent successfully via email')
      }, 1500)
    } catch (error) {
      toast.error('Failed to send quote via email')
    }
  }

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountAmount: 0,
      lineTotal: 0,
      order: lineItems.length + 1
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (index: number, updates: Partial<QuoteLineItem>) => {
    const updatedItems = [...lineItems]
    const item = { ...updatedItems[index], ...updates }
    
    // Recalculate totals
    const discountAmount = item.unitPrice * item.quantity * (item.discount / 100)
    item.discountAmount = discountAmount
    item.lineTotal = (item.unitPrice * item.quantity) - discountAmount
    
    updatedItems[index] = item
    setLineItems(updatedItems)
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = quoteStatuses.find(s => s.value === status)
    return (
      <Badge variant="outline" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock size={16} />
      case 'sent': return <Send size={16} />
      case 'viewed': return <Eye size={16} />
      case 'accepted': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'expired': return <Calendar size={16} />
      default: return <FileText size={16} />
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    const currencyInfo = availableCurrencies.find(c => c.code === currency)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Advanced Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Enhanced Quote Management</h2>
            <p className="text-muted-foreground">
              AI-powered quote generation with advanced templates and customization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Gear size={16} className="mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={() => setShowTemplateManager(true)}>
              <Palette size={16} className="mr-2" />
              Templates
            </Button>
            <Button onClick={() => setShowQuoteForm(true)}>
              <Plus size={16} className="mr-2" />
              New Quote
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {quoteStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {availableCurrencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Bulk Export
          </Button>
        </div>
      </div>

      {/* Enhanced Quote Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
              <CardDescription>
                Manage and track all your sales quotes with advanced features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkle size={12} />
                AI Enhanced
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote Details</TableHead>
                <TableHead>Client & Amount</TableHead>
                <TableHead>Status & Progress</TableHead>
                <TableHead>Template & Currency</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {getStatusIcon(quote.status)}
                        {quote.quoteNumber}
                        {quote.customFields?.priority === 'high' && (
                          <Star size={14} className="text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{quote.title}</div>
                      {quote.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {quote.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatCurrency(quote.totalAmount, quote.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {quote.lineItems.length} items
                      </div>
                      {quote.customFields?.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {quote.customFields.industry}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(quote.status)}
                      {quote.status === 'sent' && (
                        <div className="text-xs text-muted-foreground">
                          {quote.viewedDate ? 'Viewed' : 'Not viewed yet'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {availableCurrencies.find(c => c.code === quote.currency)?.symbol} {quote.currency}
                      </div>
                      {quote.templateId && (
                        <div className="text-xs text-muted-foreground">
                          Template: {templates?.find(t => t.id === quote.templateId)?.name || 'Custom'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Created: {formatDate(quote.createdAt)}
                      </div>
                      <div className={`text-xs ${new Date() > quote.validUntil ? 'text-red-500' : 'text-muted-foreground'}`}>
                        Valid until: {formatDate(quote.validUntil)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {quote.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => handleSendEmail(quote.id)}>
                          <Mail size={14} className="mr-1" />
                          Send
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedQuote(quote)}>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={14} className="mr-2" />
                            Edit Quote
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExportQuote(quote.id, 'pdf')}>
                            <FilePdf size={14} className="mr-2" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportQuote(quote.id, 'docx')}>
                            <FileDoc size={14} className="mr-2" />
                            Export as DOCX
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportQuote(quote.id, 'csv')}>
                            <FileCsv size={14} className="mr-2" />
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy size={14} className="mr-2" />
                            Duplicate Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShareNetwork size={14} className="mr-2" />
                            Share Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced Quote Form Dialog */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain size={20} />
              Create Enhanced Quote
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Quote Details</TabsTrigger>
              <TabsTrigger value="items">Line Items</TabsTrigger>
              <TabsTrigger value="template">Template & Design</TabsTrigger>
              <TabsTrigger value="email">Email Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quote Title *</Label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quote title"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency || 'USD'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.validUntil ? formData.validUntil.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: new Date(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.taxRate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter quote description"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">Line Items</Label>
                <Button type="button" variant="outline" onClick={addLineItem}>
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
              
              {lineItems.length > 0 && (
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateLineItem(index, { name: e.target.value })}
                            placeholder="Product or service name"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, { unitPrice: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateLineItem(index, { discount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Total</Label>
                          <div className="text-sm font-medium text-right p-2">
                            {formatCurrency(item.lineTotal, formData.currency)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => updateLineItem(index, { description: e.target.value })}
                          placeholder="Item description"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {templates?.map((template) => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedTemplate === template.id ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {template.type === 'ai_generated' ? (
                              <Brain size={16} className="text-purple-500" />
                            ) : (
                              <FileText size={16} />
                            )}
                            <span className="font-medium">{template.name}</span>
                            {template.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.format.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAITemplateDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <MagicWand size={16} />
                    Generate AI Template
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Email Subject</Label>
                  <Input
                    value={formData.emailSettings?.subject || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emailSettings: {
                        ...prev.emailSettings,
                        subject: e.target.value,
                        body: prev.emailSettings?.body || '',
                        ccEmails: prev.emailSettings?.ccEmails || [],
                        bccEmails: prev.emailSettings?.bccEmails || [],
                        attachPdf: prev.emailSettings?.attachPdf ?? true,
                        sendReminders: prev.emailSettings?.sendReminders ?? false,
                        reminderDays: prev.emailSettings?.reminderDays || []
                      }
                    }))}
                    placeholder="Your Quote from [Company Name]"
                  />
                </div>
                <div>
                  <Label>Email Body</Label>
                  <Textarea
                    value={formData.emailSettings?.body || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emailSettings: {
                        ...prev.emailSettings,
                        subject: prev.emailSettings?.subject || '',
                        body: e.target.value,
                        ccEmails: prev.emailSettings?.ccEmails || [],
                        bccEmails: prev.emailSettings?.bccEmails || [],
                        attachPdf: prev.emailSettings?.attachPdf ?? true,
                        sendReminders: prev.emailSettings?.sendReminders ?? false,
                        reminderDays: prev.emailSettings?.reminderDays || []
                      }
                    }))}
                    placeholder="Dear [Client Name], please find attached your personalized quote..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.emailSettings?.attachPdf ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      emailSettings: {
                        ...prev.emailSettings,
                        subject: prev.emailSettings?.subject || '',
                        body: prev.emailSettings?.body || '',
                        ccEmails: prev.emailSettings?.ccEmails || [],
                        bccEmails: prev.emailSettings?.bccEmails || [],
                        attachPdf: checked,
                        sendReminders: prev.emailSettings?.sendReminders ?? false,
                        reminderDays: prev.emailSettings?.reminderDays || []
                      }
                    }))}
                  />
                  <Label>Attach PDF automatically</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Terms and Conditions</Label>
                  <Textarea
                    value={formData.terms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Payment terms, delivery conditions, etc."
                  />
                </div>
                <div>
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes (not visible to client)"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>Custom Fields</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.customFields?.priority || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        customFields: { ...prev.customFields, priority: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input
                      value={formData.customFields?.industry || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customFields: { ...prev.customFields, industry: e.target.value }
                      }))}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuote}>
              <FloppyDisk size={16} className="mr-2" />
              Create Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Template Generator Dialog */}
      <Dialog open={showAITemplateDialog} onOpenChange={setShowAITemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MagicWand size={20} />
              Generate AI Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Describe your ideal quote template</Label>
              <Textarea
                value={aiTemplatePrompt}
                onChange={(e) => setAiTemplatePrompt(e.target.value)}
                placeholder="E.g., 'Create a modern, professional template for technology services with emphasis on value proposition and clear pricing structure'"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAITemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={generateAITemplate} disabled={isGeneratingTemplate}>
                {isGeneratingTemplate ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle size={16} className="mr-2" />
                    Generate Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gear size={20} />
              Quote Management Settings
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="numbering" className="space-y-6">
            <TabsList>
              <TabsTrigger value="numbering">Auto Numbering</TabsTrigger>
              <TabsTrigger value="actions">Custom Actions</TabsTrigger>
              <TabsTrigger value="defaults">Default Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="numbering" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prefix</Label>
                  <Input
                    value={numberingConfig?.prefix || ''}
                    onChange={(e) => setNumberingConfig({
                      ...(numberingConfig || defaultNumberingConfig),
                      prefix: e.target.value
                    })}
                    placeholder="Q"
                  />
                </div>
                <div>
                  <Label>Suffix</Label>
                  <Input
                    value={numberingConfig?.suffix || ''}
                    onChange={(e) => setNumberingConfig({
                      ...(numberingConfig || defaultNumberingConfig),
                      suffix: e.target.value
                    })}
                    placeholder=""
                  />
                </div>
                <div>
                  <Label>Digit Count</Label>
                  <Input
                    type="number"
                    value={numberingConfig?.digitCount || 4}
                    onChange={(e) => setNumberingConfig({
                      ...(numberingConfig || defaultNumberingConfig),
                      digitCount: Number(e.target.value)
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label>Reset Period</Label>
                  <Select
                    value={numberingConfig?.resetPeriod || 'yearly'}
                    onValueChange={(value: 'never' | 'yearly' | 'monthly') => 
                      setNumberingConfig({
                        ...(numberingConfig || defaultNumberingConfig),
                        resetPeriod: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <p className="text-lg font-mono">{generateQuoteNumber()}</p>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Code size={48} className="mx-auto mb-4 opacity-50" />
                <p>Custom actions configuration</p>
                <p className="text-sm">Add custom buttons and workflows to quotes</p>
              </div>
            </TabsContent>

            <TabsContent value="defaults" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Gear size={48} className="mx-auto mb-4 opacity-50" />
                <p>Default settings configuration</p>
                <p className="text-sm">Set default values for new quotes</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Enhanced Quote Detail View */}
      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                {selectedQuote.quoteNumber} - {selectedQuote.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Enhanced quote details would go here */}
              <div className="text-center py-8 text-muted-foreground">
                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                <p>Enhanced quote details view</p>
                <p className="text-sm">Complete quote information with AI insights</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}