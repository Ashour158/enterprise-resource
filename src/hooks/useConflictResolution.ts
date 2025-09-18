import { useState, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  SyncConflict, 
  ConflictResolutionStrategy, 
  ConflictResolutionWorkflow, 
  ApprovalWorkflow,
  ApprovalStep,
  MergeRule 
} from '@/types/erp'
import { toast } from 'sonner'

interface UseConflictResolutionReturn {
  conflicts: SyncConflict[]
  workflows: ConflictResolutionWorkflow[]
  pendingApprovals: ApprovalWorkflow[]
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy) => Promise<void>
  createWorkflow: (workflow: ConflictResolutionWorkflow) => void
  triggerWorkflow: (conflictId: string, workflowId: string) => Promise<void>
  approveStep: (workflowId: string, stepId: string, comments?: string) => void
  rejectStep: (workflowId: string, stepId: string, reason: string) => void
  getAIResolutionSuggestion: (conflict: SyncConflict) => Promise<ConflictResolutionStrategy>
  bulkResolveConflicts: (conflictIds: string[], strategy: ConflictResolutionStrategy) => Promise<void>
  escalateConflict: (conflictId: string, reason: string) => void
  analyzeConflictTrends: () => ConflictAnalytics
}

interface ConflictAnalytics {
  totalConflicts: number
  resolvedConflicts: number
  averageResolutionTime: number
  conflictsByModule: Record<string, number>
  conflictsByType: Record<string, number>
  businessImpactDistribution: Record<string, number>
  resolutionMethods: Record<string, number>
}

export function useConflictResolution(): UseConflictResolutionReturn {
  const [conflicts, setConflicts] = useKV<SyncConflict[]>('advanced-conflicts', [])
  const [workflows, setWorkflows] = useKV<ConflictResolutionWorkflow[]>('conflict-workflows', [])
  const [pendingApprovals, setPendingApprovals] = useKV<ApprovalWorkflow[]>('pending-approvals', [])
  const [resolutionHistory, setResolutionHistory] = useKV<any[]>('resolution-history', [])
  
  const processingRef = useRef<Set<string>>(new Set())

  const resolveConflict = useCallback(async (conflictId: string, strategy: ConflictResolutionStrategy) => {
    if (processingRef.current.has(conflictId)) {
      toast.error('Conflict resolution already in progress')
      return
    }

    processingRef.current.add(conflictId)

    try {
      const conflictsList = conflicts || []
      const conflict = conflictsList.find(c => c.id === conflictId)
      if (!conflict) {
        toast.error('Conflict not found')
        return
      }

      // Simulate resolution processing time based on strategy
      const processingTime = strategy.strategy === 'ai_assisted' ? 2000 : 1000
      
      await new Promise(resolve => setTimeout(resolve, processingTime))

      let resolvedValue: any
      
      switch (strategy.strategy) {
        case 'server_wins':
          resolvedValue = conflict.serverValue
          break
        case 'client_wins':
          resolvedValue = conflict.clientValue
          break
        case 'merge':
          resolvedValue = await performMerge(conflict, strategy.mergeRules || [])
          break
        case 'ai_assisted':
          resolvedValue = await performAIResolution(conflict)
          break
        case 'workflow_approval':
          // Start approval workflow
          if (strategy.approvalWorkflow) {
            setPendingApprovals(prev => [...(prev || []), strategy.approvalWorkflow!])
            toast.info('Approval workflow initiated')
            return
          }
          break
        default:
          resolvedValue = conflict.serverValue
      }

      // Update conflict as resolved
      setConflicts(prev => (prev || []).map(c => 
        c.id === conflictId 
          ? { 
              ...c, 
              resolved: true, 
              metadata: { 
                ...c.metadata,
                lastModified: new Date().toISOString(),
                modifiedBy: 'system',
                version: (c.metadata?.version || 0) + 1,
                dependencies: c.metadata?.dependencies || [],
                resolvedValue, 
                resolutionStrategy: strategy.strategy 
              }
            }
          : c
      ))

      // Add to resolution history
      setResolutionHistory(prev => [...(prev || []), {
        conflictId,
        strategy: strategy.strategy,
        timestamp: new Date().toISOString(),
        processingTime,
        confidence: strategy.confidence,
        businessImpact: conflict.businessImpact
      }])

      toast.success(`Conflict resolved using ${strategy.strategy} strategy`)
    } catch (error) {
      toast.error('Failed to resolve conflict')
      console.error('Conflict resolution error:', error)
    } finally {
      processingRef.current.delete(conflictId)
    }
  }, [conflicts, setConflicts, setPendingApprovals, setResolutionHistory])

  const performMerge = async (conflict: SyncConflict, mergeRules: MergeRule[]): Promise<any> => {
    // Simulate intelligent merge based on rules
    const rule = mergeRules.find(r => r.field === conflict.field)
    
    if (!rule) {
      return conflict.serverValue // Default fallback
    }

    switch (rule.rule) {
      case 'latest_timestamp':
        return new Date(conflict.timestamp) > new Date() ? conflict.clientValue : conflict.serverValue
      case 'highest_value':
        return Math.max(Number(conflict.serverValue), Number(conflict.clientValue))
      case 'combine_arrays':
        if (Array.isArray(conflict.serverValue) && Array.isArray(conflict.clientValue)) {
          return [...new Set([...conflict.serverValue, ...conflict.clientValue])]
        }
        return conflict.serverValue
      default:
        return conflict.serverValue
    }
  }

  const performAIResolution = async (conflict: SyncConflict): Promise<any> => {
    // Simulate AI-powered resolution
    try {
      if ((window as any).spark?.llmPrompt && (window as any).spark?.llm) {
        const prompt = (window as any).spark.llmPrompt`
          Analyze this data conflict and suggest the best resolution:
          
          Module: ${conflict.module}
          Entity: ${conflict.entity}
          Field: ${conflict.field}
          Server Value: ${JSON.stringify(conflict.serverValue)}
          Client Value: ${JSON.stringify(conflict.clientValue)}
          Business Impact: ${conflict.businessImpact}
          Conflict Type: ${conflict.conflictType}
          
          Consider the business impact and provide the most appropriate resolved value.
          Return only the resolved value as a JSON object with a 'value' property.
        `
        
        const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
        const result = JSON.parse(response)
        return result.value
      }
    } catch {
      // Fallback to server value if AI fails
    }
    return conflict.serverValue
  }

  const getAIResolutionSuggestion = useCallback(async (conflict: SyncConflict): Promise<ConflictResolutionStrategy> => {
    try {
      if ((window as any).spark?.llmPrompt && (window as any).spark?.llm) {
        const prompt = (window as any).spark.llmPrompt`
          Analyze this conflict and suggest the best resolution strategy:
          
          Conflict Details:
          - Module: ${conflict.module}
          - Entity: ${conflict.entity}
          - Field: ${conflict.field}
          - Server Value: ${JSON.stringify(conflict.serverValue)}
          - Client Value: ${JSON.stringify(conflict.clientValue)}
          - Business Impact: ${conflict.businessImpact}
          - Priority: ${conflict.priority}
          - Conflict Type: ${conflict.conflictType}
          
          Provide a strategy recommendation with confidence score and reasoning.
          Available strategies: server_wins, client_wins, merge, manual, ai_assisted, workflow_approval
          
          Return as JSON with: strategy, confidence (0-100), reasoning
        `

        const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
        const result = JSON.parse(response)
        
        return {
          strategy: result.strategy || 'manual',
          confidence: result.confidence || 50,
          reasoning: result.reasoning || 'No specific reasoning provided'
        }
      }
    } catch {
      // Fallback if AI fails
    }
    
    return {
      strategy: 'manual',
      confidence: 30,
      reasoning: 'AI analysis failed, manual review recommended'
    }
  }, [])

  const createWorkflow = useCallback((workflow: ConflictResolutionWorkflow) => {
    setWorkflows(prev => [...(prev || []), workflow])
    toast.success(`Workflow "${workflow.name}" created successfully`)
  }, [setWorkflows])

  const triggerWorkflow = useCallback(async (conflictId: string, workflowId: string) => {
    const workflowsList = workflows || []
    const conflictsList = conflicts || []
    const workflow = workflowsList.find(w => w.id === workflowId)
    const conflict = conflictsList.find(c => c.id === conflictId)
    
    if (!workflow || !conflict) {
      toast.error('Workflow or conflict not found')
      return
    }

    // Process workflow steps
    for (const step of workflow.steps) {
      switch (step.type) {
        case 'auto_resolution':
          await resolveConflict(conflictId, step.config as ConflictResolutionStrategy)
          break
        case 'ai_analysis':
          const suggestion = await getAIResolutionSuggestion(conflict)
          toast.info(`AI suggests: ${suggestion.strategy} (${suggestion.confidence}% confidence)`)
          break
        case 'human_review':
          toast.info('Human review required - conflict marked for manual resolution')
          break
        case 'notification':
          toast.info(`Notification sent: ${step.config.message}`)
          break
      }
    }
  }, [workflows, conflicts, resolveConflict, getAIResolutionSuggestion])

  const approveStep = useCallback((workflowId: string, stepId: string, comments?: string) => {
    setPendingApprovals(prev => (prev || []).map(approval => {
      if (approval.id === workflowId) {
        return {
          ...approval,
          approvalSteps: approval.approvalSteps.map(step => 
            step.id === stepId 
              ? { ...step, status: 'approved', timestamp: new Date().toISOString(), comments }
              : step
          )
        }
      }
      return approval
    }))
    
    toast.success('Approval step completed')
  }, [setPendingApprovals])

  const rejectStep = useCallback((workflowId: string, stepId: string, reason: string) => {
    setPendingApprovals(prev => (prev || []).map(approval => {
      if (approval.id === workflowId) {
        return {
          ...approval,
          approvalSteps: approval.approvalSteps.map(step => 
            step.id === stepId 
              ? { ...step, status: 'rejected', timestamp: new Date().toISOString(), comments: reason }
              : step
          )
        }
      }
      return approval
    }))
    
    toast.error('Approval step rejected')
  }, [setPendingApprovals])

  const bulkResolveConflicts = useCallback(async (conflictIds: string[], strategy: ConflictResolutionStrategy) => {
    toast.info(`Starting bulk resolution of ${conflictIds.length} conflicts...`)
    
    const results = await Promise.allSettled(
      conflictIds.map(id => resolveConflict(id, strategy))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (successful > 0) {
      toast.success(`Successfully resolved ${successful} conflicts`)
    }
    if (failed > 0) {
      toast.error(`Failed to resolve ${failed} conflicts`)
    }
  }, [resolveConflict])

  const escalateConflict = useCallback((conflictId: string, reason: string) => {
    setConflicts(prev => (prev || []).map(c => 
      c.id === conflictId 
        ? { 
            ...c, 
            priority: c.priority === 'low' ? 'medium' : 
                     c.priority === 'medium' ? 'high' : 'critical',
            metadata: { 
              ...c.metadata,
              lastModified: new Date().toISOString(),
              modifiedBy: 'system',
              version: (c.metadata?.version || 0) + 1,
              dependencies: c.metadata?.dependencies || [],
              escalated: true, 
              escalationReason: reason,
              escalationTimestamp: new Date().toISOString()
            }
          }
        : c
    ))
    
    toast.warning(`Conflict escalated: ${reason}`)
  }, [setConflicts])

  const analyzeConflictTrends = useCallback((): ConflictAnalytics => {
    const conflictsList = conflicts || []
    const historyList = resolutionHistory || []
    const totalConflicts = conflictsList.length
    const resolvedConflicts = conflictsList.filter(c => c.resolved).length
    
    const conflictsByModule = conflictsList.reduce((acc, c) => {
      acc[c.module] = (acc[c.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const conflictsByType = conflictsList.reduce((acc, c) => {
      acc[c.conflictType] = (acc[c.conflictType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const businessImpactDistribution = conflictsList.reduce((acc, c) => {
      acc[c.businessImpact] = (acc[c.businessImpact] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resolutionMethods = historyList.reduce((acc, r) => {
      acc[r.strategy] = (acc[r.strategy] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageResolutionTime = historyList.length > 0 
      ? historyList.reduce((sum, r) => sum + r.processingTime, 0) / historyList.length
      : 0

    return {
      totalConflicts,
      resolvedConflicts,
      averageResolutionTime,
      conflictsByModule,
      conflictsByType,
      businessImpactDistribution,
      resolutionMethods
    }
  }, [conflicts, resolutionHistory])

  return {
    conflicts: conflicts || [],
    workflows: workflows || [],
    pendingApprovals: pendingApprovals || [],
    resolveConflict,
    createWorkflow,
    triggerWorkflow,
    approveStep,
    rejectStep,
    getAIResolutionSuggestion,
    bulkResolveConflicts,
    escalateConflict,
    analyzeConflictTrends
  }
}