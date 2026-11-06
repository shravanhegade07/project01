# ADR 001: PostgreSQL for CP Bids and Money

## Status
Accepted

## Context
BidGrid requires absolute consistency for bids, current pricing, order settlement, and wallet balances (CP behavior). No lost bids or double winners can be tolerated.

## Decision
Use PostgreSQL 16 with ACID transactions and row-level locking (`SELECT ... FOR UPDATE`) as the authoritative source of truth for all bidding and wallet transactions. Redis is used exclusively for fast pre-checks and caching (AP behavior).
