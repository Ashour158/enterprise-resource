import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { Contact, Deal, Activity } from '@/types/crm'
import { mockContacts, mockDeals, mockActivities } from '@/data/crmMockData'
import { 
  Users,
  TrendUp,
  Calendar,
  MagnifyingGlass as Search,
  Plus,
  Eye,
  PencilSimple as Edit,
  Phone,
  EnvelopeSimple as Mail,
  MapPin,
  Briefcase,
  Star,
  CheckCircle,
  Clock,
  XCircle
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface AccountActivityTrackerProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
  type: 'contacts' | 'deals' | 'activities'
}

export function AccountActivityTracker({
  accountId,
  companyId,
  userId,
  userRole,
  type
}: AccountActivityTrackerProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`account-contacts-${accountId}`, [])
  const [deals, setDeals] = useKV<Deal[]>(`account-deals-${accountId}`, [])
  const [activities, setActivities] = useKV<Activity[]>(`account-activities-${accountId}`, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Generate related data on first load
  useEffect(() => {
    if (contacts.length === 0) {
      const relatedContacts = mockContacts.filter(c => c.accountId === accountId)
      setContacts(relatedContacts)
    }
    if (deals.length === 0) {
      const relatedDeals = mockDeals.filter(d => d.accountId === accountId)
      setDeals(relatedDeals)
    }
    if (activities.length === 0) {
      const relatedActivities = mockActivities.filter(a => a.accountId === accountId)
      setActivities(relatedActivities)
    }
  }, [accountId, contacts.length, deals.length, activities.length, setContacts, setDeals, setActivities])

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'prospect': return 'bg-yellow-100 text-yellow-800'
      case 'lead': return 'bg-purple-100 text-purple-800'
      case 'churned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDealStatusColor = (stage: string) => {
    const normalizedStage = stage.toLowerCase()
    if (normalizedStage.includes('won') || normalizedStage.includes('closed won')) {
      return 'bg-green-100 text-green-800'
    }
    if (normalizedStage.includes('lost') || normalizedStage.includes('closed lost')) {
      return 'bg-red-100 text-red-800'
    }
    if (normalizedStage.includes('negotiation') || normalizedStage.includes('proposal')) {
      return 'bg-blue-100 text-blue-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={16} />
      case 'planned': return <Clock className="text-yellow-600" size={16} />
      case 'cancelled': return <XCircle className="text-red-600" size={16} />
      default: return <Clock className="text-gray-600" size={16} />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Filter and sort data based on type
  const getFilteredData = () => {
    let data: any[] = []
    
    switch (type) {
      case 'contacts':
        data = contacts.filter(contact => {
          const matchesSearch = searchTerm === '' || 
            `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
          
          const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
          
          return matchesSearch && matchesStatus
        })
        break
        
      case 'deals':
        data = deals.filter(deal => {
          const matchesSearch = searchTerm === '' || 
            deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.owner.toLowerCase().includes(searchTerm.toLowerCase())
          
          const matchesStatus = statusFilter === 'all' || deal.stage === statusFilter
          
          return matchesSearch && matchesStatus
        })
        break
        
      case 'activities':
        data = activities.filter(activity => {
          const matchesSearch = searchTerm === '' || 
            activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
          
          const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
          
          return matchesSearch && matchesStatus
        })
        break
    }

    // Sort data
    return data.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return type === 'contacts' 
            ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
            : (a.name || a.subject).localeCompare(b.name || b.subject)
        case 'recent':
          const aDate = a.updatedAt || a.createdAt || a.startDate
          const bDate = b.updatedAt || b.createdAt || b.startDate
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        case 'value':
          if (type === 'deals') {
            return b.value - a.value
          }
          return 0
        default:
          return 0
      }
    })
  }

  const filteredData = getFilteredData()

  const getStatusOptions = () => {
    switch (type) {
      case 'contacts':
        return [
          { value: 'all', label: 'All Statuses' },
          { value: 'lead', label: 'Lead' },
          { value: 'prospect', label: 'Prospect' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'customer', label: 'Customer' },
          { value: 'churned', label: 'Churned' }
        ]
      case 'deals':
        return [
          { value: 'all', label: 'All Stages' },
          { value: 'prospecting', label: 'Prospecting' },
          { value: 'qualification', label: 'Qualification' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'negotiation', label: 'Negotiation' },
          { value: 'closed_won', label: 'Closed Won' },
          { value: 'closed_lost', label: 'Closed Lost' }
        ]
      case 'activities':
        return [
          { value: 'all', label: 'All Statuses' },
          { value: 'planned', label: 'Planned' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'no_show', label: 'No Show' }
        ]
      default:
        return []
    }
  }

  const renderContactCard = (contact: Contact) => (
    <Card key={contact.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <ClickableDataElement
              type="contact"
              value={`${contact.firstName} ${contact.lastName}`}
              data={contact}
              className="font-semibold text-lg hover:text-primary cursor-pointer"
            />
            {contact.jobTitle && (
              <ClickableDataElement
                type="job_title"
                value={contact.jobTitle}
                data={contact}
                className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
              />
            )}
          </div>
          <Badge className={getContactStatusColor(contact.status)}>
            {contact.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <ClickableDataElement
              type="email"
              value={contact.email}
              data={contact}
              className="hover:text-primary cursor-pointer"
            />
          </div>
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-muted-foreground" />
              <ClickableDataElement
                type="phone"
                value={contact.phone}
                data={contact}
                className="hover:text-primary cursor-pointer"
              />
            </div>
          )}
          {contact.department && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={14} className="text-muted-foreground" />
              <span>{contact.department}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star size={12} className="text-yellow-500" />
            <span>Score: {contact.leadScore}/100</span>
          </div>
          <ClickableDataElement
            type="date"
            value={format(new Date(contact.updatedAt), 'MMM dd, yyyy')}
            data={{ date: contact.updatedAt }}
            className="hover:text-primary cursor-pointer"
          />
        </div>

        <div className="flex gap-2 mt-3 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye size={14} className="mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit size={14} className="mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderDealCard = (deal: Deal) => (
    <Card key={deal.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <ClickableDataElement
              type="deal"
              value={deal.name}
              data={deal}
              className="font-semibold text-lg hover:text-primary cursor-pointer"
            />
            <div className="text-sm text-muted-foreground">
              <ClickableDataElement
                type="user"
                value={deal.owner}
                data={{ userId: deal.owner }}
                className="hover:text-primary cursor-pointer"
              />
            </div>
          </div>
          <Badge className={getDealStatusColor(deal.stage)}>
            {deal.stage.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Value:</span>
            <ClickableDataElement
              type="currency"
              value={formatCurrency(deal.value)}
              data={deal}
              className="font-semibold hover:text-primary cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Probability:</span>
            <span className="font-semibold">{deal.probability}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Close Date:</span>
            <ClickableDataElement
              type="date"
              value={format(new Date(deal.closeDate), 'MMM dd, yyyy')}
              data={{ date: deal.closeDate }}
              className="hover:text-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <TrendUp size={12} />
            <span>Weighted: {formatCurrency(deal.value * deal.probability / 100)}</span>
          </div>
          <span>{deal.type.replace('_', ' ')}</span>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye size={14} className="mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit size={14} className="mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderActivityCard = (activity: Activity) => (
    <Card key={activity.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getActivityStatusIcon(activity.status)}
              <ClickableDataElement
                type="activity"
                value={activity.subject}
                data={activity}
                className="font-semibold hover:text-primary cursor-pointer"
              />
            </div>
            <Badge variant="outline" className="text-xs">
              {activity.type}
            </Badge>
          </div>
          <Badge
            variant={
              activity.status === 'completed'
                ? 'default'
                : activity.status === 'cancelled'
                ? 'destructive'
                : 'secondary'
            }
          >
            {activity.status}
          </Badge>
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-muted-foreground" />
            <ClickableDataElement
              type="date"
              value={format(new Date(activity.startDate), 'MMM dd, yyyy HH:mm')}
              data={{ date: activity.startDate }}
              className="hover:text-primary cursor-pointer"
            />
          </div>
          {activity.duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-muted-foreground" />
              <span>{activity.duration} minutes</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="text-muted-foreground" />
            <ClickableDataElement
              type="user"
              value={activity.assignedTo}
              data={{ userId: activity.assignedTo }}
              className="hover:text-primary cursor-pointer"
            />
          </div>
          {activity.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-muted-foreground" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <Badge
            variant="outline"
            className={
              activity.priority === 'urgent'
                ? 'border-red-200 text-red-700'
                : activity.priority === 'high'
                ? 'border-orange-200 text-orange-700'
                : ''
            }
          >
            {activity.priority} priority
          </Badge>
          {activity.outcome && (
            <Badge
              variant={
                activity.outcome === 'positive'
                  ? 'default'
                  : activity.outcome === 'negative'
                  ? 'destructive'
                  : 'secondary'
              }
              className="text-xs"
            >
              {activity.outcome}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye size={14} className="mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit size={14} className="mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const getTitle = () => {
    switch (type) {
      case 'contacts': return 'Account Contacts'
      case 'deals': return 'Account Deals'
      case 'activities': return 'Account Activities'
      default: return 'Account Data'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'contacts': return 'All contacts associated with this account'
      case 'deals': return 'Sales opportunities and deals for this account'
      case 'activities': return 'All activities and interactions with this account'
      default: return 'Account related information'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'contacts': return <Users size={20} />
      case 'deals': return <TrendUp size={20} />
      case 'activities': return <Calendar size={20} />
      default: return <Users size={20} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getDescription()} ({filteredData.length})
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add {type.slice(0, -1)}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                {type === 'deals' && <SelectItem value="value">Value</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => {
            switch (type) {
              case 'contacts':
                return renderContactCard(item as Contact)
              case 'deals':
                return renderDealCard(item as Deal)
              case 'activities':
                return renderActivityCard(item as Activity)
              default:
                return null
            }
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            {getIcon()}
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No {type} found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : `There are no ${type} associated with this account yet.`}
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Add {type.slice(0, -1)}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}