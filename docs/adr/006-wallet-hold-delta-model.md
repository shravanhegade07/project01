# ADR 006: Wallet Hold Delta Model and Expiry

## Status
Accepted

## Context
Bids require locked capital immediately upon placement. If a bid is outbid or rejected, funds must be released promptly.

## Decision
Use a hold system where bid amounts move from available to held balance with a 60-second automatic expiry and explicit release/capture workflows.
