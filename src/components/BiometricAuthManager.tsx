import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Fingerprint, 
  Eye, 
  User as Face, 
  DeviceMobile, 
  CheckCircle, 
  X, 
  Plus,
  Trash,
  Shield,
  Warning,
  Clock,
  Scan
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BiometricMethod {
  id: string
  type: 'fingerprint' | 'face_id' | 'voice' | 'iris' | 'palm'
  deviceId: string
  deviceName: string
  enrollmentDate: string
  lastUsed?: string
  quality: number
  attempts: number
  successRate: number
  enabled: boolean
  isPrimary: boolean
  backupData: string // Encrypted biometric template
}

interface BiometricDevice {
  id: string
  name: string
  type: 'mobile' | 'laptop' | 'tablet' | 'desktop'
  os: string
  capabilities: ('fingerprint' | 'face_id' | 'voice' | 'iris' | 'palm')[]
  trusted: boolean
  registered: string
  lastSeen: string
}

interface BiometricAttempt {
  id: string
  methodId: string
  timestamp: string
  success: boolean
  confidence: number
  deviceId: string
  failureReason?: string
}

interface BiometricAuthManagerProps {
  userId: string
  companyId: string
}

export function BiometricAuthManager({ userId, companyId }: BiometricAuthManagerProps) {
  const [biometricMethods, setBiometricMethods] = useKV<BiometricMethod[]>(`biometric-methods-${userId}`, [])
  const [biometricDevices, setBiometricDevices] = useKV<BiometricDevice[]>(`biometric-devices-${userId}`, [])
  const [biometricAttempts, setBiometricAttempts] = useKV<BiometricAttempt[]>(`biometric-attempts-${userId}`, [])
  
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedBiometricType, setSelectedBiometricType] = useState<string>('')
  const [enrollmentProgress, setEnrollmentProgress] = useState(0)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Initialize mock data
  useEffect(() => {
    if (!biometricDevices || biometricDevices.length === 0) {
      const mockDevices: BiometricDevice[] = [
        {
          id: 'device-1',
          name: 'iPhone 15 Pro',
          type: 'mobile',
          os: 'iOS 17.2',
          capabilities: ['fingerprint', 'face_id'],
          trusted: true,
          registered: '2024-01-15T10:00:00Z',
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'device-2',
          name: 'MacBook Pro M3',
          type: 'laptop',
          os: 'macOS 14.2',
          capabilities: ['fingerprint', 'face_id'],
          trusted: true,
          registered: '2024-01-10T14:30:00Z',
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'device-3',
          name: 'Galaxy S24 Ultra',
          type: 'mobile',
          os: 'Android 14',
          capabilities: ['fingerprint', 'face_id', 'iris'],
          trusted: false,
          registered: '2024-01-20T09:15:00Z',
          lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setBiometricDevices(mockDevices)
    }
  }, [biometricDevices, setBiometricDevices])

  useEffect(() => {
    if (!biometricMethods || biometricMethods.length === 0) {
      const mockMethods: BiometricMethod[] = [
        {
          id: 'bio-1',
          type: 'face_id',
          deviceId: 'device-1',
          deviceName: 'iPhone 15 Pro',
          enrollmentDate: '2024-01-15T10:30:00Z',
          lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          quality: 95,
          attempts: 127,
          successRate: 98.4,
          enabled: true,
          isPrimary: true,
          backupData: 'encrypted_face_template_abc123'
        },
        {
          id: 'bio-2',
          type: 'fingerprint',
          deviceId: 'device-2',
          deviceName: 'MacBook Pro M3',
          enrollmentDate: '2024-01-10T15:00:00Z',
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          quality: 92,
          attempts: 89,
          successRate: 96.6,
          enabled: true,
          isPrimary: false,
          backupData: 'encrypted_fingerprint_template_def456'
        },
        {
          id: 'bio-3',
          type: 'fingerprint',
          deviceId: 'device-1',
          deviceName: 'iPhone 15 Pro',
          enrollmentDate: '2024-01-15T11:00:00Z',
          lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          quality: 88,
          attempts: 45,
          successRate: 93.3,
          enabled: false,
          isPrimary: false,
          backupData: 'encrypted_fingerprint_template_ghi789'
        }
      ]
      setBiometricMethods(mockMethods)
    }
  }, [biometricMethods, setBiometricMethods])

  useEffect(() => {
    if (!biometricAttempts || biometricAttempts.length === 0) {
      const mockAttempts: BiometricAttempt[] = [
        {
          id: 'attempt-1',
          methodId: 'bio-1',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          success: true,
          confidence: 97.8,
          deviceId: 'device-1'
        },
        {
          id: 'attempt-2',
          methodId: 'bio-2',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          success: true,
          confidence: 94.2,
          deviceId: 'device-2'
        },
        {
          id: 'attempt-3',
          methodId: 'bio-1',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          success: false,
          confidence: 72.1,
          deviceId: 'device-1',
          failureReason: 'Low lighting conditions'
        }
      ]
      setBiometricAttempts(mockAttempts)
    }
  }, [biometricAttempts, setBiometricAttempts])

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return <Fingerprint className="h-5 w-5" />
      case 'face_id': return <Face className="h-5 w-5" />
      case 'voice': return <DeviceMobile className="h-5 w-5" />
      case 'iris': return <Eye className="h-5 w-5" />
      case 'palm': return <Fingerprint className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <DeviceMobile className="h-4 w-4" />
      default: return <DeviceMobile className="h-4 w-4" />
    }
  }

  const handleStartEnrollment = async () => {
    if (!selectedDevice || !selectedBiometricType) {
      toast.error('Please select device and biometric type')
      return
    }

    setIsEnrolling(true)
    setEnrollmentProgress(0)

    // Simulate enrollment process
    const progressInterval = setInterval(() => {
      setEnrollmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsEnrolling(false)
          
          // Add new biometric method
          const device = biometricDevices?.find(d => d.id === selectedDevice)
          const newMethod: BiometricMethod = {
            id: `bio-${Date.now()}`,
            type: selectedBiometricType as any,
            deviceId: selectedDevice,
            deviceName: device?.name || 'Unknown Device',
            enrollmentDate: new Date().toISOString(),
            quality: Math.floor(Math.random() * 20) + 80, // 80-100
            attempts: 0,
            successRate: 0,
            enabled: true,
            isPrimary: (biometricMethods || []).length === 0,
            backupData: `encrypted_${selectedBiometricType}_template_${Date.now()}`
          }

          setBiometricMethods(current => [...(current || []), newMethod])
          setShowEnrollDialog(false)
          setSelectedDevice('')
          setSelectedBiometricType('')
          toast.success('Biometric method enrolled successfully')
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 500)
  }

  const handleToggleMethod = (methodId: string, enabled: boolean) => {
    setBiometricMethods(current => 
      (current || []).map(method => 
        method.id === methodId ? { ...method, enabled } : method
      )
    )
    toast.success(`Biometric method ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleSetPrimary = (methodId: string) => {
    setBiometricMethods(current => 
      (current || []).map(method => ({
        ...method,
        isPrimary: method.id === methodId
      }))
    )
    toast.success('Primary biometric method updated')
  }

  const handleDeleteMethod = (methodId: string) => {
    setBiometricMethods(current => 
      (current || []).filter(method => method.id !== methodId)
    )
    toast.success('Biometric method removed')
  }

  const handleTestBiometric = async (methodId: string) => {
    setIsScanning(true)
    
    // Simulate biometric scan
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate
      const confidence = success ? Math.random() * 20 + 80 : Math.random() * 30 + 40
      
      const newAttempt: BiometricAttempt = {
        id: `attempt-${Date.now()}`,
        methodId,
        timestamp: new Date().toISOString(),
        success,
        confidence,
        deviceId: 'current-device',
        failureReason: success ? undefined : 'Test authentication failed'
      }

      setBiometricAttempts(current => [newAttempt, ...(current || []).slice(0, 19)])
      
      if (success) {
        toast.success(`Biometric authentication successful (${confidence.toFixed(1)}% confidence)`)
      } else {
        toast.error(`Biometric authentication failed (${confidence.toFixed(1)}% confidence)`)
      }
      
      setIsScanning(false)
    }, 2000)
  }

  const enabledMethods = (biometricMethods || []).filter(m => m.enabled)
  const totalAttempts = (biometricMethods || []).reduce((sum, m) => sum + m.attempts, 0)
  const avgSuccessRate = enabledMethods.length > 0 
    ? enabledMethods.reduce((sum, m) => sum + m.successRate, 0) / enabledMethods.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Biometric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Methods</p>
                <p className="text-2xl font-bold">{enabledMethods.length}</p>
              </div>
              <Fingerprint className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{totalAttempts}</p>
              </div>
              <Scan className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trusted Devices</p>
                <p className="text-2xl font-bold">{(biometricDevices || []).filter(d => d.trusted).length}</p>
              </div>
              <DeviceMobile className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Biometric Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enrolled Biometric Methods</CardTitle>
                <CardDescription>
                  Manage your biometric authentication methods
                </CardDescription>
              </div>
              <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enroll Biometric Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Device</label>
                      <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose device" />
                        </SelectTrigger>
                        <SelectContent>
                          {(biometricDevices || []).map(device => (
                            <SelectItem key={device.id} value={device.id}>
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(device.type)}
                                <span>{device.name}</span>
                                {device.trusted && (
                                  <Badge variant="outline" className="text-xs">Trusted</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedDevice && (
                      <div>
                        <label className="text-sm font-medium">Biometric Type</label>
                        <Select value={selectedBiometricType} onValueChange={setSelectedBiometricType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose biometric type" />
                          </SelectTrigger>
                          <SelectContent>
                            {(biometricDevices?.find(d => d.id === selectedDevice)?.capabilities || []).map(capability => (
                              <SelectItem key={capability} value={capability}>
                                <div className="flex items-center gap-2">
                                  {getBiometricIcon(capability)}
                                  <span className="capitalize">{capability.replace('_', ' ')}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {isEnrolling && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Scan className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">Capturing biometric data...</span>
                        </div>
                        <Progress value={enrollmentProgress} />
                        <p className="text-xs text-muted-foreground">
                          Progress: {enrollmentProgress.toFixed(0)}%
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleStartEnrollment}
                        disabled={!selectedDevice || !selectedBiometricType || isEnrolling}
                      >
                        {isEnrolling ? 'Enrolling...' : 'Start Enrollment'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(biometricMethods || []).map(method => (
                <div key={method.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getBiometricIcon(method.type)}
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {method.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          {method.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <p>{method.deviceName}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span>Quality: {method.quality}%</span>
                            <span>Success: {method.successRate.toFixed(1)}%</span>
                            <span>Uses: {method.attempts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={method.enabled ? 'default' : 'secondary'}>
                        {method.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestBiometric(method.id)}
                        disabled={isScanning || !method.enabled}
                      >
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleMethod(method.id, !method.enabled)}
                      >
                        {method.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      {!method.isPrimary && method.enabled && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetPrimary(method.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!biometricMethods || biometricMethods.length === 0) && (
                <div className="text-center py-8">
                  <Fingerprint className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Biometric Methods</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enroll your biometric data for secure authentication
                  </p>
                  <Button onClick={() => setShowEnrollDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll First Method
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Authentication Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Authentication Attempts</CardTitle>
            <CardDescription>
              Monitor biometric authentication activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(biometricAttempts || []).slice(0, 8).map(attempt => {
                const method = biometricMethods?.find(m => m.id === attempt.methodId)
                return (
                  <div key={attempt.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${attempt.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {attempt.success ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {method?.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Method'}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          <p>{new Date(attempt.timestamp).toLocaleString()}</p>
                          {attempt.failureReason && (
                            <p className="text-red-600">{attempt.failureReason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={attempt.success ? 'default' : 'destructive'} className="text-xs">
                        {attempt.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )
              })}

              {(!biometricAttempts || biometricAttempts.length === 0) && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No authentication attempts yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>
            Devices registered for biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(biometricDevices || []).map(device => (
              <div key={device.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.type)}
                    <h4 className="font-medium">{device.name}</h4>
                  </div>
                  <Badge variant={device.trusted ? 'default' : 'secondary'}>
                    {device.trusted ? 'Trusted' : 'Unverified'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{device.os}</p>
                  <p>Registered: {new Date(device.registered).toLocaleDateString()}</p>
                  <p>Last seen: {new Date(device.lastSeen).toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {device.capabilities.map(capability => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enabledMethods.length === 0 && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  You don't have any active biometric methods. Consider enrolling at least one for enhanced security.
                </AlertDescription>
              </Alert>
            )}
            
            {enabledMethods.length === 1 && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Consider enrolling a backup biometric method in case your primary method fails.
                </AlertDescription>
              </Alert>
            )}

            {avgSuccessRate < 90 && avgSuccessRate > 0 && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Your biometric success rate is below 90%. Consider re-enrolling methods with poor performance.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Biometric data is encrypted and stored locally on your devices. Templates are never transmitted or stored on servers.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}