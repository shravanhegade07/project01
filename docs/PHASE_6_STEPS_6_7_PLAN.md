# Phase 6 Implementation Plan: Kubernetes Deployment & Performance Tuning (Steps 6 & 7)

## Step 6: Kubernetes Deployment (`infra/k8s`)
- **Helm Charts**: Create modular Helm charts in `infra/k8s` for all 6 microservices (`api-gateway`, `core-service`, `bidding-service`, `wallet-service`, `realtime-service`, `worker`) and the Next.js web app.
- **Replicas & Scaling**: Configure 2–3 replicas for `bidding-service` and `realtime-service`.
- **Probes**: Configure liveness and readiness probes pointing to `/health` (`/readyz`/`/healthz`).
- **HPA**: Horizontal Pod Autoscaler based on CPU utilization and custom Kafka consumer lag metrics.
- **Migration Job**: Database migration Helm hook/job running before rolling updates.
- **Cluster Validation**: Deploy to local cluster, re-run k6 bid & socket load scenarios, kill a bidding pod mid-run, and verify invariant checker (I1–I6).

## Step 7: Performance Tuning
- **Data-Driven Optimization**: Analyze bottlenecks from load test (`docs/LOAD_TEST_REPORT.md`) and chaos reports.
- **Tuning Targets**:
  1. DB connection pool sizes & statement timeouts.
  2. Database indexes on hot paths (`auctions`, `bids`, `holds`, `wallets`).
  3. Redis pre-check hit rate optimization for bidding-service.
  4. Redpanda/Kafka partition counts (keyed by `auction_id`).
  5. Socket.IO ping/pong intervals and Redis adapter buffer settings.
- **Before & After Metrics**: Document performance delta and update `docs/LOAD_TEST_REPORT.md`.
