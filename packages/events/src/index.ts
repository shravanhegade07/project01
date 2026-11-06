export const EventTypes = {
  AUCTION_PUBLISHED: 'auction.published',
  AUCTION_STARTED: 'auction.started',
  AUCTION_EXTENDED: 'auction.extended',
  AUCTION_CLOSED: 'auction.closed',
  BID_ACCEPTED: 'bid.accepted',
  BID_REJECTED: 'bid.rejected',
  PAYMENT_CAPTURED: 'payment.captured',
  ESCROW_RELEASED: 'escrow.released',
  ORDER_CREATED: 'order.created',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_COMPLETED: 'order.completed',
  HOLD_CREATED: 'hold.created',
  HOLD_RELEASED: 'hold.released',
  HOLD_CAPTURED: 'hold.captured',
  HOLD_EXPIRED: 'hold.expired',
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export const EventTopics = {
  AUCTIONS: 'bidgrid.auctions',
  BIDS: 'bidgrid.bids',
  WALLET: 'bidgrid.wallet',
  ORDERS: 'bidgrid.orders',
  USERS: 'bidgrid.users',
  NOTIFICATIONS: 'bidgrid.notifications',
} as const;

export interface DomainEvent<T = unknown> {
  id: string;
  type: EventType;
  aggregateId: string;
  aggregateType: string;
  payload: T;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
    timestamp: string;
  };
  version: number;
}

export interface OutboxEntry {
  id: string;
  topic: string;
  partitionKey: string;
  event: DomainEvent;
  createdAt: Date;
  publishedAt: Date | null;
  retryCount: number;
}

export interface ProcessedEvent {
  eventId: string;
  processedAt: Date;
}

export interface AuctionPublishedPayload {
  auctionId: string;
  sellerId: string;
  title: string;
  startingPricePaise: string;
  reservePricePaise: string | null;
  buyItNowPricePaise: string | null;
  startAt: string;
  endAt: string;
}

export interface BidAcceptedPayload {
  bidId: string;
  auctionId: string;
  bidderId: string;
  amountPaise: string;
  seq: number;
  previousLeaderId: string | null;
  previousLeaderHoldId: string | null;
  holdId: string;
  newEndAt: string | null;
}

export interface AuctionClosedPayload {
  auctionId: string;
  sellerId: string;
  winnerId: string | null;
  finalPricePaise: string | null;
  reserveMet: boolean;
  totalBids: number;
}

export interface PaymentCapturedPayload {
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amountPaise: string;
  feePaise: string;
  holdId: string;
  escrowId: string;
}

export interface EscrowReleasedPayload {
  escrowId: string;
  auctionId: string;
  sellerId: string;
  payoutPaise: string;
  feePaise: string;
}

export interface OrderEventPayload {
  orderId: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  trackingNumber?: string;
}
