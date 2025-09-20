import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockContacts } from '@/data/crmMockData'
import { Contact } from '@/types/crm'
import { MagnifyingGlass as Search, Plus, Phone, EnvelopeSimple as Mail, Star, MapPin, Funnel as Filter } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ContactManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function ContactManagement({ companyId, userId, userRole }: ContactManagementProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`contacts-${companyId}`, mockContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const safeContacts = contacts || mockContacts

  const filteredContacts = safeContacts
    .filter(contact => {
      const matchesSearch = searchQuery === '' || 
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'email':
          return a.email.localeCompare(b.email)
        case 'score':
          return b.leadScore - a.leadScore
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200'
      case 'customer': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'churned': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleContactAction = (action: string, contact: Contact) => {
    switch (action) {
      case 'call':
        toast.success(`Initiating call to ${contact.firstName} ${contact.lastName}`)
        break
      case 'email':
        toast.success(`Opening email composer for ${contact.email}`)
        break
      case 'edit':
        toast.info(`Opening contact editor for ${contact.firstName} ${contact.lastName}`)
        break
      default:
        toast.info(`Action: ${action}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Management</h2>
          <p className="text-muted-foreground">
            Manage your customer contacts and leads ({filteredContacts.length} of {safeContacts.length} contacts)
          </p>
        </div>
        <Button onClick={() => toast.info('Opening new contact form')}>
          <Plus size={16} className="mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="score">Lead Score</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => toast.info('Advanced filters coming soon')}>
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.email}
                      </div>
                      {contact.jobTitle && (
                        <div className="text-sm text-muted-foreground">
                          {contact.jobTitle}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {contact.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getScoreColor(contact.leadScore)}`}>
                        {contact.leadScore}
                      </span>
                      {contact.leadScore >= 80 && <Star size={14} className="text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {contact.leadSource.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.lastContactDate ? (
                        <div>
                          <div>{new Date(contact.lastContactDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(contact.lastContactDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactAction('call', contact)}
                        title="Call contact"
                      >
                        <Phone size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactAction('email', contact)}
                        title="Send email"
                      >
                        <Mail size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactAction('edit', contact)}
                        title="Edit contact"
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No contacts found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {safeContacts.filter(c => c.status === 'lead').length}
              </div>
              <div className="text-sm text-muted-foreground">New Leads</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safeContacts.filter(c => c.status === 'qualified').length}
              </div>
              <div className="text-sm text-muted-foreground">Qualified Leads</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {safeContacts.filter(c => c.status === 'customer').length}
              </div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(safeContacts.reduce((sum, c) => sum + c.leadScore, 0) / safeContacts.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Lead Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}