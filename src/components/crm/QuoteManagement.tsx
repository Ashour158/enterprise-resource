import React, { useState } from 'react'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Quote, QuoteLineItem } from '@/types/crm'
import { QuoteApprovalWorkflowManager } from './quote/QuoteApprovalWorkflowManager'
import { QuoteApprovalDashboard } from './quote/QuoteApprovalDashboard'
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
  Shield,
  FlowArrow
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteManagementProps {
  companyId: string
  userId: string
  userRole: string
}

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
    status: 'pending_approval',
    approvalStatus: 'pending',
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
    customFields: {},
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
      },
      {
        id: 'item-002',
        productId: 'prod-002',
        name: 'Professional Services',
        description: 'Implementation and training services',
        quantity: 40,
        unitPrice: 150,
        discount: 0,
        discountAmount: 0,
        lineTotal: 6000,
        order: 2
      }
    ],
    createdBy: 'user-001',
    assignedTo: 'user-001',
    sentDate: new Date('2024-01-20'),
    viewedDate: new Date('2024-01-22'),
    files: [],
    activities: [],
    approvals: [
      {
        id: 'approval-001',
        quoteId: 'quote-001',
        workflowId: 'workflow-001',
        levelId: 'level-001',
        approverId: 'manager-001',
        approverName: 'John Manager',
        approverRole: 'Sales Manager',
        status: 'pending',
        requestedAt: new Date('2024-01-20'),
        comments: undefined,
        remindersSent: 1
      }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'quote-002',
    companyId: 'comp-001',
    quoteNumber: 'Q-2024-002',
    accountId: 'acc-002',
    contactId: 'contact-002',
    title: 'Marketing Automation Package',
    description: 'Marketing automation software and services',
    status: 'draft',
    approvalStatus: 'not_required',
    validUntil: new Date('2024-02-20'),
    currency: 'USD',
    subtotal: 15000,
    taxRate: 8.5,
    taxAmount: 1275,
    discountRate: 10,
    discountAmount: 1500,
    totalAmount: 14775,
    terms: 'Net 15 payment terms. Quote valid for 45 days.',
    customFields: {},
    lineItems: [
      {
        id: 'item-003',
        productId: 'prod-003',
        name: 'Marketing Automation Software',
        description: 'Annual subscription for marketing automation platform',
        quantity: 1,
        unitPrice: 12000,
        discount: 10,
        discountAmount: 1200,
        lineTotal: 10800,
        order: 1
      },
      {
        id: 'item-004',
        productId: 'prod-004',
        name: 'Setup and Configuration',
        description: 'Initial setup and configuration services',
        quantity: 20,
        unitPrice: 200,
        discount: 10,
        discountAmount: 400,
        lineTotal: 3600,
        order: 2
      }
    ],
    createdBy: 'user-002',
    assignedTo: 'user-002',
    files: [],
    activities: [],
    approvals: [],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
]

export function QuoteManagement({ companyId, userId, userRole }: QuoteManagementProps) {
  const [quotes, setQuotes] = useKV<Quote[]>(`quotes-${companyId}`, mockQuotes)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showApprovalView, setShowApprovalView] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState<Partial<Quote>>({})
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])
  const [activeTab, setActiveTab] = useState('quotes')

  const quoteStatuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'pending_approval', label: 'Pending Approval', color: 'bg-yellow-500' },
    { value: 'approved', label: 'Approved', color: 'bg-green-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-500' },
    { value: 'viewed', label: 'Viewed', color: 'bg-purple-500' },
    { value: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
    { value: 'expired', label: 'Expired', color: 'bg-orange-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-500' }
  ]

  const filteredQuotes = (quotes || []).filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.description && quote.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Check if quote needs approval based on mock workflow rules
  const needsApproval = (quote: Partial<Quote>) => {
    if (!quote.totalAmount) return false
    // Simple rule: quotes over $10,000 or with discount > 15% need approval
    return quote.totalAmount > 10000 || (quote.discountRate || 0) > 15
  }

  const handleCreateQuote = () => {
    if (!formData.title || lineItems.length === 0) {
      toast.error('Please fill in required fields and add at least one line item')
      return
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const discountAmount = subtotal * ((formData.discountRate || 0) / 100)
    const discountedSubtotal = subtotal - discountAmount
    const taxAmount = discountedSubtotal * ((formData.taxRate || 0) / 100)
    const totalAmount = discountedSubtotal + taxAmount

    // Determine initial status based on approval needs
    const requiresApproval = needsApproval({ totalAmount, discountRate: formData.discountRate })
    const initialStatus = requiresApproval ? 'pending_approval' : 'draft'
    const approvalStatus = requiresApproval ? 'pending' : 'not_required'

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      companyId,
      quoteNumber: `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      accountId: formData.accountId,
      contactId: formData.contactId,
      dealId: formData.dealId,
      title: formData.title,
      description: formData.description,
      status: initialStatus,
      approvalStatus,
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
      customFields: {},
      createdBy: userId,
      assignedTo: userId,
      files: [],
      activities: [],
      approvals: requiresApproval ? [
        {
          id: `approval-${Date.now()}`,
          quoteId: `quote-${Date.now()}`,
          workflowId: 'workflow-001',
          levelId: 'level-001',
          approverId: 'manager-001',
          approverName: 'Sales Manager',
          approverRole: 'Sales Manager',
          status: 'pending',
          requestedAt: new Date(),
          remindersSent: 0
        }
      ] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setQuotes(current => [...(current || []), newQuote])
    setFormData({})
    setLineItems([])
    setShowQuoteForm(false)
    
    if (requiresApproval) {
      toast.success('Quote created and sent for approval')
    } else {
      toast.success('Quote created successfully')
    }
  }

  const handleUpdateQuote = (quoteId: string, updates: Partial<Quote>) => {
    setQuotes(current => {
      if (!current) return []
      return current.map(quote =>
        quote.id === quoteId
          ? { ...quote, ...updates, updatedAt: new Date() }
          : quote
      )
    })
    toast.success('Quote updated successfully')
  }

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(current => {
      if (!current) return []
      return current.filter(quote => quote.id !== quoteId)
    })
    toast.success('Quote deleted successfully')
  }

  const handleSendQuote = (quoteId: string) => {
    handleUpdateQuote(quoteId, {
      status: 'sent',
      sentDate: new Date()
    })
    toast.success('Quote sent successfully')
  }

  const handleAcceptQuote = (quoteId: string) => {
    handleUpdateQuote(quoteId, {
      status: 'accepted',
      acceptedDate: new Date()
    })
    toast.success('Quote accepted')
  }

  const handleRejectQuote = (quoteId: string) => {
    handleUpdateQuote(quoteId, {
      status: 'rejected',
      rejectedDate: new Date()
    })
    toast.success('Quote rejected')
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <FlowArrow size={16} />
              Approval Workflows
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quotes" className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-4">
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
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    New Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Quote</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quote Title *</Label>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
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
                        <Label>Currency</Label>
                        <Select
                          value={formData.currency || 'USD'}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
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
                        />
                      </div>
                    </div>

                    {/* Line Items */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-lg">Line Items</Label>
                        <Button type="button" variant="outline" onClick={addLineItem}>
                          <Plus size={16} className="mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      {lineItems.length > 0 && (
                        <div className="space-y-4">
                          {lineItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg">
                              <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-4">
                                  <Label>Item Name</Label>
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateLineItem(index, { name: e.target.value })}
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
                                  <div className="text-sm font-medium">
                                    {formatCurrency(item.lineTotal)}
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
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Terms and Notes */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Terms and Conditions</Label>
                        <Textarea
                          value={formData.terms || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={formData.notes || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateQuote}>
                      Create Quote
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quotes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
              <CardDescription>
                Manage sales quotes and proposals with approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {getStatusIcon(quote.status)}
                            {quote.quoteNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">{quote.title}</div>
                          {quote.description && (
                            <div className="text-xs text-muted-foreground mt-1">{quote.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(quote.status)}
                      </TableCell>
                      <TableCell>
                        {quote.approvalStatus && quote.approvalStatus !== 'not_required' ? (
                          <div className="flex items-center gap-2">
                            {quote.approvalStatus === 'pending' && <Clock size={14} className="text-yellow-500" />}
                            {quote.approvalStatus === 'approved' && <CheckCircle size={14} className="text-green-500" />}
                            {quote.approvalStatus === 'rejected' && <XCircle size={14} className="text-red-500" />}
                            <span className="text-sm capitalize">{quote.approvalStatus}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not required</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(quote.totalAmount, quote.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.lineItems.length} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${new Date() > quote.validUntil ? 'text-red-500' : ''}`}>
                          {formatDate(quote.validUntil)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(quote.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {quote.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => handleSendQuote(quote.id)}>
                              <Send size={14} className="mr-1" />
                              Send
                            </Button>
                          )}
                          {quote.status === 'sent' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAcceptQuote(quote.id)}>
                                <CheckCircle size={14} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectQuote(quote.id)}>
                                <XCircle size={14} />
                              </Button>
                            </>
                          )}
                          {quote.approvals && quote.approvals.length > 0 && (
                            <Button size="sm" variant="outline" onClick={() => setSelectedQuote(quote)}>
                              <Shield size={14} className="mr-1" />
                              Approvals
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedQuote(quote)}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit Quote
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download size={14} className="mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)}>
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
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <QuoteApprovalWorkflowManager 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>

      {/* Quote Detail Dialog with Approval Dashboard */}
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
              {/* Approval Dashboard */}
              {selectedQuote.approvals && selectedQuote.approvals.length > 0 && (
                <QuoteApprovalDashboard
                  companyId={companyId}
                  userId={userId}
                  userRole={userRole}
                  quote={selectedQuote}
                  onApprovalUpdate={(approval) => {
                    // Update the quote with the new approval status
                    handleUpdateQuote(selectedQuote.id, {
                      approvals: selectedQuote.approvals?.map(a => 
                        a.id === approval.id ? approval : a
                      )
                    })
                  }}
                />
              )}

              {/* Quote Header */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-semibold mb-2">Quote Information</div>
                  <div className="space-y-1 text-sm">
                    <div><strong>Status:</strong> {getStatusBadge(selectedQuote.status)}</div>
                    <div><strong>Valid Until:</strong> {formatDate(selectedQuote.validUntil)}</div>
                    <div><strong>Created:</strong> {formatDate(selectedQuote.createdAt)}</div>
                    {selectedQuote.sentDate && (
                      <div><strong>Sent:</strong> {formatDate(selectedQuote.sentDate)}</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Financial Summary</div>
                  <div className="space-y-1 text-sm">
                    <div><strong>Subtotal:</strong> {formatCurrency(selectedQuote.subtotal, selectedQuote.currency)}</div>
                    <div><strong>Discount:</strong> -{formatCurrency(selectedQuote.discountAmount, selectedQuote.currency)}</div>
                    <div><strong>Tax:</strong> {formatCurrency(selectedQuote.taxAmount, selectedQuote.currency)}</div>
                    <div className="border-t pt-1"><strong>Total:</strong> <span className="text-lg font-bold">{formatCurrency(selectedQuote.totalAmount, selectedQuote.currency)}</span></div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-3">Line Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedQuote.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice, selectedQuote.currency)}</TableCell>
                        <TableCell>{item.discount}%</TableCell>
                        <TableCell>{formatCurrency(item.lineTotal, selectedQuote.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Terms and Notes */}
              {(selectedQuote.terms || selectedQuote.notes) && (
                <div className="grid grid-cols-1 gap-4">
                  {selectedQuote.terms && (
                    <div>
                      <h3 className="font-semibold mb-2">Terms and Conditions</h3>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {selectedQuote.terms}
                      </div>
                    </div>
                  )}
                  {selectedQuote.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        {selectedQuote.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}