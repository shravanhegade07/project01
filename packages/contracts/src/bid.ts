import { z } from 'zod';

export const PlaceBidSchema = z.object({
  auctionId: z.string().uuid(),
  amountPaise: z.bigint().positive(),
  idempotencyKey: z.string().uuid(),
});

export const BidHistoryQuerySchema = z.object({
  auctionId: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PlaceBidInput = z.infer<typeof PlaceBidSchema>;
export type BidHistoryQuery = z.infer<typeof BidHistoryQuerySchema>;
