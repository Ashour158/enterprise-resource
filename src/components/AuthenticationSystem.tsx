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
import { 
  Shield, 
  ShieldCheck, 
  User, 
  Key, 
  Lock, 
  Eye, 
  EyeSlash, 
  DeviceMobile, 
  Desktop,
  Bell,
  CheckCircle,
  X,
  Plus,
  Buildings
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AuthSession {
  id: string
  userId: string
  companyId: string
  deviceName: string
  ipAddress: string
  location: string
  loginTime: string
  lastActivity: string
  mfaVerified: boolean
  trusted: boolean
  active: boolean
}

interface LoginAttempt {
  id: string
  email: string
  ipAddress: string
  location: string
  timestamp: string
  success: boolean
  failureReason?: string
  blocked: boolean
}

interface MFAMethod {
  id: string
  type: 'totp' | 'sms' | 'email' | 'biometric' | 'hardware_key'
  name: string
  enabled: boolean
  isPrimary: boolean
  setupDate: string
  lastUsed?: string
}

interface AuthenticationSystemProps {
  companyId: string
  userId: string
}

export function AuthenticationSystem({ companyId, userId }: AuthenticationSystemProps) {
  const [activeSessions, setActiveSessions] = useKV<AuthSession[]>(`auth-sessions-${userId}`, [])
  const [loginAttempts, setLoginAttempts] = useKV<LoginAttempt[]>(`login-attempts-${userId}`, [])
  const [mfaMethods, setMfaMethods] = useKV<MFAMethod[]>(`mfa-methods-${userId}`, [])
  const [passwordPolicy, setPasswordPolicy] = useKV<{
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number
    preventReuse: number
    lockoutAttempts: number
    lockoutDuration: number
  }>(`password-policy-${companyId}`, {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    preventReuse: 12,
    lockoutAttempts: 5,
    lockoutDuration: 30
  })

  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [selectedMfaType, setSelectedMfaType] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Initialize mock data
  useEffect(() => {
    if (!activeSessions || activeSessions.length === 0) {
      const mockSessions: AuthSession[] = [
        {
          id: '1',
          userId,
          companyId,
          deviceName: 'Chrome on Windows 11',
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          mfaVerified: true,
          trusted: true,
          active: true
        },
        {
          id: '2',
          userId,
          companyId,
          deviceName: 'Safari on iPhone 15 Pro',
          ipAddress: '192.168.1.101',
          location: 'New York, NY',
          loginTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          mfaVerified: true,
          trusted: true,
          active: true
        },
        {
          id: '3',
          userId,
          companyId,
          deviceName: 'Firefox on Ubuntu',
          ipAddress: '10.0.1.50',
          location: 'San Francisco, CA',
          loginTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          mfaVerified: false,
          trusted: false,
          active: false
        }
      ]
      setActiveSessions(mockSessions)
    }
  }, [activeSessions, userId, companyId, setActiveSessions])

  useEffect(() => {
    if (!loginAttempts || loginAttempts.length === 0) {
      const mockAttempts: LoginAttempt[] = [
        {
          id: '1',
          email: 'user@company.com',
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          success: true,
          blocked: false
        },
        {
          id: '2',
          email: 'user@company.com',
          ipAddress: '45.123.45.67',
          location: 'Moscow, RU',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          success: false,
          failureReason: 'Invalid password',
          blocked: true
        },
        {
          id: '3',
          email: 'user@company.com',
          ipAddress: '192.168.1.101',
          location: 'New York, NY',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          success: true,
          blocked: false
        }
      ]
      setLoginAttempts(mockAttempts)
    }
  }, [loginAttempts, setLoginAttempts])

  useEffect(() => {
    if (!mfaMethods || mfaMethods.length === 0) {
      const mockMfaMethods: MFAMethod[] = [
        {
          id: '1',
          type: 'totp',
          name: 'Google Authenticator',
          enabled: true,
          isPrimary: true,
          setupDate: '2024-01-15',
          lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'sms',
          name: 'SMS to +1 (555) ***-**89',
          enabled: false,
          isPrimary: false,
          setupDate: '2024-01-10'
        },
        {
          id: '3',
          type: 'email',
          name: 'Email to u***@company.com',
          enabled: true,
          isPrimary: false,
          setupDate: '2024-01-12'
        }
      ]
      setMfaMethods(mockMfaMethods)
    }
  }, [mfaMethods, setMfaMethods])

  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(current => {
      if (!current) return []
      return current.map(session => 
        session.id === sessionId ? { ...session, active: false } : session
      )
    })
    toast.success('Session terminated')
  }

  const handleToggleMfaMethod = (methodId: string, enabled: boolean) => {
    setMfaMethods(current => {
      if (!current) return []
      return current.map(method => 
        method.id === methodId ? { ...method, enabled } : method
      )
    })
    toast.success(`MFA method ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleSetPrimaryMfaMethod = (methodId: string) => {
    setMfaMethods(current => {
      if (!current) return []
      return current.map(method => ({
        ...method,
        isPrimary: method.id === methodId
      }))
    })
    toast.success('Primary MFA method updated')
  }

  const validatePassword = (password: string): string[] => {
    if (!passwordPolicy) return []
    
    const errors: string[] = []
    if (password.length < passwordPolicy.minLength) {
      errors.push(`Must be at least ${passwordPolicy.minLength} characters`)
    }
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Must contain uppercase letter')
    }
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Must contain lowercase letter')
    }
    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Must contain number')
    }
    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain special character')
    }
    return errors
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const errors = validatePassword(newPassword)
    if (errors.length > 0) {
      toast.error(`Password validation failed: ${errors.join(', ')}`)
      return
    }

    toast.success('Password updated successfully')
    setNewPassword('')
    setConfirmPassword('')
  }

  const getMfaIcon = (type: string) => {
    switch (type) {
      case 'totp': return <Key className="h-4 w-4" />
      case 'sms': return <DeviceMobile className="h-4 w-4" />
      case 'email': return <Bell className="h-4 w-4" />
      case 'biometric': return <User className="h-4 w-4" />
      case 'hardware_key': return <Shield className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const activeSessionsCount = (activeSessions || []).filter(s => s.active).length
  const failedAttempts = (loginAttempts || []).filter(a => !a.success).length
  const enabledMfaMethods = (mfaMethods || []).filter(m => m.enabled).length

  return (
    <div className="space-y-6">
      {/* Authentication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{activeSessionsCount}</p>
              </div>
              <Desktop className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Attempts (24h)</p>
                <p className="text-2xl font-bold text-red-600">{failedAttempts}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MFA Methods</p>
                <p className="text-2xl font-bold text-green-600">{enabledMfaMethods}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="attempts">Login Attempts</TabsTrigger>
          <TabsTrigger value="mfa">MFA Methods</TabsTrigger>
          <TabsTrigger value="password">Password Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active authentication sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(activeSessions || []).map(session => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {session.deviceName.includes('iPhone') || session.deviceName.includes('Mobile') ? 
                            <DeviceMobile className="h-4 w-4" /> : 
                            <Desktop className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <h4 className="font-medium">{session.deviceName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{session.ipAddress}</span>
                            <span>{session.location}</span>
                            <span>Last active: {new Date(session.lastActivity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.active ? 'default' : 'secondary'}>
                          {session.active ? 'Active' : 'Terminated'}
                        </Badge>
                        {session.mfaVerified && (
                          <Badge variant="outline" className="text-green-600">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            MFA
                          </Badge>
                        )}
                        {session.trusted && (
                          <Badge variant="outline" className="text-blue-600">
                            Trusted
                          </Badge>
                        )}
                        {session.active && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            Terminate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attempts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Login Attempts</CardTitle>
              <CardDescription>
                Monitor login attempts and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(loginAttempts || []).map(attempt => (
                  <div key={attempt.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${attempt.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {attempt.success ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{attempt.email}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{attempt.ipAddress}</span>
                            <span>{attempt.location}</span>
                            <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                            {attempt.failureReason && <span className="text-red-600">{attempt.failureReason}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={attempt.success ? 'default' : 'destructive'}>
                          {attempt.success ? 'Success' : 'Failed'}
                        </Badge>
                        {attempt.blocked && (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Multi-Factor Authentication</CardTitle>
                  <CardDescription>
                    Manage your MFA methods for enhanced security
                  </CardDescription>
                </div>
                <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add MFA Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mfa-type">Method Type</Label>
                        <Select value={selectedMfaType} onValueChange={setSelectedMfaType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select MFA method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                            <SelectItem value="sms">SMS Message</SelectItem>
                            <SelectItem value="email">Email Verification</SelectItem>
                            <SelectItem value="hardware_key">Hardware Security Key</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedMfaType === 'totp' && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">QR Code</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Scan with your authenticator app
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <Input
                              id="verification-code"
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              maxLength={6}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={() => {
                          toast.success('MFA method added successfully')
                          setShowMfaSetup(false)
                          setSelectedMfaType('')
                          setVerificationCode('')
                        }}>
                          Add Method
                        </Button>
                        <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
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
                {(mfaMethods || []).map(method => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getMfaIcon(method.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Added: {method.setupDate}</span>
                            {method.lastUsed && (
                              <span>Last used: {new Date(method.lastUsed).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isPrimary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                        <Badge variant={method.enabled ? 'default' : 'secondary'}>
                          {method.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleMfaMethod(method.id, !method.enabled)}
                        >
                          {method.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        {!method.isPrimary && method.enabled && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetPrimaryMfaMethod(method.id)}
                          >
                            Set Primary
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password following security requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                {newPassword && (
                  <div className="space-y-2">
                    <Label>Password Requirements</Label>
                    {validatePassword(newPassword).map((error, index) => (
                      <Alert key={index} className="py-2">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                <Button onClick={handlePasswordChange} className="w-full">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Current password requirements for your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Minimum {passwordPolicy?.minLength || 12} characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Must contain uppercase letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Must contain lowercase letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Must contain numbers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Must contain special characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Expires every {passwordPolicy?.maxAge || 90} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Account locks after {passwordPolicy?.lockoutAttempts || 5} failed attempts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}