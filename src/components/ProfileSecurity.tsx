import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GlobalUser, 
  ProfileSecuritySettings, 
  UserProfileUpdate 
} from '@/types/erp'
import { 
  Shield, 
  DeviceMobile, 
  Key, 
  Eye, 
  EyeSlash, 
  QrCode,
  Copy,
  Trash,
  Warning,
  CheckCircle,
  Clock,
  FloppyDisk
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfileSecurityProps {
  profile: GlobalUser
  securitySettings: ProfileSecuritySettings | null
  onUpdateProfile: (updates: UserProfileUpdate) => Promise<boolean>
  onUpdateSecurity: (settings: Partial<ProfileSecuritySettings>) => Promise<boolean>
  onEnableMFA: (method: 'totp' | 'sms' | 'email') => Promise<{ secret?: string; qrCode?: string; success: boolean }>
  onDisableMFA: () => Promise<boolean>
  onGenerateBackupCodes: () => Promise<string[]>
  onRevokeAllSessions: () => Promise<boolean>
  onRemoveTrustedDevice: (deviceId: string) => Promise<boolean>
  isLoading: boolean
}

export function ProfileSecurity({
  profile,
  securitySettings,
  onUpdateProfile,
  onUpdateSecurity,
  onEnableMFA,
  onDisableMFA,
  onGenerateBackupCodes,
  onRevokeAllSessions,
  onRemoveTrustedDevice,
  isLoading
}: ProfileSecurityProps) {
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])
  const [mfaSetup, setMfaSetup] = useState<{ secret?: string; qrCode?: string } | null>(null)
  const [showMfaDialog, setShowMfaDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const handleEnableMFA = async (method: 'totp' | 'sms' | 'email') => {
    const result = await onEnableMFA(method)
    if (result.success) {
      if (method === 'totp' && result.secret && result.qrCode) {
        setMfaSetup({ secret: result.secret, qrCode: result.qrCode })
        setShowMfaDialog(true)
      }
    }
  }

  const handleGenerateBackupCodes = async () => {
    const codes = await onGenerateBackupCodes()
    if (codes.length > 0) {
      setNewBackupCodes(codes)
      setShowBackupCodes(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const content = newBackupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    // Simulate password change
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await onUpdateProfile({ 
        // Note: In a real app, password changes would be handled differently
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated successfully')
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const mockTrustedDevices = [
    {
      id: '1',
      device_name: 'MacBook Pro - Chrome',
      device_type: 'desktop' as const,
      browser: 'Chrome',
      last_used: '2024-01-15T10:30:00Z',
      is_current: true,
      trusted_until: '2024-02-15T10:30:00Z'
    },
    {
      id: '2',
      device_name: 'iPhone 15 - Safari',
      device_type: 'mobile' as const,
      browser: 'Safari',
      last_used: '2024-01-14T18:45:00Z',
      is_current: false,
      trusted_until: '2024-02-14T18:45:00Z'
    }
  ]

  const mockLoginHistory = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      ip_address: '192.168.1.100',
      location: 'New York, NY',
      device_info: 'MacBook Pro',
      browser: 'Chrome',
      success: true
    },
    {
      id: '2',
      timestamp: '2024-01-14T18:45:00Z',
      ip_address: '192.168.1.101',
      location: 'New York, NY',
      device_info: 'iPhone 15',
      browser: 'Safari',
      success: true
    },
    {
      id: '3',
      timestamp: '2024-01-13T09:15:00Z',
      ip_address: '203.0.113.0',
      location: 'Unknown',
      device_info: 'Unknown',
      browser: 'Unknown',
      success: false,
      failure_reason: 'Invalid password'
    }
  ]

  return (
    <div className="space-y-6">
      {/* MFA Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Multi-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">MFA Status</Label>
              <p className="text-sm text-muted-foreground">
                {securitySettings?.mfa_enabled 
                  ? 'Multi-factor authentication is enabled'
                  : 'Multi-factor authentication is disabled'
                }
              </p>
            </div>
            <Badge variant={securitySettings?.mfa_enabled ? 'default' : 'destructive'}>
              {securitySettings?.mfa_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {securitySettings?.mfa_enabled ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {securitySettings.mfa_methods?.map(method => (
                  <Badge key={method} variant="outline">
                    {method.toUpperCase()}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateBackupCodes}
                  disabled={isLoading}
                >
                  Generate Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDisableMFA}
                  disabled={isLoading}
                >
                  Disable MFA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  Your account is not protected by multi-factor authentication. Enable MFA to improve security.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEnableMFA('totp')}
                  disabled={isLoading}
                >
                  <DeviceMobile size={16} className="mr-2" />
                  Enable Authenticator App
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEnableMFA('sms')}
                  disabled={isLoading}
                >
                  Enable SMS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEnableMFA('email')}
                  disabled={isLoading}
                >
                  Enable Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Password
          </CardTitle>
          <CardDescription>
            Change your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <FloppyDisk size={16} />
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobile size={20} />
            Active Sessions & Trusted Devices
          </CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="font-medium">Trusted Devices</Label>
            <Button
              variant="outline"
              onClick={onRevokeAllSessions}
              disabled={isLoading}
            >
              Revoke All Sessions
            </Button>
          </div>

          <div className="space-y-3">
            {mockTrustedDevices.map((device) => (
              <div key={device.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DeviceMobile size={20} />
                    <div>
                      <p className="font-medium">{device.device_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last used: {new Date(device.last_used).toLocaleDateString()}
                      </p>
                    </div>
                    {device.is_current && (
                      <Badge variant="default">Current Device</Badge>
                    )}
                  </div>
                  {!device.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveTrustedDevice(device.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Recent Login Activity
          </CardTitle>
          <CardDescription>
            Review recent login attempts to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLoginHistory.map((login) => (
              <div key={login.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {login.success ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Warning size={20} className="text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {login.success ? 'Successful login' : 'Failed login attempt'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(login.timestamp).toLocaleString()} • {login.ip_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {login.device_info} • {login.browser} • {login.location || 'Unknown location'}
                      </p>
                      {!login.success && login.failure_reason && (
                        <p className="text-sm text-red-500">
                          Reason: {login.failure_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MFA Setup Dialog */}
      <Dialog open={showMfaDialog} onOpenChange={setShowMfaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Authenticator App</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          {mfaSetup && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QrCode size={200} />
                  <p className="text-xs text-muted-foreground mt-2">QR Code placeholder</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex gap-2">
                  <Input value={mfaSetup.secret} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(mfaSetup.secret || '')}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  Save your backup codes before completing setup. You'll need them if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>
              
              <Button onClick={() => setShowMfaDialog(false)} className="w-full">
                Complete Setup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-muted p-4 rounded">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="text-center p-2 bg-background rounded">
                  {code}
                </div>
              ))}
            </div>
            
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                These codes will not be shown again. Make sure to save them securely.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={downloadBackupCodes} className="flex-1">
                Download Codes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(newBackupCodes.join('\n'))} 
                className="flex-1"
              >
                Copy All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}