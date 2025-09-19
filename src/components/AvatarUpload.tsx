import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AvatarUpload as AvatarUploadType } from '@/types/erp'
import { Camera, User, X, Check, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatar?: string
  onUpload: (file: File) => Promise<boolean>
  onRemove: () => Promise<boolean>
  uploadState: AvatarUploadType | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onRemove, 
  uploadState, 
  size = 'md',
  className = ''
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const getDisplayAvatar = () => {
    if (uploadState?.preview_url) {
      return uploadState.preview_url
    }
    return currentAvatar
  }

  const renderUploadStatus = () => {
    if (!uploadState) return null

    const { upload_status, upload_progress, error_message } = uploadState

    switch (upload_status) {
      case 'uploading':
        return (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              </div>
              <div className="text-xs">{upload_progress}%</div>
            </div>
          </div>
        )
      case 'completed':
        return (
          <div className="absolute inset-0 bg-green-500/90 rounded-full flex items-center justify-center">
            <Check size={iconSizes[size]} className="text-white" />
          </div>
        )
      case 'failed':
        return (
          <div className="absolute inset-0 bg-red-500/90 rounded-full flex items-center justify-center">
            <Warning size={iconSizes[size]} className="text-white" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Avatar Display */}
      <div className={`relative ${sizeClasses[size]} group cursor-pointer`} onClick={triggerFileSelect}>
        <div className="w-full h-full rounded-full border-2 border-border overflow-hidden bg-muted">
          {getDisplayAvatar() ? (
            <img
              src={getDisplayAvatar()}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <User size={iconSizes[size] * 1.5} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Upload Status Overlay */}
        {renderUploadStatus()}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={iconSizes[size]} className="text-white" />
        </div>
      </div>

      {/* Upload Progress */}
      {uploadState?.upload_status === 'uploading' && (
        <div className="w-full max-w-32">
          <Progress value={uploadState.upload_progress} className="h-1" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={uploadState?.upload_status === 'uploading'}
          className="flex items-center gap-1"
        >
          <Camera size={14} />
          {currentAvatar ? 'Change' : 'Upload'}
        </Button>
        
        {currentAvatar && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={uploadState?.upload_status === 'uploading'}
            className="flex items-center gap-1"
          >
            <X size={14} />
            Remove
          </Button>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF up to 5MB
        </p>
        {uploadState?.error_message && (
          <p className="text-xs text-destructive mt-1">
            {uploadState.error_message}
          </p>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}