# Phase 7 Implementation Plan: Search, Watchlist, Email Notifications & Settings (Steps 2 & 3)

## 1. Full-Text & Fuzzy Search (`GET /v1/auctions?q=`)
- **Database Indexing**: Enable `pg_trgm` extension and create GIN / GiST indexes with `tsvector` and trigram similarity on auctions (`title`, `description`).
- **Query Logic**: Combine full-text search with existing category, status, price filters, and sorting.
- **EXPLAIN Verification**: Provide query execution plan output demonstrating index scans on a simulated 100,000+ auction dataset.
- **UI**: Search bar with real-time suggestions and dedicated search results page.

## 2. Watchlist & Ending-Soon Alerts
- **API**: Add/remove watchlist endpoints (`POST /v1/watchlist`, `DELETE /v1/watchlist/{auctionId}`).
- **Worker Job**: Scheduled cron job identifying auctions ending in ~1 hour and creating in-app ending-soon notifications for watchers.
- **UI**: Heart button toggle on auction cards and detail view, dedicated `/watchlist` page with live countdowns.

## 3. Email Notification System
- **Provider Interface**: Abstraction layer for email delivery (`EmailProvider`), with Mailpit integration for local development.
- **Events**: Automated dispatch for outbid, auction won, auction lost, and order updates.
- **Idempotency**: Track sent notifications/emails in database tables to guarantee idempotency against replayed domain events.
- **User Settings**: Notification preferences page (`/settings`).

## 4. Testing
- Unit and integration tests for search, watchlist, and email dispatch.
- Playwright E2E test covering: Search → Watch → Ending-Soon Alert flow.
