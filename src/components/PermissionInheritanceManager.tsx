import React, { useState } from 'react'
import { usePermissionInheritance } from '@/hooks/usePermissionInheritance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Warning, TreeStructure, Users, Shield, ArrowDown, ArrowRight, CaretDown, CaretRight, Plus, WarningCircle, CheckCircle, Clock, X } from '@phosphor-icons/react'
import { Role, PermissionInheritanceTree, PermissionConflict, PermissionDelegation, RoleHierarchy } from '@/types/rbac'
import { toast } from 'sonner'

interface PermissionInheritanceManagerProps {
  companyId: string
}

export function PermissionInheritanceManager({ companyId }: PermissionInheritanceManagerProps) {
  const {
    roleHierarchy,
    inheritanceTree,
    effectivePermissions,
    permissionConflicts,
    delegations,
    isLoading,
    createRoleHierarchy,
    updateRoleHierarchy,
    calculateEffectivePermissions,
    getInheritanceChain,
    buildInheritanceTree,
    detectPermissionConflicts,
    resolveConflict,
    createDelegation,
    revokeDelegation,
    addRoleToHierarchy,
    removeRoleFromHierarchy,
    moveRoleInHierarchy,
    validatePermissionInheritance,
    previewPermissionChanges
  } = usePermissionInheritance(companyId)

  const [activeTab, setActiveTab] = useState('hierarchy')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showCreateHierarchy, setShowCreateHierarchy] = useState(false)
  const [showCreateDelegation, setShowCreateDelegation] = useState(false)

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderInheritanceTree = (tree: PermissionInheritanceTree, depth = 0) => {
    const isExpanded = expandedNodes.has(tree.roleId)
    const hasChildren = tree.children && tree.children.length > 0
    const hasConflicts = tree.conflicts && tree.conflicts.length > 0
    
    return (
      <div key={tree.roleId} className="border rounded-lg p-4 mb-4" style={{ marginLeft: depth * 20 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <button
                onClick={() => toggleNodeExpansion(tree.roleId)}
                className="p-1 hover:bg-muted rounded"
              >
                {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
              </button>
            )}
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              <div>
                <h4 className="font-semibold">{tree.roleName}</h4>
                <p className="text-sm text-muted-foreground">Level {tree.level}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {tree.directPermissions.length} Direct
            </Badge>
            <Badge variant="secondary">
              {tree.inheritedPermissions.length} Inherited
            </Badge>
            <Badge variant="default">
              {tree.effectivePermissions.length} Total
            </Badge>
            {hasConflicts && (
              <Badge variant="destructive">
                <Warning size={12} className="mr-1" />
                {tree.conflicts.length} Conflicts
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRole(tree.roleId)}
            >
              View Details
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Permission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Direct Permissions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-primary">
                    {tree.directPermissions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assigned to this role
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Inherited Permissions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-secondary">
                    {tree.inheritedPermissions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From parent roles
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Effective Permissions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-accent">
                    {tree.effectivePermissions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total after inheritance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Conflicts */}
            {hasConflicts && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Warning size={16} className="text-destructive" />
                    Permission Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tree.conflicts.map((conflict, index) => (
                      <ConflictCard
                        key={conflict.id}
                        conflict={conflict}
                        onResolve={(resolution) => resolveConflict(conflict.id, resolution)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inheritance Details */}
            {tree.inheritedPermissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Inheritance Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {tree.inheritedPermissions.map((inherited, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <ArrowDown size={12} className="text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {inherited.sourceRoleName}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <span>{inherited.permission.action}</span>
                          <span className="text-muted-foreground">on</span>
                          <span>{inherited.permission.resourceType}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {isExpanded && hasChildren && (
          <div className="mt-4">
            {tree.children.map(child => renderInheritanceTree(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permission Inheritance & Role Hierarchies</h2>
          <p className="text-muted-foreground">
            Manage role hierarchies, permission inheritance, and delegation workflows
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {permissionConflicts.length > 0 && (
            <Badge variant="destructive">
              <Warning size={12} className="mr-1" />
              {permissionConflicts.length} Conflicts
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowCreateHierarchy(true)}>
            <TreeStructure size={16} className="mr-2" />
            Create Hierarchy
          </Button>
          <Button variant="outline" onClick={() => setShowCreateDelegation(true)}>
            <Users size={16} className="mr-2" />
            Create Delegation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
          <TabsTrigger value="inheritance">Inheritance Tree</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="delegations">Delegations</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="space-y-4">
          {roleHierarchy ? (
            <Card>
              <CardHeader>
                <CardTitle>{roleHierarchy.name}</CardTitle>
                <CardDescription>{roleHierarchy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleHierarchy.levels.map((level, index) => (
                    <div key={level.level} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Level {level.level}: {level.name}</h4>
                        <Badge variant="outline">{level.roles.length} Roles</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Can Inherit From</h5>
                          <div className="flex flex-wrap gap-1">
                            {level.canInheritFrom.map(fromLevel => (
                              <Badge key={fromLevel} variant="secondary" className="text-xs">
                                Level {fromLevel}
                              </Badge>
                            ))}
                            {level.canInheritFrom.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Can Delegate To</h5>
                          <div className="flex flex-wrap gap-1">
                            {level.canDelegateTo.map(toLevel => (
                              <Badge key={toLevel} variant="secondary" className="text-xs">
                                Level {toLevel}
                              </Badge>
                            ))}
                            {level.canDelegateTo.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TreeStructure size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Role Hierarchy</h3>
                <p className="text-muted-foreground mb-4">
                  Create a role hierarchy to define inheritance relationships
                </p>
                <Button onClick={() => setShowCreateHierarchy(true)}>
                  Create Role Hierarchy
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inheritance" className="space-y-4">
          {inheritanceTree.length > 0 ? (
            <div className="space-y-4">
              {inheritanceTree.map(tree => renderInheritanceTree(tree))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TreeStructure size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Inheritance Tree</h3>
                <p className="text-muted-foreground">
                  Role inheritance will be displayed here when roles are configured
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {permissionConflicts.length > 0 ? (
            <div className="space-y-4">
              {permissionConflicts.map(conflict => (
                <ConflictCard
                  key={conflict.id}
                  conflict={conflict}
                  onResolve={(resolution) => resolveConflict(conflict.id, resolution)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No Conflicts</h3>
                <p className="text-muted-foreground">
                  All permission inheritance is working correctly
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delegations" className="space-y-4">
          {delegations.length > 0 ? (
            <div className="space-y-4">
              {delegations.map(delegation => (
                <DelegationCard
                  key={delegation.id}
                  delegation={delegation}
                  onRevoke={(reason) => revokeDelegation(delegation.id, reason)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Delegations</h3>
                <p className="text-muted-foreground mb-4">
                  Create permission delegations to temporarily grant access
                </p>
                <Button onClick={() => setShowCreateDelegation(true)}>
                  Create Delegation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <ValidationPanel
            companyId={companyId}
            onValidate={validatePermissionInheritance}
          />
        </TabsContent>
      </Tabs>

      {/* Create Hierarchy Dialog */}
      <CreateHierarchyDialog
        open={showCreateHierarchy}
        onOpenChange={setShowCreateHierarchy}
        onCreateHierarchy={createRoleHierarchy}
        companyId={companyId}
      />

      {/* Create Delegation Dialog */}
      <CreateDelegationDialog
        open={showCreateDelegation}
        onOpenChange={setShowCreateDelegation}
        onCreateDelegation={createDelegation}
        companyId={companyId}
      />
    </div>
  )
}

function ConflictCard({ 
  conflict, 
  onResolve 
}: { 
  conflict: PermissionConflict
  onResolve: (resolution: 'allow' | 'deny' | 'highest_priority') => void 
}) {
  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Warning size={16} className="text-destructive" />
            {conflict.conflictType.replace('_', ' ').toUpperCase()} Conflict
          </CardTitle>
          <Badge variant="destructive">{conflict.conflictType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">Permission: {conflict.permissionId}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onResolve('allow')}>
            Allow
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResolve('deny')}>
            Deny
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResolve('highest_priority')}>
            Highest Priority
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DelegationCard({ 
  delegation, 
  onRevoke 
}: { 
  delegation: PermissionDelegation
  onRevoke: (reason?: string) => void 
}) {
  const isActive = delegation.status === 'active'
  const isExpired = delegation.expiresAt && new Date(delegation.expiresAt) < new Date()

  return (
    <Card className={!isActive ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Permission Delegation</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {delegation.status}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">
                <Clock size={12} className="mr-1" />
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">From:</span> {delegation.delegatorRoleId}
          </div>
          <div>
            <span className="font-medium">To:</span> {delegation.delegateeRoleId}
          </div>
          <div>
            <span className="font-medium">Permissions:</span> {delegation.delegatedPermissions.length}
          </div>
          {delegation.expiresAt && (
            <div>
              <span className="font-medium">Expires:</span> {new Date(delegation.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="mt-4">
            <Button size="sm" variant="destructive" onClick={() => onRevoke()}>
              <X size={12} className="mr-1" />
              Revoke
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateHierarchyDialog({ 
  open, 
  onOpenChange, 
  onCreateHierarchy, 
  companyId 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateHierarchy: (hierarchy: any) => Promise<void>
  companyId: string
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    if (!name) return

    await onCreateHierarchy({
      companyId,
      name,
      description,
      levels: [
        { level: 1, name: 'Super Admin', description: 'System administrators', roles: [], canInheritFrom: [], canDelegateTo: [2, 3, 4, 5], defaultPermissions: [] },
        { level: 2, name: 'Admin', description: 'Company administrators', roles: [], canInheritFrom: [1], canDelegateTo: [3, 4, 5], defaultPermissions: [] },
        { level: 3, name: 'Manager', description: 'Department managers', roles: [], canInheritFrom: [1, 2], canDelegateTo: [4, 5], defaultPermissions: [] },
        { level: 4, name: 'User', description: 'Regular users', roles: [], canInheritFrom: [1, 2, 3], canDelegateTo: [5], defaultPermissions: [] },
        { level: 5, name: 'Viewer', description: 'Read-only access', roles: [], canInheritFrom: [1, 2, 3, 4], canDelegateTo: [], defaultPermissions: [] }
      ],
      inheritanceRules: [],
      isActive: true
    })
    
    setName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Role Hierarchy</DialogTitle>
          <DialogDescription>
            Define a role hierarchy to establish inheritance relationships
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="hierarchy-name">Name</Label>
            <Input
              id="hierarchy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hierarchy name"
            />
          </div>
          
          <div>
            <Label htmlFor="hierarchy-description">Description</Label>
            <Textarea
              id="hierarchy-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter hierarchy description"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name}>
              Create Hierarchy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateDelegationDialog({ 
  open, 
  onOpenChange, 
  onCreateDelegation, 
  companyId 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateDelegation: (delegation: any) => Promise<void>
  companyId: string
}) {
  const [delegatorRoleId, setDelegatorRoleId] = useState('')
  const [delegateeRoleId, setDelegateeRoleId] = useState('')

  const handleSubmit = async () => {
    if (!delegatorRoleId || !delegateeRoleId) return

    await onCreateDelegation({
      delegatorRoleId,
      delegateeRoleId,
      delegatedPermissions: [],
      conditions: {},
      maxDelegationDepth: 1,
      isRevocable: true,
      status: 'active' as const,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })
    
    setDelegatorRoleId('')
    setDelegateeRoleId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Permission Delegation</DialogTitle>
          <DialogDescription>
            Delegate permissions from one role to another
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="delegator-role">From Role</Label>
            <Select value={delegatorRoleId} onValueChange={setDelegatorRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select delegator role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="delegatee-role">To Role</Label>
            <Select value={delegateeRoleId} onValueChange={setDelegateeRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select delegatee role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!delegatorRoleId || !delegateeRoleId}>
              Create Delegation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ValidationPanel({ 
  companyId, 
  onValidate 
}: { 
  companyId: string
  onValidate: (roleId: string) => { isValid: boolean; errors: string[] }
}) {
  const [roleId, setRoleId] = useState('')
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)

  const handleValidate = () => {
    if (!roleId) return
    const result = onValidate(roleId)
    setValidationResult(result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Validation</CardTitle>
        <CardDescription>
          Validate role inheritance and detect potential issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select role to validate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleValidate} disabled={!roleId}>
            Validate
          </Button>
        </div>

        {validationResult && (
          <Card className={validationResult.isValid ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {validationResult.isValid ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <WarningCircle size={20} className="text-red-500" />
                )}
                <span className="font-medium">
                  {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
                </span>
              </div>
              
              {!validationResult.isValid && validationResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Issues found:</p>
                  <ul className="text-sm space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="flex items-center gap-2 text-red-600">
                        <Warning size={12} />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}