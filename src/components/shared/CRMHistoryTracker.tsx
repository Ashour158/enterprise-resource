import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  User, 
  Pencil as Edit, 
  Trash, 
  Plus, 
  Phone, 
  EnvelopeSimple as Mail, 
  Calendar, 
  File,
  Target,
  Receipt,
  ChartBar,
  Activity,
  Eye
} from '@phosphor-icons/react'

export interface CRMHistoryEntry {
  id: string
  timestamp: string
  entityType: 'lead' | 'contact' | 'account' | 'deal' | 'quote' | 'activity' | 'forecast'
  entityId: string
  entityName: string
  action: 'created' | 'updated' | 'deleted' | 'converted' | 'status_changed' | 'assigned' | 'completed'
  description: string
  userId: string
  userName: string
  previousValue?: any
  newValue?: any
  metadata: {
    companyId: string
    fieldChanged?: string
    oldStatus?: string
    newStatus?: string
    relatedEntities?: Array<{
      type: string
      id: string
      name: string
    }>
  }
}

interface CRMHistoryTrackerProps {
  entityType?: 'lead' | 'contact' | 'account' | 'deal' | 'quote' | 'activity' | 'forecast'
  entityId?: string
  companyId: string
  userId: string
  showFilters?: boolean
  maxEntries?: number
  compact?: boolean
}

export function CRMHistoryTracker({
  entityType,
  entityId,
  companyId,
  userId,
  showFilters = true,
  maxEntries = 50,
  compact = false
}: CRMHistoryTrackerProps) {
  const [history, setHistory] = useKV<CRMHistoryEntry[]>(`crm-history-${companyId}`, [])
  const [filteredHistory, setFilteredHistory] = useState<CRMHistoryEntry[]>([])
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all')

  // Filter history based on props and filters
  useEffect(() => {
    let filtered = history || []

    // Filter by entity if specified
    if (entityType && entityId) {
      filtered = filtered.filter(entry => 
        entry.entityType === entityType && entry.entityId === entityId
      )
    }

    // Apply additional filters
    if (selectedAction !== 'all') {
      filtered = filtered.filter(entry => entry.action === selectedAction)
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(entry => entry.userId === selectedUser)
    }

    if (selectedTimeRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (selectedTimeRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoff.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoff.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= cutoff
      )
    }

    // Sort by timestamp (newest first) and limit
    filtered = filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxEntries)

    setFilteredHistory(filtered)
  }, [history, entityType, entityId, selectedAction, selectedUser, selectedTimeRange, maxEntries])

  // Function to add new history entry
  const addHistoryEntry = (entry: Omit<CRMHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: CRMHistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    }
    
    setHistory(prev => [newEntry, ...(prev || [])])
  }

  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'lead': return <User size={16} className="text-blue-500" />
      case 'contact': return <User size={16} className="text-green-500" />
      case 'account': return <User size={16} className="text-purple-500" />
      case 'deal': return <Target size={16} className="text-orange-500" />
      case 'quote': return <Receipt size={16} className="text-yellow-500" />
      case 'activity': return <Calendar size={16} className="text-red-500" />
      case 'forecast': return <ChartBar size={16} className="text-indigo-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  // Get icon for action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus size={16} className="text-green-500" />
      case 'updated': return <Edit size={16} className="text-blue-500" />
      case 'deleted': return <Trash size={16} className="text-red-500" />
      case 'converted': return <Target size={16} className="text-purple-500" />
      case 'status_changed': return <Activity size={16} className="text-orange-500" />
      case 'assigned': return <User size={16} className="text-yellow-500" />
      case 'completed': return <Activity size={16} className="text-green-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  // Get color for action type
  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800 border-green-200'
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deleted': return 'bg-red-100 text-red-800 border-red-200'
      case 'converted': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'status_changed': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get unique users from history
  const getUniqueUsers = () => {
    const users = new Set((history || []).map(entry => entry.userId))
    return Array.from(users).map(userId => {
      const entry = (history || []).find(h => h.userId === userId)
      return { id: userId, name: entry?.userName || 'Unknown User' }
    })
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Recent Activity</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredHistory.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
              {getActionIcon(entry.action)}
              <span className="flex-1 truncate">
                {entry.description}
              </span>
              <span className="text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <p className="text-muted-foreground text-xs py-4 text-center">
              No activity recorded yet
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          CRM Activity History
          {filteredHistory.length > 0 && (
            <Badge variant="outline">{filteredHistory.length} entries</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showFilters && (
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Action Type</label>
                  <select 
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                    <option value="converted">Converted</option>
                    <option value="status_changed">Status Changed</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">User</label>
                  <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All Users</option>
                    {getUniqueUsers().map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Time Range</label>
                  <select 
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-2">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-2 mt-1">
                      {getEntityIcon(entry.entityType)}
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getActionColor(entry.action)}`}>
                          {entry.action.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {entry.entityType}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{entry.entityName}</p>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {entry.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Show related entities if any */}
                      {entry.metadata.relatedEntities && entry.metadata.relatedEntities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Related:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.metadata.relatedEntities.map((related, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {related.type}: {related.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show value changes for updates */}
                      {entry.action === 'updated' && entry.previousValue && entry.newValue && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                          <p className="font-medium">Changed {entry.metadata.fieldChanged}:</p>
                          <p className="text-red-600">From: {JSON.stringify(entry.previousValue)}</p>
                          <p className="text-green-600">To: {JSON.stringify(entry.newValue)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredHistory.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity matches your filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              {/* Activity summary charts would go here */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['created', 'updated', 'deleted', 'completed'].map(action => {
                  const count = filteredHistory.filter(entry => entry.action === action).length
                  return (
                    <div key={action} className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {action.replace('_', ' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// Export function to add history entries from other components
export function useCRMHistory(companyId: string, userId: string, userName: string) {
  const [history, setHistory] = useKV<CRMHistoryEntry[]>(`crm-history-${companyId}`, [])

  const addEntry = (entry: Omit<CRMHistoryEntry, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    const newEntry: CRMHistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ...entry,
      metadata: {
        ...entry.metadata,
        companyId
      }
    }
    
    setHistory(prev => [newEntry, ...(prev || [])])
  }

  return { addEntry, history }
}