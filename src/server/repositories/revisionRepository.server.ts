import { getDb } from '../db/client.server';

export interface RevisionRecord {
  id: number;
  entity_type: string;
  entity_id: number;
  snapshot: string;
  created_by: number | null;
  created_at: string;
}

export const revisionRepository = {
  async create(entityType: string, entityId: number, snapshot: unknown, adminId?: number) {
    const db = await getDb();
    await db.run(
      'INSERT INTO content_revisions (entity_type, entity_id, snapshot, created_by) VALUES (?, ?, ?, ?)',
      [entityType, entityId, JSON.stringify(snapshot), adminId ?? null],
    );
  },

  async list(entityType: string, entityId: number): Promise<RevisionRecord[]> {
    const db = await getDb();
    return db.all<RevisionRecord>(
      `SELECT id, entity_type, entity_id, snapshot, created_by, created_at
       FROM content_revisions WHERE entity_type = ? AND entity_id = ?
       ORDER BY created_at DESC, id DESC LIMIT 30`,
      [entityType, entityId],
    );
  },

  async findById(id: number): Promise<RevisionRecord | null> {
    const db = await getDb();
    return db.get<RevisionRecord>('SELECT * FROM content_revisions WHERE id = ?', [id]);
  },
};