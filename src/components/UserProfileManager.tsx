import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfileBasicInfo } from './ProfileBasicInfo'
import { ProfilePreferences } from './ProfilePreferences'
import { ProfileSecurity } from './ProfileSecurity'
import { ProfileActivity } from './ProfileActivity'
import { AvatarUpload } from './AvatarUpload'
import { User, Shield, Gear, Clock, Download, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserProfileManagerProps {
  userId?: string
  onClose?: () => void
}

export function UserProfileManager({ userId, onClose }: UserProfileManagerProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [isExporting, setIsExporting] = useState(false)

  const {
    profile,
    preferences,
    securitySettings,
    changeLog,
    isLoading,
    updateProfile,
    updatePreferences,
    updateSecuritySettings,
    uploadAvatar,
    removeAvatar,
    avatarUpload,
    enableMFA,
    disableMFA,
    generateBackupCodes,
    revokeAllSessions,
    removeTrustedDevice,
    exportProfile,
    resetPreferences
  } = useUserProfile(userId)

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    try {
      await exportProfile(format)
    } finally {
      setIsExporting(false)
    }
  }

  const handleResetPreferences = async () => {
    if (window.confirm('Are you sure you want to reset all preferences to default? This action cannot be undone.')) {
      await resetPreferences()
    }
  }

  const getTabBadgeCount = (tab: string) => {
    switch (tab) {
      case 'security':
        return securitySettings?.mfa_enabled ? 0 : 1 // Show badge if MFA not enabled
      case 'activity':
        return changeLog?.length || 0
      default:
        return 0
    }
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information, preferences, and security settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleResetPreferences}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowClockwise size={16} />
            Reset Preferences
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export Profile
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <AvatarUpload
              currentAvatar={profile.profile_picture_url}
              onUpload={uploadAvatar}
              onRemove={removeAvatar}
              uploadState={avatarUpload}
              size="lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground mb-2">{profile.email}</p>
              <div className="flex items-center gap-4">
                <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={securitySettings?.mfa_enabled ? 'default' : 'outline'}>
                  {securitySettings?.mfa_enabled ? 'MFA Enabled' : 'MFA Disabled'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last login: {profile.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User size={16} />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Gear size={16} />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            Security
            {getTabBadgeCount('security') > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                {getTabBadgeCount('security')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock size={16} />
            Activity
            {getTabBadgeCount('activity') > 0 && (
              <Badge variant="outline" className="ml-1 h-4 w-4 p-0 text-xs">
                {getTabBadgeCount('activity')}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <ProfileBasicInfo
            profile={profile}
            onUpdate={updateProfile}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <ProfilePreferences
            preferences={preferences}
            onUpdate={updatePreferences}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ProfileSecurity
            profile={profile}
            securitySettings={securitySettings}
            onUpdateProfile={updateProfile}
            onUpdateSecurity={updateSecuritySettings}
            onEnableMFA={enableMFA}
            onDisableMFA={disableMFA}
            onGenerateBackupCodes={generateBackupCodes}
            onRevokeAllSessions={revokeAllSessions}
            onRemoveTrustedDevice={removeTrustedDevice}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ProfileActivity
            changeLog={changeLog}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}