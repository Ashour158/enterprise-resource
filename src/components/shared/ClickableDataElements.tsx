import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Phone, EnvelopeSimple as Mail, Calendar, Tag, CurrencyDollar, Building, User, Users, Globe, ArrowSquareOut } from '@phosphor-icons/react'
import { toast } from 'sonner'

// Interface for clickable data configuration
export interface ClickableDataConfig {
  type: 'name' | 'company' | 'phone' | 'email' | 'address' | 'tag' | 'date' | 'currency' | 'website' | 'custom'
  value: string
  displayValue?: string
  entityId?: string
  entityType?: 'lead' | 'contact' | 'account' | 'deal' | 'quote'
  metadata?: Record<string, any>
  className?: string
  onClick?: () => void
}

interface ClickableDataElementProps extends ClickableDataConfig {
  companyId: string
  userId: string
  onProfileView?: (entityId: string, entityType: string) => void
  onEmailCompose?: (email: string, entityData?: any) => void
  onPhoneCall?: (phone: string, entityData?: any) => void
  onMapView?: (address: string) => void
  onTagFilter?: (tag: string) => void
  onCalendarView?: (date: string) => void
  onFinancialView?: (amount: string, entityData?: any) => void
}

export function ClickableDataElement({
  type,
  value,
  displayValue,
  entityId,
  entityType,
  metadata,
  className = '',
  companyId,
  userId,
  onProfileView,
  onEmailCompose,
  onPhoneCall,
  onMapView,
  onTagFilter,
  onCalendarView,
  onFinancialView,
  onClick
}: ClickableDataElementProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    switch (type) {
      case 'name':
        if (onProfileView && entityId && entityType) {
          onProfileView(entityId, entityType)
          toast.info(`Opening ${entityType} profile: ${displayValue || value}`)
        }
        break
      
      case 'company':
        if (onProfileView && entityId) {
          onProfileView(entityId, 'account')
          toast.info(`Opening company profile: ${displayValue || value}`)
        }
        break
      
      case 'phone':
        if (onPhoneCall) {
          onPhoneCall(value, metadata)
          toast.success(`Initiating call to ${value}`)
        }
        break
      
      case 'email':
        if (onEmailCompose) {
          onEmailCompose(value, metadata)
          toast.info(`Opening email composer for ${value}`)
        }
        break
      
      case 'address':
        if (onMapView) {
          onMapView(value)
          toast.info(`Opening map location for ${value}`)
        }
        break
      
      case 'tag':
        if (onTagFilter) {
          onTagFilter(value)
          toast.info(`Filtering by tag: ${value}`)
        }
        break
      
      case 'date':
        if (onCalendarView) {
          onCalendarView(value)
          toast.info(`Opening calendar view for ${value}`)
        }
        break
      
      case 'currency':
        if (onFinancialView) {
          onFinancialView(value, metadata)
          toast.info(`Opening financial breakdown for ${displayValue || value}`)
        }
        break
      
      case 'website':
        window.open(value.startsWith('http') ? value : `https://${value}`, '_blank')
        toast.success(`Opening website: ${value}`)
        break
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'name':
        return <User size={14} />
      case 'company':
        return <Building size={14} />
      case 'phone':
        return <Phone size={14} />
      case 'email':
        return <Mail size={14} />
      case 'address':
        return <MapPin size={14} />
      case 'tag':
        return <Tag size={14} />
      case 'date':
        return <Calendar size={14} />
      case 'currency':
        return <CurrencyDollar size={14} />
      case 'website':
        return <Globe size={14} />
      default:
        return null
    }
  }

  const getHoverContent = () => {
    switch (type) {
      case 'name':
        return `Click to view ${entityType} profile`
      case 'company':
        return 'Click to view company details'
      case 'phone':
        return 'Click to initiate call'
      case 'email':
        return 'Click to compose email'
      case 'address':
        return 'Click to view map location'
      case 'tag':
        return 'Click to filter by this tag'
      case 'date':
        return 'Click to view calendar'
      case 'currency':
        return 'Click to view financial details'
      case 'website':
        return 'Click to visit website'
      default:
        return 'Click for more details'
    }
  }

  const isTag = type === 'tag'
  const isCurrency = type === 'currency'
  const isWebsite = type === 'website'

  if (isTag) {
    return (
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-primary/10 transition-colors ${className}`}
        onClick={handleClick}
        title={getHoverContent()}
      >
        <Tag size={12} className="mr-1" />
        {displayValue || value}
      </Badge>
    )
  }

  if (isCurrency) {
    return (
      <span
        className={`font-semibold text-green-600 cursor-pointer hover:text-green-700 hover:underline transition-colors inline-flex items-center gap-1 ${className}`}
        onClick={handleClick}
        title={getHoverContent()}
      >
        <CurrencyDollar size={14} />
        {displayValue || value}
      </span>
    )
  }

  if (isWebsite) {
    return (
      <span
        className={`text-blue-600 cursor-pointer hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1 ${className}`}
        onClick={handleClick}
        title={getHoverContent()}
      >
        <Globe size={14} />
        {displayValue || value}
        <ArrowSquareOut size={12} />
      </span>
    )
  }

  return (
    <span
      className={`cursor-pointer hover:text-primary hover:underline transition-colors inline-flex items-center gap-1 ${className}`}
      onClick={handleClick}
      title={getHoverContent()}
    >
      {getIcon()}
      {displayValue || value}
    </span>
  )
}

// Higher-order component for multiple clickable elements
interface ClickableDataGroupProps {
  data: ClickableDataConfig[]
  companyId: string
  userId: string
  className?: string
  separator?: string
  onProfileView?: (entityId: string, entityType: string) => void
  onEmailCompose?: (email: string, entityData?: any) => void
  onPhoneCall?: (phone: string, entityData?: any) => void
  onMapView?: (address: string) => void
  onTagFilter?: (tag: string) => void
  onCalendarView?: (date: string) => void
  onFinancialView?: (amount: string, entityData?: any) => void
}

export function ClickableDataGroup({
  data,
  companyId,
  userId,
  className = '',
  separator = ' • ',
  ...handlers
}: ClickableDataGroupProps) {
  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          <ClickableDataElement
            {...item}
            companyId={companyId}
            userId={userId}
            {...handlers}
          />
          {index < data.length - 1 && (
            <span className="text-muted-foreground text-sm">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Quick action buttons for common interactions
interface QuickActionsProps {
  entityType: 'lead' | 'contact' | 'account' | 'deal'
  entityId: string
  entityData: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
  companyId: string
  userId: string
  onAction: (action: string, data: any) => void
  className?: string
}

export function QuickActions({
  entityType,
  entityId,
  entityData,
  companyId,
  userId,
  onAction,
  className = ''
}: QuickActionsProps) {
  const actions = [
    {
      key: 'call',
      icon: <Phone size={14} />,
      label: 'Call',
      disabled: !entityData.phone,
      onClick: () => onAction('call', { phone: entityData.phone, entityId, entityType })
    },
    {
      key: 'email',
      icon: <Mail size={14} />,
      label: 'Email',
      disabled: !entityData.email,
      onClick: () => onAction('email', { email: entityData.email, entityId, entityType })
    },
    {
      key: 'meeting',
      icon: <Calendar size={14} />,
      label: 'Meeting',
      disabled: false,
      onClick: () => onAction('meeting', { entityId, entityType, name: entityData.name })
    }
  ]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {actions.map((action) => (
        <Button
          key={action.key}
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          disabled={action.disabled}
          onClick={action.onClick}
          title={action.label}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  )
}

// Enhanced table cell with clickable data
interface ClickableTableCellProps {
  data: ClickableDataConfig
  companyId: string
  userId: string
  showQuickActions?: boolean
  entityData?: any
  onAction?: (action: string, data: any) => void
  onProfileView?: (entityId: string, entityType: string) => void
  onEmailCompose?: (email: string, entityData?: any) => void
  onPhoneCall?: (phone: string, entityData?: any) => void
  onMapView?: (address: string) => void
  onTagFilter?: (tag: string) => void
  onCalendarView?: (date: string) => void
  onFinancialView?: (amount: string, entityData?: any) => void
}

export function ClickableTableCell({
  data,
  companyId,
  userId,
  showQuickActions = false,
  entityData,
  onAction,
  ...handlers
}: ClickableTableCellProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <ClickableDataElement
        {...data}
        companyId={companyId}
        userId={userId}
        {...handlers}
      />
      
      {showQuickActions && showActions && entityData && onAction && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <QuickActions
            entityType={data.entityType || 'contact'}
            entityId={data.entityId || ''}
            entityData={entityData}
            companyId={companyId}
            userId={userId}
            onAction={onAction}
            className="bg-background border rounded-md shadow-sm"
          />
        </div>
      )}
    </div>
  )
}

// Smart data formatter that automatically detects data types
export function formatClickableData(
  value: any,
  context: {
    fieldName?: string
    entityId?: string
    entityType?: 'lead' | 'contact' | 'account' | 'deal' | 'quote'
    metadata?: Record<string, any>
  }
): ClickableDataConfig {
  const { fieldName, entityId, entityType, metadata } = context

  // Email detection
  if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return {
      type: 'email',
      value,
      entityId,
      entityType,
      metadata
    }
  }

  // Phone detection
  if (typeof value === 'string' && /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)\.]/g, ''))) {
    return {
      type: 'phone',
      value,
      entityId,
      entityType,
      metadata
    }
  }

  // Currency detection
  if (typeof value === 'number' || (typeof value === 'string' && /^\$?[\d,]+\.?\d*$/.test(value))) {
    return {
      type: 'currency',
      value: value.toString(),
      displayValue: typeof value === 'number' ? `$${value.toLocaleString()}` : value,
      entityId,
      entityType,
      metadata
    }
  }

  // Date detection
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
    return {
      type: 'date',
      value: value instanceof Date ? value.toISOString() : value,
      displayValue: new Date(value).toLocaleDateString(),
      entityId,
      entityType,
      metadata
    }
  }

  // Website detection
  if (typeof value === 'string' && /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
    return {
      type: 'website',
      value,
      entityId,
      entityType,
      metadata
    }
  }

  // Field name based detection
  if (fieldName) {
    const lowerFieldName = fieldName.toLowerCase()
    
    if (lowerFieldName.includes('name') && !lowerFieldName.includes('company')) {
      return {
        type: 'name',
        value: value.toString(),
        entityId,
        entityType,
        metadata
      }
    }
    
    if (lowerFieldName.includes('company')) {
      return {
        type: 'company',
        value: value.toString(),
        entityId,
        entityType,
        metadata
      }
    }
    
    if (lowerFieldName.includes('address')) {
      return {
        type: 'address',
        value: value.toString(),
        entityId,
        entityType,
        metadata
      }
    }
    
    if (lowerFieldName.includes('tag')) {
      return {
        type: 'tag',
        value: value.toString(),
        entityId,
        entityType,
        metadata
      }
    }
  }

  // Default to custom type
  return {
    type: 'custom',
    value: value.toString(),
    entityId,
    entityType,
    metadata
  }
}