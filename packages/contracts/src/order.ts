import { z } from 'zod';

export const OrderUpdateSchema = z.object({
  trackingNumber: z.string().max(100).optional(),
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;
