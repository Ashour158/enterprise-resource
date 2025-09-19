import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { UserPreferences, NotificationType } from '@/types/erp'
import { 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Eye, 
  Code, 
  FloppyDisk,
  Palette,
  Clock,
  Layout,
  SpeakerHigh,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfilePreferencesProps {
  preferences: UserPreferences | null
  onUpdate: (preferences: Partial<UserPreferences>) => Promise<boolean>
  isLoading: boolean
}

export function ProfilePreferences({ preferences, onUpdate, isLoading }: ProfilePreferencesProps) {
  const [formData, setFormData] = useState<UserPreferences>(preferences || {} as UserPreferences)

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationTypeChange = (category: string, field: keyof NotificationType, value: any) => {
    const updatedTypes = formData.notification_types?.map(type => 
      type.category === category ? { ...type, [field]: value } : type
    ) || []
    
    handleChange('notification_types', updatedTypes)
  }

  const handleQuietHoursChange = (field: string, value: any) => {
    handleChange('quiet_hours', {
      ...formData.quiet_hours,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await onUpdate(formData)
    if (success) {
      toast.success('Preferences updated successfully')
    }
  }

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={20} />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the interface looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={formData.theme} onValueChange={(value) => handleChange('theme', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon size={16} />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <Select value={formData.date_format} onValueChange={(value) => handleChange('date_format', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_format">Time Format</Label>
              <Select value={formData.time_format} onValueChange={(value) => handleChange('time_format', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard_layout">Dashboard Layout</Label>
              <Select value={formData.dashboard_layout} onValueChange={(value) => handleChange('dashboard_layout', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <div className="flex items-center gap-2">
                      <Layout size={16} />
                      Grid
                    </div>
                  </SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Notification Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Global Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <Switch
                  id="email_notifications"
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => handleChange('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <Switch
                  id="push_notifications"
                  checked={formData.push_notifications}
                  onCheckedChange={(checked) => handleChange('push_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop_notifications">Desktop Notifications</Label>
                <Switch
                  id="desktop_notifications"
                  checked={formData.desktop_notifications}
                  onCheckedChange={(checked) => handleChange('desktop_notifications', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_frequency">Notification Frequency</Label>
              <Select 
                value={formData.notification_frequency} 
                onValueChange={(value) => handleChange('notification_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <SpeakerHigh size={16} />
              Quiet Hours
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet_hours_enabled">Enable Quiet Hours</Label>
              <Switch
                id="quiet_hours_enabled"
                checked={formData.quiet_hours?.enabled}
                onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
              />
            </div>
            
            {formData.quiet_hours?.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="quiet_start">Start Time</Label>
                  <input
                    id="quiet_start"
                    type="time"
                    value={formData.quiet_hours?.start_time}
                    onChange={(e) => handleQuietHoursChange('start_time', e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet_end">End Time</Label>
                  <input
                    id="quiet_end"
                    type="time"
                    value={formData.quiet_hours?.end_time}
                    onChange={(e) => handleQuietHoursChange('end_time', e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Categories</h4>
            <div className="space-y-3">
              {formData.notification_types?.map((type, index) => (
                <div key={type.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Label className="capitalize font-medium">{type.category}</Label>
                      <Badge variant={type.priority === 'high' ? 'destructive' : type.priority === 'medium' ? 'default' : 'secondary'}>
                        {type.priority}
                      </Badge>
                    </div>
                    <Switch
                      checked={type.enabled}
                      onCheckedChange={(checked) => handleNotificationTypeChange(type.category, 'enabled', checked)}
                    />
                  </div>
                  
                  {type.enabled && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Delivery Channels</Label>
                      <div className="flex gap-2">
                        {['email', 'push', 'desktop', 'sms'].map(channel => (
                          <Badge 
                            key={channel}
                            variant={type.channels.includes(channel as any) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const newChannels = type.channels.includes(channel as any)
                                ? type.channels.filter(c => c !== channel)
                                : [...type.channels, channel as any]
                              handleNotificationTypeChange(type.category, 'channels', newChannels)
                            }}
                          >
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Accessibility
          </CardTitle>
          <CardDescription>
            Settings to improve accessibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="high_contrast">High Contrast Mode</Label>
              <Switch
                id="high_contrast"
                checked={formData.high_contrast}
                onCheckedChange={(checked) => handleChange('high_contrast', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="large_text">Large Text</Label>
              <Switch
                id="large_text"
                checked={formData.large_text}
                onCheckedChange={(checked) => handleChange('large_text', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce_motion">Reduce Motion</Label>
              <Switch
                id="reduce_motion"
                checked={formData.reduce_motion}
                onCheckedChange={(checked) => handleChange('reduce_motion', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard_shortcuts">Keyboard Shortcuts</Label>
              <Switch
                id="keyboard_shortcuts"
                checked={formData.keyboard_shortcuts}
                onCheckedChange={(checked) => handleChange('keyboard_shortcuts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Select 
                value={formData.session_timeout?.toString()} 
                onValueChange={(value) => handleChange('session_timeout', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_export_format">Data Export Format</Label>
              <Select 
                value={formData.data_export_format} 
                onValueChange={(value) => handleChange('data_export_format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="login_notifications">Login Notifications</Label>
              <Switch
                id="login_notifications"
                checked={formData.login_notifications}
                onCheckedChange={(checked) => handleChange('login_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="security_alerts">Security Alerts</Label>
              <Switch
                id="security_alerts"
                checked={formData.security_alerts}
                onCheckedChange={(checked) => handleChange('security_alerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics_opt_in">Analytics Data Sharing</Label>
              <Switch
                id="analytics_opt_in"
                checked={formData.analytics_opt_in}
                onCheckedChange={(checked) => handleChange('analytics_opt_in', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Advanced
          </CardTitle>
          <CardDescription>
            Developer and advanced user settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="developer_mode">Developer Mode</Label>
              <Switch
                id="developer_mode"
                checked={formData.developer_mode}
                onCheckedChange={(checked) => handleChange('developer_mode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="beta_features">Beta Features</Label>
              <Switch
                id="beta_features"
                checked={formData.beta_features}
                onCheckedChange={(checked) => handleChange('beta_features', checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auto_save_interval">Auto-save Interval (seconds)</Label>
              <Select 
                value={formData.auto_save_interval?.toString()} 
                onValueChange={(value) => handleChange('auto_save_interval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup_frequency">Backup Frequency</Label>
              <Select 
                value={formData.backup_frequency} 
                onValueChange={(value) => handleChange('backup_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <FloppyDisk size={16} />
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  )
}