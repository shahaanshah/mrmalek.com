import { getDb } from '../db/client.server';
import { SITE_SETTING_KEYS } from '@/lib/cms/content.types';
import type { SiteSettings } from '@/lib/cms/content.types';

const DEFAULTS: SiteSettings = {
  site_title: 'Malek Hussein — Technical Product Leader',
  site_description:
    'Technical Product Leader in Ottawa shipping fintech, marketplace and enterprise platforms end to end.',
  site_logo: '/images/malek-logo.png',
  site_favicon: '/favicon.ico',
  default_og_image: '',
  twitter_handle: '',
  contact_email: '',
  contact_phone: '',
  linkedin_url: '',
  x_url: '',
  youtube_url: '',
  indexing_enabled: 'true',
};

export const settingsRepository = {
  async all(): Promise<SiteSettings> {
    const db = await getDb();
    const rows = await db.all<{ key: string; value: string }>('SELECT key, value FROM site_settings');
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const result = { ...DEFAULTS };
    for (const key of SITE_SETTING_KEYS) {
      if (typeof stored[key] === 'string' && stored[key] !== '') result[key] = stored[key];
    }
    return result;
  },

  async save(values: Partial<SiteSettings>): Promise<void> {
    const db = await getDb();
    for (const key of SITE_SETTING_KEYS) {
      const value = values[key];
      if (value === undefined) continue;
      await db.run(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [key, value],
      );
    }
  },
};

export const SETTING_DEFAULTS = DEFAULTS;
