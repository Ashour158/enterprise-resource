import React, { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Key,
  UserCheck,
  ShieldCheck
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PermissionTestProps {
  companyId: string
  userId: string
}

export const PermissionTest: React.FC<PermissionTestProps> = ({
  companyId,
  userId
}) => {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    assignRole,
    requestPermission,
    createPermissionOverride,
    getEffectivePermissions,
    loading
  } = usePermissions(companyId, userId)

  const [testPermission, setTestPermission] = useState('user.read')
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [requestJustification, setRequestJustification] = useState('')

  // Test permissions to demonstrate
  const testPermissions = [
    'user.read',
    'user.create',
    'user.update', 
    'user.delete',
    'role.create',
    'role.assign',
    'finance.read',
    'finance.export',
    'project.create',
    'project.read'
  ]

  const handlePermissionTest = () => {
    const result = hasPermission(testPermission, {
      requireMFA: false,
      allowOverride: true,
      checkExpiry: true
    })
    setTestResult(result)
    
    if (result) {
      toast.success(`Permission "${testPermission}" is granted`)
    } else {
      toast.error(`Permission "${testPermission}" is denied`)
    }
  }

  const handleBulkPermissionTest = () => {
    const allPermissions = hasAllPermissions(testPermissions)
    const anyPermissions = hasAnyPermission(testPermissions)
    
    toast.info(`All permissions: ${allPermissions ? 'Granted' : 'Denied'}, Any permissions: ${anyPermissions ? 'Granted' : 'Denied'}`)
  }

  const handleRequestPermission = async () => {
    if (!requestJustification.trim()) {
      toast.error('Justification is required')
      return
    }

    const result = await requestPermission(testPermission, requestJustification)
    if (result.success) {
      toast.success('Permission request submitted for approval')
      setRequestJustification('')
    } else {
      toast.error(result.error || 'Failed to submit permission request')
    }
  }

  const handleCreateOverride = async () => {
    const result = await createPermissionOverride(
      'target_user_123',
      testPermission,
      true,
      'Testing permission override functionality',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    )
    
    if (result.success) {
      toast.success('Permission override created')
    } else {
      toast.error(result.error || 'Failed to create permission override')
    }
  }

  const handleAssignRole = async () => {
    const result = await assignRole('target_user_123', 'role_manager')
    
    if (result.success) {
      toast.success('Role assigned successfully')
    } else {
      toast.error(result.error || 'Failed to assign role')
    }
  }

  const effectivePermissions = getEffectivePermissions(userId)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading permissions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Permission System Test
          </CardTitle>
          <CardDescription>
            Test the advanced permission management system functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Testing */}
          <div className="space-y-4">
            <h4 className="font-medium">Permission Testing</h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="test-permission">Permission to Test:</Label>
              <Input
                id="test-permission"
                value={testPermission}
                onChange={(e) => setTestPermission(e.target.value)}
                placeholder="e.g., user.read"
                className="flex-1"
              />
              <Button onClick={handlePermissionTest}>
                <Key size={16} className="mr-2" />
                Test Permission
              </Button>
            </div>
            
            {testResult !== null && (
              <Alert>
                <div className="flex items-center gap-2">
                  {testResult ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                  <AlertDescription>
                    Permission "{testPermission}" is {testResult ? 'GRANTED' : 'DENIED'}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button onClick={handleBulkPermissionTest} variant="outline">
              Test Multiple Permissions
            </Button>
          </div>

          {/* Permission Request */}
          <div className="space-y-4">
            <h4 className="font-medium">Request Permission</h4>
            <div className="space-y-2">
              <Label htmlFor="justification">Justification:</Label>
              <Textarea
                id="justification"
                value={requestJustification}
                onChange={(e) => setRequestJustification(e.target.value)}
                placeholder="Explain why you need this permission..."
                rows={3}
              />
            </div>
            <Button onClick={handleRequestPermission}>
              <Clock size={16} className="mr-2" />
              Request Permission
            </Button>
          </div>

          {/* Administrative Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">Administrative Actions</h4>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateOverride} variant="outline">
                <ShieldCheck size={16} className="mr-2" />
                Create Override
              </Button>
              <Button onClick={handleAssignRole} variant="outline">
                <UserCheck size={16} className="mr-2" />
                Assign Role
              </Button>
            </div>
          </div>

          {/* Current Permissions */}
          <div className="space-y-4">
            <h4 className="font-medium">Your Effective Permissions ({effectivePermissions.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {effectivePermissions.slice(0, 12).map((permission, index) => (
                <Badge key={index} variant="secondary" className="justify-start">
                  {permission}
                </Badge>
              ))}
              {effectivePermissions.length > 12 && (
                <Badge variant="outline">
                  +{effectivePermissions.length - 12} more
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Permission Tests */}
          <div className="space-y-4">
            <h4 className="font-medium">Quick Permission Tests</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {testPermissions.map((permission) => {
                const hasAccess = hasPermission(permission)
                return (
                  <div
                    key={permission}
                    className={`flex items-center justify-between p-2 rounded border ${
                      hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{permission}</span>
                    {hasAccess ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}