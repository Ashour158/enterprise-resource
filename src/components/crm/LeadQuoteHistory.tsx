import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  FileText,
  Download,
  Eye,
  Edit,
  Trash,
  Plus,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  ArrowRight,
  Send,
  Copy,
  Share,
  History,
  Star,
  TrendUp,
  Activity,
  Target,
  Mail,
  Phone
} from '@phosphor-icons/react'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

interface Quote {
  id: string
  quoteNumber: string
  leadId: string
  accountId?: string
  contactId?: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'revised'
  totalAmount: number
  currency: string
  validUntil: Date
  items: QuoteItem[]
  notes: string
  terms: string
  customFields: Record<string, any>
  attachments: QuoteAttachment[]
  version: number
  originalQuoteId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  viewedAt?: Date
  respondedAt?: Date
  activities: QuoteActivity[]
}

interface QuoteItem {
  id: string
  productId?: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface QuoteAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: Date
  uploadedBy: string
}

interface QuoteActivity {
  id: string
  type: 'created' | 'sent' | 'viewed' | 'downloaded' | 'accepted' | 'rejected' | 'revised' | 'expired'
  description: string
  timestamp: Date
  userId: string
  metadata?: Record<string, any>
}

interface LeadQuoteHistoryProps {
  leadId: string
  companyId: string
  userId: string
  onQuoteCreate?: (quote: Quote) => void
  onQuoteUpdate?: (quote: Quote) => void
}

export function LeadQuoteHistory({ leadId, companyId, userId, onQuoteCreate, onQuoteUpdate }: LeadQuoteHistoryProps) {
  const [quotes, setQuotes] = useKV<Quote[]>(`lead-quotes-${leadId}`, [])
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showQuoteDetail, setShowQuoteDetail] = useState(false)
  const [formData, setFormData] = useState<Partial<Quote>>({})
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    // Initialize with sample quote if none exist
    if (quotes.length === 0) {
      const sampleQuote: Quote = {
        id: `quote-${Date.now()}`,
        quoteNumber: 'QUO-2024-001',
        leadId,
        title: 'Enterprise Software License',
        description: 'Annual enterprise software license with premium support',
        status: 'sent',
        totalAmount: 25000,
        currency: 'USD',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: [
          {
            id: 'item-1',
            name: 'Enterprise License (Annual)',
            description: 'Full enterprise license with all features',
            quantity: 1,
            unitPrice: 20000,
            discount: 0,
            total: 20000
          },
          {
            id: 'item-2',
            name: 'Premium Support',
            description: '24/7 premium support with dedicated account manager',
            quantity: 1,
            unitPrice: 5000,
            discount: 0,
            total: 5000
          }
        ],
        notes: 'Special pricing for first year. Includes implementation support.',
        terms: 'Payment terms: Net 30. All prices in USD.',
        customFields: {},
        attachments: [],
        version: 1,
        createdBy: userId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        activities: [
          {
            id: 'activity-1',
            type: 'created',
            description: 'Quote created',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            userId
          },
          {
            id: 'activity-2',
            type: 'sent',
            description: 'Quote sent to customer',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            userId
          },
          {
            id: 'activity-3',
            type: 'viewed',
            description: 'Customer viewed quote',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            userId: 'customer'
          }
        ]
      }
      setQuotes([sampleQuote])
    }
  }, [])

  const createQuote = () => {
    if (!formData.title || quoteItems.length === 0) {
      toast.error('Please provide quote title and add at least one item')
      return
    }

    const totalAmount = quoteItems.reduce((sum, item) => sum + item.total, 0)
    const quoteNumber = `QUO-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quoteNumber,
      leadId,
      title: formData.title!,
      description: formData.description || '',
      status: 'draft',
      totalAmount,
      currency: formData.currency || 'USD',
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: quoteItems,
      notes: formData.notes || '',
      terms: formData.terms || 'Payment terms: Net 30. All prices in USD.',
      customFields: formData.customFields || {},
      attachments: [],
      version: 1,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      activities: [
        {
          id: `activity-${Date.now()}`,
          type: 'created',
          description: 'Quote created',
          timestamp: new Date(),
          userId
        }
      ]
    }

    setQuotes(prev => [...prev, newQuote])
    setFormData({})
    setQuoteItems([])
    setShowQuoteForm(false)
    onQuoteCreate?.(newQuote)
    toast.success('Quote created successfully')
  }

  const sendQuote = (quoteId: string) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? {
            ...quote,
            status: 'sent' as const,
            sentAt: new Date(),
            updatedAt: new Date(),
            activities: [
              ...quote.activities,
              {
                id: `activity-${Date.now()}`,
                type: 'sent',
                description: 'Quote sent to customer',
                timestamp: new Date(),
                userId
              }
            ]
          }
        : quote
    ))
    toast.success('Quote sent successfully')
  }

  const reviseQuote = (quote: Quote) => {
    const revisedQuote: Quote = {
      ...quote,
      id: `quote-${Date.now()}`,
      quoteNumber: `${quote.quoteNumber}-R${quote.version + 1}`,
      status: 'draft',
      version: quote.version + 1,
      originalQuoteId: quote.originalQuoteId || quote.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: undefined,
      viewedAt: undefined,
      respondedAt: undefined,
      activities: [
        {
          id: `activity-${Date.now()}`,
          type: 'revised',
          description: `Quote revised (version ${quote.version + 1})`,
          timestamp: new Date(),
          userId
        }
      ]
    }

    setQuotes(prev => [...prev, revisedQuote])
    setSelectedQuote(revisedQuote)
    setShowQuoteDetail(true)
    toast.success('Quote revision created')
  }

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    }
    setQuoteItems(prev => [...prev, newItem])
  }

  const updateQuoteItem = (itemId: string, updates: Partial<QuoteItem>) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates }
        const subtotal = updated.quantity * updated.unitPrice
        const discountAmount = subtotal * (updated.discount / 100)
        updated.total = subtotal - discountAmount
        return updated
      }
      return item
    }))
  }

  const removeQuoteItem = (itemId: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== itemId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'viewed': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      case 'revised': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit size={16} />
      case 'sent': return <Send size={16} />
      case 'viewed': return <Eye size={16} />
      case 'accepted': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'expired': return <Warning size={16} />
      case 'revised': return <History size={16} />
      default: return <FileText size={16} />
    }
  }

  const getQuoteStats = () => {
    const totalQuotes = quotes.length
    const totalValue = quotes.reduce((sum, quote) => sum + quote.totalAmount, 0)
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
    const acceptanceRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0
    const avgQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0

    return {
      totalQuotes,
      totalValue,
      acceptedQuotes,
      acceptanceRate,
      avgQuoteValue
    }
  }

  const stats = getQuoteStats()
  const sortedQuotes = [...quotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="space-y-6">
      {/* Quote Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.acceptedQuotes}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</p>
              </div>
              <TrendUp className="text-purple-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Value</p>
                <p className="text-2xl font-bold">${stats.avgQuoteValue.toLocaleString()}</p>
              </div>
              <Target className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Quote History</h3>
          <p className="text-sm text-muted-foreground">Track all quotes generated for this lead</p>
        </div>
        <Button onClick={() => setShowQuoteForm(true)}>
          <Plus size={16} className="mr-2" />
          Create Quote
        </Button>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {sortedQuotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-medium mb-2">No Quotes Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first quote for this lead</p>
              <Button onClick={() => setShowQuoteForm(true)}>
                <Plus size={16} className="mr-2" />
                Create First Quote
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedQuotes.map((quote) => (
            <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-lg">{quote.title}</h4>
                      <Badge className={getStatusColor(quote.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(quote.status)}
                          {quote.status}
                        </div>
                      </Badge>
                      {quote.version > 1 && (
                        <Badge variant="outline">v{quote.version}</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{quote.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quote Number:</span>
                        <div className="font-medium">{quote.quoteNumber}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">${quote.totalAmount.toLocaleString()} {quote.currency}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valid Until:</span>
                        <div className="font-medium">{format(quote.validUntil, 'MMM dd, yyyy')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{format(quote.createdAt, 'MMM dd, yyyy')}</div>
                      </div>
                    </div>

                    {/* Quote Timeline */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {quote.activities.slice(-3).map((activity, index) => (
                          <div key={activity.id} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>{activity.description}</span>
                            <span>({format(activity.timestamp, 'MMM dd')})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expiry Warning */}
                    {quote.status === 'sent' && differenceInDays(quote.validUntil, new Date()) <= 3 && (
                      <Alert className="mt-3 border-orange-200 bg-orange-50">
                        <Warning className="text-orange-600" size={16} />
                        <AlertDescription className="text-orange-800">
                          Quote expires in {differenceInDays(quote.validUntil, new Date())} days
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedQuote(quote)
                        setShowQuoteDetail(true)
                      }}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                    
                    {quote.status === 'draft' && (
                      <Button 
                        size="sm"
                        onClick={() => sendQuote(quote.id)}
                      >
                        <Send size={14} className="mr-1" />
                        Send
                      </Button>
                    )}
                    
                    {(quote.status === 'sent' || quote.status === 'viewed') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => reviseQuote(quote)}
                      >
                        <Edit size={14} className="mr-1" />
                        Revise
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quote Creation Form */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quote Title *</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Enterprise Software License"
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
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this quote covers"
              />
            </div>

            {/* Quote Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-medium">Quote Items</Label>
                <Button variant="outline" onClick={addQuoteItem}>
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {quoteItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-end">
                        <div className="col-span-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateQuoteItem(item.id, { name: e.target.value })}
                            placeholder="Product/Service name"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuoteItem(item.id, { quantity: Number(e.target.value) })}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateQuoteItem(item.id, { unitPrice: Number(e.target.value) })}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateQuoteItem(item.id, { discount: Number(e.target.value) })}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <Label>Total</Label>
                            <div className="font-medium">${item.total.toLocaleString()}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeQuoteItem(item.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateQuoteItem(item.id, { description: e.target.value })}
                          placeholder="Item description"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {quoteItems.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Quote Total:</span>
                    <span className="text-2xl font-bold">
                      ${quoteItems.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes or special conditions"
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms || 'Payment terms: Net 30. All prices in USD.'}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Terms and conditions"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
              Cancel
            </Button>
            <Button onClick={createQuote}>
              <Plus size={16} className="mr-2" />
              Create Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <Dialog open={showQuoteDetail} onOpenChange={setShowQuoteDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <FileText size={24} />
                {selectedQuote.title}
                <Badge className={getStatusColor(selectedQuote.status)}>
                  {selectedQuote.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Quote Header */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quote Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quote Number:</span>
                      <span className="font-medium">{selectedQuote.quoteNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${selectedQuote.totalAmount.toLocaleString()} {selectedQuote.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="font-medium">{format(selectedQuote.validUntil, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{format(selectedQuote.createdAt, 'MMM dd, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedQuote.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{activity.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quote Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quote Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedQuote.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${item.total.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} × ${item.unitPrice.toLocaleString()}
                              {item.discount > 0 && ` (${item.discount}% off)`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-lg font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold">
                        ${selectedQuote.totalAmount.toLocaleString()} {selectedQuote.currency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes and Terms */}
              {(selectedQuote.notes || selectedQuote.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedQuote.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedQuote.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedQuote.terms && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedQuote.terms}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuoteDetail(false)}>
                Close
              </Button>
              {selectedQuote.status === 'draft' && (
                <Button onClick={() => sendQuote(selectedQuote.id)}>
                  <Send size={16} className="mr-2" />
                  Send Quote
                </Button>
              )}
              {(selectedQuote.status === 'sent' || selectedQuote.status === 'viewed') && (
                <Button onClick={() => reviseQuote(selectedQuote)}>
                  <Edit size={16} className="mr-2" />
                  Create Revision
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}