# ADR 009: OpenTelemetry Distributed Tracing

## Status
Accepted

## Context
Tracing asynchronous event flows and synchronous RPCs across multiple microservices is critical for debugging latency and failures.

## Decision
Adopt OpenTelemetry SDKs with W3C trace context propagation across HTTP headers and Kafka message metadata.
