import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { 
  ChartLine,
  TrendUp,
  TrendDown,
  CurrencyDollar as DollarSign,
  Calendar,
  Receipt,
  CreditCard,
  Warning,
  CheckCircle,
  Clock,
  PiggyBank
} from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

interface FinancialTransaction {
  id: string
  accountId: string
  type: 'invoice' | 'payment' | 'credit' | 'refund' | 'adjustment'
  amount: number
  currency: string
  description: string
  reference?: string
  invoiceNumber?: string
  paymentMethod?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  dueDate?: string
  paidDate?: string
  createdAt: string
  metadata?: Record<string, any>
}

interface RevenueMetrics {
  totalLifetimeValue: number
  annualRecurringRevenue: number
  averageDealSize: number
  monthlyRecurring: number
  outstandingBalance: number
  overdueAmount: number
  creditBalance: number
  paymentVelocity: number // days to pay on average
  healthScore: number
}

interface PaymentPattern {
  month: string
  revenue: number
  invoicesSent: number
  paymentsReceived: number
  averagePaymentTime: number
}

interface AccountFinancialDashboardProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
}

export function AccountFinancialDashboard({
  accountId,
  companyId,
  userId,
  userRole
}: AccountFinancialDashboardProps) {
  const [transactions, setTransactions] = useKV<FinancialTransaction[]>(
    `account-transactions-${accountId}`, 
    []
  )
  const [metrics, setMetrics] = useKV<RevenueMetrics>(
    `account-metrics-${accountId}`, 
    {} as RevenueMetrics
  )
  const [paymentPatterns, setPaymentPatterns] = useKV<PaymentPattern[]>(
    `account-patterns-${accountId}`, 
    []
  )

  // Generate mock financial data on first load
  useEffect(() => {
    if (transactions.length === 0) {
      const mockTransactions = generateMockTransactions(accountId)
      const mockMetrics = calculateMetrics(mockTransactions)
      const mockPatterns = generatePaymentPatterns()
      
      setTransactions(mockTransactions)
      setMetrics(mockMetrics)
      setPaymentPatterns(mockPatterns)
    }
  }, [accountId, transactions.length, setTransactions, setMetrics, setPaymentPatterns])

  const generateMockTransactions = (accountId: string): FinancialTransaction[] => {
    const types: FinancialTransaction['type'][] = ['invoice', 'payment', 'credit', 'refund']
    const statuses: FinancialTransaction['status'][] = ['pending', 'completed', 'failed']
    const paymentMethods = ['Credit Card', 'Bank Transfer', 'Check', 'ACH', 'Wire Transfer']

    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const amount = Math.floor(Math.random() * 50000) + 1000
      const daysAgo = Math.floor(Math.random() * 365)
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

      return {
        id: `txn_${accountId}_${i}`,
        accountId,
        type,
        amount,
        currency: 'USD',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1} - ${getTransactionDescription(type)}`,
        reference: `REF-${String(i + 1).padStart(6, '0')}`,
        invoiceNumber: type === 'invoice' ? `INV-2024-${String(i + 1).padStart(4, '0')}` : undefined,
        paymentMethod: type === 'payment' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : undefined,
        status,
        dueDate: type === 'invoice' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        paidDate: status === 'completed' ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt,
        metadata: {
          dealId: `deal_${Math.floor(Math.random() * 10) + 1}`,
          contactId: `contact_${Math.floor(Math.random() * 5) + 1}`
        }
      }
    })
  }

  const getTransactionDescription = (type: string): string => {
    switch (type) {
      case 'invoice': return 'Professional Services'
      case 'payment': return 'Payment Received'
      case 'credit': return 'Account Credit'
      case 'refund': return 'Refund Processed'
      default: return 'Financial Transaction'
    }
  }

  const calculateMetrics = (transactions: FinancialTransaction[]): RevenueMetrics => {
    const completed = transactions.filter(t => t.status === 'completed')
    const invoices = completed.filter(t => t.type === 'invoice')
    const payments = completed.filter(t => t.type === 'payment')
    
    const totalRevenue = payments.reduce((sum, t) => sum + t.amount, 0)
    const totalInvoiced = invoices.reduce((sum, t) => sum + t.amount, 0)
    const outstanding = totalInvoiced - totalRevenue
    
    // Calculate monthly recurring revenue (last 12 months average)
    const lastYear = new Date()
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    const recentPayments = payments.filter(p => new Date(p.createdAt) > lastYear)
    const monthlyRecurring = recentPayments.reduce((sum, p) => sum + p.amount, 0) / 12

    return {
      totalLifetimeValue: totalRevenue,
      annualRecurringRevenue: monthlyRecurring * 12,
      averageDealSize: payments.length > 0 ? totalRevenue / payments.length : 0,
      monthlyRecurring,
      outstandingBalance: Math.max(outstanding, 0),
      overdueAmount: Math.floor(Math.random() * 10000),
      creditBalance: Math.floor(Math.random() * 5000),
      paymentVelocity: Math.floor(Math.random() * 30) + 15, // 15-45 days
      healthScore: Math.floor(Math.random() * 40) + 60 // 60-100
    }
  }

  const generatePaymentPatterns = (): PaymentPattern[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = format(subMonths(new Date(), 11 - i), 'MMM yyyy')
      return {
        month,
        revenue: Math.floor(Math.random() * 100000) + 20000,
        invoicesSent: Math.floor(Math.random() * 10) + 5,
        paymentsReceived: Math.floor(Math.random() * 8) + 3,
        averagePaymentTime: Math.floor(Math.random() * 20) + 10
      }
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <Receipt size={16} />
      case 'payment': return <DollarSign size={16} />
      case 'credit': return <PiggyBank size={16} />
      case 'refund': return <TrendDown size={16} />
      default: return <CreditCard size={16} />
    }
  }

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'failed') return 'text-red-600'
    if (status === 'pending') return 'text-yellow-600'
    
    switch (type) {
      case 'payment':
      case 'credit':
        return 'text-green-600'
      case 'refund':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={14} />
      case 'pending': return <Clock className="text-yellow-600" size={14} />
      case 'failed': return <Warning className="text-red-600" size={14} />
      default: return <Clock className="text-gray-600" size={14} />
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const overdueInvoices = transactions.filter(t => 
    t.type === 'invoice' && 
    t.status === 'pending' && 
    t.dueDate && 
    new Date(t.dueDate) < new Date()
  )

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lifetime Value</p>
                <ClickableDataElement
                  type="currency"
                  value={formatCurrency(metrics.totalLifetimeValue)}
                  data={metrics}
                  className="text-2xl font-bold hover:text-primary cursor-pointer"
                />
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendUp className="text-green-600 mr-1" size={12} />
              <span className="text-green-600">+12.5%</span>
              <span className="text-muted-foreground ml-1">vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual Recurring</p>
                <ClickableDataElement
                  type="currency"
                  value={formatCurrency(metrics.annualRecurringRevenue)}
                  data={metrics}
                  className="text-2xl font-bold hover:text-primary cursor-pointer"
                />
              </div>
              <ChartLine className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendUp className="text-green-600 mr-1" size={12} />
              <span className="text-green-600">+8.2%</span>
              <span className="text-muted-foreground ml-1">monthly growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <ClickableDataElement
                  type="currency"
                  value={formatCurrency(metrics.outstandingBalance)}
                  data={metrics}
                  className="text-2xl font-bold hover:text-primary cursor-pointer"
                />
              </div>
              <Warning className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                {overdueInvoices.length} overdue invoices
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Health</p>
                <div className={`text-2xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                  {metrics.healthScore}/100
                </div>
              </div>
              <CheckCircle className={`h-8 w-8 ${getHealthScoreColor(metrics.healthScore)}`} />
            </div>
            <div className="mt-2">
              <Progress value={metrics.healthScore} className="h-2" />
              <span className="text-xs text-muted-foreground">
                Avg payment time: {metrics.paymentVelocity} days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="patterns">Payment Patterns</TabsTrigger>
          <TabsTrigger value="invoices">Outstanding Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Financial Transactions</CardTitle>
              <CardDescription>
                Latest payments, invoices, and financial activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={getTransactionColor(transaction.type, transaction.status)}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <ClickableDataElement
                          type="transaction"
                          value={transaction.description}
                          data={transaction}
                          className="font-medium hover:text-primary cursor-pointer"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {transaction.reference && (
                            <ClickableDataElement
                              type="reference"
                              value={transaction.reference}
                              data={transaction}
                              className="hover:text-primary cursor-pointer"
                            />
                          )}
                          {transaction.invoiceNumber && (
                            <ClickableDataElement
                              type="invoice"
                              value={transaction.invoiceNumber}
                              data={transaction}
                              className="hover:text-primary cursor-pointer"
                            />
                          )}
                          <span>•</span>
                          <ClickableDataElement
                            type="date"
                            value={format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                            data={{ date: transaction.createdAt }}
                            className="hover:text-primary cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <ClickableDataElement
                        type="currency"
                        value={formatCurrency(transaction.amount, transaction.currency)}
                        data={transaction}
                        className={`font-semibold hover:text-primary cursor-pointer ${
                          transaction.type === 'payment' || transaction.type === 'credit'
                            ? 'text-green-600'
                            : transaction.type === 'refund'
                            ? 'text-red-600'
                            : ''
                        }`}
                      />
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(transaction.status)}
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Payment Patterns</CardTitle>
              <CardDescription>
                Historical payment behavior and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{pattern.month}</div>
                      <div className="text-sm text-muted-foreground">
                        {pattern.invoicesSent} invoices sent, {pattern.paymentsReceived} payments received
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <ClickableDataElement
                          type="currency"
                          value={formatCurrency(pattern.revenue)}
                          data={pattern}
                          className="font-semibold hover:text-primary cursor-pointer"
                        />
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{pattern.averagePaymentTime} days</span>
                        <div className="text-sm text-muted-foreground">Avg Payment</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>
                Pending and overdue invoices requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueInvoices.length > 0 ? (
                <div className="space-y-3">
                  {overdueInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50"
                    >
                      <div className="flex items-center gap-3">
                        <Warning className="text-red-600" size={20} />
                        <div>
                          <ClickableDataElement
                            type="invoice"
                            value={invoice.invoiceNumber || invoice.reference || 'Invoice'}
                            data={invoice}
                            className="font-medium hover:text-primary cursor-pointer"
                          />
                          <div className="text-sm text-muted-foreground">
                            Due: {invoice.dueDate && format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                            <span className="text-red-600 ml-2">
                              ({Math.floor((Date.now() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <ClickableDataElement
                          type="currency"
                          value={formatCurrency(invoice.amount)}
                          data={invoice}
                          className="font-semibold text-red-600 hover:text-primary cursor-pointer"
                        />
                        <div className="text-sm">
                          <Button variant="outline" size="sm" className="text-xs">
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No overdue invoices at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Recurring Revenue</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(metrics.monthlyRecurring)}
                      data={metrics}
                      className="font-semibold hover:text-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Deal Size</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(metrics.averageDealSize)}
                      data={metrics}
                      className="font-semibold hover:text-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Balance</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(metrics.creditBalance)}
                      data={metrics}
                      className="font-semibold text-green-600 hover:text-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue Amount</span>
                    <ClickableDataElement
                      type="currency"
                      value={formatCurrency(metrics.overdueAmount)}
                      data={metrics}
                      className="font-semibold text-red-600 hover:text-primary cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Behavior</CardTitle>
                <CardDescription>Account payment characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Payment Velocity</span>
                      <span className="font-semibold">{metrics.paymentVelocity} days</span>
                    </div>
                    <Progress value={(45 - metrics.paymentVelocity) / 45 * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Payment Health Score</span>
                      <span className={`font-semibold ${getHealthScoreColor(metrics.healthScore)}`}>
                        {metrics.healthScore}/100
                      </span>
                    </div>
                    <Progress value={metrics.healthScore} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Transactions</span>
                        <span>{transactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Successful Payments</span>
                        <span>{transactions.filter(t => t.type === 'payment' && t.status === 'completed').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Failed Payments</span>
                        <span className="text-red-600">{transactions.filter(t => t.status === 'failed').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}