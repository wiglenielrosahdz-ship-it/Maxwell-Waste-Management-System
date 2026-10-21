# Spec: Authentication and Catalog APIs

## Overview
Implement secure authentication using name + PIN login with JWT tokens, and provide catalog APIs for stations and items with role-based access control.

## Goals
1. Secure authentication with bcrypt-hashed PINs and JWT tokens
2. Role-based authorization (Staff, Manager, Admin)
3. Station-level access control for Staff users
4. Catalog APIs for browsing stations and items
5. Admin CRUD operations for stations and items
6. Comprehensive input validation with Zod
7. Rate limiting to prevent brute force attacks
8. Full test coverage with Supertest

---

## Requirements (EARS Format)

### Authentication Requirements

#### R1: Login Endpoint
**THE SYSTEM SHALL** provide a `POST /api/auth/login` endpoint that:
- Accepts JSON body with `{ name: string, pin: string }`
- Validates input with Zod schema
- Returns HTTP 400 for validation errors
- Returns HTTP 401 for invalid credentials
- Returns HTTP 429 when rate limit exceeded
- Returns HTTP 200 with user data (excluding password_hash) on success
- Sets an httpOnly cookie named `auth_token` containing the JWT
- JWT expires in 8 hours
- Cookie has `secure: true` in production, `sameSite: 'strict'`

#### R2: PIN Storage
**WHEN** a user is created or their PIN is updated, **THE SYSTEM SHALL**:
- Hash the PIN using bcrypt with a cost factor of 10
- Store only the hash in the `password_hash` field
- Never store or log plaintext PINs
- Enforce PIN format: exactly 4 digits (validated with Zod)

#### R3: JWT Token Structure
**THE SYSTEM SHALL** encode JWTs with the following payload:
```typescript
{
  userId: string;      // UUID
  email: string;
  name: string;
  role: "STAFF" | "MANAGER" | "ADMIN";
  stationId: string | null;  // null for managers and admins
  iat: number;         // issued at
  exp: number;         // expires at
}
```

#### R4: Authentication Middleware
**THE SYSTEM SHALL** provide an authentication middleware that:
- Reads the `auth_token` cookie from incoming requests
- Verifies the JWT signature using the secret from environment
- Returns HTTP 401 if token is missing, invalid, or expired
- Attaches decoded user data to `req.user` for authenticated requests
- Allows requests to proceed if token is valid

#### R5: Authorization Middleware
**THE SYSTEM SHALL** provide authorization middleware functions:
- `requireRole(roles: Role[])` - Returns HTTP 403 if user role not in allowed list
- `requireStationAccess(stationId: string)` - Returns HTTP 403 if:
  - User is STAFF and `stationId` does not match their `user.stationId`
  - User is MANAGER or ADMIN: allows access to all stations

#### R6: Logout Endpoint
**THE SYSTEM SHALL** provide a `POST /api/auth/logout` endpoint that:
- Clears the `auth_token` cookie
- Returns HTTP 200 with `{ message: "Logged out successfully" }`
- Works regardless of authentication state

#### R7: Current User Endpoint
**THE SYSTEM SHALL** provide a `GET /api/auth/me` endpoint that:
- Requires authentication
- Returns HTTP 200 with current user data (excluding password_hash)
- Returns HTTP 401 if not authenticated

#### R8: Rate Limiting
**THE SYSTEM SHALL** implement rate limiting on `POST /api/auth/login`:
- Maximum 5 attempts per IP address per 15 minutes
- Returns HTTP 429 with `{ error: "Too many login attempts. Please try again later." }`
- Uses `express-rate-limit` package
- Does not apply rate limiting to other endpoints in this spec

---

### Catalog API Requirements

#### R9: List Stations
**THE SYSTEM SHALL** provide a `GET /api/stations` endpoint that:
- Does not require authentication (public catalog)
- Returns HTTP 200 with array of all active stations
- Each station includes: `id`, `name`, `code`, `description`, `is_active`
- Filters to only `is_active = true` stations
- Returns stations ordered alphabetically by name

#### R10: Get Station Details
**THE SYSTEM SHALL** provide a `GET /api/stations/:id` endpoint that:
- Does not require authentication
- Returns HTTP 200 with station details
- Returns HTTP 404 if station not found or not active
- Station object includes: `id`, `name`, `code`, `description`, `is_active`

#### R11: List Station Items
**THE SYSTEM SHALL** provide a `GET /api/stations/:id/items` endpoint that:
- Does not require authentication
- Returns HTTP 200 with array of all active items for the station
- Returns HTTP 404 if station not found
- Each item includes: `id`, `station_id`, `name`, `category`, `unit`, `lb_per_unit`, `is_active`
- Filters to only `is_active = true` items
- Returns items ordered alphabetically by name

---

### Admin Station Management Requirements

#### R12: Create Station (Admin Only)
**THE SYSTEM SHALL** provide a `POST /api/admin/stations` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Accepts JSON body validated with Zod:
  ```typescript
  {
    name: string;        // min 1, max 100 chars
    code: string;        // uppercase, underscore only, max 50 chars
    description?: string; // optional, max 500 chars
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 409 if station with same name or code already exists
- Returns HTTP 201 with created station object
- Sets `is_active = true` by default

#### R13: Update Station (Admin Only)
**THE SYSTEM SHALL** provide a `PATCH /api/admin/stations/:id` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Accepts partial JSON body (all fields optional):
  ```typescript
  {
    name?: string;
    code?: string;
    description?: string;
    is_active?: boolean;
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 404 if station not found
- Returns HTTP 409 if updated name or code conflicts with existing station
- Returns HTTP 200 with updated station object

#### R14: Delete Station (Admin Only)
**THE SYSTEM SHALL** provide a `DELETE /api/admin/stations/:id` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Performs soft delete by setting `is_active = false`
- Returns HTTP 404 if station not found
- Returns HTTP 200 with `{ message: "Station deleted successfully" }`
- Does not cascade delete items (items remain but may become orphaned in queries)

---

### Admin Item Management Requirements

#### R15: Create Item (Admin Only)
**THE SYSTEM SHALL** provide a `POST /api/admin/items` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Accepts JSON body validated with Zod:
  ```typescript
  {
    station_id: string;    // UUID, must reference existing station
    name: string;          // min 1, max 100 chars
    category?: string;     // optional, max 50 chars
    unit: string;          // max 20 chars
    lb_per_unit: number;   // positive decimal, max 2 decimal places
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 404 if `station_id` does not reference an existing station
- Returns HTTP 201 with created item object
- Sets `is_active = true` by default

#### R16: Update Item (Admin Only)
**THE SYSTEM SHALL** provide a `PATCH /api/admin/items/:id` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Accepts partial JSON body (all fields optional):
  ```typescript
  {
    station_id?: string;
    name?: string;
    category?: string;
    unit?: string;
    lb_per_unit?: number;
    is_active?: boolean;
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 404 if item not found
- Returns HTTP 404 if `station_id` does not reference an existing station
- Returns HTTP 200 with updated item object

#### R17: Delete Item (Admin Only)
**THE SYSTEM SHALL** provide a `DELETE /api/admin/items/:id` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Performs soft delete by setting `is_active = false`
- Returns HTTP 404 if item not found
- Returns HTTP 200 with `{ message: "Item deleted successfully" }`

#### R18: List All Items (Admin Only)
**THE SYSTEM SHALL** provide a `GET /api/admin/items` endpoint that:
- Requires authentication and ADMIN role
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is not ADMIN
- Returns HTTP 200 with array of all items (including inactive)
- Supports optional query parameter `?station_id=<uuid>` to filter by station
- Each item includes all fields: `id`, `station_id`, `name`, `category`, `unit`, `lb_per_unit`, `is_active`, `created_at`, `updated_at`
- Returns items ordered by station name, then item name

---

### Error Handling Requirements

#### R19: Consistent Error Response Format
**THE SYSTEM SHALL** return errors in a consistent JSON format:
```typescript
{
  error: string;           // Human-readable error message
  code?: string;           // Machine-readable error code (e.g., "VALIDATION_ERROR")
  details?: unknown;       // Additional context (e.g., Zod validation errors)
}
```

#### R20: Zod Validation Error Format
**WHEN** Zod validation fails, **THE SYSTEM SHALL**:
- Return HTTP 400
- Include validation errors in the `details` field
- Format Zod errors to show field path and message
- Example:
  ```json
  {
    "error": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "pin", "message": "PIN must be exactly 4 digits" },
      { "field": "name", "message": "Name is required" }
    ]
  }
  ```

#### R21: Database Error Handling
**WHEN** a Prisma operation fails, **THE SYSTEM SHALL**:
- Return HTTP 500 for unexpected database errors
- Return HTTP 409 for unique constraint violations
- Return HTTP 404 for record not found errors
- Log full error details to console/logging service
- Return user-friendly error message in response (not internal error details)

---

### Testing Requirements

#### R22: Authentication Test Coverage
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ Login with valid name and PIN returns 200 and sets cookie
- ✅ Login with invalid name returns 401
- ✅ Login with invalid PIN returns 401
- ✅ Login with malformed request body returns 400
- ✅ Login rate limiting triggers after 5 attempts
- ✅ Logout clears cookie and returns 200
- ✅ GET /api/auth/me returns user data when authenticated
- ✅ GET /api/auth/me returns 401 when not authenticated
- ✅ JWT token expires after configured duration
- ✅ Invalid JWT signature returns 401

#### R23: Authorization Test Coverage
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ ADMIN can access all admin endpoints
- ✅ MANAGER cannot access admin endpoints (returns 403)
- ✅ STAFF cannot access admin endpoints (returns 403)
- ✅ STAFF can only access their assigned station's data
- ✅ STAFF attempting to access another station returns 403

#### R24: Station Catalog Test Coverage
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ GET /api/stations returns all active stations
- ✅ GET /api/stations/:id returns station details
- ✅ GET /api/stations/:id returns 404 for inactive station
- ✅ GET /api/stations/:id returns 404 for non-existent station
- ✅ GET /api/stations/:id/items returns all active items for station
- ✅ GET /api/stations/:id/items returns 404 for non-existent station

#### R25: Admin Station CRUD Test Coverage
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ POST /api/admin/stations creates new station with valid data
- ✅ POST /api/admin/stations returns 400 for invalid data
- ✅ POST /api/admin/stations returns 409 for duplicate name/code
- ✅ PATCH /api/admin/stations/:id updates station with valid data
- ✅ PATCH /api/admin/stations/:id returns 404 for non-existent station
- ✅ DELETE /api/admin/stations/:id soft deletes station
- ✅ DELETE /api/admin/stations/:id returns 404 for non-existent station

#### R26: Admin Item CRUD Test Coverage
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ POST /api/admin/items creates new item with valid data
- ✅ POST /api/admin/items returns 400 for invalid data
- ✅ POST /api/admin/items returns 404 for non-existent station_id
- ✅ PATCH /api/admin/items/:id updates item with valid data
- ✅ PATCH /api/admin/items/:id returns 404 for non-existent item
- ✅ DELETE /api/admin/items/:id soft deletes item
- ✅ GET /api/admin/items returns all items
- ✅ GET /api/admin/items?station_id=X filters by station

---

## Implementation Notes

### Zod Schemas
Create shared validation schemas in `backend/src/validation/`:
- `auth.schemas.ts` - Login, PIN format
- `station.schemas.ts` - Station create/update
- `item.schemas.ts` - Item create/update

### Middleware Organization
Organize in `backend/src/middleware/`:
- `auth.middleware.ts` - JWT verification
- `authorization.middleware.ts` - Role and station access checks
- `errorHandler.middleware.ts` - Centralized error formatting
- `rateLimiter.middleware.ts` - Express rate limit configuration

### Route Organization
Organize in `backend/src/routes/`:
- `auth.routes.ts` - Authentication endpoints
- `stations.routes.ts` - Public station catalog
- `admin.routes.ts` - Admin-only CRUD operations

### Service Layer
Create services in `backend/src/services/`:
- `auth.service.ts` - Login logic, JWT generation, PIN hashing
- `station.service.ts` - Station CRUD operations
- `item.service.ts` - Item CRUD operations

### Test Organization
Organize tests in `backend/tests/`:
- `auth.test.ts` - Authentication flow tests
- `authorization.test.ts` - Role-based access tests
- `stations.test.ts` - Station catalog tests
- `admin-stations.test.ts` - Admin station CRUD tests
- `admin-items.test.ts` - Admin item CRUD tests
- `setup.ts` - Test database setup and teardown

### Environment Variables
Add to `backend/.env.example`:
```
JWT_SECRET="your-256-bit-secret-key"
JWT_EXPIRES_IN="8h"
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

---

## API Summary

### Public Endpoints (No Auth Required)
- `GET /api/stations` - List all active stations
- `GET /api/stations/:id` - Get station details
- `GET /api/stations/:id/items` - List station items

### Authentication Endpoints
- `POST /api/auth/login` - Login with name + PIN (rate limited)
- `POST /api/auth/logout` - Logout (clear cookie)
- `GET /api/auth/me` - Get current user (requires auth)

### Admin Endpoints (Requires ADMIN role)
- `POST /api/admin/stations` - Create station
- `PATCH /api/admin/stations/:id` - Update station
- `DELETE /api/admin/stations/:id` - Soft delete station
- `POST /api/admin/items` - Create item
- `PATCH /api/admin/items/:id` - Update item
- `DELETE /api/admin/items/:id` - Soft delete item
- `GET /api/admin/items` - List all items with optional filter

---

## Success Criteria

1. ✅ Users can log in with name + 4-digit PIN
2. ✅ JWT is stored in httpOnly cookie
3. ✅ Authenticated requests include user context
4. ✅ Role-based authorization works for STAFF/MANAGER/ADMIN
5. ✅ Staff users can only access their assigned station
6. ✅ Public catalog endpoints work without authentication
7. ✅ Admin can create, update, and delete stations and items
8. ✅ All inputs are validated with Zod
9. ✅ Errors follow consistent format
10. ✅ Rate limiting prevents brute force login attempts
11. ✅ All acceptance criteria have passing Supertest tests
12. ✅ Test coverage is at least 80% for auth and API code

---

## Out of Scope
- Password reset functionality
- Email verification
- Two-factor authentication
- Session management (beyond JWT expiration)
- Audit logging
- Frontend authentication UI
- Refresh token mechanism
- OAuth/SSO integration

---

## Dependencies
New packages required:
- `bcrypt` + `@types/bcrypt` - Password hashing
- `jsonwebtoken` + `@types/jsonwebtoken` - JWT generation/verification
- `express-rate-limit` - Rate limiting middleware
- `cookie-parser` - Parse cookies from requests
- `zod` - Runtime validation

These should be added to `backend/package.json`.
