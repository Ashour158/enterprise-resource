import { useState } from 'react'
import { ConflictResolutionWorkflow, ConflictTrigger, WorkflowStep, WorkflowCondition } from '@/types/erp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash, 
  Copy, 
  Play, 
  Gear as Settings, 
  FlowArrow as Workflow,
  Robot,
  User,
  Bell,
  ArrowUp,
  CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface WorkflowBuilderProps {
  workflows: ConflictResolutionWorkflow[]
  onCreateWorkflow: (workflow: ConflictResolutionWorkflow) => void
  onTriggerWorkflow: (conflictId: string, workflowId: string) => void
}

export function WorkflowBuilder({ workflows, onCreateWorkflow, onTriggerWorkflow }: WorkflowBuilderProps) {
  const [showBuilder, setShowBuilder] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<Partial<ConflictResolutionWorkflow>>({
    name: '',
    description: '',
    triggers: [],
    steps: [],
    isActive: true,
    priority: 1
  })

  const [currentTrigger, setCurrentTrigger] = useState<Partial<ConflictTrigger>>({})
  const [currentStep, setCurrentStep] = useState<Partial<WorkflowStep>>({})

  const handleCreateWorkflow = () => {
    if (!currentWorkflow.name || !currentWorkflow.description) {
      toast.error('Please provide workflow name and description')
      return
    }

    if (currentWorkflow.triggers?.length === 0) {
      toast.error('Please add at least one trigger')
      return
    }

    if (currentWorkflow.steps?.length === 0) {
      toast.error('Please add at least one step')
      return
    }

    const workflow: ConflictResolutionWorkflow = {
      id: `workflow-${Date.now()}`,
      name: currentWorkflow.name!,
      description: currentWorkflow.description!,
      triggers: currentWorkflow.triggers!,
      steps: currentWorkflow.steps!,
      isActive: currentWorkflow.isActive!,
      priority: currentWorkflow.priority!
    }

    onCreateWorkflow(workflow)
    setCurrentWorkflow({
      name: '',
      description: '',
      triggers: [],
      steps: [],
      isActive: true,
      priority: 1
    })
    setShowBuilder(false)
    toast.success(`Workflow "${workflow.name}" created successfully`)
  }

  const handleAddTrigger = () => {
    if (!currentTrigger.field || !currentTrigger.operator || currentTrigger.value === undefined) {
      toast.error('Please fill all trigger fields')
      return
    }

    const trigger: ConflictTrigger = {
      field: currentTrigger.field!,
      operator: currentTrigger.operator!,
      value: currentTrigger.value!
    }

    setCurrentWorkflow(prev => ({
      ...prev,
      triggers: [...(prev.triggers || []), trigger]
    }))

    setCurrentTrigger({})
    toast.success('Trigger added successfully')
  }

  const handleAddStep = () => {
    if (!currentStep.type) {
      toast.error('Please select step type')
      return
    }

    const step: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: currentStep.type!,
      config: currentStep.config || {},
      conditions: currentStep.conditions || []
    }

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step]
    }))

    setCurrentStep({})
    toast.success('Step added successfully')
  }

  const handleRemoveTrigger = (index: number) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      triggers: prev.triggers?.filter((_, i) => i !== index) || []
    }))
  }

  const handleRemoveStep = (index: number) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || []
    }))
  }

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'auto_resolution': return <CheckCircle size={16} />
      case 'ai_analysis': return <Robot size={16} />
      case 'human_review': return <User size={16} />
      case 'escalation': return <ArrowUp size={16} />
      case 'notification': return <Bell size={16} />
      default: return <Settings size={16} />
    }
  }

  const predefinedWorkflows = [
    {
      name: 'Critical Revenue Impact',
      description: 'Auto-resolve critical conflicts affecting revenue',
      triggers: [
        { field: 'businessImpact', operator: 'equals', value: 'revenue' },
        { field: 'priority', operator: 'equals', value: 'critical' }
      ],
      steps: [
        { id: 'ai-1', type: 'ai_analysis', config: {} },
        { id: 'auto-1', type: 'auto_resolution', config: { strategy: 'ai_assisted', confidence: 90, reasoning: 'Critical revenue impact requires AI analysis' } }
      ]
    },
    {
      name: 'Compliance Review Required',
      description: 'Route compliance-related conflicts for human review',
      triggers: [
        { field: 'businessImpact', operator: 'equals', value: 'compliance' }
      ],
      steps: [
        { id: 'notify-1', type: 'notification', config: { message: 'Compliance conflict detected' } },
        { id: 'review-1', type: 'human_review', config: { assignTo: 'compliance-team' } }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Conflict Resolution Workflows</h2>
          <p className="text-muted-foreground">
            Create automated workflows to handle conflicts based on rules and conditions.
          </p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Workflow Builder</DialogTitle>
              <DialogDescription>
                Create a custom workflow to automatically handle specific types of conflicts.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input
                      placeholder="Enter workflow name"
                      value={currentWorkflow.name || ''}
                      onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={currentWorkflow.priority?.toString() || '1'}
                      onValueChange={(value) => setCurrentWorkflow(prev => ({ ...prev, priority: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Highest)</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5 (Lowest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what this workflow does"
                    value={currentWorkflow.description || ''}
                    onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentWorkflow.isActive || false}
                    onCheckedChange={(checked) => setCurrentWorkflow(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Active</Label>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Quick Start Templates</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {predefinedWorkflows.map((template, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                        setCurrentWorkflow({
                          name: template.name,
                          description: template.description,
                          triggers: template.triggers as ConflictTrigger[],
                          steps: template.steps as WorkflowStep[],
                          isActive: true,
                          priority: 1
                        })
                      }}>
                        <CardContent className="p-4">
                          <h5 className="font-medium">{template.name}</h5>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Add Trigger Conditions</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Field</Label>
                      <Select
                        value={currentTrigger.field || ''}
                        onValueChange={(value: any) => setCurrentTrigger(prev => ({ ...prev, field: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="module">Module</SelectItem>
                          <SelectItem value="entity">Entity</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="businessImpact">Business Impact</SelectItem>
                          <SelectItem value="conflictType">Conflict Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={currentTrigger.operator || ''}
                        onValueChange={(value: any) => setCurrentTrigger(prev => ({ ...prev, operator: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        placeholder="Enter value"
                        value={currentTrigger.value || ''}
                        onChange={(e) => setCurrentTrigger(prev => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button size="sm" onClick={handleAddTrigger}>
                    <Plus size={14} className="mr-1" />
                    Add Trigger
                  </Button>

                  {/* Current Triggers */}
                  <div className="space-y-2">
                    <h5 className="font-medium">Current Triggers</h5>
                    {currentWorkflow.triggers?.map((trigger, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{trigger.field}</Badge>
                          <span className="text-sm">{trigger.operator}</span>
                          <Badge>{trigger.value}</Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveTrigger(index)}>
                          <Trash size={14} />
                        </Button>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No triggers added yet</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Add Workflow Steps</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Step Type</Label>
                      <Select
                        value={currentStep.type || ''}
                        onValueChange={(value: any) => setCurrentStep(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select step type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto_resolution">Auto Resolution</SelectItem>
                          <SelectItem value="ai_analysis">AI Analysis</SelectItem>
                          <SelectItem value="human_review">Human Review</SelectItem>
                          <SelectItem value="escalation">Escalation</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {currentStep.type === 'auto_resolution' && (
                      <div className="space-y-2">
                        <Label>Resolution Strategy</Label>
                        <Select
                          value={currentStep.config?.strategy || ''}
                          onValueChange={(value) => setCurrentStep(prev => ({ 
                            ...prev, 
                            config: { ...prev.config, strategy: value, confidence: 80, reasoning: `Auto ${value} resolution` }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="server_wins">Server Wins</SelectItem>
                            <SelectItem value="client_wins">Client Wins</SelectItem>
                            <SelectItem value="merge">Merge</SelectItem>
                            <SelectItem value="ai_assisted">AI Assisted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {currentStep.type === 'notification' && (
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Input
                          placeholder="Notification message"
                          value={currentStep.config?.message || ''}
                          onChange={(e) => setCurrentStep(prev => ({ 
                            ...prev, 
                            config: { ...prev.config, message: e.target.value }
                          }))}
                        />
                      </div>
                    )}

                    {currentStep.type === 'human_review' && (
                      <div className="space-y-2">
                        <Label>Assign To</Label>
                        <Input
                          placeholder="User or team to assign"
                          value={currentStep.config?.assignTo || ''}
                          onChange={(e) => setCurrentStep(prev => ({ 
                            ...prev, 
                            config: { ...prev.config, assignTo: e.target.value }
                          }))}
                        />
                      </div>
                    )}

                    <Button size="sm" onClick={handleAddStep}>
                      <Plus size={14} className="mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {/* Current Steps */}
                  <div className="space-y-2">
                    <h5 className="font-medium">Current Steps</h5>
                    {currentWorkflow.steps?.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.type)}
                          <span className="font-medium">{step.type.replace('_', ' ')}</span>
                          {step.config?.strategy && (
                            <Badge variant="outline">{step.config.strategy}</Badge>
                          )}
                          {step.config?.message && (
                            <span className="text-sm text-muted-foreground">"{step.config.message}"</span>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveStep(index)}>
                          <Trash size={14} />
                        </Button>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No steps added yet</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Workflow Preview</h4>
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentWorkflow.name || 'Untitled Workflow'}</CardTitle>
                      <CardDescription>{currentWorkflow.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Triggers</h5>
                        <div className="space-y-1">
                          {currentWorkflow.triggers?.map((trigger, index) => (
                            <div key={index} className="text-sm">
                              • {trigger.field} {trigger.operator} "{trigger.value}"
                            </div>
                          )) || <p className="text-sm text-muted-foreground">No triggers</p>}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Steps</h5>
                        <div className="space-y-1">
                          {currentWorkflow.steps?.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              {getStepIcon(step.type)}
                              <span>{step.type.replace('_', ' ')}</span>
                              {step.config?.strategy && <Badge variant="outline" className="text-xs">{step.config.strategy}</Badge>}
                            </div>
                          )) || <p className="text-sm text-muted-foreground">No steps</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    P{workflow.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Triggers ({workflow.triggers.length})</h5>
                <div className="space-y-1">
                  {workflow.triggers.slice(0, 2).map((trigger, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {trigger.field} {trigger.operator} "{trigger.value}"
                    </div>
                  ))}
                  {workflow.triggers.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      • ... and {workflow.triggers.length - 2} more
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Steps ({workflow.steps.length})</h5>
                <div className="flex flex-wrap gap-1">
                  {workflow.steps.map((step, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {getStepIcon(step.type)}
                      <span className="ml-1">{step.type.replace('_', ' ')}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Settings size={14} className="mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Copy size={14} className="mr-1" />
                  Clone
                </Button>
                <Button size="sm">
                  <Play size={14} className="mr-1" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Workflow size={32} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workflow to automate conflict resolution.
              </p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus size={16} className="mr-2" />
                Create Your First Workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}