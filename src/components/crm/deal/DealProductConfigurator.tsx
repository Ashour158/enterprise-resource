import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Calculator,
  Package,
  DollarSign,
  Percent,
  TrendUp,
  Settings,
  Eye,
  PencilSimple,
  TrashSimple
} from '@phosphor-icons/react'

interface Product {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  currency: string
  isRecurring: boolean
  billingCycle?: 'monthly' | 'annually'
  features: string[]
  tier: 'basic' | 'standard' | 'premium' | 'enterprise'
}

interface ConfiguredProduct {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  discountType: 'percentage' | 'fixed'
  total: number
  customization: Record<string, any>
}

interface DealProductConfiguratorProps {
  dealId: string
  dealValue: number
}

export function DealProductConfigurator({ dealId, dealValue }: DealProductConfiguratorProps) {
  const [configuredProducts, setConfiguredProducts] = useState<ConfiguredProduct[]>([])
  const [availableProducts] = useState<Product[]>([
    {
      id: 'prod-1',
      name: 'Enterprise CRM Platform',
      description: 'Complete customer relationship management solution',
      category: 'Software',
      basePrice: 99,
      currency: 'USD',
      isRecurring: true,
      billingCycle: 'monthly',
      features: ['Lead Management', 'Deal Pipeline', 'Contact Management', 'Analytics'],
      tier: 'enterprise'
    },
    {
      id: 'prod-2',
      name: 'Implementation Services',
      description: 'Professional services for system setup and configuration',
      category: 'Services',
      basePrice: 15000,
      currency: 'USD',
      isRecurring: false,
      features: ['Data Migration', 'Custom Configuration', 'User Training', 'Go-Live Support'],
      tier: 'premium'
    },
    {
      id: 'prod-3',
      name: 'API Integration Package',
      description: 'Custom API integrations with third-party systems',
      category: 'Integration',
      basePrice: 8500,
      currency: 'USD',
      isRecurring: false,
      features: ['REST API', 'Webhook Support', 'Real-time Sync', 'Custom Connectors'],
      tier: 'standard'
    },
    {
      id: 'prod-4',
      name: 'Premium Support',
      description: '24/7 priority support with dedicated account manager',
      category: 'Support',
      basePrice: 299,
      currency: 'USD',
      isRecurring: true,
      billingCycle: 'monthly',
      features: ['24/7 Support', 'Dedicated Manager', 'Priority Response', 'Phone Support'],
      tier: 'premium'
    }
  ])
  
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  const addProduct = () => {
    const product = availableProducts.find(p => p.id === selectedProductId)
    if (!product) return

    const newConfiguredProduct: ConfiguredProduct = {
      productId: product.id,
      product,
      quantity: 1,
      unitPrice: product.basePrice,
      discount: 0,
      discountType: 'percentage',
      total: product.basePrice,
      customization: {}
    }

    setConfiguredProducts(prev => [...prev, newConfiguredProduct])
    setSelectedProductId('')
    setShowAddProduct(false)
  }

  const updateProduct = (index: number, updates: Partial<ConfiguredProduct>) => {
    setConfiguredProducts(prev => 
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, ...updates }
          
          // Recalculate total
          let subtotal = updated.quantity * updated.unitPrice
          if (updated.discountType === 'percentage') {
            subtotal = subtotal * (1 - updated.discount / 100)
          } else {
            subtotal = subtotal - updated.discount
          }
          updated.total = Math.max(0, subtotal)
          
          return updated
        }
        return item
      })
    )
  }

  const removeProduct = (index: number) => {
    setConfiguredProducts(prev => prev.filter((_, i) => i !== index))
  }

  const getTotalValue = () => {
    return configuredProducts.reduce((sum, item) => sum + item.total, 0)
  }

  const getRecurringValue = () => {
    return configuredProducts
      .filter(item => item.product.isRecurring)
      .reduce((sum, item) => sum + item.total, 0)
  }

  const getOneTimeValue = () => {
    return configuredProducts
      .filter(item => !item.product.isRecurring)
      .reduce((sum, item) => sum + item.total, 0)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Configuration</h3>
          <p className="text-muted-foreground">Configure products and services for this deal</p>
        </div>
        <Button 
          onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(getTotalValue())}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recurring (Monthly)</p>
                <p className="text-xl font-bold">{formatCurrency(getRecurringValue())}</p>
              </div>
              <TrendUp className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">One-time</p>
                <p className="text-xl font-bold">{formatCurrency(getOneTimeValue())}</p>
              </div>
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Dialog */}
      {showAddProduct && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts
                      .filter(product => !configuredProducts.some(cp => cp.productId === product.id))
                      .map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            <Badge className={getTierColor(product.tier)}>
                              {product.tier}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatCurrency(product.basePrice)}
                              {product.isRecurring && '/mo'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addProduct} disabled={!selectedProductId}>
                  Add Product
                </Button>
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configured Products */}
      <div className="space-y-4">
        {configuredProducts.map((configuredProduct, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{configuredProduct.product.name}</h4>
                      <Badge className={getTierColor(configuredProduct.product.tier)}>
                        {configuredProduct.product.tier}
                      </Badge>
                      {configuredProduct.product.isRecurring && (
                        <Badge variant="outline">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {configuredProduct.product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {configuredProduct.product.features.map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashSimple className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProduct(index, { 
                          quantity: Math.max(1, configuredProduct.quantity - 1) 
                        })}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={configuredProduct.quantity}
                        onChange={(e) => updateProduct(index, { 
                          quantity: Math.max(1, parseInt(e.target.value) || 1) 
                        })}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProduct(index, { 
                          quantity: configuredProduct.quantity + 1 
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={configuredProduct.unitPrice}
                      onChange={(e) => updateProduct(index, { 
                        unitPrice: parseFloat(e.target.value) || 0 
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>Discount</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={configuredProduct.discount}
                        onChange={(e) => updateProduct(index, { 
                          discount: parseFloat(e.target.value) || 0 
                        })}
                        min="0"
                        step="0.01"
                      />
                      <Select 
                        value={configuredProduct.discountType}
                        onValueChange={(value: 'percentage' | 'fixed') => 
                          updateProduct(index, { discountType: value })
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Total</Label>
                    <div className="font-bold text-lg text-green-600">
                      {formatCurrency(configuredProduct.total)}
                      {configuredProduct.product.isRecurring && 
                        <span className="text-sm text-muted-foreground">/mo</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Pricing Calculation Breakdown */}
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">Pricing Breakdown</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Base ({configuredProduct.quantity} × {formatCurrency(configuredProduct.unitPrice)}):</span>
                      <span>{formatCurrency(configuredProduct.quantity * configuredProduct.unitPrice)}</span>
                    </div>
                    {configuredProduct.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>
                          Discount ({configuredProduct.discount}{configuredProduct.discountType === 'percentage' ? '%' : ' USD'}):
                        </span>
                        <span>
                          -{formatCurrency(
                            configuredProduct.discountType === 'percentage'
                              ? (configuredProduct.quantity * configuredProduct.unitPrice * configuredProduct.discount / 100)
                              : configuredProduct.discount
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(configuredProduct.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configuredProducts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No products configured</h3>
            <p className="text-muted-foreground mb-4">
              Add products and services to build your deal configuration
            </p>
            <Button onClick={() => setShowAddProduct(true)}>
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {configuredProducts.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Deal Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>One-time Revenue:</span>
                    <span className="font-bold">{formatCurrency(getOneTimeValue())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Recurring:</span>
                    <span className="font-bold">{formatCurrency(getRecurringValue())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Recurring:</span>
                    <span className="font-bold">{formatCurrency(getRecurringValue() * 12)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Deal Value:</span>
                    <span className="text-lg text-green-600">
                      {formatCurrency(getTotalValue())}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Revenue Breakdown</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>One-time</span>
                      <span>{((getOneTimeValue() / getTotalValue()) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(getOneTimeValue() / getTotalValue()) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recurring</span>
                      <span>{((getRecurringValue() / getTotalValue()) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(getRecurringValue() / getTotalValue()) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}