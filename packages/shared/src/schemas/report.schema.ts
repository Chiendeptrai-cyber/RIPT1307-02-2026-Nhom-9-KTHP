import { z } from 'zod';

export const exportReportSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ExportReportDto = z.infer<typeof exportReportSchema>;
