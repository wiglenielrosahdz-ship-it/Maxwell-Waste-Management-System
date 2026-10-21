# Spec: Project Foundation

## Overview
Establish the foundational infrastructure for Maxwell Waste Tracker, including monorepo scaffolding, development tooling, database setup, and seed data.

## Goals
1. Create a fully functional monorepo structure with frontend and backend workspaces
2. Configure TypeScript, linting, and formatting across the project
3. Provide local development environment with PostgreSQL via Docker
4. Define and implement the core database schema
5. Seed the database with realistic test data
6. Verify setup with a health check endpoint

---

## Requirements (EARS Format)

### R1: Monorepo Structure
**WHEN** the project is initialized, **THE SYSTEM SHALL** create a monorepo with the following structure:
- `/frontend` - React + Vite + TypeScript workspace
- `/backend` - Node + Express + TypeScript workspace
- `/docs` - Documentation directory with CHARTER.md and BLUEPRINT.md
- `/.kiro` - Kiro configuration (already exists with steering files)
- Root-level `package.json` with workspace configuration
- Root-level `.gitignore` covering node_modules, .env, build artifacts

### R2: TypeScript Configuration
**WHERE** TypeScript is used, **THE SYSTEM SHALL**:
- Enable strict mode in all `tsconfig.json` files
- Configure path aliases for cleaner imports (`@/` for src directory)
- Set target to ES2022 or later
- Enable `esModuleInterop`, `resolveJsonModule`, and `skipLibCheck`
- Use separate `tsconfig.json` for frontend and backend with appropriate settings

### R3: Code Quality Tools
**THE SYSTEM SHALL** configure ESLint and Prettier with:
- ESLint with TypeScript plugin and React plugin (frontend only)
- Prettier with Tailwind plugin for frontend
- Consistent configuration files at root level
- npm scripts for linting and formatting in each workspace
- Pre-commit hook recommendations in docs

### R4: Local Development Database
**THE SYSTEM SHALL** provide a `docker-compose.yml` file that:
- Runs PostgreSQL 15 or later
- Exposes port 5432
- Configures a database named `maxwell_waste_tracker`
- Sets up a non-root user with credentials
- Includes pgAdmin or Adminer for database management (optional)
- Persists data with a named volume

### R5: Prisma Schema - Stations Table
**THE SYSTEM SHALL** define a `stations` table with:
- `id` (UUID, primary key)
- `name` (string, unique, required) - e.g., "Pizza & Pasta"
- `code` (string, unique, required) - e.g., "PIZZA_PASTA"
- `description` (text, optional)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### R6: Prisma Schema - Items Table
**THE SYSTEM SHALL** define an `items` table with:
- `id` (UUID, primary key)
- `station_id` (UUID, foreign key to stations)
- `name` (string, required) - e.g., "Pepperoni Pizza"
- `category` (string, optional) - e.g., "Pizza", "Pasta", "Protein"
- `unit` (string, required) - e.g., "slice", "pan", "portion"
- `lb_per_unit` (decimal, required) - pounds per single unit
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### R7: Prisma Schema - Users Table
**THE SYSTEM SHALL** define a `users` table with:
- `id` (UUID, primary key)
- `email` (string, unique, required)
- `name` (string, required)
- `role` (enum: STAFF, MANAGER, ADMIN)
- `station_id` (UUID, nullable, foreign key to stations) - assigned station for staff
- `password_hash` (string, required)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### R8: Prisma Schema - Waste Logs Table
**THE SYSTEM SHALL** define a `waste_logs` table with:
- `id` (UUID, primary key)
- `station_id` (UUID, foreign key to stations)
- `item_id` (UUID, foreign key to items)
- `logged_by` (UUID, foreign key to users)
- `date` (date, required) - the evening date
- `quantity` (integer, required) - number of units wasted
- `weight_lbs` (decimal, required) - total weight in pounds (calculated: quantity × lb_per_unit)
- `reason` (text, optional) - why the waste occurred
- `notes` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Unique constraint on (station_id, item_id, date)

### R9: Prisma Schema - Production Logs Table
**THE SYSTEM SHALL** define a `production_logs` table with:
- `id` (UUID, primary key)
- `station_id` (UUID, foreign key to stations)
- `item_id` (UUID, foreign key to items)
- `logged_by` (UUID, foreign key to users)
- `date` (date, required)
- `quantity_produced` (integer, required)
- `weight_lbs` (decimal, required)
- `notes` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### R10: Prisma Schema - Reuse Rules Table
**THE SYSTEM SHALL** define a `reuse_rules` table with:
- `id` (UUID, primary key)
- `source_station_id` (UUID, foreign key to stations)
- `source_item_id` (UUID, foreign key to items)
- `target_station_id` (UUID, foreign key to stations)
- `target_use` (string, required) - suggested reuse at target station
- `confidence_score` (decimal, 0-1) - ML confidence or manual priority
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### R11: Database Seed - Stations
**THE SYSTEM SHALL** seed the database with four Maxwell dining stations:
1. Pizza & Pasta (code: PIZZA_PASTA)
2. Simply 3 (code: SIMPLY_3)
3. Cooked Vegetables (code: COOKED_VEG)
4. Chicken/Meat (code: CHICKEN_MEAT)

### R12: Database Seed - Items
**THE SYSTEM SHALL** seed approximately 8 items per station with realistic `lb_per_unit` values:

**Pizza & Pasta:**
- Pepperoni Pizza (slice, 0.35 lb)
- Cheese Pizza (slice, 0.33 lb)
- Veggie Pizza (slice, 0.37 lb)
- Spaghetti with Marinara (portion, 0.75 lb)
- Fettuccine Alfredo (portion, 0.85 lb)
- Penne Arrabbiata (portion, 0.70 lb)
- Garlic Bread (piece, 0.15 lb)
- Breadsticks (piece, 0.10 lb)

**Simply 3:**
- Grilled Chicken Breast (piece, 0.50 lb)
- Steamed Rice (portion, 0.40 lb)
- Mixed Vegetables (portion, 0.35 lb)
- Baked Salmon (piece, 0.55 lb)
- Quinoa Bowl (portion, 0.45 lb)
- Black Beans (portion, 0.38 lb)
- Corn on the Cob (piece, 0.25 lb)
- Side Salad (portion, 0.20 lb)

**Cooked Vegetables:**
- Roasted Carrots (portion, 0.30 lb)
- Steamed Broccoli (portion, 0.28 lb)
- Sautéed Green Beans (portion, 0.25 lb)
- Roasted Brussels Sprouts (portion, 0.32 lb)
- Glazed Carrots (portion, 0.30 lb)
- Corn Medley (portion, 0.27 lb)
- Roasted Cauliflower (portion, 0.29 lb)
- Mixed Vegetable Stir-Fry (portion, 0.35 lb)

**Chicken/Meat:**
- Fried Chicken (piece, 0.60 lb)
- BBQ Ribs (portion, 0.80 lb)
- Beef Brisket (portion, 0.70 lb)
- Pork Chops (piece, 0.55 lb)
- Turkey Breast (portion, 0.65 lb)
- Meatballs (each, 0.12 lb)
- Chicken Wings (portion of 6, 0.45 lb)
- Pulled Pork (portion, 0.50 lb)

### R13: Database Seed - Users
**THE SYSTEM SHALL** seed at least 6 users:
- 1 Admin (no station assignment)
- 1 Manager (no station assignment)
- 4 Staff members (one per station)

### R14: Database Seed - Waste Logs
**THE SYSTEM SHALL** generate 14 days of realistic evening waste data where:
- Each station has waste entries for multiple items each day
- Quantities vary realistically (e.g., 2-15 units wasted per item per day)
- Some days have higher waste than others (weekends vs weekdays)
- Total daily waste per station ranges from 10-50 lbs
- Dates are the most recent 14 days from the current date

### R15: Backend Health Endpoint
**THE SYSTEM SHALL** implement a `GET /health` endpoint that:
- Returns HTTP 200 status
- Returns JSON with:
  - `status: "ok"`
  - `timestamp: <current ISO datetime>`
  - `database: "connected"` or `"disconnected"`
  - `version: <API version from package.json>`
- Tests database connectivity by executing a simple Prisma query
- Returns HTTP 503 if database is unreachable

### R16: README Documentation
**THE SYSTEM SHALL** create a root-level `README.md` with:
- Project title and description
- Prerequisites (Node 20, Docker, pnpm/npm/yarn)
- Setup steps:
  1. Clone repository
  2. Install dependencies
  3. Start Docker Compose (PostgreSQL)
  4. Copy `.env.example` to `.env` in backend
  5. Run Prisma migrations
  6. Run seed script
  7. Start backend dev server
  8. Start frontend dev server
  9. Verify health endpoint
- Links to additional documentation in `/docs`
- Contribution guidelines reference

### R17: Environment Variables
**THE SYSTEM SHALL** provide `.env.example` files:

**Backend `.env.example`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/maxwell_waste_tracker"
NODE_ENV="development"
PORT=3000
JWT_SECRET="your-secret-key-here"
```

**Frontend `.env.example`:**
```
VITE_API_BASE_URL="http://localhost:3000"
```

### R18: Package Scripts
**THE SYSTEM SHALL** include npm scripts in backend `package.json`:
- `dev` - Start development server with hot reload
- `build` - Compile TypeScript
- `start` - Run production build
- `test` - Run Vitest tests
- `lint` - Run ESLint
- `format` - Run Prettier
- `db:migrate` - Run Prisma migrations
- `db:seed` - Run seed script
- `db:studio` - Open Prisma Studio
- `db:reset` - Reset database and re-seed

### R19: Git Ignore Rules
**THE SYSTEM SHALL** ignore:
- `node_modules/`
- `.env` (but not `.env.example`)
- `dist/`, `build/`
- `.DS_Store`
- `*.log`
- `.vscode/` (optional, can keep if desired)
- `coverage/`
- `*.local`

---

## Data Model Notes

The schema design supports:
- **Multi-station tracking**: Each log is tied to a specific station
- **Item-level granularity**: Track waste per food item, not just totals
- **Weight normalization**: All waste calculated and stored in pounds
- **User accountability**: Every log records who entered it
- **Historical analysis**: Timestamps on all records
- **Reuse intelligence**: Rules table enables cross-station recommendations
- **Production context**: Production logs help calculate waste percentage

## Success Criteria

1. ✅ All directories and configuration files are in place
2. ✅ `docker-compose up` successfully starts PostgreSQL
3. ✅ `npm run db:migrate` creates all tables
4. ✅ `npm run db:seed` populates the database without errors
5. ✅ Backend dev server starts and health endpoint returns 200
6. ✅ Frontend dev server starts and loads without errors
7. ✅ TypeScript compiles without errors in both workspaces
8. ✅ ESLint and Prettier run without errors
9. ✅ README instructions can be followed by a new developer

## Out of Scope
- Authentication implementation (JWT setup only)
- Frontend UI components
- API endpoints beyond health check
- Deployment configuration
- CI/CD pipeline
- Tests for seed data

---

## Notes
This spec establishes the foundation. Subsequent specs will build authentication, API endpoints, frontend features, and deployment infrastructure on top of this base.
