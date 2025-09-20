import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ClickableDataElement, 
  ClickableTableCell, 
  formatClickableData, 
  ClickableDataConfig 
} from '@/components/shared/ClickableDataElements'
import { FullPageDetailView, EntityData } from '@/components/shared/FullPageDetailView'
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Enhanced table column configuration
export interface ClickableTableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'currency' | 'email' | 'phone' | 'status' | 'custom'
  sortable?: boolean
  filterable?: boolean
  clickable?: boolean
  width?: number | string
  render?: (value: any, row: any, column: ClickableTableColumn) => React.ReactNode
  dataConfig?: Partial<ClickableDataConfig>
}

// Table row data interface
export interface ClickableTableRow {
  id: string
  entityType?: 'lead' | 'contact' | 'account' | 'deal' | 'quote'
  [key: string]: any
}

// Filter configuration
export interface TableFilter {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between'
  value: any
  value2?: any // For between operator
}

// Sort configuration
export interface TableSort {
  column: string
  direction: 'asc' | 'desc'
}

interface EnhancedClickableDataTableProps {
  title?: string
  description?: string
  columns: ClickableTableColumn[]
  data: ClickableTableRow[]
  companyId: string
  userId: string
  pageSize?: number
  showSearch?: boolean
  showFilters?: boolean
  showBulkActions?: boolean
  onRowClick?: (row: ClickableTableRow) => void
  onBulkAction?: (action: string, selectedRows: ClickableTableRow[]) => void
  onAction?: (action: string, data: any) => void
  className?: string
  loading?: boolean
}

export function EnhancedClickableDataTable({
  title,
  description,
  columns,
  data,
  companyId,
  userId,
  pageSize = 10,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  onRowClick,
  onBulkAction,
  onAction,
  className = '',
  loading = false
}: EnhancedClickableDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [sorts, setSorts] = useState<TableSort[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply filters
    filters.forEach(filter => {
      result = result.filter(row => {
        const value = row[filter.column]
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'contains':
            return value?.toString().toLowerCase().includes(filter.value.toLowerCase())
          case 'startsWith':
            return value?.toString().toLowerCase().startsWith(filter.value.toLowerCase())
          case 'endsWith':
            return value?.toString().toLowerCase().endsWith(filter.value.toLowerCase())
          case 'greaterThan':
            return Number(value) > Number(filter.value)
          case 'lessThan':
            return Number(value) < Number(filter.value)
          case 'between':
            return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2)
          default:
            return true
        }
      })
    })

    // Apply sorting
    sorts.forEach(sort => {
      result.sort((a, b) => {
        const aValue = a[sort.column]
        const bValue = b[sort.column]
        
        let comparison = 0
        if (aValue < bValue) comparison = -1
        if (aValue > bValue) comparison = 1
        
        return sort.direction === 'desc' ? -comparison : comparison
      })
    })

    return result
  }, [data, searchTerm, filters, sorts, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (columnKey: string) => {
    setSorts(prevSorts => {
      const existingSort = prevSorts.find(s => s.column === columnKey)
      
      if (existingSort) {
        if (existingSort.direction === 'asc') {
          return prevSorts.map(s => 
            s.column === columnKey ? { ...s, direction: 'desc' as const } : s
          )
        } else {
          return prevSorts.filter(s => s.column !== columnKey)
        }
      } else {
        return [...prevSorts, { column: columnKey, direction: 'asc' as const }]
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(row => row.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(rowId)
      } else {
        newSet.delete(rowId)
      }
      return newSet
    })
  }

  const handleBulkAction = (action: string) => {
    const selectedRowsData = data.filter(row => selectedRows.has(row.id))
    onBulkAction?.(action, selectedRowsData)
    setSelectedRows(new Set())
  }

  const handleRowClick = (row: ClickableTableRow) => {
    if (onRowClick) {
      onRowClick(row)
    } else {
      // Default behavior: open detail view
      const entityData: EntityData = {
        id: row.id,
        type: row.entityType || 'contact',
        name: row.name || row.firstName + ' ' + row.lastName || 'Unknown',
        email: row.email,
        phone: row.phone,
        company: row.company,
        jobTitle: row.jobTitle,
        status: row.status,
        value: row.value,
        tags: row.tags,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }
      setSelectedEntity(entityData)
      setShowDetailView(true)
    }
  }

  const addFilter = (column: string) => {
    setFilters(prev => [
      ...prev,
      { column, operator: 'contains', value: '' }
    ])
  }

  const updateFilter = (index: number, filter: Partial<TableFilter>) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...filter } : f))
  }

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }

  const getSortIcon = (columnKey: string) => {
    const sort = sorts.find(s => s.column === columnKey)
    if (!sort) return <ChevronsUpDown size={14} className="text-muted-foreground" />
    return sort.direction === 'asc' 
      ? <ArrowUp size={14} className="text-primary" />
      : <ArrowDown size={14} className="text-primary" />
  }

  const renderCellContent = (value: any, row: ClickableTableRow, column: ClickableTableColumn) => {
    if (column.render) {
      return column.render(value, row, column)
    }

    if (!column.clickable && column.type !== 'status') {
      return value?.toString() || ''
    }

    if (column.type === 'status') {
      return (
        <Badge variant="outline" className={getStatusVariant(value)}>
          {value}
        </Badge>
      )
    }

    // Auto-detect clickable data type
    const dataConfig = column.dataConfig || formatClickableData(value, {
      fieldName: column.key,
      entityId: row.id,
      entityType: row.entityType
    })

    return (
      <ClickableTableCell
        data={dataConfig}
        companyId={companyId}
        userId={userId}
        showQuickActions={true}
        entityData={row}
        onAction={onAction}
        onProfileView={(id, type) => handleRowClick(row)}
        onEmailCompose={(email, data) => onAction?.('email', { email, ...data })}
        onPhoneCall={(phone, data) => onAction?.('call', { phone, ...data })}
        onMapView={(address) => onAction?.('map', { address })}
        onTagFilter={(tag) => addFilter(column.key)}
        onCalendarView={(date) => onAction?.('calendar', { date })}
        onFinancialView={(amount, data) => onAction?.('financial', { amount, ...data })}
      />
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'qualified':
      case 'won':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            {showSearch && (
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {showFilters && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filters
                  {filters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              )}
              
              {showBulkActions && selectedRows.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedRows.size} selected
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                    variant="outline"
                  >
                    Export
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(index, { column: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.filter(col => col.filterable !== false).map(col => (
                          <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, { operator: value as any })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="startsWith">Starts with</SelectItem>
                        <SelectItem value="endsWith">Ends with</SelectItem>
                        <SelectItem value="greaterThan">Greater than</SelectItem>
                        <SelectItem value="lessThan">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      className="flex-1"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(columns[0]?.key)}
                  disabled={!columns.some(col => col.filterable !== false)}
                >
                  Add Filter
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {showBulkActions && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{ width: column.width }}
                      className={column.sortable !== false ? 'cursor-pointer select-none' : ''}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable !== false && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (showBulkActions ? 2 : 1)} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (showBulkActions ? 2 : 1)} className="text-center py-8">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {showBulkActions && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {renderCellContent(row[column.key], row, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(row)
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Page Detail View */}
      {showDetailView && selectedEntity && (
        <Dialog open={showDetailView} onOpenChange={setShowDetailView}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
            <FullPageDetailView
              entityData={selectedEntity}
              companyId={companyId}
              userId={userId}
              onClose={() => {
                setShowDetailView(false)
                setSelectedEntity(null)
              }}
              onUpdate={(updatedData) => {
                // Handle entity update
                toast.success(`${updatedData.type} updated successfully`)
                setSelectedEntity(updatedData)
              }}
              onAction={(action, data) => {
                onAction?.(action, data)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}