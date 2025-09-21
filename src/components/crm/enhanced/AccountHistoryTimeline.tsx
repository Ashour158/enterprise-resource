import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { 
  ClockClockwise as History,
  MagnifyingGlass as Search,
  FunnelSimple as Filter,
  EnvelopeSimple as Mail,
  Phone,
  CalendarBlank as Calendar,
  FileText,
  CurrencyDollar as DollarSign,
  Users,
  TrendUp,
  TrendDown,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Eye,
  Download,
  Share,
  Chat
} from '@phosphor-icons/react'
import { format, formatDistanceToNow } from 'date-fns'

interface AccountHistoryEntry {
  id: string
  accountId: string
  type: 'created' | 'updated' | 'email_sent' | 'email_received' | 'meeting_held' | 'quote_sent' | 'quote_accepted' | 'quote_rejected' | 'deal_won' | 'deal_lost' | 'payment_received' | 'support_ticket' | 'document_shared' | 'contact_added' | 'status_changed' | 'note_added' | 'call_made' | 'demo_scheduled' | 'proposal_sent' | 'contract_signed' | 'renewal_completed' | 'churn_prevented' | 'upsell_opportunity'
  title: string
  description: string
  metadata: {
    amount?: number
    contactId?: string
    contactName?: string
    dealId?: string
    dealName?: string
    quoteId?: string
    quoteNumber?: string
    documentId?: string
    documentName?: string
    oldValue?: any
    newValue?: any
    relatedData?: any
    emailSubject?: string
    meetingDuration?: number
    callDuration?: number
    outcome?: 'positive' | 'neutral' | 'negative'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }
  performedBy: string
  performedByName?: string
  performedAt: string
  visibility: 'public' | 'internal' | 'admin'
  tags: string[]
  impact: 'low' | 'medium' | 'high'
  sentiment?: 'positive' | 'neutral' | 'negative'
  category: 'communication' | 'sales' | 'support' | 'financial' | 'administrative' | 'marketing'
  attachments?: {
    id: string
    name: string
    type: string
    url: string
    size: number
  }[]
}

interface AccountHistoryTimelineProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
}

export function AccountHistoryTimeline({
  accountId,
  companyId,
  userId,
  userRole
}: AccountHistoryTimelineProps) {
  const [historyEntries, setHistoryEntries] = useKV<AccountHistoryEntry[]>(
    `account-history-${accountId}`, 
    []
  )
  const [filteredEntries, setFilteredEntries] = useState<AccountHistoryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [timeRangeFilter, setTimeRangeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Generate comprehensive mock history data on first load
  useEffect(() => {
    if (historyEntries.length === 0) {
      const mockHistory = generateComprehensiveHistory(accountId)
      setHistoryEntries(mockHistory)
    }
  }, [accountId, historyEntries.length, setHistoryEntries])

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = historyEntries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.performedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(entry => entry.category === categoryFilter)
    }

    // Time range filter
    if (timeRangeFilter !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (timeRangeFilter) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (timeRangeFilter !== 'all') {
        filtered = filtered.filter(entry => new Date(entry.performedAt) >= cutoffDate)
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    
    setFilteredEntries(filtered)
  }, [historyEntries, searchTerm, typeFilter, categoryFilter, timeRangeFilter])

  const generateComprehensiveHistory = (accountId: string): AccountHistoryEntry[] => {
    const types: AccountHistoryEntry['type'][] = [
      'email_sent', 'email_received', 'meeting_held', 'quote_sent', 'quote_accepted',
      'quote_rejected', 'deal_won', 'deal_lost', 'payment_received', 'support_ticket',
      'document_shared', 'contact_added', 'status_changed', 'note_added', 'call_made',
      'demo_scheduled', 'proposal_sent', 'contract_signed', 'renewal_completed'
    ]

    const categories: AccountHistoryEntry['category'][] = [
      'communication', 'sales', 'support', 'financial', 'administrative', 'marketing'
    ]

    const contacts = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis']
    const performers = ['Alice Cooper', 'Bob Anderson', 'Carol White', 'David Brown']

    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]
      const performedBy = performers[Math.floor(Math.random() * performers.length)]
      const contact = contacts[Math.floor(Math.random() * contacts.length)]
      
      const daysAgo = Math.floor(Math.random() * 365)
      const performedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

      return {
        id: `hist_${accountId}_${i}`,
        accountId,
        type,
        title: getHistoryTitle(type, contact),
        description: getHistoryDescription(type, contact),
        metadata: {
          contactName: contact,
          contactId: `contact_${i}`,
          amount: ['payment_received', 'deal_won'].includes(type) ? Math.floor(Math.random() * 100000) + 1000 : undefined,
          dealName: type.includes('deal') ? `Deal ${i + 1}` : undefined,
          quoteNumber: type.includes('quote') ? `Q-2024-${String(i + 1).padStart(3, '0')}` : undefined,
          emailSubject: type.includes('email') ? `Subject for email ${i + 1}` : undefined,
          meetingDuration: type === 'meeting_held' ? Math.floor(Math.random() * 120) + 30 : undefined,
          callDuration: type === 'call_made' ? Math.floor(Math.random() * 60) + 5 : undefined,
          outcome: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        },
        performedBy: `user_${Math.floor(Math.random() * 4) + 1}`,
        performedByName: performedBy,
        performedAt,
        visibility: 'public',
        tags: ['customer', 'important', 'follow-up'].slice(0, Math.floor(Math.random() * 3) + 1),
        impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative',
        category,
        attachments: Math.random() > 0.7 ? [{
          id: `att_${i}`,
          name: `Document_${i + 1}.pdf`,
          type: 'application/pdf',
          url: `/documents/doc_${i}.pdf`,
          size: Math.floor(Math.random() * 1000000) + 10000
        }] : undefined
      }
    })
  }

  const getHistoryTitle = (type: AccountHistoryEntry['type'], contact: string): string => {
    switch (type) {
      case 'email_sent': return `Email sent to ${contact}`
      case 'email_received': return `Email received from ${contact}`
      case 'meeting_held': return `Meeting with ${contact}`
      case 'quote_sent': return `Quote sent to ${contact}`
      case 'quote_accepted': return `Quote accepted by ${contact}`
      case 'quote_rejected': return `Quote rejected by ${contact}`
      case 'deal_won': return `Deal won with ${contact}`
      case 'deal_lost': return `Deal lost with ${contact}`
      case 'payment_received': return `Payment received from ${contact}`
      case 'support_ticket': return `Support ticket created by ${contact}`
      case 'document_shared': return `Document shared with ${contact}`
      case 'contact_added': return `New contact added: ${contact}`
      case 'call_made': return `Call with ${contact}`
      case 'demo_scheduled': return `Demo scheduled with ${contact}`
      case 'proposal_sent': return `Proposal sent to ${contact}`
      case 'contract_signed': return `Contract signed by ${contact}`
      default: return `Activity with ${contact}`
    }
  }

  const getHistoryDescription = (type: AccountHistoryEntry['type'], contact: string): string => {
    switch (type) {
      case 'email_sent': return `Sent follow-up email regarding the proposal to ${contact}`
      case 'email_received': return `Received response from ${contact} about the proposal`
      case 'meeting_held': return `Productive meeting to discuss requirements and next steps`
      case 'quote_sent': return `Sent detailed quote for the requested services`
      case 'quote_accepted': return `Quote was accepted and ready to proceed`
      case 'quote_rejected': return `Quote was rejected, following up with revised proposal`
      case 'deal_won': return `Successfully closed the deal after thorough negotiations`
      case 'deal_lost': return `Deal was lost to competitor, documenting lessons learned`
      case 'payment_received': return `Payment received on time as per the agreed terms`
      case 'support_ticket': return `Support ticket raised for technical assistance`
      case 'document_shared': return `Shared technical documentation and implementation guide`
      case 'contact_added': return `Added new contact to the account for better coordination`
      case 'call_made': return `Follow-up call to discuss project status and next milestones`
      case 'demo_scheduled': return `Scheduled product demo for decision makers`
      case 'proposal_sent': return `Comprehensive proposal sent with pricing and timeline`
      case 'contract_signed': return `Contract has been signed and project can commence`
      default: return `General activity recorded for account management`
    }
  }

  const getTypeIcon = (type: AccountHistoryEntry['type']) => {
    switch (type) {
      case 'email_sent':
      case 'email_received':
        return <Mail size={16} />
      case 'meeting_held':
      case 'demo_scheduled':
        return <Calendar size={16} />
      case 'call_made':
        return <Phone size={16} />
      case 'quote_sent':
      case 'quote_accepted':
      case 'quote_rejected':
      case 'proposal_sent':
        return <FileText size={16} />
      case 'deal_won':
        return <TrendUp size={16} />
      case 'deal_lost':
        return <TrendDown size={16} />
      case 'payment_received':
        return <DollarSign size={16} />
      case 'contact_added':
        return <Users size={16} />
      case 'document_shared':
        return <Share size={16} />
      case 'contract_signed':
        return <CheckCircle size={16} />
      case 'support_ticket':
        return <Warning size={16} />
      default:
        return <Info size={16} />
    }
  }

  const getTypeColor = (type: AccountHistoryEntry['type']) => {
    switch (type) {
      case 'deal_won':
      case 'quote_accepted':
      case 'payment_received':
      case 'contract_signed':
        return 'text-green-600'
      case 'deal_lost':
      case 'quote_rejected':
        return 'text-red-600'
      case 'email_sent':
      case 'email_received':
      case 'meeting_held':
      case 'call_made':
        return 'text-blue-600'
      case 'support_ticket':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="text-green-600" size={14} />
      case 'negative': return <XCircle className="text-red-600" size={14} />
      default: return <Info className="text-yellow-600" size={14} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History size={20} />
            Complete History Timeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive tracking of all account interactions and activities
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search timeline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email_sent">Email Sent</SelectItem>
                  <SelectItem value="email_received">Email Received</SelectItem>
                  <SelectItem value="meeting_held">Meeting</SelectItem>
                  <SelectItem value="call_made">Call</SelectItem>
                  <SelectItem value="deal_won">Deal Won</SelectItem>
                  <SelectItem value="deal_lost">Deal Lost</SelectItem>
                  <SelectItem value="quote_sent">Quote Sent</SelectItem>
                  <SelectItem value="payment_received">Payment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setTypeFilter('all')
                setCategoryFilter('all')
                setTimeRangeFilter('all')
              }}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredEntries.filter(e => e.category === 'communication').length}
            </div>
            <div className="text-sm text-muted-foreground">Communications</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredEntries.filter(e => e.category === 'sales').length}
            </div>
            <div className="text-sm text-muted-foreground">Sales Activities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredEntries.filter(e => e.impact === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Impact</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Chronological view of all account interactions with full context and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Timeline connector */}
                  {index < filteredEntries.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-16 bg-border" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot with icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center ${getTypeColor(entry.type)}`}>
                      {getTypeIcon(entry.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <ClickableDataElement
                                type="activity"
                                value={entry.title}
                                data={entry}
                                className="font-semibold hover:text-primary cursor-pointer"
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {entry.type.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getImpactColor(entry.impact)}`}>
                                  {entry.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {entry.category}
                                </Badge>
                                {entry.sentiment && (
                                  <div className="flex items-center gap-1">
                                    {getSentimentIcon(entry.sentiment)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-muted-foreground">
                              <ClickableDataElement
                                type="date"
                                value={format(new Date(entry.performedAt), 'MMM dd, yyyy')}
                                data={{ date: entry.performedAt }}
                                className="hover:text-primary cursor-pointer block"
                              />
                              <div className="text-xs">
                                {formatDistanceToNow(new Date(entry.performedAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {entry.description}
                          </p>

                          {/* Metadata */}
                          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div className="space-y-2 mb-3">
                              {entry.metadata.contactName && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Users size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Contact:</span>
                                  <ClickableDataElement
                                    type="contact"
                                    value={entry.metadata.contactName}
                                    data={{ contactId: entry.metadata.contactId }}
                                    className="hover:text-primary cursor-pointer"
                                  />
                                </div>
                              )}
                              
                              {entry.metadata.amount && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Amount:</span>
                                  <ClickableDataElement
                                    type="currency"
                                    value={`$${entry.metadata.amount.toLocaleString()}`}
                                    data={{ amount: entry.metadata.amount }}
                                    className="font-medium hover:text-primary cursor-pointer"
                                  />
                                </div>
                              )}
                              
                              {entry.metadata.dealName && (
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendUp size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Deal:</span>
                                  <ClickableDataElement
                                    type="deal"
                                    value={entry.metadata.dealName}
                                    data={{ dealId: entry.metadata.dealId }}
                                    className="hover:text-primary cursor-pointer"
                                  />
                                </div>
                              )}
                              
                              {entry.metadata.quoteNumber && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Quote:</span>
                                  <ClickableDataElement
                                    type="quote"
                                    value={entry.metadata.quoteNumber}
                                    data={{ quoteId: entry.metadata.quoteId }}
                                    className="hover:text-primary cursor-pointer"
                                  />
                                </div>
                              )}
                              
                              {entry.metadata.emailSubject && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Subject:</span>
                                  <span className="italic">{entry.metadata.emailSubject}</span>
                                </div>
                              )}
                              
                              {entry.metadata.meetingDuration && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span>{entry.metadata.meetingDuration} minutes</span>
                                </div>
                              )}
                              
                              {entry.metadata.callDuration && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span>{entry.metadata.callDuration} minutes</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Attachments */}
                          {entry.attachments && entry.attachments.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <div className="text-sm font-medium">Attachments:</div>
                              {entry.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <FileText size={14} />
                                  <ClickableDataElement
                                    type="document"
                                    value={attachment.name}
                                    data={attachment}
                                    className="flex-1 text-sm hover:text-primary cursor-pointer"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Download size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tags */}
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {entry.tags.map((tag) => (
                                <ClickableDataElement
                                  key={tag}
                                  type="tag"
                                  value={tag}
                                  data={{ tag, accountId: entry.accountId }}
                                  render={(value) => (
                                    <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer">
                                      {value}
                                    </Badge>
                                  )}
                                />
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entry.performedByName || 'User')}&size=20`} />
                                <AvatarFallback className="text-xs">
                                  {(entry.performedByName || 'U').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <ClickableDataElement
                                type="user"
                                value={entry.performedByName || 'Unknown User'}
                                data={{ userId: entry.performedBy }}
                                className="hover:text-primary cursor-pointer"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Eye size={12} className="mr-1" />
                                View Details
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Chat size={12} className="mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEntries.length === 0 && (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No activities found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms to see more results.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}