import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'
import { 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { mockDeals, mockContacts, mockAccounts, mockCRMSettings } from '@/data/crmMockData'
import { Deal, PipelineStage, PipelineMetrics } from '@/types/crm'
import { 
  Plus, 
  CurrencyDollar as DollarSign, 
  Calendar, 
  User, 
  Building, 
  TrendUp, 
  Target,
  Phone,
  EnvelopeSimple as Mail,
  Clock,
  Activity,
  Eye,
  PencilSimple as Edit,
  DotsThreeVertical as MoreVertical,
  Funnel as Filter,
  SortAscending,
  Download,
  ArrowCounterClockwise as RefreshCw,
  Thermometer,
  CalendarX,
  Star,
  Warning as AlertTriangle,
  CheckCircle,
  Circle,
  ArrowRight,
  DotsSixVertical as GripVertical
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DealPipelineProps {
  companyId: string
  userId: string
  userRole: string
}

interface DealCardProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  onView: (deal: Deal) => void
}

interface PipelineColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onAddDeal: (stageId: string) => void
  onEditDeal: (deal: Deal) => void
  onViewDeal: (deal: Deal) => void
}

// Draggable Deal Card Component
function DealCard({ deal, onEdit, onView }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const contact = mockContacts.find(c => c.id === deal.contactId)
  const account = mockAccounts.find(a => a.id === deal.accountId)
  
  const getTemperatureColor = (temp: Deal['temperature']) => {
    switch (temp) {
      case 'hot': return 'text-red-500'
      case 'warm': return 'text-yellow-500'
      case 'cold': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getTemperatureIcon = (temp: Deal['temperature']) => {
    switch (temp) {
      case 'hot': return <Thermometer size={14} className="text-red-500" />
      case 'warm': return <Thermometer size={14} className="text-yellow-500" />
      case 'cold': return <Thermometer size={14} className="text-blue-500" />
      default: return <Thermometer size={14} className="text-gray-500" />
    }
  }

  const isOverdue = deal.closeDate && new Date(deal.closeDate) < new Date()

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
        deal.temperature === 'hot' ? 'border-l-red-500' : 
        deal.temperature === 'warm' ? 'border-l-yellow-500' : 
        'border-l-blue-500'
      } ${isDragging ? 'shadow-2xl' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm leading-tight">{deal.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {account?.name}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded"
            >
              <GripVertical size={12} className="text-muted-foreground" />
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onView(deal)}>
              <Eye size={12} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-sm">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: deal.currency 
              }).format(deal.value)}
            </span>
          </div>
          {getTemperatureIcon(deal.temperature)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User size={12} />
            <span>{contact?.firstName} {contact?.lastName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span className={isOverdue ? 'text-red-500' : ''}>
              {new Date(deal.closeDate).toLocaleDateString()}
              {isOverdue && <AlertTriangle size={12} className="inline ml-1" />}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target size={12} />
            <span>{deal.probability}% probability</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {deal.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{deal.tags.length - 2}
              </Badge>
            )}
          </div>
          {deal.forecast && (
            <Star size={12} className="text-yellow-500 fill-current" />
          )}
        </div>

        <Progress value={deal.probability} className="h-1" />
      </CardContent>
    </Card>
  )
}

// Pipeline Column Component
function PipelineColumn({ stage, deals, onAddDeal, onEditDeal, onViewDeal }: PipelineColumnProps) {
  const stageDeals = deals.filter(deal => deal.stage === stage.id)
  const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/30 p-4 rounded-t-lg border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-sm">{stage.name}</h3>
            <Badge variant="outline" className="text-xs">
              {stageDeals.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => onAddDeal(stage.id)}
          >
            <Plus size={12} />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(stageValue)}
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-3 min-h-96 bg-muted/10 rounded-b-lg">
        <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {stageDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={onEditDeal}
              onView={onViewDeal}
            />
          ))}
        </SortableContext>
        
        {stageDeals.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Target size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No deals in this stage</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => onAddDeal(stage.id)}
            >
              <Plus size={14} className="mr-1" />
              Add Deal
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DealPipeline({ companyId, userId, userRole }: DealPipelineProps) {
  const [deals, setDeals] = useKV<Deal[]>(`deals-${companyId}`, mockDeals)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isNewDealDialogOpen, setIsNewDealDialogOpen] = useState(false)
  const [newDealStage, setNewDealStage] = useState<string>('')
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDealId, setActiveDealId] = useState<string | null>(null)

  const stages = mockCRMSettings.pipelineSettings.stages
  const safeDeals = Array.isArray(deals) ? deals : mockDeals

  // Filter deals based on search and filter criteria
  const filteredDeals = safeDeals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mockAccounts.find(a => a.id === deal.accountId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'hot' && deal.temperature === 'hot') ||
                         (activeFilter === 'forecast' && deal.forecast) ||
                         (activeFilter === 'overdue' && new Date(deal.closeDate) < new Date())
    
    return matchesSearch && matchesFilter
  })

  // Calculate pipeline metrics
  const pipelineMetrics: PipelineMetrics = {
    totalValue: filteredDeals.reduce((sum, deal) => sum + deal.value, 0),
    weightedValue: filteredDeals.reduce((sum, deal) => sum + deal.weightedValue, 0),
    averageDealSize: filteredDeals.length > 0 ? filteredDeals.reduce((sum, deal) => sum + deal.value, 0) / filteredDeals.length : 0,
    conversionRate: 75, // Mock data
    averageSalesVelocity: 45, // Mock data in days
    stageMetrics: stages.map(stage => {
      const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id)
      return {
        stageId: stage.id,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
        averageTimeInStage: 15, // Mock data
        conversionRate: stage.probability
      }
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDealId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDealId(null)

    if (!over) return

    const dealId = active.id as string
    const deal = safeDeals.find(d => d.id === dealId)
    if (!deal) return

    // Check if dropping on a different stage
    const targetStageId = over.id as string
    const targetStage = stages.find(s => s.id === targetStageId)
    
    if (targetStage && deal.stage !== targetStageId) {
      // Move deal to new stage
      const updatedDeals = safeDeals.map(d => 
        d.id === dealId 
          ? { 
              ...d, 
              stage: targetStageId,
              probability: targetStage.probability,
              stageChangedAt: new Date().toISOString(),
              stageHistory: [
                ...d.stageHistory,
                {
                  stage: targetStageId,
                  changedAt: new Date().toISOString(),
                  changedBy: userId,
                  reason: 'Moved via pipeline'
                }
              ],
              weightedValue: d.value * (targetStage.probability / 100)
            }
          : d
      )
      
      setDeals(updatedDeals)
      toast.success(`Deal moved to ${targetStage.name}`)
    }
  }

  const handleAddDeal = (stageId: string) => {
    setNewDealStage(stageId)
    setIsNewDealDialogOpen(true)
  }

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDealDetailOpen(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    // In real app, this would open an edit dialog
    toast.info('Edit deal functionality would open here')
  }

  const getFilterOptions = () => [
    { value: 'all', label: 'All Deals', count: filteredDeals.length },
    { value: 'hot', label: 'Hot Deals', count: filteredDeals.filter(d => d.temperature === 'hot').length },
    { value: 'forecast', label: 'Forecast', count: filteredDeals.filter(d => d.forecast).length },
    { value: 'overdue', label: 'Overdue', count: filteredDeals.filter(d => new Date(d.closeDate) < new Date()).length }
  ]

  return (
    <div className="space-y-6">
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(pipelineMetrics.totalValue)}
                </p>
              </div>
              <DollarSign size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weighted Value</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(pipelineMetrics.weightedValue)}
                </p>
              </div>
              <Target size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(pipelineMetrics.averageDealSize)}
                </p>
              </div>
              <TrendUp size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{pipelineMetrics.conversionRate}%</p>
              </div>
              <CheckCircle size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Velocity</p>
                <p className="text-2xl font-bold">{pipelineMetrics.averageSalesVelocity}d</p>
              </div>
              <Clock size={20} className="text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Deal Pipeline</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw size={16} className="mr-1" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => handleAddDeal('')}>
                <Plus size={16} className="mr-1" />
                Add Deal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search deals, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {getFilterOptions().map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className="whitespace-nowrap"
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="min-h-[600px]">
              <PipelineColumn
                stage={stage}
                deals={filteredDeals}
                onAddDeal={handleAddDeal}
                onEditDeal={handleEditDeal}
                onViewDeal={handleViewDeal}
              />
            </div>
          ))}
        </div>
      </DndContext>

      {/* Deal Detail Dialog */}
      <Dialog open={isDealDetailOpen} onOpenChange={setIsDealDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDeal?.name}</DialogTitle>
            <DialogDescription>
              Deal details and history
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeal && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Deal Value</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: selectedDeal.currency 
                        }).format(selectedDeal.value)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stage</Label>
                      <Badge className="mt-1">
                        {stages.find(s => s.id === selectedDeal.stage)?.name}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Probability</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={selectedDeal.probability} className="flex-1" />
                        <span className="text-sm font-medium">{selectedDeal.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Temperature</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Thermometer size={16} className={
                          selectedDeal.temperature === 'hot' ? 'text-red-500' :
                          selectedDeal.temperature === 'warm' ? 'text-yellow-500' :
                          'text-blue-500'
                        } />
                        <span className="capitalize">{selectedDeal.temperature}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Close Date</Label>
                      <p className="mt-1">{new Date(selectedDeal.closeDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedDeal.description || 'No description provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDeal.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Next Action</Label>
                      <p className="mt-1 text-sm">{selectedDeal.nextAction || 'No next action defined'}</p>
                      {selectedDeal.nextActionDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(selectedDeal.nextActionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  {selectedDeal.stageHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {stages.find(s => s.id === entry.stage)?.name}
                          </span>
                          <ArrowRight size={14} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.changedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="activities">
                <div className="text-center text-muted-foreground py-8">
                  <Activity size={24} className="mx-auto mb-2 opacity-50" />
                  <p>Activities will be displayed here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="text-center text-muted-foreground py-8">
                  <Circle size={24} className="mx-auto mb-2 opacity-50" />
                  <p>Documents will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* New Deal Dialog */}
      <Dialog open={isNewDealDialogOpen} onOpenChange={setIsNewDealDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              Add a new deal to your pipeline
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deal-name">Deal Name</Label>
                <Input id="deal-name" placeholder="Enter deal name" />
              </div>
              <div>
                <Label htmlFor="deal-value">Deal Value</Label>
                <Input id="deal-value" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="deal-stage">Stage</Label>
                <Select defaultValue={newDealStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deal-closedate">Close Date</Label>
                <Input id="deal-closedate" type="date" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="deal-description">Description</Label>
              <Textarea id="deal-description" placeholder="Enter deal description" />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewDealDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Deal creation functionality would be implemented here')
                setIsNewDealDialogOpen(false)
              }}>
                Create Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}