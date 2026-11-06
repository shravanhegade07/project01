# ADR 005: SELECT FOR UPDATE Row Locking for Bids

## Status
Accepted

## Context
Concurrent bids on the same auction must be serialized to prevent race conditions and ensure correct sequence numbering.

## Decision
Use `SELECT ... FOR UPDATE` on `auction_live` rows during bid placement transactions.
