import { z } from 'zod';

export const TopUpSchema = z.object({
  amountPaise: z.bigint().positive(),
  idempotencyKey: z.string().uuid(),
});

export const CreateHoldSchema = z.object({
  walletId: z.string().uuid(),
  amountPaise: z.bigint().positive(),
  auctionId: z.string().uuid(),
  bidderId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
});

export type TopUpInput = z.infer<typeof TopUpSchema>;
export type CreateHoldInput = z.infer<typeof CreateHoldSchema>;
