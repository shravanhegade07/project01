# ADR 004: Idempotency Key Uniqueness via Database Constraints

## Status
Accepted

## Context
Network retries and client client-side disconnects can result in duplicate bid or payment requests.

## Decision
Require an `Idempotency-Key` (UUID) for all mutating operations (bids, wallet top-ups, holds) backed by unique database indexes.
