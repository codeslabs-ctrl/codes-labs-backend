import { pool } from '../config/database.config';

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  iconName: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export class CompanyValueModel {
  static async getAll(): Promise<CompanyValue[]> {
    const query = `
      SELECT 
        id,
        title,
        description,
        icon_name as "iconName",
        display_order as "displayOrder",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive"
      FROM company_values
      WHERE is_active = true
      ORDER BY display_order ASC, title ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id: string): Promise<CompanyValue | null> {
    const query = `
      SELECT 
        id,
        title,
        description,
        icon_name as "iconName",
        display_order as "displayOrder",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive"
      FROM company_values
      WHERE id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

