import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Quote, Account, Contact, QuoteLineItem } from '@/types/crm'
import { 
  Plus, 
  FloppyDisk as Save, 
  X,
  Trash,
  User,
  Buildings,
  CurrencyDollar as DollarSign,
  Calendar,
  PencilSimple as Edit,
  MagnifyingGlass as Search,
  CheckCircle,
  Calculator
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteEditorProps {
  companyId: string
  userId: string
  userRole: string
  quote?: Quote | null
  accounts: Account[]
  contacts: Contact[]
  isCreating: boolean
  onSave: (quoteData: Partial<Quote>) => void
  onCancel: () => void
  generateQuoteNumber: () => string
}

export function QuoteEditor({
  companyId,
  userId,
  userRole,
  quote,
  accounts,
  contacts,
  isCreating,
  onSave,
  onCancel,
  generateQuoteNumber
}: QuoteEditorProps) {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    accountId: '',
    contactId: '',
    currency: 'USD',
    validUntil: '',
    terms: 'Net 30 days',
    notes: '',
    taxRate: 0,
    discountRate: 0
  })
  
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [accountSearch, setAccountSearch] = useState('')
  const [contactSearch, setContactSearch] = useState('')

  // Initialize form data when quote changes
  useEffect(() => {
    if (quote && !isCreating) {
      setFormData({
        title: quote.title || '',
        description: quote.description || '',
        accountId: quote.accountId || '',
        contactId: quote.contactId || '',
        currency: quote.currency || 'USD',
        validUntil: quote.validUntil ? quote.validUntil.toISOString().split('T')[0] : '',
        terms: quote.terms || 'Net 30 days',
        notes: quote.notes || '',
        taxRate: quote.taxRate || 0,
        discountRate: quote.discountRate || 0
      })
      setLineItems(quote.lineItems || [])
    } else if (isCreating) {
      // Reset form for new quote
      setFormData({
        title: '',
        description: '',
        accountId: '',
        contactId: '',
        currency: 'USD',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        terms: 'Net 30 days',
        notes: '',
        taxRate: 8.5,
        discountRate: 0
      })
      setLineItems([])
    }
  }, [quote, isCreating])

  // Get selected account and contact
  const selectedAccount = accounts.find(a => a.id === formData.accountId)
  const selectedContact = contacts.find(c => c.id === formData.contactId)
  
  // Filter contacts by selected account
  const accountContacts = contacts.filter(c => c.accountId === formData.accountId)

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
  const discountAmount = (subtotal * formData.discountRate) / 100
  const discountedSubtotal = subtotal - discountAmount
  const taxAmount = (discountedSubtotal * formData.taxRate) / 100
  const totalAmount = discountedSubtotal + taxAmount

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAccountSelect = (account: Account) => {
    setFormData(prev => ({ 
      ...prev, 
      accountId: account.id,
      contactId: '' // Reset contact when account changes
    }))
    setShowAccountDialog(false)
    setAccountSearch('')
  }

  const handleContactSelect = (contact: Contact) => {
    setFormData(prev => ({ ...prev, contactId: contact.id }))
    setShowContactDialog(false)
    setContactSearch('')
  }

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountAmount: 0,
      lineTotal: 0,
      order: lineItems.length + 1
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updatedItems = [...lineItems]
    const item = updatedItems[index]
    
    // Update the field
    ;(item as any)[field] = value
    
    // Recalculate line total when quantity, unitPrice, or discount changes
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      const discount = Number(item.discount)
      
      item.discountAmount = (unitPrice * quantity * discount) / 100
      item.lineTotal = (unitPrice * quantity) - item.discountAmount
    }
    
    setLineItems(updatedItems)
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Quote title is required')
      return
    }
    
    if (!formData.accountId) {
      toast.error('Please select an account')
      return
    }
    
    if (!formData.contactId) {
      toast.error('Please select a contact')
      return
    }

    const quoteData: Partial<Quote> = {
      ...formData,
      validUntil: new Date(formData.validUntil),
      lineItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      quoteNumber: isCreating ? generateQuoteNumber() : quote?.quoteNumber
    }

    onSave(quoteData)
  }

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    account.industry?.toLowerCase().includes(accountSearch.toLowerCase())
  )

  const filteredContacts = accountContacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.jobTitle?.toLowerCase().includes(contactSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isCreating ? 'Create New Quote' : `Edit Quote ${quote?.quoteNumber}`}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                {isCreating ? 'Create Quote' : 'Update Quote'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quote Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter quote title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter quote description"
              rows={3}
            />
          </div>

          {/* Account and Contact Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account *</Label>
              <div className="flex gap-2">
                {selectedAccount ? (
                  <div className="flex-1 p-2 border rounded-md bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Buildings size={16} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{selectedAccount.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedAccount.industry}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAccountDialog(true)}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Buildings size={16} className="mr-2" />
                        Select Account
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact *</Label>
              <div className="flex gap-2">
                {selectedContact ? (
                  <div className="flex-1 p-2 border rounded-md bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {selectedContact.firstName} {selectedContact.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedContact.jobTitle} • {selectedContact.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowContactDialog(true)}
                        disabled={!formData.accountId}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        disabled={!formData.accountId}
                      >
                        <User size={16} className="mr-2" />
                        Select Contact
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
              {!formData.accountId && (
                <p className="text-xs text-muted-foreground">
                  Select an account first to choose a contact
                </p>
              )}
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <Input
                id="discountRate"
                type="number"
                step="0.1"
                value={formData.discountRate}
                onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Line Items</h3>
              <Button onClick={addLineItem} size="sm">
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </div>

            {lineItems.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Item Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[80px]">Qty</TableHead>
                        <TableHead className="w-[100px]">Unit Price</TableHead>
                        <TableHead className="w-[80px]">Discount %</TableHead>
                        <TableHead className="w-[100px]">Line Total</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              value={item.name}
                              onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                              placeholder="Item name"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Description"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                              min="0"
                              step="0.1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formData.currency} {item.lineTotal.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No line items</h3>
                    <p className="text-sm mb-4">Add items to start building your quote</p>
                    <Button onClick={addLineItem}>
                      <Plus size={16} className="mr-2" />
                      Add First Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quote Totals */}
          {lineItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formData.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discountRate > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({formData.discountRate}%):</span>
                      <span>-{formData.currency} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.taxRate}%):</span>
                      <span>{formData.currency} {taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formData.currency} {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder="Enter terms and conditions"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter internal notes"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Selection Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAccounts.map(account => (
                <div
                  key={account.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex items-center gap-3">
                    <Buildings size={20} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.industry} • {account.size}
                      </p>
                      {account.website && (
                        <p className="text-xs text-muted-foreground">{account.website}</p>
                      )}
                    </div>
                    {formData.accountId === account.id && (
                      <CheckCircle size={20} className="text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Selection Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contact.jobTitle} • {contact.email}
                      </p>
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      )}
                    </div>
                    {formData.contactId === contact.id && (
                      <CheckCircle size={20} className="text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}