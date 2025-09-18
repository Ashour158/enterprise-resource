import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SyncConfiguration } from '@/components/SyncConfiguration'
import { SyncStatus, SyncConflict, ERPModule, ModuleSyncConfig } from '@/types/erp'
import { 
  CloudArrowUp, 
  CloudArrowDown, 
  WifiHigh, 
  WifiMedium, 
  WifiLow, 
  WifiSlash,
  CircleNotch,
  CheckCircle,
  Warning,
  X
} from '@phosphor-icons/react'

interface RealTimeSyncPanelProps {
  syncStatus: SyncStatus
  syncProgress: number
  conflicts: SyncConflict[]
  modules: ERPModule[]
  onTriggerSync: (moduleId?: string) => void
  onResolveConflict: (conflictId: string, resolution: 'server' | 'client') => void
  onUpdateSyncConfig: (config: ModuleSyncConfig) => void
}

export function RealTimeSyncPanel({ 
  syncStatus, 
  syncProgress, 
  conflicts = [], // Default to empty array
  modules = [], // Default to empty array
  onTriggerSync, 
  onResolveConflict,
  onUpdateSyncConfig 
}: RealTimeSyncPanelProps) {
  const [showConflicts, setShowConflicts] = useState(false)
  
  // Ensure safe arrays
  const safeConflicts = Array.isArray(conflicts) ? conflicts : []
  const safeModules = Array.isArray(modules) ? modules : []

  const getConnectionIcon = () => {
    if (!syncStatus.isConnected) return <WifiSlash size={16} className="text-red-500" />
    
    switch (syncStatus.connectionQuality) {
      case 'excellent':
        return <WifiHigh size={16} className="text-green-500" />
      case 'good':
        return <WifiMedium size={16} className="text-yellow-500" />
      case 'poor':
        return <WifiLow size={16} className="text-orange-500" />
      default:
        return <WifiSlash size={16} className="text-red-500" />
    }
  }

  const getConnectionStatus = () => {
    if (!syncStatus.isConnected) return { label: 'Offline', color: 'destructive' as const }
    if (syncStatus.syncInProgress) return { label: 'Syncing', color: 'default' as const }
    return { label: 'Connected', color: 'default' as const }
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString()
  }

  const connectionStatus = getConnectionStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getConnectionIcon()}
            Real-time Sync
          </span>
          <Badge variant={connectionStatus.color}>
            {connectionStatus.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          Live data synchronization across all modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last sync</span>
            <span>{formatLastSync(syncStatus.lastSync)}</span>
          </div>
          
          {syncStatus.syncInProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-semibold">{syncStatus.pendingUpdates}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">{syncStatus.conflictCount}</div>
              <div className="text-xs text-muted-foreground">Conflicts</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onTriggerSync()}
            disabled={syncStatus.syncInProgress}
            className="flex-1"
          >
            {syncStatus.syncInProgress ? (
              <>
                <CircleNotch size={14} className="mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CloudArrowDown size={14} className="mr-2" />
                Sync All
              </>
            )}
          </Button>
          
          <SyncConfiguration 
            modules={safeModules}
            onUpdateConfig={onUpdateSyncConfig}
          />
          
          {safeConflicts.length > 0 && (
            <Dialog open={showConflicts} onOpenChange={setShowConflicts}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Warning size={14} className="mr-2" />
                  {safeConflicts.length}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Sync Conflicts</DialogTitle>
                  <DialogDescription>
                    Resolve conflicts to ensure data consistency across modules
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {safeConflicts.map((conflict) => (
                    <ConflictItem 
                      key={conflict.id}
                      conflict={conflict}
                      onResolve={onResolveConflict}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Connection Quality</span>
            <span className="capitalize">{syncStatus.connectionQuality}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ConflictItemProps {
  conflict: SyncConflict
  onResolve: (conflictId: string, resolution: 'server' | 'client') => void
}

function ConflictItem({ conflict, onResolve }: ConflictItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{conflict.module} - {conflict.entity}</h4>
          <p className="text-sm text-muted-foreground">
            Field: {conflict.field}
          </p>
        </div>
        <Badge variant="outline">
          {new Date(conflict.timestamp).toLocaleTimeString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Server Value</div>
          <div className="p-2 bg-blue-50 rounded border">
            {String(conflict.serverValue)}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onResolve(conflict.id, 'server')}
            className="w-full"
          >
            Use Server
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Local Value</div>
          <div className="p-2 bg-green-50 rounded border">
            {String(conflict.clientValue)}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onResolve(conflict.id, 'client')}
            className="w-full"
          >
            Use Local
          </Button>
        </div>
      </div>
    </div>
  )
}