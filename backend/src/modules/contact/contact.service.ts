import { pool } from '../../config/db';
import type { ContactDto, CreateContactDto } from './contact.types';

export const createContactTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
};

// Initialize table on module load
createContactTable().catch(console.error);

const mapRowToContact = (row: Record<string, unknown>): ContactDto => ({
  id: row.id as number,
  name: row.name as string,
  email: row.email as string,
  subject: row.subject as string,
  message: row.message as string,
  status: row.status as 'pending' | 'read' | 'replied',
  createdAt: row.created_at as Date,
  updatedAt: row.updated_at as Date,
});

export const createContact = async (data: CreateContactDto): Promise<ContactDto> => {
  const result = await pool.query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.email, data.subject, data.message]
  );
  return mapRowToContact(result.rows[0]);
};

export const getAllContacts = async (): Promise<ContactDto[]> => {
  const result = await pool.query(
    `SELECT * FROM contact_messages ORDER BY created_at DESC`
  );
  return result.rows.map(mapRowToContact);
};

export const updateContactStatus = async (
  id: number,
  status: 'pending' | 'read' | 'replied'
): Promise<ContactDto | null> => {
  const result = await pool.query(
    `UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] ? mapRowToContact(result.rows[0]) : null;
};
