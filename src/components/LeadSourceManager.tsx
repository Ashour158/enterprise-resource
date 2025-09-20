import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash, TrendUp, Target, Globe, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadSource {
  id: string
  companyId: string
  sourceName: string
  sourceType: string
  sourceDescription: string
  trackingCode: string
  costPerLead: number
  conversionRate: number
  aiPerformanceScore: number
  isActive: boolean
  createdBy: string
  createdAt: string
}

interface LeadSourceManagerProps {
  leadSources?: LeadSource[]
  leads?: any[]
  onSourceUpdate?: (sources: LeadSource[]) => void
  companyId: string
  userId: string
  userRole: string
}

const sourceTypes = [
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'referral', label: 'Referral' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'paid_advertising', label: 'Paid Advertising' },
  { value: 'content_marketing', label: 'Content Marketing' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' }
]

export function LeadSourceManager({ leadSources: propLeadSources, leads, onSourceUpdate, companyId, userId, userRole }: LeadSourceManagerProps) {
  const [leadSources, setLeadSources] = useKV<LeadSource[]>(`lead-sources-${companyId}`, propLeadSources || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState({
    sourceName: '',
    sourceType: '',
    sourceDescription: '',
    trackingCode: '',
    costPerLead: 0,
    conversionRate: 0
  })

  // Initialize with mock data if empty
  useEffect(() => {
    if (leadSources.length === 0) {
      const mockSources: LeadSource[] = [
        {
          id: 'src-001',
          companyId,
          sourceName: 'Company Website',
          sourceType: 'website',
          sourceDescription: 'Organic traffic from company website contact forms',
          trackingCode: 'WEB-ORGANIC',
          costPerLead: 25.50,
          conversionRate: 0.1250,
          aiPerformanceScore: 85.5,
          isActive: true,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        {
          id: 'src-002',
          companyId,
          sourceName: 'LinkedIn Campaigns',
          sourceType: 'social_media',
          sourceDescription: 'Sponsored posts and LinkedIn ads targeting decision makers',
          trackingCode: 'LI-SPONSORED',
          costPerLead: 45.00,
          conversionRate: 0.0875,
          aiPerformanceScore: 78.2,
          isActive: true,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        {
          id: 'src-003',
          companyId,
          sourceName: 'Google Ads',
          sourceType: 'paid_advertising',
          sourceDescription: 'Search and display campaigns on Google Ads platform',
          trackingCode: 'GADS-SEARCH',
          costPerLead: 35.75,
          conversionRate: 0.1050,
          aiPerformanceScore: 82.1,
          isActive: true,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        {
          id: 'src-004',
          companyId,
          sourceName: 'Trade Shows',
          sourceType: 'trade_show',
          sourceDescription: 'Industry conferences and trade show booth interactions',
          trackingCode: 'TRADE-2024',
          costPerLead: 125.00,
          conversionRate: 0.2200,
          aiPerformanceScore: 91.8,
          isActive: true,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        {
          id: 'src-005',
          companyId,
          sourceName: 'Email Newsletter',
          sourceType: 'email_campaign',
          sourceDescription: 'Monthly newsletter with call-to-action buttons',
          trackingCode: 'EMAIL-NEWSLETTER',
          costPerLead: 8.25,
          conversionRate: 0.0650,
          aiPerformanceScore: 73.4,
          isActive: true,
          createdBy: userId,
          createdAt: new Date().toISOString()
        }
      ]
      setLeadSources(mockSources)
    }
  }, [leadSources.length, companyId, userId, setLeadSources])

  const resetForm = () => {
    setFormData({
      sourceName: '',
      sourceType: '',
      sourceDescription: '',
      trackingCode: '',
      costPerLead: 0,
      conversionRate: 0
    })
    setEditingSource(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sourceName || !formData.sourceType) {
      toast.error('Please fill in all required fields')
      return
    }

    const sourceData: LeadSource = {
      id: editingSource?.id || `src-${Date.now()}`,
      companyId,
      sourceName: formData.sourceName,
      sourceType: formData.sourceType,
      sourceDescription: formData.sourceDescription,
      trackingCode: formData.trackingCode,
      costPerLead: formData.costPerLead,
      conversionRate: formData.conversionRate / 100, // Convert percentage to decimal
      aiPerformanceScore: Math.random() * 40 + 60, // AI would calculate this
      isActive: true,
      createdBy: userId,
      createdAt: editingSource?.createdAt || new Date().toISOString()
    }

    if (editingSource) {
      const updatedSources = leadSources.map(source => 
        source.id === editingSource.id ? sourceData : source
      )
      setLeadSources(updatedSources)
      onSourceUpdate?.(updatedSources)
      toast.success('Lead source updated successfully')
    } else {
      const newSources = [...leadSources, sourceData]
      setLeadSources(newSources)
      onSourceUpdate?.(newSources)
      toast.success('Lead source created successfully')
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (source: LeadSource) => {
    setEditingSource(source)
    setFormData({
      sourceName: source.sourceName,
      sourceType: source.sourceType,
      sourceDescription: source.sourceDescription,
      trackingCode: source.trackingCode,
      costPerLead: source.costPerLead,
      conversionRate: source.conversionRate * 100 // Convert decimal to percentage
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (sourceId: string) => {
    const updatedSources = leadSources.filter(source => source.id !== sourceId)
    setLeadSources(updatedSources)
    onSourceUpdate?.(updatedSources)
    toast.success('Lead source deleted successfully')
  }

  const handleToggleActive = (sourceId: string) => {
    const updatedSources = leadSources.map(source => 
      source.id === sourceId 
        ? { ...source, isActive: !source.isActive }
        : source
    )
    setLeadSources(updatedSources)
    onSourceUpdate?.(updatedSources)
    toast.success('Lead source status updated')
  }

  const filteredSources = leadSources.filter(source => {
    const matchesSearch = source.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.sourceDescription.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || source.sourceType === filterType
    
    return matchesSearch && matchesType
  })

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const totalSources = leadSources.length
  const activeSources = leadSources.filter(s => s.isActive).length
  const averagePerformance = leadSources.length > 0 
    ? leadSources.reduce((sum, s) => sum + s.aiPerformanceScore, 0) / leadSources.length 
    : 0
  const averageCostPerLead = leadSources.length > 0
    ? leadSources.reduce((sum, s) => sum + s.costPerLead, 0) / leadSources.length
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{totalSources}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold">{activeSources}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">{averagePerformance.toFixed(1)}%</p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cost/Lead</p>
                <p className="text-2xl font-bold">${averageCostPerLead.toFixed(2)}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>
                Manage and track performance of your lead generation sources
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingSource ? 'Edit Lead Source' : 'Add New Lead Source'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure a new lead source to track lead generation performance
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceName">Source Name *</Label>
                      <Input
                        id="sourceName"
                        value={formData.sourceName}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceName: e.target.value }))}
                        placeholder="e.g., Company Website"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceType">Source Type *</Label>
                      <Select
                        value={formData.sourceType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sourceType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceDescription">Description</Label>
                    <Textarea
                      id="sourceDescription"
                      value={formData.sourceDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceDescription: e.target.value }))}
                      placeholder="Describe this lead source..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingCode">Tracking Code</Label>
                      <Input
                        id="trackingCode"
                        value={formData.trackingCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackingCode: e.target.value }))}
                        placeholder="e.g., WEB-ORGANIC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerLead">Cost per Lead ($)</Label>
                      <Input
                        id="costPerLead"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.costPerLead}
                        onChange={(e) => setFormData(prev => ({ ...prev, costPerLead: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                      <Input
                        id="conversionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.conversionRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSource ? 'Update Source' : 'Create Source'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sources Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tracking Code</TableHead>
                  <TableHead>Cost/Lead</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{source.sourceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.sourceDescription.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sourceTypes.find(t => t.value === source.sourceType)?.label || source.sourceType}
                      </Badge>
                    </TableCell>
                    <TableCell>{source.trackingCode}</TableCell>
                    <TableCell>${source.costPerLead.toFixed(2)}</TableCell>
                    <TableCell>{(source.conversionRate * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <span className={getPerformanceColor(source.aiPerformanceScore)}>
                        {source.aiPerformanceScore.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={source.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(source.id)}
                      >
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(source)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(source.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredSources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Database size={24} className="mx-auto mb-2 opacity-50" />
                <p>No lead sources found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}