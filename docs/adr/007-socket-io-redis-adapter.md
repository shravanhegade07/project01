# ADR 007: Socket.IO with Redis Adapter for Real-Time Push

## Status
Accepted

## Context
Real-time updates must reach all connected viewers across multiple scaled `realtime-service` replicas under 500ms.

## Decision
Use Socket.IO backed by the Redis adapter to broadcast events across horizontal service instances.
