# BidGrid: Distributed Online Auction System

BidGrid is a real-time, high-performance distributed online auction marketplace built with TypeScript, NestJS, Next.js 15, PostgreSQL, Redis, and Redpanda (Kafka API). It guarantees strong consistency for bids and money (CP) and eventual consistency for browse and live feeds (AP), ensuring zero lost bids, no double winners, and no double charges.

---

## Architecture

```
[ Next.js 15 Web App ] ---> [ API Gateway (NestJS/Fastify) ]
                                      |
       +------------------------------+------------------------------+
       |                              |                              |
[ Core Service ]              [ Bidding Service ]            [ Wallet Service ]
  (Auth, Users,                 (Live State, Bids,             (Wallets, Holds,
   Listings, Orders)             Row Locks, Anti-Snipe)         Escrow, Ledger)
       |                              |                              |
       +------------------------------+------------------------------+
                                      |
                             [ Realtime Service ] ---> (Socket.IO Clients)
                                      |
                                [ Workers ] ---> (Outbox Relay, Closer, DLT)
```

---

## Quick Start (Docker Compose)

1. Clone the repository and copy environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Start the entire stack with Docker Compose:
   ```bash
   docker compose up -d
   ```

3. Open the web application at **http://localhost:3010**.

---

## Running Tests & Verification

- **Unit & Integration Tests**:
  ```bash
  npm test
  ```
- **Invariant Checker**:
  ```bash
  npx tsx tools/invariants/check.ts
  ```
- **Load Testing (k6)**:
  ```bash
  k6 run tools/load-tests/bid-load.js
  ```
- **Chaos Testing**:
  ```bash
  npx tsx tools/chaos/chaos-runner.ts
  ```

---

## Key Technical Decisions & Invariants
- **Database Row Serialization**: Postgres `SELECT ... FOR UPDATE` serializes bids per auction.
- **Idempotency**: Enforced via unique database constraints on `(bidder_id, idempotency_key)`.
- **Invariants I1–I6**: Verified continuously via the invariant checker tool (`tools/invariants`).
