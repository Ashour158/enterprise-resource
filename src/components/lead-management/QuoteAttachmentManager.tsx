import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Plus, 
  Eye, 
  Download, 
  Search,
  Calendar,
  CurrencyDollar as DollarSign,
  Link,
  Attachment,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Quote {
  id: string
  quoteNumber: string
  leadId?: string
  accountId?: string
  contactId?: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'accepted' | 'expired'
  createdAt: string
  validUntil?: string
  createdBy: string
  attachments?: Attachment[]
}

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  companyName?: string
}

interface QuoteAttachmentManagerProps {
  leadId: string
  companyId: string
  userId: string
  onClose?: () => void
}

export function QuoteAttachmentManager({ leadId, companyId, userId, onClose }: QuoteAttachmentManagerProps) {
  const [availableQuotes, setAvailableQuotes] = useKV<Quote[]>(`company-quotes-${companyId}`, [])
  const [leadQuotes, setLeadQuotes] = useKV<string[]>(`lead-quotes-${leadId}`, [])
  const [leads, setLeads] = useKV<Lead[]>(`company-leads-${companyId}`, [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showQuoteSelector, setShowQuoteSelector] = useState(false)

  // Get current lead info
  const currentLead = leads.find(l => l.id === leadId)

  // Get attached quotes
  const attachedQuotes = availableQuotes.filter(quote => 
    leadQuotes.includes(quote.id) || quote.leadId === leadId
  )

  // Get available quotes for attachment (not already attached)
  const availableForAttachment = availableQuotes.filter(quote => 
    !leadQuotes.includes(quote.id) && 
    quote.leadId !== leadId &&
    (searchQuery === '' || 
     quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || quote.status === statusFilter)
  )

  // Load mock data if empty
  React.useEffect(() => {
    if (availableQuotes.length === 0) {
      const mockQuotes: Quote[] = Array.from({ length: 20 }, (_, i) => ({
        id: `quote-${i + 1}`,
        quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
        title: [
          'IT Infrastructure Upgrade',
          'Cloud Migration Services',
          'Software License Package',
          'Security Audit & Implementation',
          'Database Optimization',
          'Website Development',
          'Mobile App Development',
          'Digital Marketing Package',
          'Training & Consultation',
          'Support & Maintenance'
        ][i % 10],
        description: 'Comprehensive solution package',
        totalAmount: Math.floor(Math.random() * 100000) + 5000,
        currency: 'USD',
        status: ['draft', 'pending', 'approved', 'accepted', 'expired'][Math.floor(Math.random() * 5)] as any,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: userId,
        attachments: []
      }))
      setAvailableQuotes(mockQuotes)
    }

    if (leads.length === 0) {
      const mockLeads: Lead[] = [
        {
          id: leadId,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@techcorp.com',
          companyName: 'TechCorp Solutions'
        }
      ]
      setLeads(mockLeads)
    }
  }, [])

  const attachQuoteToLead = (quoteId: string) => {
    setLeadQuotes(prev => [...prev, quoteId])
    
    const quote = availableQuotes.find(q => q.id === quoteId)
    if (quote) {
      toast.success(`Quote ${quote.quoteNumber} attached to lead`)
    }
  }

  const detachQuoteFromLead = (quoteId: string) => {
    setLeadQuotes(prev => prev.filter(id => id !== quoteId))
    
    const quote = availableQuotes.find(q => q.id === quoteId)
    if (quote) {
      toast.success(`Quote ${quote.quoteNumber} detached from lead`)
    }
  }

  const createNewQuoteForLead = () => {
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quoteNumber: `Q-${String(availableQuotes.length + 1).padStart(4, '0')}`,
      leadId,
      title: `Quote for ${currentLead?.firstName} ${currentLead?.lastName}`,
      description: 'Custom quote generated from lead',
      totalAmount: 25000,
      currency: 'USD',
      status: 'draft',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: userId,
      attachments: []
    }

    setAvailableQuotes(prev => [newQuote, ...prev])
    setLeadQuotes(prev => [...prev, newQuote.id])
    
    toast.success(`New quote ${newQuote.quoteNumber} created and attached`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Quote Management for {currentLead?.firstName} {currentLead?.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage quotes attached to this lead and maintain historical data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createNewQuoteForLead}>
                <Plus size={16} className="mr-2" />
                Create New Quote
              </Button>
              <Button variant="outline" onClick={() => setShowQuoteSelector(true)}>
                <Link size={16} className="mr-2" />
                Attach Existing Quote
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Attached Quotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Attachment size={20} />
            Attached Quotes ({attachedQuotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attachedQuotes.length > 0 ? (
            <div className="space-y-4">
              {attachedQuotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{quote.quoteNumber}</h4>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                        <Badge variant="outline">
                          {quote.totalAmount.toLocaleString()} {quote.currency}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-sm mb-1">{quote.title}</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        {quote.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Created: {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                        </span>
                        {quote.validUntil && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Valid until: {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => detachQuoteFromLead(quote.id)}
                      >
                        Detach
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No quotes attached</h3>
              <p className="text-muted-foreground mb-4">
                Create a new quote or attach an existing one to keep track of all proposals for this lead
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={createNewQuoteForLead}>
                  <Plus size={16} className="mr-2" />
                  Create Quote
                </Button>
                <Button variant="outline" onClick={() => setShowQuoteSelector(true)}>
                  <Link size={16} className="mr-2" />
                  Attach Existing
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Selection Dialog */}
      <Dialog open={showQuoteSelector} onOpenChange={setShowQuoteSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Attach Existing Quote to Lead</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search quotes by number or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Available Quotes */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {availableForAttachment.length > 0 ? (
                  availableForAttachment.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-3 hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{quote.quoteNumber}</h4>
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                            <Badge variant="outline">
                              {quote.totalAmount.toLocaleString()} {quote.currency}
                            </Badge>
                          </div>
                          <h5 className="text-sm font-medium mb-1">{quote.title}</h5>
                          <p className="text-xs text-muted-foreground">
                            Created: {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            attachQuoteToLead(quote.id)
                            setShowQuoteSelector(false)
                          }}
                        >
                          <ArrowRight size={14} className="mr-1" />
                          Attach
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No quotes found matching your criteria</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuoteAttachmentManager