import { getDb } from '../db/client.server';
import type { SeoInput, SeoMeta } from '@/lib/cms/content.types';

const COLUMNS = [
  'seo_title',
  'meta_description',
  'canonical_url',
  'og_title',
  'og_description',
  'og_image',
  'twitter_title',
  'twitter_description',
  'twitter_image',
] as const;

export const seoRepository = {
  async find(entityType: string, entityId: number): Promise<SeoMeta | null> {
    const db = await getDb();
    return db.get<SeoMeta>(
      `SELECT seo_title, meta_description, canonical_url, og_title, og_description, og_image,
              twitter_title, twitter_description, twitter_image, no_index, no_follow
       FROM seo_meta WHERE entity_type = ? AND entity_id = ?`,
      [entityType, entityId],
    );
  },

  async save(entityType: string, entityId: number, input: SeoInput): Promise<void> {
    const db = await getDb();
    const values = COLUMNS.map((column) => {
      const value = (input as Record<string, unknown>)[column];
      return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
    });
    await db.run(
      `INSERT INTO seo_meta (entity_type, entity_id, ${COLUMNS.join(', ')}, no_index, no_follow, updated_at)
       VALUES (?, ?, ${COLUMNS.map(() => '?').join(', ')}, ?, ?, datetime('now'))
       ON CONFLICT (entity_type, entity_id) DO UPDATE SET
         ${COLUMNS.map((c) => `${c} = excluded.${c}`).join(', ')},
         no_index = excluded.no_index,
         no_follow = excluded.no_follow,
         updated_at = datetime('now')`,
      [entityType, entityId, ...values, input.no_index ? 1 : 0, input.no_follow ? 1 : 0],
    );
  },

  async remove(entityType: string, entityId: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM seo_meta WHERE entity_type = ? AND entity_id = ?', [entityType, entityId]);
  },
};
