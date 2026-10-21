# Spec: Waste and Production Logging

## Overview
Implement logging endpoints for tracking food waste and production data with automatic weight calculations, validation, time-based permissions, and filtering capabilities.

## Goals
1. Enable staff to log waste and production quantities with automatic weight conversion
2. Validate waste reasons and dispositions using enums
3. Implement time-based soft delete permissions (creator within 10 minutes, managers anytime)
4. Provide filtering and pagination for historical data queries
5. Ensure data integrity with proper validation and authorization
6. Comprehensive test coverage for edge cases

---

## Requirements (EARS Format)

### Waste Logging Requirements

#### R1: Create Waste Log
**THE SYSTEM SHALL** provide a `POST /api/waste` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Accepts JSON body validated with Zod:
  ```typescript
  {
    station_id: string;        // UUID
    item_id: string;           // UUID
    quantity: number;          // positive integer
    reason: WasteReason;       // enum
    disposition?: WasteDisposition; // enum, optional
    notes?: string;            // optional, max 1000 chars
    shift_date?: string;       // ISO date, optional (defaults to today)
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 403 if user is STAFF and `station_id` does not match their assigned station
- Returns HTTP 404 if `station_id` or `item_id` do not exist
- Returns HTTP 400 if `item_id` does not belong to the specified `station_id`
- Automatically calculates `weight_lbs = quantity × item.lb_per_unit`
- Sets `shift_date` to current date if not provided
- Sets `logged_by` to authenticated user's ID
- Returns HTTP 201 with created waste log object including calculated `weight_lbs`

#### R2: Waste Reason Enum
**THE SYSTEM SHALL** define a `WasteReason` enum with values:
- `OVERPRODUCTION` - Made too much
- `EXPIRED` - Past safe consumption date
- `QUALITY` - Failed quality standards
- `CONTAMINATION` - Cross-contamination or dropped
- `TEMPERATURE_ABUSE` - Left out too long
- `CUSTOMER_RETURN` - Returned by customer
- `EQUIPMENT_FAILURE` - Caused by equipment malfunction
- `OTHER` - Other reason (notes should explain)

#### R3: Waste Disposition Enum
**THE SYSTEM SHALL** define a `WasteDisposition` enum with values:
- `TRASH` - Thrown away
- `COMPOST` - Sent to composting
- `DONATION` - Donated to food bank
- `ANIMAL_FEED` - Given for animal consumption
- `RECYCLING` - Packaging recycled

#### R4: Get Waste Logs
**THE SYSTEM SHALL** provide a `GET /api/waste` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (inclusive)
  - `to` (optional, ISO date) - End date (inclusive)
  - `page` (optional, integer, default 1) - Page number
  - `limit` (optional, integer, default 50, max 100) - Items per page
- Returns HTTP 400 if query parameters are invalid
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Allows STAFF to query only their assigned station (enforces station_id filter)
- Allows MANAGER and ADMIN to query any station or all stations
- Returns HTTP 200 with paginated response:
  ```typescript
  {
    data: WasteLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
  ```
- Orders results by `shift_date` descending, then `created_at` descending
- Each waste log includes all fields plus item name and station name

#### R5: Get Single Waste Log
**THE SYSTEM SHALL** provide a `GET /api/waste/:id` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Returns HTTP 404 if waste log not found or soft-deleted
- Returns HTTP 403 if user is STAFF and log's station does not match their assigned station
- Returns HTTP 200 with complete waste log object including:
  - All waste log fields
  - Nested item object with name, unit, lb_per_unit
  - Nested station object with name, code
  - Nested user object (logged_by) with name, role

#### R6: Delete Waste Log
**THE SYSTEM SHALL** provide a `DELETE /api/waste/:id` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Returns HTTP 404 if waste log not found or already soft-deleted
- Performs soft delete by setting `deleted_at` timestamp
- Allows deletion if ANY of these conditions are true:
  1. User is MANAGER or ADMIN
  2. User is the creator (logged_by matches user ID) AND log was created less than 10 minutes ago
- Returns HTTP 403 if user lacks permission (not creator, or creator but >10 minutes elapsed)
- Returns HTTP 200 with `{ message: "Waste log deleted successfully" }`
- Soft-deleted logs are excluded from GET queries by default

#### R7: Weight Calculation Validation
**WHEN** creating a waste log, **THE SYSTEM SHALL**:
- Fetch the item's `lb_per_unit` from the database
- Calculate `weight_lbs = quantity × lb_per_unit`
- Round result to 2 decimal places
- Store both `quantity` and calculated `weight_lbs` in the database
- Fail with HTTP 404 if item has been soft-deleted (`is_active = false`)

#### R8: Shift Date Validation
**WHEN** a `shift_date` is provided, **THE SYSTEM SHALL**:
- Accept dates in ISO 8601 format (YYYY-MM-DD)
- Return HTTP 400 if format is invalid
- Allow dates up to today (inclusive)
- Return HTTP 400 if date is in the future
- Allow dates up to 30 days in the past
- Return HTTP 400 if date is more than 30 days ago

---

### Production Logging Requirements

#### R9: Create Production Log
**THE SYSTEM SHALL** provide a `POST /api/production` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Accepts JSON body validated with Zod:
  ```typescript
  {
    station_id: string;        // UUID
    item_id: string;           // UUID
    quantity: number;          // positive integer
    notes?: string;            // optional, max 1000 chars
    shift_date?: string;       // ISO date, optional (defaults to today)
  }
  ```
- Returns HTTP 400 for validation errors
- Returns HTTP 403 if user is STAFF and `station_id` does not match their assigned station
- Returns HTTP 404 if `station_id` or `item_id` do not exist
- Returns HTTP 400 if `item_id` does not belong to the specified `station_id`
- Automatically calculates `weight_lbs = quantity × item.lb_per_unit`
- Sets `shift_date` to current date if not provided
- Sets `logged_by` to authenticated user's ID
- Returns HTTP 201 with created production log object including calculated `weight_lbs`

#### R10: Get Production Logs
**THE SYSTEM SHALL** provide a `GET /api/production` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (inclusive)
  - `to` (optional, ISO date) - End date (inclusive)
  - `page` (optional, integer, default 1) - Page number
  - `limit` (optional, integer, default 50, max 100) - Items per page
- Returns HTTP 400 if query parameters are invalid
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Allows STAFF to query only their assigned station (enforces station_id filter)
- Allows MANAGER and ADMIN to query any station or all stations
- Returns HTTP 200 with paginated response:
  ```typescript
  {
    data: ProductionLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
  ```
- Orders results by `shift_date` descending, then `created_at` descending
- Each production log includes all fields plus item name and station name

#### R11: Get Single Production Log
**THE SYSTEM SHALL** provide a `GET /api/production/:id` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Returns HTTP 404 if production log not found or soft-deleted
- Returns HTTP 403 if user is STAFF and log's station does not match their assigned station
- Returns HTTP 200 with complete production log object including:
  - All production log fields
  - Nested item object with name, unit, lb_per_unit
  - Nested station object with name, code
  - Nested user object (logged_by) with name, role

#### R12: Delete Production Log
**THE SYSTEM SHALL** provide a `DELETE /api/production/:id` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Returns HTTP 404 if production log not found or already soft-deleted
- Performs soft delete by setting `deleted_at` timestamp
- Allows deletion if ANY of these conditions are true:
  1. User is MANAGER or ADMIN
  2. User is the creator (logged_by matches user ID) AND log was created less than 10 minutes ago
- Returns HTTP 403 if user lacks permission (not creator, or creator but >10 minutes elapsed)
- Returns HTTP 200 with `{ message: "Production log deleted successfully" }`
- Soft-deleted logs are excluded from GET queries by default

---

### Schema Updates Requirements

#### R13: Add Soft Delete to Waste Logs
**THE SYSTEM SHALL** update the `waste_logs` Prisma schema to include:
- `deleted_at` (timestamp, nullable) - Set when soft-deleted
- `deleted_by` (UUID, nullable, foreign key to users) - Who deleted it
- Index on `deleted_at` for efficient filtering
- Modify unique constraint to allow duplicate entries if `deleted_at IS NOT NULL`

#### R14: Add Soft Delete to Production Logs
**THE SYSTEM SHALL** update the `production_logs` Prisma schema to include:
- `deleted_at` (timestamp, nullable) - Set when soft-deleted
- `deleted_by` (UUID, nullable, foreign key to users) - Who deleted it
- Index on `deleted_at` for efficient filtering

#### R15: Update Waste Logs Schema
**THE SYSTEM SHALL** update the `waste_logs` Prisma schema to include:
- `reason` (enum WasteReason, required)
- `disposition` (enum WasteDisposition, nullable)
- `shift_date` (date, required) - The evening shift date
- Modify field name from `date` to `shift_date` if necessary
- Remove previous unique constraint on (station_id, item_id, date)

#### R16: Update Production Logs Schema
**THE SYSTEM SHALL** update the `production_logs` Prisma schema to include:
- `shift_date` (date, required) - The shift date
- Rename `date` field to `shift_date` if necessary

---

### Validation Requirements

#### R17: Quantity Validation
**WHEN** validating quantity for waste or production logs, **THE SYSTEM SHALL**:
- Require quantity to be a positive integer (minimum 1)
- Return HTTP 400 if quantity is zero, negative, or not an integer
- Allow quantities up to 10,000 units
- Return HTTP 400 if quantity exceeds 10,000

#### R18: Station-Item Relationship Validation
**WHEN** creating a waste or production log, **THE SYSTEM SHALL**:
- Verify that `item_id` belongs to the specified `station_id`
- Query the item and check `item.station_id === request.station_id`
- Return HTTP 400 with message "Item does not belong to the specified station" if mismatch
- This check occurs after verifying both IDs exist

#### R19: Date Range Validation for Queries
**WHEN** validating date range query parameters, **THE SYSTEM SHALL**:
- Accept `from` and `to` in ISO 8601 date format (YYYY-MM-DD)
- Return HTTP 400 if either date format is invalid
- Return HTTP 400 if `from` is after `to`
- Allow queries spanning up to 365 days
- Return HTTP 400 if date range exceeds 365 days

#### R20: Pagination Validation
**WHEN** validating pagination parameters, **THE SYSTEM SHALL**:
- Default to `page = 1` if not provided
- Default to `limit = 50` if not provided
- Enforce `limit` maximum of 100
- Return HTTP 400 if `page` is less than 1
- Return HTTP 400 if `limit` is less than 1 or greater than 100
- Return empty array if `page` exceeds available pages (not an error)

---

### Permission Testing Requirements

#### R21: Time-Based Delete Permission Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ Creator can delete their own log within 10 minutes
- ✅ Creator cannot delete their own log after 10 minutes (returns 403)
- ✅ Manager can delete any log regardless of time
- ✅ Admin can delete any log regardless of time
- ✅ Staff user cannot delete another staff's log
- ✅ Deletion sets `deleted_at` and `deleted_by` fields
- ✅ Deleted logs are excluded from GET queries
- ✅ Attempting to delete an already-deleted log returns 404

#### R22: Weight Calculation Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ POST calculates weight_lbs correctly (quantity × lb_per_unit)
- ✅ Weight is rounded to 2 decimal places
- ✅ Weight is stored in database with log
- ✅ Creating log with inactive item returns 404
- ✅ Different quantities produce proportional weights

#### R23: Validation Edge Case Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ Creating waste log with invalid reason enum returns 400
- ✅ Creating waste log with invalid disposition enum returns 400
- ✅ Creating waste log with quantity = 0 returns 400
- ✅ Creating waste log with negative quantity returns 400
- ✅ Creating waste log with quantity > 10,000 returns 400
- ✅ Creating log with item from different station returns 400
- ✅ Creating log with shift_date in future returns 400
- ✅ Creating log with shift_date > 30 days ago returns 400
- ✅ Creating log with valid shift_date succeeds

#### R24: Station Access Control Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ Staff can create logs for their assigned station
- ✅ Staff cannot create logs for other stations (returns 403)
- ✅ Staff can query logs for their assigned station
- ✅ Staff cannot query logs for other stations (returns 403)
- ✅ Staff querying without station_id auto-filters to their station
- ✅ Manager can create logs for any station
- ✅ Manager can query logs for any station
- ✅ Admin can create logs for any station
- ✅ Admin can query logs for any station

#### R25: Pagination and Filtering Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ GET returns paginated results with correct metadata
- ✅ page and limit parameters work correctly
- ✅ limit defaults to 50
- ✅ limit cannot exceed 100
- ✅ from and to filters correctly filter by date range
- ✅ station_id filter returns only logs for that station
- ✅ Results are ordered by shift_date desc, then created_at desc
- ✅ Querying page beyond available returns empty array
- ✅ Date range exceeding 365 days returns 400

#### R26: Production Logging Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ POST /api/production creates log with correct weight calculation
- ✅ Production logs follow same permission rules as waste logs
- ✅ Production logs can be queried with same filters
- ✅ Production logs can be soft-deleted with same time-based rules
- ✅ Production and waste logs are stored in separate tables

---

## Implementation Notes

### Zod Schemas
Create validation schemas in `backend/src/validation/`:
- `waste.schemas.ts`:
  - `WasteReasonEnum` - Zod enum for waste reasons
  - `WasteDispositionEnum` - Zod enum for dispositions
  - `createWasteLogSchema` - POST body validation
  - `wasteQuerySchema` - GET query parameter validation
- `production.schemas.ts`:
  - `createProductionLogSchema` - POST body validation
  - `productionQuerySchema` - GET query parameter validation
- `shared.schemas.ts`:
  - `paginationSchema` - Reusable pagination validation
  - `dateRangeSchema` - Reusable date range validation

### Service Layer
Create services in `backend/src/services/`:
- `waste.service.ts`:
  - `createWasteLog(data, userId)` - Create with weight calculation
  - `getWasteLogs(filters, userId, userRole, userStationId)` - Query with permissions
  - `getWasteLogById(id, userId, userRole, userStationId)` - Get single
  - `deleteWasteLog(id, userId, userRole)` - Soft delete with time check
  - `calculateWeight(itemId, quantity)` - Weight calculation helper
- `production.service.ts`:
  - `createProductionLog(data, userId)` - Create with weight calculation
  - `getProductionLogs(filters, userId, userRole, userStationId)` - Query with permissions
  - `getProductionLogById(id, userId, userRole, userStationId)` - Get single
  - `deleteProductionLog(id, userId, userRole)` - Soft delete with time check

### Middleware Helpers
Add to `backend/src/middleware/`:
- `authorization.middleware.ts`:
  - `checkStationAccess(stationId, user)` - Validate station access
  - `canDeleteLog(log, user)` - Check time-based delete permission

### Route Organization
Add routes in `backend/src/routes/`:
- `waste.routes.ts` - Waste logging endpoints
- `production.routes.ts` - Production logging endpoints

### Utility Functions
Create in `backend/src/utils/`:
- `weight.utils.ts`:
  - `calculateWeight(quantity, lbPerUnit)` - Calculate and round weight
  - `roundToTwoDecimals(value)` - Precision helper
- `date.utils.ts`:
  - `isWithinRange(date, maxDaysAgo)` - Date validation
  - `parseISODate(dateString)` - Safe date parsing

### Test Organization
Add tests in `backend/tests/`:
- `waste-logging.test.ts` - Waste log CRUD and permissions
- `production-logging.test.ts` - Production log CRUD and permissions
- `weight-calculation.test.ts` - Weight conversion edge cases
- `log-permissions.test.ts` - Time-based delete permissions
- `log-filters.test.ts` - Pagination and filtering

### Prisma Migration
Create migration to:
1. Add `reason` and `disposition` enums to Prisma schema
2. Add enum fields to `waste_logs` table
3. Add `shift_date` field to both tables
4. Add `deleted_at` and `deleted_by` to both tables
5. Add indexes on `deleted_at` for both tables
6. Remove old unique constraints if necessary

---

## API Summary

### Waste Logging Endpoints
- `POST /api/waste` - Create waste log (auth required, station access enforced)
- `GET /api/waste` - List waste logs (auth required, filters + pagination)
- `GET /api/waste/:id` - Get single waste log (auth required)
- `DELETE /api/waste/:id` - Soft delete waste log (auth required, time-based permission)

### Production Logging Endpoints
- `POST /api/production` - Create production log (auth required, station access enforced)
- `GET /api/production` - List production logs (auth required, filters + pagination)
- `GET /api/production/:id` - Get single production log (auth required)
- `DELETE /api/production/:id` - Soft delete production log (auth required, time-based permission)

---

## Success Criteria

1. ✅ Staff can log waste and production for their assigned station
2. ✅ Weight is automatically calculated from quantity × lb_per_unit
3. ✅ Waste reason and disposition enums are validated
4. ✅ Shift date defaults to today and is validated (not future, max 30 days past)
5. ✅ Creators can delete their logs within 10 minutes
6. ✅ Managers and admins can delete any logs anytime
7. ✅ Staff users cannot delete other users' logs
8. ✅ Soft-deleted logs are excluded from queries
9. ✅ Pagination works correctly with limits and page numbers
10. ✅ Date range filtering works (from/to parameters)
11. ✅ Station filtering respects role-based access control
12. ✅ All validation edge cases have passing tests
13. ✅ All permission edge cases have passing tests
14. ✅ Test coverage is at least 85% for logging code

---

## Out of Scope
- Bulk import of logs
- Log editing/updating (immutable after 10-minute window)
- Exporting logs to CSV/Excel
- Real-time notifications
- Audit trail for soft-deleted records
- Analytics or aggregation endpoints
- Image attachments for waste documentation
- Barcode scanning for items

---

## Dependencies
New packages required:
- `date-fns` - Date manipulation and validation

This should be added to `backend/package.json`.
