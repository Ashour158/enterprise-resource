import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Quote, Account, Contact } from '@/types/crm'
import { 
  Eye,
  PencilSimple as Edit,
  Trash,
  Copy,
  DotsThreeVertical as MoreVertical,
  CurrencyDollar as DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  PaperPlaneTilt as Send,
  User,
  Buildings
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteListProps {
  quotes: Quote[]
  accounts: Account[]
  contacts: Contact[]
  searchQuery: string
  statusFilter: string
  onEdit: (quote: Quote) => void
  onDelete: (quoteId: string) => void
  onDuplicate: (quote: Quote) => void
}

export function QuoteList({ 
  quotes, 
  accounts, 
  contacts, 
  searchQuery, 
  statusFilter, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: QuoteListProps) {
  
  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'No Account'
    const account = accounts.find(a => a.id === accountId)
    return account?.name || 'Unknown Account'
  }

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'No Contact'
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === '' || 
      quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAccountName(quote.accountId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getContactName(quote.contactId).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: <Edit size={12} />, label: 'Draft' },
      sent: { variant: 'default' as const, icon: <Send size={12} />, label: 'Sent' },
      accepted: { variant: 'default' as const, icon: <CheckCircle size={12} />, label: 'Accepted' },
      declined: { variant: 'destructive' as const, icon: <XCircle size={12} />, label: 'Declined' },
      expired: { variant: 'outline' as const, icon: <Warning size={12} />, label: 'Expired' },
      pending: { variant: 'outline' as const, icon: <Clock size={12} />, label: 'Pending' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getExpiryStatus = (validUntil: Date) => {
    const now = new Date()
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', message: 'Expired', color: 'text-red-600' }
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', message: `Expires in ${daysUntilExpiry} days`, color: 'text-orange-600' }
    } else {
      return { status: 'valid', message: `Expires in ${daysUntilExpiry} days`, color: 'text-green-600' }
    }
  }

  const handleView = (quote: Quote) => {
    toast.info(`Viewing quote ${quote.quoteNumber}`)
    // Would open quote preview
  }

  const handleSend = (quote: Quote) => {
    toast.success(`Quote ${quote.quoteNumber} sent successfully`)
    // Would trigger email sending
  }

  if (filteredQuotes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-muted-foreground">
            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No quotes found</h3>
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Create your first quote to get started'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => {
              const expiryStatus = getExpiryStatus(quote.validUntil)
              
              return (
                <TableRow key={quote.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm font-medium">
                    {quote.quoteNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote.title}</p>
                      {quote.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {quote.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Buildings size={14} className="text-muted-foreground" />
                      <span className="text-sm">{getAccountName(quote.accountId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-muted-foreground" />
                      <span className="text-sm">{getContactName(quote.contactId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-muted-foreground" />
                      <span className="font-medium">
                        {quote.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {quote.currency}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(quote.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      <div>
                        <p className={`text-sm font-medium ${expiryStatus.color}`}>
                          {expiryStatus.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quote.validUntil.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{quote.createdAt.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {quote.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(quote)}>
                          <Eye size={14} className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(quote)}>
                          <Edit size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(quote)}>
                          <Copy size={14} className="mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {quote.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleSend(quote)}>
                            <Send size={14} className="mr-2" />
                            Send
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDelete(quote.id)}
                          className="text-destructive"
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}