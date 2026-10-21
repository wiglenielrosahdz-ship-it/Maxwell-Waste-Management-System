# Implementation Guide

This guide explains how to use these specifications to build Maxwell Waste Tracker.

## Overview

This repository contains **specifications, not code**. The specs are designed to be implemented by AI coding assistants (like Kiro, Claude, Cursor, GitHub Copilot) or human developers.

## Why This Approach?

1. **Clear Requirements**: Every feature is documented before implementation
2. **AI-Friendly**: Specs are structured for LLM comprehension
3. **Testable**: Each spec includes acceptance criteria
4. **Incremental**: Build one piece at a time, verify, then move on
5. **Maintainable**: Future developers understand the "why" behind decisions

## Implementation Order

**IMPORTANT**: Follow specs in this exact order. Each builds on the previous.

### 1️⃣ Foundation (Required First)
**File**: `.kiro/specs/foundation.md`  
**Time Estimate**: 30-45 minutes  
**Verification**: `npm run setup` completes successfully

**What gets built**:
- Monorepo with npm workspaces
- TypeScript configs (strict mode)
- ESLint + Prettier
- Docker Compose (PostgreSQL)
- Prisma schema (6 models)
- Migration files
- Seed script with test data
- Backend health endpoint
- README with setup instructions

**Success criteria**:
- ✅ `docker-compose up` starts PostgreSQL
- ✅ `npm run db:migrate` creates tables
- ✅ `npm run db:seed` populates data
- ✅ `GET /health` returns 200
- ✅ TypeScript compiles without errors

### 2️⃣ Authentication & Catalog APIs
**File**: `.kiro/specs/auth-and-catalog.md`  
**Time Estimate**: 45-60 minutes  
**Verification**: All Supertest tests pass

**What gets built**:
- Name + PIN login (bcrypt hashing)
- JWT in httpOnly cookies
- Auth middleware (verify token)
- Authorization middleware (check roles)
- Rate limiting on login
- Station CRUD (public + admin)
- Item CRUD (admin only)
- Zod validation schemas
- Error handling middleware
- 40+ Supertest tests

**Success criteria**:
- ✅ Can login with name + PIN
- ✅ JWT cookie set correctly
- ✅ Role-based access works
- ✅ Staff restricted to their station
- ✅ All CRUD endpoints functional
- ✅ All tests pass

### 3️⃣ Waste & Production Logging
**File**: `.kiro/specs/waste-and-production-logging.md`  
**Time Estimate**: 45-60 minutes  
**Verification**: Tests pass + can log waste via API

**What gets built**:
- POST /api/waste (with weight calculation)
- GET /api/waste (with pagination + filters)
- DELETE /api/waste (time-based permissions)
- Same pattern for /api/production
- Waste reason/disposition enums
- Soft delete with deleted_at
- Station access control
- Query filtering (date range, station)
- 30+ Supertest tests

**Success criteria**:
- ✅ Weight calculated from quantity × lb_per_unit
- ✅ Staff can log for their station only
- ✅ Creator can delete within 10 minutes
- ✅ Managers can delete anytime
- ✅ Pagination works correctly
- ✅ All validation tests pass

### 4️⃣ Analytics & Insights
**File**: `.kiro/specs/analytics-and-insights.md`  
**Time Estimate**: 60-90 minutes  
**Verification**: Insights appear with demo data

**What gets built**:
- GET /api/analytics/waste/summary
- GET /api/analytics/waste/by-station
- GET /api/analytics/waste/by-hour
- GET /api/analytics/waste/by-reason
- GET /api/analytics/waste/top-items (with waste rates)
- GET /api/insights
- Insights engine with 3 rules:
  - Overproduction detection (>25% waste rate)
  - Late evening spike (>40% after 8pm)
  - Dominant reason (>50% single reason)
- Reuse matcher (from reuse_rules table)
- 20+ unit tests with fixtures

**Success criteria**:
- ✅ All analytics endpoints return data
- ✅ Waste rates calculated correctly
- ✅ Insights generated for demo data
- ✅ Reuse opportunities appear
- ✅ Evidence numbers are accurate
- ✅ All rule unit tests pass

### 5️⃣ Manager Dashboard UI
**File**: `.kiro/specs/manager-dashboard-ui.md`  
**Time Estimate**: 90-120 minutes  
**Verification**: Dashboard loads and displays data

**What gets built**:
- React dashboard at /dashboard
- Date range + station filters
- 4 KPI cards
- Station bar chart (Recharts)
- Hourly line chart
- Reason donut chart
- Top items table
- Insights panel with priority badges
- Reuse opportunity cards (with food safety note)
- CSV export functionality
- Chart text alternatives (accessibility)
- Responsive design
- Component tests

**Success criteria**:
- ✅ Dashboard loads with filters
- ✅ All charts render correctly
- ✅ KPIs show accurate numbers
- ✅ Insights panel shows ranked insights
- ✅ Reuse cards include food safety warning
- ✅ CSV export generates file
- ✅ Keyboard navigation works
- ✅ Text alternatives present

### 6️⃣ Demo Readiness
**File**: `.kiro/specs/demo-readiness.md`  
**Time Estimate**: 45-60 minutes  
**Verification**: Demo script works end-to-end

**What gets built**:
- OpenAPI spec (docs/openapi.yaml)
- Enhanced README with Mermaid diagram
- Root package.json with npm workspaces
- One-command setup script
- Demo seed with narrative data:
  - Pizza & Pasta overproduction story
  - Chicken → Pizza reuse opportunity
  - Temperature abuse at Simply 3
- Demo script (docs/DEMO.md)
- Prerequisites check script
- Validation script

**Success criteria**:
- ✅ `npm run setup` works in one command
- ✅ Demo seed tells clear story
- ✅ 3+ insights appear
- ✅ Reuse opportunity visible
- ✅ Demo script completable
- ✅ OpenAPI spec validates

## How to Use with AI Assistants

### Option A: One Spec at a Time
```
Prompt: "Implement .kiro/specs/foundation.md. Follow all 
requirements in EARS format (R1-R19). Create the monorepo 
structure, Prisma schema, Docker setup, and seed script."

[Wait for completion, verify]

Prompt: "Now implement .kiro/specs/auth-and-catalog.md. 
Build authentication with JWT cookies, catalog APIs, and 
all Supertest tests."

[Continue through specs 3-6]
```

### Option B: Specify Multiple Specs
```
Prompt: "Implement specs 1-3 in order:
1. foundation.md - monorepo and database
2. auth-and-catalog.md - authentication APIs
3. waste-and-production-logging.md - logging endpoints

Follow all requirements and success criteria."
```

### Option C: Point to Entire Repository
```
Prompt: "This repository contains 6 specifications in .kiro/specs/. 
Implement them in order (foundation → auth → logging → analytics 
→ dashboard → demo). Follow the steering guidelines in .kiro/steering/ 
for tech stack and conventions."
```

## Verification Strategy

After each spec implementation:

1. **Run tests**: `npm test`
2. **Check linting**: `npm run lint`
3. **Try manually**: Use curl or Postman to test endpoints
4. **Review success criteria**: Check each ✅ in the spec
5. **Git commit**: `git commit -m "feat: implement [spec name]"`

## Common Pitfalls

### ❌ Don't Skip Foundation
Foundation creates the entire project structure. Without it, later specs have nowhere to go.

### ❌ Don't Implement Out of Order
Specs reference each other. Auth (spec 2) needs the database from foundation (spec 1). Analytics (spec 4) needs logging endpoints (spec 3).

### ❌ Don't Ignore Success Criteria
Each spec lists what "done" looks like. If criteria aren't met, debugging later specs will be harder.

### ❌ Don't Skip Tests
Tests verify correctness and catch regressions. They're part of the deliverable.

## Steering Guidelines

Located in `.kiro/steering/`, these apply to ALL implementation:

### product.md
- Product vision and features
- User roles and permissions
- Data standards (all waste in pounds)

### tech.md
- TypeScript strict mode required
- Zod validation on all inputs
- No secrets in code
- Conventional commits
- Specific package versions

### structure.md
- Monorepo organization
- File naming conventions
- Import patterns
- Component structure

**IMPORTANT**: Follow steering guidelines even if not explicitly mentioned in a spec.

## Troubleshooting

### "Spec is ambiguous"
- Check the spec's "Implementation Notes" section
- Review related specs for context
- Consult steering guidelines
- Make a reasonable decision and document it

### "Spec conflicts with steering"
- Steering guidelines take precedence
- If still unclear, prefer the more recent or more specific guidance

### "Missing a detail"
- Check the spec's "Out of Scope" section
- Review similar requirements in the same spec
- Use industry best practices
- Document your decision

### "Test is failing"
- Read the test requirement carefully (R22-R26 sections)
- Check for edge cases in the spec
- Verify test data setup is correct
- Ensure previous specs fully implemented

## Getting Help

If you get stuck:
1. Re-read the specific requirement (R#) that's unclear
2. Check the spec's "Implementation Notes"
3. Look at the "Success Criteria" to understand the goal
4. Review the API summary or schema definitions
5. Check if there's a code example in the spec

## Project Philosophy

This project follows these principles:

1. **Specification-Driven**: Requirements before code
2. **Test-Driven**: Tests validate requirements
3. **Security-First**: Auth, validation, and safe defaults
4. **Accessibility-First**: WCAG AA compliance
5. **API-First**: Backend contract before frontend
6. **Evidence-Based**: All insights backed by data

## Final Checklist

Before considering the project "complete":

- [ ] All 6 specs implemented in order
- [ ] All tests passing (backend + frontend)
- [ ] `npm run setup` works from clean state
- [ ] `npm run dev` starts both servers
- [ ] Demo seed creates expected insights
- [ ] Dashboard displays charts correctly
- [ ] CSV export works
- [ ] OpenAPI spec validates
- [ ] Demo script can be followed
- [ ] README is accurate
- [ ] No TypeScript errors
- [ ] No linting errors

## Time Estimates

**Total estimated time**: 6-9 hours for full implementation

Breakdown:
- Foundation: 30-45 min
- Auth & APIs: 45-60 min
- Logging: 45-60 min
- Analytics: 60-90 min
- Dashboard: 90-120 min
- Demo: 45-60 min

These are estimates for AI-assisted development. Manual implementation may take 2-3x longer.

## Next Steps

1. **Upload specs to GitHub**
2. **Clone repository** wherever you want to implement
3. **Start with foundation.md**
4. **Follow the prompts** in this guide
5. **Verify after each spec**
6. **Commit incrementally**

Good luck! 🚀
