# Technical Stack & Standards

## Frontend Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts

## Backend Stack
- **Runtime**: Node 20 LTS
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Validation**: Zod (all inputs must be validated)
- **ORM**: Prisma
- **Database**: PostgreSQL

## Testing
- **Unit/Integration**: Vitest
- **API Testing**: Supertest
- **Coverage**: Aim for >80% on critical paths

## Deployment (AWS)
- **Frontend**: S3 + CloudFront (static hosting)
- **Backend API**: EC2, ECS, or Lambda (to be determined based on needs)
- **Database**: RDS PostgreSQL
- **Secrets**: AWS Secrets Manager or Parameter Store

## Development Rules

### TypeScript Standards
- Strict mode enabled in tsconfig.json
- No `any` types unless absolutely necessary (document why)
- Explicit return types on functions
- Enable all strict checks: `noImplicitAny`, `strictNullChecks`, etc.

### Input Validation
- **All user inputs must be validated with Zod schemas**
- Define schemas at the API boundary
- Validate on both client and server
- Return clear validation error messages

### Security
- **No secrets, API keys, or credentials in code**
- Use environment variables for configuration
- Store secrets in AWS Secrets Manager
- Never commit `.env` files
- Sanitize all user inputs
- Use parameterized queries (Prisma handles this)

### Git Conventions
- Use conventional commits format:
  - `feat:` new features
  - `fix:` bug fixes
  - `docs:` documentation changes
  - `refactor:` code refactoring
  - `test:` test additions/changes
  - `chore:` maintenance tasks
- Write clear, descriptive commit messages
- Keep commits atomic and focused

### Code Quality
- Use ESLint with TypeScript rules
- Use Prettier for consistent formatting
- Review PRs before merging
- Write tests for new features
- Document complex logic with comments

## API Standards
- RESTful conventions
- Consistent error response format
- Use HTTP status codes correctly
- Version API endpoints if needed (`/api/v1/...`)
- Include request/response type definitions

## Environment Variables
Required variables should be documented in:
- `frontend/.env.example`
- `backend/.env.example`

Never commit actual `.env` files to version control.
