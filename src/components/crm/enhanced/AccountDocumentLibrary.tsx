import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { CRMFile } from '@/types/crm'
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Trash,
  MagnifyingGlass as Search,
  Paperclip,
  Image as ImageIcon,
  VideoCamera as Video,
  Headphones as Audio,
  Archive,
  Star,
  StarFill,
  Share,
  Plus
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface AccountDocumentLibraryProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
}

export function AccountDocumentLibrary({
  accountId,
  companyId,
  userId,
  userRole
}: AccountDocumentLibraryProps) {
  const [documents, setDocuments] = useKV<CRMFile[]>(`account-documents-${accountId}`, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Generate mock documents on first load
  useEffect(() => {
    if (documents.length === 0) {
      const mockDocuments = generateMockDocuments(accountId)
      setDocuments(mockDocuments)
    }
  }, [accountId, documents.length, setDocuments])

  const generateMockDocuments = (accountId: string): CRMFile[] => {
    const documentTypes = [
      { name: 'Contract_Agreement_2024.pdf', type: 'application/pdf', category: 'contract' },
      { name: 'Product_Presentation.pptx', type: 'application/vnd.ms-powerpoint', category: 'presentation' },
      { name: 'Technical_Specifications.docx', type: 'application/msword', category: 'specification' },
      { name: 'Invoice_Q1_2024.pdf', type: 'application/pdf', category: 'invoice' },
      { name: 'Implementation_Plan.xlsx', type: 'application/vnd.ms-excel', category: 'planning' },
      { name: 'Demo_Recording.mp4', type: 'video/mp4', category: 'recording' },
      { name: 'Meeting_Notes_Jan.docx', type: 'application/msword', category: 'notes' },
      { name: 'Price_Quote_2024.pdf', type: 'application/pdf', category: 'quote' },
      { name: 'Project_Timeline.png', type: 'image/png', category: 'image' },
      { name: 'Requirements_Document.pdf', type: 'application/pdf', category: 'requirement' }
    ]

    return documentTypes.map((doc, i) => ({
      id: `doc_${accountId}_${i}`,
      name: doc.name,
      type: doc.type,
      size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
      url: `/documents/${accountId}/${doc.name}`,
      uploadedBy: userId,
      uploadedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
      tags: [doc.category, 'important', 'client-facing'].slice(0, Math.floor(Math.random() * 3) + 1)
    }))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={24} className="text-blue-600" />
    if (type.startsWith('video/')) return <Video size={24} className="text-purple-600" />
    if (type.startsWith('audio/')) return <Audio size={24} className="text-green-600" />
    if (type === 'application/pdf') return <FileText size={24} className="text-red-600" />
    if (type.includes('word') || type.includes('document')) return <FileText size={24} className="text-blue-800" />
    if (type.includes('excel') || type.includes('sheet')) return <FileText size={24} className="text-green-800" />
    if (type.includes('powerpoint') || type.includes('presentation')) return <FileText size={24} className="text-orange-600" />
    return <FileText size={24} className="text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileCategory = (name: string, type: string) => {
    const lowercaseName = name.toLowerCase()
    if (lowercaseName.includes('contract')) return 'contract'
    if (lowercaseName.includes('invoice')) return 'invoice'
    if (lowercaseName.includes('quote')) return 'quote'
    if (lowercaseName.includes('presentation')) return 'presentation'
    if (lowercaseName.includes('demo') || lowercaseName.includes('recording')) return 'recording'
    if (lowercaseName.includes('meeting') || lowercaseName.includes('notes')) return 'notes'
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    return 'document'
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || getFileCategory(doc.name, doc.type) === typeFilter
    
    return matchesSearch && matchesType
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    const newDocuments = selectedFiles.map(file => ({
      id: `doc_${accountId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/documents/${accountId}/${file.name}`,
      uploadedBy: userId,
      uploadedAt: new Date(),
      tags: [getFileCategory(file.name, file.type)]
    }))

    setDocuments([...newDocuments, ...documents])
    setSelectedFiles([])
    setShowUploadDialog(false)
    toast.success(`${selectedFiles.length} file(s) uploaded successfully`)
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId))
    toast.success('Document deleted successfully')
  }

  const handleDownloadDocument = (doc: CRMFile) => {
    // In a real app, this would trigger the actual download
    toast.success(`Downloading ${doc.name}`)
  }

  const handleShareDocument = (doc: CRMFile) => {
    // In a real app, this would open a sharing dialog
    toast.success(`Sharing link copied for ${doc.name}`)
  }

  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const category = getFileCategory(doc.name, doc.type)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(doc)
    return groups
  }, {} as Record<string, CRMFile[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Archive size={20} />
            Document Library
          </h3>
          <p className="text-sm text-muted-foreground">
            All documents and files associated with this account ({filteredDocuments.length})
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload size={16} />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Files</label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Selected Files:</label>
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadSubmit}>
                  Upload {selectedFiles.length} Files
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Types</option>
              <option value="contract">Contracts</option>
              <option value="invoice">Invoices</option>
              <option value="quote">Quotes</option>
              <option value="presentation">Presentations</option>
              <option value="recording">Recordings</option>
              <option value="notes">Notes</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Other Documents</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatFileSize(filteredDocuments.reduce((total, doc) => total + doc.size, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Object.keys(groupedDocuments).length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredDocuments.filter(doc => 
                (Date.now() - new Date(doc.uploadedAt).getTime()) < 7 * 24 * 60 * 60 * 1000
              ).length}
            </div>
            <div className="text-sm text-muted-foreground">Recent (7 days)</div>
          </CardContent>
        </Card>
      </div>

      {/* Document Grid */}
      {Object.keys(groupedDocuments).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  {getFileIcon(docs[0]?.type || '')}
                  {category.replace('_', ' ')} ({docs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {getFileIcon(doc.type)}
                          <div className="flex-1 min-w-0">
                            <ClickableDataElement
                              type="document"
                              value={doc.name}
                              data={doc}
                              className="font-medium hover:text-primary cursor-pointer block truncate"
                            />
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="text-xs text-muted-foreground">
                            Uploaded: {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By: <ClickableDataElement
                              type="user"
                              value={doc.uploadedBy}
                              data={{ userId: doc.uploadedBy }}
                              className="hover:text-primary cursor-pointer"
                            />
                          </div>
                        </div>

                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {doc.tags.map((tag) => (
                              <ClickableDataElement
                                key={tag}
                                type="tag"
                                value={tag}
                                data={{ tag, documentId: doc.id }}
                                render={(value) => (
                                  <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer">
                                    {value}
                                  </Badge>
                                )}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex gap-1 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                            className="flex-1"
                          >
                            <Download size={12} className="mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareDocument(doc)}
                          >
                            <Share size={12} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Archive size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Documents Found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Upload documents to start building your account document library.'}
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload size={16} className="mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}