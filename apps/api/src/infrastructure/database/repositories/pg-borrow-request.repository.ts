import type { Pool } from 'pg';
import type { IBorrowRequestRepository } from '../../../domain/repositories/borrow-request.repository';
import type { BorrowRequestEntity } from '../../../domain/entities/borrow-request.entity';

/** Cột SELECT dùng lại nhiều lần — sinh display_code ngay tại SQL */
const BASE_SELECT = `
  br.id,
  br.user_id AS "userId",
  br.status,
  br.expected_return_date AS "expectedReturnDate",
  br.note,
  br.rules_accepted_at AS "rulesAcceptedAt",
  br.approved_at AS "approvedAt",
  br.borrowed_at AS "borrowedAt",
  br.returned_at AS "returnedAt",
  br.borrow_start_date AS "borrowStartDate",
  br.reject_reason AS "rejectReason",
  br.created_at AS "createdAt",
  br.updated_at AS "updatedAt",
  FORMAT('PH-%s-%s', TO_CHAR(br.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD'), LPAD(br.id::TEXT, 5, '0')) AS "displayCode"
`;

export class PgBorrowRequestRepository implements IBorrowRequestRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<BorrowRequestEntity | null> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT ${BASE_SELECT}
       FROM borrow_requests br WHERE br.id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: Omit<BorrowRequestEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BorrowRequestEntity> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `INSERT INTO borrow_requests (user_id, status, expected_return_date, note, rules_accepted_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id AS "userId", status,
                 expected_return_date AS "expectedReturnDate",
                 note, rules_accepted_at AS "rulesAcceptedAt",
                 created_at AS "createdAt", updated_at AS "updatedAt",
                 FORMAT('PH-%s-%s', TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD'), LPAD(id::TEXT, 5, '0')) AS "displayCode"`,
      [data.userId, data.status, data.expectedReturnDate, (data as any).note ?? null, (data as any).rulesAcceptedAt ?? null],
    );
    return result.rows[0];
  }

  async createItem(data: {
    borrowRequestId: number;
    equipmentId: number;
    quantity: number;
    expectedReturnDate: string;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity, expected_return_date)
       VALUES ($1, $2, $3, $4)`,
      [data.borrowRequestId, data.equipmentId, data.quantity, data.expectedReturnDate],
    );
  }


  async update(
    id: number,
    data: Partial<BorrowRequestEntity>,
  ): Promise<BorrowRequestEntity> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status !== undefined)             { sets.push(`status = $${idx++}`);               values.push(data.status); }
    if (data.expectedReturnDate !== undefined) { sets.push(`expected_return_date = $${idx++}`); values.push(data.expectedReturnDate); }
    if ((data as any).note !== undefined)      { sets.push(`note = $${idx++}`);                 values.push((data as any).note); }
    if ((data as any).rulesAcceptedAt !== undefined) { sets.push(`rules_accepted_at = $${idx++}`); values.push((data as any).rulesAcceptedAt); }
    if ((data as any).approvedAt !== undefined){ sets.push(`approved_at = $${idx++}`);          values.push((data as any).approvedAt); }
    if ((data as any).borrowedAt !== undefined){ sets.push(`borrowed_at = $${idx++}`);          values.push((data as any).borrowedAt); }
    if ((data as any).returnedAt !== undefined){ sets.push(`returned_at = $${idx++}`);          values.push((data as any).returnedAt); }
    if ((data as any).borrowStartDate !== undefined){ sets.push(`borrow_start_date = $${idx++}`); values.push((data as any).borrowStartDate); }
    if ((data as any).rejectReason !== undefined){ sets.push(`reject_reason = $${idx++}`);      values.push((data as any).rejectReason); }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.pool.query<BorrowRequestEntity>(
      `UPDATE borrow_requests SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, user_id AS "userId", status,
                 expected_return_date AS "expectedReturnDate",
                 note, rules_accepted_at AS "rulesAcceptedAt",
                 approved_at AS "approvedAt", borrowed_at AS "borrowedAt",
                 returned_at AS "returnedAt", borrow_start_date AS "borrowStartDate",
                 reject_reason AS "rejectReason",
                 created_at AS "createdAt", updated_at AS "updatedAt",
                 FORMAT('PH-%s-%s', TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD'), LPAD(id::TEXT, 5, '0')) AS "displayCode"`,
      values,
    );
    return result.rows[0];
  }

  async listByUser(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: BorrowRequestEntity[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM borrow_requests WHERE user_id = $1`,
      [userId],
    );
    const total = Number(countResult.rows[0].total);

    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT ${BASE_SELECT},
              (SELECT STRING_AGG(e.name || ' (x' || bri.quantity || ')', ', ')
               FROM borrow_request_items bri
               JOIN equipment e ON e.id = bri.equipment_id
               WHERE bri.borrow_request_id = br.id) AS "equipmentSummary",
              (SELECT MIN(bri.expected_return_date) FROM borrow_request_items bri WHERE bri.borrow_request_id = br.id) AS "earliestReturnDate",
              (SELECT MAX(bri.expected_return_date) FROM borrow_request_items bri WHERE bri.borrow_request_id = br.id) AS "latestReturnDate",
              e.name AS "equipmentName",
              bri.quantity AS "quantity"
       FROM borrow_requests br
       LEFT JOIN LATERAL (
         SELECT bri2.borrow_request_id, bri2.equipment_id, bri2.quantity
         FROM borrow_request_items bri2
         WHERE bri2.borrow_request_id = br.id
         LIMIT 1
       ) bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE br.user_id = $1
       ORDER BY br.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset],
    );

    return { items: result.rows, total };
  }

  async listAll(
    page: number,
    pageSize: number,
    options?: { status?: string; search?: string },
  ): Promise<{ items: (BorrowRequestEntity & { userFullName: string; userEmail: string; equipmentName?: string; quantity?: number })[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (options?.status) {
      conditions.push(`br.status = $${idx++}`);
      values.push(options.status);
    }
    if (options?.search) {
      conditions.push(`u.full_name ILIKE $${idx++}`);
      values.push(`%${options.search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       ${where}`,
      values,
    );
    const total = Number(countResult.rows[0].total);

    values.push(pageSize, offset);
    const result = await this.pool.query(
      `SELECT ${BASE_SELECT},
              u.full_name AS "userFullName", u.email AS "userEmail",
              (SELECT STRING_AGG(e2.name || ' (x' || bri2.quantity || ')', ', ')
               FROM borrow_request_items bri2
               JOIN equipment e2 ON e2.id = bri2.equipment_id
               WHERE bri2.borrow_request_id = br.id) AS "equipmentSummary",
              (SELECT MIN(bri3.expected_return_date) FROM borrow_request_items bri3 WHERE bri3.borrow_request_id = br.id) AS "earliestReturnDate",
              (SELECT MAX(bri4.expected_return_date) FROM borrow_request_items bri4 WHERE bri4.borrow_request_id = br.id) AS "latestReturnDate",
              e.name AS "equipmentName",
              bri.quantity AS "quantity"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       LEFT JOIN LATERAL (
         SELECT bri5.borrow_request_id, bri5.equipment_id, bri5.quantity
         FROM borrow_request_items bri5
         WHERE bri5.borrow_request_id = br.id
         LIMIT 1
       ) bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       ${where}
       ORDER BY br.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values,
    );

    return { items: result.rows, total };
  }


  async countByStatus(status: string): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM borrow_requests WHERE status::text = $1`,
      [status],
    );
    return Number(result.rows[0].total);
  }

  async getItems(borrowRequestId: number): Promise<{ equipmentId: number; quantity: number; expectedReturnDate: string }[]> {
    const result = await this.pool.query<{ equipmentId: number; quantity: number; expectedReturnDate: string }>(
      `SELECT equipment_id AS "equipmentId", quantity,
              expected_return_date AS "expectedReturnDate"
       FROM borrow_request_items
       WHERE borrow_request_id = $1`,
      [borrowRequestId],
    );
    return result.rows;
  }

  async getItemsWithDetail(borrowRequestId: number): Promise<{
    equipmentId: number; equipmentName: string; quantity: number; expectedReturnDate: string;
  }[]> {
    const result = await this.pool.query(
      `SELECT bri.equipment_id AS "equipmentId",
              e.name AS "equipmentName",
              bri.quantity,
              bri.expected_return_date AS "expectedReturnDate"
       FROM borrow_request_items bri
       JOIN equipment e ON e.id = bri.equipment_id
       WHERE bri.borrow_request_id = $1`,
      [borrowRequestId],
    );
    return result.rows;
  }

  /** Đếm số phiếu mượn đang active của một thiết bị cụ thể (để validate xóa/chuyển trạng thái) */
  async countActiveByEquipment(equipmentId: number): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM borrow_requests br
       JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       WHERE bri.equipment_id = $1
         AND br.status IN ('pending', 'approved', 'borrowing')`,
      [equipmentId],
    );
    return Number(result.rows[0].total);
  }

  /** Tìm tất cả đơn "approved" quá 3 ngày chưa đến nhận (để auto-cancel) */
  async findExpiredApprovedRequests(): Promise<BorrowRequestEntity[]> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT ${BASE_SELECT}
       FROM borrow_requests br
       WHERE br.status = 'approved'
         AND br.approved_at IS NOT NULL
         AND br.approved_at < NOW() - INTERVAL '3 days'`,
    );
    return result.rows;
  }

  /** Tìm tất cả đơn "borrowing" đã quá hạn trả (để auto-overdue) — check theo item date */
  async findOverdueBorrowingRequests(): Promise<BorrowRequestEntity[]> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT DISTINCT ${BASE_SELECT}
       FROM borrow_requests br
       JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       WHERE br.status = 'borrowing'
         AND bri.expected_return_date < NOW()`,
    );
    return result.rows;
  }

  /** Tìm đơn "borrowing" sẽ đến hạn trong N ngày tới — check theo item date */
  async findDueSoonRequests(daysBefore: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT DISTINCT ${BASE_SELECT},
              u.full_name AS "userFullName", u.email AS "userEmail",
              e.name AS "equipmentName"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE br.status = 'borrowing'
         AND (bri.expected_return_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
             = (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' + $1 * INTERVAL '1 day')::date`,
      [daysBefore],
    );
    return result.rows;
  }

  /** Tìm đơn "borrowing" đến hạn hôm nay — check theo item date */
  async findDueTodayRequests(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT DISTINCT ${BASE_SELECT},
              u.full_name AS "userFullName", u.email AS "userEmail",
              e.name AS "equipmentName"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE br.status = 'borrowing'
         AND (bri.expected_return_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
             = (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`,
    );
    return result.rows;
  }

  /** Tìm đơn đã quá hạn N ngày (status = borrowing hoặc overdue) — check theo item date */
  async findOverdueByDaysRequests(days: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT DISTINCT ${BASE_SELECT},
              u.full_name AS "userFullName", u.email AS "userEmail",
              e.name AS "equipmentName"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE br.status IN ('borrowing', 'overdue')
         AND (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
             - (bri.expected_return_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::date >= $1`,
      [days],
    );
    return result.rows;
  }

  /** Tìm tất cả đơn sắp đến hạn (trong 3 ngày) + quá hạn — cho admin dashboard */
  async findDueSoonAndOverdue(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT br.id,
              br.user_id AS "userId",
              br.status,
              br.expected_return_date AS "expectedReturnDate",
              br.note,
              br.approved_at AS "approvedAt",
              br.borrowed_at AS "borrowedAt",
              br.returned_at AS "returnedAt",
              br.borrow_start_date AS "borrowStartDate",
              br.reject_reason AS "rejectReason",
              br.created_at AS "createdAt",
              br.updated_at AS "updatedAt",
              FORMAT('PH-%s-%s', TO_CHAR(br.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD'), LPAD(br.id::TEXT, 5, '0')) AS "displayCode",
              u.full_name AS "userFullName", u.email AS "userEmail",
              STRING_AGG(DISTINCT e.name, ', ') AS "equipmentName",
              SUM(bri.quantity) AS "quantity"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       LEFT JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE br.status IN ('borrowing', 'overdue')
         AND EXISTS (
           SELECT 1 FROM borrow_request_items bri2
           WHERE bri2.borrow_request_id = br.id
             AND bri2.expected_return_date <= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' + INTERVAL '3 days')
         )
       GROUP BY br.id, u.id
       ORDER BY br.expected_return_date ASC`,
    );
    return result.rows;
  }
}
