import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Account, CRMFile } from '@/types/crm'
import { mockAccounts } from '@/data/crmMockData'
import { 
  Plus, 
  MagnifyingGlass as Search, 
  Download, 
  Upload, 
  Building,
  Eye,
  PencilSimple as Edit,
  Trash,
  DotsThreeVertical as MoreVertical,
  Users,
  CurrencyDollar as DollarSign,
  MapPin,
  Tag,
  FileText,
  Paperclip
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function AccountManagement({ companyId, userId, userRole }: AccountManagementProps) {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, mockAccounts)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [formData, setFormData] = useState<Partial<Account>>({})

  const accountTypes = [
    { value: 'prospect', label: 'Prospect', color: 'bg-yellow-500' },
    { value: 'customer', label: 'Customer', color: 'bg-green-500' },
    { value: 'partner', label: 'Partner', color: 'bg-blue-500' },
    { value: 'vendor', label: 'Vendor', color: 'bg-purple-500' },
    { value: 'competitor', label: 'Competitor', color: 'bg-red-500' }
  ]

  const accountSizes = ['startup', 'small', 'medium', 'large', 'enterprise']
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Marketing', 'Consulting']

  const filteredAccounts = (accounts || []).filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.website && account.website.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter
    const matchesSize = sizeFilter === 'all' || account.size === sizeFilter
    
    return matchesSearch && matchesType && matchesSize
  })

  const handleCreateAccount = () => {
    if (!formData.name || !formData.industry) {
      toast.error('Please fill in required fields')
      return
    }

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      companyId,
      name: formData.name,
      website: formData.website,
      industry: formData.industry,
      size: formData.size || 'small',
      revenue: formData.revenue,
      employees: formData.employees,
      address: formData.address || {},
      phone: formData.phone,
      description: formData.description,
      accountType: formData.accountType || 'prospect',
      status: 'active',
      owner: userId,
      tags: formData.tags || [],
      customFields: formData.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRevenue: 0,
      lastActivityDate: undefined,
      nextReviewDate: undefined
    }

    setAccounts(current => [...(current || []), newAccount])
    setFormData({})
    setShowAccountForm(false)
    toast.success('Account created successfully')
  }

  const handleUpdateAccount = (accountId: string, updates: Partial<Account>) => {
    setAccounts(current => {
      if (!current) return []
      return current.map(account =>
        account.id === accountId
          ? { ...account, ...updates, updatedAt: new Date().toISOString() }
          : account
      )
    })
    toast.success('Account updated successfully')
  }

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(current => {
      if (!current) return []
      return current.filter(account => account.id !== accountId)
    })
    toast.success('Account deleted successfully')
  }

  const handleBulkExport = () => {
    const csvContent = [
      ['Name', 'Industry', 'Type', 'Size', 'Revenue', 'Employees', 'Owner', 'Status'],
      ...filteredAccounts.map(account => [
        account.name,
        account.industry,
        account.accountType,
        account.size,
        account.revenue?.toString() || '',
        account.employees?.toString() || '',
        account.owner,
        account.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Accounts exported successfully')
  }

  const getTypeColor = (type: string) => {
    const typeConfig = accountTypes.find(t => t.value === type)
    return typeConfig?.color || 'bg-gray-500'
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = accountTypes.find(t => t.value === type)
    return (
      <Badge variant="outline" className={`${typeConfig?.color} text-white`}>
        {typeConfig?.label || type}
      </Badge>
    )
  }

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(revenue)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {accountTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {accountSizes.map(size => (
                <SelectItem key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Accounts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>CSV File</Label>
                  <Input type="file" accept=".csv" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a CSV file with columns: Name, Industry, Type, Size, Revenue, Employees
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountSizes.map(size => (
                        <SelectItem key={size} value={size}>
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Annual Revenue</Label>
                  <Input
                    type="number"
                    value={formData.revenue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Employees</Label>
                  <Input
                    type="number"
                    value={formData.employees || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, employees: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAccountForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAccount}>
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts ({filteredAccounts.length})</CardTitle>
          <CardDescription>
            Manage customer accounts and business relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Building size={16} />
                        {account.name}
                      </div>
                      {account.website && (
                        <div className="text-sm text-muted-foreground">{account.website}</div>
                      )}
                      {account.address?.city && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin size={12} />
                          {account.address.city}, {account.address.state}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.industry}</Badge>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(account.accountType)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {account.size.charAt(0).toUpperCase() + account.size.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatRevenue(account.revenue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {account.employees || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatRevenue(account.totalRevenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedAccount(account)}>
                          <Eye size={14} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit size={14} className="mr-2" />
                          Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)}>
                          <Trash size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Account Detail Dialog */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building size={20} />
                {selectedAccount.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Company Information</h3>
                  <div className="space-y-2">
                    <div><strong>Industry:</strong> {selectedAccount.industry}</div>
                    <div><strong>Type:</strong> {selectedAccount.accountType}</div>
                    <div><strong>Size:</strong> {selectedAccount.size}</div>
                    {selectedAccount.website && (
                      <div><strong>Website:</strong> 
                        <a href={selectedAccount.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 ml-1">
                          {selectedAccount.website}
                        </a>
                      </div>
                    )}
                    {selectedAccount.phone && (
                      <div><strong>Phone:</strong> {selectedAccount.phone}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Financial Information</h3>
                  <div className="space-y-2">
                    <div><strong>Annual Revenue:</strong> {formatRevenue(selectedAccount.revenue)}</div>
                    <div><strong>Total Revenue:</strong> {formatRevenue(selectedAccount.totalRevenue)}</div>
                    <div><strong>Employees:</strong> {selectedAccount.employees || 'N/A'}</div>
                    <div><strong>Owner:</strong> {selectedAccount.owner}</div>
                  </div>
                </div>
              </div>

              {selectedAccount.address && Object.keys(selectedAccount.address).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Address</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedAccount.address.street && <div>{selectedAccount.address.street}</div>}
                    {(selectedAccount.address.city || selectedAccount.address.state) && (
                      <div>
                        {selectedAccount.address.city}{selectedAccount.address.city && selectedAccount.address.state && ', '}{selectedAccount.address.state} {selectedAccount.address.zipCode}
                      </div>
                    )}
                    {selectedAccount.address.country && <div>{selectedAccount.address.country}</div>}
                  </div>
                </div>
              )}

              {selectedAccount.description && (
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedAccount.description}
                  </div>
                </div>
              )}

              {selectedAccount.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAccount.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}