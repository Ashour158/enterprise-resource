import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Download,
  Upload,
  File,
  CheckCircle,
  XCircle,
  Warning,
  FileText as FileSpreadsheet,
  FileCsv,
  Database,
  Calendar,
  Users,
  Buildings,
  Target,
  Receipt,
  Phone,
  ChartBar,
  ArrowDown,
  ArrowUp
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ImportExportData {
  leads: any[]
  contacts: any[]
  accounts: any[]
  deals: any[]
  quotes: any[]
  activities: any[]
  forecasts: any[]
  attachments: any[]
}

interface ImportJob {
  id: string
  type: 'import' | 'export'
  format: 'csv' | 'xlsx' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRecords: number
  processedRecords: number
  errorCount: number
  startTime: string
  endTime?: string
  fileName: string
  dataTypes: string[]
  errors: string[]
  summary: {
    created: number
    updated: number
    skipped: number
    failed: number
  }
}

interface CRMImportExportSystemProps {
  companyId: string
  userId: string
  userRole: string
  onClose?: () => void
}

export function CRMImportExportSystem({ companyId, userId, userRole, onClose }: CRMImportExportSystemProps) {
  const [jobs, setJobs] = useKV<ImportJob[]>(`import-export-jobs-${companyId}`, [])
  const [activeTab, setActiveTab] = useState('export')
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['leads', 'contacts'])
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv')
  const [importFormat, setImportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv')
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [dateRange, setDateRange] = useState('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mappingConfig, setMappingConfig] = useState<Record<string, string>>({})

  const dataTypeOptions = [
    { value: 'leads', label: 'Leads', icon: <Users size={16} />, description: 'Lead records and qualification data' },
    { value: 'contacts', label: 'Contacts', icon: <Users size={16} />, description: 'Contact information and relationships' },
    { value: 'accounts', label: 'Accounts', icon: <Buildings size={16} />, description: 'Company and account records' },
    { value: 'deals', label: 'Deals', icon: <Target size={16} />, description: 'Sales opportunities and pipeline data' },
    { value: 'quotes', label: 'Quotes', icon: <Receipt size={16} />, description: 'Quotes and pricing information' },
    { value: 'activities', label: 'Activities', icon: <Calendar size={16} />, description: 'Tasks, calls, meetings, and events' },
    { value: 'forecasts', label: 'Forecasts', icon: <ChartBar size={16} />, description: 'Sales forecasting data' },
    { value: 'attachments', label: 'Attachments', icon: <File size={16} />, description: 'File attachments and documents' }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FileCsv size={16} />, description: 'Comma-separated values file' },
    { value: 'xlsx', label: 'Excel', icon: <FileSpreadsheet size={16} />, description: 'Microsoft Excel spreadsheet' },
    { value: 'json', label: 'JSON', icon: <Database size={16} />, description: 'JavaScript Object Notation' }
  ]

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last_30', label: 'Last 30 Days' },
    { value: 'last_90', label: 'Last 90 Days' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  // Simulate data export
  const handleExport = async () => {
    if (selectedDataTypes.length === 0) {
      toast.error('Please select at least one data type to export')
      return
    }

    setIsProcessing(true)

    const newJob: ImportJob = {
      id: `export-${Date.now()}`,
      type: 'export',
      format: exportFormat,
      status: 'processing',
      progress: 0,
      totalRecords: 1000, // Simulated
      processedRecords: 0,
      errorCount: 0,
      startTime: new Date().toISOString(),
      fileName: `crm-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`,
      dataTypes: selectedDataTypes,
      errors: [],
      summary: {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0
      }
    }

    setJobs(prev => [newJob, ...(prev || [])])

    // Simulate export progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        
        setJobs(prev => (prev || []).map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                status: 'completed',
                progress: 100,
                processedRecords: job.totalRecords,
                endTime: new Date().toISOString(),
                summary: {
                  created: 0,
                  updated: 0,
                  skipped: 0,
                  failed: 0
                }
              }
            : job
        ))
        
        setIsProcessing(false)
        toast.success('Export completed successfully!')
        
        // Simulate file download
        const blob = new Blob(['Simulated CRM export data'], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = newJob.fileName
        a.click()
      } else {
        setJobs(prev => (prev || []).map(job => 
          job.id === newJob.id 
            ? { ...job, progress, processedRecords: Math.floor((progress / 100) * job.totalRecords) }
            : job
        ))
      }
    }, 500)
  }

  // Simulate data import
  const handleImport = async (file: File) => {
    if (!file) {
      toast.error('Please select a file to import')
      return
    }

    setIsProcessing(true)

    const newJob: ImportJob = {
      id: `import-${Date.now()}`,
      type: 'import',
      format: importFormat,
      status: 'processing',
      progress: 0,
      totalRecords: 500, // Simulated based on file
      processedRecords: 0,
      errorCount: 0,
      startTime: new Date().toISOString(),
      fileName: file.name,
      dataTypes: ['leads', 'contacts'], // Would be detected from file
      errors: [],
      summary: {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0
      }
    }

    setJobs(prev => [newJob, ...(prev || [])])

    // Simulate import progress with some errors
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        
        const summary = {
          created: 245,
          updated: 123,
          skipped: 89,
          failed: 43
        }
        
        setJobs(prev => (prev || []).map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                status: summary.failed > 0 ? 'completed' : 'completed',
                progress: 100,
                processedRecords: job.totalRecords,
                errorCount: summary.failed,
                endTime: new Date().toISOString(),
                summary,
                errors: summary.failed > 0 ? [
                  'Row 45: Invalid email format for contact',
                  'Row 128: Missing required field "company_name"',
                  'Row 267: Duplicate phone number detected'
                ] : []
              }
            : job
        ))
        
        setIsProcessing(false)
        toast.success(`Import completed! ${summary.created} created, ${summary.updated} updated, ${summary.failed} failed`)
      } else {
        setJobs(prev => (prev || []).map(job => 
          job.id === newJob.id 
            ? { ...job, progress, processedRecords: Math.floor((progress / 100) * job.totalRecords) }
            : job
        ))
      }
    }, 800)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'failed':
        return <XCircle size={16} className="text-red-500" />
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <Warning size={16} className="text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            CRM Data Import/Export System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <ArrowUp size={16} />
                Export Data
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <ArrowDown size={16} />
                Import Data
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar size={16} />
                Job History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Data Types to Export</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {dataTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={option.value}
                            checked={selectedDataTypes.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDataTypes(prev => [...prev, option.value])
                              } else {
                                setSelectedDataTypes(prev => prev.filter(type => type !== option.value))
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {option.icon}
                            <div>
                              <Label htmlFor={option.value} className="font-medium cursor-pointer">
                                {option.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="include-attachments"
                      checked={includeAttachments}
                      onCheckedChange={(checked) => setIncludeAttachments(checked === true)}
                    />
                    <Label htmlFor="include-attachments">Include file attachments in export</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Export Format</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {formatOptions.map((format) => (
                        <div 
                          key={format.value}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            exportFormat === format.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setExportFormat(format.value as any)}
                        >
                          {format.icon}
                          <div>
                            <p className="font-medium">{format.label}</p>
                            <p className="text-xs text-muted-foreground">{format.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleExport} 
                    disabled={isProcessing || selectedDataTypes.length === 0}
                    className="w-full"
                  >
                    <Download size={16} className="mr-2" />
                    {isProcessing ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Import Format</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {formatOptions.map((format) => (
                        <div 
                          key={format.value}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            importFormat === format.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setImportFormat(format.value as any)}
                        >
                          {format.icon}
                          <div>
                            <p className="font-medium">{format.label}</p>
                            <p className="text-xs text-muted-foreground">{format.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="file-upload">Select File to Import</Label>
                    <input
                      id="file-upload"
                      type="file"
                      accept={`.${importFormat}`}
                      onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                      className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Import Options</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox id="update-existing" defaultChecked />
                        <Label htmlFor="update-existing">Update existing records</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox id="create-new" defaultChecked />
                        <Label htmlFor="create-new">Create new records</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox id="validate-data" defaultChecked />
                        <Label htmlFor="validate-data">Validate data before import</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox id="send-notifications" />
                        <Label htmlFor="send-notifications">Send import notifications</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="import-notes">Import Notes</Label>
                    <Textarea 
                      id="import-notes"
                      placeholder="Add notes about this import..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                {(jobs || []).length > 0 ? (
                  (jobs || []).map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <p className="font-medium">{job.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                {job.type} • {job.format.toUpperCase()} • {job.dataTypes.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(job.status)}
                            <Button size="sm" variant="outline">
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {job.status === 'processing' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{job.processedRecords}/{job.totalRecords} records</span>
                            </div>
                            <Progress value={job.progress} />
                          </div>
                        )}

                        {job.status === 'completed' && job.type === 'import' && (
                          <div className="grid grid-cols-4 gap-4 mt-3">
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{job.summary.created}</p>
                              <p className="text-xs text-muted-foreground">Created</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-600">{job.summary.updated}</p>
                              <p className="text-xs text-muted-foreground">Updated</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-yellow-600">{job.summary.skipped}</p>
                              <p className="text-xs text-muted-foreground">Skipped</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-red-600">{job.summary.failed}</p>
                              <p className="text-xs text-muted-foreground">Failed</p>
                            </div>
                          </div>
                        )}

                        {job.errors.length > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="mt-3">
                                <Warning size={14} className="mr-1" />
                                View {job.errors.length} Errors
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Import Errors</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {job.errors.map((error, index) => (
                                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(job.startTime).toLocaleString()}
                          </p>
                          {job.endTime && (
                            <p className="text-xs text-muted-foreground">
                              Completed: {new Date(job.endTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Database size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No import/export jobs yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}