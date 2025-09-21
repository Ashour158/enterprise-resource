import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Phone, 
  EnvelopeSimple as Mail, 
  MapPin, 
  Calendar, 
  CurrencyDollar as DollarSign,
  Tag,
  User,
  Buildings,
  Eye,
  ArrowSquareOut,
  Copy
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ClickableDataElementProps {
  type: 'name' | 'company' | 'phone' | 'email' | 'address' | 'tag' | 'date' | 'currency' | 'text'
  value: string
  onClick?: () => void
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'subtle' | 'prominent'
  copyable?: boolean
  external?: boolean
}

export function ClickableDataElement({
  type,
  value,
  onClick,
  className = '',
  showIcon = true,
  variant = 'default',
  copyable = false,
  external = false
}: ClickableDataElementProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    switch (type) {
      case 'name':
        return <User size={14} />
      case 'company':
        return <Buildings size={14} />
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
        return <DollarSign size={14} />
      default:
        return <Eye size={14} />
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      case 'prominent':
        return 'text-primary hover:text-primary-foreground hover:bg-primary/10 font-medium'
      default:
        return 'text-foreground hover:text-primary hover:bg-accent/50'
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default actions based on type
      switch (type) {
        case 'phone':
          if (typeof window !== 'undefined' && window.location.protocol === 'tel:') {
            window.location.href = `tel:${value}`
          } else {
            toast.info(`Call ${value}`)
          }
          break
        case 'email':
          if (typeof window !== 'undefined') {
            window.location.href = `mailto:${value}`
          } else {
            toast.info(`Email ${value}`)
          }
          break
        case 'address':
          if (typeof window !== 'undefined') {
            window.open(`https://maps.google.com/?q=${encodeURIComponent(value)}`, '_blank')
          } else {
            toast.info(`View address: ${value}`)
          }
          break
        default:
          toast.info(`View details for: ${value}`)
      }
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    } else {
      toast.error('Copy not supported')
    }
  }

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-2 py-1 rounded-md
        cursor-pointer transition-all duration-200
        ${getVariantStyles()}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Click to ${type === 'phone' ? 'call' : type === 'email' ? 'email' : type === 'address' ? 'view map' : 'view details'}`}
    >
      {showIcon && (
        <span className="opacity-60">
          {getIcon()}
        </span>
      )}
      
      <span className="select-none">
        {value}
      </span>

      {external && (
        <ArrowSquareOut size={12} className="opacity-40" />
      )}

      {copyable && isHovered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
          onClick={handleCopy}
        >
          <Copy size={10} />
        </Button>
      )}
    </span>
  )
}

// Helper components for specific use cases
export function ClickableName({ name, onClick, ...props }: { name: string, onClick?: () => void } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="name"
      value={name}
      onClick={onClick}
      variant="prominent"
      {...props}
    />
  )
}

export function ClickableCompany({ company, onClick, ...props }: { company: string, onClick?: () => void } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="company"
      value={company}
      onClick={onClick}
      variant="prominent"
      {...props}
    />
  )
}

export function ClickablePhone({ phone, ...props }: { phone: string } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="phone"
      value={phone}
      copyable
      {...props}
    />
  )
}

export function ClickableEmail({ email, ...props }: { email: string } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="email"
      value={email}
      copyable
      {...props}
    />
  )
}

export function ClickableAddress({ address, ...props }: { address: string } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="address"
      value={address}
      external
      {...props}
    />
  )
}

export function ClickableTag({ tag, onClick, ...props }: { tag: string, onClick?: () => void } & Partial<ClickableDataElementProps>) {
  return (
    <Badge 
      variant="outline" 
      className="cursor-pointer hover:bg-primary/10 transition-colors"
      onClick={onClick}
      {...props}
    >
      <Tag size={12} className="mr-1" />
      {tag}
    </Badge>
  )
}

export function ClickableCurrency({ amount, onClick, ...props }: { amount: string, onClick?: () => void } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="currency"
      value={amount}
      onClick={onClick}
      variant="prominent"
      {...props}
    />
  )
}

export function ClickableDate({ date, onClick, ...props }: { date: string, onClick?: () => void } & Partial<ClickableDataElementProps>) {
  return (
    <ClickableDataElement
      type="date"
      value={date}
      onClick={onClick}
      {...props}
    />
  )
}