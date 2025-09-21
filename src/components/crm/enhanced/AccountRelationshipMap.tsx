import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Account, Contact, Deal } from '@/types/crm'
import { 
  Building, 
  Users, 
  Handshake, 
  Plus, 
  Link, 
  ArrowRight, 
  Edit, 
  Trash,
  Target,
  Star,
  Clock,
  TrendUp,
  Network,
  GitBranch,
  Hierarchy,
  Flow,
  ConnectLine,
  Group,
  UserCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AccountRelationship {
  id: string
  fromAccountId: string
  toAccountId: string
  relationshipType: 'parent' | 'subsidiary' | 'partner' | 'vendor' | 'customer' | 'competitor' | 'referral_source'
  strength: 'weak' | 'medium' | 'strong'
  description: string
  startDate: string
  endDate?: string
  value?: number
  contacts: string[] // Contact IDs involved in this relationship
  deals: string[] // Deal IDs related to this relationship
  isActive: boolean
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

interface AccountRelationshipMapProps {
  companyId: string
  userId: string
  accounts: Account[]
  selectedAccountId?: string
  onAccountSelect?: (accountId: string) => void
}

const relationshipTypes = [
  { value: 'parent', label: 'Parent Company', color: 'bg-blue-500', icon: Building },
  { value: 'subsidiary', label: 'Subsidiary', color: 'bg-green-500', icon: Building },
  { value: 'partner', label: 'Strategic Partner', color: 'bg-purple-500', icon: Handshake },
  { value: 'vendor', label: 'Vendor/Supplier', color: 'bg-orange-500', icon: Target },
  { value: 'customer', label: 'Customer', color: 'bg-teal-500', icon: Users },
  { value: 'competitor', label: 'Competitor', color: 'bg-red-500', icon: Target },
  { value: 'referral_source', label: 'Referral Source', color: 'bg-yellow-500', icon: Star }
]

const strengthLevels = [
  { value: 'weak', label: 'Weak', color: 'bg-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'strong', label: 'Strong', color: 'bg-green-500' }
]

const mockRelationships: AccountRelationship[] = [
  {
    id: 'rel-001',
    fromAccountId: 'acc-001',
    toAccountId: 'acc-002',
    relationshipType: 'partner',
    strength: 'strong',
    description: 'Strategic technology partnership for AI solutions',
    startDate: '2024-01-01',
    value: 250000,
    contacts: ['contact-001', 'contact-002'],
    deals: ['deal-001'],
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    metadata: {
      renewal_date: '2024-12-31',
      contract_value: 250000,
      key_stakeholders: ['John Smith', 'Sarah Johnson']
    }
  },
  {
    id: 'rel-002',
    fromAccountId: 'acc-001',
    toAccountId: 'acc-003',
    relationshipType: 'customer',
    strength: 'medium',
    description: 'Customer relationship for healthcare solutions',
    startDate: '2023-06-15',
    value: 150000,
    contacts: ['contact-003'],
    deals: ['deal-002', 'deal-003'],
    isActive: true,
    createdAt: '2023-06-15T09:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z',
    metadata: {
      last_purchase: '2024-01-10',
      satisfaction_score: 4.2
    }
  }
]

export function AccountRelationshipMap({ companyId, userId, accounts, selectedAccountId, onAccountSelect }: AccountRelationshipMapProps) {
  const [relationships, setRelationships] = useKV<AccountRelationship[]>(`account-relationships-${companyId}`, mockRelationships)
  const [showRelationshipForm, setShowRelationshipForm] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<AccountRelationship | null>(null)
  const [viewMode, setViewMode] = useState<'hierarchy' | 'network' | 'list'>('network')
  const [filterType, setFilterType] = useState('all')
  const [filterStrength, setFilterStrength] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Partial<AccountRelationship>>({})

  const filteredRelationships = (relationships || []).filter(rel => {
    const matchesSearch = searchTerm === '' || 
      rel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAccountName(rel.fromAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAccountName(rel.toAccountId).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || rel.relationshipType === filterType
    const matchesStrength = filterStrength === 'all' || rel.strength === filterStrength
    const isActive = rel.isActive
    
    return matchesSearch && matchesType && matchesStrength && isActive
  })

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    return account?.name || 'Unknown Account'
  }

  const getRelationshipConfig = (type: string) => {
    return relationshipTypes.find(rt => rt.value === type) || relationshipTypes[0]
  }

  const getStrengthConfig = (strength: string) => {
    return strengthLevels.find(sl => sl.value === strength) || strengthLevels[0]
  }

  const handleCreateRelationship = () => {
    if (!formData.fromAccountId || !formData.toAccountId || !formData.relationshipType) {
      toast.error('Please fill in required fields')
      return
    }

    if (formData.fromAccountId === formData.toAccountId) {
      toast.error('Cannot create relationship with the same account')
      return
    }

    const newRelationship: AccountRelationship = {
      id: `rel-${Date.now()}`,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      relationshipType: formData.relationshipType as any,
      strength: formData.strength || 'medium',
      description: formData.description || '',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      value: formData.value,
      contacts: [],
      deals: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    }

    setRelationships(current => [...(current || []), newRelationship])
    setFormData({})
    setShowRelationshipForm(false)
    toast.success('Relationship created successfully')
  }

  const handleDeleteRelationship = (relationshipId: string) => {
    setRelationships(current => {
      if (!current) return []
      return current.filter(rel => rel.id !== relationshipId)
    })
    toast.success('Relationship deleted successfully')
  }

  const getRelatedAccounts = (accountId: string) => {
    const related = new Set<string>()
    filteredRelationships.forEach(rel => {
      if (rel.fromAccountId === accountId) {
        related.add(rel.toAccountId)
      } else if (rel.toAccountId === accountId) {
        related.add(rel.fromAccountId)
      }
    })
    return Array.from(related).map(id => accounts.find(acc => acc.id === id)).filter(Boolean) as Account[]
  }

  const getRelationshipValue = (relationships: AccountRelationship[]) => {
    return relationships.reduce((sum, rel) => sum + (rel.value || 0), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const renderNetworkView = () => {
    const centerAccount = selectedAccountId ? accounts.find(acc => acc.id === selectedAccountId) : null
    
    if (!centerAccount) {
      return (
        <div className="text-center py-12">
          <Network className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">Select an Account</p>
          <p className="text-gray-500">Choose an account to view its relationship network</p>
        </div>
      )
    }

    const relatedAccounts = getRelatedAccounts(centerAccount.id)
    const accountRelationships = filteredRelationships.filter(rel => 
      rel.fromAccountId === centerAccount.id || rel.toAccountId === centerAccount.id
    )

    return (
      <div className="space-y-6">
        {/* Center Account */}
        <div className="text-center">
          <Card className="inline-block bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <Building className="mx-auto h-8 w-8 mb-2" />
              <h3 className="font-bold text-lg">{centerAccount.name}</h3>
              <p className="text-sm opacity-90">{centerAccount.industry}</p>
              <Badge variant="secondary" className="mt-2">
                Center Account
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Related Accounts */}
        {relatedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedAccounts.map(account => {
              const relationship = accountRelationships.find(rel => 
                rel.fromAccountId === account.id || rel.toAccountId === account.id
              )
              const relationshipConfig = getRelationshipConfig(relationship?.relationshipType || '')
              const strengthConfig = getStrengthConfig(relationship?.strength || '')
              const IconComponent = relationshipConfig.icon

              return (
                <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onAccountSelect?.(account.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${relationshipConfig.color} text-white`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-muted-foreground">{account.industry}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={relationshipConfig.color + ' text-white'}>
                          {relationshipConfig.label}
                        </Badge>
                        <Badge className={strengthConfig.color + ' text-white'}>
                          {strengthConfig.label}
                        </Badge>
                      </div>
                      
                      {relationship?.value && (
                        <div className="text-sm text-muted-foreground">
                          Value: {formatCurrency(relationship.value)}
                        </div>
                      )}
                      
                      {relationship?.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relationship.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Link className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No relationships found for this account</p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setFormData({ fromAccountId: centerAccount.id })
                setShowRelationshipForm(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Relationship
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderListView = () => (
    <div className="space-y-4">
      {filteredRelationships.map(relationship => {
        const fromAccount = accounts.find(acc => acc.id === relationship.fromAccountId)
        const toAccount = accounts.find(acc => acc.id === relationship.toAccountId)
        const relationshipConfig = getRelationshipConfig(relationship.relationshipType)
        const strengthConfig = getStrengthConfig(relationship.strength)
        const IconComponent = relationshipConfig.icon

        return (
          <Card key={relationship.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-full ${relationshipConfig.color} text-white`}>
                    <IconComponent size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{fromAccount?.name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{toAccount?.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={relationshipConfig.color + ' text-white'}>
                        {relationshipConfig.label}
                      </Badge>
                      <Badge className={strengthConfig.color + ' text-white'}>
                        {strengthConfig.label}
                      </Badge>
                    </div>
                    
                    {relationship.description && (
                      <p className="text-sm text-gray-600">{relationship.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  {relationship.value && (
                    <div className="font-medium">{formatCurrency(relationship.value)}</div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Since {new Date(relationship.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRelationship(relationship)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteRelationship(relationship.id)}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Relationships</h2>
          <p className="text-muted-foreground">
            Visualize and manage connections between accounts
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="hierarchy">Hierarchy</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={showRelationshipForm} onOpenChange={setShowRelationshipForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Account Relationship</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Account *</Label>
                  <Select
                    value={formData.fromAccountId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fromAccountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>To Account *</Label>
                  <Select
                    value={formData.toAccountId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, toAccountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.id !== formData.fromAccountId).map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Relationship Type *</Label>
                  <Select
                    value={formData.relationshipType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Strength</Label>
                  <Select
                    value={formData.strength}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, strength: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strength" />
                    </SelectTrigger>
                    <SelectContent>
                      {strengthLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Relationship Value</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.value || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the relationship..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowRelationshipForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRelationship}>
                  Create Relationship
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search relationships..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Relationship type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {relationshipTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStrength} onValueChange={setFilterStrength}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Strength" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Strengths</SelectItem>
            {strengthLevels.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Relationships</p>
                <p className="text-2xl font-bold">{filteredRelationships.length}</p>
              </div>
              <Network className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(getRelationshipValue(filteredRelationships))}</p>
              </div>
              <TrendUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strong Relationships</p>
                <p className="text-2xl font-bold">
                  {filteredRelationships.filter(rel => rel.strength === 'strong').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Partners</p>
                <p className="text-2xl font-bold">
                  {filteredRelationships.filter(rel => rel.relationshipType === 'partner').length}
                </p>
              </div>
              <Handshake className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'network' && renderNetworkView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'hierarchy' && (
            <div className="text-center py-12">
              <Hierarchy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">Hierarchy View</p>
              <p className="text-gray-500">Coming soon - Organizational hierarchy visualization</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}