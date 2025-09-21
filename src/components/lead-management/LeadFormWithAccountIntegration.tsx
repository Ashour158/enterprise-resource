import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lead, Account } from '@/types/crm'
import { mockAccounts } from '@/data/crmMockData'
import { 
  Plus, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  X,
  Search,
  CheckCircle,
  AlertCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadFormWithAccountIntegrationProps {
  companyId: string
  userId: string
  isOpen: boolean
  onClose: () => void
  onSave: (lead: Partial<Lead>) => void
  existingLead?: Lead | null
}

export function LeadFormWithAccountIntegration({
  companyId,
  userId,
  isOpen,
  onClose,
  onSave,
  existingLead
}: LeadFormWithAccountIntegrationProps) {
  const [accounts] = useKV<Account[]>(`accounts-${companyId}`, mockAccounts)
  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: existingLead?.firstName || '',
    lastName: existingLead?.lastName || '',
    email: existingLead?.email || '',
    phone: existingLead?.phone || '',
    accountId: existingLead?.accountId || '',
    accountName: existingLead?.accountName || '',
    jobTitle: existingLead?.jobTitle || existingLead?.title || '',
    source: existingLead?.source || 'website',
    status: existingLead?.status || 'new',
    priority: existingLead?.priority || 'medium',
    estimatedValue: existingLead?.estimatedValue || 0,
    tags: existingLead?.tags || [],
    notes: existingLead?.notes || '',
    customFields: existingLead?.customFields || {}
  })
  
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [accountSearch, setAccountSearch] = useState('')
  const [showNewAccountForm, setShowNewAccountForm] = useState(false)
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: ''
  })
  const [currentTab, setCurrentTab] = useState('basic')

  const safeAccounts = accounts || mockAccounts

  // Filter accounts based on search
  const filteredAccounts = safeAccounts.filter(account =>
    account.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    account.industry.toLowerCase().includes(accountSearch.toLowerCase())
  )

  const selectedAccount = formData.accountId 
    ? safeAccounts.find(acc => acc.id === formData.accountId)
    : null

  const leadSources = [
    'website', 'social_media', 'email_campaign', 'referral', 'trade_show', 
    'cold_call', 'organic_search', 'paid_ads', 'content_marketing', 'partner'
  ]

  const leadStatuses = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
    { value: 'converted', label: 'Converted', color: 'bg-purple-500' },
    { value: 'lost', label: 'Lost', color: 'bg-red-500' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ]

  const handleAccountSelect = (account: Account) => {
    setFormData(prev => ({
      ...prev,
      accountId: account.id,
      accountName: account.name
    }))
    setShowAccountSelector(false)
    setAccountSearch('')
    toast.success(`Selected account: ${account.name}`)
  }

  const handleCreateNewAccount = () => {
    if (!newAccountData.name || !newAccountData.industry) {
      toast.error('Please fill in required account fields')
      return
    }

    // In a real application, this would create the account via API
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      companyId,
      name: newAccountData.name,
      industry: newAccountData.industry,
      website: newAccountData.website,
      phone: newAccountData.phone,
      size: 'small',
      accountType: 'prospect',
      status: 'active',
      owner: userId,
      tags: [],
      customFields: {},
      address: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRevenue: 0
    }

    // Update the form with the new account
    setFormData(prev => ({
      ...prev,
      accountId: newAccount.id,
      accountName: newAccount.name
    }))

    setShowNewAccountForm(false)
    setNewAccountData({ name: '', industry: '', website: '', phone: '' })
    toast.success(`Created and selected new account: ${newAccount.name}`)
  }

  const handleAddTag = (newTag: string) => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleSave = () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in required fields: First Name, Last Name, and Email')
      return
    }

    if (!formData.accountId) {
      toast.error('Please select or create an account for this lead')
      return
    }

    const leadData: Partial<Lead> = {
      ...formData,
      companyId,
      assignedTo: userId,
      leadScore: 50, // Default score, would be calculated by AI
      score: 50, // Backward compatibility
      createdAt: existingLead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactDate: null,
      nextFollowUpDate: null
    }

    onSave(leadData)
    onClose()
    toast.success(existingLead ? 'Lead updated successfully' : 'Lead created successfully')
  }

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.accountId

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            {existingLead ? 'Edit Lead' : 'Create New Lead'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="account">Account Details</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input
                  value={formData.jobTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <Label>Lead Source</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building size={20} />
                    Account Association
                  </div>
                  {selectedAccount && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle size={12} className="mr-1" />
                      Account Selected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAccount ? (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{selectedAccount.name}</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAccountSelector(true)}
                      >
                        Change Account
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Industry: {selectedAccount.industry}</div>
                      <div>Size: {selectedAccount.size}</div>
                      {selectedAccount.website && <div>Website: {selectedAccount.website}</div>}
                      {selectedAccount.phone && <div>Phone: {selectedAccount.phone}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle size={48} className="mx-auto text-orange-500 mb-4" />
                    <h3 className="font-semibold mb-2">No Account Selected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Every lead must be associated with an account. Please select an existing account or create a new one.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setShowAccountSelector(true)}>
                        <Building size={16} className="mr-2" />
                        Select Account
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewAccountForm(true)}>
                        <Plus size={16} className="mr-2" />
                        Create New Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* Account Selector */}
                {showAccountSelector && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Select Account</h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowAccountSelector(false)}>
                        <X size={16} />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="Search accounts..."
                          value={accountSearch}
                          onChange={(e) => setAccountSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredAccounts.map(account => (
                          <div
                            key={account.id}
                            className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                            onClick={() => handleAccountSelect(account)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{account.name}</h5>
                                <p className="text-sm text-muted-foreground">{account.industry} • {account.size}</p>
                              </div>
                              <Badge variant="outline">{account.accountType}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setShowAccountSelector(false)
                          setShowNewAccountForm(true)
                        }}
                      >
                        <Plus size={16} className="mr-2" />
                        Create New Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* New Account Form */}
                {showNewAccountForm && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Create New Account</h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowNewAccountForm(false)}>
                        <X size={16} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={newAccountData.name}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <Label>Industry *</Label>
                        <Select value={newAccountData.industry} onValueChange={(value) => setNewAccountData(prev => ({ ...prev, industry: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input
                          value={newAccountData.website}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Phone</Label>
                        <Input
                          value={newAccountData.phone}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleCreateNewAccount}>
                        Create Account
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewAccountForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <span className={priority.color}>{priority.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estimated Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag size={12} />
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X size={12} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes about this lead..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isFormValid}
            className={isFormValid ? '' : 'opacity-50'}
          >
            {existingLead ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}