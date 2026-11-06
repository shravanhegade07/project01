# ADR 002: Redis for AP Caching and Fast Pre-Checks

## Status
Accepted

## Context
High-frequency read queries and pre-validation checks for active auctions need sub-millisecond response times.

## Decision
Use Redis 7 for caching auction live state and rate-limiting buckets, treating it as ephemeral and secondary to PostgreSQL.
