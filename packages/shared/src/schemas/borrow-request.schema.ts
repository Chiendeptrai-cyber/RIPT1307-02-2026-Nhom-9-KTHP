import { z } from 'zod';

export const createBorrowRequestSchema = z.object({
  equipmentIds: z.array(z.number().int()).min(1),
  expectedReturnDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date',
  }),
});
