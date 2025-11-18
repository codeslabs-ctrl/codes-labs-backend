import { pool } from '../config/database.config';

export interface Contact {
  id: string;
  nombreContacto: string;
  nombreEmpresa: string;
  emailContacto: string;
  telefonoContacto: string;
  comentarios?: string;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ContactModel {
  static async create(contactData: Omit<Contact, 'id' | 'emailSent' | 'emailSentAt' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const query = `
      INSERT INTO contacts (
        nombre_contacto,
        nombre_empresa,
        email_contacto,
        telefono_contacto,
        comentarios
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        nombre_contacto as "nombreContacto",
        nombre_empresa as "nombreEmpresa",
        email_contacto as "emailContacto",
        telefono_contacto as "telefonoContacto",
        comentarios,
        email_sent as "emailSent",
        email_sent_at as "emailSentAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      contactData.nombreContacto,
      contactData.nombreEmpresa,
      contactData.emailContacto,
      contactData.telefonoContacto,
      contactData.comentarios || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async markEmailAsSent(id: string): Promise<void> {
    const query = `
      UPDATE contacts
      SET email_sent = true, email_sent_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [id]);
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<Contact[]> {
    const query = `
      SELECT 
        id,
        nombre_contacto as "nombreContacto",
        nombre_empresa as "nombreEmpresa",
        email_contacto as "emailContacto",
        telefono_contacto as "telefonoContacto",
        comentarios,
        email_sent as "emailSent",
        email_sent_at as "emailSentAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM contacts
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}

