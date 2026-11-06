# BidGrid Verification Plan (Phases 0 - 5)

## Objectives
Perform rigorous verification of the BidGrid distributed online auction system across infrastructure, concurrency, idempotency, invariants, real-time updates, settlement, and edge cases.

## Verification Steps

### Step 1: Infrastructure & Health Checks
- Clean start: `docker compose down -v && docker compose up -d`
- Verify health endpoints (`/health` or `/readyz`) for:
  - `postgres`
  - `redis`
  - `redpanda`
  - `minio`
  - `api-gateway` (port 3000)
  - `core-service` (port 3001)
  - `bidding-service` (port 3002)
  - `wallet-service` (port 3003)
  - `realtime-service` (port 3004)
  - `worker` (port 3005)

### Step 2: Test Suite Execution
- Run unit tests (`vitest run`) across all shared packages and services.
- Run integration tests (Testcontainers with Postgres & Redis).
- Run Playwright E2E tests.
- Report pass/fail counts.

### Step 3: Concurrency Test (1,000 bids / 50 users / 3 instances)
- Spin up 3 instances of `bidding-service`.
- Simulate 1,000 concurrent bids across 50 users on a single active auction.
- Verify Invariants:
  1. Bid sequence numbers (`seq`) are strictly contiguous starting at 1.
  2. `current_price` equals the highest accepted bid amount.
  3. No bid accepted after `end_at`.
  4. Active holds equal the sum of current leaders' amounts.

### Step 4: Idempotency Test
- Send 5 identical bid requests with the exact same `Idempotency-Key`.
- Confirm HTTP 201 on the first and idempotent success on subsequent calls.
- Verify in database: exactly 1 bid record and 1 wallet hold record exist.

### Step 5: Real-time & Browser Verification (Playwright)
- Open two browser sessions with different user accounts.
- Navigate to active auction.
- Place alternating live bids.
- Verify sub-500ms WebSocket price flash & outbid notification.
- Simulate socket disconnect / reconnect with banner and resync.
- Capture screenshot artifacts.

### Step 6: Auction Lifecycle & Settlement
- Run one auction to completion where reserve is met (Sold -> Escrow -> Shipped -> Completed -> Payout minus 5% fee).
- Run one auction to completion where reserve is NOT met (Unsold -> All holds released).
- Reconcile and inspect final wallet ledgers for buyer, seller, and platform fee.

### Step 7: Final Report Generation
- Compile all results into `docs/VERIFICATION_REPORT.md`.
