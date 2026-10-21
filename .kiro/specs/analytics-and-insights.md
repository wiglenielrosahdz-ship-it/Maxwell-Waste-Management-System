# Spec: Analytics and Insights

## Overview
Implement analytics endpoints for waste tracking data and an intelligent insights engine that identifies patterns, recommends actions, and matches cross-station reuse opportunities.

## Goals
1. Provide comprehensive analytics endpoints for waste data visualization
2. Calculate waste rates using production data when available
3. Implement rule-based insights engine to identify waste patterns
4. Build reuse matcher to suggest cross-station food redirection
5. Ensure all insights include evidence and plain-language explanations
6. Unit test each insight rule independently with fixtures

---

## Requirements (EARS Format)

### Analytics Endpoints

#### R1: Waste Summary Endpoint
**THE SYSTEM SHALL** provide a `GET /api/analytics/waste/summary` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (defaults to 30 days ago)
  - `to` (optional, ISO date) - End date (defaults to today)
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Returns HTTP 200 with summary object:
  ```typescript
  {
    total_waste_lbs: number;           // Sum of all waste
    total_entries: number;              // Count of waste logs
    avg_waste_per_shift: number;        // Average daily waste
    stations_summary: Array<{
      station_id: string;
      station_name: string;
      total_waste_lbs: number;
      percentage_of_total: number;
    }>;
    top_items: Array<{
      item_id: string;
      item_name: string;
      station_name: string;
      total_waste_lbs: number;
      total_quantity: number;
    }>;  // Top 10 by weight
    period: {
      from: string;  // ISO date
      to: string;    // ISO date
      days: number;
    }
  }
  ```

#### R2: Waste by Station Endpoint
**THE SYSTEM SHALL** provide a `GET /api/analytics/waste/by-station` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by specific station
  - `from` (optional, ISO date) - Start date (defaults to 30 days ago)
  - `to` (optional, ISO date) - End date (defaults to today)
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Returns HTTP 200 with array of station analytics:
  ```typescript
  Array<{
    station_id: string;
    station_name: string;
    station_code: string;
    daily_breakdown: Array<{
      date: string;           // ISO date
      total_waste_lbs: number;
      entry_count: number;
    }>;
    totals: {
      total_waste_lbs: number;
      avg_daily_waste: number;
      max_daily_waste: number;
      min_daily_waste: number;
    };
    top_items: Array<{
      item_id: string;
      item_name: string;
      total_waste_lbs: number;
      waste_rate?: number;    // Only if production data exists
    }>;  // Top 5
  }>
  ```

#### R3: Waste by Time of Day Endpoint
**THE SYSTEM SHALL** provide a `GET /api/analytics/waste/by-hour` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (defaults to 30 days ago)
  - `to` (optional, ISO date) - End date (defaults to today)
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Returns HTTP 200 with hourly breakdown:
  ```typescript
  {
    station_id?: string;       // Present if filtered
    station_name?: string;
    hourly_distribution: Array<{
      hour: number;            // 0-23
      total_waste_lbs: number;
      entry_count: number;
      percentage_of_total: number;
    }>;
    peak_hours: Array<{
      hour: number;
      waste_lbs: number;
    }>;  // Top 3 hours
    late_evening_waste: {
      after_8pm_lbs: number;
      after_8pm_percentage: number;
      is_spike: boolean;       // true if > 40%
    }
  }
  ```
- Note: Uses `created_at` timestamp to determine hour of logging

#### R4: Waste by Reason Endpoint
**THE SYSTEM SHALL** provide a `GET /api/analytics/waste/by-reason` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (defaults to 30 days ago)
  - `to` (optional, ISO date) - End date (defaults to today)
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Returns HTTP 200 with reason breakdown:
  ```typescript
  {
    station_id?: string;
    station_name?: string;
    by_reason: Array<{
      reason: WasteReason;
      total_waste_lbs: number;
      entry_count: number;
      percentage_of_total: number;
    }>;  // Sorted by weight descending
    dominant_reason?: {
      reason: WasteReason;
      percentage: number;
      is_dominant: boolean;    // true if > 50%
    };
    by_disposition: Array<{
      disposition: WasteDisposition | null;
      total_waste_lbs: number;
      entry_count: number;
      percentage_of_total: number;
    }>;  // Sorted by weight descending
  }
  ```

#### R5: Top Waste Items with Rates Endpoint
**THE SYSTEM SHALL** provide a `GET /api/analytics/waste/top-items` endpoint that:
- Requires authentication
- Returns HTTP 401 if not authenticated
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter by station
  - `from` (optional, ISO date) - Start date (defaults to 30 days ago)
  - `to` (optional, ISO date) - End date (defaults to today)
  - `limit` (optional, integer, default 20, max 100) - Number of items to return
- Returns HTTP 403 if user is STAFF and queries a station other than their own
- Returns HTTP 200 with array of items:
  ```typescript
  Array<{
    item_id: string;
    item_name: string;
    station_id: string;
    station_name: string;
    category: string | null;
    unit: string;
    waste_data: {
      total_waste_lbs: number;
      total_quantity_wasted: number;
      entry_count: number;
    };
    production_data?: {
      total_produced_lbs: number;
      total_quantity_produced: number;
    };
    waste_rate?: number;       // waste_lbs / produced_lbs (only if production exists)
    is_high_waste: boolean;    // true if waste_rate > 0.25
  }>
  ```
- Sorted by `total_waste_lbs` descending
- Only calculates waste_rate if production data exists for the item in the date range

---

### Insights Engine Requirements

#### R6: Get Insights Endpoint
**THE SYSTEM SHALL** provide a `GET /api/insights` endpoint that:
- Requires authentication (MANAGER or ADMIN role)
- Returns HTTP 401 if not authenticated
- Returns HTTP 403 if user is STAFF
- Supports query parameters:
  - `station_id` (optional, UUID) - Filter insights by station
  - `category` (optional, enum) - Filter by insight category: `overproduction`, `timing`, `reason_pattern`, `reuse_opportunity`
- Returns HTTP 200 with insights object:
  ```typescript
  {
    generated_at: string;      // ISO timestamp
    period: {
      from: string;            // Last 30 days
      to: string;              // Today
    };
    insights: InsightItem[];
    reuse_opportunities: ReuseOpportunity[];
    summary: {
      total_insights: number;
      high_priority_count: number;
      estimated_weekly_savings_lbs: number;  // From reuse opportunities
    }
  }
  ```

#### R7: Insight Item Structure
**EACH** insight returned **SHALL** include:
```typescript
{
  id: string;                  // Unique identifier
  category: InsightCategory;   // overproduction | timing | reason_pattern | reuse_opportunity
  priority: "high" | "medium" | "low";
  title: string;               // Short headline
  explanation: string;         // Plain-language description with evidence
  affected_entity: {
    type: "station" | "item";
    id: string;
    name: string;
  };
  evidence: {                  // Specific numbers backing the insight
    [key: string]: number | string;
  };
  recommendation: string;      // Actionable advice
  estimated_impact_lbs?: number;  // Potential weekly reduction
}
```

#### R8: Overproduction Insight Rule
**THE SYSTEM SHALL** generate an overproduction insight when:
- An item's waste rate (waste_lbs / produced_lbs) exceeds 25%
- Calculated across the last 5 shifts where both waste AND production data exist
- Minimum 3 of 5 shifts must have data to be valid
- Priority = "high" if waste_rate > 40%, "medium" if 25-40%
- Evidence includes:
  - `waste_rate` (as percentage)
  - `total_waste_lbs` (last 5 shifts)
  - `total_produced_lbs` (last 5 shifts)
  - `shifts_analyzed` (count)
- Explanation format: "[Item name] at [Station name] has a waste rate of [X%] over the last [N] shifts, with [Y] lbs wasted out of [Z] lbs produced."
- Recommendation: "Reduce production quantity or improve portion control."

#### R9: Late Evening Spike Insight Rule
**THE SYSTEM SHALL** generate a late evening spike insight when:
- Over 40% of a station's waste (by weight) is logged after 8:00 PM
- Calculated across the last 14 days
- Uses `created_at` timestamp hour to determine timing
- Priority = "high" if > 60%, "medium" if 40-60%
- Evidence includes:
  - `after_8pm_percentage` (percentage)
  - `after_8pm_lbs` (weight)
  - `total_waste_lbs` (all hours)
  - `days_analyzed` (count)
- Explanation format: "[Station name] has [X%] of its waste ([Y] lbs out of [Z] lbs total) logged after 8 PM over the past [N] days."
- Recommendation: "Review evening production levels or adjust closing procedures to reduce late-shift waste."

#### R10: Dominant Reason Insight Rule
**THE SYSTEM SHALL** generate a dominant reason insight when:
- A single waste reason accounts for over 50% of waste weight at a station
- Calculated across the last 30 days
- Priority = "medium" if 50-70%, "high" if > 70%
- Evidence includes:
  - `dominant_reason` (enum value)
  - `reason_percentage` (percentage)
  - `reason_lbs` (weight for this reason)
  - `total_waste_lbs` (all reasons)
- Explanation format: "[Reason] is the dominant waste reason at [Station name], accounting for [X%] ([Y] lbs out of [Z] lbs) of waste over the past 30 days."
- Recommendation varies by reason:
  - OVERPRODUCTION: "Implement demand forecasting or reduce batch sizes."
  - EXPIRED: "Review holding times and implement FIFO procedures."
  - QUALITY: "Inspect preparation techniques and ingredient quality."
  - CONTAMINATION: "Reinforce food safety protocols and workspace organization."
  - TEMPERATURE_ABUSE: "Monitor hot-holding temperatures and service times."
  - OTHER: "Investigate specific causes and document patterns."

---

### Reuse Matcher Requirements

#### R11: Reuse Opportunities Structure
**THE SYSTEM SHALL** return reuse opportunities with:
```typescript
{
  id: string;
  rule_id: string;             // From reuse_rules table
  source: {
    station_id: string;
    station_name: string;
    item_id: string;
    item_name: string;
  };
  target: {
    station_id: string;
    station_name: string;
    suggested_use: string;     // From reuse_rules.target_use
  };
  opportunity_data: {
    avg_weekly_waste_lbs: number;    // Historical average
    estimated_diversion_lbs: number; // Conservative estimate (70% of avg)
    confidence_score: number;        // From reuse_rules or calculated
  };
  explanation: string;         // Plain-language description
  recommendation: string;      // How to implement the reuse
}
```

#### R12: Reuse Matcher Algorithm
**THE SYSTEM SHALL** implement a reuse matcher that:
- Queries active `reuse_rules` from the database
- For each rule, calculates average weekly waste for the source item (last 4 weeks)
- Only includes opportunities where avg weekly waste > 5 lbs (meaningful amount)
- Estimates 70% diversion rate (conservative estimate accounting for timing/quality)
- Calculates `estimated_diversion_lbs = avg_weekly_waste_lbs × 0.70`
- Sorts opportunities by `estimated_diversion_lbs` descending
- Returns top 10 opportunities

#### R13: Reuse Opportunity Explanation
**THE SYSTEM SHALL** generate explanations for reuse opportunities:
- Format: "[Source item] from [Source station] averages [X] lbs of waste per week. This could be redirected to [Target station] for [Target use], potentially diverting [Y] lbs weekly."
- Recommendation format: "Coordinate between [Source station] and [Target station] to transfer excess [Item] at [Time/condition]. Implement communication protocol for daily availability."

#### R14: Estimated Weekly Savings Calculation
**THE SYSTEM SHALL** calculate total estimated weekly savings:
- Sum of all `estimated_diversion_lbs` from reuse opportunities
- Included in insights summary as `estimated_weekly_savings_lbs`
- Represents total pounds that could be diverted from waste through reuse

---

### Data Requirements

#### R15: Production Data Integration
**WHEN** calculating waste rates, **THE SYSTEM SHALL**:
- Query production_logs for matching station_id, item_id, and date range
- Sum `weight_lbs` from production logs for denominator
- Sum `weight_lbs` from waste logs for numerator
- Calculate `waste_rate = waste_lbs / produced_lbs`
- Only calculate rate if `produced_lbs > 0`
- Return `null` or omit `waste_rate` field if no production data exists
- Round waste_rate to 4 decimal places (e.g., 0.2547 = 25.47%)

#### R16: Time-Based Analysis Windows
**THE SYSTEM SHALL** use the following time windows for analysis:
- Overproduction rule: Last 5 shifts (5 unique shift_dates)
- Late evening spike rule: Last 14 days (calendar days)
- Dominant reason rule: Last 30 days (calendar days)
- Reuse matcher: Last 4 weeks (28 days)
- All rules exclude soft-deleted logs (deleted_at IS NULL)

#### R17: Hour Extraction from Timestamps
**WHEN** analyzing timing patterns, **THE SYSTEM SHALL**:
- Use `created_at` timestamp from waste_logs
- Extract hour using database function or application logic
- Consider hour in local timezone (configured in environment)
- Define "after 8 PM" as hour >= 20 (24-hour format)

---

### Testing Requirements

#### R18: Overproduction Rule Unit Tests
**THE SYSTEM SHALL** include unit tests with fixtures for:
- ✅ Item with 30% waste rate over 5 shifts triggers medium priority insight
- ✅ Item with 45% waste rate over 5 shifts triggers high priority insight
- ✅ Item with 20% waste rate does not trigger insight (below threshold)
- ✅ Item with only 2 shifts of data does not trigger (insufficient data)
- ✅ Item with waste but no production data does not trigger (cannot calculate rate)
- ✅ Evidence includes correct waste_rate, total_waste_lbs, total_produced_lbs
- ✅ Explanation includes item name, station name, and percentage

#### R19: Late Evening Spike Rule Unit Tests
**THE SYSTEM SHALL** include unit tests with fixtures for:
- ✅ Station with 45% waste after 8 PM triggers medium priority insight
- ✅ Station with 65% waste after 8 PM triggers high priority insight
- ✅ Station with 30% waste after 8 PM does not trigger (below threshold)
- ✅ Evidence includes correct after_8pm_percentage, after_8pm_lbs, total_waste_lbs
- ✅ Explanation includes station name and percentage

#### R20: Dominant Reason Rule Unit Tests
**THE SYSTEM SHALL** include unit tests with fixtures for:
- ✅ Station with 55% OVERPRODUCTION waste triggers medium priority insight
- ✅ Station with 75% EXPIRED waste triggers high priority insight
- ✅ Station with 45% from any single reason does not trigger (below threshold)
- ✅ Evidence includes dominant_reason, reason_percentage, reason_lbs
- ✅ Explanation includes reason name, station name, and percentage
- ✅ Recommendation matches the specific reason

#### R21: Reuse Matcher Unit Tests
**THE SYSTEM SHALL** include unit tests with fixtures for:
- ✅ Active reuse rule with 20 lbs avg weekly waste generates opportunity
- ✅ Estimated diversion is 70% of average (14 lbs from 20 lbs avg)
- ✅ Reuse rule with < 5 lbs avg weekly waste is excluded
- ✅ Inactive reuse rule (is_active = false) is excluded
- ✅ Opportunities are sorted by estimated_diversion_lbs descending
- ✅ Top 10 limit is enforced
- ✅ Explanation includes source, target, and estimated pounds

#### R22: Waste Rate Calculation Tests
**THE SYSTEM SHALL** include unit tests for:
- ✅ waste_rate = waste_lbs / produced_lbs
- ✅ Waste rate rounds to 4 decimal places
- ✅ Waste rate is null when no production data exists
- ✅ Waste rate is null when produced_lbs = 0
- ✅ Multiple items calculate rates independently

#### R23: Analytics Endpoint Integration Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ GET /api/analytics/waste/summary returns correct totals
- ✅ Summary includes top items sorted by weight
- ✅ GET /api/analytics/waste/by-station returns daily breakdowns
- ✅ GET /api/analytics/waste/by-hour calculates hourly distribution
- ✅ Late evening spike detection works in by-hour endpoint
- ✅ GET /api/analytics/waste/by-reason groups by reason correctly
- ✅ Dominant reason is identified when over 50%
- ✅ GET /api/analytics/waste/top-items includes waste rates when production exists
- ✅ Staff users can only access their station analytics
- ✅ Manager and admin can access all station analytics

#### R24: Insights Endpoint Integration Tests
**THE SYSTEM SHALL** include Supertest tests for:
- ✅ GET /api/insights returns all insight categories
- ✅ Insights include evidence, explanation, and recommendation
- ✅ Reuse opportunities include estimated savings
- ✅ Summary totals are calculated correctly
- ✅ Staff users cannot access insights endpoint (403)
- ✅ Manager and admin can access insights
- ✅ Filtering by category works correctly
- ✅ Filtering by station_id works correctly

---

## Implementation Notes

### Service Layer Organization
Create services in `backend/src/services/`:
- `analytics.service.ts`:
  - `getWasteSummary(filters, user)` - Summary analytics
  - `getWasteByStation(filters, user)` - Station breakdown
  - `getWasteByHour(filters, user)` - Hourly distribution
  - `getWasteByReason(filters, user)` - Reason analysis
  - `getTopWasteItems(filters, user)` - Top items with rates
  - `calculateWasteRate(itemId, stationId, from, to)` - Waste rate helper

- `insights.engine.ts`:
  - `generateInsights(filters)` - Main orchestrator
  - `detectOverproduction(stationId?, dateRange)` - R8 rule
  - `detectLateEveningSpike(stationId?, dateRange)` - R9 rule
  - `detectDominantReason(stationId?, dateRange)` - R10 rule
  - `calculatePriority(metric, thresholds)` - Priority helper
  - `formatEvidence(data)` - Evidence formatter
  - `generateExplanation(template, data)` - Explanation builder

- `reuse.matcher.ts`:
  - `findReuseOpportunities(stationId?)` - Main matcher
  - `calculateAverageWeeklyWaste(itemId, stationId, weeks)` - Historical avg
  - `estimateDiversion(avgWaste, confidenceScore)` - Conservative estimate
  - `generateReuseExplanation(opportunity)` - Explanation builder

### Utilities
Create in `backend/src/utils/`:
- `analytics.utils.ts`:
  - `groupByDate(logs)` - Group logs by shift_date
  - `groupByHour(logs)` - Group logs by hour
  - `calculatePercentage(part, whole)` - Percentage helper
  - `extractHourFromTimestamp(timestamp, timezone)` - Hour extraction

### Constants
Create in `backend/src/constants/`:
- `insights.constants.ts`:
  - `OVERPRODUCTION_THRESHOLD = 0.25` (25%)
  - `LATE_EVENING_THRESHOLD = 0.40` (40%)
  - `DOMINANT_REASON_THRESHOLD = 0.50` (50%)
  - `LATE_EVENING_HOUR = 20` (8 PM)
  - `MIN_SHIFTS_FOR_OVERPRODUCTION = 3`
  - `REUSE_DIVERSION_RATE = 0.70` (70%)
  - `MIN_WEEKLY_WASTE_FOR_REUSE = 5` (lbs)

### Route Organization
Add routes in `backend/src/routes/`:
- `analytics.routes.ts` - Analytics endpoints
- `insights.routes.ts` - Insights endpoint

### Test Organization
Add tests in `backend/tests/`:
- `analytics.test.ts` - Analytics endpoints integration tests
- `insights.test.ts` - Insights endpoint integration tests
- `insights-rules.test.ts` - Unit tests for each insight rule
- `reuse-matcher.test.ts` - Unit tests for reuse matcher
- `fixtures/` directory:
  - `waste-logs.fixtures.ts` - Sample waste log data
  - `production-logs.fixtures.ts` - Sample production data
  - `reuse-rules.fixtures.ts` - Sample reuse rules

### Environment Configuration
Add to `backend/.env.example`:
```
TIMEZONE="America/New_York"
ANALYTICS_CACHE_TTL=300
```

---

## API Summary

### Analytics Endpoints (Manager/Admin + Staff with station restrictions)
- `GET /api/analytics/waste/summary` - Overall summary with top items
- `GET /api/analytics/waste/by-station` - Daily breakdown per station
- `GET /api/analytics/waste/by-hour` - Hourly distribution analysis
- `GET /api/analytics/waste/by-reason` - Reason and disposition breakdown
- `GET /api/analytics/waste/top-items` - Top items with waste rates

### Insights Endpoints (Manager/Admin only)
- `GET /api/insights` - Generate insights with reuse opportunities

---

## Success Criteria

1. ✅ All analytics endpoints return accurate calculations
2. ✅ Waste rates calculated correctly when production data exists
3. ✅ Overproduction insight triggers at 25% waste rate threshold
4. ✅ Late evening spike insight triggers at 40% after-8pm threshold
5. ✅ Dominant reason insight triggers at 50% single-reason threshold
6. ✅ All insights include evidence, explanation, and recommendation
7. ✅ Explanations are in plain language with specific numbers
8. ✅ Reuse matcher calculates weekly averages and estimates diversion
9. ✅ Reuse opportunities include estimated weekly pounds diverted
10. ✅ Each insight rule has unit tests with fixtures
11. ✅ All acceptance criteria have passing tests
12. ✅ Staff users can access analytics for their station only
13. ✅ Manager and admin users can access all insights
14. ✅ Test coverage is at least 85% for insights engine code

---

## Out of Scope
- Machine learning models for prediction
- Custom alert configuration
- Email/SMS notifications for insights
- Historical insight tracking
- Insight dismissal or acknowledgment
- Waste trend forecasting
- Benchmark comparisons across time periods
- Export of analytics data
- Custom report generation
- Real-time streaming analytics

---

## Dependencies
New packages required:
- `date-fns-tz` - Timezone-aware date handling

This should be added to `backend/package.json`.
