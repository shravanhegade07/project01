# ADR 008: Anti-Snipping Auction Time Extensions

## Status
Accepted

## Context
Bids placed in the final moments of an auction can unfairly prevent competing buyers from responding.

## Decision
Automatically extend auction end time by 2 minutes when a bid arrives within the final 2 minutes, up to a maximum of 10 extensions.
