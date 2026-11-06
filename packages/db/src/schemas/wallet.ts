import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  bigint,
  integer,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';

export const walletSchema = pgSchema('wallet');

export const wallets = walletSchema.table(
  'wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().unique(),
    availablePaise: bigint('available_paise', { mode: 'bigint' }).notNull().default(BigInt(0)),
    heldPaise: bigint('held_paise', { mode: 'bigint' }).notNull().default(BigInt(0)),
    version: integer('version').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('wallets_user_idx').on(t.userId)],
);

export const holds = walletSchema.table(
  'holds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    auctionId: uuid('auction_id').notNull(),
    bidderId: uuid('bidder_id').notNull(),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    idempotencyKey: uuid('idempotency_key').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('holds_idempotency_idx').on(t.idempotencyKey),
    index('holds_wallet_idx').on(t.walletId),
    index('holds_auction_bidder_idx').on(t.auctionId, t.bidderId),
    index('holds_status_expires_idx').on(t.status, t.expiresAt),
  ],
);

export const escrow = walletSchema.table(
  'escrow',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id').notNull().unique(),
    buyerId: uuid('buyer_id').notNull(),
    sellerId: uuid('seller_id').notNull(),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    feePaise: bigint('fee_paise', { mode: 'bigint' }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('held'),
    holdId: uuid('hold_id')
      .notNull()
      .references(() => holds.id),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('escrow_auction_idx').on(t.auctionId)],
);

export const ledgerEntries = walletSchema.table(
  'ledger_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),
    type: varchar('type', { length: 30 }).notNull(),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    balanceAfterPaise: bigint('balance_after_paise', { mode: 'bigint' }).notNull(),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 30 }),
    description: varchar('description', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ledger_wallet_idx').on(t.walletId), index('ledger_created_idx').on(t.createdAt)],
);

export const walletOutbox = walletSchema.table(
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
  (t) => [index('wallet_outbox_unpublished_idx').on(t.publishedAt)],
);

export const walletProcessedEvents = walletSchema.table('processed_events', {
  eventId: uuid('event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});
