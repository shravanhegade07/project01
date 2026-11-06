import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  bigint,
  integer,
  index,
  uniqueIndex,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

export const biddingSchema = pgSchema('bidding');

export const auctionLive = biddingSchema.table(
  'auction_live',
  {
    auctionId: uuid('auction_id').primaryKey(),
    status: varchar('status', { length: 20 }).notNull().default('scheduled'),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    currentPricePaise: bigint('current_price_paise', { mode: 'bigint' }).notNull(),
    reservePricePaise: bigint('reserve_price_paise', { mode: 'bigint' }),
    buyItNowPricePaise: bigint('buy_it_now_price_paise', { mode: 'bigint' }),
    leaderId: uuid('leader_id'),
    leaderHoldId: uuid('leader_hold_id'),
    bidCount: integer('bid_count').notNull().default(0),
    version: integer('version').notNull().default(0),
    snipeCount: integer('snipe_count').notNull().default(0),
    maxSnipeExtensions: integer('max_snipe_extensions').notNull().default(10),
    snipeWindowMs: integer('snipe_window_ms').notNull().default(120000),
    snipeExtensionMs: integer('snipe_extension_ms').notNull().default(120000),
    sellerId: uuid('seller_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('auction_live_status_idx').on(t.status),
    index('auction_live_end_at_idx').on(t.endAt),
  ],
);

export const bids = biddingSchema.table(
  'bids',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => auctionLive.auctionId),
    bidderId: uuid('bidder_id').notNull(),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    seq: integer('seq').notNull(),
    holdId: uuid('hold_id').notNull(),
    idempotencyKey: uuid('idempotency_key').notNull(),
    isWinning: boolean('is_winning').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('bids_auction_seq_idx').on(t.auctionId, t.seq),
    uniqueIndex('bids_bidder_idempotency_idx').on(t.bidderId, t.idempotencyKey),
    index('bids_auction_idx').on(t.auctionId),
    index('bids_bidder_idx').on(t.bidderId),
  ],
);

export const proxyBids = biddingSchema.table(
  'proxy_bids',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => auctionLive.auctionId),
    bidderId: uuid('bidder_id').notNull(),
    maxAmountPaise: bigint('max_amount_paise', { mode: 'bigint' }).notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('proxy_bids_auction_idx').on(t.auctionId, t.active)],
);

export const bidAttempts = biddingSchema.table(
  'bid_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id').notNull(),
    bidderId: uuid('bidder_id').notNull(),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    idempotencyKey: uuid('idempotency_key').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    rejectReason: varchar('reject_reason', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('bid_attempts_auction_idx').on(t.auctionId)],
);

export const biddingOutbox = biddingSchema.table(
  'outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    topic: varchar('topic', { length: 100 }).notNull(),
    partitionKey: varchar('partition_key', { length: 100 }).notNull(),
    event: jsonb('event').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    retryCount: integer('retry_count').notNull().default(0),
  },
  (t) => [index('bidding_outbox_unpublished_idx').on(t.publishedAt)],
);

export const biddingProcessedEvents = biddingSchema.table('processed_events', {
  eventId: uuid('event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});
