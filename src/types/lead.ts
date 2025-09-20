export interface Lead {
  id: string
  company_id: string
  lead_number: string
  lead_source_id?: string
  
  // Personal Information
  salutation?: string
  first_name: string
  last_name: string
  full_name: string
  job_title?: string
  email: string
  phone?: string
  mobile?: string
  linkedin_url?: string
  
  // Company Information
  company_name?: string
  company_website?: string
  industry?: string
  company_size?: string
  annual_revenue?: number
  number_of_employees?: number
  
  // Lead Details
  lead_status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
  lead_rating: 'hot' | 'warm' | 'cold'
  lead_priority: 'high' | 'medium' | 'low'
  
  // AI Scoring and Analysis
  ai_lead_score: number
  ai_conversion_probability?: number
  ai_estimated_deal_value?: number
  ai_best_contact_time?: any
  ai_personality_profile?: any
  ai_buying_signals?: string[]
  ai_next_best_action?: string
  
  // Interaction and Engagement
  last_contact_date?: string
  next_follow_up_date?: string
  contact_attempts: number
  email_opens: number
  email_clicks: number
  website_visits: number
  engagement_score: number
  
  // Assignment and Ownership
  assigned_to?: string
  assigned_date?: string
  created_by: string
  
  // Geographic Information
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  timezone?: string
  
  // Marketing and Campaign Data
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer_url?: string
  landing_page?: string
  
  // Custom Fields and Tags
  custom_fields?: Record<string, any>
  tags?: string[]
  notes?: string
  
  // Conversion Tracking
  converted_to_customer: boolean
  converted_date?: string
  converted_deal_id?: string
  conversion_value?: number
  
  // System Fields
  is_deleted: boolean
  deleted_at?: string
  deleted_by?: string
  created_at: string
  updated_at: string
}

export interface LeadSource {
  id: string
  company_id: string
  source_name: string
  source_type: 'website' | 'social_media' | 'email_campaign' | 'referral' | 'trade_show' | 'cold_call'
  source_description?: string
  tracking_code?: string
  cost_per_lead?: number
  conversion_rate?: number
  ai_performance_score?: number
  is_active: boolean
  created_by: string
  created_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'website_visit' | 'email_open' | 'email_click'
  activity_subject?: string
  activity_description?: string
  activity_date: string
  duration_minutes?: number
  outcome?: 'successful' | 'no_answer' | 'busy' | 'interested' | 'not_interested'
  next_action?: string
  next_action_date?: string
  
  // AI Analysis
  ai_sentiment_score?: number
  ai_intent_detected?: string
  ai_buying_signals?: string[]
  
  // User and System Info
  created_by: string
  attachments?: string[]
  metadata?: Record<string, any>
  created_at: string
}

export interface LeadScoringRule {
  id: string
  company_id: string
  rule_name: string
  rule_type: 'demographic' | 'behavioral' | 'engagement' | 'firmographic'
  criteria: Record<string, any>
  score_value: number
  is_active: boolean
  ai_effectiveness_score?: number
  created_by: string
  created_at: string
}

export interface LeadNurturingCampaign {
  id: string
  company_id: string
  campaign_name: string
  campaign_description?: string
  target_criteria: Record<string, any>
  campaign_steps: any[]
  is_active: boolean
  
  // Performance Metrics
  leads_enrolled: number
  leads_converted: number
  conversion_rate?: number
  ai_optimization_suggestions?: string[]
  
  created_by: string
  created_at: string
  updated_at: string
}

export interface LeadCampaignEnrollment {
  id: string
  lead_id: string
  campaign_id: string
  enrollment_date: string
  current_step: number
  status: 'active' | 'completed' | 'paused' | 'unsubscribed'
  completion_date?: string
  conversion_achieved: boolean
  created_at: string
}

export interface LeadDuplicate {
  id: string
  company_id: string
  primary_lead_id: string
  duplicate_lead_id: string
  similarity_score: number
  matching_fields: string[]
  merge_status: 'pending' | 'merged' | 'ignored'
  merged_by?: string
  merged_at?: string
  created_at: string
}

export interface LeadImportLog {
  id: string
  company_id: string
  import_file_name?: string
  import_file_url?: string
  total_records: number
  successful_imports: number
  failed_imports: number
  duplicate_records: number
  validation_errors: any[]
  import_status: 'processing' | 'completed' | 'failed'
  imported_by: string
  created_at: string
  completed_at?: string
}

export interface LeadAnalytics {
  total_leads: number
  new_leads_this_month: number
  conversion_rate: number
  average_lead_score: number
  top_sources: Array<{
    source_name: string
    lead_count: number
    conversion_rate: number
  }>
  lead_status_distribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  monthly_trends: Array<{
    month: string
    leads: number
    conversions: number
  }>
}

export interface AILeadInsight {
  lead_id: string
  insight_type: 'score_change' | 'buying_signal' | 'engagement_pattern' | 'next_action'
  insight_title: string
  insight_description: string
  confidence_score: number
  suggested_actions: string[]
  created_at: string
}

export interface BulkLeadOperation {
  operation_type: 'update' | 'delete' | 'assign' | 'tag' | 'campaign_enroll'
  lead_ids: string[]
  operation_data: Record<string, any>
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results?: {
    successful: number
    failed: number
    errors: string[]
  }
}