import { z } from 'zod';

export const equipmentCreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.number().int(),
  totalQuantity: z.number().int().min(1),
  status: z.string(),
});

export const equipmentUpdateSchema = equipmentCreateSchema.partial();
