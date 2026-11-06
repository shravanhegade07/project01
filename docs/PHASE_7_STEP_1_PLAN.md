# Phase 7 Step 1 Implementation Plan: Proxy Bidding (Auto-Bidding)

## Wallet Hold Policy Proposal (Decision Required)
**Proposal**: Hold the **full private max amount** in the user's wallet immediately when a proxy bid is placed. 
- *Rationale*: Ensures auto-raises never fail due to lack of available funds during live auction surges. When the auction closes or outbid/replaced, unutilized holds or outbid holds are released back to available balance.

## Implementation Steps

### 1. Pure Resolution Function
- Implement `resolveProxyBids(state, newBid, proxies)` in `packages/contracts` (or bidding module) with zero I/O.
- Calculates automatic counter-bids according to eBay-style second-price auction mechanics.

### 2. Property-Based Tests (`fast-check`)
- Test invariants:
  - Winner is always the proxy with the highest max amount.
  - Current price is the smallest valid increment above the second-highest max (or starting price).
  - On equal max bids, the earlier proxy wins.
  - Price never exceeds the winner's max amount.
  - Deterministic execution across inputs.

### 3. API & Transaction Integration
- Endpoint: `PUT /v1/auctions/{id}/proxy-bid` (takes private max amount).
- Integrate into the bidding transaction under `SELECT FOR UPDATE` row lock:
  - Auto-raises execute in the same transaction.
  - Each auto-raise inserts a `bids` row with `is_proxy = true` and emits `bid.accepted`.

### 4. UI/UX Updates
- Add "Set maximum bid" option in the sticky bid panel.
- Display a private "Your maximum" chip visible only to the proxy bidder.

### 5. Verification
- Re-run concurrency test with proxy bids included.
- Execute `tools/invariants` (I1–I6) and verify absolute correctness.
