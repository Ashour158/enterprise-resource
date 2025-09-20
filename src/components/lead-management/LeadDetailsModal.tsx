import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save, 
  X, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Building,
  Star,
  Brain,
  Target,
  TrendUp,
  Clock,
  User,
  Plus,
  Trash,
  Edit,
  Activity,
  FileText,
  Tag,
  Settings
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

interface LeadDetailsModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (updates: Partial<Lead>) => void
  onCreate?: (leadData: Partial<Lead>) => void
  onDelete?: () => void
  userRole: string
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onUpdate,
  onCreate,
  onDelete,
  userRole
}: LeadDetailsModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [isEditing, setIsEditing] = useState(!lead)
  const [activeTab, setActiveTab] = useState('details')
  const [newTag, setNewTag] = useState('')
  const [customFieldKey, setCustomFieldKey] = useState('')
  const [customFieldValue, setCustomFieldValue] = useState('')

  const isCreateMode = !lead
  const canEdit = userRole === 'super_admin' || userRole === 'company_admin' || userRole === 'manager'

  useEffect(() => {
    if (lead) {
      setFormData(lead)
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        leadStatus: 'new',
        leadRating: 'cold',
        leadPriority: 'medium',
        leadSource: 'Manual',
        tags: [],
        customFields: {},
        address: {}
      })
    }
  }, [lead])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey.trim()]: customFieldValue.trim()
        }
      }))
      setCustomFieldKey('')
      setCustomFieldValue('')
    }
  }

  const handleRemoveCustomField = (key: string) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields }
      delete newCustomFields[key]
      return { ...prev, customFields: newCustomFields }
    })
  }

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    if (isCreateMode && onCreate) {
      onCreate(formData)
    } else if (onUpdate) {
      onUpdate(formData)
      setIsEditing(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusColor = (status?: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(formData.firstName, formData.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              {isCreateMode ? (
                'Create New Lead'
              ) : (
                <div>
                  <div className="text-xl font-semibold">
                    {formData.firstName} {formData.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    #{formData.leadNumber} • Created {formatDate(formData.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isCreateMode && canEdit && !isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </Button>
            )}
            {isEditing && (
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isCreateMode ? 'Create' : 'Save'}
              </Button>
            )}
            {!isCreateMode && userRole === 'super_admin' && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="flex items-center gap-2"
              >
                <Trash size={16} />
                Delete
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="scoring">AI Scoring</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="tags">Tags & Fields</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building size={20} />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry || ''}
                      onValueChange={(value) => handleInputChange('industry', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={formData.companySize || ''}
                      onValueChange={(value) => handleInputChange('companySize', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="annualRevenue">Annual Revenue</Label>
                    <Input
                      id="annualRevenue"
                      type="number"
                      value={formData.annualRevenue || ''}
                      onChange={(e) => handleInputChange('annualRevenue', parseInt(e.target.value))}
                      disabled={!isEditing}
                      placeholder="Enter annual revenue"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.address?.line1 || ''}
                      onChange={(e) => handleAddressChange('line1', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.address?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address?.country || ''}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lead Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Lead Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="leadStatus">Status</Label>
                    <Select
                      value={formData.leadStatus || 'new'}
                      onValueChange={(value) => handleInputChange('leadStatus', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="leadRating">Rating</Label>
                    <Select
                      value={formData.leadRating || 'cold'}
                      onValueChange={(value) => handleInputChange('leadRating', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadPriority">Priority</Label>
                    <Select
                      value={formData.leadPriority || 'medium'}
                      onValueChange={(value) => handleInputChange('leadPriority', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select
                      value={formData.leadSource || 'Manual'}
                      onValueChange={(value) => handleInputChange('leadSource', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                        <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nextFollowUp">Next Follow-up Date</Label>
                    <Input
                      id="nextFollowUp"
                      type="date"
                      value={formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} />
                    AI Lead Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formData.aiLeadScore || 0}
                    </div>
                    <Progress value={formData.aiLeadScore || 0} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      AI-calculated lead quality score
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} />
                    Conversion Probability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {((formData.aiConversionProbability || 0) * 100).toFixed(0)}%
                    </div>
                    <Progress value={(formData.aiConversionProbability || 0) * 100} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Likelihood to convert
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp size={20} />
                    Estimated Deal Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {formatCurrency(formData.aiEstimatedDealValue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI-predicted deal size
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Contact Attempts</span>
                  <Badge variant="outline">{formData.contactAttempts || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Engagement Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={formData.engagementScore || 0} className="w-24" />
                    <span className="text-sm font-medium">{formData.engagementScore || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Contact</span>
                  <span className="text-sm">{formatDate(formData.lastContactDate)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No activity recorded yet</p>
                  <p className="text-sm mt-2">Activity history will appear here when actions are taken</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={20} />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Custom Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.customFields || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-muted-foreground">{String(value)}</div>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomField(key)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Field name..."
                        value={customFieldKey}
                        onChange={(e) => setCustomFieldKey(e.target.value)}
                      />
                      <Input
                        placeholder="Field value..."
                        value={customFieldValue}
                        onChange={(e) => setCustomFieldValue(e.target.value)}
                      />
                      <Button onClick={handleAddCustomField} variant="outline">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={!isEditing}
                  rows={8}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}