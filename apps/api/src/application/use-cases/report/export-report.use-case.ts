import type { IBorrowRecordRepository } from '../../../domain/repositories/borrow-record.repository';
import { AppError } from '../../../domain/errors/app.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { UserRole } from '@equipment-mgmt/shared';

export class ExportReportUseCase {
  constructor(private readonly borrowRecordRepo: IBorrowRecordRepository) {}

  async execute(data: { userRole: UserRole; from?: string; to?: string }) {
    if (data.userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Only admins can export reports');
    }

    const fromDate = data.from ? new Date(data.from) : undefined;
    const toDate = data.to ? new Date(data.to) : undefined;

    if (data.from && (fromDate === undefined || Number.isNaN(fromDate.getTime()))) {
      throw new AppError('Invalid from date', 400, 'INVALID_DATE');
    }
    if (data.to && (toDate === undefined || Number.isNaN(toDate.getTime()))) {
      throw new AppError('Invalid to date', 400, 'INVALID_DATE');
    }

    const records = await this.borrowRecordRepo.listByDateRange(
      fromDate?.toISOString(),
      toDate?.toISOString(),
    );

    const headers = ['ID', 'BorrowRequestID', 'Status', 'BorrowedAt', 'ExpectedReturnDate', 'ReturnedAt', 'CreatedAt'];
    const rows = records.map((record) => [
      record.id,
      record.borrowRequestId,
      record.status,
      record.borrowedAt,
      record.expectedReturnDate,
      record.returnedAt ?? '',
      record.createdAt,
    ]);

    const escapeCell = (value: unknown) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csv = [headers.join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');

    return { csv, fileName: `borrow-records-report-${Date.now()}.csv` };
  }
}
