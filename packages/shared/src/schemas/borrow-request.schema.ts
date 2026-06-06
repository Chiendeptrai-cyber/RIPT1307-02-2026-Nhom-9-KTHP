import { z } from 'zod';

export const createBorrowRequestSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  expectedReturnDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date',
  }),
  note: z.string().max(200).optional(),
  rulesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the borrowing rules' }),
  }),
});
