import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  NumberCircleOne,
  FloppyDisk as Save,
  Warning,
  CheckCircle,
  Info,
  ArrowClockwise as Reset
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Simplified interface to match our usage
interface QuoteNumberingConfig {
  companyId: string
  prefix: string
  year: number
  nextNumber: number
  digits: number
  separator: string
  format: string
  resetYearly: boolean
  isActive: boolean
  createdAt: Date
  lastModified: Date
}

interface QuoteNumberingConfigProps {
  companyId: string
  config: QuoteNumberingConfig | null
  onConfigUpdate: (config: QuoteNumberingConfig) => void
  userRole: string
}

export function QuoteNumberingConfig({ 
  companyId, 
  config, 
  onConfigUpdate, 
  userRole 
}: QuoteNumberingConfigProps) {
  const [formData, setFormData] = useState({
    prefix: config?.prefix || 'Q',
    year: config?.year || new Date().getFullYear(),
    nextNumber: config?.nextNumber || 1,
    digits: config?.digits || 4,
    separator: config?.separator || '-',
    format: config?.format || '{prefix}-{year}-{number}',
    resetYearly: config?.resetYearly || true,
    isActive: config?.isActive || true
  })

  const [preview, setPreview] = useState('')

  // Update preview when form data changes
  React.useEffect(() => {
    const paddedNumber = formData.nextNumber.toString().padStart(formData.digits, '0')
    const previewNumber = formData.format
      .replace('{prefix}', formData.prefix)
      .replace('{year}', formData.year.toString())
      .replace('{number}', paddedNumber)
    setPreview(previewNumber)
  }, [formData])

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Validation
    if (!formData.prefix.trim()) {
      toast.error('Prefix is required')
      return
    }

    if (formData.nextNumber < 1) {
      toast.error('Next number must be greater than 0')
      return
    }

    if (formData.digits < 1 || formData.digits > 10) {
      toast.error('Digits must be between 1 and 10')
      return
    }

    const updatedConfig: QuoteNumberingConfig = {
      companyId,
      prefix: formData.prefix.trim(),
      year: formData.year,
      nextNumber: formData.nextNumber,
      digits: formData.digits,
      separator: formData.separator,
      format: formData.format,
      resetYearly: formData.resetYearly,
      isActive: formData.isActive,
      createdAt: config?.createdAt || new Date(),
      lastModified: new Date()
    }

    onConfigUpdate(updatedConfig)
    toast.success('Quote numbering configuration updated successfully')
  }

  const handleReset = () => {
    setFormData({
      prefix: 'Q',
      year: new Date().getFullYear(),
      nextNumber: 1,
      digits: 4,
      separator: '-',
      format: '{prefix}-{year}-{number}',
      resetYearly: true,
      isActive: true
    })
    toast.info('Configuration reset to defaults')
  }

  const handleResetCounter = () => {
    setFormData(prev => ({ ...prev, nextNumber: 1 }))
    toast.info('Quote counter reset to 1')
  }

  const formatOptions = [
    '{prefix}-{year}-{number}',
    '{prefix}{year}{number}',
    '{prefix}-{number}-{year}',
    '{year}-{prefix}-{number}',
    '{prefix}_{year}_{number}',
    '{prefix}.{year}.{number}'
  ]

  const isAdmin = userRole === 'super_admin' || userRole === 'company_admin'

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Warning size={48} className="mx-auto mb-4 text-orange-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            Only administrators can configure quote numbering settings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NumberCircleOne size={20} />
            Quote Auto-Numbering Configuration
          </CardTitle>
          <CardDescription>
            Configure how quote numbers are automatically generated for your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Configuration Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-medium">Current Configuration</p>
                <p className="text-sm text-muted-foreground">
                  Next quote will be numbered: <Badge variant="outline">{preview}</Badge>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Reset size={16} className="mr-2" />
                Reset to Defaults
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>

          <Separator />

          {/* Numbering Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Number Format</h3>
              
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => handleInputChange('prefix', e.target.value.toUpperCase())}
                  placeholder="Q"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Letters that appear before the number (e.g., Q, QUOTE, INV)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="separator">Separator</Label>
                <Select 
                  value={formData.separator} 
                  onValueChange={(value) => handleInputChange('separator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Dash (-)</SelectItem>
                    <SelectItem value="_">Underscore (_)</SelectItem>
                    <SelectItem value=".">Dot (.)</SelectItem>
                    <SelectItem value="">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="digits">Number Digits</Label>
                <Input
                  id="digits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.digits}
                  onChange={(e) => handleInputChange('digits', parseInt(e.target.value) || 4)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of digits to use for the quote number (with leading zeros)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Number Format</Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value) => handleInputChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map(format => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Template for how the quote number is formatted
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Counter Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="year">Current Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2050"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextNumber">Next Quote Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="nextNumber"
                    type="number"
                    min="1"
                    value={formData.nextNumber}
                    onChange={(e) => handleInputChange('nextNumber', parseInt(e.target.value) || 1)}
                  />
                  <Button variant="outline" onClick={handleResetCounter}>
                    Reset to 1
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The next number that will be assigned to a new quote
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reset Counter Yearly</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically reset the counter to 1 each new year
                    </p>
                  </div>
                  <Switch
                    checked={formData.resetYearly}
                    onCheckedChange={(checked) => handleInputChange('resetYearly', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Auto-Numbering</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically assign numbers to new quotes
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Current Quote</p>
                  <p className="text-xl font-mono font-bold">{preview}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Next Quote</p>
                  <p className="text-xl font-mono font-bold">
                    {formData.format
                      .replace('{prefix}', formData.prefix)
                      .replace('{year}', formData.year.toString())
                      .replace('{number}', (formData.nextNumber + 1).toString().padStart(formData.digits, '0'))
                    }
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">After 10 Quotes</p>
                  <p className="text-xl font-mono font-bold">
                    {formData.format
                      .replace('{prefix}', formData.prefix)
                      .replace('{year}', formData.year.toString())
                      .replace('{number}', (formData.nextNumber + 10).toString().padStart(formData.digits, '0'))
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Information Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Auto-Numbering Information
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• Quote numbers are generated automatically when creating new quotes</p>
                <p>• The counter increments by 1 for each new quote</p>
                <p>• If yearly reset is enabled, the counter resets to 1 on January 1st</p>
                <p>• Changes to this configuration only affect new quotes</p>
                <p>• Manual quote numbers can still be set when creating quotes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}