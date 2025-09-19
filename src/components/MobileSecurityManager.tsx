import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  DeviceMobile, 
  Shield, 
  Fingerprint,
  CheckCircle, 
  X, 
  Plus,
  Trash,
  Warning,
  Clock,
  Eye,
  User,
  Key,
  Lock,
  MapPin,
  Bell,
  WifiHigh,
  BatteryMedium as Battery
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { BiometricAuthManager } from './BiometricAuthManager'
import { HardwareSecurityKeyManager } from './HardwareSecurityKeyManager'

interface MobileDevice {
  id: string
  name: string
  type: 'smartphone' | 'tablet' | 'laptop' | 'desktop'
  os: string
  osVersion: string
  manufacturer: string
  model: string
  registrationDate: string
  lastSeen: string
  lastLocation?: {
    latitude: number
    longitude: number
    city: string
    country: string
  }
  trusted: boolean
  encrypted: boolean
  biometricEnabled: boolean
  hardwareKeySupport: boolean
  jailbroken: boolean
  securityPatch: string
  batteryLevel?: number
  networkInfo?: {
    type: 'cellular' | 'wifi' | 'ethernet'
    carrier?: string
    ip: string
  }
  capabilities: {
    fingerprint: boolean
    faceId: boolean
    iris: boolean
    voice: boolean
    nfc: boolean
    bluetooth: boolean
    gps: boolean
  }
  securityFeatures: {
    appPinning: boolean
    remoteLock: boolean
    remoteWipe: boolean
    screenLock: boolean
    autoLock: boolean
    vpnRequired: boolean
  }
  complianceStatus: {
    encryption: boolean
    passwordPolicy: boolean
    biometricAuth: boolean
    updateStatus: boolean
    jailbreakDetection: boolean
  }
}

interface SecurityAlert {
  id: string
  deviceId: string
  type: 'jailbreak' | 'location_change' | 'suspicious_login' | 'security_patch' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  actions: string[]
}

interface DevicePolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  rules: {
    requireBiometric: boolean
    requireEncryption: boolean
    maxOfflineTime: number // hours
    allowJailbroken: boolean
    requireSecurityPatch: number // days
    allowScreenshots: boolean
    requireVPN: boolean
    allowCloudBackup: boolean
    minPasswordLength: number
    requireComplexPassword: boolean
  }
}

interface MobileSecurityManagerProps {
  userId: string
  companyId: string
}

export function MobileSecurityManager({ userId, companyId }: MobileSecurityManagerProps) {
  const [devices, setDevices] = useKV<MobileDevice[]>(`mobile-devices-${userId}`, [])
  const [securityAlerts, setSecurityAlerts] = useKV<SecurityAlert[]>(`security-alerts-${userId}`, [])
  const [devicePolicies, setDevicePolicies] = useKV<DevicePolicy[]>(`device-policies-${companyId}`, [])
  const [activeTab, setActiveTab] = useState('devices')
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [showRemoteActions, setShowRemoteActions] = useState(false)

  // Initialize mock data
  useEffect(() => {
    if (!devices || devices.length === 0) {
      const mockDevices: MobileDevice[] = [
        {
          id: 'device-1',
          name: 'iPhone 15 Pro',
          type: 'smartphone',
          os: 'iOS',
          osVersion: '17.2.1',
          manufacturer: 'Apple',
          model: 'iPhone 15 Pro',
          registrationDate: '2024-01-15T10:00:00Z',
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastLocation: {
            latitude: 40.7128,
            longitude: -74.0060,
            city: 'New York',
            country: 'USA'
          },
          trusted: true,
          encrypted: true,
          biometricEnabled: true,
          hardwareKeySupport: false,
          jailbroken: false,
          securityPatch: '2024-01-10',
          batteryLevel: 78,
          networkInfo: {
            type: 'cellular',
            carrier: 'Verizon',
            ip: '192.168.1.100'
          },
          capabilities: {
            fingerprint: true,
            faceId: true,
            iris: false,
            voice: true,
            nfc: true,
            bluetooth: true,
            gps: true
          },
          securityFeatures: {
            appPinning: true,
            remoteLock: true,
            remoteWipe: true,
            screenLock: true,
            autoLock: true,
            vpnRequired: false
          },
          complianceStatus: {
            encryption: true,
            passwordPolicy: true,
            biometricAuth: true,
            updateStatus: true,
            jailbreakDetection: true
          }
        },
        {
          id: 'device-2',
          name: 'Galaxy S24 Ultra',
          type: 'smartphone',
          os: 'Android',
          osVersion: '14.0',
          manufacturer: 'Samsung',
          model: 'Galaxy S24 Ultra',
          registrationDate: '2024-01-20T14:30:00Z',
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastLocation: {
            latitude: 40.7580,
            longitude: -73.9855,
            city: 'New York',
            country: 'USA'
          },
          trusted: false,
          encrypted: true,
          biometricEnabled: true,
          hardwareKeySupport: true,
          jailbroken: false,
          securityPatch: '2024-01-01',
          batteryLevel: 45,
          networkInfo: {
            type: 'wifi',
            ip: '10.0.1.50'
          },
          capabilities: {
            fingerprint: true,
            faceId: true,
            iris: true,
            voice: true,
            nfc: true,
            bluetooth: true,
            gps: true
          },
          securityFeatures: {
            appPinning: false,
            remoteLock: true,
            remoteWipe: true,
            screenLock: true,
            autoLock: false,
            vpnRequired: true
          },
          complianceStatus: {
            encryption: true,
            passwordPolicy: false,
            biometricAuth: true,
            updateStatus: false,
            jailbreakDetection: true
          }
        },
        {
          id: 'device-3',
          name: 'iPad Pro M3',
          type: 'tablet',
          os: 'iPadOS',
          osVersion: '17.2',
          manufacturer: 'Apple',
          model: 'iPad Pro M3',
          registrationDate: '2024-01-12T09:15:00Z',
          lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          trusted: true,
          encrypted: true,
          biometricEnabled: true,
          hardwareKeySupport: false,
          jailbroken: false,
          securityPatch: '2024-01-10',
          batteryLevel: 92,
          networkInfo: {
            type: 'wifi',
            ip: '192.168.1.105'
          },
          capabilities: {
            fingerprint: true,
            faceId: true,
            iris: false,
            voice: true,
            nfc: false,
            bluetooth: true,
            gps: true
          },
          securityFeatures: {
            appPinning: true,
            remoteLock: true,
            remoteWipe: true,
            screenLock: true,
            autoLock: true,
            vpnRequired: false
          },
          complianceStatus: {
            encryption: true,
            passwordPolicy: true,
            biometricAuth: true,
            updateStatus: true,
            jailbreakDetection: true
          }
        }
      ]
      setDevices(mockDevices)
    }
  }, [devices, setDevices])

  useEffect(() => {
    if (!securityAlerts || securityAlerts.length === 0) {
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert-1',
          deviceId: 'device-2',
          type: 'security_patch',
          severity: 'medium',
          title: 'Security Patch Required',
          description: 'Device is missing recent security updates',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
          actions: ['Force Update', 'Notify User', 'Restrict Access']
        },
        {
          id: 'alert-2',
          deviceId: 'device-2',
          type: 'compliance',
          severity: 'high',
          title: 'Password Policy Violation',
          description: 'Device does not meet company password requirements',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: false,
          actions: ['Enforce Policy', 'Notify User', 'Lock Device']
        },
        {
          id: 'alert-3',
          deviceId: 'device-1',
          type: 'location_change',
          severity: 'low',
          title: 'Location Change Detected',
          description: 'Device accessed from new location: San Francisco, CA',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: true,
          actions: ['Verify User', 'Mark as Trusted']
        }
      ]
      setSecurityAlerts(mockAlerts)
    }
  }, [securityAlerts, setSecurityAlerts])

  useEffect(() => {
    if (!devicePolicies || devicePolicies.length === 0) {
      const mockPolicies: DevicePolicy[] = [
        {
          id: 'policy-1',
          name: 'Standard Security Policy',
          description: 'Basic security requirements for all devices',
          enabled: true,
          rules: {
            requireBiometric: true,
            requireEncryption: true,
            maxOfflineTime: 72,
            allowJailbroken: false,
            requireSecurityPatch: 30,
            allowScreenshots: false,
            requireVPN: false,
            allowCloudBackup: true,
            minPasswordLength: 8,
            requireComplexPassword: true
          }
        },
        {
          id: 'policy-2',
          name: 'High Security Policy',
          description: 'Enhanced security for sensitive operations',
          enabled: false,
          rules: {
            requireBiometric: true,
            requireEncryption: true,
            maxOfflineTime: 24,
            allowJailbroken: false,
            requireSecurityPatch: 7,
            allowScreenshots: false,
            requireVPN: true,
            allowCloudBackup: false,
            minPasswordLength: 12,
            requireComplexPassword: true
          }
        }
      ]
      setDevicePolicies(mockPolicies)
    }
  }, [devicePolicies, setDevicePolicies])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <DeviceMobile className="h-5 w-5" />
      case 'tablet': return <DeviceMobile className="h-5 w-5" />
      default: return <DeviceMobile className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleRemoteAction = async (deviceId: string, action: string) => {
    const device = devices?.find(d => d.id === deviceId)
    if (!device) return

    toast.info(`Executing ${action} on ${device.name}...`)
    
    // Simulate remote action
    setTimeout(() => {
      switch (action) {
        case 'lock':
          toast.success(`${device.name} has been locked remotely`)
          break
        case 'wipe':
          toast.success(`Remote wipe initiated for ${device.name}`)
          break
        case 'locate':
          toast.success(`Location request sent to ${device.name}`)
          break
        case 'alarm':
          toast.success(`Alarm activated on ${device.name}`)
          break
        default:
          toast.success(`Action ${action} completed`)
      }
    }, 2000)
  }

  const resolveAlert = (alertId: string) => {
    setSecurityAlerts(current => 
      (current || []).map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    )
    toast.success('Security alert resolved')
  }

  const trustedDevices = (devices || []).filter(d => d.trusted).length
  const complianceIssues = (devices || []).filter(d => 
    !Object.values(d.complianceStatus).every(status => status)
  ).length
  const activeAlerts = (securityAlerts || []).filter(a => !a.resolved).length
  const biometricDevices = (devices || []).filter(d => d.biometricEnabled).length

  return (
    <div className="space-y-6">
      {/* Mobile Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trusted Devices</p>
                <p className="text-2xl font-bold">{trustedDevices}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Biometric Enabled</p>
                <p className="text-2xl font-bold">{biometricDevices}</p>
              </div>
              <Fingerprint className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{activeAlerts}</p>
              </div>
              <Warning className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Issues</p>
                <p className="text-2xl font-bold text-red-600">{complianceIssues}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="devices">Mobile Devices</TabsTrigger>
          <TabsTrigger value="biometric">Biometric Auth</TabsTrigger>
          <TabsTrigger value="hardware-keys">Hardware Keys</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="policies">Device Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registered Mobile Devices</CardTitle>
              <CardDescription>
                Manage and monitor your mobile devices and their security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(devices || []).map(device => (
                  <div key={device.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{device.name}</h4>
                            {device.trusted && (
                              <Badge variant="default" className="text-xs">Trusted</Badge>
                            )}
                            {device.jailbroken && (
                              <Badge variant="destructive" className="text-xs">Jailbroken</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Device Info</p>
                              <p>{device.manufacturer} {device.model}</p>
                              <p>{device.os} {device.osVersion}</p>
                              <p>Last seen: {new Date(device.lastSeen).toLocaleString()}</p>
                            </div>
                            
                            <div>
                              <p className="text-muted-foreground">Security Features</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {device.encrypted && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Encrypted
                                  </Badge>
                                )}
                                {device.biometricEnabled && (
                                  <Badge variant="outline" className="text-xs">
                                    <Fingerprint className="h-3 w-3 mr-1" />
                                    Biometric
                                  </Badge>
                                )}
                                {device.hardwareKeySupport && (
                                  <Badge variant="outline" className="text-xs">
                                    <Key className="h-3 w-3 mr-1" />
                                    Hardware Key
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              {device.batteryLevel && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Battery className="h-4 w-4" />
                                  <span>{device.batteryLevel}%</span>
                                </div>
                              )}
                              {device.networkInfo && (
                                <div className="flex items-center gap-2 mb-1">
                                  <WifiHigh className="h-4 w-4" />
                                  <span className="capitalize">{device.networkInfo.type}</span>
                                </div>
                              )}
                              {device.lastLocation && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{device.lastLocation.city}, {device.lastLocation.country}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Compliance Status */}
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-2">Compliance Status</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {Object.entries(device.complianceStatus).map(([key, status]) => (
                                <div key={key} className="flex items-center gap-1">
                                  {status ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="text-xs capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog open={showRemoteActions && selectedDevice === device.id} onOpenChange={(open) => {
                          setShowRemoteActions(open)
                          if (open) setSelectedDevice(device.id)
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Remote Actions
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Remote Device Actions</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Select an action to perform on {device.name}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoteAction(device.id, 'lock')}
                                  className="flex flex-col h-20"
                                >
                                  <Lock className="h-6 w-6 mb-1" />
                                  <span className="text-xs">Lock Device</span>
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoteAction(device.id, 'locate')}
                                  className="flex flex-col h-20"
                                >
                                  <MapPin className="h-6 w-6 mb-1" />
                                  <span className="text-xs">Locate Device</span>
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoteAction(device.id, 'alarm')}
                                  className="flex flex-col h-20"
                                >
                                  <Bell className="h-6 w-6 mb-1" />
                                  <span className="text-xs">Sound Alarm</span>
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRemoteAction(device.id, 'wipe')}
                                  className="flex flex-col h-20"
                                >
                                  <Trash className="h-6 w-6 mb-1" />
                                  <span className="text-xs">Remote Wipe</span>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biometric" className="space-y-6">
          <BiometricAuthManager userId={userId} companyId={companyId} />
        </TabsContent>

        <TabsContent value="hardware-keys" className="space-y-6">
          <HardwareSecurityKeyManager userId={userId} companyId={companyId} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Monitor and resolve mobile device security issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(securityAlerts || []).map(alert => {
                  const device = devices?.find(d => d.id === alert.deviceId)
                  return (
                    <div key={alert.id} className={`border rounded-lg p-4 ${alert.resolved ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${alert.resolved ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {alert.resolved ? <CheckCircle className="h-4 w-4" /> : <Warning className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{device?.name || 'Unknown Device'}</span>
                              <span className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                            {alert.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                          {!alert.resolved && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {(!securityAlerts || securityAlerts.length === 0) && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">No Security Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      All devices are secure and compliant
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Security Policies</CardTitle>
              <CardDescription>
                Configure security requirements for mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(devicePolicies || []).map(policy => (
                  <div key={policy.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{policy.name}</h4>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                      <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                        {policy.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <h5 className="font-medium">Authentication</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {policy.rules.requireBiometric ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Require Biometric</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {policy.rules.requireComplexPassword ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Complex Password (min {policy.rules.minPasswordLength} chars)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Security</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {policy.rules.requireEncryption ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Device Encryption</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!policy.rules.allowJailbroken ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Block Jailbroken Devices</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {policy.rules.requireVPN ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Require VPN</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Compliance</h5>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>Max offline: {policy.rules.maxOfflineTime}h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span>Security patch: {policy.rules.requireSecurityPatch} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!policy.rules.allowScreenshots ? <CheckCircle className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                            <span>Block Screenshots</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}