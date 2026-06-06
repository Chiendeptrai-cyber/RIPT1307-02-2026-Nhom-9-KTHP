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
      `INSERT INTO borrow_requests (user_id, status, expected_return_date, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id AS "userId", status,
                 expected_return_date AS "expectedReturnDate",
                 note, created_at AS "createdAt", updated_at AS "updatedAt",
                 FORMAT('PH-%s-%s', TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYYMMDD'), LPAD(id::TEXT, 5, '0')) AS "displayCode"`,
      [data.userId, data.status, data.expectedReturnDate, (data as any).note ?? null],
    );
    return result.rows[0];
  }

  async createItem(data: {
    borrowRequestId: number;
    equipmentId: number;
    quantity: number;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO borrow_request_items (borrow_request_id, equipment_id, quantity)
       VALUES ($1, $2, $3)`,
      [data.borrowRequestId, data.equipmentId, data.quantity],
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
                 note, approved_at AS "approvedAt", borrowed_at AS "borrowedAt",
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
              e.name AS "equipmentName",
              bri.quantity AS "quantity"
       FROM borrow_requests br
       LEFT JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
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
      if (options.status === 'overdue') {
        // Dynamically detect overdue: explicit 'overdue' status OR 'borrowing' past due date
        conditions.push(`(br.status = 'overdue' OR (br.status = 'borrowing' AND br.expected_return_date < NOW()))`);
      } else {
        conditions.push(`br.status = $${idx++}`);
        values.push(options.status);
      }
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
              e.name AS "equipmentName",
              bri.quantity AS "quantity"
       FROM borrow_requests br
       JOIN users u ON u.id = br.user_id
       LEFT JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       ${where}
       ORDER BY br.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );

    return { items: result.rows, total };
  }


  async countByStatus(status: string): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM borrow_requests WHERE status = $1`,
      [status],
    );
    return Number(result.rows[0].total);
  }

  async getItems(borrowRequestId: number): Promise<{ equipmentId: number; quantity: number }[]> {
    const result = await this.pool.query<{ equipmentId: number; quantity: number }>(
      `SELECT equipment_id AS "equipmentId", quantity
       FROM borrow_request_items
       WHERE borrow_request_id = $1`,
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

  /** Tìm tất cả đơn "borrowing" đã quá hạn trả (để auto-overdue) */
  async findOverdueBorrowingRequests(): Promise<BorrowRequestEntity[]> {
    const result = await this.pool.query<BorrowRequestEntity>(
      `SELECT ${BASE_SELECT}
       FROM borrow_requests br
       WHERE br.status = 'borrowing'
         AND br.expected_return_date < NOW()`,
    );
    return result.rows;
  }
}
