import type { Pool } from 'pg';
import type { IEquipmentRepository } from '../../../domain/repositories/equipment.repository';
import type { EquipmentEntity } from '../../../domain/entities/equipment.entity';

export class PgEquipmentRepository implements IEquipmentRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<EquipmentEntity | null> {
    const result = await this.pool.query<EquipmentEntity>(
      `SELECT e.id, e.name, e.category_id AS "categoryId",
              e.total_quantity AS "totalQuantity",
              e.available_quantity AS "availableQuantity",
              e.status, e.description,
              e.created_at AS "createdAt", e.updated_at AS "updatedAt",
              c.name AS "categoryName"
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND e.status != 'deleted'`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async list(
    page: number,
    pageSize: number,
    options?: { search?: string; categoryId?: number; status?: string },
  ): Promise<{ items: EquipmentEntity[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const conditions = [`e.status != 'deleted'`];
    const values: unknown[] = [];
    let idx = 1;

    if (options?.search) {
      conditions.push(`unaccent(e.name) ILIKE unaccent($${idx++})`);
      values.push(`%${options.search}%`);
    }
    if (options?.categoryId) {
      conditions.push(`e.category_id = $${idx++}`);
      values.push(options.categoryId);
    }
    if (options?.status) {
      conditions.push(`e.status::text = $${idx++}`);
      values.push(options.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM equipment e ${where}`,
      values,
    );
    const total = Number(countResult.rows[0].total);

    values.push(pageSize, offset);
    const result = await this.pool.query<EquipmentEntity>(
      `SELECT e.id, e.name, e.category_id AS "categoryId",
              e.total_quantity AS "totalQuantity",
              e.available_quantity AS "availableQuantity",
              e.status, e.description,
              e.created_at AS "createdAt", e.updated_at AS "updatedAt",
              c.name AS "categoryName"
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       ${where}
       ORDER BY e.name ASC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );

    return { items: result.rows, total };
  }

  async countAll(): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM equipment WHERE status != 'deleted'`,
    );
    return Number(result.rows[0].total);
  }

  async create(
    data: Omit<EquipmentEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<EquipmentEntity> {
    const insertResult = await this.pool.query<{ id: number }>(
      `INSERT INTO equipment (name, category_id, total_quantity, available_quantity, status, description)
       VALUES ($1, $2, $3, $3, $4, $5)
       RETURNING id`,
      [data.name, data.categoryId, data.totalQuantity, data.status, (data as any).description ?? null],
    );
    const created = await this.findById(insertResult.rows[0].id);
    if (!created) {
      throw new Error('Không thể tạo thiết bị');
    }
    return created;
  }

  async update(id: number, data: Partial<EquipmentEntity>): Promise<EquipmentEntity> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined)              { sets.push(`name = $${idx++}`);               values.push(data.name); }
    if (data.categoryId !== undefined)        { sets.push(`category_id = $${idx++}`);        values.push(data.categoryId); }
    if (data.totalQuantity !== undefined)     { sets.push(`total_quantity = $${idx++}`);     values.push(data.totalQuantity); }
    if (data.availableQuantity !== undefined) { sets.push(`available_quantity = $${idx++}`); values.push(data.availableQuantity); }
    if (data.status !== undefined)            { sets.push(`status = $${idx++}`);             values.push(data.status); }
    if ((data as any).description !== undefined) { sets.push(`description = $${idx++}`);    values.push((data as any).description); }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    await this.pool.query(
      `UPDATE equipment SET ${sets.join(', ')} WHERE id = $${idx}`,
      values,
    );
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Không thể tìm thấy thiết bị sau khi cập nhật');
    }
    return updated;
  }

  async decrementAvailable(id: number, amount: number): Promise<void> {
    await this.pool.query(
      `UPDATE equipment SET available_quantity = available_quantity - $1, updated_at = NOW()
       WHERE id = $2 AND available_quantity >= $1`,
      [amount, id],
    );
  }

  async incrementAvailable(id: number, amount: number): Promise<void> {
    await this.pool.query(
      `UPDATE equipment SET available_quantity = available_quantity + $1, updated_at = NOW()
       WHERE id = $2`,
      [amount, id],
    );
  }

  async listCategories(): Promise<{ id: number; name: string; description?: string }[]> {
    const result = await this.pool.query<{ id: number; name: string; description?: string }>(
      `SELECT id, name, description FROM categories ORDER BY name ASC`
    );
    return result.rows;
  }

  async createCategory(name: string, description?: string): Promise<{ id: number; name: string; description?: string }> {
    const result = await this.pool.query<{ id: number; name: string; description?: string }>(
      `INSERT INTO categories (name, description, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, name, description`,
      [name, description ?? null],
    );
    return result.rows[0];
  }
}
