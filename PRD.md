# PUSPA V5 — Product Requirements Document

**Pertubuhan Urus Peduli Asnaf (PPM-024-10-05012022)**  
**Malaysian NGO Management Platform**

| Field | Value |
|---|---|
| Document Version | 5.0 |
| Last Updated | March 2026 |
| Status | Active Development |
| Author | PUSPA Engineering Team |
| Classification | Internal — Confidential |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [Feature Requirements](#5-feature-requirements)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [AI Assistant Requirements (Maria Puspa)](#8-ai-assistant-requirements-maria-puspa)
9. [RBAC & Security Requirements](#9-rbac--security-requirements)
10. [Data & Privacy Requirements](#10-data--privacy-requirements)
11. [Integration Requirements](#11-integration-requirements)
12. [Success Metrics & KPIs](#12-success-metrics--kpis)
13. [Release Roadmap](#13-release-roadmap)
14. [Open Issues & Risks](#14-open-issues--risks)

---

## 1. Executive Summary

PUSPA V5 is a full-stack, AI-augmented management platform for **Pertubuhan Urus Peduli Asnaf (PUSPA)**, a Malaysian NGO registered under PPM-024-10-05012022, operating primarily in Kuala Lumpur and Selangor. The platform digitises and streamlines the end-to-end operations of managing asnaf (needy) beneficiaries — from member registration and eKYC verification, through case management and donation tracking, to disbursement processing and regulatory compliance.

The platform comprises **17 core modules** spanning operational management, compliance, and an AI assistant. At its centre is **Maria Puspa**, a RAG-grounded AI assistant with 18 tool-calling capabilities, bilingual fluency (Bahasa Melayu primary, English secondary), and strict adherence to mandatory tool use before answering — eliminating hallucination in operational data queries.

PUSPA V5 is built on **Next.js 16 (App Router)** with **Prisma ORM 6** and **SQLite** (with PostgreSQL migration readiness), styled with **Tailwind CSS 4** and **shadcn/ui**, powered by **Zustand 5** for state management, and deployed to **Vercel (serverless)** and **Alibaba Cloud Function Compute**. The AI layer uses **OpenRouter** with key rotation and SSE streaming.

### Key Differentiators

- **Mandatory RAG Architecture**: Maria Puspa must call tools before answering any operational query — never fabricates data
- **PII-First Design**: IC numbers masked to `****XXXX` at the data layer; PDPA-compliant by default
- **Shariah-Compliant Donation Tracking**: Native support for zakat, sadaqah, waqf, infaq, and general donations with compliance flags
- **9-Stage Case Workflow**: Draft → Intake → Verification → Assessment → Approval → Disbursement → Follow-Up → Closed / Rejected
- **8 Asnaf Categories**: Fakir, Miskin, Amil, Muallaf, Gharimin, Riqab, Ibnu Sabil, Fisabilillah — per Malaysian zakat classification
- **Telegram Bot Integration**: @MariaPuspaBot with long-polling, session management, and allowlist-based access control

---

## 2. Problem Statement

### 2.1 Current Pain Points

PUSPA, like many small-to-medium Malaysian NGOs, operates with fragmented systems:

1. **Manual Member Management**: Asnaf member records are tracked in spreadsheets, leading to data duplication, IC number exposure, and difficulty tracking eKYC verification status across 8 asnaf categories.

2. **No Case Lifecycle Tracking**: Welfare, medical, education, housing, emergency, and financial cases are handled ad-hoc with no structured workflow — resulting in lost follow-ups, unclear approval chains, and no audit trail.

3. **Donation Opacity**: Donations across 5 Islamic categories (zakat, sadaqah, waqf, infaq, general) are tracked manually with no shariah compliance flags, no automatic receipt generation, and no donor relationship management.

4. **Disbursement Gaps**: Disbursement processing lacks a defined stage pipeline, approval verification, or payment reference tracking — creating risk of duplicate or unverified payments.

5. **Compliance Blind Spots**: Regulatory obligations under ROSM (Registrar of Societies Malaysia), LHDN (Inland Revenue Board), and PDPA (Personal Data Protection Act 2010) are tracked manually with no overdue alerts or evidence management.

6. **No Institutional Knowledge**: PUSPA's organizational data (registration PPM-024-10-05012022, verified programmes 2021–2023, partner relationships with PKB, S P Setia Foundation, Jaya Grocer, LZS) is distributed across individuals with no central, queryable knowledge base.

7. **Volunteer Underutilisation**: Volunteer hours, skills, availability, and certificates are untracked — leading to poor deployment and no recognition system.

8. **No AI-Assisted Operations**: Staff must manually query multiple systems to get operational summaries, status checks, or compliance overviews — no conversational interface exists.

### 2.2 Impact

Without a unified platform, PUSPA risks: non-compliance penalties, donor attrition due to lack of transparency, inefficient disbursement cycles, inability to scale beyond current beneficiary count, and reputational risk from data breaches.

---

## 3. Product Vision & Goals

### 3.1 Vision

> To be the definitive digital operations platform for Malaysian asnaf-focused NGOs — where every needy individual is registered, every case is tracked, every ringgit is accounted for, and every compliance obligation is met — powered by an AI assistant that never guesses, always verifies.

### 3.2 Goals

| # | Goal | Success Criteria | Priority |
|---|---|---|---|
| G1 | Centralise asnaf member management | All active members registered with eKYC status by Q2 2026 | P0 |
| G2 | Digitise case lifecycle | 100% of new cases enter 9-stage pipeline | P0 |
| G3 | Ensure donation transparency | All donations tracked with category, receipt, and shariah flag | P0 |
| G4 | Streamline disbursements | Zero unverified disbursements; 5-stage pipeline enforced | P0 |
| G5 | Achieve compliance readiness | All ROSM, LHDN, PDPA items tracked with overdue alerts | P1 |
| G6 | Deploy AI-assisted operations | Maria Puspa handles 80%+ of routine operational queries | P1 |
| G7 | Enable mobile access | Telegram bot operational for all staff by Q3 2026 | P1 |
| G8 | Maintain PII protection | Zero IC number exposure incidents | P0 |

---

## 4. Target Users & Personas

### 4.1 Primary Personas

#### Persona 1: Aina — Operations Staff (Staff Role, Level 1)

| Attribute | Detail |
|---|---|
| Role | Field officer / case worker |
| Age | 28 |
| Tech Comfort | Moderate — uses WhatsApp, basic web apps |
| Language | Bahasa Melayu (primary), basic English |
| Goals | Register asnaf members, create and track cases, log donations, view programmes |
| Frustrations | Manual data entry, no central system, can't see case status quickly |
| Key Modules | Dashboard, Members, Cases, Donations, Donors, Programmes, Volunteers, Activities, Documents, Settings |

#### Persona 2: Hafiz — Programme Manager (Admin Role, Level 2)

| Attribute | Detail |
|---|---|
| Role | Programme manager / compliance officer |
| Age | 35 |
| Tech Comfort | High — comfortable with SaaS tools |
| Language | Bahasa Melayu and English (bilingual) |
| Goals | Approve disbursements, manage compliance, generate reports, oversee eKYC, delete erroneous cases |
| Frustrations | No compliance tracking, slow approval workflows, can't get quick summaries |
| Key Modules | All Staff modules + Compliance, Reports, eKYC, TapSecure, Admin |

#### Persona 3: Dr. Nadia — Technical Lead (Developer Role, Level 3)

| Attribute | Detail |
|---|---|
| Role | Developer / system administrator |
| Age | 32 |
| Tech Comfort | Expert — full-stack developer |
| Language | English (primary), Bahasa Melayu |
| Goals | Configure AI assistant, monitor system health, manage automation jobs, access all tools |
| Frustrations | No visibility into AI behaviour, no system diagnostics, no automation framework |
| Key Modules | All modules + AI module, system tools, delegate_task, approve_disbursement, delete_case |

### 4.2 Secondary Users

| User Type | Role | Access Level |
|---|---|---|
| Volunteer | Self-service portal (future) | Limited read-only |
| Donor | Donation portal (future) | Public donation page |
| Asnaf Member | Beneficiary portal (future) | Own data only |
| Auditor | Read-only compliance access | Compliance + Reports (read) |

---

## 5. Feature Requirements

### 5.1 Must-Have (P0) — Launch Blockers

| ID | Feature | Module | Description |
|---|---|---|---|
| F001 | Asnaf Member CRUD | Members | Create, read, update, delete members with 8 asnaf categories, household management, eKYC status |
| F002 | Case Lifecycle Management | Cases | 9-stage pipeline: draft → intake → verification → assessment → approval → disbursement → follow_up → closed / rejected |
| F003 | Donation Tracking | Donations | Record donations across 5 categories (zakat, sadaqah, waqf, infaq, general) with receipt management and shariah compliance flag |
| F004 | Donor Management | Donors | Track individual, corporate, and government donors with donation history |
| F005 | Disbursement Pipeline | Disbursements | 5-stage processing: pending → approved → disbursed → verified → cancelled |
| F006 | Dashboard Overview | Dashboard | Key metrics: member count, active cases, donation totals, disbursement totals, programme status, compliance score |
| F007 | PII Masking | System | IC numbers masked to `****XXXX` in all views, API responses, and AI outputs |
| F008 | RBAC Enforcement | System | 3-tier role hierarchy (Staff → Admin → Developer) with module-level and tool-level access control |
| F009 | Activity Audit Log | Activities | Immutable log of all create, update, delete, and approval actions with user attribution |
| F010 | Maria Puspa Core AI | AI | RAG-grounded AI assistant with 18 tools, mandatory tool use, SSE streaming, key rotation |

### 5.2 Should-Have (P1) — Post-Launch Enhancements

| ID | Feature | Module | Description |
|---|---|---|---|
| F011 | Programme Beneficiary Tracking | Programmes | Link beneficiaries to programmes with enrollment status tracking |
| F012 | Volunteer Hours & Certificates | Volunteers | Log volunteer hours, approve/reject activity entries, issue certificates |
| F013 | Compliance Dashboard | Compliance | ROSM, LHDN, PDPA, internal, and audit tracking with overdue alerts |
| F014 | eKYC Verification Pipeline | eKYC | IC front/back upload, selfie, OCR extraction, face match scoring, risk levels |
| F015 | Report Generation | Reports | Operational, financial, compliance, and programme reports (PDF/CSV) |
| F016 | Document Versioning | Documents | Upload, version, tag, and link documents to members, cases, or programmes |
| F017 | Telegram Bot | Integration | @MariaPuspaBot with long-polling, allowlist access control, session management |
| F018 | Web Search RAG | AI | web_search and web_read tools for external information retrieval |
| F019 | Donation Trend Analytics | Dashboard | Monthly breakdown by category, trend charts, year-over-year comparison |
| F020 | Notification System | System | In-app and email notifications for case assignments, overdue compliance, disbursement approvals |

### 5.3 Nice-to-Have (P2) — Future Roadmap

| ID | Feature | Module | Description |
|---|---|---|---|
| F021 | Automation Jobs | Admin | Scheduled and event-triggered automation with cron expressions |
| F022 | Ops Work Items | Admin | Internal task/bug/improvement tracking with approval workflows |
| F023 | Public Donation Page | External | Public-facing donation page with Maybank 562209677503 integration |
| F024 | Volunteer Self-Service Portal | External | Volunteers view their own hours, certificates, and upcoming programmes |
| F025 | Multi-Branch Support | System | Support for PUSPA chapters beyond KL/Selangor |
| F026 | WhatsApp Integration | Integration | WhatsApp Business API for member and donor communication |
| F027 | Bank Statement Reconciliation | Donations | Auto-match bank transactions to donation records |
| F028 | Advanced Analytics | Reports | Predictive analytics for donation forecasting, case resolution time, beneficiary needs |
| F029 | Mobile App | Mobile | React Native or Capacitor-based mobile app |
| F030 | PostgreSQL Migration | Infrastructure | Production migration from SQLite to PostgreSQL with zero downtime |

---

## 6. Functional Requirements

### 6.1 Module 1: Dashboard

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| DASH-001 | Display key operational metrics | Total members, active cases, donation total (RM), disbursement total (RM), active programmes, active volunteers, compliance score, pending eKYC |
| DASH-002 | Monthly donation trend chart | Stacked area chart showing zakat, sadaqah, waqf, infaq, general per month |
| DASH-003 | Member breakdown by asnaf category | Bar/pie chart of 8 categories: fakir, miskin, amil, muallaf, gharimin, riqab, ibnu_sabil, fisabilillah |
| DASH-004 | Recent activity feed | Chronological list of last 20 activities with type, title, timestamp |
| DASH-005 | Quick action cards | Shortcut buttons for: Register Member, Create Case, Log Donation, New Disbursement |
| DASH-006 | Compliance alert banner | Red/amber banner when compliance items are overdue or PDPA items pending |
| DASH-007 | Data refreshes on load | Dashboard data fetched on component mount with client-side caching (5-minute stale time) |

### 6.2 Module 2: Members

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| MEM-001 | Register new asnaf member | Required: name, IC number (validated format), asnaf category. Optional: phone, email, address, city, state, postcode, gender, DOB, occupation, monthly income, household size, notes |
| MEM-002 | IC number validation | Malaysian IC format: 12 digits (YYMMDD-XX-XXXX). Store full, display masked `****XXXX` |
| MEM-003 | 8 Asnaf categories | Fakir, Miskin, Amil, Muallaf, Gharimin, Riqab, Ibnu Sabil, Fisabilillah — dropdown with descriptions |
| MEM-004 | Member status management | Active, Inactive, Pending — with status change audit trail |
| MEM-005 | eKYC status display | Per-member: Pending, Verified, Rejected — linked to eKYC module |
| MEM-006 | Household member management | Add spouse, child, parent, sibling, other with IC, DOB, occupation, monthly income |
| MEM-007 | Member search & filter | Search by name, IC (masked), filter by asnaf category, status, eKYC status, state |
| MEM-008 | Member profile view | Tabbed view: Details, Cases, Disbursements, Programme Enrolments, Documents, eKYC Records |
| MEM-009 | Monthly income tracking | Numeric field with RM currency. Used for welfare scoring and asnaf category validation |
| MEM-010 | Member deletion | Soft-delete with audit trail. Admin+ role only |

### 6.3 Module 3: Cases

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| CASE-001 | Create new case | Required: member, type. Optional: priority, description, requested amount. Auto-generate case number |
| CASE-002 | 6 Case types | Welfare, Medical, Education, Housing, Emergency, Financial — each with category-specific fields |
| CASE-003 | 9-Stage pipeline | Draft → Intake → Verification → Assessment → Approval → Disbursement → Follow-Up → Closed / Rejected. Forward-only with stage-gate rules |
| CASE-004 | Priority levels | Low, Medium, High, Urgent — with colour coding and SLA targets |
| CASE-005 | Risk indicator | System-calculated: Low, Medium, High, Critical — based on member profile and case history |
| CASE-006 | Welfare score | Numeric score (0–100) computed from monthly income, household size, asnaf category, and existing cases |
| CASE-007 | Case assignment | Assign to staff member. Track assignment history |
| CASE-008 | Case notes | 4 types: Note, Action, Decision, Follow-Up — with author attribution and timestamps |
| CASE-009 | Case-programme linking | Link case to one or more programmes. Track via CaseProgramme junction |
| CASE-010 | Case deletion | Admin+ only. Requires reason field. Audit logged. (Simulated in V5, soft-delete in production) |

### 6.4 Module 4: Donations

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| DON-001 | Record donation | Required: amount, category. Optional: donor (link or anonymous), method, date, notes |
| DON-002 | 5 Donation categories | Zakat, Sadaqah, Waqf, Infaq, General — each with Islamic context tooltip |
| DON-003 | Shariah compliance flag | Boolean: default `true`. Non-compliant flag triggers review workflow |
| DON-004 | Receipt management | Auto-generate receipt number. Track receipt issued status. Future: PDF receipt download |
| DON-005 | Donation method tracking | Cash, Bank Transfer, Online, Cheque — with Maybank 562209677503 reference |
| DON-006 | Currency | Default MYR. Amounts formatted as RM X,XXX.XX |
| DON-007 | Donation statistics | Current month total, count, breakdown by category. Accessible via AI tool `get_donation_stats` |
| DON-008 | Recent donations list | Last N donations with donor name, amount, category, date. AI tool: `get_recent_donations` |
| DON-009 | Donor linking | Link to existing donor record or create ad-hoc donor name entry |

### 6.5 Module 5: Donors

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| DNR-001 | Donor CRUD | Create, read, update donors. Fields: name, email, phone, address, type, category, notes |
| DNR-002 | 3 Donor types | Individual, Corporate, Government — with type-specific field hints |
| DNR-003 | Donor categories | Regular, Occasional, One-Time — auto-suggested based on donation frequency |
| DNR-004 | Donation history | Linked donation records with total donated and count aggregation |
| DNR-005 | Partner designation | Flag verified partners (PKB, S P Setia Foundation, Jaya Grocer, LZS) with special badge |

### 6.6 Module 6: Disbursements

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| DISB-001 | Create disbursement | Required: member, amount, category. Optional: case link, programme link, payment method, scheduled date |
| DISB-002 | 6 Disbursement categories | Welfare, Medical, Education, Housing, Emergency, Monthly Aid |
| DISB-003 | 5-Stage pipeline | Pending → Approved → Disbursed → Verified → Cancelled. Stage transitions logged |
| DISB-004 | Approval workflow | Admin+ approval required before disbursement. AI tool: `approve_disbursement` (admin only) |
| DISB-005 | Payment tracking | Method (cash, bank_transfer, cheque), payment reference, disbursed date |
| DISB-006 | Verification step | Post-disbursement verification by designated verifier with timestamp |
| DISB-007 | Disbursement summary | Total amount, count, breakdown by status. AI tool: `get_disbursement_summary` |

### 6.7 Module 7: Programmes

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| PROG-001 | Programme CRUD | Name, description, category, status, budget, spent, dates, location, target beneficiaries, impact metric |
| PROG-002 | 6 Programme categories | Education, Welfare, Health, Economic, Social, Religious |
| PROG-003 | Programme status | Planning, Active, Completed, Suspended — with date tracking |
| PROG-004 | Budget tracking | Budget vs. spent with progress bar. Auto-calculate from linked disbursements |
| PROG-005 | Beneficiary enrollment | ProgrammeBeneficiary junction: Enrolled → Active → Completed / Withdrawn |
| PROG-006 | Programme-case linking | CaseProgramme junction for case-to-programme referral tracking |
| PROG-007 | Active programmes query | AI tool: `get_active_programmes` returns currently active programmes |

### 6.8 Module 8: Volunteers

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| VOL-001 | Volunteer CRUD | Name, email, phone, skills (comma-separated), availability, status, total hours, notes |
| VOL-002 | Availability types | Weekdays, Weekends, Flexible — for programme assignment matching |
| VOL-003 | Volunteer status | Active, Inactive, Suspended |
| VOL-004 | Activity logging | Log hours, role, date, notes per activity. Status: Logged → Approved / Rejected |
| VOL-005 | Certificate issuance | Issue certificates with title, date, URL. Track per volunteer |
| VOL-006 | Volunteer statistics | Total, active, inactive counts. AI tool: `get_volunteer_stats` |

### 6.9 Module 9: Compliance

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| COMP-001 | Compliance record CRUD | Category, title, description, status, due date, completed date, evidence URL, assigned to, notes |
| COMP-002 | 5 Compliance categories | ROSM (Registrar of Societies), LHDN (Tax), PDPA (Data Protection), Internal, Audit |
| COMP-003 | Compliance status | Pending, Compliant, Non-Compliant, Expired, Under Review |
| COMP-004 | Overdue tracking | Records past due date with Pending status flagged as overdue |
| COMP-005 | Evidence management | Link evidence documents/URLs to compliance records |
| COMP-006 | Compliance overview | Total, completed, pending, overdue by category. AI tool: `get_compliance_status` |
| COMP-007 | Admin-only access | Compliance module requires Admin role or above |

### 6.10 Module 10: eKYC

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| EKYC-001 | eKYC submission | Member uploads IC front, IC back, selfie. Creates EKYCVerification record |
| EKYC-002 | OCR extraction | Extract IC data via OCR. Store as JSON in `ocrExtracted` field |
| EKYC-003 | Face match scoring | Numeric score (0–1) comparing selfie to IC photo. Store in `faceMatchScore` |
| EKYC-004 | Risk level assessment | Pending, Low, Medium, High — based on OCR match, face score, and member history |
| EKYC-005 | eKYC status pipeline | Pending → Submitted → Under Review → Verified / Rejected |
| EKYC-006 | Verification workflow | Admin reviews and verifies/rejects with notes. `verifiedBy` and `verifiedAt` recorded |
| EKYC-007 | Member eKYC status sync | Member.ekycStatus and Member.ekycRiskLevel updated on verification decision |
| EKYC-008 | Admin-only access | eKYC module requires Admin role or above |

### 6.11 Module 11: Documents

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| DOC-001 | Document upload | Title, category, file upload, tags. Auto-extract: fileName, fileSize, mimeType |
| DOC-002 | 5 Document categories | Member, Case, Programme, Compliance, General |
| DOC-003 | Document versioning | Increment version on re-upload. Track version history |
| DOC-004 | Entity linking | Link to member, case, or programme via foreign keys |
| DOC-005 | Tag-based search | Comma-separated tags with filter/search capability |
| DOC-006 | Document listing | Filter by category, entity, tags. Sort by date, name |

### 6.12 Module 12: Activities

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| ACT-001 | Automatic activity logging | All CRUD operations auto-logged with: type, category, title, description, entityType, entityId, metadata, userId |
| ACT-002 | 9 Activity categories | Member, Case, Donation, Disbursement, Programme, Volunteer, Compliance, System, AI |
| ACT-003 | Activity types | `*_created`, `*_updated`, `*_deleted`, `*_approved`, `*_verified`, `login`, `ai_query` etc. |
| ACT-004 | Activity feed | Chronological, filterable by category, type, user, date range |
| ACT-005 | Programme-linked activities | Activities linked to programmes via `programmeId` for programme-specific audit trails |

### 6.13 Module 13: Reports

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| RPT-001 | Operational reports | Member registration, case pipeline, volunteer hours, programme participation |
| RPT-002 | Financial reports | Donation inflow by category, disbursement outflow, programme budget vs. spent |
| RPT-003 | Compliance reports | Compliance status summary, overdue items, audit trail |
| RPT-004 | Programme reports | Beneficiary outcomes, programme utilisation, impact metrics |
| RPT-005 | Export formats | CSV download, on-screen preview. Future: PDF generation |
| RPT-006 | Date range filtering | All reports filterable by custom date range |
| RPT-007 | Admin-only access | Reports module requires Admin role or above |

### 6.14 Module 14: AI — Maria Puspa

> Detailed in [Section 8: AI Assistant Requirements](#8-ai-assistant-requirements-maria-puspa)

### 6.15 Module 15: Admin

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| ADM-001 | User management | CRUD for User records: email, name, role, avatar, active status |
| ADM-002 | Role assignment | Assign Staff, Admin, or Developer roles. Changes take effect immediately |
| ADM-003 | System health monitor | Database connectivity, AI service status, tool count, recent error rates |
| ADM-004 | Ops work items | Internal task/bug/improvement tracking with approval workflow (Developer+ only) |
| ADM-005 | Automation jobs | Scheduled, event-triggered, or manual automation with cron expressions (Developer+ only) |

### 6.16 Module 16: Settings

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| SET-001 | Organisation settings | Organisation name, registration number (PPM-024-10-05012022), address, contact |
| SET-002 | AI configuration | OpenRouter API keys (1–4), model selection, temperature, max tokens |
| SET-003 | Theme preferences | Light/Dark/System theme toggle. Persisted via next-themes |
| SET-004 | Notification preferences | Toggle in-app notifications by type (future) |

### 6.17 Module 17: TapSecure

| Req ID | Requirement | Acceptance Criteria |
|---|---|---|
| TS-001 | Security dashboard | Overview of active sessions, recent login attempts, PII access events |
| TS-002 | Session management | View and terminate active user sessions |
| TS-003 | Access audit trail | Filterable log of all data access events, especially PII-related |
| TS-004 | Admin-only access | TapSecure module requires Admin role or above |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-P001 | Initial page load (Time to Interactive) | < 3 seconds on 4G connection |
| NFR-P002 | Dashboard data load | < 1 second from client cache, < 2 seconds fresh |
| NFR-P003 | AI response first token (TTFT) | < 2 seconds via OpenRouter streaming |
| NFR-P004 | Database query response | < 500ms for standard CRUD, < 2 seconds for aggregation queries |
| NFR-P005 | Concurrent users | Support 50 concurrent users on Vercel serverless |
| NFR-P006 | AI streaming throughput | SSE chunks delivered at < 100ms intervals |
| NFR-P007 | API key rotation failover | < 1 second automatic key rotation on 429/5xx errors |

### 7.2 Security

| ID | Requirement | Target |
|---|---|---|
| NFR-S001 | PII masking at data layer | IC numbers never exposed in API responses, always `****XXXX` |
| NFR-S002 | RBAC enforcement | All API routes validate user role before data access |
| NFR-S003 | AI tool RBAC | Tool execution validated against user role at runtime |
| NFR-S004 | Input validation | All inputs validated with Zod schemas; no raw SQL |
| NFR-S005 | HTTPS enforcement | All production traffic over TLS |
| NFR-S006 | Session security | HttpOnly cookies, CSRF protection via NextAuth |
| NFR-S007 | API key protection | OpenRouter keys stored server-side only, never exposed to client |
| NFR-S008 | Telegram allowlist | Chat ID-based access control for bot interactions |

### 7.3 Accessibility

| ID | Requirement | Target |
|---|---|---|
| NFR-A001 | WCAG 2.1 Level AA | Target compliance for all public-facing interfaces |
| NFR-A002 | Keyboard navigation | All interactive elements accessible via keyboard |
| NFR-A003 | Screen reader support | Proper ARIA labels, semantic HTML, live regions for AI chat |
| NFR-A004 | Colour contrast | Minimum 4.5:1 contrast ratio for text elements |
| NFR-A005 | Responsive design | Fully functional on 320px–2560px viewports |

### 7.4 Internationalisation (i18n)

| ID | Requirement | Target |
|---|---|---|
| NFR-I001 | Primary language | Bahasa Melayu (ms-MY) for UI labels, error messages, AI responses |
| NFR-I002 | Secondary language | English (en) as fallback |
| NFR-I003 | Bilingual AI | Maria Puspa responds in the language of the query (BM primary) |
| NFR-I004 | Date/number formatting | MYR currency formatting, Malaysian date format (DD/MM/YYYY) |
| NFR-I005 | RTL readiness | Architecture supports future RTL language addition |
| NFR-I006 | i18n framework | next-intl integrated for future full translation support |

### 7.5 Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-R001 | Uptime target | 99.5% (excluding planned maintenance) |
| NFR-R002 | Graceful degradation | App functional with DB unavailable (fallback data in AI tools) |
| NFR-R003 | Error recovery | AI tool failures return structured error messages, not crashes |
| NFR-R004 | Data durability | SQLite WAL mode; daily backups; PostgreSQL migration path ready |
| NFR-R005 | Telegram bot resilience | Auto-restart on 10+ consecutive poll errors; skip stale messages on startup |

### 7.6 Maintainability

| ID | Requirement | Target |
|---|---|---|
| NFR-M001 | TypeScript strict mode | All code in TypeScript 5 with strict type checking |
| NFR-M002 | Component architecture | shadcn/ui component library; no custom primitives where shadcn component exists |
| NFR-M003 | Database migrations | Prisma migrate for schema changes; zero-downtime migration strategy |
| NFR-M004 | API versioning | All API routes under `/api/v1/` prefix |
| NFR-M005 | Code documentation | JSDoc on all exported functions; inline comments for complex logic |
| NFR-M006 | Linting | ESLint with Next.js config enforced |

---

## 8. AI Assistant Requirements — Maria Puspa

### 8.1 Identity & Personality

| Attribute | Value |
|---|---|
| Name | Maria Puspa |
| Role | AI Assistant & Project Operator for PUSPA |
| Architecture Inspiration | Hermes Agent |
| Personality Traits | Cerdas (Intelligent), Mesra (Warm), Profesional, Empati (Empathetic), Boleh Dipercayai (Trustworthy) |
| Communication Style | Jelas (Clear), Ringkas (Concise), Sopan (Polite), Berorientasikan Penyelesaian (Solution-Oriented) |
| Primary Language | Bahasa Melayu |
| Secondary Language | English |
| Availability | 24/7 |

### 8.2 Mandatory RAG (Retrieval-Augmented Generation) Rules

These rules are **non-negotiable** and enforced via the system prompt:

| Rule ID | Rule | Enforcement |
|---|---|---|
| RAG-001 | Must use tools to retrieve real data before answering ANY operational question | System prompt; tool_choice: auto |
| RAG-002 | Never fabricate or assume data | System prompt; "If tools return empty, state 'Tiada data ditemui'" |
| RAG-003 | If no internal tool matches, use `web_search` then `web_read` | System prompt; tool priority ordering |
| RAG-004 | Always cite the tool or source used | System prompt; e.g., "Berdasarkan data derma terkini..." |
| RAG-005 | Format numerical data with RM/MYR currency | System prompt; currency formatting rule |
| RAG-006 | If tools return empty results, state: "Tiada data ditemui untuk pertanyaan ini" | System prompt; explicit empty state rule |

### 8.3 Response Format

| Rule ID | Rule | Enforcement |
|---|---|---|
| RESP-001 | Maximum 2–3 sentences per response (unless listing data) | System prompt hard rule |
| RESP-002 | Use bullet points for lists, tables for structured data | System prompt formatting rule |
| RESP-003 | No filler words, no emojis, no excessive pleasantries | System prompt exclusion rule |
| RESP-004 | One clear answer per question — be direct | System prompt style rule |
| RESP-005 | When uncertain, ask for clarification — never guess | System prompt safety rule |
| RESP-006 | Start with the answer, then add context if needed | System prompt structure rule |
| RESP-007 | Never say "Saya harap ini membantu" or similar filler | System prompt exclusion rule |

### 8.4 Tool Registry — 18 Tools with RBAC

#### General Tools (Staff+)

| # | Tool Name | Description | Required Role |
|---|---|---|---|
| 1 | `ping_system` | Check system online status and database connectivity | staff, admin, developer |
| 2 | `get_recent_donations` | Fetch last N donations with amount, category, donor, date | staff, admin, developer |
| 3 | `get_donation_stats` | Monthly donation statistics with category breakdown | staff, admin, developer |
| 4 | `get_active_cases` | Active cases with status filter; masked member info | staff, admin, developer |
| 5 | `get_case_summary` | Detailed case info by ID with member details and notes | staff, admin, developer |
| 6 | `get_member_list` | Asnaf members with category filter; eKYC status | staff, admin, developer |
| 7 | `get_member_stats` | Member count, asnaf category breakdown, eKYC status | staff, admin, developer |
| 8 | `get_active_programmes` | Currently active programmes with dates and status | staff, admin, developer |
| 9 | `get_volunteer_stats` | Total, active, inactive volunteer counts | staff, admin, developer |
| 10 | `get_compliance_status` | Compliance overview: total, completed, pending, overdue by category | staff, admin, developer |
| 11 | `get_disbursement_summary` | Disbursement totals and breakdown by status | staff, admin, developer |
| 12 | `get_dashboard_overview` | Cross-module metrics: members, cases, donations, disbursements, programmes, volunteers, compliance | staff, admin, developer |
| 13 | `web_search` | Search the web for real-time information via z-ai-web-dev-sdk | staff, admin, developer |
| 14 | `web_read` | Extract content from a web page URL for RAG | staff, admin, developer |
| 15 | `delegate_task` | Delegate complex multi-step task to sub-agent | staff, admin, developer |
| 16 | `system_health` | Comprehensive system diagnostics: DB, AI service, tools, errors | staff, admin, developer |

#### Admin-Only Tools

| # | Tool Name | Description | Required Role |
|---|---|---|---|
| 17 | `approve_disbursement` | Approve a pending disbursement by ID | admin, developer |
| 18 | `delete_case` | Delete a case (requires reason for audit) | admin, developer |

### 8.5 PII Protection in AI

| Rule ID | Rule | Enforcement |
|---|---|---|
| PII-001 | Never reveal full IC numbers — always masked `****XXXX` | System prompt hard rule + data-layer masking |
| PII-002 | Never share sensitive personal data beyond query scope | System prompt; minimum necessary principle |
| PII-003 | If user lacks access, inform politely in BM | System prompt; "Maaf, anda tidak mempunyai akses..." |
| PII-004 | Log all privileged operations (approve, delete) | System prompt; audit trail requirement |

### 8.6 Knowledge Base Injection

The PUSPA Knowledge Base is injected into every Maria Puspa system prompt, containing:

- **Organisation Identity**: PPM-024-10-05012022, Kuala Lumpur/Selangor focus
- **Contact Information**: Address (2253, Jalan Permata 22, Taman Permata, 53300 Gombak), email, phone, donation account
- **Leadership**: Publicly observed 2023 committee members
- **Verified Partners**: PKB, S P Setia Foundation, Jaya Grocer, LZS, ASNB, AKPK, Free Food Society, Kloth Cares
- **Verified Programmes**: 7 third-party corroborated events from 2021–2023
- **Self-Reported Metrics**: Portfolio data from official website (clearly distinguished from verified data)
- **Transparency Assessment**: Current status of audited statements, annual reports, constitution availability
- **Key AI Rules**: Distinguish verified vs. self-reported data; leadership may have changed; website under construction; disambiguate from unrelated "PUSPA" entities

### 8.7 Conversation Management

| Feature | Implementation |
|---|---|
| Conversation history | Fetched from `AiConversation` / `AiMessage` models per user |
| Memory persistence | `AIMemory` model with `userId` + `createdAt` index |
| Context window | System prompt + PUSPA knowledge + conversation history + current message |
| Streaming | SSE (Server-Sent Events) via OpenRouter `stream: true` |
| Multi-turn | Full conversation history included in each API call |
| Tool execution | Multi-step: AI returns tool_calls → execute → return results → AI generates final response |

### 8.8 Model Configuration

| Parameter | Default | Configurable |
|---|---|---|
| Model | `openai/gpt-4o-mini` (via OpenRouter) | Yes (OPENROUTER_MODEL env var) |
| Temperature | 0.7 | No (hardcoded) |
| Max tokens | 2048 | No (hardcoded) |
| API keys | Up to 4 keys with round-robin rotation | Yes (OPENROUTER_API_KEY_1–4 env vars) |
| Tool choice | `auto` | No (always auto) |

---

## 9. RBAC & Security Requirements

### 9.1 Role Hierarchy

```
Level 3: Developer ─── Full system access + AI module + admin tools + automation
    ↑
Level 2: Admin ─── Compliance + Reports + eKYC + TapSecure + approve_disbursement + delete_case
    ↑
Level 1: Staff ─── Basic operational modules (Dashboard, Members, Cases, Donations, Donors, 
                     Disbursements, Programmes, Volunteers, Activities, Documents, Settings)
```

### 9.2 Module Access Matrix

| Module | Staff (L1) | Admin (L2) | Developer (L3) |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Members | ✅ | ✅ | ✅ |
| Cases | ✅ | ✅ | ✅ |
| Donations | ✅ | ✅ | ✅ |
| Donors | ✅ | ✅ | ✅ |
| Disbursements | ✅ | ✅ | ✅ |
| Programmes | ✅ | ✅ | ✅ |
| Volunteers | ✅ | ✅ | ✅ |
| Activities | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Compliance | ❌ | ✅ | ✅ |
| Reports | ❌ | ✅ | ✅ |
| eKYC | ❌ | ✅ | ✅ |
| TapSecure | ❌ | ✅ | ✅ |
| Admin | ❌ | ✅ | ✅ |
| AI (Maria Puspa) | ❌ | ❌ | ✅ |

### 9.3 AI Tool Access Matrix

| Tool | Staff (L1) | Admin (L2) | Developer (L3) |
|---|---|---|---|
| `ping_system` | ✅ | ✅ | ✅ |
| `get_recent_donations` | ✅ | ✅ | ✅ |
| `get_donation_stats` | ✅ | ✅ | ✅ |
| `get_active_cases` | ✅ | ✅ | ✅ |
| `get_case_summary` | ✅ | ✅ | ✅ |
| `get_member_list` | ✅ | ✅ | ✅ |
| `get_member_stats` | ✅ | ✅ | ✅ |
| `get_active_programmes` | ✅ | ✅ | ✅ |
| `get_volunteer_stats` | ✅ | ✅ | ✅ |
| `get_compliance_status` | ✅ | ✅ | ✅ |
| `get_disbursement_summary` | ✅ | ✅ | ✅ |
| `get_dashboard_overview` | ✅ | ✅ | ✅ |
| `web_search` | ✅ | ✅ | ✅ |
| `web_read` | ✅ | ✅ | ✅ |
| `delegate_task` | ✅ | ✅ | ✅ |
| `system_health` | ✅ | ✅ | ✅ |
| `approve_disbursement` | ❌ | ✅ | ✅ |
| `delete_case` | ❌ | ✅ | ✅ |

### 9.4 Security Enforcement Points

1. **Client-side**: Navigation and view rendering gated by `canAccessView()` from `access-control.ts`
2. **API route-level**: Every `/api/v1/*` route validates user role before processing
3. **AI tool-level**: `executeTool()` validates `requiredRole` against user role before execution
4. **Telegram bot-level**: Allowlist-based chat ID filtering + session role tracking
5. **Data-level**: PII masking applied before data reaches any presentation layer

---

## 10. Data & Privacy Requirements

### 10.1 PDPA Compliance (Personal Data Protection Act 2010)

| ID | Requirement | Implementation |
|---|---|---|
| PDPA-001 | Consent for data collection | Member registration includes consent checkbox; logged in Activity |
| PDPA-002 | Purpose limitation | Data used only for asnaf management, case processing, and disbursement |
| PDPA-003 | Data minimisation | Only collect data necessary for each module; no optional fields required |
| PDPA-004 | Data accuracy | Members can request data correction; changes logged in Activity |
| PDPA-005 | Data retention | Active data retained while member is active; deletion requests honoured |
| PDPA-006 | Data access rights | Members can request their data; Admin can export member records |
| PDPA-007 | Data breach notification | Security incidents logged and reported per PDPA requirements |
| PDPA-008 | Cross-border transfer | Data hosted in Malaysia-region clouds (Alibaba Cloud) or Vercel (US with disclosure) |

### 10.2 PII Protection Implementation

| Data Element | Storage | Display | AI Output | Export |
|---|---|---|---|---|
| IC Number | Full (encrypted at rest) | `****XXXX` | `****XXXX` | `****XXXX` |
| Phone | Full | Full (authorised) | Not disclosed | Full (admin) |
| Email | Full | Full (authorised) | Not disclosed | Full (admin) |
| Address | Full | Full (authorised) | Not disclosed | Full (admin) |
| Monthly Income | Full | Full (authorised) | Aggregated only | Full (admin) |
| eKYC Photos | URLs only | Admin+ only | Not disclosed | N/A |
| Face Match Score | Full | Admin+ only | Risk level only | Admin+ |

### 10.3 Database Schema — 21+ Models

```
User ──────────────────── activities, caseNotes, aiConversations
Member ────────────────── householdMembers, cases, disbursements, programmeEnrolments, documents, ekycRecords
HouseholdMember ───────── member (cascade)
Case ──────────────────── member, notes, disbursements, documents, programmes
CaseNote ──────────────── case (cascade), author
CaseProgramme ─────────── case (cascade), programme
Donor ─────────────────── donations
Donation ──────────────── donor (optional)
Disbursement ──────────── member, case (optional), programme (optional)
Programme ─────────────── beneficiaries, disbursements, cases, documents, activities
ProgrammeBeneficiary ──── programme (cascade), member
Volunteer ─────────────── activities, certificates
VolunteerActivity ─────── volunteer (cascade)
VolunteerCertificate ──── volunteer (cascade)
ComplianceRecord ──────── (standalone)
EKYCVerification ──────── member (cascade)
Document ──────────────── member (optional), case (optional), programme (optional)
Activity ──────────────── user (optional), programme (optional)
AIMemory ──────────────── (indexed: userId + createdAt)
AiConversation ────────── user, messages
AiMessage ─────────────── conversation (cascade)
OpsWorkItem ───────────── (standalone)
AutomationJob ─────────── (standalone)
```

### 10.4 Data Validation Rules

| Field | Validation | Error Message (BM) |
|---|---|---|
| IC Number | 12 digits, unique | "No. IC tidak sah atau sudah didaftar" |
| Email | RFC 5322 format | "Alamat emel tidak sah" |
| Phone | Malaysian format (+60 or 01X) | "No. telefon tidak sah" |
| Amount (RM) | Positive float, max 2 decimal places | "Jumlah tidak sah" |
| Asnaf Category | One of 8 enumerated values | "Kategori asnaf tidak sah" |
| Case Type | One of 6 enumerated values | "Jenis kes tidak sah" |
| Donation Category | One of 5 enumerated values | "Kategori derma tidak sah" |
| Date | ISO 8601 or DD/MM/YYYY | "Tarikh tidak sah" |

---

## 11. Integration Requirements

### 11.1 OpenRouter API (AI Backend)

| Parameter | Specification |
|---|---|
| Base URL | `https://openrouter.ai/api/v1` (configurable via `OPENROUTER_BASE_URL`) |
| Compatibility | OpenAI Chat Completions API (full compatibility) |
| Features Used | Chat completions, function calling (tools), SSE streaming |
| Authentication | Bearer token via `Authorization` header |
| Key Rotation | Up to 4 API keys (`OPENROUTER_API_KEY_1` through `OPENROUTER_API_KEY_4`), round-robin rotation on 429/5xx errors |
| Optional Headers | `HTTP-Referer` (app URL), `X-OpenRouter-Title` (app name) for rankings |
| Rate Limiting | Handled via key rotation; 429 triggers automatic key switch |
| Default Model | `openai/gpt-4o-mini` (configurable via `OPENROUTER_MODEL`) |
| Streaming | SSE with `stream: true`; chunks parsed for `content` type deltas |

### 11.2 Telegram Bot (@MariaPuspaBot)

| Parameter | Specification |
|---|---|
| Bot Username | @MariaPuspaBot |
| Mode | Long-polling (no webhook) |
| Polling Timeout | 30 seconds per `getUpdates` call |
| Access Control | Allowlist-based (comma-separated chat IDs via `ALLOWED_CHAT_IDS` env var). Open mode if no allowlist configured |
| Session Management | In-memory sessions per chat ID with: userId, firstName, lastName, username, role, lastActivity, messageCount |
| Commands | `/start` (welcome), `/help` (command list), `/reset` (clear conversation), `/role [staff\|admin\|developer]` (switch access role), `/status` (session info) |
| Message Chunking | Auto-split messages > 4000 chars at paragraph/sentence boundaries |
| Typing Indicator | Sent every 4 seconds while awaiting AI response |
| Error Recovery | Skip stale messages on startup; auto-restart after 10+ consecutive poll errors |
| Health Check | 5-minute interval uptime/session logging |
| Markdown Support | Markdown parse mode with plaintext fallback on parse errors |

### 11.3 z-ai-web-dev-sdk (Web Tools Backend)

| Tool | SDK Function | Usage |
|---|---|---|
| `web_search` | `zai.functions.invoke('web_search', { query })` | Returns titles, URLs, snippets |
| `web_read` | `zai.functions.invoke('page_reader', { url })` | Returns title, HTML, published time |

### 11.4 Database — SQLite → PostgreSQL Migration Path

| Parameter | SQLite (Current) | PostgreSQL (Target) |
|---|---|---|
| Provider | `prisma-client-js` | `prisma-client-js` |
| URL | `file:./dev.db` | `postgresql://user:pass@host:5432/puspa` |
| Features | All CRUD, aggregations, groupBy | Full feature set + JSON operators, array types |
| Migration | N/A | `prisma migrate deploy` with zero-downtime strategy |
| Backup | File copy | pg_dump with WAL archiving |
| Connection | Single file | Connection pooling via Prisma |

### 11.5 Deployment Targets

| Platform | Configuration |
|---|---|
| Vercel (Primary) | Serverless functions; SQLite in-memory fallback; OpenRouter server-side |
| Alibaba Cloud Function Compute (Secondary) | For Malaysia-region data residency; PostgreSQL with VPC |
| Caddy (Local Dev) | Reverse proxy with auto-TLS; bun runtime |

---

## 12. Success Metrics & KPIs

### 12.1 Operational Metrics

| KPI | Target | Measurement |
|---|---|---|
| Member registration rate | 50+ new members/month by Q3 2026 | Member.count delta per month |
| Case resolution time | < 30 days average from intake to closed | Case.closedAt - Case.createdAt |
| Disbursement processing time | < 7 days from approval to disbursed | Disbursement.disbursedDate - approval date |
| eKYC verification rate | > 80% of active members verified by Q4 2026 | Member.ekycStatus = 'verified' / total active |
| Compliance score | > 90% items compliant by Q2 2026 | ComplianceRecord.compliant / total |

### 12.2 Platform Metrics

| KPI | Target | Measurement |
|---|---|---|
| Daily active users (DAU) | 10+ staff daily by Q3 2026 | Unique session count |
| AI query volume | 100+ queries/week by Q4 2026 | AiMessage.count where role='user' |
| AI accuracy (tool-based responses) | > 95% of operational queries answered with tool data | Manual audit sample |
| Telegram bot engagement | 5+ unique users/week | Session count |
| Page load performance | < 3s TTI on 4G | Lighthouse / Vercel Analytics |
| API error rate | < 1% of requests | 5xx response rate |

### 12.3 Financial Metrics

| KPI | Target | Measurement |
|---|---|---|
| Monthly donation tracking | 100% of donations recorded in system | Donation.count vs. bank statements |
| Donation receipt issuance | > 90% of donations have receipts | Donation.receiptIssued = true |
| Shariah compliance rate | > 99% of donations flagged compliant | Donation.shariahCompliant = true |
| Budget vs. spent accuracy | < 5% variance | Programme.budget vs. Programme.spent |

### 12.4 AI-Specific Metrics

| KPI | Target | Measurement |
|---|---|---|
| Tool utilisation rate | > 90% of operational queries trigger tool call | AiMessage.toolCalls non-null ratio |
| Hallucination rate | < 2% of factual claims unverified | Manual audit of AI responses |
| Key rotation events | < 5 per day (indicates stable API usage) | rotateKey() call count |
| Stream completion rate | > 98% of streams complete without error | SSE completion vs. initiation |
| Average response length | 2–3 sentences (per RESP-001) | Token count analysis |

---

## 13. Release Roadmap

### Phase 1: Foundation (Q1 2026) — ✅ Complete

- [x] Next.js 16 App Router scaffolding with Turbopack
- [x] Prisma schema with 21+ models
- [x] SQLite database with seed data
- [x] shadcn/ui component library (New York style)
- [x] Core module pages: Dashboard, Members, Cases, Donations, Donors, Disbursements, Programmes, Volunteers, Compliance, eKYC, Documents, Activities, Reports, AI, Admin, Settings, TapSecure
- [x] API routes for all modules under `/api/v1/`
- [x] RBAC system with 3-tier role hierarchy
- [x] Zustand store with persist middleware

### Phase 2: AI & Intelligence (Q2 2026) — 🔄 In Progress

- [x] Maria Puspa AI runtime (Hermes-inspired architecture)
- [x] 18 tool definitions with RBAC filtering
- [x] OpenRouter integration with key rotation and SSE streaming
- [x] PUSPA Knowledge Base injection into system prompt
- [x] Mandatory RAG enforcement via system prompt
- [x] PII masking in AI outputs
- [x] Conversation memory (AiConversation, AiMessage, AIMemory models)
- [x] Web search and page reading via z-ai-web-dev-sdk
- [ ] **Next**: Full E2E tool execution pipeline (multi-step tool call → result → response)
- [ ] **Next**: AI chat UI polish (markdown rendering, code highlighting, tool result display)
- [ ] **Next**: Dashboard analytics with Recharts integration

### Phase 3: Integration & Compliance (Q3 2026) — 📋 Planned

- [ ] Telegram bot production deployment (@MariaPuspaBot)
- [ ] PDPA compliance checklist implementation
- [ ] eKYC verification workflow (OCR + face match)
- [ ] Receipt PDF generation
- [ ] Notification system (in-app + email)
- [ ] Report export (CSV + PDF)
- [ ] PostgreSQL migration guide and testing

### Phase 4: Scale & Polish (Q4 2026) — 📋 Planned

- [ ] Alibaba Cloud Function Compute deployment
- [ ] Public donation page (Maybank integration)
- [ ] Volunteer self-service portal
- [ ] Automation jobs framework
- [ ] Advanced analytics and forecasting
- [ ] Mobile app (PWA or Capacitor)
- [ ] Multi-branch / chapter support

---

## 14. Open Issues & Risks

### 14.1 Technical Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | SQLite concurrency limits under multi-user load | High — data loss or locks | Medium | PostgreSQL migration planned; WAL mode enabled; connection pooling |
| RISK-002 | OpenRouter API rate limiting or downtime | Medium — AI unavailable | Medium | 4-key rotation; graceful fallback messages; `ping_system` health check |
| RISK-003 | AI hallucination in operational responses | High — incorrect decisions | Low | Mandatory RAG rules; PII masking; 2–3 sentence limit; tool-citation requirement |
| RISK-004 | Telegram bot token exposure | High — unauthorised access | Low | Environment variable only; allowlist enforcement; session role limits |
| RISK-005 | PII exposure via API response leakage | High — PDPA violation | Low | Data-layer masking; API response filtering; audit logging |
| RISK-006 | OpenRouter model deprecation | Medium — feature breakage | Low | Configurable model; OpenAI-compatible standard; fallback model chain |
| RISK-007 | Vercel serverless cold starts for AI | Medium — slow first response | Medium | Keep-warm pings; streaming for perceived performance |

### 14.2 Operational Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-008 | Staff resistance to digital platform adoption | High — low utilisation | Medium | BM-first interface; training sessions; Telegram bot for familiar channel |
| RISK-009 | Data migration from existing spreadsheets | Medium — data integrity issues | High | Migration scripts with validation; staged rollout; parallel operation period |
| RISK-010 | eKYC vendor integration complexity | Medium — delayed eKYC launch | Medium | Start with manual verification; add OCR/face match in Phase 3 |
| RISK-011 | PUSPA organisational changes (leadership, focus areas) | Low — knowledge base drift | Medium | Knowledge base versioned; leadership data noted as "2023 observed"; annual review cycle |
| RISK-012 | Insufficient OpenRouter API budget | Medium — AI feature degradation | Low | Cost monitoring; key rotation for rate distribution; `gpt-4o-mini` as cost-efficient default |

### 14.3 Open Issues

| ID | Issue | Status | Owner | Target Resolution |
|---|---|---|---|---|
| OI-001 | `approve_disbursement` and `delete_case` tools are simulated (not persisted to DB) | Open | Engineering | Phase 3 — implement real DB mutations with audit trail |
| OI-002 | `delegate_task` tool returns simulated delegation response | Open | Engineering | Phase 4 — implement sub-agent spawning with result callback |
| OI-003 | No authentication system (NextAuth configured but not enforced on routes) | Open | Engineering | Phase 3 — enforce auth on all `/api/v1/*` routes |
| OI-004 | AI module page requires Developer role — may be too restrictive for Admin users who want chat access | Under Discussion | Product | Consider splitting AI chat (Admin+) from AI config (Developer+) |
| OI-005 | Programme `type` field referenced in tools but not in Prisma schema | Open | Engineering | Add `type` field to Programme model or update tool queries |
| OI-006 | No automated testing framework configured | Open | Engineering | Phase 2 — add Vitest for unit tests, Playwright for E2E |
| OI-007 | Audit trail for compliance status changes not tracked | Open | Engineering | Phase 3 — add ComplianceRecordChange model |
| OI-008 | No data export/backup automation | Open | Operations | Phase 3 — daily SQLite backup; PostgreSQL pg_dump cron |
| OI-009 | Self-reported PUSPA metrics in knowledge base may be outdated | Acknowledged | Product | Annual review; clear labelling in AI responses |
| OI-010 | No rate limiting on AI API endpoints | Open | Engineering | Phase 3 — implement per-user rate limiting on `/api/v1/ai` |

---

## Appendix A: Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Full-stack React framework with SSR/SSG |
| Build | Turbopack | Latest | Fast development bundler |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| UI Components | shadcn/ui (New York) | Latest | Accessible component library |
| Database ORM | Prisma | 6.x | Type-safe database access |
| Database | SQLite | 3.x | Development database |
| State Management | Zustand | 5.x | Client-side state with persistence |
| AI Backend | OpenRouter | API v1 | LLM proxy with key rotation |
| Web SDK | z-ai-web-dev-sdk | 0.0.17+ | Web search and page reading |
| Validation | Zod | 4.x | Schema validation |
| Forms | React Hook Form | 7.x | Form state management |
| Charts | Recharts | 2.x | Data visualisation |
| Tables | TanStack Table | 8.x | Advanced data tables |
| Auth | NextAuth | 4.x | Authentication framework |
| i18n | next-intl | 4.x | Internationalisation |
| Animation | Framer Motion | 12.x | UI animations |
| Runtime | Bun | Latest | JavaScript runtime |
| Deployment | Vercel | — | Serverless deployment |
| Deployment | Alibaba Cloud FC | — | Malaysia-region deployment |
| Telegram | Bot API | — | Long-polling bot |

## Appendix B: Asnaf Category Definitions

| Category | Arabic | Description (BM) |
|---|---|---|
| Fakir | فقير | Mereka yang tidak mempunyai harta dan tidak berupaya untuk memenuhi keperluan asas |
| Miskin | مسكين | Mereka yang mempunyai pendapatan tetapi tidak mencukupi untuk keperluan asas |
| Amil | عامل | Mereka yang dilantik untuk mengurus dan mengedarkan zakat |
| Muallaf | مؤلفة | Mereka yang baru memeluk Islam atau yang hatinya perlu didekati |
| Gharimin | غارم | Mereka yang berhutang untuk keperluan yang dibenarkan syarak |
| Riqab | رقاب | Mereka yang ingin memerdekakan diri dari perhambaan |
| Ibnu Sabil | ابن السبيل | Musafir yang kehabisan bekal dalam perjalanan yang dibenarkan |
| Fisabilillah | في سبيل الله | Mereka yang berjuang di jalan Allah (termasuk pendidikan, dakwah, kebajikan) |

## Appendix C: PUSPA Verified Programme History

| Date | Programme | Partner | Details |
|---|---|---|---|
| 9 Sep 2021 | Food-pack distribution | Jaya Grocer | 100 food packs, Hulu Klang asnaf families |
| 30 Apr 2022 | Annual zakat handover | — | Masjid Lama Al Hidayah, Taman Melawati |
| 20 Feb–2 Mar 2023 | Sincerely, Setia Tuition Mission | S P Setia Foundation | English, BM, Maths for asnaf children, Dewan Serbaguna MPAJ |
| 14 Apr 2023 | Financial Literacy Programme | LZS, ASNB, AKPK, PKB | 80 asnaf individuals, RM300/pax zakat, 20 volunteers |
| 15 Apr 2023 | Ramadan Mubarak with Asnaf | — | 162 beneficiaries, Masjid Al Hidayah, Taman Melawati |
| 27 Apr 2023 | Curtain distribution (The Star coverage) | PKB | 160+ adults & children, 122 curtain sets |
| 17 Dec 2023 | First AGM | — | PUSPA inaugural annual general meeting |

---

*End of Document — PUSPA V5 PRD v5.0*
