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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  QuoteApprovalWorkflow,
  ApprovalLevel,
  ApprovalTriggerCondition,
  ApprovalApprover,
  Quote,
  QuoteApproval,
  ApprovalMatrix
} from '@/types/crm'
import { 
  Plus,
  Gear as Settings,
  Trash,
  Shield,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Warning as AlertTriangle,
  Eye,
  PencilSimple as Edit,
  Copy,
  FlowArrow,
  TreeStructure,
  Target,
  Lightning,
  Bell,
  FileText,
  CurrencyDollar as DollarSign,
  Percent,
  Crown,
  Building
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteApprovalWorkflowManagerProps {
  companyId: string
  userId: string
  userRole: string
}

// Mock data for approval workflows
const mockApprovalWorkflows: QuoteApprovalWorkflow[] = [
  {
    id: 'workflow-001',
    companyId: 'comp-001',
    name: 'Standard Quote Approval',
    description: 'Standard approval workflow for quotes based on amount thresholds',
    isActive: true,
    triggerConditions: [
      {
        id: 'trigger-001',
        type: 'amount_threshold',
        operator: 'greater_than',
        value: 10000,
        priority: 1
      },
      {
        id: 'trigger-002',
        type: 'discount_percentage',
        operator: 'greater_than',
        value: 15,
        priority: 2
      }
    ],
    approvalChain: [
      {
        id: 'level-001',
        name: 'Sales Manager Approval',
        order: 1,
        approvalType: 'role_based',
        approvers: [
          {
            id: 'approver-001',
            type: 'role',
            roleId: 'sales_manager',
            maxApprovalAmount: 50000,
            isBackup: false,
            order: 1
          }
        ],
        requiredApprovals: 1,
        timeoutHours: 24,
        parallelApproval: false
      },
      {
        id: 'level-002',
        name: 'Director Approval',
        order: 2,
        approvalType: 'role_based',
        approvers: [
          {
            id: 'approver-002',
            type: 'role',
            roleId: 'sales_director',
            maxApprovalAmount: 100000,
            isBackup: false,
            order: 1
          }
        ],
        requiredApprovals: 1,
        timeoutHours: 48,
        parallelApproval: false
      }
    ],
    settings: {
      allowParallelApproval: false,
      requireComments: true,
      allowDelegation: true,
      notifyCreator: true,
      notifyAssignee: true,
      emailTemplates: {
        pending: 'Quote pending approval',
        approved: 'Quote approved',
        rejected: 'Quote rejected',
        escalated: 'Quote escalated'
      },
      reminders: {
        enabled: true,
        intervals: [24, 48, 72],
        maxReminders: 3
      },
      audit: {
        trackViews: true,
        trackEdits: true,
        requireSignature: false
      }
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]

export function QuoteApprovalWorkflowManager({ companyId, userId, userRole }: QuoteApprovalWorkflowManagerProps) {
  const [workflows, setWorkflows] = useKV<QuoteApprovalWorkflow[]>(`approval-workflows-${companyId}`, mockApprovalWorkflows)
  const [selectedWorkflow, setSelectedWorkflow] = useState<QuoteApprovalWorkflow | null>(null)
  const [showWorkflowForm, setShowWorkflowForm] = useState(false)
  const [showApprovalMatrix, setShowApprovalMatrix] = useState(false)
  const [activeTab, setActiveTab] = useState('workflows')
  const [formData, setFormData] = useState<Partial<QuoteApprovalWorkflow>>({})

  // Approval status summary
  const [pendingApprovals] = useKV<QuoteApproval[]>(`pending-approvals-${companyId}`, [])
  const [approvalStats, setApprovalStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    escalated: 0
  })

  useEffect(() => {
    if (pendingApprovals) {
      const stats = pendingApprovals.reduce((acc, approval) => {
        acc[approval.status as keyof typeof acc]++
        return acc
      }, { pending: 0, approved: 0, rejected: 0, escalated: 0, delegated: 0, expired: 0 })
      
      setApprovalStats(stats)
    }
  }, [pendingApprovals])

  const handleCreateWorkflow = () => {
    if (!formData.name || !formData.triggerConditions?.length || !formData.approvalChain?.length) {
      toast.error('Please fill in all required fields')
      return
    }

    const newWorkflow: QuoteApprovalWorkflow = {
      id: `workflow-${Date.now()}`,
      companyId,
      name: formData.name,
      description: formData.description || '',
      isActive: formData.isActive ?? true,
      triggerConditions: formData.triggerConditions || [],
      approvalChain: formData.approvalChain || [],
      settings: formData.settings || {
        allowParallelApproval: false,
        requireComments: true,
        allowDelegation: true,
        notifyCreator: true,
        notifyAssignee: true,
        emailTemplates: {
          pending: 'Quote pending approval',
          approved: 'Quote approved',
          rejected: 'Quote rejected',
          escalated: 'Quote escalated'
        },
        reminders: {
          enabled: true,
          intervals: [24, 48],
          maxReminders: 2
        },
        audit: {
          trackViews: true,
          trackEdits: true,
          requireSignature: false
        }
      },
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setWorkflows(current => [...(current || []), newWorkflow])
    setFormData({})
    setShowWorkflowForm(false)
    toast.success('Approval workflow created successfully')
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(current => {
      if (!current) return []
      return current.filter(w => w.id !== workflowId)
    })
    toast.success('Workflow deleted successfully')
  }

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(current => {
      if (!current) return []
      return current.map(w =>
        w.id === workflowId ? { ...w, isActive: !w.isActive } : w
      )
    })
  }

  const getApprovalTypeIcon = (type: string) => {
    switch (type) {
      case 'role_based': return <Crown size={16} />
      case 'specific_users': return <Users size={16} />
      case 'department': return <Building size={16} />
      case 'manager_hierarchy': return <TreeStructure size={16} />
      case 'amount_based': return <DollarSign size={16} />
      default: return <Shield size={16} />
    }
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'amount_threshold': return <DollarSign size={16} />
      case 'discount_percentage': return <Percent size={16} />
      case 'product_category': return <FileText size={16} />
      case 'customer_type': return <Users size={16} />
      default: return <Target size={16} />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-500', icon: <Clock size={12} /> },
      approved: { color: 'bg-green-500', icon: <CheckCircle size={12} /> },
      rejected: { color: 'bg-red-500', icon: <XCircle size={12} /> },
      escalated: { color: 'bg-orange-500', icon: <AlertTriangle size={12} /> }
    }[status] || { color: 'bg-gray-500', icon: <Clock size={12} /> }

    return (
      <Badge variant="outline" className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quote Approval Workflows</h2>
          <p className="text-muted-foreground">
            Configure multi-level authorization chains for quote approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowApprovalMatrix(true)}>
            <TreeStructure size={16} className="mr-2" />
            Approval Matrix
          </Button>
          <Dialog open={showWorkflowForm} onOpenChange={setShowWorkflowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{approvalStats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{approvalStats.approved}</p>
              </div>
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{approvalStats.rejected}</p>
              </div>
              <XCircle className="text-red-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-orange-600">{approvalStats.escalated}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflows</CardTitle>
              <CardDescription>
                Configure automated approval chains based on quote criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows && workflows.length > 0 ? (
                  workflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FlowArrow size={20} />
                            <h3 className="font-semibold">{workflow.name}</h3>
                          </div>
                          <Badge variant={workflow.isActive ? "default" : "secondary"}>
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={workflow.isActive}
                            onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWorkflow(workflow)}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      )}

                      {/* Trigger Conditions */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Target size={14} />
                          Trigger Conditions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.triggerConditions.map((condition) => (
                            <Badge key={condition.id} variant="outline" className="flex items-center gap-1">
                              {getTriggerIcon(condition.type)}
                              {condition.type.replace('_', ' ')} {condition.operator} {condition.value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Approval Chain */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TreeStructure size={14} />
                          Approval Chain ({workflow.approvalChain.length} levels)
                        </h4>
                        <div className="flex items-center gap-2">
                          {workflow.approvalChain
                            .sort((a, b) => a.order - b.order)
                            .map((level, index) => (
                              <React.Fragment key={level.id}>
                                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                  {getApprovalTypeIcon(level.approvalType)}
                                  <span className="text-sm font-medium">{level.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {level.requiredApprovals} required
                                  </Badge>
                                </div>
                                {index < workflow.approvalChain.length - 1 && (
                                  <ArrowRight size={16} className="text-muted-foreground" />
                                )}
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FlowArrow size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No workflows configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first approval workflow to automate quote authorizations
                    </p>
                    <Button onClick={() => setShowWorkflowForm(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Workflow
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Quotes awaiting approval in your authorization chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals && pendingApprovals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">Quote #{approval.quoteId.slice(-6)}</div>
                            <div className="text-sm text-muted-foreground">
                              Assigned to {approval.approverName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{approval.workflowId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{approval.levelId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {approval.requestedAt.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(approval.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground">
                    All quotes are up to date with their approval status
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                Complete audit trail of all approval activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Approval history coming soon</h3>
                <p className="text-muted-foreground">
                  View detailed logs of all approval decisions and timeline
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Approval Settings</CardTitle>
              <CardDescription>
                Configure company-wide approval preferences and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Default Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Require comments on rejection</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow approval delegation</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Send email notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Track approval views</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Timeout Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default approval timeout (hours)</Label>
                      <Input type="number" defaultValue="24" />
                    </div>
                    <div>
                      <Label>Escalation timeout (hours)</Label>
                      <Input type="number" defaultValue="48" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Reminder intervals (hours)</Label>
                      <Input placeholder="24,48,72" defaultValue="24,48,72" />
                    </div>
                    <div>
                      <Label>Maximum reminders</Label>
                      <Input type="number" defaultValue="3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Dialog */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlowArrow size={20} />
                {selectedWorkflow.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Workflow Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div>
                        <Badge variant={selectedWorkflow.isActive ? "default" : "secondary"}>
                          {selectedWorkflow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <div className="text-sm">
                        {selectedWorkflow.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {selectedWorkflow.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedWorkflow.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trigger Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trigger Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedWorkflow.triggerConditions.map((condition) => (
                      <div key={condition.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getTriggerIcon(condition.type)}
                        <div className="flex-1">
                          <div className="font-medium">
                            {condition.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {condition.operator} {condition.value}
                            {condition.secondaryValue && ` and ${condition.secondaryValue}`}
                          </div>
                        </div>
                        <Badge variant="outline">Priority {condition.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Approval Chain */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Approval Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedWorkflow.approvalChain
                      .sort((a, b) => a.order - b.order)
                      .map((level, index) => (
                        <div key={level.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                              {level.order}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{level.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {level.approvalType.replace('_', ' ')} • {level.requiredApprovals} approval(s) required
                              </p>
                            </div>
                            {getApprovalTypeIcon(level.approvalType)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <Label className="text-xs font-medium">Timeout</Label>
                              <div className="text-sm">{level.timeoutHours || 24} hours</div>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Parallel Approval</Label>
                              <div className="text-sm">{level.parallelApproval ? 'Yes' : 'No'}</div>
                            </div>
                          </div>

                          {level.approvers.length > 0 && (
                            <div>
                              <Label className="text-xs font-medium">Approvers</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {level.approvers.map((approver) => (
                                  <Badge key={approver.id} variant="outline" className="flex items-center gap-1">
                                    {approver.type === 'role' && <Crown size={12} />}
                                    {approver.type === 'user' && <Users size={12} />}
                                    {approver.type === 'department' && <Building size={12} />}
                                    {approver.roleId || approver.userId || approver.departmentId}
                                    {approver.maxApprovalAmount && (
                                      <span className="text-xs">($${approver.maxApprovalAmount.toLocaleString()})</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}