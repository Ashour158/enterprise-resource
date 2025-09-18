import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataSyncEvent } from '@/types/erp'
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  CloudArrowDown,
  Circle 
} from '@phosphor-icons/react'

interface RealTimeDataFeedProps {
  companyId: string
  maxEvents?: number
}

export function RealTimeDataFeed({ companyId, maxEvents = 20 }: RealTimeDataFeedProps) {
  const [events, setEvents] = useState<DataSyncEvent[]>([])

  // Simulate real-time data events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const modules = ['finance', 'hr', 'inventory', 'sales', 'crm', 'projects']
      const entities = ['record', 'transaction', 'item', 'user', 'document']
      const operations = ['create', 'update', 'delete', 'sync'] as const

      const newEvent: DataSyncEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'data_update',
        module: modules[Math.floor(Math.random() * modules.length)],
        entity: entities[Math.floor(Math.random() * entities.length)],
        operation: operations[Math.floor(Math.random() * operations.length)],
        data: {
          id: `${Math.random().toString(36).substr(2, 9)}`,
          value: Math.floor(Math.random() * 10000),
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        companyId,
        userId: `user-${Math.floor(Math.random() * 5) + 1}`
      }

      setEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)])
    }, 2000 + Math.random() * 3000) // Random interval between 2-5 seconds

    return () => clearInterval(eventInterval)
  }, [companyId, maxEvents])

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'create':
        return <Plus size={12} className="text-green-600" />
      case 'update':
        return <PencilSimple size={12} className="text-blue-600" />
      case 'delete':
        return <Trash size={12} className="text-red-600" />
      case 'sync':
        return <CloudArrowDown size={12} className="text-purple-600" />
      default:
        return <Circle size={12} className="text-gray-600" />
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'default'
      case 'update':
        return 'secondary'
      case 'delete':
        return 'destructive'
      case 'sync':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffMs = now.getTime() - eventTime.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 10) return 'just now'
    if (diffSecs < 60) return `${diffSecs}s ago`
    const diffMins = Math.floor(diffSecs / 60)
    if (diffMins < 60) return `${diffMins}m ago`
    return eventTime.toLocaleTimeString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Data Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Circle size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getOperationIcon(event.operation)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {event.module}
                        </span>
                        <Badge 
                          variant={getOperationColor(event.operation) as any}
                          className="text-xs"
                        >
                          {event.operation}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.entity} {event.data?.id || 'updated'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {formatTimeAgo(event.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}