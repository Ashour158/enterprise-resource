import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  CheckSquare, 
  X, 
  Users, 
  Trash, 
  Edit, 
  Mail,
  UserCheck,
  Calendar,
  Star,
  Target,
  Activity
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  jobTitle?: string
  leadStatus: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
  leadRating: 'hot' | 'warm' | 'cold'
  leadPriority: 'high' | 'medium' | 'low'
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  leadSource: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  contactAttempts: number
  engagementScore: number
  tags: string[]
  customFields: Record<string, any>
  notes?: string
  industry?: string
  companySize?: string
  annualRevenue?: number
}

interface LeadBulkOperationsProps {
  selectedLeads: Lead[]
  isOpen: boolean
  onClose: () => void
  onBulkUpdate: (updates: Partial<Lead>) => void
  onBulkDelete: () => void
  onBulkAssign: (assigneeId: string) => void
  userRole: string
}

export function LeadBulkOperations({
  selectedLeads,
  isOpen,
  onClose,
  onBulkUpdate,
  onBulkDelete,
  onBulkAssign,
  userRole
}: LeadBulkOperationsProps) {
  const [operation, setOperation] = useState<string>('')
  const [updateData, setUpdateData] = useState<Partial<Lead>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canEdit = userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'manager'
  const canDelete = userRole === 'super_admin' || userRole === 'company_admin'

  const handleBulkUpdate = () => {
    if (Object.keys(updateData).length === 0) {
      toast.error('Please select fields to update')
      return
    }

    onBulkUpdate(updateData)
    onClose()
    setUpdateData({})
    setOperation('')
  }

  const handleBulkDelete = () => {
    if (!confirmDelete) {
      toast.error('Please confirm deletion')
      return
    }

    onBulkDelete()
    onClose()
    setConfirmDelete(false)
    setOperation('')
  }

  const handleBulkAssign = () => {
    if (!updateData.assignedTo) {
      toast.error('Please select an assignee')
      return
    }

    onBulkAssign(updateData.assignedTo)
    onClose()
    setUpdateData({})
    setOperation('')
  }

  const handleFieldChange = (field: string, value: any) => {
    setUpdateData(prev => ({ ...prev, [field]: value }))
  }

  const getLeadSummary = () => {
    const statusCounts = selectedLeads.reduce((acc, lead) => {
      acc[lead.leadStatus] = (acc[lead.leadStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const ratingCounts = selectedLeads.reduce((acc, lead) => {
      acc[lead.leadRating] = (acc[lead.leadRating] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgScore = selectedLeads.reduce((sum, lead) => sum + lead.aiLeadScore, 0) / selectedLeads.length

    return { statusCounts, ratingCounts, avgScore }
  }

  const { statusCounts, ratingCounts, avgScore } = getLeadSummary()

  const operationOptions = [
    { value: 'update-status', label: 'Update Status', icon: <Activity size={16} /> },
    { value: 'update-rating', label: 'Update Rating', icon: <Star size={16} /> },
    { value: 'update-priority', label: 'Update Priority', icon: <Target size={16} /> },
    { value: 'update-source', label: 'Update Source', icon: <Target size={16} /> },
    { value: 'assign', label: 'Assign to User', icon: <UserCheck size={16} /> },
    { value: 'add-tags', label: 'Add Tags', icon: <Target size={16} /> },
    { value: 'schedule-followup', label: 'Schedule Follow-up', icon: <Calendar size={16} /> },
    { value: 'send-email', label: 'Send Bulk Email', icon: <Mail size={16} /> },
    ...(canDelete ? [{ value: 'delete', label: 'Delete Leads', icon: <Trash size={16} /> }] : [])
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare size={20} />
            Bulk Operations ({selectedLeads.length} leads selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Selected Leads Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium mb-2">Status Distribution</div>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status}</span>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-2">Rating Distribution</div>
                {Object.entries(ratingCounts).map(([rating, count]) => (
                  <div key={rating} className="flex justify-between">
                    <span className="capitalize">{rating}</span>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-2">Metrics</div>
                <div className="flex justify-between">
                  <span>Avg AI Score</span>
                  <Badge variant="outline" className="text-xs">{Math.round(avgScore)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Value</span>
                  <Badge variant="outline" className="text-xs">
                    ${selectedLeads.reduce((sum, lead) => sum + lead.aiEstimatedDealValue, 0).toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Select Operation</Label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose bulk operation..." />
                </SelectTrigger>
                <SelectContent>
                  {operationOptions.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      <div className="flex items-center gap-2">
                        {op.icon}
                        {op.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation-specific fields */}
            {operation === 'update-status' && (
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={updateData.leadStatus || ''}
                  onValueChange={(value) => handleFieldChange('leadStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'update-rating' && (
              <div>
                <Label htmlFor="rating">New Rating</Label>
                <Select
                  value={updateData.leadRating || ''}
                  onValueChange={(value) => handleFieldChange('leadRating', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'update-priority' && (
              <div>
                <Label htmlFor="priority">New Priority</Label>
                <Select
                  value={updateData.leadPriority || ''}
                  onValueChange={(value) => handleFieldChange('leadPriority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'update-source' && (
              <div>
                <Label htmlFor="source">New Source</Label>
                <Select
                  value={updateData.leadSource || ''}
                  onValueChange={(value) => handleFieldChange('leadSource', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'assign' && (
              <div>
                <Label htmlFor="assignee">Assign to User</Label>
                <Select
                  value={updateData.assignedTo || ''}
                  onValueChange={(value) => handleFieldChange('assignedTo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user-001">John Smith (Sales Rep)</SelectItem>
                    <SelectItem value="user-002">Sarah Johnson (Sales Manager)</SelectItem>
                    <SelectItem value="user-003">Mike Wilson (Account Executive)</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'schedule-followup' && (
              <div>
                <Label htmlFor="followup">Follow-up Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={updateData.nextFollowUpDate ? new Date(updateData.nextFollowUpDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('nextFollowUpDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
            )}

            {operation === 'send-email' && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Email Campaign</h4>
                <p className="text-sm text-muted-foreground">
                  This will open the email campaign composer for the selected {selectedLeads.length} leads.
                </p>
              </div>
            )}

            {operation === 'delete' && (
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Delete Confirmation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This action will permanently delete {selectedLeads.length} leads. This cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="confirm-delete"
                    checked={confirmDelete}
                    onCheckedChange={setConfirmDelete}
                  />
                  <Label htmlFor="confirm-delete" className="text-sm">
                    I understand that this action cannot be undone
                  </Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {operation && operation !== 'delete' && operation !== 'send-email' && (
              <Button 
                onClick={operation === 'assign' ? handleBulkAssign : handleBulkUpdate}
                disabled={!canEdit}
              >
                {operation === 'assign' ? 'Assign Leads' : 'Update Leads'}
              </Button>
            )}
            {operation === 'send-email' && (
              <Button onClick={() => toast.info('Email campaign composer would open here')}>
                Open Email Composer
              </Button>
            )}
            {operation === 'delete' && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={!canDelete || !confirmDelete}
              >
                Delete {selectedLeads.length} Leads
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}