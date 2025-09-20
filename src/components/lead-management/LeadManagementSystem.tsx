import React, { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LeadCard } from './LeadCard'
import { LeadDetailsModal } from './LeadDetailsModal'
import { LeadBulkOperations } from './LeadBulkOperations'
import { LeadImportExport } from './LeadImportExport'
import { LeadPipeline } from './LeadPipeline'
import { LeadFilters } from './LeadFilters'
import { LeadAIInsights } from './LeadAIInsights'
import { AILeadScoringEngine } from './AILeadScoringEngine'
import { EmailAutomationSystem } from './EmailAutomationSystem'
import { LeadEnrichmentSystem } from './LeadEnrichmentSystem'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  MoreVertical,
  Eye,
  EyeOff,
  Grid,
  List,
  Brain,
  Users,
  Target,
  TrendUp,
  Clock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  CheckSquare,
  Settings,
  Sparkle,
  Globe,
  Activity
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  jobTitle?: string
  leadStatus: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
  leadRating: 'hot' | 'warm' | 'cold'
  leadPriority: 'high' | 'medium' | 'low'
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  aiNextBestAction?: string
  aiBuyingSignals?: string[]
  aiSentimentScore?: number
  leadSource: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  contactAttempts: number
  engagementScore: number
  tags: string[]
  customFields: Record<string, any>
  notes?: string
  industry?: string
  companySize?: string
  annualRevenue?: number
  address?: {
    line1?: string
    city?: string
    state?: string
    country?: string
  }
  enrichmentData?: any
  enrichmentStatus?: 'pending' | 'completed' | 'failed' | 'partial'
  enrichmentScore?: number
  duplicateLeads?: string[]
  duplicateStatus?: 'pending' | 'merged' | 'ignored'
  emailCampaignEnrollments?: string[]
  automationRules?: string[]
}

interface LeadManagementSystemProps {
  companyId: string
  userId: string
  userRole: string
}

export function LeadManagementSystem({ companyId, userId, userRole }: LeadManagementSystemProps) {
  // State management
  const [leads, setLeads] = useKV(`leads-${companyId}`, [] as Lead[])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'cards' | 'pipeline' | 'list'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeAITab, setActiveAITab] = useState('scoring')
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [cardLayout, setCardLayout] = useKV(`lead-card-layout-${userId}`, {
    showAIScore: true,
    showEngagement: true,
    showLastContact: true,
    showNextAction: true,
    showTags: true,
    showCustomFields: false,
    compactMode: false
  })

  // Mock data for development
  useEffect(() => {
    if (leads.length === 0) {
      const mockLeads: Lead[] = [
        {
          id: 'lead-001',
          leadNumber: 'LEAD-2024-001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@techcorp.com',
          phone: '+1-555-0123',
          companyName: 'TechCorp Industries',
          jobTitle: 'CTO',
          leadStatus: 'qualified',
          leadRating: 'hot',
          leadPriority: 'high',
          aiLeadScore: 85,
          aiConversionProbability: 0.75,
          aiEstimatedDealValue: 150000,
          aiNextBestAction: 'Schedule demo call within 24 hours',
          aiBuyingSignals: ['Active timeline', 'Budget defined', 'Decision-maker authority'],
          aiSentimentScore: 0.8,
          leadSource: 'Website',
          assignedTo: userId,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
          lastContactDate: new Date(Date.now() - 86400000).toISOString(),
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString(),
          contactAttempts: 3,
          engagementScore: 78,
          tags: ['enterprise', 'hot-lead', 'technology'],
          customFields: {
            budget: '$100K-200K',
            timeline: 'Q1 2024',
            decisionMaker: true
          },
          notes: 'Very interested in our enterprise solution. Asked for detailed pricing.',
          industry: 'Technology',
          companySize: '201-1000',
          annualRevenue: 50000000,
          address: {
            line1: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States'
          }
        },
        {
          id: 'lead-002',
          leadNumber: 'LEAD-2024-002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@healthcare.com',
          phone: '+1-555-0456',
          companyName: 'Healthcare Solutions Inc',
          jobTitle: 'VP Operations',
          leadStatus: 'contacted',
          leadRating: 'warm',
          leadPriority: 'medium',
          aiLeadScore: 62,
          aiConversionProbability: 0.45,
          aiEstimatedDealValue: 75000,
          aiNextBestAction: 'Send personalized case study',
          aiBuyingSignals: ['Mid-market fit', 'Healthcare industry'],
          aiSentimentScore: 0.6,
          leadSource: 'LinkedIn',
          assignedTo: userId,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          contactAttempts: 1,
          engagementScore: 45,
          tags: ['healthcare', 'mid-market'],
          customFields: {
            budget: '$50K-100K',
            timeline: 'Q2 2024'
          },
          industry: 'Healthcare',
          companySize: '51-200',
          annualRevenue: 25000000
        },
        {
          id: 'lead-003',
          leadNumber: 'LEAD-2024-003',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@startup.io',
          companyName: 'InnovateTech Startup',
          jobTitle: 'Founder & CEO',
          leadStatus: 'new',
          leadRating: 'cold',
          leadPriority: 'low',
          aiLeadScore: 35,
          aiConversionProbability: 0.15,
          aiEstimatedDealValue: 25000,
          aiNextBestAction: 'Qualify budget and timeline',
          aiBuyingSignals: ['Early-stage startup'],
          aiSentimentScore: 0.4,
          leadSource: 'Trade Show',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          contactAttempts: 0,
          engagementScore: 12,
          tags: ['startup', 'early-stage'],
          customFields: {},
          industry: 'Technology',
          companySize: '1-10'
        }
      ]
      setLeads(mockLeads)
    }
  }, [leads.length, setLeads, userId])

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.companyName} ${lead.jobTitle}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Status filter
      if (activeFilters.status && activeFilters.status !== 'all') {
        if (lead.leadStatus !== activeFilters.status) return false
      }

      // Rating filter
      if (activeFilters.rating && activeFilters.rating !== 'all') {
        if (lead.leadRating !== activeFilters.rating) return false
      }

      // AI Score filter
      if (activeFilters.minScore) {
        if (lead.aiLeadScore < activeFilters.minScore) return false
      }

      // Source filter
      if (activeFilters.source && activeFilters.source !== 'all') {
        if (lead.leadSource !== activeFilters.source) return false
      }

      // Assigned filter
      if (activeFilters.assigned && activeFilters.assigned !== 'all') {
        if (activeFilters.assigned === 'me' && lead.assignedTo !== userId) return false
        if (activeFilters.assigned === 'unassigned' && lead.assignedTo) return false
      }

      return true
    })

    // Sort by AI score, then by creation date
    return filtered.sort((a, b) => {
      if (a.aiLeadScore !== b.aiLeadScore) {
        return b.aiLeadScore - a.aiLeadScore
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [leads, searchQuery, activeFilters, userId])

  // Handle lead selection
  const handleLeadSelect = (leadId: string, selected: boolean) => {
    const newSelected = new Set(selectedLeads)
    if (selected) {
      newSelected.add(leadId)
    } else {
      newSelected.delete(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  // Create new lead
  const handleCreateLead = async (leadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      leadNumber: `LEAD-${new Date().getFullYear()}-${String(leads.length + 1).padStart(3, '0')}`,
      firstName: leadData.firstName || '',
      lastName: leadData.lastName || '',
      email: leadData.email || '',
      phone: leadData.phone,
      companyName: leadData.companyName,
      jobTitle: leadData.jobTitle,
      leadStatus: 'new',
      leadRating: 'cold',
      leadPriority: 'medium',
      aiLeadScore: 0,
      aiConversionProbability: 0,
      aiEstimatedDealValue: 0,
      leadSource: leadData.leadSource || 'Manual',
      assignedTo: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contactAttempts: 0,
      engagementScore: 0,
      tags: [],
      customFields: {},
      ...leadData
    }

    setLeads(prev => [...prev, newLead])
    toast.success('Lead created successfully')
    setIsCreating(false)

    // Trigger AI scoring
    setTimeout(() => {
      handleAIScoring(newLead.id)
    }, 1000)
  }

  // Update lead
  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
        : lead
    ))
    toast.success('Lead updated successfully')
  }

  // Delete lead (soft delete)
  const handleDeleteLead = async (leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId))
    toast.success('Lead deleted successfully')
  }

  // AI scoring simulation
  const handleAIScoring = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // Simulate AI analysis
    const score = Math.floor(Math.random() * 100)
    const probability = Math.random()
    const estimatedValue = Math.floor(Math.random() * 200000) + 10000

    await handleUpdateLead(leadId, {
      aiLeadScore: score,
      aiConversionProbability: probability,
      aiEstimatedDealValue: estimatedValue
    })
  }

  // AI action handler
  const handleAIActionClick = (leadId: string, action: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    switch (action.toLowerCase()) {
      case 'schedule demo call':
        toast.success(`Demo call scheduled for ${lead.firstName} ${lead.lastName}`)
        break
      case 'send email':
        toast.success(`Email sent to ${lead.firstName} ${lead.lastName}`)
        break
      case 'create task':
        toast.success(`Task created for ${lead.firstName} ${lead.lastName}`)
        break
      case 'update status':
        handleUpdateLead(leadId, { leadStatus: 'qualified' })
        break
      default:
        toast.success(`Action executed: ${action}`)
    }
  }

  // Duplicate detection and merging
  const handleDuplicateDetection = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // Simulate AI duplicate detection
    const duplicates = leads.filter(l => 
      l.id !== leadId && 
      (l.email.toLowerCase() === lead.email.toLowerCase() ||
       (l.firstName.toLowerCase() === lead.firstName.toLowerCase() && 
        l.lastName.toLowerCase() === lead.lastName.toLowerCase() &&
        l.companyName?.toLowerCase() === lead.companyName?.toLowerCase()))
    )

    if (duplicates.length > 0) {
      await handleUpdateLead(leadId, {
        duplicateLeads: duplicates.map(d => d.id),
        duplicateStatus: 'pending'
      })
      toast.info(`Found ${duplicates.length} potential duplicates for ${lead.firstName} ${lead.lastName}`)
    } else {
      toast.success('No duplicates found')
    }
  }

  // Bulk operations
  const handleBulkUpdate = async (updates: Partial<Lead>) => {
    const selectedIds = Array.from(selectedLeads)
    setLeads(prev => prev.map(lead => 
      selectedIds.includes(lead.id)
        ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
        : lead
    ))
    toast.success(`Updated ${selectedIds.length} leads`)
    setSelectedLeads(new Set())
  }

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedLeads)
    setLeads(prev => prev.filter(lead => !selectedIds.includes(lead.id)))
    toast.success(`Deleted ${selectedIds.length} leads`)
    setSelectedLeads(new Set())
  }

  const handleBulkAssign = async (assigneeId: string) => {
    await handleBulkUpdate({ assignedTo: assigneeId })
  }

  // Statistics
  const stats = useMemo(() => {
    const total = filteredLeads.length
    const qualified = filteredLeads.filter(l => l.leadStatus === 'qualified').length
    const converted = filteredLeads.filter(l => l.leadStatus === 'converted').length
    const avgScore = total > 0 ? Math.round(filteredLeads.reduce((sum, l) => sum + l.aiLeadScore, 0) / total) : 0
    const hotLeads = filteredLeads.filter(l => l.leadRating === 'hot').length

    return { total, qualified, converted, avgScore, hotLeads }
  }, [filteredLeads])

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-muted-foreground">
            AI-powered lead scoring and comprehensive pipeline management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Import/Export
          </Button>
          {selectedLeads.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkOperations(true)}
              className="flex items-center gap-2"
            >
              <CheckSquare size={16} />
              Bulk Actions ({selectedLeads.size})
            </Button>
          )}
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
              </div>
              <Target className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-purple-600">{stats.converted}</p>
              </div>
              <TrendUp className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgScore}</p>
              </div>
              <Brain className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
              </div>
              <Star className="text-red-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Tabs */}
      <Tabs value={activeAITab} onValueChange={setActiveAITab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Brain size={16} />
              AI Scoring
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Mail size={16} />
              Email Automation
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="flex items-center gap-2">
              <Globe size={16} />
              Lead Enrichment
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkle size={16} />
              AI Insights
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIInsights(!showAIInsights)}
            className="flex items-center gap-2"
          >
            {showAIInsights ? <EyeOff size={16} /> : <Eye size={16} />}
            {showAIInsights ? 'Hide' : 'Show'} AI Features
          </Button>
        </div>

        {showAIInsights && (
          <>
            <TabsContent value="scoring" className="space-y-4">
              {selectedLead && (
                <AILeadScoringEngine
                  lead={selectedLead}
                  onScoreUpdate={handleUpdateLead}
                  onInsightAction={(insight, action) => handleAIActionClick(selectedLead.id, action)}
                />
              )}
              {!selectedLead && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">AI Lead Scoring</h3>
                    <p className="text-muted-foreground">
                      Select a lead to view detailed AI scoring analysis
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <EmailAutomationSystem
                companyId={companyId}
                userId={userId}
                userRole={userRole}
                leads={leads}
                onLeadUpdate={handleUpdateLead}
              />
            </TabsContent>

            <TabsContent value="enrichment" className="space-y-4">
              <LeadEnrichmentSystem
                companyId={companyId}
                userId={userId}
                leads={leads}
                onLeadUpdate={handleUpdateLead}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <LeadAIInsights
                leads={filteredLeads}
                onLeadUpdate={handleUpdateLead}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search leads by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {Object.keys(activeFilters).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(activeFilters).length}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="select-all" className="text-sm">
                Select All
              </Label>
              <Checkbox
                id="select-all"
                checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </div>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className="px-3"
              >
                <List size={16} />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-3 space-y-3">
                  <h4 className="font-medium">Card Layout Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={cardLayout.showAIScore}
                        onCheckedChange={(checked) => 
                          setCardLayout(prev => ({ ...prev, showAIScore: !!checked }))
                        }
                      />
                      Show AI Score
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={cardLayout.showEngagement}
                        onCheckedChange={(checked) => 
                          setCardLayout(prev => ({ ...prev, showEngagement: !!checked }))
                        }
                      />
                      Show Engagement
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={cardLayout.showTags}
                        onCheckedChange={(checked) => 
                          setCardLayout(prev => ({ ...prev, showTags: !!checked }))
                        }
                      />
                      Show Tags
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={cardLayout.compactMode}
                        onCheckedChange={(checked) => 
                          setCardLayout(prev => ({ ...prev, compactMode: !!checked }))
                        }
                      />
                      Compact Mode
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <LeadFilters
                filters={activeFilters}
                onFiltersChange={setActiveFilters}
                leadSources={Array.from(new Set(leads.map(l => l.leadSource)))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsContent value="cards" className="space-y-4">
          {filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onSelect={(selected) => handleLeadSelect(lead.id, selected)}
                  onUpdate={(updates) => handleUpdateLead(lead.id, updates)}
                  onDelete={() => handleDeleteLead(lead.id)}
                  onView={() => setSelectedLead(lead)}
                  layout={cardLayout}
                  userRole={userRole}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || Object.keys(activeFilters).length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Start by creating your first lead or importing existing data'
                  }
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Create First Lead
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pipeline">
          <LeadPipeline
            leads={filteredLeads}
            onLeadUpdate={handleUpdateLead}
            onLeadSelect={setSelectedLead}
          />
        </TabsContent>
      </Tabs>

      {/* Modals and Dialogs */}
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updates) => handleUpdateLead(selectedLead.id, updates)}
          onDelete={() => {
            handleDeleteLead(selectedLead.id)
            setSelectedLead(null)
          }}
          userRole={userRole}
        />
      )}

      {isCreating && (
        <LeadDetailsModal
          lead={null}
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateLead}
          userRole={userRole}
        />
      )}

      {showBulkOperations && (
        <LeadBulkOperations
          selectedLeads={Array.from(selectedLeads).map(id => leads.find(l => l.id === id)!).filter(Boolean)}
          isOpen={showBulkOperations}
          onClose={() => setShowBulkOperations(false)}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkAssign={handleBulkAssign}
          userRole={userRole}
        />
      )}

      {showImportExport && (
        <LeadImportExport
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          onImport={(importedLeads) => {
            setLeads(prev => [...prev, ...importedLeads])
            toast.success(`Imported ${importedLeads.length} leads`)
          }}
          onExport={() => filteredLeads}
          userRole={userRole}
        />
      )}
    </div>
  )
}