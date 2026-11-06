# ADR 003: Transactional Outbox Pattern for Reliable Events

## Status
Accepted

## Context
Microservices must publish domain events reliably without dual-write inconsistency between database state changes and Kafka/Redpanda messaging.

## Decision
Implement the Transactional Outbox pattern where events are written to service-local `outbox` tables within the same database transaction as business mutations, and relayed asynchronously by background workers.
