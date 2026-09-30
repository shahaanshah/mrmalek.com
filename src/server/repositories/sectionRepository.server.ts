import { getDb } from '../db/client.server';
import {
  DEFAULT_LANDING_SECTIONS,
  LandingSection,
  landingSectionSchema,
} from '@/lib/cms/sections.types';

export const sectionRepository = {
  async ensureSeeded(): Promise<void> {
    const db = await getDb();
    try {
      const row = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM landing_sections');
      if (row && row.count > 0) return;
    } catch {
      // Table might not exist yet if migration hasn't run
      return;
    }

    // Read any existing homepage settings (home.*) to preserve previous customizations
    const homeRows = await db.all<{ key: string; value: string }>(
      "SELECT key, value FROM site_settings WHERE key LIKE 'home.%'"
    );
    const existingHome = Object.fromEntries(
      homeRows.map((r) => [r.key.replace(/^home\./, ''), r.value])
    );

    for (const sec of DEFAULT_LANDING_SECTIONS) {
      // Map existing home keys if present
      let kicker = sec.kicker;
      let main_heading = sec.main_heading;
      let highlight_text = sec.highlight_text;
      let subtitle = sec.subtitle;

      if (sec.id === 'cases') {
        kicker = existingHome['work_kicker'] ?? kicker;
        main_heading = existingHome['work_title'] ?? main_heading;
        highlight_text = existingHome['work_highlight'] ?? highlight_text;
        subtitle = existingHome['work_subtitle'] ?? subtitle;
      } else if (sec.id === 'process') {
        kicker = existingHome['process_kicker'] ?? kicker;
        main_heading = existingHome['process_title'] ?? main_heading;
        highlight_text = existingHome['process_highlight'] ?? highlight_text;
        subtitle = existingHome['process_subtitle'] ?? subtitle;
      } else if (sec.id === 'videos') {
        kicker = existingHome['pmtalks_kicker'] ?? kicker;
        main_heading = existingHome['pmtalks_title'] ?? main_heading;
        highlight_text = existingHome['pmtalks_highlight'] ?? highlight_text;
        subtitle = existingHome['pmtalks_subtitle'] ?? subtitle;
      } else if (sec.id === 'toolkit') {
        kicker = existingHome['toolkit_kicker'] ?? kicker;
        main_heading = existingHome['toolkit_title'] ?? main_heading;
        highlight_text = existingHome['toolkit_highlight'] ?? highlight_text;
        subtitle = existingHome['toolkit_subtitle'] ?? subtitle;
      } else if (sec.id === 'history') {
        kicker = existingHome['history_kicker'] ?? kicker;
        main_heading = existingHome['history_title'] ?? main_heading;
        highlight_text = existingHome['history_highlight'] ?? highlight_text;
        subtitle = existingHome['history_subtitle'] ?? subtitle;
      } else if (sec.id === 'ventures') {
        kicker = existingHome['ventures_kicker'] ?? kicker;
        main_heading = existingHome['ventures_title'] ?? main_heading;
        highlight_text = existingHome['ventures_highlight'] ?? highlight_text;
        subtitle = existingHome['ventures_subtitle'] ?? subtitle;
      } else if (sec.id === 'testimonials') {
        kicker = existingHome['testimonials_kicker'] ?? kicker;
        main_heading = existingHome['testimonials_title'] ?? main_heading;
        highlight_text = existingHome['testimonials_highlight'] ?? highlight_text;
        subtitle = existingHome['testimonials_subtitle'] ?? subtitle;
      } else if (sec.id === 'contact') {
        kicker = existingHome['contact_kicker'] ?? kicker;
        main_heading = existingHome['contact_title'] ?? main_heading;
        highlight_text = existingHome['contact_highlight'] ?? highlight_text;
        subtitle = existingHome['contact_subtitle'] ?? subtitle;
      } else if (sec.id === 'about') {
        kicker = existingHome['intro_kicker'] ?? kicker;
        main_heading = existingHome['intro_title'] ?? main_heading;
      }

      await db.run(
        `INSERT OR IGNORE INTO landing_sections (
          id, title, description, kicker, kicker_icon, kicker_logo_url,
          kicker_font_size, kicker_font_family, kicker_font_weight,
          kicker_text_color, kicker_bg_color, kicker_border_color, kicker_icon_color,
          kicker_letter_spacing, kicker_text_transform, kicker_enabled,
          main_heading, highlight_text, subtitle, is_enabled, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sec.id,
          sec.title,
          sec.description ?? '',
          kicker ?? '',
          sec.kicker_icon ?? 'sparkles',
          sec.kicker_logo_url ?? '',
          sec.kicker_font_size ?? '0.75rem',
          sec.kicker_font_family ?? 'mono',
          sec.kicker_font_weight ?? '600',
          sec.kicker_text_color ?? 'var(--accent-gold-light)',
          sec.kicker_bg_color ?? 'var(--accent-gold-bg)',
          sec.kicker_border_color ?? 'var(--accent-gold-border)',
          sec.kicker_icon_color ?? 'var(--accent-gold)',
          sec.kicker_letter_spacing ?? '0.08em',
          sec.kicker_text_transform ?? 'uppercase',
          sec.kicker_enabled ?? 1,
          main_heading ?? '',
          highlight_text ?? '',
          subtitle ?? '',
          sec.is_enabled ?? 1,
          sec.sort_order ?? 0,
        ]
      );
    }
  },

  async list(): Promise<LandingSection[]> {
    await this.ensureSeeded();
    const db = await getDb();
    try {
      const rows = await db.all<Record<string, unknown>>(
        'SELECT * FROM landing_sections ORDER BY sort_order ASC, id ASC'
      );
      if (!rows || rows.length === 0) return DEFAULT_LANDING_SECTIONS;
      return rows.map((row) => landingSectionSchema.parse(row));
    } catch {
      return DEFAULT_LANDING_SECTIONS;
    }
  },

  async getMap(): Promise<Record<string, LandingSection>> {
    const list = await this.list();
    return Object.fromEntries(list.map((sec) => [sec.id, sec]));
  },

  async getById(id: string): Promise<LandingSection | null> {
    const db = await getDb();
    const row = await db.get<Record<string, unknown>>(
      'SELECT * FROM landing_sections WHERE id = ?',
      [id]
    );
    if (!row) return null;
    return landingSectionSchema.parse(row);
  },

  async save(data: LandingSection): Promise<void> {
    const db = await getDb();
    await this.ensureSeeded();
    const sec = landingSectionSchema.parse(data);

    await db.run(
      `INSERT INTO landing_sections (
        id, title, description, kicker, kicker_icon, kicker_logo_url,
        kicker_font_size, kicker_font_family, kicker_font_weight,
        kicker_text_color, kicker_bg_color, kicker_border_color, kicker_icon_color,
        kicker_letter_spacing, kicker_text_transform, kicker_enabled,
        main_heading, highlight_text, subtitle, is_enabled, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        kicker = excluded.kicker,
        kicker_icon = excluded.kicker_icon,
        kicker_logo_url = excluded.kicker_logo_url,
        kicker_font_size = excluded.kicker_font_size,
        kicker_font_family = excluded.kicker_font_family,
        kicker_font_weight = excluded.kicker_font_weight,
        kicker_text_color = excluded.kicker_text_color,
        kicker_bg_color = excluded.kicker_bg_color,
        kicker_border_color = excluded.kicker_border_color,
        kicker_icon_color = excluded.kicker_icon_color,
        kicker_letter_spacing = excluded.kicker_letter_spacing,
        kicker_text_transform = excluded.kicker_text_transform,
        kicker_enabled = excluded.kicker_enabled,
        main_heading = excluded.main_heading,
        highlight_text = excluded.highlight_text,
        subtitle = excluded.subtitle,
        is_enabled = excluded.is_enabled,
        sort_order = excluded.sort_order,
        updated_at = datetime('now')`,
      [
        sec.id,
        sec.title,
        sec.description ?? '',
        sec.kicker ?? '',
        sec.kicker_icon ?? 'sparkles',
        sec.kicker_logo_url ?? '',
        sec.kicker_font_size ?? '0.75rem',
        sec.kicker_font_family ?? 'mono',
        sec.kicker_font_weight ?? '600',
        sec.kicker_text_color ?? 'var(--accent-gold-light)',
        sec.kicker_bg_color ?? 'var(--accent-gold-bg)',
        sec.kicker_border_color ?? 'var(--accent-gold-border)',
        sec.kicker_icon_color ?? 'var(--accent-gold)',
        sec.kicker_letter_spacing ?? '0.08em',
        sec.kicker_text_transform ?? 'uppercase',
        sec.kicker_enabled ? 1 : 0,
        sec.main_heading ?? '',
        sec.highlight_text ?? '',
        sec.subtitle ?? '',
        sec.is_enabled ? 1 : 0,
        sec.sort_order ?? 0,
      ]
    );

    // Also sync back to home.* for full backward compatibility
    await this.syncToHomepageSettings(sec);
  },

  async toggleEnabled(id: string, isEnabled: boolean): Promise<void> {
    const db = await getDb();
    await db.run(
      "UPDATE landing_sections SET is_enabled = ?, updated_at = datetime('now') WHERE id = ?",
      [isEnabled ? 1 : 0, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM landing_sections WHERE id = ?', [id]);
  },

  async reorder(orderedIds: string[]): Promise<void> {
    const db = await getDb();
    for (let i = 0; i < orderedIds.length; i++) {
      await db.run(
        "UPDATE landing_sections SET sort_order = ?, updated_at = datetime('now') WHERE id = ?",
        [i, orderedIds[i]]
      );
    }
  },

  async syncToHomepageSettings(sec: LandingSection): Promise<void> {
    const db = await getDb();
    const map: Record<string, [string, string, string, string]> = {
      cases: ['work_kicker', 'work_title', 'work_highlight', 'work_subtitle'],
      process: ['process_kicker', 'process_title', 'process_highlight', 'process_subtitle'],
      videos: ['pmtalks_kicker', 'pmtalks_title', 'pmtalks_highlight', 'pmtalks_subtitle'],
      toolkit: ['toolkit_kicker', 'toolkit_title', 'toolkit_highlight', 'toolkit_subtitle'],
      history: ['history_kicker', 'history_title', 'history_highlight', 'history_subtitle'],
      ventures: ['ventures_kicker', 'ventures_title', 'ventures_highlight', 'ventures_subtitle'],
      testimonials: ['testimonials_kicker', 'testimonials_title', 'testimonials_highlight', 'testimonials_subtitle'],
      contact: ['contact_kicker', 'contact_title', 'contact_highlight', 'contact_subtitle'],
    };

    const keys = map[sec.id];
    if (!keys) return;

    const [kKey, tKey, hKey, sKey] = keys;
    const values: [string, string][] = [
      [`home.${kKey}`, sec.kicker ?? ''],
      [`home.${tKey}`, sec.main_heading ?? ''],
      [`home.${hKey}`, sec.highlight_text ?? ''],
      [`home.${sKey}`, sec.subtitle ?? ''],
    ];

    for (const [k, v] of values) {
      await db.run(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [k, v]
      );
    }
  },
};
