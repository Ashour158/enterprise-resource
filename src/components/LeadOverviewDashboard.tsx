import React, { useState, useMemo } from 'react'
import { Lead, LeadSource } from '@/types/lead'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Star, 
  TrendUp, 
  TrendDown, 
  Phone, 
  Mail, 
  Calendar,
  Target,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  SortAsc,
  SortDesc
} from '@phosphor-icons/react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface LeadOverviewDashboardProps {
  leads: Lead[]
  leadSources: LeadSource[]
  selectedLeads: string[]
  onLeadSelect: (lead: Lead) => void
  onLeadUpdate: (lead: Lead) => void
  onSelectionChange: (selectedIds: string[]) => void
  companyId: string
  userId: string
  userRole: string
}

export function LeadOverviewDashboard({ 
  leads, 
  leadSources, 
  selectedLeads, 
  onLeadSelect, 
  onLeadUpdate, 
  onSelectionChange,
  companyId,
  userId,
  userRole 
}: LeadOverviewDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortBy, setSortBy] = useState<keyof Lead>('ai_lead_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Advanced filters
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 })
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.job_title?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const statusMatch = statusFilter === 'all' || lead.lead_status === statusFilter

      // Rating filter
      const ratingMatch = ratingFilter === 'all' || lead.lead_rating === ratingFilter

      // Source filter
      const sourceMatch = sourceFilter === 'all' || lead.lead_source_id === sourceFilter

      // Score range filter
      const scoreMatch = lead.ai_lead_score >= scoreRange.min && lead.ai_lead_score <= scoreRange.max

      // Date range filter
      let dateMatch = true
      if (dateRange.start && dateRange.end) {
        const leadDate = new Date(lead.created_at)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        dateMatch = leadDate >= startDate && leadDate <= endDate
      }

      return searchMatch && statusMatch && ratingMatch && sourceMatch && scoreMatch && dateMatch
    })

    // Sort filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    return filtered
  }, [leads, searchTerm, statusFilter, ratingFilter, sourceFilter, sortBy, sortOrder, scoreRange, dateRange])

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredLeads.map(lead => lead.id))
    }
  }

  const handleSelectLead = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      onSelectionChange(selectedLeads.filter(id => id !== leadId))
    } else {
      onSelectionChange([...selectedLeads, leadId])
    }
  }

  const handleSort = (column: keyof Lead) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleQuickAction = (lead: Lead, action: string) => {
    switch (action) {
      case 'call':
        toast.info(`Initiating call to ${lead.full_name}`)
        break
      case 'email':
        toast.info(`Opening email to ${lead.email}`)
        break
      case 'schedule':
        toast.info(`Opening calendar to schedule meeting with ${lead.full_name}`)
        break
      case 'convert':
        // Here you would navigate to deal creation
        toast.success(`Converting ${lead.full_name} to deal`)
        break
      default:
        break
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'unqualified': return 'bg-red-100 text-red-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'lost': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'hot': return <Star size={16} className="text-red-500 fill-current" />
      case 'warm': return <Star size={16} className="text-yellow-500 fill-current" />
      case 'cold': return <Star size={16} className="text-blue-500" />
      default: return <Star size={16} className="text-gray-400" />
    }
  }

  const SortIcon = ({ column }: { column: keyof Lead }) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Lead Search & Filters
          </CardTitle>
          <CardDescription>
            Find and filter leads using advanced search criteria and AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {leadSources.map(source => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.source_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Advanced Filters
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">AI Score Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={scoreRange.min}
                    onChange={(e) => setScoreRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={scoreRange.max}
                    onChange={(e) => setScoreRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                    className="w-20"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Created Date Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setScoreRange({ min: 0, max: 100 })
                    setDateRange({ start: '', end: '' })
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Lead Pipeline
              </CardTitle>
              <CardDescription>
                AI-scored leads with real-time insights and conversion tracking
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedLeads.length > 0 && (
                <Badge variant="secondary">
                  {selectedLeads.length} selected
                </Badge>
              )}
              <Button size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-1">
                      Lead
                      <SortIcon column="full_name" />
                    </div>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('ai_lead_score')}
                  >
                    <div className="flex items-center gap-1">
                      AI Score
                      <SortIcon column="ai_lead_score" />
                    </div>
                  </TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onLeadSelect(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {lead.first_name[0]}{lead.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.full_name}</div>
                          <div className="text-sm text-muted-foreground">{lead.job_title}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.company_name}</div>
                        <div className="text-sm text-muted-foreground">{lead.industry}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreBgColor(lead.ai_lead_score)}`}>
                          <span className={getScoreColor(lead.ai_lead_score)}>
                            {Math.round(lead.ai_lead_score)}
                          </span>
                        </div>
                        <Progress 
                          value={lead.ai_lead_score} 
                          className="w-16 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingIcon(lead.lead_rating)}
                        <span className="capitalize text-sm">{lead.lead_rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.lead_status)}>
                        {lead.lead_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {leadSources.find(s => s.id === lead.lead_source_id)?.source_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.last_contact_date 
                          ? new Date(lead.last_contact_date).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAction(lead, 'call')}
                          className="h-8 w-8 p-0"
                        >
                          <Phone size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAction(lead, 'email')}
                          className="h-8 w-8 p-0"
                        >
                          <Mail size={14} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onLeadSelect(lead)}>
                              <Eye size={14} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction(lead, 'schedule')}>
                              <Calendar size={14} className="mr-2" />
                              Schedule Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction(lead, 'convert')}>
                              <TrendUp size={14} className="mr-2" />
                              Convert to Deal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLeads.length === 0 && (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all' || sourceFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters'
                    : 'Get started by adding your first lead'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}