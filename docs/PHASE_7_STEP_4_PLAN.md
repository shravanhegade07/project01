# Phase 7 Step 4 Implementation Plan: Admin Console (ADM-1 to ADM-4)

## 1. Access Control & Security
- Enforce `admin` role checking in both API Gateway JWT guard and core-service guards.
- Add comprehensive test suite proving non-admin requests receive HTTP 403 on every `/v1/admin/*` route.

## 2. Admin Console Features (`/admin`)
- **Users Management**: Search users, inspect profile details, suspend / unsuspend accounts with audit trail.
- **Listings Moderation**: Moderation queue, take down live auctions (cancels auction, releases all wallet holds, notifies bidders, writes `audit_log` entry).
- **Auction Inspector**: Deep dive into one auction showing bid timeline, current holds, ledger entries, and event trail (fetching cleanly across microservice APIs without cross-schema joins).
- **Runtime Configuration**: Edit platform fees, bid increments, and anti-sniping parameters via Redis config keys with validation and audit logging.
- **Platform Health**: Real-time service status dashboard with direct links to Grafana dashboards.

## 3. UI/UX Design
- Compact data tables paired with right-side detail drawers, matching BidGrid design tokens (warm background `#FAFAF7`, Inter typography, pill chips, 1px borders).
