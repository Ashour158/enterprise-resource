import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Target, 
  ChartLine, 
  Clock, 
  CheckCircle, 
  Plus,
  Sparkle,
  Eye,
  TrendUp,
  Activity,
  MapPin
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface JourneyMilestone {
  id: string
  name: string
  description: string
  type: 'engagement' | 'conversion' | 'retention' | 'satisfaction'
  status: 'pending' | 'completed' | 'overdue'
  targetDate?: string
  completedAt?: string
  automationTrigger?: string
  createdAt: string
}

interface JourneyStage {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'skipped'
  startDate?: string
  completedDate?: string
}

interface CustomerJourney {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  journeyType: 'sales' | 'onboarding' | 'support' | 'retention'
  description?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  currentStage: string
  startDate: string
  stages: JourneyStage[]
  milestones: JourneyMilestone[]
  progressPercentage: number
  createdAt: string
  updatedAt: string
}

interface CustomerJourneyMappingProps {
  companyId: string
  customerId?: string
  onJourneySelect?: (journey: CustomerJourney) => void
}

export const CustomerJourneyMapping: React.FC<CustomerJourneyMappingProps> = ({
  companyId,
  customerId,
  onJourneySelect
}) => {
  const [journeys, setJourneys] = useKV<CustomerJourney[]>(`crm-customer-journeys-${companyId}`, [])
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourney | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [newJourney, setNewJourney] = useState({
    customerName: '',
    customerEmail: '',
    journeyType: 'sales',
    description: ''
  })
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    type: 'engagement' as const,
    targetDate: '',
    automationTrigger: ''
  })

  // Calculate journey progress
  const calculateProgress = (journey: CustomerJourney) => {
    const completedMilestones = journey.milestones.filter(m => m.status === 'completed').length
    const totalMilestones = journey.milestones.length
    return totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
  }

  // Create new customer journey
  const createJourney = () => {
    const journey: CustomerJourney = {
      id: `journey-${Date.now()}`,
      customerId: customerId || `customer-${Date.now()}`,
      customerName: newJourney.customerName,
      customerEmail: newJourney.customerEmail,
      journeyType: newJourney.journeyType as 'sales' | 'onboarding' | 'support' | 'retention',
      description: newJourney.description,
      status: 'active',
      currentStage: 'awareness',
      startDate: new Date().toISOString(),
      stages: [
        { id: 'awareness', name: 'Awareness', status: 'active', startDate: new Date().toISOString() },
        { id: 'consideration', name: 'Consideration', status: 'pending' },
        { id: 'decision', name: 'Decision', status: 'pending' },
        { id: 'purchase', name: 'Purchase', status: 'pending' },
        { id: 'onboarding', name: 'Onboarding', status: 'pending' },
        { id: 'advocacy', name: 'Advocacy', status: 'pending' }
      ],
      milestones: [],
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setJourneys([...(journeys || []), journey])
    setNewJourney({ customerName: '', customerEmail: '', journeyType: 'sales', description: '' })
    setShowCreateModal(false)
    toast.success('Customer journey created successfully')
  }

  // Add milestone to journey
  const addMilestone = () => {
    if (!selectedJourney) return

    const milestone: JourneyMilestone = {
      id: `milestone-${Date.now()}`,
      name: newMilestone.name,
      description: newMilestone.description,
      type: newMilestone.type,
      status: 'pending',
      targetDate: newMilestone.targetDate,
      automationTrigger: newMilestone.automationTrigger,
      createdAt: new Date().toISOString()
    }

    const updatedJourney = {
      ...selectedJourney,
      milestones: [...selectedJourney.milestones, milestone],
      updatedAt: new Date().toISOString()
    }

    setJourneys((journeys || []).map(j => j.id === selectedJourney.id ? updatedJourney : j))
    setSelectedJourney(updatedJourney)
    setNewMilestone({
      name: '',
      description: '',
      type: 'engagement',
      targetDate: '',
      automationTrigger: ''
    })
    setShowMilestoneModal(false)
    toast.success('Milestone added successfully')
  }

  // Toggle milestone completion
  const toggleMilestone = (milestoneId: string) => {
    if (!selectedJourney) return

    const updatedJourney = {
      ...selectedJourney,
      milestones: selectedJourney.milestones.map(m => 
        m.id === milestoneId 
          ? {
              ...m,
              status: m.status === 'completed' ? 'pending' : 'completed',
              completedAt: m.status === 'completed' ? undefined : new Date().toISOString()
            } as JourneyMilestone
          : m
      ),
      updatedAt: new Date().toISOString()
    }

    const progress = calculateProgress(updatedJourney)
    updatedJourney.progressPercentage = progress

    setJourneys((journeys || []).map(j => j.id === selectedJourney.id ? updatedJourney : j))
    setSelectedJourney(updatedJourney)
  }

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'awareness': return <Eye size={16} />
      case 'consideration': return <Target size={16} />
      case 'decision': return <CheckCircle size={16} />
      case 'purchase': return <Activity size={16} />
      case 'onboarding': return <User size={16} />
      case 'advocacy': return <TrendUp size={16} />
      default: return <MapPin size={16} />
    }
  }

  const getMilestoneTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'bg-blue-500'
      case 'conversion': return 'bg-green-500'
      case 'retention': return 'bg-purple-500'
      case 'satisfaction': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (selectedJourney) {
    return (
      <div className="space-y-6">
        {/* Journey Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedJourney(null)}
              className="mb-2"
            >
              ← Back to Journeys
            </Button>
            <h2 className="text-2xl font-bold">{selectedJourney.customerName}</h2>
            <p className="text-muted-foreground">{selectedJourney.customerEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={selectedJourney.status === 'active' ? 'default' : 'secondary'}>
              {selectedJourney.status}
            </Badge>
            <Badge variant="outline">
              {selectedJourney.journeyType}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold">{selectedJourney.progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Journey Progress</span>
                <span>{selectedJourney.progressPercentage}%</span>
              </div>
              <Progress value={selectedJourney.progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Journey Stages */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Stages</CardTitle>
            <CardDescription>Customer progression through the journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {selectedJourney.stages.map((stage, index) => (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2
                    ${stage.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                      stage.status === 'active' ? 'bg-primary border-primary text-white' :
                      'bg-muted border-muted-foreground text-muted-foreground'}
                  `}>
                    {getStageIcon(stage.id)}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-medium text-sm">{stage.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {stage.status === 'completed' ? 'Completed' :
                       stage.status === 'active' ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
                  {index < selectedJourney.stages.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mt-6 -ml-16
                      ${stage.status === 'completed' ? 'bg-green-500' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Journey Milestones</CardTitle>
                <CardDescription>Automated tracking and milestone management</CardDescription>
              </div>
              <Button onClick={() => setShowMilestoneModal(true)}>
                <Plus size={16} className="mr-2" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedJourney.milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMilestone(milestone.id)}
                      className="h-8 w-8 p-0"
                    >
                      {milestone.status === 'completed' ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                      )}
                    </Button>
                    <div className={`w-3 h-3 rounded-full ${getMilestoneTypeColor(milestone.type)}`} />
                    <div>
                      <div className="font-medium">{milestone.name}</div>
                      <div className="text-sm text-muted-foreground">{milestone.description}</div>
                      {milestone.targetDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          Target: {new Date(milestone.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {milestone.type}
                    </Badge>
                    {milestone.automationTrigger && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkle size={12} className="mr-1" />
                        Auto-tracked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {selectedJourney.milestones.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No milestones defined. Add milestones to track customer progress.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Creation Modal */}
        <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Journey Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Milestone Name</label>
                  <Input
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., First Product Demo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newMilestone.type} 
                    onValueChange={(value) => setNewMilestone(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this milestone represents..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={newMilestone.targetDate}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Automation Trigger</label>
                  <Input
                    value={newMilestone.automationTrigger}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, automationTrigger: e.target.value }))}
                    placeholder="e.g., email_opened, demo_scheduled"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMilestoneModal(false)}>
                  Cancel
                </Button>
                <Button onClick={addMilestone}>
                  Add Milestone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Journey Mapping</h2>
          <p className="text-muted-foreground">
            Visualize and track customer interactions with automated milestone tracking
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-2" />
          Create Journey
        </Button>
      </div>

      {/* Journey Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{(journeys || []).filter(j => j.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Active Journeys</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(journeys || []).reduce((acc, j) => acc + j.milestones.filter(m => m.status === 'completed').length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Completed Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendUp size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((journeys || []).reduce((acc, j) => acc + j.progressPercentage, 0) / (journeys || []).length) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Journeys</CardTitle>
          <CardDescription>Manage and track all customer journey maps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(journeys || []).map((journey) => (
              <div 
                key={journey.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  setSelectedJourney(journey)
                  onJourneySelect?.(journey)
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{journey.customerName}</div>
                    <div className="text-sm text-muted-foreground">{journey.customerEmail}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Started {new Date(journey.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{journey.progressPercentage}%</div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{journey.milestones.length}</div>
                    <div className="text-xs text-muted-foreground">Milestones</div>
                  </div>
                  <Badge variant={journey.status === 'active' ? 'default' : 'secondary'}>
                    {journey.status}
                  </Badge>
                  <Badge variant="outline">
                    {journey.journeyType}
                  </Badge>
                </div>
              </div>
            ))}
            {(journeys || []).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <User size={24} className="mx-auto mb-2 opacity-50" />
                <p>No customer journeys created yet.</p>
                <p className="text-sm">Create your first journey to start tracking customer interactions.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Journey Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Customer Journey</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  value={newJourney.customerName}
                  onChange={(e) => setNewJourney(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Email</label>
                <Input
                  type="email"
                  value={newJourney.customerEmail}
                  onChange={(e) => setNewJourney(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="Enter customer email"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Journey Type</label>
              <Select 
                value={newJourney.journeyType} 
                onValueChange={(value) => setNewJourney(prev => ({ ...prev, journeyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Journey</SelectItem>
                  <SelectItem value="onboarding">Customer Onboarding</SelectItem>
                  <SelectItem value="support">Support Journey</SelectItem>
                  <SelectItem value="retention">Retention Journey</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newJourney.description}
                onChange={(e) => setNewJourney(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the journey goals and objectives..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createJourney}>
                Create Journey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}