import { z } from 'zod';

export const borrowRequestItemSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  expectedReturnDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date',
  }),
});

export const createBorrowRequestSchema = z.object({
  items: z.array(borrowRequestItemSchema).min(1, 'Phải có ít nhất 1 thiết bị'),
  note: z.string().max(200).optional(),
  rulesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the borrowing rules' }),
  }),
});
