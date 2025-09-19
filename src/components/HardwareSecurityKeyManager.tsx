import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Key, 
  Shield, 
  CheckCircle, 
  X, 
  Plus,
  Trash,
  Warning,
  Clock,
  Usb,
  Bluetooth,
  WifiHigh as Wifi,
  Scan,
  LockKey
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface HardwareSecurityKey {
  id: string
  name: string
  type: 'usb' | 'nfc' | 'bluetooth' | 'platform'
  manufacturer: string
  model: string
  protocol: 'fido2' | 'u2f' | 'ctap2'
  registrationDate: string
  lastUsed?: string
  attempts: number
  successfulAuths: number
  publicKeyCredentialId: string
  attestationFormat: string
  enabled: boolean
  isPrimary: boolean
  capabilities: string[]
  deviceAaguid: string
}

interface SecurityKeyAttempt {
  id: string
  keyId: string
  timestamp: string
  success: boolean
  challenge: string
  userAgent: string
  ipAddress: string
  failureReason?: string
  verificationTime: number
}

interface SecurityKeyDevice {
  id: string
  name: string
  connected: boolean
  type: 'usb' | 'nfc' | 'bluetooth'
  capabilities: string[]
  manufacturer?: string
  model?: string
}

interface HardwareSecurityKeyManagerProps {
  userId: string
  companyId: string
}

export function HardwareSecurityKeyManager({ userId, companyId }: HardwareSecurityKeyManagerProps) {
  const [securityKeys, setSecurityKeys] = useKV<HardwareSecurityKey[]>(`security-keys-${userId}`, [])
  const [keyAttempts, setKeyAttempts] = useKV<SecurityKeyAttempt[]>(`key-attempts-${userId}`, [])
  const [availableDevices, setAvailableDevices] = useState<SecurityKeyDevice[]>([])
  
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [keyName, setKeyName] = useState('')
  const [registrationProgress, setRegistrationProgress] = useState('')

  // Initialize mock data
  useEffect(() => {
    if (!securityKeys || securityKeys.length === 0) {
      const mockKeys: HardwareSecurityKey[] = [
        {
          id: 'key-1',
          name: 'YubiKey 5 NFC',
          type: 'usb',
          manufacturer: 'Yubico',
          model: 'YubiKey 5 NFC',
          protocol: 'fido2',
          registrationDate: '2024-01-15T10:00:00Z',
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          attempts: 89,
          successfulAuths: 87,
          publicKeyCredentialId: 'cred_12345_abc',
          attestationFormat: 'fido-u2f',
          enabled: true,
          isPrimary: true,
          capabilities: ['hmac-secret', 'rk', 'up', 'uv'],
          deviceAaguid: 'cb69481e-8ff7-4039-93ec-0a2729a154a8'
        },
        {
          id: 'key-2',
          name: 'SoloKey',
          type: 'usb',
          manufacturer: 'SoloKeys',
          model: 'Solo V2',
          protocol: 'ctap2',
          registrationDate: '2024-01-20T14:30:00Z',
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          attempts: 23,
          successfulAuths: 22,
          publicKeyCredentialId: 'cred_67890_def',
          attestationFormat: 'packed',
          enabled: false,
          isPrimary: false,
          capabilities: ['rk', 'up'],
          deviceAaguid: '8876631b-d4a0-427f-5773-0ec71c9e0279'
        },
        {
          id: 'key-3',
          name: 'TouchID (MacBook)',
          type: 'platform',
          manufacturer: 'Apple',
          model: 'Platform Authenticator',
          protocol: 'fido2',
          registrationDate: '2024-01-10T09:15:00Z',
          lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          attempts: 156,
          successfulAuths: 154,
          publicKeyCredentialId: 'cred_platform_ghi',
          attestationFormat: 'apple',
          enabled: true,
          isPrimary: false,
          capabilities: ['rk', 'up', 'uv'],
          deviceAaguid: 'adce0002-35bc-c60a-648b-0b25f1f05503'
        }
      ]
      setSecurityKeys(mockKeys)
    }
  }, [securityKeys, setSecurityKeys])

  useEffect(() => {
    if (!keyAttempts || keyAttempts.length === 0) {
      const mockAttempts: SecurityKeyAttempt[] = [
        {
          id: 'attempt-1',
          keyId: 'key-1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          success: true,
          challenge: 'challenge_abc123',
          userAgent: 'Chrome/120.0.0.0',
          ipAddress: '192.168.1.100',
          verificationTime: 1250
        },
        {
          id: 'attempt-2',
          keyId: 'key-3',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          success: true,
          challenge: 'challenge_def456',
          userAgent: 'Safari/17.2',
          ipAddress: '192.168.1.100',
          verificationTime: 890
        },
        {
          id: 'attempt-3',
          keyId: 'key-1',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          success: false,
          challenge: 'challenge_ghi789',
          userAgent: 'Chrome/120.0.0.0',
          ipAddress: '192.168.1.100',
          failureReason: 'User cancelled request',
          verificationTime: 15000
        }
      ]
      setKeyAttempts(mockAttempts)
    }
  }, [keyAttempts, setKeyAttempts])

  const detectAvailableDevices = async () => {
    setIsDetecting(true)
    setRegistrationProgress('Detecting hardware security keys...')
    
    // Simulate device detection
    setTimeout(() => {
      const mockDevices: SecurityKeyDevice[] = [
        {
          id: 'device-1',
          name: 'YubiKey 5C NFC',
          connected: true,
          type: 'usb',
          capabilities: ['hmac-secret', 'rk', 'up', 'uv'],
          manufacturer: 'Yubico',
          model: 'YubiKey 5C NFC'
        },
        {
          id: 'device-2',
          name: 'Platform Authenticator',
          connected: true,
          type: 'usb',
          capabilities: ['rk', 'up', 'uv'],
          manufacturer: 'Built-in',
          model: 'TouchID/FaceID'
        }
      ]
      setAvailableDevices(mockDevices)
      setIsDetecting(false)
      setRegistrationProgress('')
    }, 2000)
  }

  const registerSecurityKey = async () => {
    if (!selectedDevice || !keyName.trim()) {
      toast.error('Please select a device and provide a name')
      return
    }

    setIsRegistering(true)
    setRegistrationProgress('Preparing registration challenge...')

    // Simulate WebAuthn registration process
    const steps = [
      'Generating challenge...',
      'Waiting for user presence...',
      'Validating attestation...',
      'Storing public key...',
      'Registration complete!'
    ]

    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setRegistrationProgress(steps[stepIndex])
        stepIndex++
      } else {
        clearInterval(stepInterval)
        
        // Add new security key
        const device = availableDevices.find(d => d.id === selectedDevice)
        const newKey: HardwareSecurityKey = {
          id: `key-${Date.now()}`,
          name: keyName.trim(),
          type: device?.type || 'usb',
          manufacturer: device?.manufacturer || 'Unknown',
          model: device?.model || 'Unknown',
          protocol: 'fido2',
          registrationDate: new Date().toISOString(),
          attempts: 0,
          successfulAuths: 0,
          publicKeyCredentialId: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          attestationFormat: 'packed',
          enabled: true,
          isPrimary: (securityKeys || []).length === 0,
          capabilities: device?.capabilities || [],
          deviceAaguid: `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`
        }

        setSecurityKeys(current => [...(current || []), newKey])
        setIsRegistering(false)
        setRegistrationProgress('')
        setShowAddKeyDialog(false)
        setSelectedDevice('')
        setKeyName('')
        toast.success('Security key registered successfully')
      }
    }, 1500)
  }

  const testSecurityKey = async (keyId: string) => {
    const key = securityKeys?.find(k => k.id === keyId)
    if (!key) return

    toast.info('Touch your security key to test authentication...')
    
    // Simulate WebAuthn authentication
    setTimeout(() => {
      const success = Math.random() > 0.05 // 95% success rate
      const verificationTime = Math.random() * 2000 + 500 // 500-2500ms
      
      const newAttempt: SecurityKeyAttempt = {
        id: `attempt-${Date.now()}`,
        keyId,
        timestamp: new Date().toISOString(),
        success,
        challenge: `test_challenge_${Date.now()}`,
        userAgent: navigator.userAgent,
        ipAddress: 'current-device',
        failureReason: success ? undefined : 'Test authentication timeout',
        verificationTime
      }

      setKeyAttempts(current => [newAttempt, ...(current || []).slice(0, 19)])
      
      // Update key statistics
      setSecurityKeys(current => 
        (current || []).map(k => 
          k.id === keyId 
            ? { 
                ...k, 
                attempts: k.attempts + 1,
                successfulAuths: success ? k.successfulAuths + 1 : k.successfulAuths,
                lastUsed: success ? new Date().toISOString() : k.lastUsed
              }
            : k
        )
      )

      if (success) {
        toast.success(`Authentication successful (${verificationTime.toFixed(0)}ms)`)
      } else {
        toast.error('Authentication failed')
      }
    }, 2000)
  }

  const toggleSecurityKey = (keyId: string, enabled: boolean) => {
    setSecurityKeys(current => 
      (current || []).map(key => 
        key.id === keyId ? { ...key, enabled } : key
      )
    )
    toast.success(`Security key ${enabled ? 'enabled' : 'disabled'}`)
  }

  const setPrimaryKey = (keyId: string) => {
    setSecurityKeys(current => 
      (current || []).map(key => ({
        ...key,
        isPrimary: key.id === keyId
      }))
    )
    toast.success('Primary security key updated')
  }

  const deleteSecurityKey = (keyId: string) => {
    setSecurityKeys(current => 
      (current || []).filter(key => key.id !== keyId)
    )
    toast.success('Security key removed')
  }

  const getKeyIcon = (type: string) => {
    switch (type) {
      case 'usb': return <Usb className="h-5 w-5" />
      case 'nfc': return <Wifi className="h-5 w-5" />
      case 'bluetooth': return <Bluetooth className="h-5 w-5" />
      case 'platform': return <LockKey className="h-5 w-5" />
      default: return <Key className="h-5 w-5" />
    }
  }

  const getProtocolBadge = (protocol: string) => {
    const colors = {
      'fido2': 'bg-green-100 text-green-800',
      'u2f': 'bg-blue-100 text-blue-800',
      'ctap2': 'bg-purple-100 text-purple-800'
    }
    return colors[protocol as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const enabledKeys = (securityKeys || []).filter(k => k.enabled)
  const totalAttempts = (securityKeys || []).reduce((sum, k) => sum + k.attempts, 0)
  const totalSuccessful = (securityKeys || []).reduce((sum, k) => sum + k.successfulAuths, 0)
  const avgSuccessRate = totalAttempts > 0 ? (totalSuccessful / totalAttempts) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Security Keys Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registered Keys</p>
                <p className="text-2xl font-bold">{enabledKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-muted-foreground">Total Uses</p>
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
                <p className="text-sm font-medium text-muted-foreground">Protocols</p>
                <p className="text-2xl font-bold">{new Set((securityKeys || []).map(k => k.protocol)).size}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Security Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hardware Security Keys</CardTitle>
                <CardDescription>
                  Manage your FIDO2/WebAuthn security keys
                </CardDescription>
              </div>
              <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
                <DialogTrigger asChild>
                  <Button onClick={detectAvailableDevices}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Register Security Key</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {isDetecting && (
                      <div className="text-center py-4">
                        <Scan className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">{registrationProgress}</p>
                      </div>
                    )}

                    {availableDevices.length > 0 && !isDetecting && (
                      <>
                        <div>
                          <Label htmlFor="key-name">Security Key Name</Label>
                          <Input
                            id="key-name"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="e.g., YubiKey Office"
                          />
                        </div>

                        <div>
                          <Label>Select Device</Label>
                          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose security key" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDevices.map(device => (
                                <SelectItem key={device.id} value={device.id}>
                                  <div className="flex items-center gap-2">
                                    {getKeyIcon(device.type)}
                                    <span>{device.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {device.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {isRegistering && (
                      <div className="text-center py-4">
                        <Key className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">{registrationProgress}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!isDetecting && availableDevices.length > 0 && (
                        <Button 
                          onClick={registerSecurityKey}
                          disabled={!selectedDevice || !keyName.trim() || isRegistering}
                        >
                          {isRegistering ? 'Registering...' : 'Register Key'}
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setShowAddKeyDialog(false)}>
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
              {(securityKeys || []).map(key => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getKeyIcon(key.type)}
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {key.name}
                          {key.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <p>{key.manufacturer} {key.model}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge className={`text-xs ${getProtocolBadge(key.protocol)}`}>
                              {key.protocol.toUpperCase()}
                            </Badge>
                            <span>Success: {key.attempts > 0 ? ((key.successfulAuths / key.attempts) * 100).toFixed(1) : 0}%</span>
                            <span>Uses: {key.attempts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.enabled ? 'default' : 'secondary'}>
                        {key.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testSecurityKey(key.id)}
                        disabled={!key.enabled}
                      >
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleSecurityKey(key.id, !key.enabled)}
                      >
                        {key.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      {!key.isPrimary && key.enabled && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPrimaryKey(key.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteSecurityKey(key.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!securityKeys || securityKeys.length === 0) && (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Security Keys</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Register a hardware security key for enhanced authentication
                  </p>
                  <Button onClick={() => setShowAddKeyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Key
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Authentication Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Authentication Activity</CardTitle>
            <CardDescription>
              Monitor security key authentication attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(keyAttempts || []).slice(0, 8).map(attempt => {
                const key = securityKeys?.find(k => k.id === attempt.keyId)
                return (
                  <div key={attempt.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${attempt.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {attempt.success ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {key?.name || 'Unknown Key'}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          <p>{new Date(attempt.timestamp).toLocaleString()}</p>
                          <p>{attempt.verificationTime}ms • {attempt.ipAddress}</p>
                          {attempt.failureReason && (
                            <p className="text-red-600">{attempt.failureReason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={attempt.success ? 'default' : 'destructive'} className="text-xs">
                        {attempt.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                )
              })}

              {(!keyAttempts || keyAttempts.length === 0) && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No authentication attempts yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enabledKeys.length === 0 && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  No hardware security keys are registered. Consider adding a FIDO2-compatible security key for enhanced authentication.
                </AlertDescription>
              </Alert>
            )}
            
            {enabledKeys.length === 1 && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Consider registering a backup security key in case your primary key is lost or damaged.
                </AlertDescription>
              </Alert>
            )}

            {avgSuccessRate < 95 && avgSuccessRate > 0 && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Your security key success rate is below 95%. Check for hardware issues or user training needs.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Hardware security keys provide the highest level of phishing resistance and are compliant with FIDO2/WebAuthn standards.
              </AlertDescription>
            </Alert>

            <Alert>
              <LockKey className="h-4 w-4" />
              <AlertDescription>
                Your security keys are protected by hardware-level security and cannot be cloned or extracted.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}