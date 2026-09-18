import { getDb } from '../db/client.server';
import type { ActivityEntry } from '@/lib/cms/content.types';

export const activityRepository = {
  async log(entry: {
    adminId: number | null;
    adminEmail?: string | null;
    action: string;
    entityType: string;
    entityId?: number | null;
    summary?: string;
  }): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'INSERT INTO activity_log (admin_id, admin_email, action, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)',
        [
          entry.adminId,
          entry.adminEmail ?? null,
          entry.action,
          entry.entityType,
          entry.entityId ?? null,
          entry.summary ?? '',
        ],
      );
    } catch (error) {
      console.error('[cms] activity log failed', error);
    }
  },

  async list(limit = 100): Promise<ActivityEntry[]> {
    const db = await getDb();
    return db.all<ActivityEntry>(
      'SELECT id, admin_email, action, entity_type, entity_id, summary, created_at FROM activity_log ORDER BY created_at DESC, id DESC LIMIT ?',
      [limit],
    );
  },
};
