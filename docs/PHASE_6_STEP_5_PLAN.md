# Phase 6 Step 5 Implementation Plan: Chaos Engineering & Fault Tolerance Testing

## 1. Directory Structure (`tools/chaos`)
- `tools/chaos/chaos-runner.ts`: Chaos orchestration script that executes fault injections while load tests are active.
- `tools/chaos/faults.ts`: Individual fault action definitions (kill service, restart container, block ports).

## 2. Fault Injection Scenarios
1. **Kill Bidding Service Instance**: Terminate one of the active bidding-service containers/processes and restart it after 5s.
2. **Kill Wallet Service**: Take down wallet-service for 20s to test circuit breaker and fail-safe bid rejection.
3. **Kill Realtime Service**: Stop realtime-service and verify client reconnection and state resync.
4. **Restart Redpanda (Kafka)**: Restart broker and verify outbox relay resume and at-least-once delivery.
5. **Restart Redis**: Flush/restart Redis cache and verify transparent fallback to PostgreSQL source of truth.
6. **Restart Postgres (Brief)**: Quick restart of database container to test connection pooling recovery and transaction isolation.

## 3. Metrics & Invariant Checks
- Record time to recover, failed request counts, client reconnect/resync success.
- Execute `tools/invariants` post-chaos.
- Assert zero invariant violations (I1–I6) and verify no orphan holds remain.

## 4. Reporting (`docs/CHAOS_REPORT.md`)
- Detailed table documenting: Fault, Impact, Recovery Time, and Invariant Result.
