import { getDb } from '../db/client.server';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  message: string;
  status: 'unread' | 'read' | 'archived';
  ip_address?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ContactSubmissionInput {
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  message: string;
  ip_address?: string | null;
}

export const contactRepository = {
  async create(data: ContactSubmissionInput): Promise<{ id: number }> {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO contact_submissions (name, email, phone, topic, message, status, ip_address)
       VALUES (?, ?, ?, ?, ?, 'unread', ?)`,
      [
        data.name.trim(),
        data.email.trim(),
        data.phone?.trim() || null,
        data.topic?.trim() || 'General Inquiry',
        data.message.trim(),
        data.ip_address || null,
      ],
    );
    return { id: Number(result.lastInsertRowid ?? 0) };
  },

  async list(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContactSubmission[]> {
    const db = await getDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (options?.status && options.status !== 'all') {
      conditions.push('status = ?');
      params.push(options.status);
    }

    if (options?.search) {
      const term = `%${options.search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR topic LIKE ? OR message LIKE ?)');
      params.push(term, term, term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    params.push(limit, offset);

    return db.all<ContactSubmission>(
      `SELECT id, name, email, phone, topic, message, status, ip_address, created_at, updated_at
       FROM contact_submissions
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      params,
    );
  },

  async findById(id: number): Promise<ContactSubmission | null> {
    const db = await getDb();
    return (
      (await db.get<ContactSubmission>(
        'SELECT id, name, email, phone, topic, message, status, ip_address, created_at, updated_at FROM contact_submissions WHERE id = ?',
        [id],
      )) ?? null
    );
  },

  async updateStatus(id: number, status: 'unread' | 'read' | 'archived'): Promise<void> {
    const db = await getDb();
    await db.run('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM contact_submissions WHERE id = ?', [id]);
  },

  async stats(): Promise<{ total: number; unread: number; read: number }> {
    const db = await getDb();
    const rows = await db.all<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM contact_submissions GROUP BY status',
    );
    let total = 0;
    let unread = 0;
    let read = 0;
    for (const r of rows) {
      const c = Number(r.count);
      total += c;
      if (r.status === 'unread') unread += c;
      else if (r.status === 'read') read += c;
    }
    return { total, unread, read };
  },
};
