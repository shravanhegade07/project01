import { z } from 'zod';

export const CreateAuctionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  categoryId: z.string().uuid(),
  startingPricePaise: z.bigint().positive(),
  reservePricePaise: z.bigint().positive().optional(),
  buyItNowPricePaise: z.bigint().positive().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  durationDays: z.number().int().min(1).max(14),
});

export const UpdateAuctionSchema = CreateAuctionSchema.partial();

export const AuctionFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.enum(['live', 'scheduled', 'sold', 'unsold']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(['ending_soon', 'newly_listed', 'price_asc', 'price_desc', 'most_bids']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type CreateAuctionInput = z.infer<typeof CreateAuctionSchema>;
export type UpdateAuctionInput = z.infer<typeof UpdateAuctionSchema>;
export type AuctionFilterInput = z.infer<typeof AuctionFilterSchema>;
