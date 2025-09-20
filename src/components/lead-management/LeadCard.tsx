import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Building,
  Star,
  Brain,
  Target,
  TrendUp,
  Clock,
  User
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

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

interface CardLayout {
  showAIScore: boolean
  showEngagement: boolean
  showLastContact: boolean
  showNextAction: boolean
  showTags: boolean
  showCustomFields: boolean
  compactMode: boolean
}

interface LeadCardProps {
  lead: Lead
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onUpdate: (updates: Partial<Lead>) => void
  onDelete: () => void
  onView: () => void
  layout: CardLayout
  userRole: string
}

export function LeadCard({ 
  lead, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onView, 
  layout,
  userRole 
}: LeadCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'unqualified': return 'bg-gray-100 text-gray-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'hot': return 'text-red-500'
      case 'warm': return 'text-orange-500'
      case 'cold': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const handleStatusChange = (newStatus: Lead['leadStatus']) => {
    onUpdate({ leadStatus: newStatus })
  }

  const handleRatingChange = (newRating: Lead['leadRating']) => {
    onUpdate({ leadRating: newRating })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer relative",
        isSelected && "ring-2 ring-primary",
        layout.compactMode ? "p-3" : "p-4"
      )}
      onClick={onView}
    >
      {/* Selection Checkbox */}
      <div 
        className="absolute top-3 left-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </div>

      {/* Actions Menu */}
      <div 
        className="absolute top-3 right-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye size={16} className="mr-2" />
              View Details
            </DropdownMenuItem>
            {(userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'manager') && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit size={16} className="mr-2" />
                Quick Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onUpdate({ lastContactDate: new Date().toISOString() })}
            >
              <Phone size={16} className="mr-2" />
              Mark as Contacted
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
            >
              <Mail size={16} className="mr-2" />
              Send Email
            </DropdownMenuItem>
            {(userRole === 'super_admin' || userRole === 'company_admin') && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive"
              >
                <Trash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className={cn("pt-12", layout.compactMode ? "pb-3" : "pb-4")}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(lead.firstName, lead.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight">
              {lead.firstName} {lead.lastName}
            </h3>
            {lead.jobTitle && (
              <p className="text-sm text-muted-foreground truncate">
                {lead.jobTitle}
              </p>
            )}
            {lead.companyName && (
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
                <Building size={12} />
                {lead.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Status and Rating */}
        <div className="flex items-center gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge 
                className={cn("cursor-pointer", getStatusColor(lead.leadStatus))}
                onClick={(e) => e.stopPropagation()}
              >
                {lead.leadStatus}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusChange('new')}>
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('contacted')}>
                Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('qualified')}>
                Qualified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('unqualified')}>
                Unqualified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('converted')}>
                Converted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('lost')}>
                Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("p-1 h-6", getRatingColor(lead.leadRating))}
                onClick={(e) => e.stopPropagation()}
              >
                <Star size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleRatingChange('hot')}>
                <Star className="text-red-500 mr-2" size={16} />
                Hot
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRatingChange('warm')}>
                <Star className="text-orange-500 mr-2" size={16} />
                Warm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRatingChange('cold')}>
                <Star className="text-blue-500 mr-2" size={16} />
                Cold
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge variant="outline" className={getPriorityColor(lead.leadPriority)}>
            {lead.leadPriority}
          </Badge>

          <Badge variant="secondary" className="text-xs">
            {lead.leadSource}
          </Badge>
        </div>

        {/* AI Score */}
        {layout.showAIScore && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Brain size={12} />
                AI Score
              </span>
              <span className="font-medium">{lead.aiLeadScore}/100</span>
            </div>
            <Progress value={lead.aiLeadScore} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>
                {(lead.aiConversionProbability * 100).toFixed(0)}% conversion
              </span>
              <span>
                {formatCurrency(lead.aiEstimatedDealValue)} est.
              </span>
            </div>
          </div>
        )}

        {/* Engagement Score */}
        {layout.showEngagement && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Target size={12} />
                Engagement
              </span>
              <span className="font-medium">{lead.engagementScore}%</span>
            </div>
            <Progress value={lead.engagementScore} className="h-2" />
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail size={12} />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={12} />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={12} />
              <span className="truncate">
                {lead.address.city}, {lead.address.state}
              </span>
            </div>
          )}
        </div>

        {/* Last Contact & Next Action */}
        {(layout.showLastContact || layout.showNextAction) && (
          <div className="space-y-2 mb-4 text-sm">
            {layout.showLastContact && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  Last Contact
                </span>
                <span className="font-medium">
                  {formatDate(lead.lastContactDate)}
                </span>
              </div>
            )}
            {layout.showNextAction && lead.nextFollowUpDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  Next Follow-up
                </span>
                <span className="font-medium">
                  {formatDate(lead.nextFollowUpDate)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {layout.showTags && lead.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lead.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {layout.showCustomFields && Object.keys(lead.customFields).length > 0 && (
          <div className="space-y-1 text-sm">
            {Object.entries(lead.customFields).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium truncate ml-2">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <span>#{lead.leadNumber}</span>
          <span>
            {lead.contactAttempts} attempts
          </span>
          <span>
            {formatDate(lead.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}