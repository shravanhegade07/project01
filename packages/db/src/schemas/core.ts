import {
  pgSchema,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  bigint,
  integer,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';

export const coreSchema = pgSchema('core');

export const users = coreSchema.table(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('buyer'),
    emailVerified: boolean('email_verified').notNull().default(false),
    suspended: boolean('suspended').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_idx').on(t.email)],
);

export const refreshTokens = coreSchema.table(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull(),
    family: uuid('family').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('refresh_tokens_user_idx').on(t.userId), index('refresh_tokens_family_idx').on(t.family)],
);

export const emailTokens = coreSchema.table('email_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  token: varchar('token', { length: 64 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = coreSchema.table('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auctions = coreSchema.table(
  'auctions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    startingPricePaise: bigint('starting_price_paise', { mode: 'bigint' }).notNull(),
    reservePricePaise: bigint('reserve_price_paise', { mode: 'bigint' }),
    buyItNowPricePaise: bigint('buy_it_now_price_paise', { mode: 'bigint' }),
    currentPricePaise: bigint('current_price_paise', { mode: 'bigint' }),
    bidCount: integer('bid_count').notNull().default(0),
    winnerId: uuid('winner_id'),
    startAt: timestamp('start_at', { withTimezone: true }),
    endAt: timestamp('end_at', { withTimezone: true }),
    durationDays: integer('duration_days').notNull().default(7),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('auctions_seller_idx').on(t.sellerId),
    index('auctions_status_idx').on(t.status),
    index('auctions_end_at_idx').on(t.endAt),
    index('auctions_category_idx').on(t.categoryId),
  ],
);

export const auctionImages = coreSchema.table(
  'auction_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => auctions.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('auction_images_auction_idx').on(t.auctionId)],
);

export const watchlist = coreSchema.table(
  'watchlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => auctions.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('watchlist_user_auction_idx').on(t.userId, t.auctionId)],
);

export const orders = coreSchema.table(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => auctions.id),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id),
    amountPaise: bigint('amount_paise', { mode: 'bigint' }).notNull(),
    feePaise: bigint('fee_paise', { mode: 'bigint' }).notNull(),
    status: varchar('status', { length: 30 }).notNull().default('paid_in_escrow'),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('orders_buyer_idx').on(t.buyerId),
    index('orders_seller_idx').on(t.sellerId),
    uniqueIndex('orders_auction_idx').on(t.auctionId),
  ],
);

export const notifications = coreSchema.table(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 30 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body').notNull(),
    data: jsonb('data'),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notifications_user_idx').on(t.userId), index('notifications_user_read_idx').on(t.userId, t.read)],
);

export const auditLog = coreSchema.table(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id'),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id'),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_log_actor_idx').on(t.actorId), index('audit_log_entity_idx').on(t.entityType, t.entityId)],
);

export const coreOutbox = coreSchema.table(
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
  (t) => [index('core_outbox_unpublished_idx').on(t.publishedAt)],
);

export const coreProcessedEvents = coreSchema.table('processed_events', {
  eventId: uuid('event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});
