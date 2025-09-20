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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lead, LeadActivity, CRMFile } from '@/types/crm'
import { 
  Plus, 
  MagnifyingGlass as Search, 
  Funnel as Filter, 
  Download, 
  Upload, 
  Phone, 
  EnvelopeSimple as Mail, 
  Calendar,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  TrendUp,
  Clock,
  User,
  Building,
  MapPin,
  Star,
  Tag,
  FileText,
  Paperclip
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadManagementProps {
  companyId: string
  userId: string
  userRole: string
  onScheduleMeeting?: (leadId: string) => void
  onCreateDeal?: (leadId: string) => void
}

const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    company: 'Tech Solutions Inc',
    title: 'CTO',
    source: 'Website',
    status: 'new',
    score: 85,
    estimatedValue: 50000,
    assignedTo: 'user-001',
    tags: ['enterprise', 'software'],
    notes: 'Interested in our enterprise package',
    customFields: {
      industry: 'Technology',
      employees: '50-100',
      location: 'New York, NY'
    },
    activities: [],
    files: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContactDate: new Date('2024-01-18'),
    nextFollowUpDate: new Date('2024-01-25')
  },
  {
    id: 'lead-002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@company.com',
    phone: '+1-555-0456',
    company: 'Marketing Pro',
    title: 'Marketing Director',
    source: 'LinkedIn',
    status: 'qualified',
    score: 72,
    estimatedValue: 25000,
    assignedTo: 'user-002',
    tags: ['marketing', 'mid-market'],
    notes: 'Looking for marketing automation tools',
    customFields: {
      industry: 'Marketing',
      employees: '10-50',
      location: 'San Francisco, CA'
    },
    activities: [],
    files: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
    lastContactDate: new Date('2024-01-20'),
    nextFollowUpDate: new Date('2024-01-27')
  }
]

export function LeadManagement({ companyId, userId, userRole, onScheduleMeeting, onCreateDeal }: LeadManagementProps) {
  const [leads, setLeads] = useKV<Lead[]>(`leads-${companyId}`, mockLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [files, setFiles] = useState<FileList | null>(null)

  const leadStatuses = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
    { value: 'converted', label: 'Converted', color: 'bg-purple-500' },
    { value: 'lost', label: 'Lost', color: 'bg-red-500' }
  ]

  const leadSources = ['Website', 'LinkedIn', 'Cold Call', 'Referral', 'Trade Show', 'Email Campaign', 'Social Media']

  const filteredLeads = (leads || []).filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const handleCreateLead = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in required fields')
      return
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || '',
      company: formData.company || '',
      title: formData.title || '',
      source: formData.source || 'Manual',
      status: 'new',
      score: 0,
      estimatedValue: formData.estimatedValue || 0,
      assignedTo: userId,
      tags: formData.tags || [],
      notes: formData.notes || '',
      customFields: formData.customFields || {},
      activities: [],
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactDate: null,
      nextFollowUpDate: null
    }

    setLeads(current => [...(current || []), newLead])
    setFormData({})
    setShowLeadForm(false)
    toast.success('Lead created successfully')
  }

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(current => {
      if (!current) return []
      return current.map(lead =>
        lead.id === leadId
          ? { ...lead, ...updates, updatedAt: new Date() }
          : lead
      )
    })
    toast.success('Lead updated successfully')
  }

  const handleDeleteLead = (leadId: string) => {
    setLeads(current => {
      if (!current) return []
      return current.filter(lead => lead.id !== leadId)
    })
    toast.success('Lead deleted successfully')
  }

  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate CSV parsing
    toast.success('Bulk import started. Processing leads...')
    // In real implementation, parse CSV and create leads
  }

  const handleBulkExport = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Source', 'Status', 'Score'],
      ...filteredLeads.map(lead => [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.company,
        lead.title,
        lead.source,
        lead.status,
        lead.score.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Leads exported successfully')
  }

  const handleFileUpload = (leadId: string, files: FileList) => {
    // Simulate file upload
    if (files) {
      Array.from(files).forEach(file => {
        const crmFile: CRMFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedBy: userId,
          uploadedAt: new Date(),
          tags: []
        }

        const currentLeads = leads || []
        const targetLead = currentLeads.find(l => l.id === leadId)
        if (targetLead) {
          handleUpdateLead(leadId, {
            files: [...(targetLead.files || []), crmFile]
          })
        }
      })
    }
    toast.success('Files uploaded successfully')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = leadStatuses.find(s => s.value === status)
    return (
      <Badge variant="outline" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search leads..."
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
              {leadStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {leadSources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Leads</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkImport}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a CSV file with columns: First Name, Last Name, Email, Phone, Company, Title, Source
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Value</Label>
                  <Input
                    type="number"
                    value={formData.estimatedValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowLeadForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLead}>
                  Create Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Manage and track your sales leads through the qualification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                      <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.company}</div>
                      <div className="text-sm text-muted-foreground">{lead.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className={getScoreColor(lead.score)} size={16} />
                      <span className={getScoreColor(lead.score)}>{lead.score}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${lead.estimatedValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {lead.lastContactDate ? (
                      <div className="text-sm">
                        {lead.lastContactDate.toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => {}}>
                        <Phone size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {}}>
                        <Mail size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onScheduleMeeting?.(lead.id)}
                      >
                        <Calendar size={14} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCreateDeal?.(lead.id)}>
                            <TrendUp size={14} className="mr-2" />
                            Convert to Deal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)}>
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

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedLead.firstName} {selectedLead.lastName} - {selectedLead.company}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{selectedLead.firstName} {selectedLead.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{selectedLead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{selectedLead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building size={14} />
                          <span>{selectedLead.company} - {selectedLead.title}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Lead Information</Label>
                      <div className="mt-2 space-y-2">
                        <div>Source: <Badge variant="outline">{selectedLead.source}</Badge></div>
                        <div>Status: {getStatusBadge(selectedLead.status)}</div>
                        <div>Score: <span className={getScoreColor(selectedLead.score)}>{selectedLead.score}</span></div>
                        <div>Est. Value: ${selectedLead.estimatedValue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedLead.notes && (
                    <div>
                      <Label>Notes</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        {selectedLead.notes}
                      </div>
                    </div>
                  )}

                  {selectedLead.tags.length > 0 && (
                    <div>
                      <Label>Tags</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedLead.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <Clock size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No activities recorded yet</p>
                    <Button variant="outline" className="mt-4">
                      <Plus size={16} className="mr-2" />
                      Log Activity
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Attachments ({selectedLead.files.length})</Label>
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(selectedLead.id, e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer">
                          <Paperclip size={16} className="mr-2" />
                          Add Files
                        </Button>
                      </label>
                    </div>
                  </div>
                  
                  {selectedLead.files.length > 0 ? (
                    <div className="space-y-2">
                      {selectedLead.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText size={16} />
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB - {file.uploadedAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No files attached</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}