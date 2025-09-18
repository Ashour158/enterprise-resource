import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ModuleSyncConfig, ERPModule } from '@/types/erp'
import { Gear, CloudArrowUp } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SyncConfigurationProps {
  modules: ERPModule[]
  onUpdateConfig: (config: ModuleSyncConfig) => void
}

export function SyncConfiguration({ modules = [], onUpdateConfig }: SyncConfigurationProps) {
  const [open, setOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string>('')

  // Ensure safe array
  const safeModules = Array.isArray(modules) ? modules : []

  const defaultConfig: Omit<ModuleSyncConfig, 'moduleId'> = {
    autoSync: true,
    syncInterval: 30,
    priority: 'medium',
    conflictResolution: 'manual',
    syncFields: ['*']
  }

  const [config, setConfig] = useState<Omit<ModuleSyncConfig, 'moduleId'>>(defaultConfig)

  const handleSave = () => {
    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    const fullConfig: ModuleSyncConfig = {
      moduleId: selectedModule,
      ...config
    }

    onUpdateConfig(fullConfig)
    setOpen(false)
    setSelectedModule('')
    setConfig(defaultConfig)
  }

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId)
    // In a real app, you would load the existing config for this module
    setConfig(defaultConfig)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gear size={14} className="mr-2" />
          Sync Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sync Configuration</DialogTitle>
          <DialogDescription>
            Configure real-time synchronization settings for individual modules
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module-select">Module</Label>
            <Select value={selectedModule} onValueChange={handleModuleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {safeModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModule && (
            <>
              {/* Auto Sync */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Auto Sync</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically sync changes in real-time
                  </div>
                </div>
                <Switch
                  id="auto-sync"
                  checked={config.autoSync}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSync: checked }))}
                />
              </div>

              {/* Sync Interval */}
              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync Interval (seconds)</Label>
                <Select 
                  value={config.syncInterval.toString()} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, syncInterval: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Sync Priority</Label>
                <Select 
                  value={config.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => setConfig(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Real-time critical</SelectItem>
                    <SelectItem value="medium">Medium - Standard sync</SelectItem>
                    <SelectItem value="low">Low - Background sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conflict Resolution */}
              <div className="space-y-2">
                <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
                <Select 
                  value={config.conflictResolution} 
                  onValueChange={(value: 'server_wins' | 'client_wins' | 'manual') => 
                    setConfig(prev => ({ ...prev, conflictResolution: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual - Review each conflict</SelectItem>
                    <SelectItem value="server_wins">Server Wins - Server data priority</SelectItem>
                    <SelectItem value="client_wins">Client Wins - Local data priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <CloudArrowUp size={14} className="mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}