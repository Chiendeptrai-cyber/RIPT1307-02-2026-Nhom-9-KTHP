import { z } from 'zod';

export const borrowRequestItemSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

export const createBorrowRequestSchema = z.object({
  items: z.array(borrowRequestItemSchema).min(1, 'Phải có ít nhất 1 thiết bị'),
  expectedReturnDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date',
  }),
  note: z.string().max(200).optional(),
  rulesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the borrowing rules' }),
  }),
});
