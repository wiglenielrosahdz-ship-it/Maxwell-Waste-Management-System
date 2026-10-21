# After Upload - Implementation Prompt

Once you've uploaded the specs to GitHub, use these prompts to start implementation.

## Your Repository
https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System

---

## Prompt 1: Full Implementation (All 6 Specs)

```
I have a comprehensive specification repository for Maxwell Waste Tracker at:
https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System

This repository contains 6 technical specifications with 166 EARS-format 
requirements for building a food waste tracking system.

Please implement all 6 specifications in order:

1. foundation.md - Monorepo, database schema, Docker, seed data
2. auth-and-catalog.md - Authentication (JWT + bcrypt) and catalog APIs
3. waste-and-production-logging.md - Logging endpoints with weight calculation
4. analytics-and-insights.md - Analytics endpoints and insights engine
5. manager-dashboard-ui.md - React dashboard with charts and accessibility
6. demo-readiness.md - OpenAPI docs, demo seed, one-command setup

Guidelines:
- Follow steering files in .kiro/steering/ for conventions
- Refer to .kiro/IMPLEMENTATION_GUIDE.md for detailed instructions
- Verify success criteria after each spec before proceeding
- Include all tests as specified (Vitest, Supertest)
- Follow strict TypeScript and Zod validation requirements

Start with foundation.md (R1-R19). Let me know when complete 
and verified, then we'll proceed to the next spec.
```

---

## Prompt 2: One Spec at a Time (Recommended)

### Step 1: Foundation
```
Clone this specification repository:
https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System

Read and implement .kiro/specs/foundation.md following all 
requirements R1-R19. This creates the monorepo structure, 
database schema with Prisma, Docker setup, and seed data.

Follow conventions in .kiro/steering/tech.md (strict TypeScript, 
Zod validation, no secrets in code).

Verify success criteria:
- docker-compose up starts PostgreSQL
- npm run db:migrate creates tables
- npm run db:seed populates data
- GET /health returns 200
- TypeScript compiles without errors

Create the implementation and let me know when ready for spec 2.
```

### Step 2: Auth & Catalog (After Foundation Complete)
```
Implement .kiro/specs/auth-and-catalog.md (R1-R26).

Build:
- Name + PIN login with bcrypt (4-digit PIN)
- JWT in httpOnly cookies
- Auth and authorization middleware
- Rate limiting on login (5 attempts per 15 min)
- Station and item CRUD APIs
- All Supertest tests

Verify:
- Can login as "Sarah Johnson" / PIN "2222"
- JWT cookie is set
- Role-based access works (staff restricted to station)
- All CRUD endpoints functional
- All tests pass (npm test)

Let me know when complete and tested.
```

### Step 3: Waste & Production (After Auth Complete)
```
Implement .kiro/specs/waste-and-production-logging.md (R1-R26).

Build:
- POST/GET/DELETE /api/waste
- POST/GET/DELETE /api/production
- Automatic weight calculation (quantity × lb_per_unit)
- Time-based delete permissions (creator within 10 min, managers anytime)
- Soft delete with deleted_at
- Pagination and filtering

Verify:
- Weight calculated correctly
- Staff can log for their station
- Delete permissions enforced
- All tests pass

Let me know when ready for analytics.
```

### Step 4: Analytics (After Logging Complete)
```
Implement .kiro/specs/analytics-and-insights.md (R1-R24).

Build:
- 5 analytics endpoints (summary, by-station, by-hour, by-reason, top-items)
- Insights engine with 3 rules:
  * Overproduction (>25% waste rate over 5 shifts)
  * Late evening spike (>40% after 8pm over 14 days)
  * Dominant reason (>50% single reason over 30 days)
- Reuse matcher with weekly estimates
- Unit tests with fixtures for each rule

Verify:
- All analytics return data
- Waste rates calculated (waste_lbs ÷ produced_lbs)
- Insights include evidence and explanations
- Reuse opportunities appear
- All rule unit tests pass

Let me know when ready for dashboard.
```

### Step 5: Dashboard UI (After Analytics Complete)
```
Implement .kiro/specs/manager-dashboard-ui.md (R1-R41).

Build:
- React dashboard at /dashboard (Manager/Admin only)
- Date range + station filters
- 4 KPI cards
- Charts: station bar, hourly line, reason donut, top items table
- Insights panel (priority-ranked)
- Reuse opportunity cards with food safety warning
- CSV export
- Full WCAG AA accessibility (keyboard nav, screen readers, text alternatives)

Verify:
- Dashboard loads < 2 seconds
- All charts render with Recharts
- Filters update all components
- CSV export works
- Keyboard navigation functional
- Text alternatives present for charts

Let me know when ready for demo setup.
```

### Step 6: Demo Readiness (After Dashboard Complete)
```
Implement .kiro/specs/demo-readiness.md (R1-R30).

Build:
- OpenAPI spec at docs/openapi.yaml (all endpoints)
- Enhanced README with Mermaid architecture diagram
- Root package.json with npm workspaces
- One-command setup: npm run setup
- Demo seed with narrative:
  * Pizza & Pasta: Penne overproduction after 8pm (35-40% waste rate)
  * Chicken/Meat: 15 lbs/week grilled chicken → Pizza reuse
  * Simply 3: Temperature abuse (55% of waste)
- Demo script at docs/DEMO.md (15-20 min walkthrough)

Verify:
- npm run setup completes in < 3 minutes
- npm run dev starts both servers
- Demo seed creates expected insights (3+)
- Reuse opportunity appears
- Can follow demo script end-to-end
- OpenAPI spec validates

Project complete! 🎉
```

---

## Prompt 3: For Testing Clone/Implementation

If you want to test pulling and implementing in a fresh environment:

```
I want to test the implementation workflow. Please:

1. Clone https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System
2. Read QUICKSTART.md
3. Review .kiro/IMPLEMENTATION_GUIDE.md
4. Examine .kiro/SPEC_SUMMARY.md for overview
5. Start implementing foundation.md

Report any issues with:
- Spec clarity
- Missing information
- Ambiguous requirements
- Conflicting guidance

This will validate that the specs are complete and implementable.
```

---

## Quick Copy-Paste (For Any AI)

**Shortest version:**
```
Implement this spec repository:
https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System

Follow .kiro/IMPLEMENTATION_GUIDE.md, implement specs 1-6 in order.
Start with foundation.md.
```

---

## After Complete Implementation

### Test the Result:
```bash
git clone https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System
cd Maxwell-Waste-Management-System
npm run setup    # Should complete in ~3 minutes
npm run dev      # Should start both servers

# Visit http://localhost:5173
# Login: Sarah Johnson / 2222
# Verify dashboard shows data
```

### Run Demo:
Follow `docs/DEMO.md` for 15-minute demo script

---

## Repository Link (For Sharing)

**GitHub**: https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System

**Clone**: 
```bash
git clone https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System.git
```

**Share with**: "This repo has complete specs for a food waste tracking system. Follow the implementation guide to build it!"
