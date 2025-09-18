import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ERPModule } from '@/types/erp'
import { 
  CloudCheck, 
  CloudArrowUp, 
  Warning, 
  Circle,
  CircleNotch 
} from '@phosphor-icons/react'

interface ModuleSyncStatusProps {
  module: ERPModule
  isOnline: boolean
  lastSyncTime?: string
  pendingChanges?: number
  onSync: (moduleId: string) => void
}

export function ModuleSyncStatus({ 
  module, 
  isOnline, 
  lastSyncTime, 
  pendingChanges = 0, 
  onSync 
}: ModuleSyncStatusProps) {
  const getSyncIcon = () => {
    if (!isOnline) return <Circle size={12} className="text-gray-400" />
    if (pendingChanges > 0) return <Warning size={12} className="text-orange-500" />
    return <CloudCheck size={12} className="text-green-500" />
  }

  const getSyncStatus = () => {
    if (!isOnline) return { label: 'Offline', color: 'secondary' as const }
    if (pendingChanges > 0) return { label: `${pendingChanges} pending`, color: 'destructive' as const }
    return { label: 'Synced', color: 'default' as const }
  }

  const formatSyncTime = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    
    if (diffSecs < 30) return 'Just now'
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString()
  }

  const syncStatus = getSyncStatus()

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getSyncIcon()}
          <span className="text-sm font-medium">{module.name}</span>
        </div>
        <Badge variant={syncStatus.color} className="text-xs">
          {syncStatus.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {formatSyncTime(lastSyncTime)}
        </span>
        {pendingChanges > 0 && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onSync(module.id)}
            className="h-6 px-2"
          >
            <CloudArrowUp size={12} />
          </Button>
        )}
      </div>
    </div>
  )
}