// Generic content repository — one implementation serving every content type.
// React never touches SQL; swapping SQLite later means changing only the
// executor in ../db/client.server.ts.
import { getDb } from '../db/client.server';
import { slugify } from '@/lib/cms/types';
import { DETAIL_TABLE, CONTENT_TYPE_CONFIG } from '@/lib/cms/content.types';
import type { ContentInput, ContentRecord, ContentStatus, ContentType, SeoMeta } from '@/lib/cms/content.types';
import { seoRepository } from './seoRepository.server';

const BASE_SELECT = `
  SELECT ci.*, c.name AS category_name
  FROM content_items ci
  LEFT JOIN categories c ON c.id = ci.category_id
`;

const ORDER = ` ORDER BY ci.sort_order ASC, COALESCE(ci.publish_date, ci.created_at) DESC, ci.id DESC`;

async function uniqueSlug(type: ContentType, title: string, requested?: string, ignoreId?: number): Promise<string> {
  const db = await getDb();
  const base = slugify(requested || title) || type;
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const clash = await db.get<{ id: number }>('SELECT id FROM content_items WHERE type = ? AND slug = ?', [
      type,
      candidate,
    ]);
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function loadDetails(type: ContentType, id: number): Promise<Record<string, string | null>> {
  const table = DETAIL_TABLE[type];
  if (!table) return {};
  const db = await getDb();
  const row = await db.get<Record<string, string | null>>(`SELECT * FROM ${table} WHERE content_id = ?`, [id]);
  if (!row) return {};
  const { content_id: _ignored, ...rest } = row as Record<string, string | null> & { content_id?: number };
  return rest;
}

async function saveDetails(type: ContentType, id: number, details: Record<string, string> | undefined) {
  const table = DETAIL_TABLE[type];
  if (!table) return;
  const allowed = CONTENT_TYPE_CONFIG[type].detailFields.map((f) => f.key);
  const entries = Object.entries(details ?? {}).filter(([key]) => allowed.includes(key));
  const db = await getDb();
  await db.run(`INSERT OR IGNORE INTO ${table} (content_id) VALUES (?)`, [id]);
  if (!entries.length) return;
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await db.run(
    `UPDATE ${table} SET ${sets} WHERE content_id = ?`,
    [...entries.map(([, value]) => (value === '' ? null : value)), id],
  );
}

async function hydrate(row: ContentRecord | null): Promise<ContentRecord | null> {
  if (!row) return null;
  const [details, seo] = await Promise.all([
    loadDetails(row.type, row.id),
    seoRepository.find(row.type, row.id),
  ]);
  return { ...row, details, seo };
}

export interface ContentFilters {
  search?: string;
  status?: ContentStatus | 'all';
  categoryId?: number;
}

export const contentRepository = {
  /** Admin listing — includes drafts. */
  async list(type: ContentType, filters: ContentFilters = {}): Promise<ContentRecord[]> {
    const db = await getDb();
    const where = ['ci.type = ?'];
    const params: unknown[] = [type];
    if (filters.search) {
      where.push('(ci.title LIKE ? OR ci.excerpt LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status && filters.status !== 'all') {
      where.push('ci.status = ?');
      params.push(filters.status);
    }
    if (filters.categoryId) {
      where.push('ci.category_id = ?');
      params.push(filters.categoryId);
    }
    const rows = await db.all<ContentRecord>(`${BASE_SELECT} WHERE ${where.join(' AND ')}${ORDER}`, params);
    return Promise.all(rows.map((row) => hydrate(row) as Promise<ContentRecord>));
  },

  /** Public listing — published only. */
  async listPublished(type: ContentType): Promise<ContentRecord[]> {
    const db = await getDb();
    const rows = await db.all<ContentRecord>(
      `${BASE_SELECT} WHERE ci.type = ? AND ci.status = 'published'
       AND (ci.publish_date IS NULL OR date(ci.publish_date) <= date('now'))${ORDER}`,
      [type],
    );
    return Promise.all(rows.map((row) => hydrate(row) as Promise<ContentRecord>));
  },

  async findById(id: number): Promise<ContentRecord | null> {
    const db = await getDb();
    return hydrate(await db.get<ContentRecord>(`${BASE_SELECT} WHERE ci.id = ?`, [id]));
  },

  async findPublishedBySlug(type: ContentType, slug: string): Promise<ContentRecord | null> {
    const db = await getDb();
    return hydrate(
      await db.get<ContentRecord>(
        `${BASE_SELECT} WHERE ci.type = ? AND ci.slug = ? AND ci.status = 'published'
         AND (ci.publish_date IS NULL OR date(ci.publish_date) <= date('now'))`,
        [type, slug],
      ),
    );
  },

  async findBySlug(type: ContentType, slug: string): Promise<ContentRecord | null> {
    const db = await getDb();
    return hydrate(await db.get<ContentRecord>(`${BASE_SELECT} WHERE ci.type = ? AND ci.slug = ?`, [type, slug]));
  },

  async create(input: ContentInput): Promise<ContentRecord> {
    const db = await getDb();
    const slug = await uniqueSlug(input.type, input.title, input.slug);
    const published = input.status === 'published';
    const { lastInsertRowid } = await db.run(
      `INSERT INTO content_items (type, title, slug, excerpt, body, status, is_featured, sort_order, category_id, publish_date, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.type,
        input.title,
        slug,
        input.excerpt ?? '',
        input.body ?? '',
        input.status,
        input.is_featured ? 1 : 0,
        input.sort_order ?? 0,
        input.category_id ?? null,
        input.publish_date || (published ? new Date().toISOString().slice(0, 10) : null),
        published ? new Date().toISOString() : null,
      ],
    );
    await saveDetails(input.type, lastInsertRowid, input.details);
    if (input.seo) await seoRepository.save(input.type, lastInsertRowid, input.seo);
    if (input.is_featured) await this.setFeatured(lastInsertRowid, true);
    return (await this.findById(lastInsertRowid))!;
  },

  async update(id: number, input: ContentInput): Promise<ContentRecord | null> {
    const db = await getDb();
    const existing = await this.findById(id);
    if (!existing) return null;
    const slug = await uniqueSlug(input.type, input.title, input.slug, id);
    const published = input.status === 'published';
    await db.run(
      `UPDATE content_items SET title = ?, slug = ?, excerpt = ?, body = ?, status = ?, is_featured = ?,
        sort_order = ?, category_id = ?, publish_date = ?, published_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        input.title,
        slug,
        input.excerpt ?? '',
        input.body ?? '',
        input.status,
        input.is_featured ? 1 : 0,
        input.sort_order ?? 0,
        input.category_id ?? null,
        input.publish_date || existing.publish_date,
        published ? (existing.published_at ?? new Date().toISOString()) : null,
        id,
      ],
    );
    await saveDetails(input.type, id, input.details);
    if (input.seo) await seoRepository.save(input.type, id, input.seo);
    if (input.is_featured) await this.setFeatured(id, true);
    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    const item = await this.findById(id);
    await db.run('DELETE FROM content_items WHERE id = ?', [id]);
    if (item) await seoRepository.remove(item.type, id);
  },

  async duplicate(id: number): Promise<ContentRecord | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    return this.create({
      type: existing.type,
      title: `${existing.title} (Copy)`,
      slug: '',
      excerpt: existing.excerpt,
      body: existing.body,
      status: 'draft',
      is_featured: false,
      sort_order: existing.sort_order,
      category_id: existing.category_id ?? undefined,
      publish_date: '',
      details: Object.fromEntries(Object.entries(existing.details).map(([key, value]) => [key, value ?? ''])),
      seo: existing.seo
        ? {
            seo_title: existing.seo.seo_title ?? '',
            meta_description: existing.seo.meta_description ?? '',
            canonical_url: '',
            og_title: existing.seo.og_title ?? '',
            og_description: existing.seo.og_description ?? '',
            og_image: existing.seo.og_image ?? '',
            twitter_title: existing.seo.twitter_title ?? '',
            twitter_description: existing.seo.twitter_description ?? '',
            twitter_image: existing.seo.twitter_image ?? '',
            no_index: true,
            no_follow: true,
          }
        : undefined,
    });
  },

  async setStatus(id: number, status: ContentStatus): Promise<void> {
    const db = await getDb();
    await db.run(
      `UPDATE content_items SET status = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, datetime('now')) ELSE NULL END,
        is_featured = CASE WHEN ? = 'published' THEN is_featured ELSE 0 END, updated_at = datetime('now')
       WHERE id = ?`,
      [status, status, status, id],
    );
  },

  /** Only one item per type can be featured. */
  async setFeatured(id: number, featured: boolean): Promise<void> {
    const db = await getDb();
    const item = await db.get<{ type: ContentType }>('SELECT type FROM content_items WHERE id = ?', [id]);
    if (!item) return;
    if (featured) {
      await db.run(
        "UPDATE content_items SET is_featured = 0, updated_at = datetime('now') WHERE type = ? AND id <> ?",
        [item.type, id],
      );
    }
    await db.run("UPDATE content_items SET is_featured = ?, updated_at = datetime('now') WHERE id = ?", [
      featured ? 1 : 0,
      id,
    ]);
  },

  async countsByType(): Promise<Record<string, { published: number; draft: number }>> {
    const db = await getDb();
    const rows = await db.all<{ type: string; status: string; count: number }>(
      'SELECT type, status, COUNT(*) AS count FROM content_items GROUP BY type, status',
    );
    const result: Record<string, { published: number; draft: number }> = {};
    for (const row of rows) {
      result[row.type] ??= { published: 0, draft: 0 };
      if (row.status === 'published') result[row.type]!.published = row.count;
      else result[row.type]!.draft = row.count;
    }
    return result;
  },

  async recent(limit = 5): Promise<ContentRecord[]> {
    const db = await getDb();
    return db.all<ContentRecord>(`${BASE_SELECT} ORDER BY ci.updated_at DESC LIMIT ?`, [limit]);
  },

  /** Everything published, for the sitemap. */
  async publishedForSitemap(): Promise<{ type: ContentType; slug: string; updated_at: string }[]> {
    const db = await getDb();
    return db.all(
      "SELECT type, slug, updated_at FROM content_items WHERE status = 'published' ORDER BY type, slug",
    );
  },

  /** SEO health: published items missing key metadata. */
  async seoHealth(): Promise<
    { id: number; type: string; title: string; slug: string; status: string; issues: string[] }[]
  > {
    const db = await getDb();
    const rows = await db.all<{
      id: number;
      type: string;
      title: string;
      slug: string;
      status: string;
      seo_title: string | null;
      meta_description: string | null;
      og_image: string | null;
    }>(
      `SELECT ci.id, ci.type, ci.title, ci.slug, ci.status, s.seo_title, s.meta_description, s.og_image
       FROM content_items ci
       LEFT JOIN seo_meta s ON s.entity_type = ci.type AND s.entity_id = ci.id`,
    );
    return rows.map((row) => {
      const issues: string[] = [];
      if (!row.seo_title) issues.push('No SEO title');
      if (!row.meta_description) issues.push('No meta description');
      if (!row.og_image) issues.push('No share image');
      return { id: row.id, type: row.type, title: row.title, slug: row.slug, status: row.status, issues };
    });
  },
};

export type { SeoMeta };
