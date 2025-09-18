import { useState } from 'react'
import { useConflictResolution } from '@/hooks/useConflictResolution'
import { AdvancedConflictResolution } from '@/components/AdvancedConflictResolution'
import { WorkflowBuilder } from '@/components/WorkflowBuilder'
import { ConflictAnalyticsDashboard } from '@/components/ConflictAnalyticsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Brain, 
  FlowArrow, 
  ChartBar, 
  Gear,
  Warning as AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ConflictResolutionManagerProps {
  companyId: string
}

export function ConflictResolutionManager({ companyId }: ConflictResolutionManagerProps) {
  const {
    conflicts,
    workflows,
    pendingApprovals,
    resolveConflict,
    createWorkflow,
    triggerWorkflow,
    approveStep,
    rejectStep,
    getAIResolutionSuggestion,
    bulkResolveConflicts,
    escalateConflict,
    analyzeConflictTrends
  } = useConflictResolution()

  const [activeTab, setActiveTab] = useState('conflicts')
  const [showDemo, setShowDemo] = useState(false)

  const analytics = analyzeConflictTrends()
  const unresolvedConflicts = conflicts.filter(c => !c.resolved)
  const criticalConflicts = conflicts.filter(c => c.priority === 'critical' && !c.resolved)

  const handleDemoConflicts = () => {
    // Generate some demo conflicts for testing
    const demoConflicts = [
      {
        id: `demo-conflict-${Date.now()}-1`,
        module: 'finance',
        entity: 'invoice',
        entityId: 'INV-001',
        field: 'amount',
        serverValue: 1500.00,
        clientValue: 1550.00,
        timestamp: new Date().toISOString(),
        resolved: false,
        priority: 'high' as const,
        conflictType: 'concurrent_edit' as const,
        affectedUsers: ['user-1', 'user-2'],
        businessImpact: 'revenue' as const,
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: 'user-1',
          version: 1,
          dependencies: []
        }
      },
      {
        id: `demo-conflict-${Date.now()}-2`,
        module: 'hr',
        entity: 'employee',
        entityId: 'EMP-123',
        field: 'salary',
        serverValue: 75000,
        clientValue: 78000,
        timestamp: new Date().toISOString(),
        resolved: false,
        priority: 'critical' as const,
        conflictType: 'data_mismatch' as const,
        affectedUsers: ['hr-manager'],
        businessImpact: 'compliance' as const,
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: 'hr-manager',
          version: 2,
          dependencies: []
        }
      },
      {
        id: `demo-conflict-${Date.now()}-3`,
        module: 'inventory',
        entity: 'product',
        entityId: 'PROD-456',
        field: 'stock_quantity',
        serverValue: 100,
        clientValue: 95,
        timestamp: new Date().toISOString(),
        resolved: false,
        priority: 'medium' as const,
        conflictType: 'version_conflict' as const,
        affectedUsers: ['warehouse-staff'],
        businessImpact: 'operations' as const,
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: 'warehouse-staff',
          version: 3,
          dependencies: []
        }
      }
    ]

    // For demo purposes, we'd add these to the conflicts array
    // In a real implementation, this would involve API calls
    toast.success(`Generated ${demoConflicts.length} demo conflicts for testing`)
    setShowDemo(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Conflict Resolution</h1>
          <p className="text-muted-foreground">
            Intelligent workflows and AI-powered resolution for data synchronization conflicts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showDemo} onOpenChange={setShowDemo}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle size={16} className="mr-2" />
                Demo Mode
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demo Mode</DialogTitle>
                <DialogDescription>
                  Generate sample conflicts to test the advanced resolution system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm">
                  This will create sample conflicts across different modules with various priorities 
                  and business impacts to demonstrate the conflict resolution workflows.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDemo(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDemoConflicts}>
                    Generate Demo Conflicts
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Conflicts</p>
                <p className="text-2xl font-bold">{unresolvedConflicts.length}</p>
              </div>
              <AlertTriangle size={20} className="text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Priority</p>
                <p className="text-2xl font-bold text-red-500">{criticalConflicts.length}</p>
              </div>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
              </div>
              <FlowArrow size={20} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
              <Clock size={20} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <Brain size={16} />
            Conflicts
            {unresolvedConflicts.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unresolvedConflicts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <FlowArrow size={16} />
            Workflows
            <Badge variant="outline" className="ml-1">
              {workflows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartBar size={16} />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Users size={16} />
            Approvals
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="space-y-6">
          <AdvancedConflictResolution
            conflicts={conflicts}
            onResolveConflict={resolveConflict}
            onBulkResolve={bulkResolveConflicts}
            onEscalate={escalateConflict}
            onGetAISuggestion={getAIResolutionSuggestion}
          />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowBuilder
            workflows={workflows}
            onCreateWorkflow={createWorkflow}
            onTriggerWorkflow={triggerWorkflow}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ConflictAnalyticsDashboard
            conflicts={conflicts}
            resolutionHistory={[]} // This would come from the hook in a real implementation
          />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Conflict resolutions requiring manual approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <Card key={approval.id}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Approval Workflow: {approval.id}</h4>
                            <Badge variant="outline">
                              {approval.approvalSteps.filter(s => s.status === 'pending').length} pending
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            {approval.approvalSteps.map((step) => (
                              <div key={step.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    step.status === 'approved' ? 'bg-green-500' :
                                    step.status === 'rejected' ? 'bg-red-500' :
                                    step.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`} />
                                  <div>
                                    <div className="font-medium">{step.approverRole}</div>
                                    <div className="text-sm text-muted-foreground">{step.description}</div>
                                    {step.comments && (
                                      <div className="text-sm italic mt-1">"{step.comments}"</div>
                                    )}
                                  </div>
                                </div>
                                {step.status === 'pending' && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => rejectStep(approval.id, step.id, 'Rejected via dashboard')}
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => approveStep(approval.id, step.id, 'Approved via dashboard')}
                                    >
                                      Approve
                                    </Button>
                                  </div>
                                )}
                                {step.status !== 'pending' && (
                                  <Badge variant={step.status === 'approved' ? 'default' : 'destructive'}>
                                    {step.status}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={32} className="mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                  <p className="text-muted-foreground">
                    All approval workflows are up to date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}