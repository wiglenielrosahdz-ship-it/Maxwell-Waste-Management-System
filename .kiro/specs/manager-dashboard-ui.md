# Spec: Manager Dashboard and Insights Page

## Overview
Build a comprehensive dashboard for managers and admins to visualize waste data, view insights, and export reports. The interface provides filtering, KPIs, multiple chart types, and actionable recommendations with full accessibility support.

## Goals
1. Provide intuitive filtering by date range and station
2. Display key performance indicators at a glance
3. Visualize waste patterns through multiple chart types
4. Present insights and recommendations in priority order
5. Enable cross-station reuse with food safety considerations
6. Support CSV export for external analysis
7. Ensure full accessibility with text alternatives for charts

---

## Requirements (EARS Format)

### Page Structure and Access

#### R1: Dashboard Route and Access
**THE SYSTEM SHALL** provide a dashboard route at `/dashboard` that:
- Requires authentication (redirect to login if not authenticated)
- Is accessible to MANAGER and ADMIN roles only
- Redirects STAFF users to `/dashboard/my-station` (out of scope for this spec)
- Displays "Manager Dashboard" as the page title
- Shows user name and role in header navigation

#### R2: Page Layout Structure
**THE SYSTEM SHALL** organize the dashboard in the following layout:
```
┌─────────────────────────────────────────────────┐
│ Header (Logo, Title, User Menu, Logout)        │
├─────────────────────────────────────────────────┤
│ Filters Row (Date Range, Station, Export)      │
├─────────────────────────────────────────────────┤
│ KPI Cards (4 cards in a row)                   │
├─────────────────────────────────────────────────┤
│ Charts Row 1                                     │
│ ┌──────────────────┐ ┌─────────────────────┐  │
│ │ Station Bar      │ │ Hourly Line Chart   │  │
│ │ Chart            │ │                      │  │
│ └──────────────────┘ └─────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Charts Row 2                                     │
│ ┌──────────────────┐ ┌─────────────────────┐  │
│ │ Reason Donut     │ │ Top Items Table     │  │
│ │ Chart            │ │                      │  │
│ └──────────────────┘ └─────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Insights and Recommendations Panel              │
│ ┌─────────────────────────────────────────────┐│
│ │ Insights List with Priority Badges          ││
│ └─────────────────────────────────────────────┘│
├─────────────────────────────────────────────────┤
│ Reuse Opportunities Section                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │ Reuse   │ │ Reuse   │ │ Reuse   │          │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │          │
│ └─────────┘ └─────────┘ └─────────┘          │
└─────────────────────────────────────────────────┘
```
- Responsive layout: stacks vertically on mobile/tablet
- Uses Tailwind CSS for styling
- Consistent spacing and padding throughout

---

### Filters Section

#### R3: Date Range Filter
**THE SYSTEM SHALL** provide a date range filter that:
- Displays "From" and "To" date inputs
- Defaults to last 30 days (from = 30 days ago, to = today)
- Uses native date input or a date picker component
- Validates that "From" is not after "To"
- Shows error message if invalid range selected
- Updates all dashboard data when changed
- Persists selection in URL query parameters
- Maximum range allowed: 365 days

#### R4: Station Filter
**THE SYSTEM SHALL** provide a station filter that:
- Displays a dropdown/select component
- Fetches stations from `GET /api/stations`
- Shows "All Stations" as default option
- Lists all active stations by name (alphabetically)
- Updates all dashboard data when changed
- Persists selection in URL query parameters
- Shows station code in parentheses (e.g., "Pizza & Pasta (PIZZA_PASTA)")

#### R5: Apply and Reset Buttons
**THE SYSTEM SHALL** provide filter control buttons:
- "Apply Filters" button - Triggers data refresh with current filter values
- "Reset" button - Resets to default values (last 30 days, all stations)
- "Apply Filters" is primary styled (blue background)
- "Reset" is secondary styled (gray outline)
- Both buttons have appropriate loading states
- Keyboard accessible with tab navigation

#### R6: CSV Export Button
**THE SYSTEM SHALL** provide an export button that:
- Displays "Export CSV" with download icon
- Is positioned in the filters row (right-aligned)
- Generates CSV file with current filter settings
- CSV includes: date, station, item, quantity, weight_lbs, reason, disposition
- Filename format: `waste-export-{from}-{to}.csv`
- Shows loading spinner while generating
- Triggers browser download when ready
- Uses summary data from `GET /api/analytics/waste/summary`

---

### KPI Cards Section

#### R7: KPI Cards Data Source
**THE SYSTEM SHALL** fetch KPI data from:
- `GET /api/analytics/waste/summary?from={from}&to={to}&station_id={station_id}`
- Displays loading skeleton while fetching
- Shows error message if request fails with retry button

#### R8: Total Waste KPI Card
**THE SYSTEM SHALL** display a KPI card showing:
- Label: "Total Waste"
- Value: `total_waste_lbs` from summary API, formatted with comma separator
- Unit: "lbs"
- Icon: Trash bin icon
- Background: Light red tint
- Font: Large bold number (text-4xl)

#### R9: Average Per Shift KPI Card
**THE SYSTEM SHALL** display a KPI card showing:
- Label: "Avg. Per Shift"
- Value: `avg_waste_per_shift` from summary API
- Unit: "lbs/shift"
- Icon: Calendar icon
- Background: Light blue tint
- Font: Large bold number (text-4xl)
- Rounded to 1 decimal place

#### R10: Total Entries KPI Card
**THE SYSTEM SHALL** display a KPI card showing:
- Label: "Waste Entries"
- Value: `total_entries` from summary API, formatted with comma separator
- Icon: Document list icon
- Background: Light green tint
- Font: Large bold number (text-4xl)

#### R11: Stations Affected KPI Card
**THE SYSTEM SHALL** display a KPI card showing:
- Label: "Stations Affected"
- Value: Count of stations in `stations_summary` array
- Icon: Building/location icon
- Background: Light purple tint
- Font: Large bold number (text-4xl)
- Shows "1 Station" if filtered, or count of stations with waste if "All Stations"

---

### Charts Section

#### R12: Station Bar Chart
**THE SYSTEM SHALL** display a bar chart that:
- Title: "Waste by Station"
- Fetches data from `GET /api/analytics/waste/by-station?from={from}&to={to}`
- Uses Recharts `BarChart` component
- X-axis: Station names
- Y-axis: Total waste (lbs)
- Bars colored by station (use consistent color palette)
- Shows tooltips on hover with station name and exact weight
- Responsive width (100% of container)
- Fixed height: 300px
- Shows "No data available" message if empty

#### R13: Station Bar Chart Accessibility
**THE SYSTEM SHALL** provide text alternative for bar chart:
- Visually hidden `<table>` below chart for screen readers
- Table has `aria-label="Waste by station data table"`
- Includes columns: Station, Total Waste (lbs), Percentage of Total
- Can be made visible with "Show Data Table" toggle button
- Toggle button positioned below chart

#### R14: Hourly Line Chart
**THE SYSTEM SHALL** display a line chart that:
- Title: "Waste by Hour of Day"
- Fetches data from `GET /api/analytics/waste/by-hour?from={from}&to={to}&station_id={station_id}`
- Uses Recharts `LineChart` component
- X-axis: Hour (0-23, formatted as "12 AM", "1 AM", ... "11 PM")
- Y-axis: Total waste (lbs)
- Line color: Blue gradient
- Shows dot markers on each data point
- Shows tooltips on hover with hour and weight
- Highlights 8 PM marker with vertical dashed line if late evening spike detected
- Responsive width (100% of container)
- Fixed height: 300px
- Shows "No data available" message if empty

#### R15: Hourly Line Chart Accessibility
**THE SYSTEM SHALL** provide text alternative for line chart:
- Visually hidden `<table>` below chart for screen readers
- Table has `aria-label="Waste by hour data table"`
- Includes columns: Hour, Total Waste (lbs), Percentage of Total
- Can be made visible with "Show Data Table" toggle button
- Toggle button positioned below chart

#### R16: Reason Donut Chart
**THE SYSTEM SHALL** display a donut chart that:
- Title: "Waste by Reason"
- Fetches data from `GET /api/analytics/waste/by-reason?from={from}&to={to}&station_id={station_id}`
- Uses Recharts `PieChart` with inner radius (donut shape)
- Each slice represents a waste reason
- Slices colored with distinct colors from palette
- Shows legend with reason names and percentages
- Shows tooltips on hover with reason, weight, and percentage
- Center text shows total waste in lbs
- Responsive width (100% of container)
- Fixed height: 300px
- Shows "No data available" message if empty

#### R17: Reason Donut Chart Accessibility
**THE SYSTEM SHALL** provide text alternative for donut chart:
- Visually hidden `<list>` below chart for screen readers
- List has `aria-label="Waste by reason data list"`
- Each item format: "[Reason]: [X] lbs ([Y]%)"
- Can be made visible with "Show Data Table" toggle button
- Toggle button positioned below chart

#### R18: Top Items Table
**THE SYSTEM SHALL** display a table that:
- Title: "Top Waste Items"
- Fetches data from `GET /api/analytics/waste/top-items?from={from}&to={to}&station_id={station_id}&limit=10`
- Columns:
  1. Rank (1-10)
  2. Item Name
  3. Station Name
  4. Total Waste (lbs)
  5. Waste Rate (%) - Only if production data exists
- Rows sorted by total waste descending (pre-sorted by API)
- Waste rate displayed as badge:
  - Red badge if > 25% (high waste)
  - Yellow badge if 15-25% (medium waste)
  - Green badge if < 15% (low waste)
  - Gray "N/A" if no production data
- Responsive: scrollable on mobile
- Maximum height: 400px with vertical scroll
- Shows "No items found" message if empty

#### R19: Top Items Table Accessibility
**THE SYSTEM SHALL** ensure table accessibility:
- Use semantic `<table>` element
- Include `<thead>` with `<th>` elements
- Each header has `scope="col"` attribute
- Table has `aria-label="Top waste items"`
- Keyboard navigable
- High contrast for text

---

### Insights Panel Section

#### R20: Insights Panel Data Source
**THE SYSTEM SHALL** fetch insights from:
- `GET /api/insights?station_id={station_id}`
- Displays loading skeleton while fetching
- Shows "No insights available" message if empty array returned
- Shows error message if request fails with retry button

#### R21: Insights Panel Structure
**THE SYSTEM SHALL** display insights panel with:
- Title: "Insights & Recommendations"
- Summary bar showing:
  - Total insights count
  - High priority count (red badge)
  - Estimated weekly savings (if reuse opportunities exist)
- List of insight cards sorted by priority (high → medium → low)
- Maximum 10 insights displayed
- "Show More" button if more than 10 insights

#### R22: Insight Card Component
**EACH** insight card **SHALL** display:
- Priority badge (top-left):
  - "HIGH" - Red background
  - "MEDIUM" - Yellow background
  - "LOW" - Green background
- Category icon (based on insight category)
- Title (bold, large text)
- Explanation (full text with evidence numbers)
- Affected entity (station or item name with icon)
- Recommendation (in distinct color box)
- Estimated impact (if available): "Potential reduction: X lbs/week"
- Expand/collapse toggle for long explanations (>200 chars)

#### R23: Insight Card Interactivity
**THE SYSTEM SHALL** provide insight card interactions:
- Hover effect: subtle shadow and scale
- Click to expand/collapse full details
- "Dismiss" button (icon only, top-right) - Local state only, does not persist
- Keyboard accessible (tab, enter, escape)
- Focus visible styles

#### R24: Empty Insights State
**WHEN** no insights are available, **THE SYSTEM SHALL** display:
- Illustration or icon (checkmark or trophy)
- Message: "Great work! No major issues detected."
- Subtext: "Your waste levels are within expected ranges for the selected period."
- Green/positive styling

---

### Reuse Opportunities Section

#### R25: Reuse Opportunities Data Source
**THE SYSTEM SHALL** display reuse opportunities from:
- `reuse_opportunities` array from `GET /api/insights` response
- Displays loading skeleton while fetching
- Shows "No reuse opportunities found" if empty array
- Maximum 6 opportunity cards displayed
- Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile

#### R26: Reuse Opportunity Card Component
**EACH** reuse opportunity card **SHALL** display:
- Title: "[Source item] → [Target station]"
- Source section:
  - Station name with icon
  - Item name
  - "Average waste: X lbs/week"
- Arrow icon indicating direction
- Target section:
  - Station name with icon
  - "Suggested use: [target use]"
- Estimated impact:
  - "Potential diversion: X lbs/week"
  - Displayed prominently with green styling
- Explanation text (collapsible)
- Recommendation text

#### R27: Food Safety Confirmation Note
**EACH** reuse opportunity card **SHALL** include:
- Warning banner (yellow/amber background) at bottom of card
- Icon: Alert/warning icon
- Text: "⚠️ Food Safety Reminder: Ensure proper temperature control, labeling, and handling procedures when transferring food between stations. Verify food safety compliance before implementing any reuse."
- Font size: Small but readable
- Always visible (not collapsible)

#### R28: Reuse Card Interactivity
**THE SYSTEM SHALL** provide reuse card interactions:
- Hover effect: subtle shadow
- "Learn More" button to expand full explanation
- "Mark as Implemented" button (optional feature, updates local state only)
- Keyboard accessible
- Focus visible styles

---

### Loading and Error States

#### R29: Loading States
**WHILE** data is loading, **THE SYSTEM SHALL** display:
- Skeleton loaders for KPI cards (pulsing gray rectangles)
- Skeleton loaders for charts (pulsing gray chart shapes)
- Skeleton loaders for tables (pulsing rows)
- "Loading insights..." text in insights panel
- Spinner icon with "Loading..." text for initial page load
- Filters remain interactive during data loading

#### R30: Error States
**WHEN** API requests fail, **THE SYSTEM SHALL** display:
- Error message in red alert box
- Specific error text: "Failed to load [component name]"
- "Retry" button to attempt request again
- Console logging of full error details (for debugging)
- Other dashboard sections continue to display if their data loaded successfully
- Toast notification for non-critical errors

#### R31: Empty States
**WHEN** no data is available, **THE SYSTEM SHALL** display:
- Appropriate empty state message for each component
- Illustration or icon indicating no data
- Suggestion text: "Try adjusting your filters or date range"
- Components maintain their layout structure (no collapse)

---

### Data Management and Performance

#### R32: API Request Orchestration
**THE SYSTEM SHALL** manage API requests with:
- TanStack Query for data fetching and caching
- Query keys include filter parameters
- Stale time: 5 minutes (data refetches after 5 min)
- Cache time: 10 minutes
- Automatic refetch on window focus (optional, can disable)
- Retry failed requests up to 2 times with exponential backoff

#### R33: Filter State Management
**THE SYSTEM SHALL** manage filter state with:
- URL query parameters for shareable links
- Format: `?from=2024-01-01&to=2024-01-31&station_id=abc-123`
- Parse query params on mount to set initial state
- Update URL when filters change (without page reload)
- Browser back/forward buttons work correctly

#### R34: CSV Export Implementation
**WHEN** user clicks "Export CSV", **THE SYSTEM SHALL**:
- Fetch all waste logs using current filters (no pagination limit)
- Transform data to CSV format with headers
- Columns: Date, Station, Item, Quantity, Weight (lbs), Reason, Disposition, Notes
- Generate blob with `text/csv` MIME type
- Create temporary download link and trigger click
- Filename: `waste-export-{from}-{to}.csv`
- Show success toast: "Export complete"
- Show error toast if export fails

---

### Accessibility Requirements

#### R35: Keyboard Navigation
**THE SYSTEM SHALL** ensure full keyboard accessibility:
- All interactive elements are keyboard accessible (tab order)
- Focus indicators visible on all interactive elements
- Skip links to main content sections
- Escape key closes modals and expanded elements
- Enter/Space activates buttons and toggles
- Arrow keys navigate through chart data points (if supported by library)

#### R36: Screen Reader Support
**THE SYSTEM SHALL** provide screen reader support:
- Semantic HTML elements (`<main>`, `<section>`, `<article>`, `<nav>`)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content updates
- Chart text alternatives (data tables)
- Meaningful alt text for all icons and images
- Form labels associated with inputs

#### R37: Visual Accessibility
**THE SYSTEM SHALL** meet visual accessibility standards:
- WCAG AA color contrast ratios (4.5:1 for text)
- Color is not the only means of conveying information
- Text size minimum 16px for body text
- Interactive elements minimum 44×44px touch targets
- Focus indicators have 3:1 contrast ratio
- No content flashes more than 3 times per second

#### R38: Responsive Design
**THE SYSTEM SHALL** be responsive across devices:
- Mobile: 320px minimum width
- Tablet: 768px and up
- Desktop: 1024px and up
- Charts scale appropriately
- Tables scroll horizontally on mobile
- Touch-friendly tap targets on mobile
- Grid layouts stack vertically on smaller screens

---

### Testing Requirements

#### R39: Component Testing
**THE SYSTEM SHALL** include Vitest tests for:
- ✅ KPI cards render with correct values
- ✅ KPI cards show loading state
- ✅ KPI cards handle missing data gracefully
- ✅ Date range filter validates correctly
- ✅ Date range filter rejects invalid ranges
- ✅ Station filter populates from API
- ✅ Charts render with mock data
- ✅ Charts show empty state when no data
- ✅ Top items table sorts correctly
- ✅ Insights panel displays cards in priority order
- ✅ Reuse cards include food safety note
- ✅ CSV export generates correct format

#### R40: Integration Testing
**THE SYSTEM SHALL** include integration tests for:
- ✅ Dashboard loads with default filters
- ✅ Changing filters updates all components
- ✅ URL query params set initial filter state
- ✅ URL updates when filters change
- ✅ All API endpoints called with correct parameters
- ✅ Error states display when API fails
- ✅ Retry button refetches data

#### R41: Accessibility Testing
**THE SYSTEM SHALL** verify accessibility with:
- ✅ Keyboard navigation works for all interactions
- ✅ Screen reader announcements tested with NVDA/JAWS
- ✅ Color contrast meets WCAG AA standards
- ✅ Chart text alternatives are present
- ✅ All form inputs have labels
- ✅ Focus indicators are visible

---

## Implementation Notes

### Component Structure
Organize in `frontend/src/`:
```
components/
  dashboard/
    DashboardLayout.tsx
    FiltersBar.tsx
    KPICard.tsx
    StationBarChart.tsx
    HourlyLineChart.tsx
    ReasonDonutChart.tsx
    TopItemsTable.tsx
    InsightsPanel.tsx
    InsightCard.tsx
    ReuseOpportunityCard.tsx
    ChartTextAlternative.tsx
    ExportButton.tsx
pages/
  Dashboard.tsx
hooks/
  useDashboardData.ts
  useWasteSummary.ts
  useWasteByStation.ts
  useWasteByHour.ts
  useWasteByReason.ts
  useTopItems.ts
  useInsights.ts
utils/
  formatters.ts          # Number, date formatting
  chartHelpers.ts        # Chart data transformations
  csvExport.ts           # CSV generation
types/
  dashboard.types.ts     # TypeScript interfaces
```

### API Hook Examples
```typescript
// useDashboardData.ts
export function useWasteSummary(from: string, to: string, stationId?: string) {
  return useQuery({
    queryKey: ['waste-summary', from, to, stationId],
    queryFn: () => api.get('/api/analytics/waste/summary', { params: { from, to, station_id: stationId } }),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Chart Configuration
- Use consistent color palette across all charts
- Tailwind colors: blue-500, green-500, yellow-500, red-500, purple-500
- Recharts responsive container wrapper
- Custom tooltip styling to match design system

### CSV Export Utility
```typescript
// csvExport.ts
export function generateWasteCSV(data: WasteLog[]): string {
  const headers = ['Date', 'Station', 'Item', 'Quantity', 'Weight (lbs)', 'Reason', 'Disposition', 'Notes'];
  const rows = data.map(log => [
    log.shift_date,
    log.station_name,
    log.item_name,
    log.quantity,
    log.weight_lbs,
    log.reason,
    log.disposition || '',
    log.notes || ''
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
```

### URL State Management
```typescript
// Use react-router or next.js router
const [searchParams, setSearchParams] = useSearchParams();

// Read on mount
const from = searchParams.get('from') || defaultFrom;

// Update on change
const handleFilterChange = (filters) => {
  setSearchParams({ from: filters.from, to: filters.to, station_id: filters.stationId });
};
```

---

## API Endpoints Used

This dashboard **ONLY** consumes the following documented APIs:

### Authentication
- Current user context (from auth token)

### Stations (for filter dropdown)
- `GET /api/stations`

### Analytics
- `GET /api/analytics/waste/summary`
- `GET /api/analytics/waste/by-station`
- `GET /api/analytics/waste/by-hour`
- `GET /api/analytics/waste/by-reason`
- `GET /api/analytics/waste/top-items`

### Insights
- `GET /api/insights`

---

## Success Criteria

1. ✅ Dashboard loads within 2 seconds on average connection
2. ✅ All charts render correctly with real data
3. ✅ Filters update all components when changed
4. ✅ URL query params enable shareable links
5. ✅ CSV export generates valid CSV file
6. ✅ KPI cards display accurate calculations
7. ✅ Insights are ranked by priority correctly
8. ✅ Reuse cards include food safety warning
9. ✅ All charts have text alternatives
10. ✅ Keyboard navigation works for all interactions
11. ✅ Screen reader can access all content
12. ✅ Color contrast meets WCAG AA standards
13. ✅ Responsive design works on mobile, tablet, desktop
14. ✅ Loading and error states display appropriately
15. ✅ Component test coverage is at least 80%

---

## Out of Scope

- Real-time data updates (WebSocket)
- Custom dashboard configuration/layout
- Saving custom filter presets
- Email/PDF report generation
- Drill-down to individual waste logs from charts
- Chart type selection (bar vs line, etc.)
- Multi-station comparison overlays
- Predictive analytics or forecasting
- Alert configuration
- Insight acknowledgment/dismissal persistence
- Mobile native app

---

## Dependencies

New packages required:
- `recharts` - Chart library
- `date-fns` - Date formatting and manipulation
- `@tanstack/react-query` - Data fetching (already in stack)
- `react-router-dom` - Routing with URL params (if not already present)
- `@heroicons/react` - Icons

Add to `frontend/package.json`.
