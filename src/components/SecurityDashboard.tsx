import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { MobileSecurityManager } from './MobileSecurityManager'
import { AuthenticationSystem } from './AuthenticationSystem'
import { 
  Shield, 
  ShieldCheck, 
  ShieldWarning, 
  Lock, 
  Eye, 
  EyeSlash, 
  Key, 
  Fingerprint, 
  DeviceMobile, 
  Desktop,
  Warning,
  CheckCircle,
  Globe,
  MapPin,
  Clock,
  User,
  Buildings,
  CreditCard
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  level: 'low' | 'medium' | 'high' | 'critical'
  companyId: string
  rules: {
    passwordComplexity: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      maxAge: number
    }
    mfa: {
      required: boolean
      methods: string[]
      gracePeriod: number
    }
    session: {
      maxDuration: number
      idleTimeout: number
      maxConcurrentSessions: number
    }
    ipWhitelist: string[]
    geoRestrictions: {
      allowedCountries: string[]
      blockSuspiciousLocations: boolean
    }
    deviceManagement: {
      requireRegistration: boolean
      maxDevices: number
      trustDuration: number
    }
  }
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'mfa_challenge' | 'suspicious_activity' | 'policy_violation' | 'data_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId: string
  companyId: string
  description: string
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  timestamp: string
  resolved: boolean
  additionalData?: Record<string, any>
}

interface DeviceInfo {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  trusted: boolean
  lastUsed: string
  ipAddress: string
  location: string
  fingerprint: string
}

interface ComplianceStatus {
  gdpr: {
    compliant: boolean
    lastAudit: string
    issues: string[]
  }
  hipaa: {
    compliant: boolean
    lastAudit: string
    issues: string[]
  }
  sox: {
    compliant: boolean
    lastAudit: string
    issues: string[]
  }
  iso27001: {
    compliant: boolean
    lastAudit: string
    issues: string[]
  }
}

interface SecurityDashboardProps {
  companyId: string
  userId: string
}

export function SecurityDashboard({ companyId, userId }: SecurityDashboardProps) {
  const [securityPolicies, setSecurityPolicies] = useKV<SecurityPolicy[]>(`security-policies-${companyId}`, [])
  const [securityEvents, setSecurityEvents] = useKV<SecurityEvent[]>(`security-events-${companyId}`, [])
  const [devices, setDevices] = useKV<DeviceInfo[]>(`user-devices-${userId}`, [])
  const [complianceStatus, setComplianceStatus] = useKV<ComplianceStatus>(`compliance-${companyId}`, {
    gdpr: { compliant: true, lastAudit: '2024-01-15', issues: [] },
    hipaa: { compliant: false, lastAudit: '2024-01-10', issues: ['Encryption key rotation overdue'] },
    sox: { compliant: true, lastAudit: '2024-01-20', issues: [] },
    iso27001: { compliant: true, lastAudit: '2024-01-12', issues: [] }
  })

  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  // Initialize default security policy
  useEffect(() => {
    if (!securityPolicies || securityPolicies.length === 0) {
      const defaultPolicy: SecurityPolicy = {
        id: 'default-policy',
        name: 'Enterprise Security Policy',
        description: 'Default enterprise-grade security policy with comprehensive protection',
        enabled: true,
        level: 'high',
        companyId,
        rules: {
          passwordComplexity: {
            minLength: 12,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            maxAge: 90
          },
          mfa: {
            required: true,
            methods: ['totp', 'sms', 'email'],
            gracePeriod: 7
          },
          session: {
            maxDuration: 8 * 60 * 60, // 8 hours
            idleTimeout: 30 * 60, // 30 minutes
            maxConcurrentSessions: 3
          },
          ipWhitelist: [],
          geoRestrictions: {
            allowedCountries: ['US', 'CA', 'GB', 'DE', 'FR'],
            blockSuspiciousLocations: true
          },
          deviceManagement: {
            requireRegistration: true,
            maxDevices: 5,
            trustDuration: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
      setSecurityPolicies([defaultPolicy])
    }
  }, [companyId, securityPolicies.length, setSecurityPolicies])

  // Mock security events
  useEffect(() => {
    if (securityEvents.length === 0) {
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          severity: 'low',
          userId,
          companyId,
          description: 'Successful login with MFA',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: { country: 'US', city: 'New York', coordinates: [40.7128, -74.0060] },
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          resolved: true
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'high',
          userId: 'unknown',
          companyId,
          description: 'Multiple failed login attempts from unknown location',
          ipAddress: '45.123.45.67',
          userAgent: 'curl/7.68.0',
          location: { country: 'RU', city: 'Moscow', coordinates: [55.7558, 37.6176] },
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'data_access',
          severity: 'medium',
          userId,
          companyId,
          description: 'Access to financial records module',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: true
        }
      ]
      setSecurityEvents(mockEvents)
    }
  }, [companyId, userId, securityEvents.length, setSecurityEvents])

  // Mock devices
  useEffect(() => {
    if (devices.length === 0) {
      const mockDevices: DeviceInfo[] = [
        {
          id: '1',
          name: 'Work Laptop - Windows',
          type: 'desktop',
          os: 'Windows 11',
          browser: 'Chrome 120.0',
          trusted: true,
          lastUsed: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.100',
          location: 'New York, US',
          fingerprint: 'fp_1234567890'
        },
        {
          id: '2',
          name: 'iPhone 15 Pro',
          type: 'mobile',
          os: 'iOS 17.2',
          browser: 'Safari Mobile',
          trusted: true,
          lastUsed: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.101',
          location: 'New York, US',
          fingerprint: 'fp_0987654321'
        },
        {
          id: '3',
          name: 'Personal MacBook',
          type: 'desktop',
          os: 'macOS Sonoma',
          browser: 'Safari 17.0',
          trusted: false,
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ipAddress: '10.0.1.50',
          location: 'San Francisco, US',
          fingerprint: 'fp_1122334455'
        }
      ]
      setDevices(mockDevices)
    }
  }, [devices.length, setDevices])

  const handlePolicyUpdate = (policyId: string, updates: Partial<SecurityPolicy>) => {
    setSecurityPolicies(current => {
      if (!current) return []
      return current.map(policy => 
        policy.id === policyId ? { ...policy, ...updates } : policy
      )
    })
    toast.success('Security policy updated')
  }

  const handleDeviceTrust = (deviceId: string, trusted: boolean) => {
    setDevices(current => {
      if (!current) return []
      return current.map(device => 
        device.id === deviceId ? { ...device, trusted } : device
      )
    })
    toast.success(`Device ${trusted ? 'trusted' : 'untrusted'}`)
  }

  const handleEventResolve = (eventId: string) => {
    setSecurityEvents(current => {
      if (!current) return []
      return current.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      )
    })
    toast.success('Security event resolved')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldWarning className="h-4 w-4" />
      case 'high': return <Warning className="h-4 w-4" />
      case 'medium': return <Shield className="h-4 w-4" />
      case 'low': return <ShieldCheck className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <DeviceMobile className="h-4 w-4" />
      case 'tablet': return <DeviceMobile className="h-4 w-4" />
      default: return <Desktop className="h-4 w-4" />
    }
  }

  const unresolvedEvents = (securityEvents || []).filter(event => !event.resolved)
  const criticalEvents = (securityEvents || []).filter(event => event.severity === 'critical')
  const trustedDevices = (devices || []).filter(device => device.trusted)

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-green-600">94/100</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">{criticalEvents.length}</p>
              </div>
              <ShieldWarning className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trusted Devices</p>
                <p className="text-2xl font-bold">{trustedDevices.length}</p>
              </div>
              <DeviceMobile className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved Events</p>
                <p className="text-2xl font-bold text-orange-600">{unresolvedEvents.length}</p>
              </div>
              <Warning className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="mfa">MFA Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Manage company-wide security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(securityPolicies || []).map(policy => (
                <div key={policy.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(policy.level)}`}>
                        {getSeverityIcon(policy.level)}
                      </div>
                      <div>
                        <h4 className="font-medium">{policy.name}</h4>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                        {policy.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPolicy(policy)}>
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Configure Security Policy</DialogTitle>
                          </DialogHeader>
                          {selectedPolicy && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="policy-enabled">Policy Enabled</Label>
                                <Switch
                                  id="policy-enabled"
                                  checked={selectedPolicy.enabled}
                                  onCheckedChange={(enabled) => 
                                    handlePolicyUpdate(selectedPolicy.id, { enabled })
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium">Password Complexity</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="min-length">Minimum Length</Label>
                                    <Input
                                      id="min-length"
                                      type="number"
                                      value={selectedPolicy.rules.passwordComplexity.minLength}
                                      onChange={(e) => 
                                        handlePolicyUpdate(selectedPolicy.id, {
                                          rules: {
                                            ...selectedPolicy.rules,
                                            passwordComplexity: {
                                              ...selectedPolicy.rules.passwordComplexity,
                                              minLength: parseInt(e.target.value)
                                            }
                                          }
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="max-age">Password Max Age (days)</Label>
                                    <Input
                                      id="max-age"
                                      type="number"
                                      value={selectedPolicy.rules.passwordComplexity.maxAge}
                                      onChange={(e) => 
                                        handlePolicyUpdate(selectedPolicy.id, {
                                          rules: {
                                            ...selectedPolicy.rules,
                                            passwordComplexity: {
                                              ...selectedPolicy.rules.passwordComplexity,
                                              maxAge: parseInt(e.target.value)
                                            }
                                          }
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium">Multi-Factor Authentication</h4>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="mfa-required">Require MFA</Label>
                                  <Switch
                                    id="mfa-required"
                                    checked={selectedPolicy.rules.mfa.required}
                                    onCheckedChange={(required) => 
                                      handlePolicyUpdate(selectedPolicy.id, {
                                        rules: {
                                          ...selectedPolicy.rules,
                                          mfa: {
                                            ...selectedPolicy.rules.mfa,
                                            required
                                          }
                                        }
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium">Session Management</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="max-duration">Max Duration (hours)</Label>
                                    <Input
                                      id="max-duration"
                                      type="number"
                                      value={selectedPolicy.rules.session.maxDuration / 3600}
                                      onChange={(e) => 
                                        handlePolicyUpdate(selectedPolicy.id, {
                                          rules: {
                                            ...selectedPolicy.rules,
                                            session: {
                                              ...selectedPolicy.rules.session,
                                              maxDuration: parseInt(e.target.value) * 3600
                                            }
                                          }
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="idle-timeout">Idle Timeout (minutes)</Label>
                                    <Input
                                      id="idle-timeout"
                                      type="number"
                                      value={selectedPolicy.rules.session.idleTimeout / 60}
                                      onChange={(e) => 
                                        handlePolicyUpdate(selectedPolicy.id, {
                                          rules: {
                                            ...selectedPolicy.rules,
                                            session: {
                                              ...selectedPolicy.rules.session,
                                              idleTimeout: parseInt(e.target.value) * 60
                                            }
                                          }
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Monitor and respond to security events and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(securityEvents || []).map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                          {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{event.description}</h4>
                            <Badge variant={event.resolved ? 'default' : 'destructive'}>
                              {event.resolved ? 'Resolved' : 'Active'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {event.ipAddress}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location.city}, {event.location.country}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {event.type}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!event.resolved && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEventResolve(event.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
              <CardDescription>
                Manage trusted devices and monitor device access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(devices || []).map(device => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{device.os} • {device.browser}</span>
                            <span>{device.location}</span>
                            <span>Last used: {new Date(device.lastUsed).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={device.trusted ? 'default' : 'secondary'}>
                          {device.trusted ? 'Trusted' : 'Untrusted'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeviceTrust(device.id, !device.trusted)}
                        >
                          {device.trusted ? 'Untrust' : 'Trust'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Monitor compliance with regulatory standards and frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceStatus && Object.entries(complianceStatus).map(([standard, status]) => {
                  const complianceData = status as {
                    compliant: boolean
                    lastAudit: string
                    issues: string[]
                  }
                  return (
                  <div key={standard} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium uppercase">{standard}</h4>
                      <Badge variant={complianceData.compliant ? 'default' : 'destructive'}>
                        {complianceData.compliant ? 'Compliant' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Last Audit: {complianceData.lastAudit}</div>
                      {complianceData.issues.length > 0 && (
                        <div>
                          <div className="font-medium text-foreground mb-1">Issues:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {complianceData.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <MobileSecurityManager userId={userId} companyId={companyId} />
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Set up and manage your multi-factor authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Fingerprint className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">TOTP Authenticator</h4>
                        <p className="text-sm text-muted-foreground">Google Authenticator, Authy</p>
                      </div>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <DeviceMobile className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">SMS Authentication</h4>
                        <p className="text-sm text-muted-foreground">+1 (555) ***-**89</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Hardware Key</h4>
                        <p className="text-sm text-muted-foreground">YubiKey, WebAuthn</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  For maximum security, we recommend enabling at least two different MFA methods. 
                  This ensures you can still access your account if one method becomes unavailable.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button onClick={() => setShowMfaSetup(true)}>
                  Set Up New MFA Method
                </Button>

                {showMfaSetup && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Set Up TOTP Authenticator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mfa-code">Enter verification code</Label>
                        <Input
                          id="mfa-code"
                          placeholder="000000"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => {
                          toast.success('MFA setup completed')
                          setShowMfaSetup(false)
                          setMfaCode('')
                        }}>
                          Verify & Enable
                        </Button>
                        <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}