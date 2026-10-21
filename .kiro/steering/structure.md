# Project Structure

## Monorepo Organization

This project follows a monorepo structure with the following top-level directories:

```
/
├── frontend/          # React + Vite + TypeScript application
├── backend/           # Node + Express + TypeScript API
├── docs/              # Project documentation
└── .kiro/             # Kiro AI configuration (steering, hooks, skills)
```

## Directory Details

### `/frontend`
React application with Vite build tooling.

**Key subdirectories:**
- `src/components/` - React components
- `src/pages/` - Page-level components/routes
- `src/hooks/` - Custom React hooks
- `src/api/` - API client code and TanStack Query hooks
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/styles/` - Global styles and Tailwind config
- `public/` - Static assets

### `/backend`
Node.js Express API server with Prisma ORM.

**Key subdirectories:**
- `src/routes/` - Express route definitions
- `src/controllers/` - Route handlers and business logic
- `src/services/` - Business logic layer
- `src/middleware/` - Express middleware
- `src/validation/` - Zod schemas for input validation
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `prisma/` - Prisma schema and migrations
- `tests/` - Vitest and Supertest tests

### `/docs`
Project documentation including architecture decisions, API specs, and development guides.

**Required files:**
- `CHARTER.md` - Detailed folder conventions, coding standards, and team agreements
- `API.md` - API endpoint documentation
- `DEPLOYMENT.md` - Deployment procedures and infrastructure setup
- `DEVELOPMENT.md` - Local development setup instructions

### `/.kiro`
Kiro AI configuration for steering, hooks, and skills.

**Subdirectories:**
- `steering/` - Context and rules for AI assistance
- `hooks/` - Automated workflows and event handlers
- `skills/` - Reusable AI skills and templates
- `settings/` - MCP server configuration

## Folder Conventions

Detailed folder conventions, naming standards, file organization patterns, and architectural guidelines are documented in **`docs/CHARTER.md`**.

All team members and AI assistance should follow the conventions defined in the CHARTER when creating new files or organizing code.

## Key Principles

1. **Separation of Concerns**: Frontend and backend are fully independent
2. **Type Safety**: Shared types should be defined in each workspace (consider a shared types package if needed)
3. **Clear Boundaries**: Each directory has a specific purpose
4. **Documentation First**: Document architectural decisions and conventions in `/docs`
5. **Consistent Naming**: Follow the naming conventions in docs/CHARTER.md
6. **Modular Structure**: Code should be organized by feature or domain where appropriate

## Dependencies

Each workspace (`frontend/` and `backend/`) maintains its own `package.json` with independent dependencies.

Consider adding a root-level `package.json` with workspace configuration if using npm/yarn/pnpm workspaces.

## Configuration Files

- Root `.gitignore` covers all workspaces
- Each workspace has its own `tsconfig.json`
- ESLint and Prettier configs can be shared or per-workspace
- Environment variables: `.env.example` in each workspace, actual `.env` files never committed

## Development Workflow

1. Install dependencies in both workspaces
2. Run backend and frontend development servers concurrently
3. Backend typically runs on `http://localhost:3000` or `http://localhost:5000`
4. Frontend typically runs on `http://localhost:5173` (Vite default)
5. Frontend proxies API requests to backend during development

Refer to `docs/CHARTER.md` for detailed conventions and `docs/DEVELOPMENT.md` for setup instructions.
