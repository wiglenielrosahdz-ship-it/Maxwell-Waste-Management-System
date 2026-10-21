# Specification Summary

Quick reference for all specifications in this repository.

## Overview

This repository contains **6 technical specifications** for Maxwell Waste Tracker, totaling **147 requirements** in EARS format.

## Specifications at a Glance

| # | Spec | File | Requirements | Est. Time | Status |
|---|------|------|--------------|-----------|--------|
| 1 | Foundation | `foundation.md` | R1-R19 (19) | 30-45 min | Not started |
| 2 | Auth & Catalog | `auth-and-catalog.md` | R1-R26 (26) | 45-60 min | Not started |
| 3 | Waste & Production | `waste-and-production-logging.md` | R1-R26 (26) | 45-60 min | Not started |
| 4 | Analytics & Insights | `analytics-and-insights.md` | R1-R24 (24) | 60-90 min | Not started |
| 5 | Dashboard UI | `manager-dashboard-ui.md` | R1-R41 (41) | 90-120 min | Not started |
| 6 | Demo Readiness | `demo-readiness.md` | R1-R30 (30) | 45-60 min | Not started |

**Total**: 166 requirements, 6-9 hours estimated

## Spec 1: Foundation

**File**: `specs/foundation.md`  
**Dependencies**: None (start here!)  
**Requirements**: R1-R19

### What Gets Built
- Monorepo structure with npm workspaces
- TypeScript configs (strict mode)
- ESLint + Prettier
- Docker Compose (PostgreSQL)
- Prisma schema with 6 models:
  - stations
  - items
  - users
  - waste_logs
  - production_logs
  - reuse_rules
- Seed script with 4 stations, ~32 items, 6 users
- Backend health endpoint

### Success Criteria
- `docker-compose up` starts PostgreSQL
- `npm run db:migrate` creates all tables
- `npm run db:seed` populates data
- `GET /health` returns 200
- TypeScript compiles without errors

---

## Spec 2: Auth & Catalog

**File**: `specs/auth-and-catalog.md`  
**Dependencies**: Foundation (spec 1)  
**Requirements**: R1-R26

### What Gets Built
- Name + 4-digit PIN login
- bcrypt password hashing
- JWT in httpOnly cookies
- Authentication middleware
- Authorization middleware (role-based + station access)
- Rate limiting (5 attempts per 15 min)
- Public catalog APIs (stations, items)
- Admin CRUD APIs (stations, items)
- Zod validation schemas
- 40+ Supertest tests

### Key Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/stations
- GET /api/stations/:id/items
- POST/PATCH/DELETE /api/admin/stations/:id
- POST/PATCH/DELETE /api/admin/items/:id

### Success Criteria
- Users can login with name + PIN
- JWT stored in httpOnly cookie
- Staff restricted to their station
- Managers/admins access all stations
- All CRUD operations work
- All tests pass

---

## Spec 3: Waste & Production Logging

**File**: `specs/waste-and-production-logging.md`  
**Dependencies**: Auth & Catalog (spec 2)  
**Requirements**: R1-R26

### What Gets Built
- POST /api/waste (automatic weight calculation)
- GET /api/waste (pagination + filters)
- DELETE /api/waste (time-based permissions)
- Same pattern for /api/production
- Waste reason enum (8 values)
- Waste disposition enum (5 values)
- Soft delete with deleted_at
- Schema updates for enums and soft delete
- 30+ Supertest tests

### Key Features
- Weight = quantity × item.lb_per_unit
- Creator can delete within 10 minutes
- Managers can delete anytime
- Date range filtering (max 365 days)
- Pagination (default 50, max 100)
- Staff station access enforcement

### Success Criteria
- Weight calculated automatically
- Time-based delete works
- Pagination works correctly
- All validation tests pass
- All permission tests pass

---

## Spec 4: Analytics & Insights

**File**: `specs/analytics-and-insights.md`  
**Dependencies**: Waste & Production (spec 3)  
**Requirements**: R1-R24

### What Gets Built
- 5 analytics endpoints:
  - GET /api/analytics/waste/summary
  - GET /api/analytics/waste/by-station
  - GET /api/analytics/waste/by-hour
  - GET /api/analytics/waste/by-reason
  - GET /api/analytics/waste/top-items
- GET /api/insights
- Insights engine with 3 rules:
  - Overproduction (>25% waste rate)
  - Late evening spike (>40% after 8pm)
  - Dominant reason (>50% single reason)
- Reuse matcher (estimates weekly diversion)
- 20+ unit tests with fixtures

### Key Features
- Waste rate = waste_lbs ÷ produced_lbs
- Evidence-based insights with plain language
- Priority levels (high/medium/low)
- Reuse opportunities with 70% diversion estimate
- Time windows: 5 shifts, 14 days, 30 days

### Success Criteria
- All analytics return accurate data
- Waste rates calculated correctly
- Insights generated from patterns
- Reuse opportunities appear
- All rule unit tests pass

---

## Spec 5: Manager Dashboard UI

**File**: `specs/manager-dashboard-ui.md`  
**Dependencies**: Analytics & Insights (spec 4)  
**Requirements**: R1-R41

### What Gets Built
- React dashboard at /dashboard
- Date range + station filters
- 4 KPI cards (total waste, avg/shift, entries, stations)
- Station bar chart (Recharts)
- Hourly line chart
- Reason donut chart
- Top items table (with waste rates)
- Insights panel (priority-ranked)
- Reuse opportunity cards (with food safety warning)
- CSV export
- Chart text alternatives (accessibility)
- Responsive design
- Component tests

### Key Features
- WCAG AA accessibility
- Keyboard navigation
- Screen reader support
- URL query params (shareable links)
- TanStack Query (caching)
- Loading/error/empty states

### Success Criteria
- Dashboard loads < 2 seconds
- All charts render correctly
- Filters update all components
- CSV export works
- Full keyboard accessibility
- Text alternatives present
- 80%+ component test coverage

---

## Spec 6: Demo Readiness

**File**: `specs/demo-readiness.md`  
**Dependencies**: Dashboard UI (spec 5)  
**Requirements**: R1-R30

### What Gets Built
- OpenAPI spec (docs/openapi.yaml)
- Enhanced README with Mermaid diagram
- Root package.json with workspaces
- One-command setup (`npm run setup`)
- Demo seed with narrative:
  - Pizza & Pasta: Penne overproduction after 8pm
  - Chicken/Meat: 15 lbs/week reuse opportunity
  - Simply 3: Temperature abuse pattern
- Demo script (docs/DEMO.md, 15-20 min)
- Prerequisites check script
- Validation script

### Key Features
- One command setup (< 3 minutes)
- Compelling narrative in data
- 3+ insights appear
- Reuse opportunity visible
- Interactive API docs (Swagger/Redoc)

### Success Criteria
- `npm run setup` works
- `npm run dev` starts both servers
- Demo seed tells clear story
- Demo script is followable
- OpenAPI spec validates
- Architecture diagram renders

---

## Implementation Checklist

Use this to track progress:

- [ ] **Spec 1: Foundation**
  - [ ] Monorepo structure created
  - [ ] Database schema implemented
  - [ ] Docker setup working
  - [ ] Seed script functional
  - [ ] Health endpoint responds

- [ ] **Spec 2: Auth & Catalog**
  - [ ] Authentication working
  - [ ] JWT cookies set correctly
  - [ ] Role-based access enforced
  - [ ] Catalog APIs functional
  - [ ] Admin CRUD working
  - [ ] All tests passing

- [ ] **Spec 3: Waste & Production**
  - [ ] Waste logging working
  - [ ] Production logging working
  - [ ] Weight calculation correct
  - [ ] Delete permissions enforced
  - [ ] Pagination working
  - [ ] All tests passing

- [ ] **Spec 4: Analytics & Insights**
  - [ ] All analytics endpoints working
  - [ ] Insights engine generating insights
  - [ ] Reuse matcher working
  - [ ] Rule unit tests passing
  - [ ] Evidence is accurate

- [ ] **Spec 5: Dashboard UI**
  - [ ] Dashboard loads with data
  - [ ] All charts rendering
  - [ ] KPIs accurate
  - [ ] Insights panel working
  - [ ] Reuse cards showing
  - [ ] CSV export working
  - [ ] Accessibility verified

- [ ] **Spec 6: Demo Readiness**
  - [ ] OpenAPI spec complete
  - [ ] README updated
  - [ ] One-command setup works
  - [ ] Demo seed creates story
  - [ ] Demo script written
  - [ ] Can complete full demo

---

## Quick Reference

### Total Line Count
- Specs: ~3,500 lines of requirements
- Steering: ~400 lines of guidelines
- Total: ~3,900 lines of documentation

### Key Technologies
- **Frontend**: React, TypeScript, Vite, Tailwind, Recharts
- **Backend**: Node, Express, TypeScript, Prisma, PostgreSQL
- **Testing**: Vitest, Supertest
- **Auth**: bcrypt, JWT, httpOnly cookies
- **Validation**: Zod

### Architecture Layers
```
Frontend (React)
    ↓
Backend API (Express)
    ↓
Services (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

### Data Flow Example
```
Staff logs waste
    ↓
Weight calculated (qty × lb_per_unit)
    ↓
Stored in waste_logs table
    ↓
Analytics engine aggregates
    ↓
Insights engine detects patterns
    ↓
Dashboard displays recommendations
```

---

## Next Steps

1. **Read this summary** ✓
2. **Review IMPLEMENTATION_GUIDE.md** for detailed instructions
3. **Start with foundation.md**
4. **Follow specs in order**
5. **Verify success criteria** after each
6. **Track progress** with checklist above

Good luck! 🚀
