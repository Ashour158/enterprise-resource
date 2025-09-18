import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { SyncStatus, DataSyncEvent, ModuleSyncConfig, SyncConflict } from '@/types/erp'
import { toast } from 'sonner'

interface UseRealTimeSyncReturn {
  syncStatus: SyncStatus
  isConnected: boolean
  lastSyncTime: string
  syncProgress: number
  conflicts: SyncConflict[]
  triggerSync: (moduleId?: string) => void
  resolveConflict: (conflictId: string, resolution: 'server' | 'client') => void
  updateSyncConfig: (config: ModuleSyncConfig) => void
}

export function useRealTimeSync(companyId: string): UseRealTimeSyncReturn {
  const defaultSyncStatus: SyncStatus = {
    isConnected: false,
    lastSync: new Date().toISOString(),
    syncInProgress: false,
    connectionQuality: 'offline',
    pendingUpdates: 0,
    conflictCount: 0
  }

  const [syncStatus, setSyncStatus] = useKV<SyncStatus>('sync-status', defaultSyncStatus)
  const [conflicts, setConflicts] = useKV<SyncConflict[]>('sync-conflicts', [])
  const [syncConfigs, setSyncConfigs] = useKV<ModuleSyncConfig[]>('sync-configs', [])
  const [syncProgress, setSyncProgress] = useState(0)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | undefined>(undefined)
  const syncIntervalRef = useRef<number | undefined>(undefined)

  // Simulate WebSocket connection for demo
  const connectWebSocket = useCallback(() => {
    // In a real implementation, this would connect to your WebSocket server
    // For demo purposes, we'll simulate the connection
    setSyncStatus((prev) => ({
      ...(prev || defaultSyncStatus),
      isConnected: true,
      connectionQuality: 'excellent'
    }))

    // Simulate periodic data updates
    const simulateUpdates = () => {
      const events: DataSyncEvent[] = [
        {
          id: `sync-${Date.now()}`,
          type: 'data_update',
          module: ['finance', 'hr', 'inventory', 'sales'][Math.floor(Math.random() * 4)],
          entity: 'transaction',
          operation: 'update',
          data: { amount: Math.floor(Math.random() * 10000) },
          timestamp: new Date().toISOString(),
          companyId
        }
      ]

      // Simulate processing updates
      setSyncStatus((prev) => ({
        ...(prev || defaultSyncStatus),
        lastSync: new Date().toISOString(),
        pendingUpdates: Math.max(0, (prev?.pendingUpdates || 0) - 1)
      }))
    }

    syncIntervalRef.current = setInterval(simulateUpdates, 3000) as unknown as number
  }, [companyId, setSyncStatus, defaultSyncStatus])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    setSyncStatus((prev) => ({
      ...(prev || defaultSyncStatus),
      isConnected: false,
      connectionQuality: 'offline'
    }))
  }, [setSyncStatus, defaultSyncStatus])

  const triggerSync = useCallback((moduleId?: string) => {
    setSyncStatus((prev) => ({ 
      ...(prev || defaultSyncStatus),
      syncInProgress: true 
    }))
    setSyncProgress(0)

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setSyncStatus((prevStatus) => ({
            ...(prevStatus || defaultSyncStatus),
            syncInProgress: false,
            lastSync: new Date().toISOString(),
            pendingUpdates: 0
          }))
          
          if (moduleId) {
            toast.success(`${moduleId} module synchronized successfully`)
          } else {
            toast.success('All modules synchronized successfully')
          }
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [setSyncStatus, defaultSyncStatus])

  const resolveConflict = useCallback((conflictId: string, resolution: 'server' | 'client') => {
    setConflicts((prev) => (prev || []).map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, resolved: true }
        : conflict
    ))
    
    setSyncStatus((prev) => ({
      ...(prev || defaultSyncStatus),
      conflictCount: Math.max(0, (prev?.conflictCount || 0) - 1)
    }))

    toast.success(`Conflict resolved using ${resolution} value`)
  }, [setConflicts, setSyncStatus, defaultSyncStatus])

  const updateSyncConfig = useCallback((config: ModuleSyncConfig) => {
    setSyncConfigs((prev) => {
      const prevConfigs = prev || []
      const existing = prevConfigs.findIndex(c => c.moduleId === config.moduleId)
      if (existing >= 0) {
        const updated = [...prevConfigs]
        updated[existing] = config
        return updated
      }
      return [...prevConfigs, config]
    })
    toast.success(`Sync settings updated for ${config.moduleId}`)
  }, [setSyncConfigs])

  // Initialize connection
  useEffect(() => {
    connectWebSocket()
    return () => {
      disconnectWebSocket()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connectWebSocket, disconnectWebSocket])

  // Simulate occasional conflicts
  useEffect(() => {
    const conflictInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of conflict
        const newConflict: SyncConflict = {
          id: `conflict-${Date.now()}`,
          module: ['finance', 'hr', 'inventory'][Math.floor(Math.random() * 3)],
          entity: 'record',
          entityId: `entity-${Math.floor(Math.random() * 1000)}`,
          field: 'value',
          serverValue: Math.floor(Math.random() * 1000),
          clientValue: Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          resolved: false
        }

        setConflicts((prev) => [...(prev || []), newConflict])
        setSyncStatus((prev) => ({
          ...(prev || defaultSyncStatus),
          conflictCount: (prev?.conflictCount || 0) + 1
        }))
      }
    }, 15000)

    return () => clearInterval(conflictInterval)
  }, [setConflicts, setSyncStatus, defaultSyncStatus])

  const currentSyncStatus = syncStatus || defaultSyncStatus
  const currentConflicts = conflicts || []

  return {
    syncStatus: currentSyncStatus,
    isConnected: currentSyncStatus.isConnected,
    lastSyncTime: currentSyncStatus.lastSync,
    syncProgress,
    conflicts: currentConflicts.filter(c => !c.resolved),
    triggerSync,
    resolveConflict,
    updateSyncConfig
  }
}