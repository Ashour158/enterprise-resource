import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  DataSyncEvent, 
  SyncConflict, 
  ModuleSyncConfig, 
  ConflictResolutionStrategy,
  SyncStatus 
} from '@/types/erp'

interface SyncOptions {
  priority: 'high' | 'medium' | 'low'
  retryAttempts: number
  timeout: number
  batchSize: number
}

interface SyncMetrics {
  totalSynced: number
  successRate: number
  averageLatency: number
  conflictsDetected: number
  conflictsResolved: number
  lastSyncTime: string
}

interface RealTimeSyncState {
  isConnected: boolean
  syncInProgress: boolean
  queuedEvents: DataSyncEvent[]
  failedEvents: DataSyncEvent[]
  syncMetrics: SyncMetrics
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline'
}

export function useRealTimeDataSync(companyId: string) {
  // Validate companyId parameter
  if (!companyId) {
    throw new Error('useRealTimeDataSync requires a valid companyId')
  }

  // Persistent state with company isolation
  const [syncConfig, setSyncConfig] = useKV<ModuleSyncConfig[]>(`sync-config-${companyId}`, [])
  const [conflicts, setConflicts] = useKV<SyncConflict[]>(`sync-conflicts-${companyId}`, [])
  const [pendingChanges, setPendingChanges] = useKV<Record<string, number>>(`pending-changes-${companyId}`, {})
  
  // Runtime state
  const [syncState, setSyncState] = useState<RealTimeSyncState>({
    isConnected: false,
    syncInProgress: false,
    queuedEvents: [],
    failedEvents: [],
    syncMetrics: {
      totalSynced: 0,
      successRate: 0,
      averageLatency: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      lastSyncTime: new Date().toISOString()
    },
    connectionQuality: 'offline'
  })

  // WebSocket connection ref
  const wsRef = useRef<WebSocket | null>(null)
  const syncQueueRef = useRef<DataSyncEvent[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection with company isolation
  const initializeConnection = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // In a real implementation, this would connect to your Flask-SocketIO server
      // WebSocket URL would include company context for data isolation
      // const wsUrl = `wss://api.yourdomain.com/sync/${companyId}?token=${sessionToken}`
      
      // For demo purposes, we'll simulate a connection
      const mockWebSocket = {
        readyState: WebSocket.OPEN,
        send: (data: string) => {
          console.log(`[Company ${companyId}] Sending data:`, data)
        },
        close: () => {
          console.log(`[Company ${companyId}] WebSocket closed`)
        },
        onopen: null as ((event: Event) => void) | null,
        onclose: null as ((event: CloseEvent) => void) | null,
        onmessage: null as ((event: MessageEvent) => void) | null,
        onerror: null as ((event: Event) => void) | null
      } as unknown as WebSocket

      wsRef.current = mockWebSocket

      // Simulate connection establishment with company context
      setTimeout(() => {
        setSyncState(prev => ({
          ...prev,
          isConnected: true,
          connectionQuality: 'excellent'
        }))
        
        // Start receiving real-time events for this company only
        simulateRealTimeEvents()
        
        toast.success(`Real-time sync connected for company ${companyId}`)
      }, 1000)

      // Set up periodic connection quality checks
      const qualityCheckInterval = setInterval(() => {
        updateConnectionQuality()
      }, 5000)

      return () => {
        clearInterval(qualityCheckInterval)
      }
    } catch (error) {
      console.error(`Failed to initialize WebSocket connection for company ${companyId}:`, error)
      setSyncState(prev => ({
        ...prev,
        isConnected: false,
        connectionQuality: 'offline'
      }))
      
      // Retry connection after delay
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeConnection()
      }, 5000)
    }
  }, [companyId])

  // Simulate real-time events for demo
  const simulateRealTimeEvents = useCallback(() => {
    const eventTypes = ['data_update', 'sync_status', 'conflict', 'batch_update'] as const
    const modules = ['finance', 'inventory', 'hr', 'sales', 'manufacturing']
    const entities = ['invoice', 'product', 'employee', 'lead', 'order']
    const operations = ['create', 'update', 'delete', 'sync'] as const

    const generateRandomEvent = (): DataSyncEvent => ({
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      module: modules[Math.floor(Math.random() * modules.length)],
      entity: entities[Math.floor(Math.random() * entities.length)],
      operation: operations[Math.floor(Math.random() * operations.length)],
      data: {
        id: `entity-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        changes: Math.floor(Math.random() * 5) + 1
      },
      timestamp: new Date().toISOString(),
      companyId,
      userId: `user-${Math.floor(Math.random() * 10) + 1}`
    })

    // Generate events periodically
    const eventInterval = setInterval(() => {
      if (syncState.isConnected && Math.random() < 0.3) {
        const event = generateRandomEvent()
        handleIncomingEvent(event)
      }
    }, 3000)

    return () => clearInterval(eventInterval)
  }, [companyId, syncState.isConnected])

  // Handle incoming real-time events
  const handleIncomingEvent = useCallback((event: DataSyncEvent) => {
    setSyncState(prev => ({
      ...prev,
      queuedEvents: [...prev.queuedEvents, event]
    }))

    // Update pending changes count
    setPendingChanges(prev => {
      const current = prev || {}
      return {
        ...current,
        [event.module]: (current[event.module] || 0) + 1
      }
    })

    // Process event based on type
    switch (event.type) {
      case 'conflict':
        detectAndHandleConflict(event)
        break
      case 'data_update':
        processDataUpdate(event)
        break
      case 'sync_status':
        updateSyncStatus(event)
        break
      case 'batch_update':
        processBatchUpdate(event)
        break
    }
  }, [])

  // Detect and handle conflicts with enhanced metadata
  const detectAndHandleConflict = useCallback((event: DataSyncEvent) => {
    try {
      const conflict: SyncConflict = {
        id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        module: event.module,
        entity: event.entity,
        entityId: event.data.id || 'unknown',
        field: 'data',
        serverValue: event.data,
        clientValue: { modified: true, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
        resolved: false,
        priority: Math.random() < 0.3 ? 'critical' : Math.random() < 0.6 ? 'high' : 'medium',
        conflictType: (['data_mismatch', 'concurrent_edit', 'version_conflict', 'permission_conflict'][
          Math.floor(Math.random() * 4)
        ] as SyncConflict['conflictType']),
        affectedUsers: [event.userId || 'unknown'],
        businessImpact: (['revenue', 'compliance', 'operations', 'reporting', 'none'][
          Math.floor(Math.random() * 5)
        ] as SyncConflict['businessImpact']),
        metadata: {
          lastModified: new Date().toISOString(),
          modifiedBy: event.userId || 'system',
          version: 1,
          dependencies: [],
          validationErrors: []
        }
      }

      setConflicts(prev => {
        const current = prev || []
        return [...current, conflict]
      })
      
      setSyncState(prev => ({
        ...prev,
        syncMetrics: {
          ...prev.syncMetrics,
          conflictsDetected: prev.syncMetrics.conflictsDetected + 1
        }
      }))

      toast.warning(`Sync conflict detected in ${event.module}`, {
        description: `Entity: ${event.entity}, Priority: ${conflict.priority}`
      })
    } catch (error) {
      console.error('Error handling conflict detection:', error)
      toast.error('Error processing sync conflict')
    }
  }, [setConflicts])

  // Process data updates
  const processDataUpdate = useCallback((event: DataSyncEvent) => {
    // Simulate processing latency
    setTimeout(() => {
      setSyncState(prev => ({
        ...prev,
        syncMetrics: {
          ...prev.syncMetrics,
          totalSynced: prev.syncMetrics.totalSynced + 1,
          lastSyncTime: new Date().toISOString()
        },
        queuedEvents: prev.queuedEvents.filter(e => e.id !== event.id)
      }))

      // Clear pending changes for this module
      setPendingChanges(prev => {
        const current = prev || {}
        return {
          ...current,
          [event.module]: Math.max(0, (current[event.module] || 1) - 1)
        }
      })
    }, Math.random() * 1000 + 500)
  }, [])

  // Update sync status
  const updateSyncStatus = useCallback((event: DataSyncEvent) => {
    setSyncState(prev => ({
      ...prev,
      syncMetrics: {
        ...prev.syncMetrics,
        lastSyncTime: new Date().toISOString()
      }
    }))
  }, [])

  // Process batch updates
  const processBatchUpdate = useCallback((event: DataSyncEvent) => {
    const batchSize = event.data.batchSize || 1
    
    setSyncState(prev => ({
      ...prev,
      syncInProgress: true
    }))

    // Simulate batch processing
    setTimeout(() => {
      setSyncState(prev => ({
        ...prev,
        syncInProgress: false,
        syncMetrics: {
          ...prev.syncMetrics,
          totalSynced: prev.syncMetrics.totalSynced + batchSize,
          lastSyncTime: new Date().toISOString()
        }
      }))

      toast.success(`Batch sync completed: ${batchSize} items`)
    }, batchSize * 100)
  }, [])

  // Update connection quality based on latency and reliability
  const updateConnectionQuality = useCallback(() => {
    const latency = Math.random() * 200 + 10 // Simulate latency
    const reliability = Math.random() * 100 // Simulate reliability

    let quality: 'excellent' | 'good' | 'poor' | 'offline'
    
    if (latency < 50 && reliability > 95) {
      quality = 'excellent'
    } else if (latency < 100 && reliability > 90) {
      quality = 'good'
    } else if (latency < 200 && reliability > 80) {
      quality = 'poor'
    } else {
      quality = 'offline'
    }

    setSyncState(prev => ({
      ...prev,
      connectionQuality: quality,
      syncMetrics: {
        ...prev.syncMetrics,
        averageLatency: latency
      }
    }))
  }, [])

  // Manual sync trigger
  const triggerManualSync = useCallback(async (moduleId?: string, options?: Partial<SyncOptions>) => {
    setSyncState(prev => ({ ...prev, syncInProgress: true }))

    const syncOptions: SyncOptions = {
      priority: 'medium',
      retryAttempts: 3,
      timeout: 30000,
      batchSize: 50,
      ...options
    }

    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const syncedCount = Math.floor(Math.random() * 10) + 1

      setSyncState(prev => ({
        ...prev,
        syncInProgress: false,
        syncMetrics: {
          ...prev.syncMetrics,
          totalSynced: prev.syncMetrics.totalSynced + syncedCount,
          successRate: Math.min(100, prev.syncMetrics.successRate + Math.random() * 5),
          lastSyncTime: new Date().toISOString()
        }
      }))

      if (moduleId) {
        setPendingChanges(prev => {
          const current = prev || {}
          return { ...current, [moduleId]: 0 }
        })
        toast.success(`${moduleId} module synced successfully`)
      } else {
        setPendingChanges({})
        toast.success('Full sync completed successfully')
      }
    } catch (error) {
      setSyncState(prev => ({ ...prev, syncInProgress: false }))
      toast.error('Sync failed. Please try again.')
    }
  }, [])

  // Resolve conflict
  const resolveConflict = useCallback(async (
    conflictId: string, 
    strategy: ConflictResolutionStrategy
  ) => {
    const currentConflicts = conflicts || []
    const conflict = currentConflicts.find(c => c.id === conflictId)
    if (!conflict) return

    try {
      // Simulate conflict resolution
      await new Promise(resolve => setTimeout(resolve, 1000))

      setConflicts(prev => {
        const current = prev || []
        return current.map(c => 
          c.id === conflictId ? { ...c, resolved: true } : c
        )
      })

      setSyncState(prev => ({
        ...prev,
        syncMetrics: {
          ...prev.syncMetrics,
          conflictsResolved: prev.syncMetrics.conflictsResolved + 1
        }
      }))

      toast.success(`Conflict resolved using ${strategy.strategy} strategy`)
    } catch (error) {
      toast.error('Failed to resolve conflict')
    }
  }, [conflicts, setConflicts])

  // Update sync configuration
  const updateSyncConfig = useCallback((config: ModuleSyncConfig[]) => {
    setSyncConfig(config)
    toast.success('Sync configuration updated')
  }, [setSyncConfig])

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [initializeConnection])

  // Calculate sync progress
  const syncProgress = syncState.queuedEvents.length > 0 
    ? Math.max(0, 100 - (syncState.queuedEvents.length * 10))
    : 100

  const currentConflicts = conflicts || []
  const currentPendingChanges = pendingChanges || {}

  return {
    // Connection state
    isConnected: syncState.isConnected,
    connectionQuality: syncState.connectionQuality,
    syncInProgress: syncState.syncInProgress,
    
    // Sync data
    queuedEvents: syncState.queuedEvents,
    failedEvents: syncState.failedEvents,
    conflicts: currentConflicts,
    pendingChanges: currentPendingChanges,
    syncConfig,
    syncProgress,
    
    // Metrics
    syncMetrics: syncState.syncMetrics,
    lastSyncTime: syncState.syncMetrics.lastSyncTime,
    
    // Actions
    triggerManualSync,
    resolveConflict,
    updateSyncConfig,
    
    // Utils
    getSyncStatus: (): SyncStatus => ({
      isConnected: syncState.isConnected,
      lastSync: syncState.syncMetrics.lastSyncTime,
      syncInProgress: syncState.syncInProgress,
      connectionQuality: syncState.connectionQuality,
      pendingUpdates: Object.values(currentPendingChanges).reduce((sum, count) => sum + count, 0),
      conflictCount: currentConflicts.filter(c => !c.resolved).length
    })
  }
}