import React, { useState, useEffect } from 'react'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Fingerprint, 
  Scan, 
  Key, 
  Shield, 
  Plus, 
  Trash, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Warning,
  DeviceMobile,
  Lock,
  Eye,
  ShieldCheck
} from '@phosphor-icons/react'
import { BiometricAuthConfig } from '@/types/biometric'
import { toast } from 'sonner'

interface BiometricAuthenticationSystemProps {
  userId: string
  companyId: string
  onAuthSuccess?: (sessionId: string) => void
}

export function BiometricAuthenticationSystem({ userId, companyId, onAuthSuccess }: BiometricAuthenticationSystemProps) {
  const {
    isSupported,
    isLoading,
    availableMethods,
    enrolledMethods,
    authSession,
    auditLogs,
    hardwareKeys,
    lastAuthResult,
    enrollBiometric,
    authenticateWithBiometric,
    removeBiometric,
    registerHardwareKey,
    isSessionValid,
    enrolledMethodsCount,
    hasFingerprint,
    hasFaceId,
    hasHardwareKey
  } = useBiometricAuth(userId, companyId)

  const [selectedMethod, setSelectedMethod] = useState<BiometricAuthConfig['type'] | null>(null)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [hardwareKeyName, setHardwareKeyName] = useState('')
  const [authInProgress, setAuthInProgress] = useState(false)

  const getMethodIcon = (type: BiometricAuthConfig['type']) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint size={24} />
      case 'face':
        return <Scan size={24} />
      case 'hardware_key':
        return <Key size={24} />
      default:
        return <Shield size={24} />
    }
  }

  const getMethodTitle = (type: BiometricAuthConfig['type']) => {
    switch (type) {
      case 'fingerprint':
        return 'Fingerprint'
      case 'face':
        return 'Face ID'
      case 'hardware_key':
        return 'Hardware Security Key'
      default:
        return 'Unknown'
    }
  }

  const getMethodDescription = (type: BiometricAuthConfig['type']) => {
    switch (type) {
      case 'fingerprint':
        return 'Use your fingerprint to securely authenticate'
      case 'face':
        return 'Use facial recognition for quick access'
      case 'hardware_key':
        return 'Use a physical security key for maximum protection'
      default:
        return 'Secure authentication method'
    }
  }

  const handleEnrollBiometric = async (type: BiometricAuthConfig['type']) => {
    try {
      const result = await enrollBiometric(type)
      if (result.success) {
        setShowEnrollDialog(false)
        toast.success(`${getMethodTitle(type)} enrolled successfully`)
      } else {
        toast.error(result.error?.message || 'Enrollment failed')
      }
    } catch (error) {
      toast.error('Failed to enroll biometric')
    }
  }

  const handleAuthenticate = async (type: BiometricAuthConfig['type']) => {
    setAuthInProgress(true)
    try {
      const result = await authenticateWithBiometric(type)
      if (result.success && authSession) {
        toast.success('Authentication successful')
        onAuthSuccess?.(authSession.id)
      } else {
        toast.error(result.error?.message || 'Authentication failed')
      }
    } catch (error) {
      toast.error('Authentication failed')
    } finally {
      setAuthInProgress(false)
    }
  }

  const handleRemoveBiometric = async (enrollmentId: string, type: BiometricAuthConfig['type']) => {
    const success = await removeBiometric(enrollmentId)
    if (success) {
      toast.success(`${getMethodTitle(type)} removed successfully`)
    }
  }

  const handleRegisterHardwareKey = async () => {
    if (!hardwareKeyName.trim()) {
      toast.error('Please enter a name for the hardware key')
      return
    }

    const success = await registerHardwareKey(hardwareKeyName)
    if (success) {
      setHardwareKeyName('')
      setShowEnrollDialog(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning className="text-orange-500" size={20} />
            Biometric Authentication Not Supported
          </CardTitle>
          <CardDescription>
            Your device or browser doesn't support biometric authentication.
            Please use traditional authentication methods.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Status */}
      {authSession && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle size={20} />
              Authenticated Session Active
            </CardTitle>
            <CardDescription className="text-green-600">
              Session expires: {new Date(authSession.expiresAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {getMethodTitle(authSession.authenticationType)}
                </Badge>
                <Badge variant="outline" className="border-green-300">
                  Trust Score: {authSession.trustScore}%
                </Badge>
                <Badge variant="outline" className="border-green-300">
                  Risk: {authSession.riskAssessment.overallRisk}
                </Badge>
              </div>
              <div className="text-sm text-green-600">
                Valid: {isSessionValid ? 'Yes' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobile size={20} />
            Quick Authentication
          </CardTitle>
          <CardDescription>
            Use your enrolled biometric methods to authenticate quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrolledMethods.filter(e => e.isActive).map((enrollment) => (
              <div key={enrollment.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(enrollment.biometricType)}
                    <div>
                      <h4 className="font-medium">{getMethodTitle(enrollment.biometricType)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Enrolled {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Quality: {enrollment.metadata.enrollmentQuality}%
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleAuthenticate(enrollment.biometricType)}
                  disabled={authInProgress || isLoading}
                  className="w-full"
                >
                  {authInProgress ? 'Authenticating...' : 'Authenticate'}
                </Button>
              </div>
            ))}
            
            {enrolledMethods.filter(e => e.isActive).length === 0 && (
              <div className="col-span-full text-center py-8">
                <Shield size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No biometric methods enrolled</p>
                <p className="text-sm text-muted-foreground">Add a biometric method to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            Available Biometric Methods
          </CardTitle>
          <CardDescription>
            Enroll new biometric authentication methods for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMethods.map((method) => {
              const isEnrolled = enrolledMethods.some(e => e.biometricType === method.type && e.isActive)
              
              return (
                <div key={method.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getMethodIcon(method.type)}
                      <div>
                        <h4 className="font-medium">{getMethodTitle(method.type)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getMethodDescription(method.type)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isEnrolled ? "default" : "outline"}>
                      {isEnrolled ? 'Enrolled' : 'Available'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      Trust: {method.trustLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {method.deviceInfo.os}
                    </Badge>
                  </div>

                  {!isEnrolled ? (
                    <Dialog open={showEnrollDialog && selectedMethod === method.type} onOpenChange={setShowEnrollDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedMethod(method.type)}
                        >
                          Enroll {getMethodTitle(method.type)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getMethodIcon(method.type)}
                            Enroll {getMethodTitle(method.type)}
                          </DialogTitle>
                          <DialogDescription>
                            {method.type === 'hardware_key' 
                              ? 'Insert your hardware security key and follow the prompts to register it.'
                              : `Follow the prompts to enroll your ${getMethodTitle(method.type).toLowerCase()}.`
                            }
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {method.type === 'hardware_key' && (
                            <div className="space-y-2">
                              <Label htmlFor="key-name">Security Key Name</Label>
                              <Input
                                id="key-name"
                                value={hardwareKeyName}
                                onChange={(e) => setHardwareKeyName(e.target.value)}
                                placeholder="e.g., YubiKey 5C"
                              />
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => method.type === 'hardware_key' 
                                ? handleRegisterHardwareKey() 
                                : handleEnrollBiometric(method.type)
                              }
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading ? 'Enrolling...' : 'Start Enrollment'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowEnrollDialog(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const enrollment = enrolledMethods.find(e => e.biometricType === method.type && e.isActive)
                        if (enrollment) {
                          handleRemoveBiometric(enrollment.id, method.type)
                        }
                      }}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Security Keys */}
      {hardwareKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} />
              Hardware Security Keys
            </CardTitle>
            <CardDescription>
              Manage your registered hardware security keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hardwareKeys.filter(k => k.isActive).map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key size={16} />
                    <div>
                      <h4 className="font-medium">{key.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {key.keyType.toUpperCase()} • Registered {new Date(key.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{key.metadata.manufacturer}</Badge>
                    <Button variant="destructive" size="sm">
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={20} />
            Security Status
          </CardTitle>
          <CardDescription>
            Overview of your biometric security configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{enrolledMethodsCount}</div>
              <div className="text-sm text-muted-foreground">Enrolled Methods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{hasFingerprint ? '✓' : '×'}</div>
              <div className="text-sm text-muted-foreground">Fingerprint</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{hasFaceId ? '✓' : '×'}</div>
              <div className="text-sm text-muted-foreground">Face ID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{hasHardwareKey ? '✓' : '×'}</div>
              <div className="text-sm text-muted-foreground">Hardware Key</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Security Score</span>
              <span className="font-medium">
                {enrolledMethodsCount > 0 ? Math.min(100, enrolledMethodsCount * 30 + 40) : 0}%
              </span>
            </div>
            <Progress 
              value={enrolledMethodsCount > 0 ? Math.min(100, enrolledMethodsCount * 30 + 40) : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Recent Biometric Activity
            </CardTitle>
            <CardDescription>
              Latest authentication attempts and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.result === 'success' ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <div>
                      <h4 className="font-medium capitalize">
                        {log.eventType} - {getMethodTitle(log.biometricType)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={log.result === 'success' ? 'default' : 'destructive'}>
                      {log.result}
                    </Badge>
                    {log.metadata.confidence && (
                      <Badge variant="outline">
                        {log.metadata.confidence}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Authentication Result */}
      {lastAuthResult && (
        <Alert className={lastAuthResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center gap-2">
            {lastAuthResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={lastAuthResult.success ? 'text-green-700' : 'text-red-700'}>
              {lastAuthResult.success 
                ? `Successfully authenticated with ${getMethodTitle(lastAuthResult.type)} (${lastAuthResult.confidence}% confidence)`
                : `Authentication failed: ${lastAuthResult.error?.message}`
              }
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}