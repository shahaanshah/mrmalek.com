import { getDb } from '../db/client.server';
import type { VideoInput, VideoWithCategory } from '@/lib/cms/types';
import { slugify } from '@/lib/cms/types';

const SELECT_WITH_CATEGORY = `
  SELECT v.*, c.name AS category_name, c.slug AS category_slug
  FROM videos v
  LEFT JOIN categories c ON c.id = v.category_id
`;

const ORDER = ` ORDER BY COALESCE(v.publish_date, v.created_at) DESC, v.id DESC`;

async function uniqueSlug(title: string, ignoreId?: number): Promise<string> {
  const db = await getDb();
  const base = slugify(title) || 'episode';
  let candidate = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await db.get<{ id: number }>('SELECT id FROM videos WHERE slug = ?', [candidate]);
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function toRow(input: VideoInput) {
  return {
    title: input.title,
    description: input.description,
    video_url: input.video_url,
    thumbnail_url: input.thumbnail_url ? input.thumbnail_url : null,
    duration: input.duration ? input.duration : null,
    category_id: input.category_id,
    publish_date: input.publish_date ? input.publish_date : new Date().toISOString().slice(0, 10),
    is_featured: input.is_featured ? 1 : 0,
    is_published: input.is_published ? 1 : 0,
  };
}

export const videoRepository = {
  /** Admin listing — includes drafts. */
  async listAll(filters: { search?: string; status?: 'all' | 'published' | 'draft'; categoryId?: number } = {}) {
    const db = await getDb();
    const where: string[] = [];
    const params: unknown[] = [];
    if (filters.search) {
      where.push('(v.title LIKE ? OR v.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status === 'published') where.push('v.is_published = 1');
    if (filters.status === 'draft') where.push('v.is_published = 0');
    if (filters.categoryId) {
      where.push('v.category_id = ?');
      params.push(filters.categoryId);
    }
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    return db.all<VideoWithCategory>(SELECT_WITH_CATEGORY + clause + ORDER, params);
  },

  /** Public listing — published only. */
  async listPublished(): Promise<VideoWithCategory[]> {
    const db = await getDb();
    return db.all<VideoWithCategory>(
      `${SELECT_WITH_CATEGORY} WHERE v.is_published = 1
       AND (v.publish_date IS NULL OR date(v.publish_date) <= date('now'))${ORDER}`,
    );
  },

  async findById(id: number): Promise<VideoWithCategory | null> {
    const db = await getDb();
    return db.get<VideoWithCategory>(`${SELECT_WITH_CATEGORY} WHERE v.id = ?`, [id]);
  },

  async findPublishedBySlug(slug: string): Promise<VideoWithCategory | null> {
    const db = await getDb();
    return db.get<VideoWithCategory>(
      `${SELECT_WITH_CATEGORY} WHERE v.slug = ? AND v.is_published = 1
       AND (v.publish_date IS NULL OR date(v.publish_date) <= date('now'))`,
      [slug],
    );
  },

  async create(input: VideoInput): Promise<VideoWithCategory> {
    const db = await getDb();
    const row = toRow(input);
    const slug = await uniqueSlug(row.title);
    const { lastInsertRowid } = await db.run(
      `INSERT INTO videos (title, slug, description, video_url, thumbnail_url, duration, category_id, publish_date, is_featured, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.title,
        slug,
        row.description,
        row.video_url,
        row.thumbnail_url,
        row.duration,
        row.category_id,
        row.publish_date,
        row.is_featured,
        row.is_published,
      ],
    );
    if (row.is_featured) await this.setFeatured(lastInsertRowid, true);
    return (await this.findById(lastInsertRowid))!;
  },

  async update(id: number, input: VideoInput): Promise<VideoWithCategory | null> {
    const db = await getDb();
    const row = toRow(input);
    const slug = await uniqueSlug(row.title, id);
    await db.run(
      `UPDATE videos SET title = ?, slug = ?, description = ?, video_url = ?, thumbnail_url = ?, duration = ?,
       category_id = ?, publish_date = ?, is_featured = ?, is_published = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        row.title,
        slug,
        row.description,
        row.video_url,
        row.thumbnail_url,
        row.duration,
        row.category_id,
        row.publish_date,
        row.is_featured,
        row.is_published,
        id,
      ],
    );
    if (row.is_featured) await this.setFeatured(id, true);
    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM videos WHERE id = ?', [id]);
  },

  async duplicate(id: number): Promise<VideoWithCategory | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    return this.create({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      video_url: existing.video_url,
      thumbnail_url: existing.thumbnail_url ?? '',
      duration: existing.duration ?? '',
      category_id: existing.category_id ?? 0,
      publish_date: '',
      is_featured: false,
      is_published: false,
    });
  },

  async setPublished(id: number, published: boolean): Promise<void> {
    const db = await getDb();
    await db.run("UPDATE videos SET is_published = ?, updated_at = datetime('now') WHERE id = ?", [
      published ? 1 : 0,
      id,
    ]);
    if (!published) {
      await db.run("UPDATE videos SET is_featured = 0, updated_at = datetime('now') WHERE id = ?", [id]);
    }
  },

  /** Only one video can be featured at a time. */
  async setFeatured(id: number, featured: boolean): Promise<void> {
    const db = await getDb();
    if (featured) {
      await db.run("UPDATE videos SET is_featured = 0, updated_at = datetime('now') WHERE is_featured = 1 AND id <> ?", [
        id,
      ]);
    }
    await db.run("UPDATE videos SET is_featured = ?, updated_at = datetime('now') WHERE id = ?", [
      featured ? 1 : 0,
      id,
    ]);
  },

  async stats(): Promise<{ published: number; draft: number; latest: VideoWithCategory | null }> {
    const db = await getDb();
    const published = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM videos WHERE is_published = 1');
    const draft = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM videos WHERE is_published = 0');
    const latest = await db.get<VideoWithCategory>(`${SELECT_WITH_CATEGORY}${ORDER} LIMIT 1`);
    return { published: published?.count ?? 0, draft: draft?.count ?? 0, latest };
  },
};
