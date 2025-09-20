# Enhanced CRM API Endpoints - Complete Reference

## API Base URL
```
Production: https://api.yourerpapp.com/v1
Staging: https://staging-api.yourerpapp.com/v1
Development: http://localhost:5000/api/v1
```

## Authentication
All API endpoints require JWT authentication with company context:
```
Authorization: Bearer <jwt_token>
X-Company-ID: <company_id>
Content-Type: application/json
```

## Core CRM API Endpoints

### Lead Management System

#### 1. Get Lead Full View
```http
GET /api/crm/leads/{id}/full-view
```
**Description**: Complete lead profile with all related data, activity timeline, and AI insights

**Parameters**:
- `id` (path): Lead unique identifier
- `include_timeline` (query): Include activity timeline (default: true)
- `include_ai_insights` (query): Include AI recommendations (default: true)
- `include_email_history` (query): Include email thread history (default: false)

**Response Example**:
```json
{
  "lead": {
    "id": "lead-001",
    "lead_number": "LEAD-2024-001",
    "full_name": "John Smith",
    "email": "john@techcorp.com",
    "company_name": "Tech Corp",
    "job_title": "CTO",
    "phone": "+1-555-0123",
    "lead_status": "qualified",
    "ai_lead_score": 85.5,
    "conversion_probability": 0.72,
    "estimated_deal_value": 150000,
    "assigned_to": {
      "id": "user-001",
      "name": "Sarah Johnson",
      "email": "sarah@company.com"
    },
    "timeline": [],
    "ai_insights": {
      "next_best_action": "schedule_demo",
      "buying_signals": ["visited_pricing_page", "downloaded_whitepaper"],
      "personality_profile": {
        "decision_maker": 0.8,
        "technical_focus": 0.9,
        "urgency_level": 0.6
      }
    },
    "custom_fields": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:15:00Z"
  }
}
```

#### 2. Send Email to Lead
```http
POST /api/crm/leads/{id}/email
```
**Description**: Send email with tracking, templates, and AI personalization

**Request Body**:
```json
{
  "template_id": "template-001",
  "subject": "Following up on your demo request",
  "body": "Hi John, thanks for your interest...",
  "track_opens": true,
  "track_clicks": true,
  "schedule_send": "2024-01-21T09:00:00Z",
  "attachments": [
    {
      "filename": "product-brochure.pdf",
      "url": "https://storage.company.com/files/brochure.pdf"
    }
  ]
}
```

**Response Example**:
```json
{
  "email_id": "email-001",
  "tracking_id": "track-001",
  "sent_at": "2024-01-21T09:00:00Z",
  "status": "sent",
  "tracking_pixel_url": "https://track.company.com/pixel/track-001.gif",
  "unsubscribe_url": "https://company.com/unsubscribe?token=abc123"
}
```

#### 3. Get Email History
```http
GET /api/crm/leads/{id}/email-history
```
**Description**: Complete email thread history with tracking data and engagement metrics

**Parameters**:
- `page` (query): Page number for pagination (default: 1)
- `limit` (query): Items per page, max 100 (default: 50)
- `include_tracking` (query): Include tracking data (default: true)

**Response Example**:
```json
{
  "emails": [
    {
      "id": "email-001",
      "subject": "Following up on your demo request",
      "sent_at": "2024-01-21T09:00:00Z",
      "opened_at": "2024-01-21T09:15:00Z",
      "clicks": 2,
      "status": "delivered",
      "template_id": "template-001"
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 3,
    "total_items": 25,
    "has_more": true
  },
  "engagement_summary": {
    "total_emails": 25,
    "total_opens": 15,
    "total_clicks": 8,
    "open_rate": 0.6,
    "click_rate": 0.32
  }
}
```

#### 4. Schedule Meeting
```http
POST /api/crm/leads/{id}/schedule
```
**Description**: Schedule meeting with calendar integration and automatic conflict detection

**Request Body**:
```json
{
  "meeting_type": "demo",
  "duration_minutes": 60,
  "preferred_times": [
    "2024-01-25T14:00:00Z",
    "2024-01-25T15:00:00Z",
    "2024-01-26T10:00:00Z"
  ],
  "attendees": [
    {
      "email": "john@techcorp.com",
      "name": "John Smith",
      "role": "lead"
    },
    {
      "email": "sarah@company.com", 
      "name": "Sarah Johnson",
      "role": "sales_rep"
    }
  ],
  "meeting_details": {
    "agenda": "Product demo and Q&A",
    "location": "Zoom meeting",
    "preparation_notes": "Review technical requirements beforehand"
  }
}
```

#### 5. Get Activity Timeline
```http
GET /api/crm/leads/{id}/timeline
```
**Description**: Interactive timeline with all activities, emails, calls, and system events

**Parameters**:
- `activity_types` (query): Filter by types (email,call,meeting,note,task)
- `date_from` (query): Start date for timeline (ISO 8601)
- `date_to` (query): End date for timeline (ISO 8601)
- `limit` (query): Maximum activities to return (default: 100)

#### 6. Initiate Call
```http
POST /api/crm/leads/{id}/call
```
**Description**: Initiate call with automatic activity logging and outcome tracking

**Request Body**:
```json
{
  "call_type": "follow_up",
  "phone_number": "+1-555-0123",
  "caller_id": "user-001",
  "notes": "Following up on demo scheduling",
  "expected_duration": 15
}
```

### Real-time Communication

#### 7. Real-time Updates (WebSocket)
```http
GET /api/crm/leads/real-time-updates
```
**Description**: WebSocket endpoint for live updates across all CRM data

**Connection URL**: `ws://api.company.com/v1/crm/leads/real-time-updates`

**Authentication**: Include JWT token in connection headers or query parameter

**Message Types**:
- `lead_updated`: Lead data changed
- `email_received`: New email received
- `meeting_scheduled`: Meeting was scheduled
- `activity_created`: New activity logged
- `user_online`: Team member came online
- `user_offline`: Team member went offline

### Email Integration

#### 8. Email Synchronization
```http
POST /api/crm/email/sync
```
**Description**: Trigger email synchronization with external providers

**Request Body**:
```json
{
  "provider": "gmail",
  "full_sync": false,
  "sync_from_date": "2024-01-01T00:00:00Z",
  "mailbox_folders": ["INBOX", "Sent"]
}
```

#### 9. Email Templates
```http
GET /api/crm/email/templates
POST /api/crm/email/templates
PUT /api/crm/email/templates/{id}
DELETE /api/crm/email/templates/{id}
```

### Calendar & Scheduling

#### 10. Check Team Availability
```http
GET /api/crm/calendar/availability
```
**Description**: Check team availability for scheduling with smart conflict detection

**Parameters**:
- `user_ids[]` (query): Users to check (can specify multiple)
- `date_from` (query): Start date/time (ISO 8601)
- `date_to` (query): End date/time (ISO 8601) 
- `duration_minutes` (query): Required meeting duration
- `timezone` (query): Timezone for results (default: UTC)

**Response Example**:
```json
{
  "available_slots": [
    {
      "start_time": "2024-01-25T14:00:00Z",
      "end_time": "2024-01-25T15:00:00Z",
      "attendees_available": ["user-001", "user-002"],
      "confidence_score": 0.95
    }
  ],
  "timezone": "America/New_York",
  "business_hours": {
    "start": "09:00",
    "end": "17:00",
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  "suggestions": [
    {
      "time": "2024-01-25T15:00:00Z",
      "reason": "All attendees available, outside current meetings"
    }
  ]
}
```

### Search & Discovery

#### 11. Global Search
```http
POST /api/crm/search/global
```
**Description**: Global search across all CRM data with AI-powered relevance ranking

**Request Body**:
```json
{
  "query": "John Smith Tech Corp",
  "modules": ["leads", "contacts", "deals", "companies"],
  "filters": {
    "lead_status": ["qualified", "contacted"],
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  },
  "limit": 50,
  "include_ai_ranking": true
}
```

**Response Example**:
```json
{
  "results": [
    {
      "type": "lead",
      "id": "lead-001",
      "title": "John Smith - Tech Corp",
      "snippet": "CTO at Tech Corp, interested in enterprise solution...",
      "relevance_score": 0.95,
      "url": "/crm/leads/lead-001"
    }
  ],
  "total_matches": 125,
  "search_time_ms": 45,
  "suggestions": ["John Smith CTO", "Tech Corp leads"],
  "facets": {
    "lead_status": {
      "qualified": 15,
      "contacted": 8,
      "new": 3
    },
    "company_size": {
      "enterprise": 12,
      "mid_market": 8,
      "smb": 6
    }
  }
}
```

### AI-Powered Features

#### 12. AI Lead Scoring
```http
POST /api/crm/leads/{id}/ai-score
```
**Description**: Calculate AI-powered lead score with explanation

#### 13. AI Insights
```http
GET /api/crm/leads/{id}/ai-insights
```
**Description**: Get AI-generated insights and recommendations

#### 14. AI Recommendations
```http
POST /api/crm/leads/ai-recommendations
```
**Description**: Get AI recommendations for next actions

#### 15. AI Email Composition
```http
POST /api/crm/email/ai-compose
```
**Description**: Generate personalized email content using AI

**Request Body**:
```json
{
  "lead_id": "lead-001",
  "email_type": "follow_up",
  "tone": "professional",
  "key_points": ["demo scheduling", "technical questions"],
  "previous_conversations": true
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req-123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limiting

Rate limits are applied per endpoint and per company:
- Authentication endpoints: 10 requests/minute
- Read operations: 1000 requests/minute  
- Write operations: 100 requests/minute
- File uploads: 10 requests/minute
- WebSocket connections: 5 concurrent per user

## Webhook Events

The system can send webhook notifications for:
- `lead.created`
- `lead.updated` 
- `lead.converted`
- `email.sent`
- `email.opened`
- `email.clicked`
- `meeting.scheduled`
- `meeting.completed`
- `activity.created`

## SDK and Libraries

Official SDKs available for:
- JavaScript/TypeScript
- Python
- PHP
- C#/.NET
- Java

Example JavaScript usage:
```javascript
import { CRMApiClient } from '@company/crm-api-client'

const client = new CRMApiClient({
  apiKey: 'your-api-key',
  companyId: 'company-123'
})

const lead = await client.leads.getFullView('lead-001')
```