# Phase 6 Step 4 Implementation Plan: Load Testing with k6

## 1. Directory Structure (`tools/load-tests`)
- `tools/load-tests/seed.ts`: Seeds database with 200 live auctions and 2,000 funded users.
- `tools/load-tests/bid-load.js`: k6 script simulating 500 bids/s across 200 auctions, with hot-auction variant (20% traffic hitting 5 hot auctions).
- `tools/load-tests/socket-load.js`: k6 script simulating 10,000 concurrent Socket.IO connections subscribed to auction rooms.
- `tools/load-tests/run.sh`: Execution runner for the load test suite.

## 2. Performance Thresholds
- Bid p95 latency < 300 ms
- Live update p95 latency < 500 ms
- Error rate < 0.1% (excluding expected `BID_TOO_LOW` and `INSUFFICIENT_FUNDS`)

## 3. Execution & Reporting
- Run seed script.
- Run bid load test (normal + hot-auction variant).
- Run Socket.IO connection load test (10k connections).
- Run invariant checker (`tools/invariants`).
- Compile results into `docs/LOAD_TEST_REPORT.md` (results vs thresholds, per-auction max throughput, bottlenecks, metrics, honesty regarding failures without tuning).
