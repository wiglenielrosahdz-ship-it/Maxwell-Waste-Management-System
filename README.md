# Maxwell Waste Tracker

> AI-powered food waste tracking and reduction system for dining facilities

## 🚧 Project Status: Specification Phase

This repository contains comprehensive specifications for Maxwell Waste Tracker. The actual implementation is designed to be built by following the specs in order.

## 📋 What's Here

This repository contains:

- **Product Requirements** (`.kiro/steering/`)
  - Product vision and features
  - Technical stack and standards
  - Project structure conventions

- **Technical Specifications** (`.kiro/specs/`)
  1. `foundation.md` - Monorepo setup, database schema, Docker, seed data
  2. `auth-and-catalog.md` - Authentication (JWT) and catalog APIs
  3. `waste-and-production-logging.md` - Waste/production logging endpoints
  4. `analytics-and-insights.md` - Analytics engine with intelligent insights
  5. `manager-dashboard-ui.md` - Manager dashboard UI with charts
  6. `demo-readiness.md` - OpenAPI docs, demo script, one-command setup

## 🎯 The Problem

Dining facilities waste significant amounts of food daily but lack:
- Real-time visibility into waste patterns
- Data-driven insights for reduction
- Cross-station coordination for reuse
- Accountability and tracking

## 💡 The Solution

Maxwell Waste Tracker provides:
- **Waste Logging**: Staff log waste by item with automatic weight calculation
- **Analytics Dashboard**: Visualize patterns by station, time, and reason
- **Intelligent Insights**: AI-powered recommendations (overproduction detection, timing analysis)
- **Reuse Matching**: Suggests cross-station food redirection opportunities
- **Role-Based Access**: Staff, Manager, and Admin roles with appropriate permissions

## 🏗️ Architecture (Planned)

```
Frontend (React + Vite)  →  Backend API (Node + Express)  →  Database (PostgreSQL)
     ↓                            ↓                                ↓
 - Dashboard                - Authentication                 - Prisma ORM
 - Waste Logging           - Analytics Engine               - Stations, Items
 - Charts (Recharts)       - Insights Engine                - Waste/Production Logs
                           - Reuse Matcher                   - Users, Reuse Rules
```

**Deployment Target**: AWS (S3/CloudFront, ECS/Lambda, RDS)

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- TanStack Query (data fetching)
- Recharts (charts)

### Backend
- Node 20 + TypeScript
- Express (API framework)
- Prisma (ORM)
- PostgreSQL (database)
- Zod (validation)
- bcrypt + JWT (authentication)

### Testing
- Vitest (unit/integration)
- Supertest (API testing)

### DevOps
- Docker (local PostgreSQL)
- Docker Compose

## 🚀 Implementation Workflow

To build this project, follow the specs in order:

### Step 1: Foundation
**Spec**: `.kiro/specs/foundation.md`

**What to build**:
- Monorepo structure (`/frontend`, `/backend`, `/docs`)
- TypeScript configuration
- ESLint + Prettier
- Docker Compose with PostgreSQL
- Prisma schema (6 models)
- Seed script with test data
- Health endpoint

**Prompt suggestion**:
```
Implement the foundation spec at .kiro/specs/foundation.md. 
Create the monorepo structure, database schema, Docker setup, 
and seed script as specified. Follow all requirements in EARS format.
```

### Step 2: Authentication & Catalog APIs
**Spec**: `.kiro/specs/auth-and-catalog.md`

**What to build**:
- Name + PIN login with bcrypt
- JWT in httpOnly cookies
- Auth and authorization middleware
- Station and item CRUD APIs
- Zod validation
- Supertest tests

**Prompt suggestion**:
```
Implement the auth and catalog spec at .kiro/specs/auth-and-catalog.md.
Build authentication with JWT, role-based access control, and catalog APIs.
Include all Supertest tests as specified.
```

### Step 3: Waste & Production Logging
**Spec**: `.kiro/specs/waste-and-production-logging.md`

**What to build**:
- POST/GET/DELETE endpoints for waste logs
- POST/GET/DELETE endpoints for production logs
- Automatic weight calculation
- Time-based delete permissions
- Pagination and filtering
- Tests for edge cases

**Prompt suggestion**:
```
Implement waste and production logging from .kiro/specs/waste-and-production-logging.md.
Build all logging endpoints with weight calculation, soft deletes, 
and comprehensive tests for permissions and validation.
```

### Step 4: Analytics & Insights
**Spec**: `.kiro/specs/analytics-and-insights.md`

**What to build**:
- 5 analytics endpoints (summary, by-station, by-hour, by-reason, top-items)
- Insights engine with 3 rules (overproduction, evening spike, dominant reason)
- Reuse matcher with weekly estimates
- Unit tests for each insight rule

**Prompt suggestion**:
```
Implement analytics and insights from .kiro/specs/analytics-and-insights.md.
Build all analytics endpoints, the insights engine with 3 detection rules,
and the reuse matcher. Include unit tests with fixtures for each rule.
```

### Step 5: Manager Dashboard UI
**Spec**: `.kiro/specs/manager-dashboard-ui.md`

**What to build**:
- Dashboard layout with filters
- 4 KPI cards
- 4 charts (bar, line, donut, table)
- Insights panel
- Reuse opportunity cards
- CSV export
- Full accessibility (WCAG AA)

**Prompt suggestion**:
```
Implement the manager dashboard from .kiro/specs/manager-dashboard-ui.md.
Build the React UI with filters, KPI cards, charts with Recharts,
insights panel, and reuse cards. Ensure full accessibility with
text alternatives for all charts.
```

### Step 6: Demo Readiness
**Spec**: `.kiro/specs/demo-readiness.md`

**What to build**:
- OpenAPI specification (all endpoints)
- Enhanced README with Mermaid diagram
- One-command setup (`npm run setup`)
- Demo seed script with narrative data
- `docs/DEMO.md` with step-by-step script

**Prompt suggestion**:
```
Implement demo readiness from .kiro/specs/demo-readiness.md.
Create the OpenAPI spec, update README with architecture diagram,
implement one-command setup, create narrative demo seed data
(Pizza overproduction, Chicken reuse opportunity), and write
the demo script in docs/DEMO.md.
```

## 📊 Key Features (When Built)

### For Staff
- Log waste with quantity (auto-converts to pounds)
- Select reason and disposition
- View their station's history
- Delete own entries within 10 minutes

### For Managers
- Dashboard with KPIs and charts
- Waste rate analysis (waste ÷ production)
- Intelligent insights with evidence
- Reuse opportunity recommendations
- Export data to CSV

### For Admins
- Full access to all features
- Manage stations and items
- User management
- System configuration

## 📈 Demo Narrative (Planned)

The demo seed will tell this story:
1. **Pizza & Pasta** over-produces Penne after 8 PM (35-40% waste)
2. **Chicken/Meat** wastes 15 lbs/week of grilled chicken
3. **Insight**: Chicken could be reused as pizza/pasta topping (~10.5 lbs/week savings)
4. **Simply 3** has temperature abuse issues (55% of waste)

## 🧪 Testing Strategy

- **Unit Tests**: Each insight rule, utilities, helpers
- **Integration Tests**: API endpoints with Supertest
- **Component Tests**: React components with Vitest
- **Accessibility Tests**: Keyboard navigation, screen readers, WCAG AA
- **Target Coverage**: 80-85%

## 📁 Project Structure (When Built)

```
maxwell-waste-tracker/
├── README.md
├── package.json                 # Root with workspaces
├── docker-compose.yml           # PostgreSQL
├── .kiro/
│   ├── steering/               # Product requirements
│   └── specs/                  # Technical specs
├── docs/
│   ├── DEMO.md                 # Demo script
│   ├── openapi.yaml            # API documentation
│   ├── CHARTER.md              # Development conventions
│   └── BLUEPRINT.md            # Data model docs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── middleware/
    │   └── validation/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seeds/
    └── package.json
```

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack TypeScript development
- RESTful API design with OpenAPI
- Role-based access control (RBAC)
- Data analytics and visualization
- Rule-based insight generation
- Accessibility-first UI design
- Comprehensive testing strategy
- Docker containerization
- Database design with Prisma

## 📝 Requirements Format

All specs use **EARS (Easy Approach to Requirements Syntax)**:
- "THE SYSTEM SHALL..." - Mandatory requirements
- "WHEN...THE SYSTEM SHALL..." - Conditional requirements
- "WHERE...THE SYSTEM SHALL..." - Context-specific requirements
- Each requirement has a unique ID (R1, R2, etc.)

## 🤝 Contributing

To implement this project:
1. Clone this repository
2. Follow the specs in order (1-6)
3. Use the prompt suggestions above
4. Verify against success criteria in each spec
5. Run tests to validate implementation

## 📄 License

MIT

## 🙋 Questions?

Each spec includes:
- Success criteria
- Out of scope items
- Implementation notes
- Testing requirements
- API contracts

Start with `foundation.md` and work through them sequentially!

---

**Note**: This is a specification repository. Actual code will be generated by following these specs.
