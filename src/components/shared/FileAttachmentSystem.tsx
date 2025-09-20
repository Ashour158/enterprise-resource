import React, { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  File, 
  Image, 
  FileText, 
  FilePdf, 
  FileX, 
  Video, 
  MusicNote as Audio,
  Archive,
  CloudArrowUp as Upload,
  Download,
  Trash,
  Eye,
  Link,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadDate: string
  uploadedBy: string
  entityId: string
  entityType: string // lead, contact, deal, quote, etc.
  companyId: string
  thumbnail?: string
  metadata?: {
    description?: string
    tags?: string[]
    version?: number
    category?: string
  }
}

interface FileAttachmentSystemProps {
  entityId: string
  entityType: 'lead' | 'contact' | 'deal' | 'quote' | 'account' | 'activity' | 'forecast'
  companyId: string
  userId: string
  allowedTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  showPreview?: boolean
  compact?: boolean
}

export function FileAttachmentSystem({
  entityId,
  entityType,
  companyId,
  userId,
  allowedTypes = ['*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 20,
  showPreview = true,
  compact = false
}: FileAttachmentSystemProps) {
  const [attachments, setAttachments] = useKV<FileAttachment[]>(`attachments-${entityType}-${entityId}`, [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null)

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={16} className="text-blue-500" />
    if (type.startsWith('video/')) return <Video size={16} className="text-purple-500" />
    if (type.startsWith('audio/')) return <Audio size={16} className="text-green-500" />
    if (type.includes('pdf')) return <FilePdf size={16} className="text-red-500" />
    if (type.includes('word') || type.includes('document')) return <FileText size={16} className="text-blue-600" />
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileText size={16} className="text-green-600" />
    if (type.includes('archive') || type.includes('zip')) return <Archive size={16} className="text-orange-500" />
    return <File size={16} className="text-gray-500" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Check if file type is allowed
  const isFileTypeAllowed = (type: string) => {
    if (allowedTypes.includes('*')) return true
    return allowedTypes.some(allowed => 
      allowed === type || 
      (allowed.endsWith('/*') && type.startsWith(allowed.replace('/*', '/')))
    )
  }

  // Simulate file upload
  const uploadFile = async (file: File) => {
    if (!isFileTypeAllowed(file.type)) {
      toast.error(`File type ${file.type} is not allowed`)
      return
    }

    if (file.size > maxFileSize) {
      toast.error(`File size exceeds ${formatFileSize(maxFileSize)} limit`)
      return
    }

    const currentAttachments = attachments || []
    if (currentAttachments.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 200)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newAttachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In real app, this would be the server URL
        uploadDate: new Date().toISOString(),
        uploadedBy: userId,
        entityId,
        entityType,
        companyId,
        metadata: {
          category: file.type.startsWith('image/') ? 'image' : 'document',
          tags: []
        }
      }

      setAttachments(prev => [...prev, newAttachment])
      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      clearInterval(progressInterval)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      fileArray.forEach(uploadFile)
    }
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      files.forEach(uploadFile)
    }
  }, [])

  // Delete attachment
  const deleteAttachment = (attachmentId: string) => {
    setAttachments(prev => (prev || []).filter(att => att.id !== attachmentId))
    toast.success('File deleted successfully')
  }

  // Download attachment
  const downloadAttachment = (attachment: FileAttachment) => {
    // In real app, this would handle actual download
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.click()
    toast.success(`Downloading ${attachment.name}`)
  }

  // Generate shareable link
  const generateShareableLink = (attachment: FileAttachment) => {
    // In real app, this would create a secure shareable link
    const shareLink = `${window.location.origin}/shared/${attachment.id}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Shareable link copied to clipboard')
  }

  if (compact) {
    const safeAttachments = attachments || []
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Attachments ({safeAttachments.length})</span>
          <Button size="sm" variant="outline" onClick={() => document.getElementById(`file-input-${entityId}`)?.click()}>
            <Upload size={14} className="mr-1" />
            Add
          </Button>
        </div>
        <input
          id={`file-input-${entityId}`}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {safeAttachments.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {safeAttachments.slice(0, 3).map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-1 p-1 bg-muted rounded text-xs">
                {getFileIcon(attachment.type)}
                <span className="truncate flex-1">{attachment.name}</span>
              </div>
            ))}
            {safeAttachments.length > 3 && (
              <div className="text-xs text-muted-foreground p-1">
                +{safeAttachments.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const safeAttachments = attachments || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <File size={20} />
            File Attachments ({safeAttachments.length}/{maxFiles})
          </span>
          <Button size="sm" onClick={() => document.getElementById(`file-input-${entityId}`)?.click()}>
            <Upload size={16} className="mr-2" />
            Upload Files
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to select
          </p>
          <Button variant="outline" onClick={() => document.getElementById(`file-input-${entityId}`)?.click()}>
            Browse Files
          </Button>
          <input
            id={`file-input-${entityId}`}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Max file size: {formatFileSize(maxFileSize)} | Allowed types: {allowedTypes.join(', ')}
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uploading...</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Attachments List */}
        {safeAttachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Attached Files</h4>
            <div className="space-y-2">
              {safeAttachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  {getFileIcon(attachment.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{attachment.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(attachment.size)}
                      </Badge>
                      {attachment.metadata?.category && (
                        <Badge variant="secondary" className="text-xs">
                          {attachment.metadata.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(attachment.uploadDate).toLocaleDateString()} by {attachment.uploadedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {showPreview && attachment.type.startsWith('image/') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedFile(attachment)}>
                            <Eye size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{attachment.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-4">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="max-w-full max-h-96 object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => downloadAttachment(attachment)}>
                      <Download size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateShareableLink(attachment)}>
                      <Link size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAttachment(attachment.id)}>
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {safeAttachments.length === 0 && !isUploading && (
          <div className="text-center text-muted-foreground py-8">
            <File size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files attached yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}