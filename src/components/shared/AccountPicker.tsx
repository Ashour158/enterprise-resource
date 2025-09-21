import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building, Plus, Search, Check, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Account {
  id: string
  company_name: string
  industry: string
  account_type: string
  account_status: string
  phone: string
  email: string
  website: string
  address: string
  total_contract_value: number
  ai_overall_health_score: number
}

interface AccountPickerProps {
  companyId: string
  selectedAccountId?: string
  selectedAccountName?: string
  onAccountSelect: (accountId: string, accountName: string) => void
  onCreateAccount?: (accountData: { company_name: string; industry: string; email: string; phone: string }) => void
  placeholder?: string
  disabled?: boolean
}

export function AccountPicker({ 
  companyId, 
  selectedAccountId, 
  selectedAccountName,
  onAccountSelect, 
  onCreateAccount,
  placeholder = "Select or create account...",
  disabled = false
}: AccountPickerProps) {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createAccountData, setCreateAccountData] = useState({
    company_name: '',
    industry: '',
    email: '',
    phone: ''
  })

  // Initialize with mock accounts if empty
  useEffect(() => {
    if (accounts.length === 0) {
      const mockAccounts: Account[] = [
        {
          id: 'account-001',
          company_name: 'TechCorp Industries',
          industry: 'Technology',
          account_type: 'enterprise',
          account_status: 'active',
          phone: '+1 (555) 123-4567',
          email: 'contact@techcorp.com',
          website: 'https://techcorp.com',
          address: '123 Technology Ave, San Francisco, CA 94105',
          total_contract_value: 2500000,
          ai_overall_health_score: 89
        },
        {
          id: 'account-002',
          company_name: 'Healthcare Solutions Inc',
          industry: 'Healthcare',
          account_type: 'mid_market',
          account_status: 'active',
          phone: '+1 (555) 987-6543',
          email: 'info@healthcaresolutions.com',
          website: 'https://healthcaresolutions.com',
          address: '456 Medical Blvd, Boston, MA 02101',
          total_contract_value: 850000,
          ai_overall_health_score: 76
        },
        {
          id: 'account-003',
          company_name: 'InnovateTech Startup',
          industry: 'Technology',
          account_type: 'startup',
          account_status: 'prospect',
          phone: '+1 (555) 456-7890',
          email: 'hello@innovatetech.io',
          website: 'https://innovatetech.io',
          address: '789 Innovation Way, Austin, TX 78701',
          total_contract_value: 0,
          ai_overall_health_score: 65
        }
      ]
      setAccounts(mockAccounts)
    }
  }, [accounts.length, setAccounts])

  const filteredAccounts = accounts.filter(account =>
    account.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedAccount = accounts.find(account => account.id === selectedAccountId)

  const handleAccountSelect = (account: Account) => {
    onAccountSelect(account.id, account.company_name)
    setIsOpen(false)
    setSearchTerm('')
    toast.success(`Selected account: ${account.company_name}`)
  }

  const handleCreateAccount = async () => {
    if (!createAccountData.company_name || !createAccountData.email) {
      toast.error('Company name and email are required')
      return
    }

    const newAccount: Account = {
      id: `account-${Date.now()}`,
      company_name: createAccountData.company_name,
      industry: createAccountData.industry || 'Other',
      account_type: 'prospect',
      account_status: 'prospect',
      phone: createAccountData.phone,
      email: createAccountData.email,
      website: '',
      address: '',
      total_contract_value: 0,
      ai_overall_health_score: 50
    }

    setAccounts(currentAccounts => [...currentAccounts, newAccount])
    onAccountSelect(newAccount.id, newAccount.company_name)
    
    if (onCreateAccount) {
      onCreateAccount(createAccountData)
    }

    setShowCreateForm(false)
    setCreateAccountData({ company_name: '', industry: '', email: '', phone: '' })
    toast.success(`Created new account: ${newAccount.company_name}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              {selectedAccount ? (
                <div className="text-left">
                  <div className="font-medium">{selectedAccount.company_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedAccount.industry} • {selectedAccount.account_type}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search accounts..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No accounts found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setShowCreateForm(true)}
                  className="p-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">Create New Account</span>
                  </div>
                </CommandItem>
                {filteredAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    onSelect={() => handleAccountSelect(account)}
                    className="p-2"
                  >
                    <Card className="w-full border-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{account.company_name}</h4>
                              {selectedAccountId === account.id && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {account.industry}
                              </Badge>
                              <Badge 
                                variant={account.account_status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {account.account_status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {account.email} • {account.phone}
                            </div>
                            {account.total_contract_value > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Contract Value: {formatCurrency(account.total_contract_value)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Health Score</div>
                            <div className={`text-sm font-medium ${getHealthColor(account.ai_overall_health_score)}`}>
                              {account.ai_overall_health_score}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Account Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to link with this lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={createAccountData.company_name}
                onChange={(e) => setCreateAccountData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={createAccountData.industry}
                onChange={(e) => setCreateAccountData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={createAccountData.email}
                onChange={(e) => setCreateAccountData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={createAccountData.phone}
                onChange={(e) => setCreateAccountData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreateAccount}>
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountPicker