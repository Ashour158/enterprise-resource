# Multi-Company ERP System with Advanced RBAC - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: To create a comprehensive, enterprise-grade ERP system that provides real-time data synchronization across all business modules with multi-company architecture, advanced role-based permission management, and intelligent conflict resolution, ensuring data consistency, security isolation, and operational efficiency for organizations managing multiple business entities.

**Success Indicators**: 
- Zero data conflicts during normal operations with 95% automated resolution rate
- Sub-second synchronization latency across all modules  
- 99.9% uptime for real-time sync services
- Secure multi-company data isolation with zero cross-company data leaks
- Advanced RBAC with granular permissions and company isolation
- User adoption rate of 95% across all business modules
- Seamless company switching without re-authentication
- 95%+ security compliance score across all standards

**Experience Qualities**: 
- **Secure**: Multi-layered security with complete company data isolation and advanced RBAC
- **Reliable**: Users trust the system with critical business data and permission management
- **Responsive**: Real-time updates provide immediate feedback across all operations
- **Unified**: Seamless integration across all business functions and multiple companies
- **Compliant**: Enterprise-grade security and compliance monitoring

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, multi-company support, real-time synchronization, AI-powered conflict resolution, enterprise RBAC)

**Primary User Activity**: Creating and managing business data with real-time collaboration across departments and companies, with secure context switching and granular permission control

## Technical Specifications

### Backend Architecture
- **Framework**: Flask with Python 3.9+, SQLAlchemy ORM, Flask-JWT-Extended
- **Real-time**: Flask-SocketIO for WebSocket support with company-isolated channels
- **Authentication**: JWT tokens with MFA, company context, and bcrypt password hashing
- **Security**: Multi-layered security framework with RBAC and company isolation
- **Integration**: Event-driven architecture for module communication

### Frontend Architecture  
- **Framework**: React 18+ with TypeScript, Material-UI components
- **Real-time**: WebSocket integration with company context for live updates
- **State Management**: React hooks with KV persistence for multi-company state

### Database Architecture
- **Primary Database**: PostgreSQL 14+ with multi-tenant schema isolation
- **Company Isolation**: Each company maintains its own data isolation and role assignments  
- **Session Management**: JWT tokens include company context for proper data filtering and security

## Multi-Company User Architecture & Profile Management

The system supports comprehensive user profile management with global and company-specific contexts:

### Global User Profile
- **Authentication Credentials**: Email (unique globally), password with MFA support
- **Personal Information**: Name, phone, profile picture, emergency contacts
- **Global Preferences**: Language, timezone, theme, accessibility settings
- **Security Settings**: MFA configuration, trusted devices, login history
- **Multi-Company Access**: Users can access multiple companies with single email

### Company-Specific Profiles  
- **Professional Information**: Employee ID, department, job title, manager
- **Role Assignments**: Company-specific roles and permissions
- **Local Settings**: Company-specific preferences and module access
- **Activity Tracking**: Company-isolated audit logs and activity history

### Profile Management Features
- **Avatar Upload**: Secure image upload with progress tracking and validation
- **Comprehensive Preferences**: Detailed customization for appearance, notifications, accessibility
- **Security Center**: MFA setup, backup codes, session management, password changes
- **Activity Monitoring**: Complete audit trail of profile changes and system access
- **Data Export**: Profile and activity data export in multiple formats

### User Experience Flow
1. **Single Authentication**: Users log in once with their global credentials
2. **Company Context**: System automatically loads appropriate company context
3. **Context Switching**: Seamless switching between companies without re-authentication  
4. **Profile Management**: Unified interface for managing global and company-specific settings
5. **Security Monitoring**: Real-time alerts for security events and suspicious activity

The system supports users having access to multiple companies with the same email address. Users can switch between companies they have access to without re-authentication, maintaining proper data isolation and security.

### Architecture Overview
- Global users table stores authentication credentials and personal information
- Company user profile table stores company-specific information (employee ID, department, role)  
- Users can be invited to multiple companies and switch between them
- Each company maintains its own data isolation and role assignments
- Sessions include company context for proper data filtering and security

### Core Database Schema

```sql
-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'enterprise',
    settings JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Global users table (email is unique globally across all companies)
CREATE TABLE global_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    profile_picture_url VARCHAR(500),
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    backup_codes JSONB DEFAULT '[]',
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company user profiles (many-to-many: users can belong to multiple companies)
CREATE TABLE company_user_profiles (
    id SERIAL PRIMARY KEY,
    global_user_id INTEGER REFERENCES global_users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    department_id INTEGER REFERENCES departments(id),
    job_title VARCHAR(255),
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    manager_id INTEGER REFERENCES company_user_profiles(id),
    cost_center VARCHAR(50),
    hire_date DATE,
    employment_type VARCHAR(20) DEFAULT 'full_time',
    salary_band VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(global_user_id, company_id)
);

-- Roles table (company-specific)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions TEXT[] DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, role_name)
);

-- Departments table (company-specific)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id INTEGER REFERENCES departments(id),
    manager_id INTEGER,
    cost_center VARCHAR(50),
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions with company context
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    global_user_id INTEGER REFERENCES global_users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    jwt_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs for security and compliance
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    global_user_id INTEGER REFERENCES global_users(id),
    company_id INTEGER REFERENCES companies(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company invitations
CREATE TABLE company_invitations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    inviter_user_id INTEGER REFERENCES global_users(id),
    email VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    department_id INTEGER REFERENCES departments(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time sync configuration per company
CREATE TABLE sync_configurations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL,
    auto_sync BOOLEAN DEFAULT true,
    sync_interval INTEGER DEFAULT 30,
    priority VARCHAR(20) DEFAULT 'medium',
    conflict_resolution VARCHAR(20) DEFAULT 'manual',
    sync_fields TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, module_id)
);
```
## Essential Features

### Comprehensive User Profile Management

**Core Functionality**:
- **Global Profile Management**: Unified profile across all companies with personal information, preferences, and security settings
- **Avatar Upload System**: Secure image upload with progress tracking, validation, and preview functionality
- **Multi-Company Profiles**: Company-specific professional information, roles, and settings with seamless context switching
- **Comprehensive Preferences**: Detailed customization options for appearance, notifications, accessibility, privacy, and advanced settings
- **Security Center**: Complete security management including MFA setup, backup codes, trusted devices, and session management
- **Activity Monitoring**: Comprehensive audit trail of all profile changes, security events, and system access
- **Data Export**: Profile and activity data export in multiple formats (JSON, CSV) with privacy protection

**Profile Categories**:
- **Basic Information**: Name, contact details, professional information, skills, certifications, emergency contacts
- **Security Settings**: Password management, MFA configuration, trusted devices, login history, API keys  
- **Preferences Management**: Theme, language, timezone, notifications, accessibility options, privacy controls
- **Activity Tracking**: Change log, security events, login history with detailed filtering and search

**Security Features**:
- **Multi-Factor Authentication**: Support for TOTP, SMS, and email-based MFA with backup codes
- **Session Management**: Active session monitoring with device tracking and remote session revocation
- **Security Monitoring**: Real-time alerts for suspicious activity, failed login attempts, and security policy violations
- **Privacy Controls**: Granular control over data sharing, analytics opt-in, and profile visibility

**User Experience**:
- **Intuitive Interface**: Clean, accessible design with progressive disclosure and guided workflows
- **Real-time Updates**: Instant feedback for all profile changes with optimistic UI updates
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation, screen reader support, high contrast mode, and customizable text sizes

### Advanced Role-Based Permission Management

**Core Functionality**:
- **Hierarchical Role System**: Multi-level role hierarchy with inheritance and delegation capabilities
- **Granular Permissions**: Fine-grained permission control with scope-based restrictions (global, company, department, team, own)
- **Company Isolation**: Complete separation of roles and permissions between companies with secure context switching
- **Permission Templates**: Pre-configured permission sets for common roles and responsibilities
- **Dynamic Permission Assignment**: Runtime permission assignment with approval workflows and temporary access
- **Risk Assessment**: Automatic risk level evaluation for permissions and role combinations
- **Audit Trail**: Comprehensive logging of all permission changes and access attempts

**Permission Scope Architecture**:
- **Global Scope**: System-wide permissions (super admin functions)
- **Company Scope**: Company-specific permissions (admin, management functions)
- **Department Scope**: Department-level permissions (team management, reporting)
- **Team Scope**: Team-specific permissions (project access, collaboration)
- **Own Scope**: User's own data permissions (profile, personal documents)

**Advanced Security Features**:
- **Multi-Factor Authentication**: Conditional MFA based on permission risk levels
- **Time-Based Access**: Temporary permissions with automatic expiration
- **IP Whitelisting**: Location-based access restrictions for sensitive permissions
- **Approval Workflows**: Multi-step approval process for high-risk permission grants
- **Permission Inheritance**: Automatic permission propagation through organizational hierarchy
- **Conflict Detection**: Automatic detection and resolution of permission conflicts

### Multi-Company Access Control

**Core Functionality**:
- **User Invitation System**: Secure invitation workflow with role assignment and approval
- **Company Switching**: Seamless context switching between companies without re-authentication
- **Cross-Company User Management**: Centralized management of users across multiple companies
- **Security Policy Engine**: Company-specific security policies and enforcement rules
- **Access Audit**: Comprehensive audit trail for all company access and permission changes

### Advanced Conflict Resolution System

**Core Functionality**:
1. **Intelligent Conflict Detection**
   - Real-time monitoring across all ERP modules
   - Multiple conflict types: data mismatch, concurrent edit, version conflict, permission conflict
   - Business impact classification (revenue, compliance, operations, reporting)
   - Priority-based conflict categorization (critical, high, medium, low)

2. **AI-Powered Resolution Suggestions**
   - Machine learning analysis of conflict patterns
   - Context-aware resolution recommendations
   - Confidence scoring for suggested resolutions
   - Historical data analysis for optimal strategies

3. **Automated Workflow Engine**
   - Custom workflow builder with drag-and-drop interface
   - Trigger-based automation (priority, module, business impact)
   - Multi-step approval processes with escalation rules
   - Notification and alerting system

4. **Resolution Strategies**
   - Server wins / Client wins (simple overrides)
   - Intelligent merge with field-level rules
   - AI-assisted resolution with contextual analysis
   - Human review workflow with expert assignment
   - Approval-based resolution for critical conflicts

5. **Analytics and Monitoring**
   - Real-time conflict dashboards with trends
   - Resolution performance metrics
   - Business impact analysis
   - Module-wise conflict distribution
   - Resolution method effectiveness tracking

6. **Bulk Operations**
   - Mass conflict resolution with unified strategies
   - Batch processing for similar conflict types
   - Pattern-based auto-resolution rules
   - Scheduled conflict processing

7. **Escalation Management**
   - Automatic escalation based on business impact
   - Timeout-based escalation rules
   - Role-based assignment and notifications
   - Audit trail for all escalation actions

### Connection Status Monitoring
- **Functionality**: Real-time display of sync status, connection quality, and pending updates
- **Purpose**: Provide transparency into system health and data synchronization state
- **Success Criteria**: Clear visual indicators that update within 1 second of status changes

### Multi-Company Support
- **Functionality**: Isolated data contexts for different companies with secure switching
- **Purpose**: Enable service providers to manage multiple client companies
- **Success Criteria**: Complete data isolation with zero cross-company data leakage

## Design Direction

### Visual Tone & Identity

**Emotional Response**: The design should evoke trust, efficiency, and technological sophistication. Users should feel confident managing critical business data.

**Design Personality**: Professional, modern, and systematic. The interface should feel like a premium enterprise tool while remaining approachable.

**Visual Metaphors**: 
- Connection indicators (WiFi-style icons) for sync status
- Progress bars for real-time synchronization
- Color-coded status indicators for data health
- Card-based layouts representing business modules

**Simplicity Spectrum**: Rich interface that balances information density with clarity. Multiple data points need to be visible simultaneously without overwhelming the user.

### Color Strategy

**Color Scheme Type**: Triadic with primary blue, complementary orange accents, and success green

**Primary Color**: Deep blue (oklch(0.45 0.15 240)) - conveys trust, stability, and professionalism
**Secondary Colors**: Light warm gray (oklch(0.92 0.08 60)) - provides neutral background for data
**Accent Color**: Vibrant orange (oklch(0.70 0.20 50)) - draws attention to important actions and alerts

**Color Psychology**: 
- Blue establishes trust and reliability for financial data
- Orange creates urgency for alerts and conflicts
- Green confirms successful operations and sync status
- Gray provides calm background for complex interfaces

**Foreground/Background Pairings**:
- Background (white): Foreground (dark blue) - 15.2:1 ratio
- Card (light gray): Foreground (dark blue) - 14.8:1 ratio
- Primary (blue): Foreground (white) - 9.8:1 ratio
- Accent (orange): Foreground (white) - 7.2:1 ratio

### Typography System

**Font Pairing Strategy**: Single font family (Inter) with multiple weights for consistency and clarity
**Primary Font**: Inter - chosen for excellent readability at small sizes and professional appearance
**Monospace Font**: JetBrains Mono - for technical data, IDs, and code-like content

**Typographic Hierarchy**:
- H1 (Dashboard titles): 2rem, font-bold
- H2 (Card titles): 1.25rem, font-semibold  
- H3 (Section headers): 1rem, font-medium
- Body text: 0.875rem, font-normal
- Small text/labels: 0.75rem, font-normal

### Visual Hierarchy & Layout

**Attention Direction**: 
1. Sync status indicators (top priority)
2. Module cards with current data
3. Real-time notifications and conflicts
4. Secondary monitoring panels

**Grid System**: 12-column grid with responsive breakpoints, allowing for flexible module layouts

**Component Hierarchy**:
- Primary: Sync status, module access buttons
- Secondary: Data display cards, charts
- Tertiary: Settings, configuration options

### Real-Time Visual Indicators

**Sync Status Icons**: WiFi-style connectivity indicators with color coding:
- Green: Excellent connection, all data synced
- Yellow: Good connection, minor delays
- Orange: Poor connection, sync issues
- Red: Offline or failed connection

**Progress Indicators**: Linear progress bars for sync operations with percentage completion

**Conflict Indicators**: 
- Warning badges with count of unresolved conflicts
- Priority-based color coding (critical=red, high=orange, medium=yellow, low=green)
- Business impact icons (revenue, compliance, operations, reporting)
- Resolution progress indicators with confidence scores

### Advanced Conflict Resolution UI Components

**Conflict Dashboard**:
- Tabbed interface: Conflicts, Workflows, Analytics, Approvals
- Summary metrics cards with trend indicators
- Priority-based filtering and sorting
- Bulk action controls with strategy selection

**Conflict Resolution Interface**:
- Side-by-side value comparison (server vs client)
- AI suggestion panels with confidence scoring
- One-click resolution buttons (server wins, client wins, AI suggestion)
- Escalation workflow with reason input
- Conflict metadata display (timestamp, affected users, dependencies)

**Workflow Builder**:
- Visual workflow designer with drag-and-drop
- Trigger condition builder with rule engine
- Step configuration with branching logic
- Template gallery for common workflows
- Real-time workflow testing and validation

**Analytics Dashboard**:
- Interactive charts for conflict trends
- Module-wise conflict distribution
- Business impact analysis with drill-down
- Resolution method effectiveness metrics
- Performance KPIs with historical comparisons

**Approval Interface**:
- Multi-step approval workflow visualization
- Role-based approval assignments
- Comment and decision tracking
- Escalation timeline with notifications
- Batch approval capabilities

## Implementation Considerations

### Technical Architecture
- WebSocket connections for real-time updates
- React hooks for sync state management
- Persistent storage for offline conflict resolution
- Component-based architecture for modularity

### Scalability Needs
- Support for 100+ concurrent users per company
- Ability to add new ERP modules without breaking changes
- Horizontal scaling of sync services

### Performance Requirements
- Initial page load under 3 seconds
- Sync updates propagated within 1 second
- Conflict detection within 500ms

## Edge Cases & Problem Scenarios

**Network Interruptions**: Graceful degradation with offline mode and sync queue
**Concurrent Edits**: Real-time conflict detection with clear resolution UI
**Large Data Updates**: Batch processing with progress indication
**Module Failures**: Isolated failure handling without affecting other modules

## Reflection

This approach uniquely combines enterprise-grade ERP functionality with consumer-grade real-time experience expectations. The visual design emphasizes transparency and control, allowing users to understand and trust the synchronization process. The modular architecture ensures the system can grow with business needs while maintaining performance and reliability.

The real-time synchronization differentiates this ERP from traditional systems by eliminating the "refresh to see changes" paradigm, creating a more collaborative and efficient business environment.