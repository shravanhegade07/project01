# Phase 6 Step 3 Implementation Plan: Observability & Monitoring

## 1. Prometheus Metrics
Implement OpenTelemetry / prom-client metrics across services:
- `bid_accept_latency_ms` (histogram)
- `bids_rejected_total{reason}` (counter)
- `outbox_lag_seconds` (gauge)
- `kafka_consumer_lag` (gauge)
- `ws_connections` (gauge)
- `holds_expired_total` (counter)
- `auctions_closed_total` (counter)
- `closer_batch_duration_ms` (histogram)

## 2. OpenTelemetry Distributed Tracing
- Carry W3C Trace Context (`traceparent` header) through all HTTP client/server calls.
- Propagate trace context in Kafka/Redpanda message headers (`traceparent`).
- Ensure single bid request traces across Gateway → Bidding → Wallet → Realtime.

## 3. Grafana Dashboards as Code (`infra/grafana/dashboards`)
Create JSON dashboard definitions for:
1. **Bidding Health**: Latency p95/p99, throughput (bids/s), rejection reasons, active auctions.
2. **Real-time Health**: Active WebSocket connections, socket drop rate, event broadcast lag.
3. **Money and Wallet**: Total wallet balance, held vs available, active holds, escrow value, ledger consistency.
4. **Broker & Outbox**: Outbox lag, publishing success rate, Kafka consumer lag per topic.

## 4. Prometheus Alert Rules (`infra/prometheus/alerts.yml`)
Configure alerting rules:
- `OutboxLagHigh`: outbox lag > 5s for 1m
- `KafkaConsumerLagGrowing`: consumer lag increasing for 2m
- `BidLatencyHigh`: bid p95 latency > 500ms
- `InvariantViolation`: any invariant check failure (`i1..i6` violation > 0)

## 5. Verification & Screenshots
- Inspect dashboards and trace visualization.
