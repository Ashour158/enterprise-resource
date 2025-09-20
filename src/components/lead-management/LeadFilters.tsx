import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from '@phosphor-icons/react'

interface LeadFiltersProps {
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  leadSources: string[]
}

export function LeadFilters({ filters, onFiltersChange, leadSources }: LeadFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters }
    if (value === undefined || value === '' || value === 'all') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFilterCount} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="rating-filter">Rating</Label>
          <Select
            value={filters.rating || 'all'}
            onValueChange={(value) => updateFilter('rating', value)}
          >
            <SelectTrigger id="rating-filter">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="source-filter">Lead Source</Label>
          <Select
            value={filters.source || 'all'}
            onValueChange={(value) => updateFilter('source', value)}
          >
            <SelectTrigger id="source-filter">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {leadSources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Filter */}
        <div className="space-y-2">
          <Label htmlFor="assigned-filter">Assignment</Label>
          <Select
            value={filters.assigned || 'all'}
            onValueChange={(value) => updateFilter('assigned', value)}
          >
            <SelectTrigger id="assigned-filter">
              <SelectValue placeholder="All assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="me">Assigned to Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="team">My Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Score Range Filter */}
      <div className="space-y-2">
        <Label>Minimum AI Score: {filters.minScore || 0}</Label>
        <Slider
          value={[filters.minScore || 0]}
          onValueChange={(value) => updateFilter('minScore', value[0])}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="created-after">Created After</Label>
          <Input
            id="created-after"
            type="date"
            value={filters.createdAfter || ''}
            onChange={(e) => updateFilter('createdAfter', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="created-before">Created Before</Label>
          <Input
            id="created-before"
            type="date"
            value={filters.createdBefore || ''}
            onChange={(e) => updateFilter('createdBefore', e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="pt-4 border-t">
        <h5 className="font-medium mb-3 text-sm">Advanced Filters</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry-filter">Industry</Label>
            <Select
              value={filters.industry || 'all'}
              onValueChange={(value) => updateFilter('industry', value)}
            >
              <SelectTrigger id="industry-filter">
                <SelectValue placeholder="All industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-size-filter">Company Size</Label>
            <Select
              value={filters.companySize || 'all'}
              onValueChange={(value) => updateFilter('companySize', value)}
            >
              <SelectTrigger id="company-size-filter">
                <SelectValue placeholder="All sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority-filter">Priority</Label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => updateFilter('priority', value)}
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick Filter Checkboxes */}
      <div className="pt-4 border-t">
        <h5 className="font-medium mb-3 text-sm">Quick Filters</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={filters.hasFollowUp || false}
              onCheckedChange={(checked) => updateFilter('hasFollowUp', checked)}
            />
            <span>Has Follow-up</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={filters.noActivity || false}
              onCheckedChange={(checked) => updateFilter('noActivity', checked)}
            />
            <span>No Recent Activity</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={filters.highValue || false}
              onCheckedChange={(checked) => updateFilter('highValue', checked)}
            />
            <span>High Value (&gt;$50k)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={filters.overdue || false}
              onCheckedChange={(checked) => updateFilter('overdue', checked)}
            />
            <span>Overdue Follow-up</span>
          </label>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-medium mb-3 text-sm">Active Filters</h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                <span className="capitalize">
                  {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </span>
                <button
                  onClick={() => updateFilter(key, undefined)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}