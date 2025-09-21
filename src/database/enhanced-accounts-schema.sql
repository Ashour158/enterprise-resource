-- Enhanced Account Management Database Schema
-- Fixing all reported errors and implementing comprehensive search functionality

-- Enhanced accounts with complete historical tracking
CREATE TABLE enhanced_accounts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) UNIQUE,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    -- Basic Account Information
    account_number VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 1-10, 11-50, 51-200, 201-1000, 1000+
    annual_revenue DECIMAL(15,2),
    number_of_employees INTEGER,
    website_url VARCHAR(500),
    
    -- Account Classification
    account_type VARCHAR(50) DEFAULT 'prospect', -- prospect, customer, partner, vendor
    account_status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, closed
    priority_level VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    territory VARCHAR(100),
    account_manager_id INTEGER REFERENCES company_user_profiles(id),
    
    -- Contact Information
    primary_address JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    shipping_address JSONB DEFAULT '{}',
    phone VARCHAR(50),
    fax VARCHAR(50),
    
    -- Complete Historical Tracking Counters
    total_email_count INTEGER DEFAULT 0,
    total_meeting_count INTEGER DEFAULT 0,
    total_call_count INTEGER DEFAULT 0,
    total_quote_count INTEGER DEFAULT 0,
    total_deal_count INTEGER DEFAULT 0,
    total_support_tickets INTEGER DEFAULT 0,
    total_documents_shared INTEGER DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    
    -- Real-time Engagement Metrics
    last_email_date TIMESTAMP,
    last_meeting_date TIMESTAMP,
    last_call_date TIMESTAMP,
    last_quote_date TIMESTAMP,
    last_deal_date TIMESTAMP,
    last_support_ticket_date TIMESTAMP,
    last_login_date TIMESTAMP, -- if customer portal access
    last_interaction_date TIMESTAMP,
    
    -- Financial Information
    total_revenue DECIMAL(15,2) DEFAULT 0,
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    average_deal_size DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(50) DEFAULT 'net_30',
    credit_limit DECIMAL(15,2),
    credit_rating VARCHAR(10),
    
    -- Enhanced AI Intelligence
    ai_health_score DECIMAL(5,2) DEFAULT 50, -- 0-100 overall account health
    ai_engagement_trend VARCHAR(50) DEFAULT 'stable', -- increasing, stable, decreasing, critical
    ai_satisfaction_trend VARCHAR(50) DEFAULT 'stable', -- improving, stable, declining
    ai_expansion_readiness DECIMAL(5,2) DEFAULT 0, -- readiness for upsell/cross-sell
    ai_retention_probability DECIMAL(5,4) DEFAULT 0.75, -- probability of retention
    ai_advocacy_potential DECIMAL(5,2) DEFAULT 0, -- potential to become advocate/reference
    ai_churn_risk_score DECIMAL(5,4) DEFAULT 0.25, -- churn risk probability
    ai_next_best_action VARCHAR(255),
    ai_insights JSONB DEFAULT '[]',
    
    -- Customer Portal Integration
    portal_access_enabled BOOLEAN DEFAULT false,
    portal_last_login TIMESTAMP,
    portal_login_count INTEGER DEFAULT 0,
    portal_features_enabled JSONB DEFAULT '[]',
    
    -- Social Media Monitoring
    social_mentions_count INTEGER DEFAULT 0,
    social_sentiment_score DECIMAL(5,4) DEFAULT 0.5,
    last_social_mention TIMESTAMP,
    social_profiles JSONB DEFAULT '{}',
    
    -- Custom Fields and Metadata
    custom_fields JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- System Fields
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES company_user_profiles(id),
    created_by INTEGER REFERENCES company_user_profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Enhanced Search and Indexing (Fixed)
    account_search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(company_name, '') || ' ' ||
            COALESCE(industry, '') || ' ' ||
            COALESCE(notes, '') || ' ' ||
            COALESCE(account_number, '') || ' ' ||
            COALESCE(website_url, '') || ' ' ||
            COALESCE(territory, '') || ' ' ||
            CASE WHEN tags IS NOT NULL THEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(tags)), ' ') ELSE '' END || ' ' ||
            CASE WHEN custom_fields IS NOT NULL THEN custom_fields::text ELSE '' END
        )
    ) STORED
);

-- Fixed Unified customer timeline (all touchpoints)
CREATE TABLE customer_unified_timeline (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    -- Timeline Entry Details
    timeline_type VARCHAR(100) NOT NULL, -- email, call, meeting, quote, deal, support, payment, document, social, website
    timeline_subtype VARCHAR(100), -- email_sent, email_received, meeting_scheduled, quote_sent, deal_won, etc.
    
    -- Entry Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT, -- AI-generated summary for complex entries
    content JSONB DEFAULT '{}', -- flexible content storage
    
    -- Related Records (Fixed references)
    related_contact_id INTEGER,
    related_deal_id INTEGER,
    related_quote_id INTEGER,
    related_support_ticket_id INTEGER,
    related_document_id INTEGER,
    related_user_id INTEGER REFERENCES company_user_profiles(id),
    
    -- External System References
    external_system VARCHAR(100), -- gmail, outlook, zoom, teams, support_system
    external_id VARCHAR(255),
    external_url VARCHAR(500), -- link to external system
    
    -- Timeline Metadata
    timeline_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    participants JSONB DEFAULT '[]', -- internal and external participants
    attachments JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- AI Analysis
    ai_importance_score DECIMAL(5,2) DEFAULT 50, -- AI-calculated importance (0-100)
    ai_sentiment_score DECIMAL(5,4) DEFAULT 0.5, -- AI sentiment analysis (-1 to 1)
    ai_impact_on_relationship DECIMAL(5,4) DEFAULT 0, -- impact on customer relationship
    ai_extracted_insights JSONB DEFAULT '[]', -- AI-extracted key insights
    ai_keywords JSONB DEFAULT '[]', -- AI-extracted keywords
    
    -- Visibility and Access
    is_public BOOLEAN DEFAULT true, -- visible to all team members
    visible_to_roles JSONB DEFAULT '[]', -- specific roles that can see this
    created_by INTEGER REFERENCES company_user_profiles(id),
    
    -- Real-time Features
    is_pinned BOOLEAN DEFAULT false, -- pinned to top of timeline
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Full-text search
    timeline_search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(title, '') || ' ' ||
            COALESCE(description, '') || ' ' ||
            COALESCE(summary, '') || ' ' ||
            CASE WHEN tags IS NOT NULL THEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(tags)), ' ') ELSE '' END
        )
    ) STORED
);

-- Account relationship mapping (complete ecosystem)
CREATE TABLE account_ecosystem_map (
    id SERIAL PRIMARY KEY,
    primary_account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    -- Relationship Details
    related_entity_type VARCHAR(100) NOT NULL, -- account, contact, vendor, partner, competitor
    related_entity_id INTEGER NOT NULL,
    relationship_nature VARCHAR(100) NOT NULL, -- parent, subsidiary, partner, vendor, customer, competitor
    relationship_description TEXT,
    
    -- Relationship Strength and Influence
    relationship_strength DECIMAL(5,2) DEFAULT 50, -- 0-100 strength
    influence_level DECIMAL(5,2) DEFAULT 50, -- 0-100 influence on decisions
    collaboration_frequency VARCHAR(50) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, rarely
    
    -- Business Impact
    revenue_impact DECIMAL(15,2) DEFAULT 0, -- financial impact of this relationship
    strategic_importance VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
    
    -- AI Analysis
    ai_relationship_health DECIMAL(5,2) DEFAULT 75, -- AI-assessed relationship health
    ai_growth_potential DECIMAL(5,2) DEFAULT 50, -- potential for relationship growth
    ai_risk_factors JSONB DEFAULT '[]', -- AI-identified risks
    ai_opportunities JSONB DEFAULT '[]', -- AI-identified opportunities
    
    -- Tracking
    relationship_start_date DATE DEFAULT CURRENT_DATE,
    last_interaction_date TIMESTAMP,
    interaction_frequency_score DECIMAL(5,2) DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES company_user_profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer success metrics and KPIs
CREATE TABLE customer_success_metrics (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    measurement_date DATE DEFAULT CURRENT_DATE,
    measurement_period VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, yearly
    
    -- Usage and Adoption Metrics
    product_usage_score DECIMAL(5,2) DEFAULT 0, -- 0-100 product usage
    feature_adoption_rate DECIMAL(5,4) DEFAULT 0, -- percentage of features adopted
    user_activity_score DECIMAL(5,2) DEFAULT 0, -- activity level score
    login_frequency_score DECIMAL(5,2) DEFAULT 0, -- login frequency health
    
    -- Satisfaction Metrics
    nps_score INTEGER, -- Net Promoter Score (-100 to 100)
    csat_score DECIMAL(5,2), -- Customer Satisfaction (0-100)
    ces_score DECIMAL(5,2), -- Customer Effort Score (0-100)
    
    -- Support and Success Metrics
    support_ticket_volume INTEGER DEFAULT 0,
    average_resolution_time_hours DECIMAL(8,2) DEFAULT 0,
    escalation_rate DECIMAL(5,4) DEFAULT 0,
    first_contact_resolution_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Financial Health Metrics
    payment_timeliness_score DECIMAL(5,2) DEFAULT 100, -- 0-100 payment behavior
    contract_utilization_rate DECIMAL(5,4) DEFAULT 0, -- percentage of contract used
    expansion_revenue DECIMAL(15,2) DEFAULT 0, -- additional revenue this period
    
    -- Engagement Metrics
    email_engagement_score DECIMAL(5,2) DEFAULT 0, -- email open/click rates
    meeting_attendance_rate DECIMAL(5,4) DEFAULT 0, -- meeting attendance
    response_time_score DECIMAL(5,2) DEFAULT 0, -- how quickly they respond
    
    -- AI Calculated Composite Scores
    ai_overall_health_score DECIMAL(5,2) DEFAULT 50, -- AI-weighted overall health
    ai_churn_risk_score DECIMAL(5,4) DEFAULT 0.25, -- AI-calculated churn risk
    ai_expansion_readiness DECIMAL(5,2) DEFAULT 0, -- readiness for expansion
    ai_advocacy_potential DECIMAL(5,2) DEFAULT 0, -- potential to become advocate
    
    -- Benchmarking
    industry_benchmark_comparison JSONB DEFAULT '{}', -- comparison to industry
    peer_comparison JSONB DEFAULT '{}', -- comparison to similar customers
    historical_comparison JSONB DEFAULT '{}', -- comparison to past performance
    
    -- System Fields
    created_by INTEGER REFERENCES company_user_profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document library and knowledge base
CREATE TABLE customer_document_library (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    -- Document Details
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- contract, proposal, presentation, manual, report, invoice
    document_category VARCHAR(100) NOT NULL, -- sales, legal, technical, financial, marketing
    document_description TEXT,
    
    -- File Information
    file_url VARCHAR(500),
    file_type VARCHAR(50), -- pdf, docx, pptx, xlsx, etc.
    file_size BIGINT DEFAULT 0, -- in bytes
    thumbnail_url VARCHAR(500),
    checksum VARCHAR(128), -- for file integrity
    
    -- Document Metadata
    document_version VARCHAR(50) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT true,
    parent_document_id INTEGER REFERENCES customer_document_library(id),
    
    -- Access and Sharing
    is_shared_with_customer BOOLEAN DEFAULT false,
    customer_access_level VARCHAR(50) DEFAULT 'none', -- none, view, download, comment
    internal_access_level VARCHAR(50) DEFAULT 'view', -- view, edit, admin
    expiration_date TIMESTAMP,
    
    -- Tracking
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    last_modified TIMESTAMP,
    
    -- AI Analysis
    ai_document_summary TEXT, -- AI-generated summary
    ai_key_topics JSONB DEFAULT '[]', -- AI-extracted topics
    ai_sentiment_analysis JSONB DEFAULT '{}', -- AI sentiment of document
    ai_importance_score DECIMAL(5,2) DEFAULT 50, -- AI-calculated importance
    ai_extracted_entities JSONB DEFAULT '[]', -- AI-extracted entities
    
    -- Collaboration
    comments_enabled BOOLEAN DEFAULT true,
    version_history JSONB DEFAULT '[]', -- version change history
    
    -- System Fields
    created_by INTEGER REFERENCES company_user_profiles(id),
    shared_by INTEGER REFERENCES company_user_profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Full-text search
    document_search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(document_name, '') || ' ' ||
            COALESCE(document_description, '') || ' ' ||
            COALESCE(ai_document_summary, '') || ' ' ||
            CASE WHEN ai_key_topics IS NOT NULL THEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(ai_key_topics)), ' ') ELSE '' END
        )
    ) STORED
);

-- Customer portal activity tracking
CREATE TABLE customer_portal_activity (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    contact_id INTEGER, -- reference to customer contacts
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL, -- login, document_view, document_download, support_ticket, payment, profile_update
    activity_description TEXT,
    activity_details JSONB DEFAULT '{}',
    
    -- Session Information
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    
    -- Activity Metadata
    page_visited VARCHAR(255),
    time_spent_seconds INTEGER DEFAULT 0,
    actions_taken JSONB DEFAULT '[]',
    referrer_url VARCHAR(500),
    
    -- Geolocation
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- AI Analysis
    ai_engagement_score DECIMAL(5,2) DEFAULT 50, -- AI-calculated engagement
    ai_intent_analysis VARCHAR(100), -- AI-detected intent
    ai_satisfaction_indicators JSONB DEFAULT '[]', -- AI-detected satisfaction signals
    ai_risk_indicators JSONB DEFAULT '[]', -- AI-detected risk signals
    
    -- System Fields
    activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account engagement alerts and notifications
CREATE TABLE account_engagement_alerts (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES enhanced_accounts(id) NOT NULL,
    company_id INTEGER REFERENCES companies(id) NOT NULL,
    
    -- Alert Details
    alert_type VARCHAR(100) NOT NULL, -- engagement_drop, churn_risk, expansion_opportunity, satisfaction_decline
    alert_severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    alert_title VARCHAR(255) NOT NULL,
    alert_description TEXT,
    alert_message TEXT,
    
    -- Alert Configuration
    trigger_conditions JSONB NOT NULL, -- conditions that triggered the alert
    threshold_values JSONB DEFAULT '{}', -- threshold values used
    
    -- Alert Status
    status VARCHAR(50) DEFAULT 'active', -- active, acknowledged, resolved, dismissed
    acknowledged_by INTEGER REFERENCES company_user_profiles(id),
    acknowledged_at TIMESTAMP,
    resolved_by INTEGER REFERENCES company_user_profiles(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    -- Actions and Follow-up
    recommended_actions JSONB DEFAULT '[]',
    assigned_to INTEGER REFERENCES company_user_profiles(id),
    due_date TIMESTAMP,
    escalation_level INTEGER DEFAULT 1,
    escalated_at TIMESTAMP,
    
    -- AI Analysis
    ai_urgency_score DECIMAL(5,2) DEFAULT 50, -- AI-calculated urgency
    ai_impact_prediction JSONB DEFAULT '{}', -- AI-predicted impact
    ai_recommended_response TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comprehensive indexes for performance
CREATE INDEX idx_enhanced_accounts_company_id ON enhanced_accounts(company_id);
CREATE INDEX idx_enhanced_accounts_customer_id ON enhanced_accounts(customer_id);
CREATE INDEX idx_enhanced_accounts_account_manager ON enhanced_accounts(account_manager_id);
CREATE INDEX idx_enhanced_accounts_status ON enhanced_accounts(account_status, account_type);
CREATE INDEX idx_enhanced_accounts_ai_health ON enhanced_accounts(ai_health_score DESC);
CREATE INDEX idx_enhanced_accounts_search_vector ON enhanced_accounts USING gin(account_search_vector);
CREATE INDEX idx_enhanced_accounts_created_at ON enhanced_accounts(created_at DESC);
CREATE INDEX idx_enhanced_accounts_updated_at ON enhanced_accounts(updated_at DESC);

CREATE INDEX idx_customer_timeline_account_id ON customer_unified_timeline(account_id);
CREATE INDEX idx_customer_timeline_company_id ON customer_unified_timeline(company_id);
CREATE INDEX idx_customer_timeline_type ON customer_unified_timeline(timeline_type, timeline_subtype);
CREATE INDEX idx_customer_timeline_date ON customer_unified_timeline(timeline_date DESC);
CREATE INDEX idx_customer_timeline_search_vector ON customer_unified_timeline USING gin(timeline_search_vector);
CREATE INDEX idx_customer_timeline_ai_importance ON customer_unified_timeline(ai_importance_score DESC);

CREATE INDEX idx_account_ecosystem_primary ON account_ecosystem_map(primary_account_id);
CREATE INDEX idx_account_ecosystem_related ON account_ecosystem_map(related_entity_type, related_entity_id);
CREATE INDEX idx_account_ecosystem_company_id ON account_ecosystem_map(company_id);

CREATE INDEX idx_customer_success_account_id ON customer_success_metrics(account_id);
CREATE INDEX idx_customer_success_date ON customer_success_metrics(measurement_date DESC);
CREATE INDEX idx_customer_success_health ON customer_success_metrics(ai_overall_health_score DESC);

CREATE INDEX idx_document_library_account_id ON customer_document_library(account_id);
CREATE INDEX idx_document_library_type ON customer_document_library(document_type, document_category);
CREATE INDEX idx_document_library_search_vector ON customer_document_library USING gin(document_search_vector);

CREATE INDEX idx_portal_activity_account_id ON customer_portal_activity(account_id);
CREATE INDEX idx_portal_activity_type ON customer_portal_activity(activity_type);
CREATE INDEX idx_portal_activity_timestamp ON customer_portal_activity(activity_timestamp DESC);

CREATE INDEX idx_engagement_alerts_account_id ON account_engagement_alerts(account_id);
CREATE INDEX idx_engagement_alerts_status ON account_engagement_alerts(status, alert_severity);
CREATE INDEX idx_engagement_alerts_assigned_to ON account_engagement_alerts(assigned_to);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enhanced_accounts_updated_at BEFORE UPDATE ON enhanced_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_timeline_updated_at BEFORE UPDATE ON customer_unified_timeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_ecosystem_updated_at BEFORE UPDATE ON account_ecosystem_map
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_library_updated_at BEFORE UPDATE ON customer_document_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_alerts_updated_at BEFORE UPDATE ON account_engagement_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();