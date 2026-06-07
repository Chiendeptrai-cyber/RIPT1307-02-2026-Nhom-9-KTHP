import type { Pool } from 'pg';
import type { IViolationRepository } from '../../../domain/repositories/violation.repository';
import type { ViolationEntity } from '../../../domain/entities/violation.entity';

export class PgViolationRepository implements IViolationRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Omit<ViolationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ViolationEntity> {
    const result = await this.pool.query(
      `INSERT INTO violations (user_id, borrow_request_id, type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id AS "userId", borrow_request_id AS "borrowRequestId", type, description, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [data.userId, data.borrowRequestId, data.type, data.description]
    );
    return result.rows[0];
  }

  async countAll(): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM violations`,
    );
    return Number(result.rows[0].total);
  }

  async listByUser(userId: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT v.id, v.type, v.description, v.created_at AS "createdAt",
              e.name AS "equipmentName",
              br.expected_return_date AS "expectedReturnDate"
       FROM violations v
       LEFT JOIN borrow_requests br ON br.id = v.borrow_request_id
       LEFT JOIN borrow_request_items bri ON bri.borrow_request_id = br.id
       LEFT JOIN equipment e ON e.id = bri.equipment_id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    // Group by ID to deduplicate in case of multiple items in a request
    const unique = new Map();
    for (const row of result.rows) {
      if (!unique.has(row.id)) unique.set(row.id, row);
    }
    return Array.from(unique.values());
  }
}
