# Phase 6 Implementation Plan: Reliability & Invariant Checker (Steps 1 & 2)

## Step 1: Invariant Checker Tool (`tools/invariants`)
Implement an invariant checker script in TypeScript checking I1 through I6:
- **I1**: Bid sequence numbers (`seq`) are strictly contiguous per auction (1, 2, 3...).
- **I2**: `current_price` on `auction_live` equals the highest accepted bid amount.
- **I3**: Every closed auction has exactly one close event and at most one winner.
- **I4**: Sum of active wallet holds equals the sum of leaders' amounts across active auctions.
- **I5**: Wallet ledger entries sum match current wallet balances (available + held).
- **I6**: No accepted bid was placed after the auction's final `end_at`.

- Runnable as CLI (`npx tsx tools/invariants/check.ts`) returning exit code 1 on violation.
- Unit tests (`tools/invariants/checker.test.ts`) that deliberately break each invariant (I1–I6) and verify the checker catches them.

## Step 2: Resilience & Fault Tolerance
- **Circuit Breaker**: Implement a circuit breaker around bidding-service to wallet-service RPC/HTTP calls.
- **Timeouts**: Enforce strict timeouts on all network calls (HTTP & Kafka/Redpanda).
- **Retries with Jitter**: Exponential backoff and full jitter applied exclusively to idempotent calls (e.g. `POST /bids`, `POST /wallet/holds`).
- **Dead-Letter Topics (DLT)**: Configure DLT routing for poison messages in Kafka/Redpanda consumers.
- **Graceful Shutdown**: Fastify & NestJS graceful shutdown handling (stop accepting new requests, finish in-flight DB transactions, close connections).
- **Fault-Injection Test**: Test with broken consumer / failing wallet service to prove bids fail safe (rejected with appropriate error code, zero orphan holds).

## Execution
Run invariant checker at the end and display output.
