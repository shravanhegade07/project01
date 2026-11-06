# BidGrid Demo Script (10-Minute Walkthrough)

1. **Introduction & Architecture Overview (1 min)**:
   - Present the real-time distributed online auction system architecture.
   - Highlight CP consistency for bids/money and AP for browse/live feeds.

2. **User Authentication & Wallet Top-Up (2 mins)**:
   - Register Buyer and Seller accounts.
   - Top up Buyer wallet balance with ₹10,000.

3. **Listing Creation & Live Bidding (3 mins)**:
   - Seller creates a new auction item with starting price and schedule.
   - Buyer opens the auction in two browser sessions.
   - Place alternating bids and observe sub-500ms real-time price updates and winning/outbid status chips.

4. **Anti-Snipping & Settlement (2 mins)**:
   - Place a bid within the final 2 minutes to trigger anti-snipping countdown extension.
   - Allow auction to close; observe automated escrow order creation, shipment, and payout minus 5% platform fee.

5. **Chaos Resilience & Invariant Verification (2 mins)**:
   - Simulate sudden service interruption (kill bidding-service instance mid-auction).
   - Show automatic failover and reconnect.
   - Run `npx tsx tools/invariants/check.ts` to prove zero invariant violations (I1–I6).
