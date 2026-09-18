import { getDb } from '../db/client.server';
import type { Category } from '@/lib/cms/types';
import { slugify } from '@/lib/cms/types';

export const categoryRepository = {
  async list(): Promise<Category[]> {
    const db = await getDb();
    return db.all<Category>('SELECT * FROM categories ORDER BY name ASC');
  },

  async findById(id: number): Promise<Category | null> {
    const db = await getDb();
    return db.get<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  },

  async create(name: string): Promise<Category> {
    const db = await getDb();
    const slug = slugify(name);
    const existing = await db.get<Category>('SELECT * FROM categories WHERE slug = ?', [slug]);
    if (existing) return existing;
    const { lastInsertRowid } = await db.run('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    return (await db.get<Category>('SELECT * FROM categories WHERE id = ?', [lastInsertRowid]))!;
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
  },
};
