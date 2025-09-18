import { useState } from 'react'
import { SyncConflict, ConflictResolutionStrategy } from '@/types/erp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Warning, 
  CheckCircle, 
  XCircle, 
  Robot, 
  User,
  ArrowsClockwise,
  TrendUp,
  Clock,
  Shield,
  Lightning,
  Brain
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AdvancedConflictResolutionProps {
  conflicts: SyncConflict[]
  onResolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy) => Promise<void>
  onBulkResolve: (conflictIds: string[], strategy: ConflictResolutionStrategy) => Promise<void>
  onEscalate: (conflictId: string, reason: string) => void
  onGetAISuggestion: (conflict: SyncConflict) => Promise<ConflictResolutionStrategy>
}

export function AdvancedConflictResolution({
  conflicts,
  onResolveConflict,
  onBulkResolve,
  onEscalate,
  onGetAISuggestion
}: AdvancedConflictResolutionProps) {
  const [selectedConflicts, setSelectedConflicts] = useState<string[]>([])
  const [resolutionStrategy, setResolutionStrategy] = useState<ConflictResolutionStrategy['strategy']>('server_wins')
  const [processingConflicts, setProcessingConflicts] = useState<Set<string>>(new Set())
  const [aiSuggestions, setAISuggestions] = useState<Record<string, ConflictResolutionStrategy>>({})
  const [escalationReason, setEscalationReason] = useState('')
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  const getPriorityColor = (priority: SyncConflict['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getBusinessImpactIcon = (impact: SyncConflict['businessImpact']) => {
    switch (impact) {
      case 'revenue': return <TrendUp size={16} className="text-green-600" />
      case 'compliance': return <Shield size={16} className="text-blue-600" />
      case 'operations': return <Lightning size={16} className="text-orange-600" />
      case 'reporting': return <Clock size={16} className="text-purple-600" />
      default: return null
    }
  }

  const handleGetAISuggestion = async (conflict: SyncConflict) => {
    try {
      setProcessingConflicts(prev => new Set(prev).add(conflict.id))
      const suggestion = await onGetAISuggestion(conflict)
      setAISuggestions(prev => ({ ...prev, [conflict.id]: suggestion }))
      toast.success(`AI suggestion generated for conflict ${conflict.id}`)
    } catch (error) {
      toast.error('Failed to get AI suggestion')
    } finally {
      setProcessingConflicts(prev => {
        const next = new Set(prev)
        next.delete(conflict.id)
        return next
      })
    }
  }

  const handleResolveConflict = async (conflict: SyncConflict, strategy: ConflictResolutionStrategy) => {
    try {
      setProcessingConflicts(prev => new Set(prev).add(conflict.id))
      await onResolveConflict(conflict.id, strategy)
    } finally {
      setProcessingConflicts(prev => {
        const next = new Set(prev)
        next.delete(conflict.id)
        return next
      })
    }
  }

  const handleBulkResolve = async () => {
    if (selectedConflicts.length === 0) {
      toast.error('Please select conflicts to resolve')
      return
    }

    const strategy: ConflictResolutionStrategy = {
      strategy: resolutionStrategy,
      confidence: 80,
      reasoning: `Bulk resolution using ${resolutionStrategy} strategy`
    }

    await onBulkResolve(selectedConflicts, strategy)
    setSelectedConflicts([])
    setShowBulkDialog(false)
  }

  const handleSelectAll = () => {
    if (selectedConflicts.length === conflicts.length) {
      setSelectedConflicts([])
    } else {
      setSelectedConflicts(conflicts.map(c => c.id))
    }
  }

  const handleToggleConflictSelection = (conflictId: string) => {
    setSelectedConflicts(prev => 
      prev.includes(conflictId) 
        ? prev.filter(id => id !== conflictId)
        : [...prev, conflictId]
    )
  }

  const groupedConflicts = conflicts.reduce((groups, conflict) => {
    const key = conflict.priority
    if (!groups[key]) groups[key] = []
    groups[key].push(conflict)
    return groups
  }, {} as Record<string, SyncConflict[]>)

  const criticalConflicts = conflicts.filter(c => c.priority === 'critical' || c.priority === 'high')
  const resolutionProgress = conflicts.length > 0 ? 
    (conflicts.filter(c => c.resolved).length / conflicts.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conflicts</p>
                <p className="text-2xl font-bold">{conflicts.length}</p>
              </div>
              <Warning size={20} className="text-orange-500" />
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
              <XCircle size={20} className="text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-500">{resolutionProgress.toFixed(0)}%</p>
              </div>
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <Progress value={resolutionProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Assisted</p>
                <p className="text-2xl font-bold text-blue-500">{Object.keys(aiSuggestions).length}</p>
              </div>
              <Brain size={20} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bulk Actions</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedConflicts.length === conflicts.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={selectedConflicts.length === 0}
                  >
                    Bulk Resolve ({selectedConflicts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Conflict Resolution</DialogTitle>
                    <DialogDescription>
                      Resolve {selectedConflicts.length} selected conflicts using a single strategy.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Resolution Strategy</Label>
                      <Select 
                        value={resolutionStrategy} 
                        onValueChange={(value: any) => setResolutionStrategy(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="server_wins">Server Wins</SelectItem>
                          <SelectItem value="client_wins">Client Wins</SelectItem>
                          <SelectItem value="merge">Intelligent Merge</SelectItem>
                          <SelectItem value="ai_assisted">AI Assisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkResolve}>
                      Resolve All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conflicts by Priority */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({groupedConflicts.critical?.length || 0})</TabsTrigger>
          <TabsTrigger value="high">High ({groupedConflicts.high?.length || 0})</TabsTrigger>
          <TabsTrigger value="medium">Medium ({groupedConflicts.medium?.length || 0})</TabsTrigger>
          <TabsTrigger value="low">Low ({groupedConflicts.low?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ConflictList
            conflicts={conflicts}
            selectedConflicts={selectedConflicts}
            processingConflicts={processingConflicts}
            aiSuggestions={aiSuggestions}
            onToggleSelection={handleToggleConflictSelection}
            onResolve={handleResolveConflict}
            onGetAISuggestion={handleGetAISuggestion}
            onEscalate={onEscalate}
            getPriorityColor={getPriorityColor}
            getBusinessImpactIcon={getBusinessImpactIcon}
          />
        </TabsContent>

        {(['critical', 'high', 'medium', 'low'] as const).map(priority => (
          <TabsContent key={priority} value={priority}>
            <ConflictList
              conflicts={groupedConflicts[priority] || []}
              selectedConflicts={selectedConflicts}
              processingConflicts={processingConflicts}
              aiSuggestions={aiSuggestions}
              onToggleSelection={handleToggleConflictSelection}
              onResolve={handleResolveConflict}
              onGetAISuggestion={handleGetAISuggestion}
              onEscalate={onEscalate}
              getPriorityColor={getPriorityColor}
              getBusinessImpactIcon={getBusinessImpactIcon}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface ConflictListProps {
  conflicts: SyncConflict[]
  selectedConflicts: string[]
  processingConflicts: Set<string>
  aiSuggestions: Record<string, ConflictResolutionStrategy>
  onToggleSelection: (conflictId: string) => void
  onResolve: (conflict: SyncConflict, strategy: ConflictResolutionStrategy) => Promise<void>
  onGetAISuggestion: (conflict: SyncConflict) => void
  onEscalate: (conflictId: string, reason: string) => void
  getPriorityColor: (priority: SyncConflict['priority']) => string
  getBusinessImpactIcon: (impact: SyncConflict['businessImpact']) => React.ReactNode
}

function ConflictList({
  conflicts,
  selectedConflicts,
  processingConflicts,
  aiSuggestions,
  onToggleSelection,
  onResolve,
  onGetAISuggestion,
  onEscalate,
  getPriorityColor,
  getBusinessImpactIcon
}: ConflictListProps) {
  const [escalationReason, setEscalationReason] = useState('')
  const [escalatingConflict, setEscalatingConflict] = useState<string | null>(null)

  const handleEscalate = (conflictId: string) => {
    if (escalationReason.trim()) {
      onEscalate(conflictId, escalationReason)
      setEscalationReason('')
      setEscalatingConflict(null)
    }
  }

  if (conflicts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle size={32} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">No Conflicts Found</h3>
          <p className="text-muted-foreground">All data is synchronized successfully.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {conflicts.map((conflict) => {
        const isSelected = selectedConflicts.includes(conflict.id)
        const isProcessing = processingConflicts.has(conflict.id)
        const aiSuggestion = aiSuggestions[conflict.id]

        return (
          <Card key={conflict.id} className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(conflict.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(conflict.priority) as any}>
                        {conflict.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {conflict.module}
                      </Badge>
                      <Badge variant="outline">
                        {conflict.conflictType}
                      </Badge>
                      {getBusinessImpactIcon(conflict.businessImpact)}
                    </div>
                    <CardTitle className="text-lg">
                      {conflict.entity} - {conflict.field}
                    </CardTitle>
                    <CardDescription>
                      ID: {conflict.entityId} • {new Date(conflict.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <div className="flex items-center gap-2">
                      <ArrowsClockwise size={16} className="animate-spin" />
                      <span className="text-sm text-muted-foreground">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Value Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Server Value</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">{JSON.stringify(conflict.serverValue, null, 2)}</code>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Client Value</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">{JSON.stringify(conflict.clientValue, null, 2)}</code>
                  </div>
                </div>
              </div>

              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Robot size={20} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">AI Recommendation</h4>
                      <p className="text-sm text-blue-700 mt-1">{aiSuggestion.reasoning}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-blue-700">
                          Strategy: {aiSuggestion.strategy}
                        </Badge>
                        <Badge variant="outline" className="text-blue-700">
                          Confidence: {aiSuggestion.confidence}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGetAISuggestion(conflict)}
                    disabled={isProcessing || !!aiSuggestion}
                  >
                    <Robot size={16} className="mr-1" />
                    {aiSuggestion ? 'AI Analyzed' : 'Get AI Suggestion'}
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEscalatingConflict(conflict.id)}
                      >
                        <Warning size={16} className="mr-1" />
                        Escalate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Escalate Conflict</DialogTitle>
                        <DialogDescription>
                          Provide a reason for escalating this conflict to higher priority.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Reason for escalation..."
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setEscalatingConflict(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleEscalate(conflict.id)}
                          disabled={!escalationReason.trim()}
                        >
                          Escalate
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve(conflict, { strategy: 'server_wins', confidence: 100, reasoning: 'Manual server wins selection' })}
                    disabled={isProcessing}
                  >
                    Server Wins
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolve(conflict, { strategy: 'client_wins', confidence: 100, reasoning: 'Manual client wins selection' })}
                    disabled={isProcessing}
                  >
                    Client Wins
                  </Button>
                  {aiSuggestion && (
                    <Button
                      size="sm"
                      onClick={() => onResolve(conflict, aiSuggestion)}
                      disabled={isProcessing}
                    >
                      Use AI Suggestion
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}