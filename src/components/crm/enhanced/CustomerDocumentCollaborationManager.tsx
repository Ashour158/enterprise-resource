import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { 
  FileText,
  FilePdf,
  FileDoc,
  FileImage,
  FileVideo,
  Download,
  Upload,
  Eye,
  Share,
  MessageCircle,
  History,
  Users,
  Lock,
  Unlock,
  Star,
  Heart,
  ExternalLink,
  Plus,
  Edit,
  Trash,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Tag,
  Link,
  Globe,
  Shield,
  User
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CustomerDocument {
  id: string
  customerId: string
  documentName: string
  documentType: 'contract' | 'proposal' | 'presentation' | 'manual' | 'report' | 'invoice' | 'other'
  documentCategory: 'sales' | 'legal' | 'technical' | 'financial' | 'marketing'
  fileUrl: string
  fileType: string
  fileSize: number
  thumbnailUrl?: string
  documentVersion: string
  isLatestVersion: boolean
  parentDocumentId?: string
  isSharedWithCustomer: boolean
  customerAccessLevel: 'view' | 'download' | 'comment'
  internalAccessLevel: 'view' | 'edit' | 'admin'
  viewCount: number
  downloadCount: number
  lastAccessed?: string
  lastModified: string
  aiDocumentSummary?: string
  aiKeyTopics: string[]
  aiSentimentAnalysis: {
    score: number
    sentiment: 'positive' | 'neutral' | 'negative'
    confidence: number
  }
  aiImportanceScore: number
  commentsEnabled: boolean
  versionHistory: DocumentVersion[]
  createdBy: string
  sharedBy?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  metadata: Record<string, any>
}

interface DocumentVersion {
  version: string
  createdAt: string
  createdBy: string
  changes: string
  fileUrl: string
  fileSize: number
}

interface DocumentComment {
  id: string
  documentId: string
  authorId: string
  authorName: string
  authorType: 'internal' | 'customer'
  content: string
  createdAt: string
  updatedAt?: string
  isResolved: boolean
  parentCommentId?: string
  mentions: string[]
  attachments: string[]
}

interface DocumentShare {
  id: string
  documentId: string
  sharedWith: string
  sharedBy: string
  accessLevel: 'view' | 'download' | 'comment'
  expiresAt?: string
  shareToken: string
  accessCount: number
  lastAccessed?: string
  createdAt: string
}

interface CustomerDocumentCollaborationManagerProps {
  customerId: string
  companyId: string
  userId: string
  userRole: string
}

export function CustomerDocumentCollaborationManager({ 
  customerId, 
  companyId, 
  userId, 
  userRole 
}: CustomerDocumentCollaborationManagerProps) {
  const [documents, setDocuments] = useKV(`customer-documents-${customerId}`, [] as CustomerDocument[])
  const [comments, setComments] = useKV(`document-comments-${customerId}`, [] as DocumentComment[])
  const [shares, setShares] = useKV(`document-shares-${customerId}`, [] as DocumentShare[])
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [newComment, setNewComment] = useState('')
  const [commentFilter, setCommentFilter] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as CustomerDocument['documentType'],
    category: 'sales' as CustomerDocument['documentCategory'],
    description: '',
    tags: [] as string[],
    customerAccess: false,
    accessLevel: 'view' as CustomerDocument['customerAccessLevel']
  })

  // Mock data generator
  useEffect(() => {
    if (documents.length === 0) {
      generateMockDocuments()
    }
  }, [])

  const generateMockDocuments = () => {
    const mockDocuments: CustomerDocument[] = Array.from({ length: 25 }, (_, i) => ({
      id: `doc-${i + 1}`,
      customerId,
      documentName: getDocumentName(i),
      documentType: ['contract', 'proposal', 'presentation', 'manual', 'report', 'invoice'][Math.floor(Math.random() * 6)] as any,
      documentCategory: ['sales', 'legal', 'technical', 'financial', 'marketing'][Math.floor(Math.random() * 5)] as any,
      fileUrl: `/documents/customer-${customerId}/doc-${i + 1}.pdf`,
      fileType: ['pdf', 'docx', 'pptx', 'xlsx'][Math.floor(Math.random() * 4)],
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      thumbnailUrl: `/thumbnails/doc-${i + 1}-thumb.jpg`,
      documentVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
      isLatestVersion: Math.random() > 0.2,
      parentDocumentId: Math.random() > 0.7 ? `doc-${Math.floor(Math.random() * i) + 1}` : undefined,
      isSharedWithCustomer: Math.random() > 0.3,
      customerAccessLevel: ['view', 'download', 'comment'][Math.floor(Math.random() * 3)] as any,
      internalAccessLevel: ['view', 'edit', 'admin'][Math.floor(Math.random() * 3)] as any,
      viewCount: Math.floor(Math.random() * 100),
      downloadCount: Math.floor(Math.random() * 50),
      lastAccessed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      lastModified: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      aiDocumentSummary: `AI-generated summary for ${getDocumentName(i)}. This document contains important information about...`,
      aiKeyTopics: getRandomTopics(),
      aiSentimentAnalysis: {
        score: Math.random(),
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        confidence: Math.random()
      },
      aiImportanceScore: Math.floor(Math.random() * 100),
      commentsEnabled: Math.random() > 0.2,
      versionHistory: generateVersionHistory(i),
      createdBy: `user-${Math.floor(Math.random() * 5) + 1}`,
      sharedBy: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 5) + 1}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: getRandomTags(),
      metadata: {
        contractValue: Math.random() > 0.5 ? Math.floor(Math.random() * 1000000) : undefined,
        expiryDate: Math.random() > 0.6 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
      }
    }))

    const mockComments: DocumentComment[] = Array.from({ length: 60 }, (_, i) => ({
      id: `comment-${i + 1}`,
      documentId: `doc-${Math.floor(Math.random() * 25) + 1}`,
      authorId: `user-${Math.floor(Math.random() * 8) + 1}`,
      authorName: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Davis', 'Customer User'][Math.floor(Math.random() * 5)],
      authorType: Math.random() > 0.3 ? 'internal' : 'customer',
      content: getRandomComment(i),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: Math.random() > 0.8 ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      isResolved: Math.random() > 0.6,
      parentCommentId: Math.random() > 0.7 ? `comment-${Math.floor(Math.random() * i) + 1}` : undefined,
      mentions: Math.random() > 0.8 ? [`user-${Math.floor(Math.random() * 5) + 1}`] : [],
      attachments: Math.random() > 0.9 ? [`attachment-${i + 1}.pdf`] : []
    }))

    setDocuments(mockDocuments)
    setComments(mockComments)
  }

  const getDocumentName = (index: number): string => {
    const names = [
      'Service Agreement 2024',
      'Product Proposal Q1',
      'Technical Specifications',
      'Implementation Guide',
      'Monthly Performance Report',
      'Invoice #INV-2024-001',
      'Contract Amendment',
      'Project Timeline',
      'User Manual v2.0',
      'Security Audit Report'
    ]
    return names[index % names.length]
  }

  const getRandomTopics = (): string[] => {
    const topics = ['pricing', 'deliverables', 'timeline', 'security', 'compliance', 'integration', 'support', 'training']
    return topics.slice(0, Math.floor(Math.random() * 4) + 1)
  }

  const getRandomTags = (): string[] => {
    const tags = ['important', 'urgent', 'review-needed', 'confidential', 'public', 'draft', 'final', 'archived']
    return tags.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  const generateVersionHistory = (index: number): DocumentVersion[] => {
    return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
      version: `v${Math.floor(Math.random() * 3) + 1}.${i}`,
      createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: `user-${Math.floor(Math.random() * 5) + 1}`,
      changes: `Version ${i + 1} changes: Updated sections ${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 5) + 6}`,
      fileUrl: `/documents/versions/doc-${index + 1}-v${i + 1}.pdf`,
      fileSize: Math.floor(Math.random() * 5000000) + 500000
    }))
  }

  const getRandomComment = (index: number): string => {
    const comments = [
      'Please review the pricing section on page 3.',
      'The timeline looks reasonable, but we need to adjust the delivery date.',
      'Can we add more details about the support process?',
      'This looks good overall. Ready to proceed.',
      'I have some concerns about the security requirements.',
      'The technical specifications need to be updated.',
      'Great work on this proposal!',
      'We need to clarify the payment terms.',
      'The contract terms are acceptable.',
      'Please add the missing appendix.'
    ]
    return comments[index % comments.length]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FilePdf size={20} className="text-red-500" />
      case 'doc':
      case 'docx': return <FileDoc size={20} className="text-blue-500" />
      case 'jpg':
      case 'png':
      case 'gif': return <FileImage size={20} className="text-green-500" />
      case 'mp4':
      case 'avi': return <FileVideo size={20} className="text-purple-500" />
      default: return <FileText size={20} className="text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.aiKeyTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || doc.documentCategory === categoryFilter
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter
    
    return matchesSearch && matchesCategory && matchesType
  })

  const getDocumentComments = (documentId: string) => {
    return comments.filter(comment => comment.documentId === documentId)
  }

  const addComment = (documentId: string) => {
    if (!newComment.trim()) return

    const comment: DocumentComment = {
      id: `comment-${Date.now()}`,
      documentId,
      authorId: userId,
      authorName: 'Current User',
      authorType: 'internal',
      content: newComment,
      createdAt: new Date().toISOString(),
      isResolved: false,
      mentions: [],
      attachments: []
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
    toast.success('Comment added successfully')
  }

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, isResolved: !comment.isResolved }
        : comment
    ))
    toast.success('Comment status updated')
  }

  const shareDocument = (documentId: string, accessLevel: 'view' | 'download' | 'comment') => {
    const share: DocumentShare = {
      id: `share-${Date.now()}`,
      documentId,
      sharedWith: 'customer-portal',
      sharedBy: userId,
      accessLevel,
      shareToken: Math.random().toString(36).substring(2, 15),
      accessCount: 0,
      createdAt: new Date().toISOString()
    }

    setShares(prev => [share, ...prev])
    toast.success('Document shared successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Customer Document Collaboration
              </CardTitle>
              <CardDescription>
                Manage shared documents, track versions, and collaborate with customers
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus size={16} className="mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shared Documents</p>
                  <p className="text-2xl font-bold">{documents.filter(d => d.isSharedWithCustomer).length}</p>
                </div>
                <Share className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                  <p className="text-2xl font-bold">{comments.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg AI Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(documents.reduce((sum, d) => sum + d.aiImportanceScore, 0) / documents.length)}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="shared">Customer Shared</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>Manage all customer documents with AI-powered insights</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="contract">Contracts</SelectItem>
                      <SelectItem value="proposal">Proposals</SelectItem>
                      <SelectItem value="presentation">Presentations</SelectItem>
                      <SelectItem value="manual">Manuals</SelectItem>
                      <SelectItem value="report">Reports</SelectItem>
                      <SelectItem value="invoice">Invoices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedDocument(document)
                      setShowDocumentDialog(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(document.fileType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ClickableDataElement
                              type="document"
                              value={document.documentName}
                              onClick={() => toast.info(`Opening ${document.documentName}`)}
                              className="font-medium"
                            />
                            <Badge variant="outline">{document.documentVersion}</Badge>
                            {!document.isLatestVersion && (
                              <Badge variant="destructive" className="text-xs">Outdated</Badge>
                            )}
                            {document.isSharedWithCustomer && (
                              <Badge variant="secondary" className="text-xs">
                                <Share size={12} className="mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="capitalize">{document.documentType}</span>
                            <span className="capitalize">{document.documentCategory}</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>{document.viewCount} views</span>
                            <span>{document.downloadCount} downloads</span>
                          </div>
                          {document.aiKeyTopics.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {document.aiKeyTopics.slice(0, 3).map((topic, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{document.aiImportanceScore}%</span>
                            <Star size={14} className="text-yellow-500" />
                          </div>
                          <div className={`text-xs ${getSentimentColor(document.aiSentimentAnalysis.sentiment)}`}>
                            {document.aiSentimentAnalysis.sentiment}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getDocumentComments(document.id).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <MessageCircle size={12} className="mr-1" />
                              {getDocumentComments(document.id).length}
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye size={14} className="mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download size={14} className="mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share size={14} className="mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History size={14} className="mr-2" />
                              Version History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Shared Documents</CardTitle>
              <CardDescription>Documents currently shared with the customer portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {documents.filter(d => d.isSharedWithCustomer).map((document) => (
                  <div key={document.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(document.fileType)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{document.documentName}</span>
                            <Badge variant="outline">{document.customerAccessLevel}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Shared {document.sharedBy && `by ${document.sharedBy}`} • 
                            Last accessed {document.lastAccessed ? new Date(document.lastAccessed).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document)
                            setShowShareDialog(true)
                          }}
                        >
                          <Share size={14} className="mr-2" />
                          Manage Sharing
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Comments</CardTitle>
                  <CardDescription>Collaborative discussions on customer documents</CardDescription>
                </div>
                <Select value={commentFilter} onValueChange={setCommentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter comments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Comments</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="internal">Internal Only</SelectItem>
                    <SelectItem value="customer">Customer Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments
                  .filter(comment => {
                    if (commentFilter === 'all') return true
                    if (commentFilter === 'unresolved') return !comment.isResolved
                    if (commentFilter === 'resolved') return comment.isResolved
                    if (commentFilter === 'internal') return comment.authorType === 'internal'
                    if (commentFilter === 'customer') return comment.authorType === 'customer'
                    return true
                  })
                  .slice(0, 20)
                  .map((comment) => {
                    const document = documents.find(d => d.id === comment.documentId)
                    return (
                      <div key={comment.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {comment.authorName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.authorName}</span>
                                <Badge variant={comment.authorType === 'internal' ? 'default' : 'secondary'}>
                                  {comment.authorType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                on <ClickableDataElement
                                  type="document"
                                  value={document?.documentName || 'Unknown Document'}
                                  onClick={() => {
                                    if (document) {
                                      setSelectedDocument(document)
                                      setShowDocumentDialog(true)
                                    }
                                  }}
                                />
                              </p>
                              <p className="mt-2">{comment.content}</p>
                              {comment.attachments.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {comment.attachments.map((attachment, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Link size={12} className="mr-1" />
                                      {attachment}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={comment.isResolved ? 'default' : 'destructive'}>
                              {comment.isResolved ? 'Resolved' : 'Open'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveComment(comment.id)}
                            >
                              {comment.isResolved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Engagement</CardTitle>
                <CardDescription>Customer interaction with shared documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents
                    .filter(d => d.isSharedWithCustomer)
                    .sort((a, b) => b.viewCount - a.viewCount)
                    .slice(0, 5)
                    .map((document) => (
                      <div key={document.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{document.documentName}</span>
                          <span>{document.viewCount} views</span>
                        </div>
                        <Progress value={(document.viewCount / Math.max(...documents.map(d => d.viewCount))) * 100} className="h-2" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights Summary</CardTitle>
                <CardDescription>AI-powered document analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Importance Score</span>
                      <span>{Math.round(documents.reduce((sum, d) => sum + d.aiImportanceScore, 0) / documents.length)}%</span>
                    </div>
                    <Progress value={documents.reduce((sum, d) => sum + d.aiImportanceScore, 0) / documents.length} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Positive Sentiment</span>
                      <span>{documents.filter(d => d.aiSentimentAnalysis.sentiment === 'positive').length}</span>
                    </div>
                    <Progress value={(documents.filter(d => d.aiSentimentAnalysis.sentiment === 'positive').length / documents.length) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Documents with Comments</span>
                      <span>{documents.filter(d => getDocumentComments(d.id).length > 0).length}</span>
                    </div>
                    <Progress value={(documents.filter(d => getDocumentComments(d.id).length > 0).length / documents.length) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Detail Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.fileType)}
              Document Details
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Name</Label>
                  <p className="font-medium">{selectedDocument.documentName}</p>
                </div>
                <div>
                  <Label>Version</Label>
                  <p>{selectedDocument.documentVersion}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="capitalize">{selectedDocument.documentType}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="capitalize">{selectedDocument.documentCategory}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p>{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <Label>Last Modified</Label>
                  <p>{new Date(selectedDocument.lastModified).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>AI Summary</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedDocument.aiDocumentSummary}</p>
              </div>

              <div>
                <Label>Key Topics</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedDocument.aiKeyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedDocument.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Importance Score</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedDocument.aiImportanceScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedDocument.aiImportanceScore}%</span>
                  </div>
                </div>
                <div>
                  <Label>Sentiment Analysis</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getSentimentColor(selectedDocument.aiSentimentAnalysis.sentiment)}>
                      {selectedDocument.aiSentimentAnalysis.sentiment}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(selectedDocument.aiSentimentAnalysis.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Access</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedDocument.isSharedWithCustomer ? (
                      <Badge variant="default">
                        <Share size={12} className="mr-1" />
                        Shared ({selectedDocument.customerAccessLevel})
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Lock size={12} className="mr-1" />
                        Internal Only
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Engagement</Label>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">
                      <Eye size={12} className="mr-1" />
                      {selectedDocument.viewCount} views
                    </Badge>
                    <Badge variant="outline">
                      <Download size={12} className="mr-1" />
                      {selectedDocument.downloadCount} downloads
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Comments ({getDocumentComments(selectedDocument.id).length})</Label>
                  {selectedDocument.commentsEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCommentDialog(true)}
                    >
                      <Plus size={14} className="mr-2" />
                      Add Comment
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {getDocumentComments(selectedDocument.id).map((comment) => (
                    <div key={comment.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {comment.authorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.authorName}</span>
                              <Badge variant={comment.authorType === 'internal' ? 'default' : 'secondary'} className="text-xs">
                                {comment.authorType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                        <Badge variant={comment.isResolved ? 'default' : 'destructive'} className="text-xs">
                          {comment.isResolved ? 'Resolved' : 'Open'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comment</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedDocument) {
                    addComment(selectedDocument.id)
                    setShowCommentDialog(false)
                  }
                }}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Name</Label>
              <Input
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={newDocument.type} onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newDocument.category} onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter document description..."
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={newDocument.customerAccess} 
                  onCheckedChange={(checked) => setNewDocument(prev => ({ ...prev, customerAccess: checked }))}
                />
                <Label>Share with Customer</Label>
              </div>
              {newDocument.customerAccess && (
                <Select value={newDocument.accessLevel} onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, accessLevel: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Document upload started')
                setShowUploadDialog(false)
                setNewDocument({
                  name: '',
                  type: 'other',
                  category: 'sales',
                  description: '',
                  tags: [],
                  customerAccess: false,
                  accessLevel: 'view'
                })
              }}>
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}