import React, { useState } from 'react'
import { BulkLeadOperation, Lead } from '@/types/lead'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Edit, 
  Trash,
  Tag,
  UserCheck,
  Mail,
  FileSpreadsheet,
  RefreshCw
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BulkLeadOperationsProps {
  leads: Lead[]
  selectedLeads: string[]
  onBulkOperation: (operation: BulkLeadOperation) => Promise<void>
  onLeadsUpdate: (leads: Lead[]) => void
  companyId: string
  userId: string
  isLoading: boolean
}

export function BulkLeadOperations({ 
  leads, 
  selectedLeads, 
  onBulkOperation, 
  onLeadsUpdate,
  companyId, 
  userId,
  isLoading 
}: BulkLeadOperationsProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [importResults, setImportResults] = useState<any>(null)
  
  const [bulkUpdateData, setBulkUpdateData] = useState({
    lead_status: '',
    lead_rating: '',
    assigned_to: '',
    tags: '',
    notes: ''
  })

  // Handle file import
  const handleFileImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    setImportStatus('processing')
    setImportProgress(0)

    try {
      // Simulate file processing with progress
      const interval = setInterval(() => {
        setImportProgress(prev => {
          const next = prev + 10
          if (next >= 100) {
            clearInterval(interval)
            return 100
          }
          return next
        })
      }, 500)

      // Process the file (in a real app, this would be sent to your backend)
      const fileContent = await importFile.text()
      const lines = fileContent.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      const newLeads: Lead[] = []
      const errors: string[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length !== headers.length) continue
        
        try {
          const leadData: any = {}
          headers.forEach((header, index) => {
            leadData[header] = values[index]
          })
          
          // Validate required fields
          if (!leadData.first_name || !leadData.last_name || !leadData.email) {
            errors.push(`Row ${i + 1}: Missing required fields`)
            continue
          }
          
          const newLead: Lead = {
            id: `lead-import-${Date.now()}-${i}`,
            company_id: companyId,
            lead_number: `LEAD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
            first_name: leadData.first_name,
            last_name: leadData.last_name,
            full_name: `${leadData.first_name} ${leadData.last_name}`,
            email: leadData.email,
            phone: leadData.phone || '',
            job_title: leadData.job_title || '',
            company_name: leadData.company_name || '',
            industry: leadData.industry || '',
            lead_status: 'new',
            lead_rating: 'cold',
            lead_priority: 'medium',
            ai_lead_score: 0,
            contact_attempts: 0,
            email_opens: 0,
            email_clicks: 0,
            website_visits: 0,
            engagement_score: 0,
            created_by: userId,
            converted_to_customer: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            custom_fields: {},
            tags: []
          }
          
          newLeads.push(newLead)
        } catch (error) {
          errors.push(`Row ${i + 1}: Invalid data format`)
        }
      }
      
      // Update leads list
      onLeadsUpdate([...leads, ...newLeads])
      
      setImportResults({
        total_records: lines.length - 1,
        successful_imports: newLeads.length,
        failed_imports: errors.length,
        errors
      })
      
      setImportStatus('completed')
      toast.success(`Successfully imported ${newLeads.length} leads`)
      
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus('error')
      toast.error('Failed to import leads')
    }
  }

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to update')
      return
    }

    const updateData: any = {}
    if (bulkUpdateData.lead_status) updateData.lead_status = bulkUpdateData.lead_status
    if (bulkUpdateData.lead_rating) updateData.lead_rating = bulkUpdateData.lead_rating
    if (bulkUpdateData.assigned_to) updateData.assigned_to = bulkUpdateData.assigned_to
    if (bulkUpdateData.tags) {
      updateData.tags = bulkUpdateData.tags.split(',').map(t => t.trim())
    }
    if (bulkUpdateData.notes) updateData.notes = bulkUpdateData.notes

    if (Object.keys(updateData).length === 0) {
      toast.error('Please specify fields to update')
      return
    }

    const operation: BulkLeadOperation = {
      operation_type: 'update',
      lead_ids: selectedLeads,
      operation_data: updateData,
      progress: 0,
      status: 'pending'
    }

    await onBulkOperation(operation)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`)) {
      return
    }

    const operation: BulkLeadOperation = {
      operation_type: 'delete',
      lead_ids: selectedLeads,
      operation_data: {},
      progress: 0,
      status: 'pending'
    }

    await onBulkOperation(operation)
  }

  // Export leads to CSV
  const handleExportLeads = () => {
    const selectedLeadData = leads.filter(lead => 
      selectedLeads.length > 0 ? selectedLeads.includes(lead.id) : true
    )

    if (selectedLeadData.length === 0) {
      toast.error('No leads to export')
      return
    }

    const headers = [
      'first_name', 'last_name', 'email', 'phone', 'job_title',
      'company_name', 'industry', 'company_size', 'lead_status',
      'lead_rating', 'ai_lead_score', 'created_at'
    ]

    const csvContent = [
      headers.join(','),
      ...selectedLeadData.map(lead => 
        headers.map(header => {
          const value = (lead as any)[header] || ''
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${selectedLeadData.length} leads`)
  }

  // Generate sample CSV template
  const downloadTemplate = () => {
    const headers = [
      'first_name', 'last_name', 'email', 'phone', 'job_title',
      'company_name', 'industry', 'company_size'
    ]
    
    const sampleData = [
      'John,Doe,john.doe@example.com,555-1234,VP Sales,Tech Corp,Technology,201-1000',
      'Jane,Smith,jane.smith@example.com,555-5678,Marketing Director,Growth Inc,Marketing,51-200'
    ]

    const csvContent = [headers.join(','), ...sampleData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lead-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Template downloaded')
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <div className="text-blue-600">
                <Users size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedLeads.length}</p>
              </div>
              <div className="text-purple-600">
                <CheckCircle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {leads.filter(lead => {
                    const createdDate = new Date(lead.created_at)
                    const now = new Date()
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="text-green-600">
                <Upload size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">
                  {leads.length > 0 
                    ? (leads.reduce((sum, lead) => sum + lead.ai_lead_score, 0) / leads.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
              <div className="text-yellow-600">
                <RefreshCw size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload size={16} />
              Import Leads
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download size={16} />
              Export Leads
            </TabsTrigger>
            <TabsTrigger value="bulk-update" className="flex items-center gap-2">
              <Edit size={16} />
              Bulk Update
            </TabsTrigger>
            <TabsTrigger value="bulk-actions" className="flex items-center gap-2">
              <Users size={16} />
              Bulk Actions
            </TabsTrigger>
          </TabsList>

          {selectedLeads.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <CheckCircle size={14} />
              {selectedLeads.length} leads selected
            </Badge>
          )}
        </div>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Import Leads from CSV/Excel
              </CardTitle>
              <CardDescription>
                Upload a CSV or Excel file to import multiple leads at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Upload Lead Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a CSV or Excel file containing lead information
                    </p>
                  </div>
                  
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="max-w-sm mx-auto"
                  />
                  
                  {importFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={handleFileImport}
                      disabled={!importFile || importStatus === 'processing'}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {importStatus === 'processing' ? 'Processing...' : 'Import Leads'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {importStatus === 'processing' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Processing import...</span>
                        <span className="text-sm text-muted-foreground">{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {importStatus === 'completed' && importResults && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Import Completed</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {importResults.successful_imports}
                          </div>
                          <div className="text-sm text-green-700">Successfully Imported</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {importResults.failed_imports}
                          </div>
                          <div className="text-sm text-red-700">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {importResults.total_records}
                          </div>
                          <div className="text-sm text-blue-700">Total Records</div>
                        </div>
                      </div>

                      {importResults.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Import Errors:</h4>
                          <div className="bg-red-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                            {importResults.errors.map((error: string, index: number) => (
                              <div key={index} className="text-sm text-red-700">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {importStatus === 'error' && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle size={20} />
                      <span className="font-semibold">Import Failed</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      There was an error processing your file. Please check the format and try again.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download size={20} />
                Export Lead Data
              </CardTitle>
              <CardDescription>
                Export lead data to CSV format for analysis or backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 border border-border rounded-lg">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Export Options</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedLeads.length > 0 
                    ? `Export ${selectedLeads.length} selected leads`
                    : `Export all ${leads.length} leads`
                  }
                </p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleExportLeads}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export to CSV
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    Exported file will include: Name, Email, Phone, Company, Status, Score, and more
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-update" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit size={20} />
                Bulk Update Selected Leads
              </CardTitle>
              <CardDescription>
                Update multiple lead fields at once for selected leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedLeads.length === 0 ? (
                <div className="text-center p-8 border border-border rounded-lg">
                  <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Leads Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to the Lead Overview and select leads to perform bulk updates
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">
                        {selectedLeads.length} leads selected for update
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bulkStatus">Status</Label>
                      <Select 
                        value={bulkUpdateData.lead_status} 
                        onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, lead_status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No change</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="unqualified">Unqualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bulkRating">Rating</Label>
                      <Select 
                        value={bulkUpdateData.lead_rating} 
                        onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, lead_rating: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select new rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No change</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bulkAssigned">Assign To</Label>
                      <Select 
                        value={bulkUpdateData.assigned_to} 
                        onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, assigned_to: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No change</SelectItem>
                          <SelectItem value="user-001">John Smith</SelectItem>
                          <SelectItem value="user-002">Sarah Johnson</SelectItem>
                          <SelectItem value="user-003">Mike Davis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bulkTags">Tags (comma-separated)</Label>
                      <Input
                        id="bulkTags"
                        value={bulkUpdateData.tags}
                        onChange={(e) => setBulkUpdateData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., enterprise, priority, follow-up"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bulkNotes">Add Notes</Label>
                    <Textarea
                      id="bulkNotes"
                      value={bulkUpdateData.notes}
                      onChange={(e) => setBulkUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes to all selected leads..."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleBulkUpdate}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2"
                  >
                    <Edit size={16} />
                    {isLoading ? 'Updating...' : `Update ${selectedLeads.length} Leads`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Bulk Actions
              </CardTitle>
              <CardDescription>
                Perform actions on multiple leads simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedLeads.length === 0 ? (
                <div className="text-center p-8 border border-border rounded-lg">
                  <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Leads Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to the Lead Overview and select leads to perform bulk actions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">
                        {selectedLeads.length} leads selected
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => {
                        // Handle bulk assignment
                        toast.info(`Assigning ${selectedLeads.length} leads...`)
                      }}
                    >
                      <UserCheck size={24} />
                      <span>Bulk Assign</span>
                    </Button>

                    <Button 
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => {
                        // Handle bulk tagging
                        toast.info(`Adding tags to ${selectedLeads.length} leads...`)
                      }}
                    >
                      <Tag size={24} />
                      <span>Add Tags</span>
                    </Button>

                    <Button 
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => {
                        // Handle bulk email
                        toast.info(`Sending email to ${selectedLeads.length} leads...`)
                      }}
                    >
                      <Mail size={24} />
                      <span>Send Email</span>
                    </Button>

                    <Button 
                      variant="destructive"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={handleBulkDelete}
                      disabled={isLoading}
                    >
                      <Trash size={24} />
                      <span>{isLoading ? 'Deleting...' : 'Delete Leads'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}