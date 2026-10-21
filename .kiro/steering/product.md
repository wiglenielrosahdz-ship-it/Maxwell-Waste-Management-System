# Product Specification: Maxwell Waste Tracker

## Overview
Maxwell Waste Tracker is a web application designed to log and analyze evening food waste across multiple dining stations, providing actionable insights and waste reduction recommendations.

## Purpose
Track food waste per dining station to identify patterns, reduce waste, and enable cross-station resource reuse through data-driven recommendations.

## Dining Stations
- Pizza & Pasta
- Simply 3
- Cooked Vegetables
- Chicken/Meat

## User Roles
- **Staff**: Log waste data for their assigned dining station(s)
- **Managers**: View aggregated dashboard with analytics and recommendations
- **Admin**: Full system access, user management, and configuration

## Core Features

### Waste Logging (Staff)
- Log evening food waste per dining station
- All waste measurements normalized to pounds
- Simple, fast data entry interface
- Historical log viewing

### Manager Dashboard
- Merged data from all dining stations
- Visual analytics and trends
- Explainable recommendations for waste reduction
- Cross-station reuse matcher showing opportunities to redirect excess food

### Cross-Station Reuse Matcher
- Identifies surplus at one station that could be used at another
- Suggests reallocation opportunities before waste occurs
- Tracks successful reuse patterns

## Data Standards
- **All waste measurements must be in pounds**
- Consistent timestamp recording (evening shift)
- Station identification on every entry
- User attribution for accountability

## Success Metrics
- Reduction in total waste over time
- Increase in cross-station reuse
- Manager engagement with recommendations
- Staff logging compliance
