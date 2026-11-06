export type UserRole = 'buyer' | 'seller' | 'admin';

export type AuctionStatus = 'draft' | 'scheduled' | 'live' | 'sold' | 'unsold' | 'cancelled';

export type OrderStatus =
  | 'paid_in_escrow'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded';

export type HoldStatus = 'pending' | 'captured' | 'released' | 'expired';

export type LedgerEntryType =
  | 'top_up'
  | 'hold'
  | 'hold_release'
  | 'hold_capture'
  | 'escrow_in'
  | 'escrow_release'
  | 'payout'
  | 'fee'
  | 'refund';

export type NotificationType =
  | 'outbid'
  | 'auction_won'
  | 'auction_lost'
  | 'auction_ended'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_completed'
  | 'payment_received';

export const PLATFORM_FEE_PERCENT = 5;

export const BID_INCREMENT_TIERS = [
  { maxPrice: 100000, increment: 1000 },
  { maxPrice: 500000, increment: 5000 },
  { maxPrice: 2500000, increment: 10000 },
  { maxPrice: 10000000, increment: 50000 },
  { maxPrice: Infinity, increment: 100000 },
] as const;

export const ANTI_SNIPE_WINDOW_MS = 2 * 60 * 1000;
export const ANTI_SNIPE_EXTENSION_MS = 2 * 60 * 1000;
export const MAX_SNIPE_EXTENSIONS = 10;

export const HOLD_EXPIRY_MS = 60 * 1000;

export const MIN_AUCTION_DURATION_DAYS = 1;
export const MAX_AUCTION_DURATION_DAYS = 14;
export const MAX_AUCTION_IMAGES = 8;

export function calculateMinIncrement(currentPricePaise: bigint): bigint {
  for (const tier of BID_INCREMENT_TIERS) {
    if (currentPricePaise < BigInt(tier.maxPrice)) {
      return BigInt(tier.increment);
    }
  }
  return BigInt(100000);
}

export function moneyToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export function paiseToRupees(paise: bigint): number {
  return Number(paise) / 100;
}

export function formatPaise(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function generateIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

export * from './resilience.js';
