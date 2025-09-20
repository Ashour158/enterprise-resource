import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Settings,
  RefreshCw
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
  address?: {
    line1?: string
    city?: string
    state?: string
    country?: string
  }
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  duplicates: number
  errors: Array<{ row: number; field: string; message: string }>
}

interface LeadImportExportProps {
  isOpen: boolean
  onClose: () => void
  onImport: (leads: Lead[]) => void
  onExport: () => Lead[]
  userRole: string
}

export function LeadImportExport({
  isOpen,
  onClose,
  onImport,
  onExport,
  userRole
}: LeadImportExportProps) {
  const [activeTab, setActiveTab] = useState('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'create'>('skip')
  const [exportFields, setExportFields] = useState<string[]>([
    'firstName', 'lastName', 'email', 'phone', 'companyName', 'jobTitle',
    'leadStatus', 'leadRating', 'leadPriority', 'leadSource', 'aiLeadScore'
  ])
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canImportExport = userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'manager'

  const leadFields = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'companyName', label: 'Company Name', required: false },
    { key: 'jobTitle', label: 'Job Title', required: false },
    { key: 'leadStatus', label: 'Lead Status', required: false },
    { key: 'leadRating', label: 'Lead Rating', required: false },
    { key: 'leadPriority', label: 'Lead Priority', required: false },
    { key: 'leadSource', label: 'Lead Source', required: false },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'companySize', label: 'Company Size', required: false },
    { key: 'annualRevenue', label: 'Annual Revenue', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'address.line1', label: 'Address Line 1', required: false },
    { key: 'address.city', label: 'City', required: false },
    { key: 'address.state', label: 'State', required: false },
    { key: 'address.country', label: 'Country', required: false }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setImportFile(file)
        // Auto-detect field mapping would go here
        detectFieldMapping(file)
      } else {
        toast.error('Please select a CSV or Excel file')
      }
    }
  }

  const detectFieldMapping = async (file: File) => {
    // Simulate field detection from CSV headers
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const mapping: Record<string, string> = {}
        
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase()
          leadFields.forEach(field => {
            if (lowerHeader.includes(field.key.toLowerCase()) || 
                lowerHeader.includes(field.label.toLowerCase().replace(' ', ''))) {
              mapping[header] = field.key
            }
          })
        })
        
        setFieldMapping(mapping)
      }
    }
    reader.readAsText(file)
  }

  const processImport = async () => {
    if (!importFile || !canImportExport) {
      toast.error('No file selected or insufficient permissions')
      return
    }

    setIsProcessing(true)
    setImportProgress(0)

    try {
      // Simulate file processing
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        const newLeads: Lead[] = []
        const errors: Array<{ row: number; field: string; message: string }> = []
        let successful = 0
        let failed = 0
        let duplicates = 0

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue
          
          setImportProgress((i / lines.length) * 100)
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const leadData: Partial<Lead> = {}

          // Map fields
          headers.forEach((header, index) => {
            const mappedField = fieldMapping[header]
            if (mappedField && values[index]) {
              if (mappedField.includes('.')) {
                const [parent, child] = mappedField.split('.')
                if (!leadData[parent as keyof Lead]) {
                  ;(leadData as any)[parent] = {}
                }
                ;(leadData as any)[parent][child] = values[index]
              } else {
                ;(leadData as any)[mappedField] = values[index]
              }
            }
          })

          // Validate required fields
          const missingFields = leadFields
            .filter(field => field.required && !leadData[field.key as keyof Lead])
            .map(field => field.label)

          if (missingFields.length > 0) {
            errors.push({
              row: i + 1,
              field: missingFields.join(', '),
              message: `Missing required fields: ${missingFields.join(', ')}`
            })
            failed++
            continue
          }

          // Create lead object
          const newLead: Lead = {
            id: `lead-${Date.now()}-${i}`,
            leadNumber: `LEAD-${new Date().getFullYear()}-${String(i).padStart(3, '0')}`,
            firstName: leadData.firstName || '',
            lastName: leadData.lastName || '',
            email: leadData.email || '',
            phone: leadData.phone,
            companyName: leadData.companyName,
            jobTitle: leadData.jobTitle,
            leadStatus: (leadData.leadStatus as any) || 'new',
            leadRating: (leadData.leadRating as any) || 'cold',
            leadPriority: (leadData.leadPriority as any) || 'medium',
            aiLeadScore: 0,
            aiConversionProbability: 0,
            aiEstimatedDealValue: 0,
            leadSource: leadData.leadSource || 'Import',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contactAttempts: 0,
            engagementScore: 0,
            tags: [],
            customFields: {},
            industry: leadData.industry,
            companySize: leadData.companySize,
            annualRevenue: leadData.annualRevenue,
            notes: leadData.notes,
            address: leadData.address
          }

          newLeads.push(newLead)
          successful++
        }

        setImportResult({
          total: lines.length - 1,
          successful,
          failed,
          duplicates,
          errors
        })

        if (newLeads.length > 0) {
          onImport(newLeads)
          toast.success(`Successfully imported ${successful} leads`)
        }
      }
      
      reader.readAsText(importFile)
    } catch (error) {
      toast.error('Error processing import file')
      console.error('Import error:', error)
    } finally {
      setIsProcessing(false)
      setImportProgress(100)
    }
  }

  const handleExport = () => {
    if (!canImportExport) {
      toast.error('Insufficient permissions to export data')
      return
    }

    const leads = onExport()
    if (leads.length === 0) {
      toast.error('No leads to export')
      return
    }

    // Create CSV content
    const headers = exportFields.map(field => {
      const fieldDef = leadFields.find(f => f.key === field)
      return fieldDef?.label || field
    })

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => 
        exportFields.map(field => {
          if (field.includes('.')) {
            const [parent, child] = field.split('.')
            return (lead as any)[parent]?.[child] || ''
          }
          return (lead as any)[field] || ''
        }).join(',')
      )
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success(`Exported ${leads.length} leads`)
  }

  const resetImport = () => {
    setImportFile(null)
    setImportResult(null)
    setImportProgress(0)
    setFieldMapping({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!canImportExport) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <XCircle size={48} className="mx-auto mb-4 text-destructive" />
            <p>You don't have permission to import or export lead data.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={20} />
            Import & Export Leads
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload size={16} />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download size={16} />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {!importResult ? (
              <>
                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {importFile ? (
                        <div className="space-y-2">
                          <FileSpreadsheet size={48} className="mx-auto text-primary" />
                          <p className="font-medium">{importFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </p>
                          <Button
                            variant="outline"
                            onClick={resetImport}
                            className="mt-2"
                          >
                            Choose Different File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={48} className="mx-auto text-muted-foreground" />
                          <p className="font-medium">Upload CSV or Excel file</p>
                          <p className="text-sm text-muted-foreground">
                            Supports .csv and .xlsx formats
                          </p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2"
                          >
                            Select File
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {importFile && (
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Supported formats:</strong> CSV, Excel (.xlsx)</p>
                        <p><strong>Required fields:</strong> First Name, Last Name, Email</p>
                        <p><strong>Max file size:</strong> 10MB</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Field Mapping */}
                {importFile && Object.keys(fieldMapping).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Field Mapping</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Map your file columns to lead fields. Required fields are marked with *.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(fieldMapping).map(fileColumn => (
                          <div key={fileColumn} className="space-y-2">
                            <Label>{fileColumn}</Label>
                            <Select
                              value={fieldMapping[fileColumn]}
                              onValueChange={(value) => 
                                setFieldMapping(prev => ({ ...prev, [fileColumn]: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Skip this column</SelectItem>
                                {leadFields.map(field => (
                                  <SelectItem key={field.key} value={field.key}>
                                    {field.label} {field.required && '*'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Import Options */}
                {importFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Import Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Duplicate Handling</Label>
                        <Select value={duplicateHandling} onValueChange={(value: any) => setDuplicateHandling(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">Skip duplicates</SelectItem>
                            <SelectItem value="update">Update existing</SelectItem>
                            <SelectItem value="create">Create anyway</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing import...</span>
                          <span>{Math.round(importProgress)}%</span>
                        </div>
                        <Progress value={importProgress} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={processImport}
                    disabled={!importFile || isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {isProcessing ? 'Processing...' : 'Import Leads'}
                  </Button>
                </div>
              </>
            ) : (
              /* Import Results */
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-500" />
                      Import Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.successful}
                        </div>
                        <div className="text-sm text-green-700">Successful</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {importResult.failed}
                        </div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {importResult.duplicates}
                        </div>
                        <div className="text-sm text-yellow-700">Duplicates</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResult.total}
                        </div>
                        <div className="text-sm text-blue-700">Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {importResult.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-yellow-500" />
                        Import Errors ({importResult.errors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="font-medium text-red-800">
                              Row {error.row}: {error.field}
                            </div>
                            <div className="text-sm text-red-600">
                              {error.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetImport}>
                    Import Another File
                  </Button>
                  <Button onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            {/* Export Fields Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Fields to Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {leadFields.map(field => (
                    <label key={field.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={exportFields.includes(field.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportFields(prev => [...prev, field.key])
                          } else {
                            setExportFields(prev => prev.filter(f => f !== field.key))
                          }
                        }}
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExportFields(leadFields.map(f => f.key))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExportFields([])}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>File Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {onExport().length} leads will be exported with {exportFields.length} fields
                </p>
                <div className="text-xs bg-muted p-3 rounded-lg font-mono">
                  {leadFields
                    .filter(f => exportFields.includes(f.key))
                    .map(f => f.label)
                    .join(', ')
                  }
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={exportFields.length === 0}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Leads
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}