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
import { Progress } from '@/components/ui/progress'
import { Forecast, ForecastDeal } from '@/types/crm'
import { 
  Plus, 
  TrendUp,
  TrendDown,
  Target,
  Calendar,
  CurrencyDollar as DollarSign,
  ChartLine,
  CheckCircle,
  Clock,
  Warning,
  PaperPlaneTilt as Send,
  Eye
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ForecastManagementProps {
  companyId: string
  userId: string
  userRole: string
}

const mockForecasts: Forecast[] = [
  {
    id: 'forecast-001',
    companyId: 'comp-001',
    name: 'Q1 2024 Sales Forecast',
    period: 'quarterly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    ownerId: 'user-001',
    teamId: 'team-sales',
    targets: {
      revenue: 500000,
      deals: 25,
      newCustomers: 15
    },
    actuals: {
      revenue: 425000,
      deals: 22,
      newCustomers: 12,
      pipeline: 750000
    },
    forecast: {
      committed: 450000,
      bestCase: 520000,
      worstCase: 380000,
      pipeline: 750000
    },
    deals: [
      {
        dealId: 'deal-001',
        dealName: 'Tech Solutions Enterprise',
        value: 75000,
        probability: 90,
        closeDate: new Date('2024-02-15'),
        stage: 'negotiation',
        category: 'committed',
        notes: 'Contract in final review'
      },
      {
        dealId: 'deal-002',
        dealName: 'Marketing Pro Platform',
        value: 45000,
        probability: 70,
        closeDate: new Date('2024-03-10'),
        stage: 'proposal',
        category: 'best_case',
        notes: 'Awaiting budget approval'
      }
    ],
    adjustments: [
      {
        id: 'adj-001',
        type: 'add',
        amount: 25000,
        reason: 'Additional services for existing client',
        category: 'committed',
        createdBy: 'user-001',
        createdAt: new Date('2024-01-15')
      }
    ],
    status: 'submitted',
    submissions: [
      {
        id: 'sub-001',
        submittedBy: 'user-001',
        submittedAt: new Date('2024-01-31'),
        status: 'approved',
        approvedBy: 'manager-001',
        approvedAt: new Date('2024-02-01'),
        comments: 'Forecast looks realistic based on pipeline'
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'forecast-002',
    companyId: 'comp-001',
    name: 'January 2024 Monthly Forecast',
    period: 'monthly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    ownerId: 'user-002',
    targets: {
      revenue: 150000,
      deals: 8,
      newCustomers: 5
    },
    actuals: {
      revenue: 165000,
      deals: 9,
      newCustomers: 6,
      pipeline: 200000
    },
    forecast: {
      committed: 140000,
      bestCase: 175000,
      worstCase: 120000,
      pipeline: 200000
    },
    deals: [
      {
        dealId: 'deal-003',
        dealName: 'Startup Package Deal',
        value: 25000,
        probability: 85,
        closeDate: new Date('2024-01-25'),
        stage: 'closing',
        category: 'committed'
      }
    ],
    adjustments: [],
    status: 'final',
    submissions: [
      {
        id: 'sub-002',
        submittedBy: 'user-002',
        submittedAt: new Date('2024-01-28'),
        status: 'approved',
        approvedBy: 'manager-001',
        approvedAt: new Date('2024-01-29'),
        comments: 'Exceeded targets for January'
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-29')
  }
]

export function ForecastManagement({ companyId, userId, userRole }: ForecastManagementProps) {
  const [forecasts, setForecasts] = useKV<Forecast[]>(`forecasts-${companyId}`, mockForecasts)
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null)
  const [showForecastForm, setShowForecastForm] = useState(false)
  const [periodFilter, setPeriodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState<Partial<Forecast>>({})

  const periods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-500' },
    { value: 'approved', label: 'Approved', color: 'bg-green-500' },
    { value: 'final', label: 'Final', color: 'bg-purple-500' }
  ]

  const filteredForecasts = (forecasts || []).filter(forecast => {
    const matchesPeriod = periodFilter === 'all' || forecast.period === periodFilter
    const matchesStatus = statusFilter === 'all' || forecast.status === statusFilter
    return matchesPeriod && matchesStatus
  })

  const handleCreateForecast = () => {
    if (!formData.name || !formData.period || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in required fields')
      return
    }

    const newForecast: Forecast = {
      id: `forecast-${Date.now()}`,
      companyId,
      name: formData.name,
      period: formData.period as Forecast['period'],
      startDate: formData.startDate,
      endDate: formData.endDate,
      ownerId: formData.ownerId || userId,
      teamId: formData.teamId,
      targets: formData.targets || { revenue: 0, deals: 0, newCustomers: 0 },
      actuals: { revenue: 0, deals: 0, newCustomers: 0, pipeline: 0 },
      forecast: { committed: 0, bestCase: 0, worstCase: 0, pipeline: 0 },
      deals: [],
      adjustments: [],
      status: 'draft',
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setForecasts(current => [...(current || []), newForecast])
    setFormData({})
    setShowForecastForm(false)
    toast.success('Forecast created successfully')
  }

  const handleUpdateForecast = (forecastId: string, updates: Partial<Forecast>) => {
    setForecasts(current => {
      if (!current) return []
      return current.map(forecast =>
        forecast.id === forecastId
          ? { ...forecast, ...updates, updatedAt: new Date() }
          : forecast
      )
    })
    toast.success('Forecast updated successfully')
  }

  const handleSubmitForecast = (forecastId: string) => {
    const newSubmission = {
      id: `sub-${Date.now()}`,
      submittedBy: userId,
      submittedAt: new Date(),
      status: 'pending' as const,
      comments: 'Forecast submitted for review'
    }

    handleUpdateForecast(forecastId, {
      status: 'submitted',
      submissions: [...(selectedForecast?.submissions || []), newSubmission]
    })
    toast.success('Forecast submitted for approval')
  }

  const calculateAttainment = (actual: number, target: number) => {
    if (target === 0) return 0
    return Math.round((actual / target) * 100)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status)
    return (
      <Badge variant="outline" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getAttainmentColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatPeriod = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {periods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showForecastForm} onOpenChange={setShowForecastForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Forecast</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Forecast Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Q1 2024 Sales Forecast"
                  />
                </div>
                <div>
                  <Label>Period *</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Team ID</Label>
                  <Input
                    value={formData.teamId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                    placeholder="team-sales"
                  />
                </div>
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-lg">Targets</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label>Revenue Target</Label>
                      <Input
                        type="number"
                        value={formData.targets?.revenue || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          targets: { 
                            ...prev.targets, 
                            revenue: Number(e.target.value),
                            deals: prev.targets?.deals || 0,
                            newCustomers: prev.targets?.newCustomers || 0
                          } 
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Deals Target</Label>
                      <Input
                        type="number"
                        value={formData.targets?.deals || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          targets: { 
                            ...prev.targets, 
                            revenue: prev.targets?.revenue || 0,
                            deals: Number(e.target.value),
                            newCustomers: prev.targets?.newCustomers || 0
                          } 
                        }))}
                      />
                    </div>
                    <div>
                      <Label>New Customers Target</Label>
                      <Input
                        type="number"
                        value={formData.targets?.newCustomers || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          targets: { 
                            ...prev.targets, 
                            revenue: prev.targets?.revenue || 0,
                            deals: prev.targets?.deals || 0,
                            newCustomers: Number(e.target.value)
                          } 
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowForecastForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateForecast}>
                  Create Forecast
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Forecasts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredForecasts.map((forecast) => {
          const revenueAttainment = calculateAttainment(forecast.actuals.revenue, forecast.targets.revenue)
          const dealsAttainment = calculateAttainment(forecast.actuals.deals, forecast.targets.deals)
          const customersAttainment = calculateAttainment(forecast.actuals.newCustomers, forecast.targets.newCustomers)

          return (
            <Card key={forecast.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{forecast.name}</CardTitle>
                    <CardDescription>
                      {formatPeriod(forecast.period)} • {formatDate(forecast.startDate)} - {formatDate(forecast.endDate)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(forecast.status)}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedForecast(forecast)}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Revenue */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Revenue</Label>
                    <span className={`text-sm font-medium ${getAttainmentColor(revenueAttainment)}`}>
                      {revenueAttainment}%
                    </span>
                  </div>
                  <Progress value={Math.min(revenueAttainment, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{formatCurrency(forecast.actuals.revenue)}</span>
                    <span>{formatCurrency(forecast.targets.revenue)}</span>
                  </div>
                </div>

                {/* Deals */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Deals</Label>
                    <span className={`text-sm font-medium ${getAttainmentColor(dealsAttainment)}`}>
                      {dealsAttainment}%
                    </span>
                  </div>
                  <Progress value={Math.min(dealsAttainment, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{forecast.actuals.deals}</span>
                    <span>{forecast.targets.deals}</span>
                  </div>
                </div>

                {/* New Customers */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">New Customers</Label>
                    <span className={`text-sm font-medium ${getAttainmentColor(customersAttainment)}`}>
                      {customersAttainment}%
                    </span>
                  </div>
                  <Progress value={Math.min(customersAttainment, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{forecast.actuals.newCustomers}</span>
                    <span>{forecast.targets.newCustomers}</span>
                  </div>
                </div>

                {/* Forecast Summary */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Committed</div>
                    <div className="text-sm font-medium">{formatCurrency(forecast.forecast.committed)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Best Case</div>
                    <div className="text-sm font-medium">{formatCurrency(forecast.forecast.bestCase)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Pipeline</div>
                    <div className="text-sm font-medium">{formatCurrency(forecast.forecast.pipeline)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline" className="text-xs">
                    {forecast.deals.length} deals
                  </Badge>
                  {forecast.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => handleSubmitForecast(forecast.id)}>
                      <Send size={14} className="mr-1" />
                      Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Forecast Detail Dialog */}
      {selectedForecast && (
        <Dialog open={!!selectedForecast} onOpenChange={() => setSelectedForecast(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target size={20} />
                {selectedForecast.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {calculateAttainment(selectedForecast.actuals.revenue, selectedForecast.targets.revenue)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue Attainment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedForecast.forecast.committed)}
                  </div>
                  <div className="text-sm text-muted-foreground">Committed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedForecast.forecast.bestCase)}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Case</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedForecast.forecast.pipeline)}
                  </div>
                  <div className="text-sm text-muted-foreground">Pipeline</div>
                </div>
              </div>

              {/* Deals Table */}
              <div>
                <h3 className="font-semibold mb-3">Forecast Deals ({selectedForecast.deals.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Close Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedForecast.deals.map((deal) => (
                      <TableRow key={deal.dealId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deal.dealName}</div>
                            {deal.notes && (
                              <div className="text-sm text-muted-foreground">{deal.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(deal.value)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={deal.probability} className="w-16 h-2" />
                            <span className="text-sm">{deal.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(deal.closeDate)}</TableCell>
                        <TableCell>
                          <Badge variant={deal.category === 'committed' ? 'default' : 'secondary'}>
                            {deal.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{deal.stage}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Adjustments */}
              {selectedForecast.adjustments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Forecast Adjustments</h3>
                  <div className="space-y-2">
                    {selectedForecast.adjustments.map((adjustment) => (
                      <div key={adjustment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {adjustment.type === 'add' ? <TrendUp size={16} className="text-green-600" /> : <TrendDown size={16} className="text-red-600" />}
                            {adjustment.type === 'add' ? '+' : '-'}{formatCurrency(adjustment.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">{adjustment.reason}</div>
                        </div>
                        <Badge variant="outline">{adjustment.category.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission History */}
              {selectedForecast.submissions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Submission History</h3>
                  <div className="space-y-2">
                    {selectedForecast.submissions.map((submission) => (
                      <div key={submission.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={submission.status === 'approved' ? 'default' : 'secondary'}>
                              {submission.status}
                            </Badge>
                            <span className="text-sm">by {submission.submittedBy}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(submission.submittedAt)}
                          </span>
                        </div>
                        {submission.comments && (
                          <div className="text-sm text-muted-foreground">{submission.comments}</div>
                        )}
                      </div>
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