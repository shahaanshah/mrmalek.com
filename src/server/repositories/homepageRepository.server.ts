// Homepage copy lives in the generic key/value settings table under a
// `home.` prefix, so adding a field never needs a schema migration.
import { getDb } from '../db/client.server';
import { HOMEPAGE_DEFAULTS, HOMEPAGE_KEYS } from '@/lib/cms/homepage.types';
import type { HomepageContent, HomepageKey } from '@/lib/cms/homepage.types';

const PREFIX = 'home.';

export const homepageRepository = {
  async all(): Promise<HomepageContent> {
    const db = await getDb();
    const rows = await db.all<{ key: string; value: string }>(
      "SELECT key, value FROM site_settings WHERE key LIKE 'home.%'",
    );
    const stored = Object.fromEntries(rows.map((row) => [row.key.slice(PREFIX.length), row.value]));
    const result = { ...HOMEPAGE_DEFAULTS };
    for (const key of HOMEPAGE_KEYS) {
      if (typeof stored[key] === 'string') result[key] = stored[key];
    }
    return result;
  },

  async save(values: Partial<Record<HomepageKey, string>>): Promise<void> {
    const db = await getDb();
    for (const key of HOMEPAGE_KEYS) {
      const value = values[key];
      if (value === undefined) continue;
      await db.run(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [PREFIX + key, value],
      );
    }
  },
};
