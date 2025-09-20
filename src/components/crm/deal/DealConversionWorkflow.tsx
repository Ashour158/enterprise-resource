import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Workflow, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  ShoppingCart, 
  CreditCard,
  DollarSign,
  Calendar,
  Robot,
  Target,
  TrendUp,
  Package,
  Truck,
  Building,
  User,
  Mail,
  Phone,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Download,
  Share,
  Bell,
  CheckSquare,
  XCircle,
  ExclamationTriangle
} from '@phosphor-icons/react'

interface Deal {
  id: string
  dealNumber: string
  title: string
  value: number
  stage: string
  status: 'active' | 'won' | 'lost' | 'on_hold'
  accountId: string
  contactId: string
  leadId?: string
  quoteIds: string[]
  salesOrderIds: string[]
}

interface ConversionWorkflow {
  id: string
  name: string
  type: 'lead_to_deal' | 'deal_to_quote' | 'quote_to_order' | 'order_to_fulfillment' | 'customer_onboarding'
  steps: WorkflowStep[]
  isActive: boolean
  triggerConditions: Record<string, any>
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated'
  successRate: number
  avgTimeToComplete: number
  createdAt: string
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  type: 'action' | 'approval' | 'notification' | 'integration' | 'ai_decision'
  isRequired: boolean
  automationConfig?: Record<string, any>
  assigneeRole?: string
  estimatedDuration: number
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  completedAt?: string
  notes?: string
}

interface ConversionInstance {
  id: string
  workflowId: string
  dealId: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  currentStep: number
  startedAt: string
  completedAt?: string
  assignedTo: string
  progressPercentage: number
  stepStatuses: Record<string, WorkflowStep['status']>
  generatedAssets: ConversionAsset[]
}

interface ConversionAsset {
  id: string
  type: 'quote' | 'sales_order' | 'contract' | 'invoice' | 'welcome_package'
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'signed' | 'completed'
  documentUrl?: string
  metadata: Record<string, any>
  createdAt: string
}

interface DealConversionWorkflowProps {
  deals: Deal[]
  companyId: string
  userId: string
  onConversion: (dealId: string, conversionType: string) => void
}

export function DealConversionWorkflow({
  deals,
  companyId,
  userId,
  onConversion
}: DealConversionWorkflowProps) {
  const [workflows, setWorkflows] = useKV<ConversionWorkflow[]>(`conversion-workflows-${companyId}`, [])
  const [activeInstances, setActiveInstances] = useKV<ConversionInstance[]>(`conversion-instances-${companyId}`, [])
  const [selectedWorkflow, setSelectedWorkflow] = useState<ConversionWorkflow | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<ConversionInstance | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Initialize default workflows
  useEffect(() => {
    if (workflows.length === 0) {
      initializeDefaultWorkflows()
    }
  }, [])

  const initializeDefaultWorkflows = () => {
    const defaultWorkflows: ConversionWorkflow[] = [
      {
        id: 'lead-to-deal',
        name: 'Lead to Deal Conversion',
        type: 'lead_to_deal',
        isActive: true,
        automationLevel: 'semi_automated',
        successRate: 85,
        avgTimeToComplete: 2,
        triggerConditions: {
          leadScore: 75,
          engagementLevel: 'high',
          budgetConfirmed: true
        },
        steps: [
          {
            id: 'qualify-lead',
            name: 'Qualify Lead',
            description: 'Verify lead meets qualification criteria',
            type: 'ai_decision',
            isRequired: true,
            estimatedDuration: 1,
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'create-deal',
            name: 'Create Deal Record',
            description: 'Generate deal from qualified lead data',
            type: 'action',
            isRequired: true,
            estimatedDuration: 0.5,
            dependencies: ['qualify-lead'],
            status: 'pending'
          },
          {
            id: 'assign-owner',
            name: 'Assign Deal Owner',
            description: 'Route deal to appropriate sales representative',
            type: 'action',
            isRequired: true,
            assigneeRole: 'sales_manager',
            estimatedDuration: 1,
            dependencies: ['create-deal'],
            status: 'pending'
          },
          {
            id: 'notify-team',
            name: 'Notify Sales Team',
            description: 'Send notifications about new deal',
            type: 'notification',
            isRequired: false,
            estimatedDuration: 0.1,
            dependencies: ['assign-owner'],
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString()
      },
      
      {
        id: 'deal-to-quote',
        name: 'Deal to Quote Generation',
        type: 'deal_to_quote',
        isActive: true,
        automationLevel: 'semi_automated',
        successRate: 92,
        avgTimeToComplete: 4,
        triggerConditions: {
          dealStage: 'proposal',
          requirementsGathered: true,
          budgetApproved: true
        },
        steps: [
          {
            id: 'gather-requirements',
            name: 'Gather Requirements',
            description: 'Collect technical and business requirements',
            type: 'action',
            isRequired: true,
            assigneeRole: 'sales_engineer',
            estimatedDuration: 8,
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'product-configuration',
            name: 'Configure Products',
            description: 'Select and configure products/services',
            type: 'action',
            isRequired: true,
            estimatedDuration: 4,
            dependencies: ['gather-requirements'],
            status: 'pending'
          },
          {
            id: 'pricing-calculation',
            name: 'Calculate Pricing',
            description: 'Apply pricing rules and discounts',
            type: 'ai_decision',
            isRequired: true,
            estimatedDuration: 1,
            dependencies: ['product-configuration'],
            status: 'pending'
          },
          {
            id: 'generate-quote',
            name: 'Generate Quote Document',
            description: 'Create formal quote document',
            type: 'action',
            isRequired: true,
            estimatedDuration: 2,
            dependencies: ['pricing-calculation'],
            status: 'pending'
          },
          {
            id: 'approval-review',
            name: 'Management Approval',
            description: 'Review and approve quote terms',
            type: 'approval',
            isRequired: true,
            assigneeRole: 'sales_manager',
            estimatedDuration: 12,
            dependencies: ['generate-quote'],
            status: 'pending'
          },
          {
            id: 'send-quote',
            name: 'Send Quote to Customer',
            description: 'Deliver quote via email with tracking',
            type: 'action',
            isRequired: true,
            estimatedDuration: 0.5,
            dependencies: ['approval-review'],
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString()
      },

      {
        id: 'quote-to-order',
        name: 'Quote to Sales Order',
        type: 'quote_to_order',
        isActive: true,
        automationLevel: 'fully_automated',
        successRate: 96,
        avgTimeToComplete: 1,
        triggerConditions: {
          quoteAccepted: true,
          contractSigned: true,
          creditApproved: true
        },
        steps: [
          {
            id: 'verify-acceptance',
            name: 'Verify Quote Acceptance',
            description: 'Confirm customer acceptance and terms',
            type: 'action',
            isRequired: true,
            estimatedDuration: 1,
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'credit-check',
            name: 'Credit Verification',
            description: 'Perform credit check and approval',
            type: 'integration',
            isRequired: true,
            estimatedDuration: 2,
            dependencies: ['verify-acceptance'],
            status: 'pending'
          },
          {
            id: 'create-sales-order',
            name: 'Create Sales Order',
            description: 'Generate sales order in ERP system',
            type: 'integration',
            isRequired: true,
            estimatedDuration: 0.5,
            dependencies: ['credit-check'],
            status: 'pending'
          },
          {
            id: 'inventory-allocation',
            name: 'Allocate Inventory',
            description: 'Reserve inventory for order fulfillment',
            type: 'integration',
            isRequired: true,
            estimatedDuration: 1,
            dependencies: ['create-sales-order'],
            status: 'pending'
          },
          {
            id: 'order-confirmation',
            name: 'Send Order Confirmation',
            description: 'Notify customer of order confirmation',
            type: 'notification',
            isRequired: true,
            estimatedDuration: 0.1,
            dependencies: ['inventory-allocation'],
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString()
      },

      {
        id: 'customer-onboarding',
        name: 'Customer Onboarding',
        type: 'customer_onboarding',
        isActive: true,
        automationLevel: 'semi_automated',
        successRate: 88,
        avgTimeToComplete: 14,
        triggerConditions: {
          orderCompleted: true,
          implementationRequired: true
        },
        steps: [
          {
            id: 'welcome-package',
            name: 'Send Welcome Package',
            description: 'Deliver onboarding materials and credentials',
            type: 'action',
            isRequired: true,
            estimatedDuration: 4,
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'implementation-kickoff',
            name: 'Implementation Kickoff',
            description: 'Schedule and conduct kickoff meeting',
            type: 'action',
            isRequired: true,
            assigneeRole: 'customer_success',
            estimatedDuration: 24,
            dependencies: ['welcome-package'],
            status: 'pending'
          },
          {
            id: 'training-sessions',
            name: 'Conduct Training',
            description: 'Deliver user training sessions',
            type: 'action',
            isRequired: true,
            estimatedDuration: 40,
            dependencies: ['implementation-kickoff'],
            status: 'pending'
          },
          {
            id: 'go-live-support',
            name: 'Go-Live Support',
            description: 'Provide go-live assistance and monitoring',
            type: 'action',
            isRequired: true,
            estimatedDuration: 16,
            dependencies: ['training-sessions'],
            status: 'pending'
          },
          {
            id: 'success-review',
            name: 'Success Review',
            description: 'Conduct 30-day success review',
            type: 'action',
            isRequired: false,
            assigneeRole: 'customer_success',
            estimatedDuration: 8,
            dependencies: ['go-live-support'],
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString()
      }
    ]
    
    setWorkflows(defaultWorkflows)
  }

  const startConversion = async (dealId: string, workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    const newInstance: ConversionInstance = {
      id: `instance-${Date.now()}`,
      workflowId,
      dealId,
      status: 'running',
      currentStep: 0,
      startedAt: new Date().toISOString(),
      assignedTo: userId,
      progressPercentage: 0,
      stepStatuses: workflow.steps.reduce((acc, step) => {
        acc[step.id] = 'pending'
        return acc
      }, {} as Record<string, WorkflowStep['status']>),
      generatedAssets: []
    }

    setActiveInstances(current => [...current, newInstance])
    toast.success(`Started ${workflow.name} for deal ${dealId}`)
    
    // Auto-execute first step if it's automated
    if (workflow.steps[0]?.type === 'ai_decision' || workflow.steps[0]?.type === 'integration') {
      await executeStep(newInstance.id, workflow.steps[0].id)
    }
  }

  const executeStep = async (instanceId: string, stepId: string) => {
    const instance = activeInstances.find(i => i.id === instanceId)
    const workflow = workflows.find(w => w.id === instance?.workflowId)
    const step = workflow?.steps.find(s => s.id === stepId)
    
    if (!instance || !workflow || !step) return

    // Update step status to in_progress
    setActiveInstances(current =>
      current.map(inst =>
        inst.id === instanceId
          ? {
              ...inst,
              stepStatuses: {
                ...inst.stepStatuses,
                [stepId]: 'in_progress'
              }
            }
          : inst
      )
    )

    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate different outcomes based on step type
    let success = true
    let generatedAsset: ConversionAsset | null = null

    switch (step.type) {
      case 'ai_decision':
        success = Math.random() > 0.1 // 90% success rate
        break
      case 'integration':
        success = Math.random() > 0.05 // 95% success rate
        break
      case 'approval':
        success = Math.random() > 0.2 // 80% success rate
        break
      default:
        success = Math.random() > 0.05 // 95% success rate
    }

    // Generate assets for certain step types
    if (success && stepId === 'generate-quote') {
      generatedAsset = {
        id: `quote-${Date.now()}`,
        type: 'quote',
        status: 'draft',
        metadata: {
          dealId: instance.dealId,
          amount: Math.floor(Math.random() * 500000) + 50000,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date().toISOString()
      }
    } else if (success && stepId === 'create-sales-order') {
      generatedAsset = {
        id: `order-${Date.now()}`,
        type: 'sales_order',
        status: 'pending',
        metadata: {
          dealId: instance.dealId,
          orderNumber: `SO-${Date.now()}`,
          estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date().toISOString()
      }
    }

    // Update instance with step completion
    setActiveInstances(current =>
      current.map(inst =>
        inst.id === instanceId
          ? {
              ...inst,
              stepStatuses: {
                ...inst.stepStatuses,
                [stepId]: success ? 'completed' : 'failed'
              },
              currentStep: success ? inst.currentStep + 1 : inst.currentStep,
              progressPercentage: success 
                ? Math.round(((inst.currentStep + 1) / workflow.steps.length) * 100)
                : inst.progressPercentage,
              generatedAssets: generatedAsset 
                ? [...inst.generatedAssets, generatedAsset]
                : inst.generatedAssets,
              status: success && inst.currentStep + 1 >= workflow.steps.length 
                ? 'completed' 
                : success 
                ? 'running' 
                : 'failed',
              completedAt: success && inst.currentStep + 1 >= workflow.steps.length 
                ? new Date().toISOString() 
                : inst.completedAt
            }
          : inst
      )
    )

    if (success) {
      toast.success(`Completed: ${step.name}`)
      
      // Auto-execute next step if workflow is completed
      if (instance.currentStep + 1 >= workflow.steps.length) {
        onConversion(instance.dealId, workflow.type)
        toast.success(`${workflow.name} completed successfully!`)
      } else {
        // Check if next step can be auto-executed
        const nextStep = workflow.steps[instance.currentStep + 1]
        if (nextStep && (nextStep.type === 'ai_decision' || nextStep.type === 'integration')) {
          setTimeout(() => executeStep(instanceId, nextStep.id), 2000)
        }
      }
    } else {
      toast.error(`Failed: ${step.name}`)
    }
  }

  const pauseInstance = (instanceId: string) => {
    setActiveInstances(current =>
      current.map(inst =>
        inst.id === instanceId
          ? { ...inst, status: 'paused' }
          : inst
      )
    )
    toast.info('Workflow paused')
  }

  const resumeInstance = (instanceId: string) => {
    setActiveInstances(current =>
      current.map(inst =>
        inst.id === instanceId
          ? { ...inst, status: 'running' }
          : inst
      )
    )
    toast.info('Workflow resumed')
  }

  const getStepIcon = (stepType: string, status: WorkflowStep['status']) => {
    const baseClasses = "h-4 w-4"
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-600`} />
      case 'in_progress':
        return <Clock className={`${baseClasses} text-blue-600 animate-pulse`} />
      case 'failed':
        return <XCircle className={`${baseClasses} text-red-600`} />
      case 'skipped':
        return <ExclamationTriangle className={`${baseClasses} text-yellow-600`} />
      default:
        return <Clock className={`${baseClasses} text-gray-400`} />
    }
  }

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'lead_to_deal': return <Target className="h-5 w-5 text-blue-600" />
      case 'deal_to_quote': return <FileText className="h-5 w-5 text-purple-600" />
      case 'quote_to_order': return <ShoppingCart className="h-5 w-5 text-green-600" />
      case 'order_to_fulfillment': return <Truck className="h-5 w-5 text-orange-600" />
      case 'customer_onboarding': return <Users className="h-5 w-5 text-pink-600" />
      default: return <Workflow className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Deal Conversion Workflows</h2>
            <p className="text-muted-foreground">
              Automate lead-to-revenue conversion processes
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="active-instances">Active Instances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Workflows</p>
                    <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
                  </div>
                  <Workflow className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Running Instances</p>
                    <p className="text-2xl font-bold">{activeInstances.filter(i => i.status === 'running').length}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {workflows.length > 0 
                        ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
                        : 0}%
                    </p>
                  </div>
                  <TrendUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Completion</p>
                    <p className="text-2xl font-bold">
                      {workflows.length > 0 
                        ? Math.round(workflows.reduce((sum, w) => sum + w.avgTimeToComplete, 0) / workflows.length)
                        : 0}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Conversions</CardTitle>
              <CardDescription>
                Start conversion workflows for eligible deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.filter(w => w.isActive).map(workflow => (
                  <Card key={workflow.id} className="border-2 border-dashed border-muted">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getWorkflowIcon(workflow.type)}
                          <h3 className="font-semibold">{workflow.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Success Rate:</span>
                            <span>{workflow.successRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Time:</span>
                            <span>{workflow.avgTimeToComplete}h</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Steps:</span>
                            <span>{workflow.steps.length}</span>
                          </div>
                        </div>

                        <Select onValueChange={(dealId) => startConversion(dealId, workflow.id)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deal to convert" />
                          </SelectTrigger>
                          <SelectContent>
                            {deals.filter(deal => deal.status === 'active').map(deal => (
                              <SelectItem key={deal.id} value={deal.id}>
                                {deal.title} - ${deal.value.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-instances" className="space-y-4">
          {activeInstances.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Active Workflow Instances</h3>
                <p className="text-muted-foreground mb-4">
                  Start a conversion workflow to see instances here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeInstances.map(instance => {
                const workflow = workflows.find(w => w.id === instance.workflowId)
                const deal = deals.find(d => d.id === instance.dealId)
                
                if (!workflow || !deal) return null

                return (
                  <Card key={instance.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getWorkflowIcon(workflow.type)}
                            <div>
                              <h3 className="font-semibold">{workflow.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {deal.title} - ${deal.value.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(instance.status)}>
                              {instance.status}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => instance.status === 'running' 
                                ? pauseInstance(instance.id) 
                                : resumeInstance(instance.id)
                              }
                            >
                              {instance.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{instance.progressPercentage}%</span>
                          </div>
                          <Progress value={instance.progressPercentage} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Workflow Steps</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {workflow.steps.map((step, index) => (
                              <div 
                                key={step.id}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  index === instance.currentStep ? 'bg-primary/10 border border-primary/20' : ''
                                }`}
                              >
                                {getStepIcon(step.type, instance.stepStatuses[step.id])}
                                <span className="text-sm">{step.name}</span>
                                {index === instance.currentStep && instance.status === 'running' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => executeStep(instance.id, step.id)}
                                    className="ml-auto h-6 px-2"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {instance.generatedAssets.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Generated Assets</h4>
                            <div className="flex flex-wrap gap-2">
                              {instance.generatedAssets.map(asset => (
                                <Badge key={asset.id} variant="outline" className="flex items-center gap-1">
                                  {asset.type === 'quote' && <FileText className="h-3 w-3" />}
                                  {asset.type === 'sales_order' && <ShoppingCart className="h-3 w-3" />}
                                  {asset.type === 'contract' && <FileText className="h-3 w-3" />}
                                  {asset.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getWorkflowIcon(workflow.type)}
                        <h3 className="font-semibold">{workflow.name}</h3>
                      </div>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Steps:</span>
                        <span className="ml-2 font-medium">{workflow.steps.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="ml-2 font-medium">{workflow.successRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Automation:</span>
                        <span className="ml-2 font-medium capitalize">{workflow.automationLevel.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Time:</span>
                        <span className="ml-2 font-medium">{workflow.avgTimeToComplete}h</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map(workflow => (
                    <div key={workflow.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{workflow.name}</span>
                        <span className="text-sm text-muted-foreground">{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Leads</span>
                      <span className="text-sm font-medium">100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Qualified Deals</span>
                      <span className="text-sm font-medium">75</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Quotes Generated</span>
                      <span className="text-sm font-medium">60</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '60%'}} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Orders Placed</span>
                      <span className="text-sm font-medium">45</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Onboarded Customers</span>
                      <span className="text-sm font-medium">42</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{width: '42%'}} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}