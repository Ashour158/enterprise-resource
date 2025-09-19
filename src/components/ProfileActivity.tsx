import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileChangeLog } from '@/types/erp'
import { 
  Clock, 
  Download, 
  MagnifyingGlass, 
  Funnel,
  User,
  Eye,
  PencilSimple,
  Trash,
  Key,
  Building
} from '@phosphor-icons/react'

interface ProfileActivityProps {
  changeLog: ProfileChangeLog[]
  onExport: (format: 'json' | 'csv') => Promise<void>
  isExporting: boolean
}

export function ProfileActivity({ changeLog, onExport, isExporting }: ProfileActivityProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterField, setFilterField] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort the change log
  const filteredChanges = changeLog.filter(change => {
    const matchesSearch = searchTerm === '' || 
      change.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.change_reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(change.new_value).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterField === 'all' || change.field.includes(filterField)
    
    return matchesSearch && matchesFilter
  })

  const sortedChanges = [...filteredChanges].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  // Pagination
  const totalPages = Math.ceil(sortedChanges.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedChanges = sortedChanges.slice(startIndex, startIndex + itemsPerPage)

  const getFieldIcon = (field: string) => {
    if (field.startsWith('preferences')) return <Eye size={16} />
    if (field.includes('password') || field.includes('mfa')) return <Key size={16} />
    if (field.includes('company')) return <Building size={16} />
    if (field.includes('profile') || field.includes('name') || field.includes('email')) return <User size={16} />
    return <PencilSimple size={16} />
  }

  const getChangeTypeColor = (field: string) => {
    if (field.includes('security') || field.includes('mfa') || field.includes('password')) {
      return 'destructive'
    }
    if (field.includes('preferences')) {
      return 'secondary'
    }
    if (field.includes('profile')) {
      return 'default'
    }
    return 'outline'
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...'
    }
    return String(value)
  }

  const getActivitySummary = () => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayChanges = changeLog.filter(c => new Date(c.timestamp) >= new Date(today.toDateString()))
    const weekChanges = changeLog.filter(c => new Date(c.timestamp) >= lastWeek)
    const monthChanges = changeLog.filter(c => new Date(c.timestamp) >= lastMonth)

    return {
      today: todayChanges.length,
      week: weekChanges.length,
      month: monthChanges.length,
      total: changeLog.length
    }
  }

  const summary = getActivitySummary()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{summary.today}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{summary.week}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{summary.month}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Changes</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Activity Log
          </CardTitle>
          <CardDescription>
            Track all changes made to your profile and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterField} onValueChange={setFilterField}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="preferences">Preferences</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="mfa">MFA</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => onExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3">
            {paginatedChanges.length > 0 ? (
              paginatedChanges.map((change) => (
                <div key={change.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getFieldIcon(change.field)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getChangeTypeColor(change.field) as any}>
                            {change.field}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(change.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {change.change_reason && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {change.change_reason}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Old Value:</p>
                            <div className="bg-muted p-2 rounded border-l-2 border-l-red-500">
                              <code className="text-xs">
                                {formatValue(change.old_value)}
                              </code>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">New Value:</p>
                            <div className="bg-muted p-2 rounded border-l-2 border-l-green-500">
                              <code className="text-xs">
                                {formatValue(change.new_value)}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterField !== 'all' 
                    ? 'No activity found matching your filters'
                    : 'No activity to display'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  per page
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}