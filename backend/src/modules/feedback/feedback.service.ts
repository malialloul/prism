import { pool } from '../../config/db';
import type { FeedbackDto, CreateFeedbackDto, UpdateFeedbackDto, FeedbackFilterParams, PaginatedFeedbackResponse } from './feedback.types';

// Admin email - only this user can view all feedback
const ADMIN_EMAIL = 'mohammadalialloul@gmail.com';

export const isAdmin = (email: string): boolean => {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const createFeedbackTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      user_full_name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'other')),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in-progress', 'completed', 'rejected')),
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
};

// Initialize table on module load
createFeedbackTable().catch(console.error);

export const createFeedback = async (
  userId: number,
  userEmail: string,
  userFullName: string,
  data: CreateFeedbackDto
): Promise<FeedbackDto> => {
  const result = await pool.query(
    `INSERT INTO feedback (user_id, user_email, user_full_name, type, title, description, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, userEmail, userFullName, data.type, data.title, data.description, data.priority]
  );
  return mapRowToFeedback(result.rows[0]);
};

export const getAllFeedback = async (params: FeedbackFilterParams = {}): Promise<PaginatedFeedbackResponse> => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }
  if (priority) {
    conditions.push(`priority = $${paramIndex++}`);
    values.push(priority);
  }
  if (search) {
    conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Map sortBy to database column names
  const sortColumnMap: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    status: 'status',
    type: 'type',
    priority: 'priority',
  };
  const sortColumn = sortColumnMap[sortBy] || 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as count FROM feedback ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0]?.count || '0');

  // Get paginated results
  const result = await pool.query(
    `SELECT * FROM feedback ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return {
    feedback: result.rows.map(mapRowToFeedback),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserFeedback = async (userId: number): Promise<FeedbackDto[]> => {
  const result = await pool.query(
    `SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(mapRowToFeedback);
};

export const getFeedbackById = async (id: number): Promise<FeedbackDto | null> => {
  const result = await pool.query(
    `SELECT * FROM feedback WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapRowToFeedback(result.rows[0]) : null;
};

export const updateFeedback = async (
  id: number,
  data: UpdateFeedbackDto
): Promise<FeedbackDto | null> => {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (data.type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(data.type);
  }
  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.priority !== undefined) {
    updates.push(`priority = $${paramIndex++}`);
    values.push(data.priority);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.adminNotes !== undefined) {
    updates.push(`admin_notes = $${paramIndex++}`);
    values.push(data.adminNotes);
  }

  if (updates.length === 0) return getFeedbackById(id);

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE feedback SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] ? mapRowToFeedback(result.rows[0]) : null;
};

export const deleteFeedback = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM feedback WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

export const getFeedbackStats = async (): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}> => {
  const [totalResult, statusResult, typeResult, priorityResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) as count FROM feedback`),
    pool.query(`SELECT status, COUNT(*) as count FROM feedback GROUP BY status`),
    pool.query(`SELECT type, COUNT(*) as count FROM feedback GROUP BY type`),
    pool.query(`SELECT priority, COUNT(*) as count FROM feedback GROUP BY priority`),
  ]);

  return {
    total: parseInt(totalResult.rows[0]?.count || '0'),
    byStatus: statusResult.rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {}),
    byType: typeResult.rows.reduce((acc, row) => ({ ...acc, [row.type]: parseInt(row.count) }), {}),
    byPriority: priorityResult.rows.reduce((acc, row) => ({ ...acc, [row.priority]: parseInt(row.count) }), {}),
  };
};

const mapRowToFeedback = (row: any): FeedbackDto => ({
  id: row.id,
  userId: row.user_id,
  userEmail: row.user_email,
  userFullName: row.user_full_name,
  type: row.type,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  adminNotes: row.admin_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
