import { getDb } from '../db/client.server';
import type { MediaInput, MediaItem } from '@/lib/cms/content.types';

export const mediaRepository = {
  async list(search?: string): Promise<MediaItem[]> {
    const db = await getDb();
    if (search) {
      return db.all<MediaItem>(
        'SELECT * FROM media WHERE file_name LIKE ? OR alt_text LIKE ? ORDER BY created_at DESC',
        [`%${search}%`, `%${search}%`],
      );
    }
    return db.all<MediaItem>('SELECT * FROM media ORDER BY created_at DESC');
  },

  async findById(id: number): Promise<MediaItem | null> {
    const db = await getDb();
    return db.get<MediaItem>('SELECT * FROM media WHERE id = ?', [id]);
  },

  async create(input: MediaInput): Promise<MediaItem> {
    const db = await getDb();
    const { lastInsertRowid } = await db.run(
      'INSERT INTO media (file_name, url, thumbnail_url, alt_text, usage_note) VALUES (?, ?, ?, ?, ?)',
      [input.file_name, input.url, input.thumbnail_url || null, input.alt_text ?? '', input.usage_note || null],
    );
    return (await this.findById(lastInsertRowid))!;
  },

  async update(id: number, input: MediaInput): Promise<void> {
    const db = await getDb();
    await db.run(
      `UPDATE media SET file_name = ?, url = ?, thumbnail_url = ?, alt_text = ?, usage_note = ?,
        updated_at = datetime('now') WHERE id = ?`,
      [input.file_name, input.url, input.thumbnail_url || null, input.alt_text ?? '', input.usage_note || null, id],
    );
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM media WHERE id = ?', [id]);
  },
};
