import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Quote,
  QuoteApproval,
  QuoteApprovalWorkflow,
  ApprovalAuditLog
} from '@/types/crm'
import { 
  CheckCircle,
  XCircle,
  Clock,
  Warning as AlertTriangle,
  Users,
  FileText,
  Eye,
  ArrowRight,
  Shield,
  TreeStructure,
  Calendar,
  CurrencyDollar as DollarSign,
  ChatCircle as MessageSquare,
  PaperPlaneTilt as Send,
  User,
  Building,
  FlowArrow
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuoteApprovalDashboardProps {
  companyId: string
  userId: string
  userRole: string
  quote: Quote
  onApprovalUpdate?: (approval: QuoteApproval) => void
}

// Mock data for demonstration
const mockApprovalAuditLog: ApprovalAuditLog[] = [
  {
    id: 'audit-001',
    quoteId: 'quote-001',
    approvalId: 'approval-001',
    action: 'requested',
    userId: 'user-001',
    userName: 'John Sales',
    userRole: 'Sales Representative',
    timestamp: new Date('2024-01-20T10:00:00'),
    details: { level: 'Sales Manager Approval', amount: 49680 },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    comments: 'High-value enterprise deal requiring manager approval'
  },
  {
    id: 'audit-002',
    quoteId: 'quote-001',
    approvalId: 'approval-001',
    action: 'approved',
    userId: 'manager-001',
    userName: 'Jane Manager',
    userRole: 'Sales Manager',
    timestamp: new Date('2024-01-20T14:30:00'),
    details: { level: 'Sales Manager Approval', decision: 'approved' },
    ipAddress: '192.168.1.5',
    userAgent: 'Mozilla/5.0...',
    previousStatus: 'pending',
    newStatus: 'approved',
    comments: 'Approved - customer has good payment history and deal aligns with Q1 targets',
    digitalSignature: 'sig_jane_manager_001'
  }
]

export function QuoteApprovalDashboard({ 
  companyId, 
  userId, 
  userRole, 
  quote,
  onApprovalUpdate 
}: QuoteApprovalDashboardProps) {
  const [approvals] = useKV<QuoteApproval[]>(`quote-approvals-${quote.id}`, quote.approvals || [])
  const [auditLog] = useKV<ApprovalAuditLog[]>(`approval-audit-${quote.id}`, mockApprovalAuditLog)
  const [selectedApproval, setSelectedApproval] = useState<QuoteApproval | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)

  const currentUserApprovals = approvals?.filter(approval => 
    approval.approverId === userId && approval.status === 'pending'
  ) || []

  const canApprove = currentUserApprovals.length > 0
  const allApproved = approvals?.every(approval => approval.status === 'approved') || false
  const hasRejection = approvals?.some(approval => approval.status === 'rejected') || false

  const getApprovalProgress = () => {
    if (!approvals || approvals.length === 0) return 0
    const completedApprovals = approvals.filter(a => a.status === 'approved').length
    return (completedApprovals / approvals.length) * 100
  }

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />
      case 'approved': return <CheckCircle size={16} className="text-green-500" />
      case 'rejected': return <XCircle size={16} className="text-red-500" />
      case 'escalated': return <AlertTriangle size={16} className="text-orange-500" />
      default: return <Clock size={16} className="text-gray-500" />
    }
  }

  const getApprovalStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      approved: { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
      escalated: { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' }
    }[status] || { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' }

    return (
      <Badge variant={config.variant} className={config.className}>
        {getApprovalStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!selectedApproval) return

    try {
      // In a real application, this would make an API call
      const updatedApproval: QuoteApproval = {
        ...selectedApproval,
        status: action === 'approve' ? 'approved' : 'rejected',
        respondedAt: new Date(),
        comments: approvalComment || undefined
      }

      // Create audit log entry
      const auditEntry: ApprovalAuditLog = {
        id: `audit-${Date.now()}`,
        quoteId: quote.id,
        approvalId: selectedApproval.id,
        action: action === 'approve' ? 'approved' : 'rejected',
        userId,
        userName: 'Current User', // This would come from user context
        userRole,
        timestamp: new Date(),
        details: { 
          level: selectedApproval.levelId,
          decision: action,
          amount: quote.totalAmount
        },
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        previousStatus: 'pending',
        newStatus: action === 'approve' ? 'approved' : 'rejected',
        comments: approvalComment || undefined
      }

      // Update local state and notify parent
      onApprovalUpdate?.(updatedApproval)

      toast.success(`Quote ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      setShowApprovalDialog(false)
      setApprovalComment('')
      setSelectedApproval(null)
      setApprovalAction(null)
    } catch (error) {
      toast.error('Failed to process approval')
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Approval Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Approval Status
              </CardTitle>
              <CardDescription>
                Multi-level authorization for {quote.quoteNumber}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(quote.totalAmount, quote.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Quote Value
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Approval Progress</Label>
              <span className="text-sm text-muted-foreground">
                {approvals?.filter(a => a.status === 'approved').length || 0} of {approvals?.length || 0} approved
              </span>
            </div>
            <Progress value={getApprovalProgress()} className="h-2" />
          </div>

          {/* Overall Status */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {hasRejection ? (
                <>
                  <XCircle size={20} className="text-red-500" />
                  <span className="font-medium text-red-700">Approval Rejected</span>
                </>
              ) : allApproved ? (
                <>
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="font-medium text-green-700">All Approvals Complete</span>
                </>
              ) : (
                <>
                  <Clock size={20} className="text-yellow-500" />
                  <span className="font-medium text-yellow-700">Pending Approvals</span>
                </>
              )}
            </div>
            {canApprove && (
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedApproval(currentUserApprovals[0])
                  setShowApprovalDialog(true)
                }}
              >
                <Shield size={14} className="mr-1" />
                Review Approval
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Approval Chain</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Details</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreeStructure size={18} />
                Approval Chain
              </CardTitle>
              <CardDescription>
                Sequential authorization levels for this quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals && approvals.length > 0 ? (
                  approvals.map((approval, index) => (
                    <div key={approval.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`/avatars/${approval.approverId}.jpg`} />
                          <AvatarFallback>
                            {approval.approverName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{approval.approverName}</h4>
                          <Badge variant="outline">{approval.approverRole}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Requested {formatDateTime(approval.requestedAt)}
                        </div>
                        {approval.comments && (
                          <div className="text-sm mt-2 p-2 bg-muted rounded text-muted-foreground">
                            <MessageSquare size={12} className="inline mr-1" />
                            {approval.comments}
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-2">
                        {getApprovalStatusBadge(approval.status)}
                        {approval.respondedAt && (
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(approval.respondedAt)}
                          </div>
                        )}
                        {approval.status === 'pending' && approval.approverId === userId && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApproval(approval)
                                setApprovalAction('approve')
                                setShowApprovalDialog(true)
                              }}
                            >
                              <CheckCircle size={12} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedApproval(approval)
                                setApprovalAction('reject')
                                setShowApprovalDialog(true)
                              }}
                            >
                              <XCircle size={12} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>

                      {index < (approvals?.length || 0) - 1 && (
                        <ArrowRight size={16} className="text-muted-foreground ml-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No approvals required</h3>
                    <p className="text-muted-foreground">
                      This quote doesn't require approval based on current workflows
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                Complete audit trail of approval activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog && auditLog.length > 0 ? (
                <div className="space-y-4">
                  {auditLog
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((entry) => (
                      <div key={entry.id} className="flex items-start gap-4 p-4 border-l-2 border-l-primary/20 bg-muted/30 rounded-r-lg">
                        <div className="mt-1">
                          {entry.action === 'approved' && <CheckCircle size={16} className="text-green-500" />}
                          {entry.action === 'rejected' && <XCircle size={16} className="text-red-500" />}
                          {entry.action === 'requested' && <Clock size={16} className="text-blue-500" />}
                          {entry.action === 'escalated' && <AlertTriangle size={16} className="text-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.userName}</span>
                            <Badge variant="outline" className="text-xs">{entry.userRole}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {entry.action.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {formatDateTime(entry.timestamp)}
                          </div>
                          {entry.comments && (
                            <div className="text-sm p-2 bg-background rounded border">
                              {entry.comments}
                            </div>
                          )}
                          {entry.digitalSignature && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Digital signature: {entry.digitalSignature}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No history available</h3>
                  <p className="text-muted-foreground">
                    Approval activities will appear here once they begin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlowArrow size={18} />
                Workflow Configuration
              </CardTitle>
              <CardDescription>
                Details about the approval workflow triggered for this quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quote.approvalWorkflow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Workflow Name</Label>
                      <div className="text-sm">{quote.approvalWorkflow.name}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Trigger Conditions</Label>
                      <div className="text-sm">
                        {quote.approvalWorkflow.triggerConditions.length} conditions matched
                      </div>
                    </div>
                  </div>
                  
                  {quote.approvalWorkflow.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {quote.approvalWorkflow.description}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Matched Conditions</Label>
                    <div className="space-y-2">
                      {quote.approvalWorkflow.triggerConditions.map((condition) => (
                        <div key={condition.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <DollarSign size={14} />
                          <span className="text-sm">
                            {condition.type.replace('_', ' ')} {condition.operator} {condition.value}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Priority {condition.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlowArrow size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No workflow assigned</h3>
                  <p className="text-muted-foreground">
                    This quote doesn't have an associated approval workflow
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Action Dialog */}
      {showApprovalDialog && selectedApproval && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {approvalAction === 'approve' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Quote
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Quote Details</div>
                <div className="text-sm text-muted-foreground">
                  {quote.quoteNumber} - {formatCurrency(quote.totalAmount, quote.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {quote.title}
                </div>
              </div>

              <div>
                <Label htmlFor="approval-comment">
                  {approvalAction === 'approve' ? 'Approval' : 'Rejection'} Comments
                  {approvalAction === 'reject' && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Textarea
                  id="approval-comment"
                  placeholder={`Add your ${approvalAction === 'approve' ? 'approval' : 'rejection'} comments...`}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="mt-1"
                />
                {approvalAction === 'reject' && !approvalComment && (
                  <div className="text-xs text-red-500 mt-1">
                    Comments are required for rejections
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalDialog(false)
                    setApprovalComment('')
                    setSelectedApproval(null)
                    setApprovalAction(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprovalAction(approvalAction!)}
                  disabled={approvalAction === 'reject' && !approvalComment}
                  variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                >
                  {approvalAction === 'approve' ? (
                    <CheckCircle size={14} className="mr-1" />
                  ) : (
                    <XCircle size={14} className="mr-1" />
                  )}
                  Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}