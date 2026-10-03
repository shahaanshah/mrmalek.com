// Ordered schema migrations. Each entry runs once, in order, and is recorded
// in the _migrations table so re-running is safe.
export interface Migration {
  name: string;
  sql: string;
}

export const migrations: Migration[] = [
  {
    name: '001_init',
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        publish_date TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_published INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_videos_published ON videos (is_published, publish_date);
      CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category_id);
    `,
  },
  {
    // Generic CMS spine: one shared content table for every editorial type,
    // narrow per-type detail tables, plus SEO / media / tags / settings.
    name: '002_content_architecture',
    sql: `
      CREATE TABLE IF NOT EXISTS content_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        is_featured INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        publish_date TEXT,
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (type, slug)
      );

      CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items (type, status);
      CREATE INDEX IF NOT EXISTS idx_content_publish_date ON content_items (publish_date);
      CREATE INDEX IF NOT EXISTS idx_content_featured ON content_items (type, is_featured);
      CREATE INDEX IF NOT EXISTS idx_content_category ON content_items (category_id);

      CREATE TABLE IF NOT EXISTS case_study_details (
        content_id INTEGER PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
        client TEXT,
        industry TEXT,
        role TEXT,
        period TEXT,
        image_url TEXT,
        problem TEXT,
        architecture TEXT,
        decisions TEXT,
        outcomes TEXT,
        results TEXT
      );

      CREATE TABLE IF NOT EXISTS venture_details (
        content_id INTEGER PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
        website_url TEXT,
        logo_url TEXT,
        venture_status TEXT
      );

      CREATE TABLE IF NOT EXISTS framework_details (
        content_id INTEGER PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
        image_url TEXT,
        step_label TEXT
      );

      CREATE TABLE IF NOT EXISTS page_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        section_key TEXT NOT NULL,
        heading TEXT,
        subheading TEXT,
        body TEXT,
        data TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (content_id, section_key)
      );

      -- SEO is keyed by (entity_type, entity_id) so it also covers the
      -- existing videos table without moving that data.
      CREATE TABLE IF NOT EXISTS seo_meta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        seo_title TEXT,
        meta_description TEXT,
        canonical_url TEXT,
        og_title TEXT,
        og_description TEXT,
        og_image TEXT,
        twitter_title TEXT,
        twitter_description TEXT,
        twitter_image TEXT,
        no_index INTEGER NOT NULL DEFAULT 0,
        no_follow INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (entity_type, entity_id)
      );

      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        alt_text TEXT NOT NULL DEFAULT '',
        usage_note TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS content_tags (
        content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (content_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        admin_email TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        summary TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log (created_at);
    `,
  },
  {
    name: '003_editorial_workflow',
    sql: `
      CREATE TABLE IF NOT EXISTS content_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        snapshot TEXT NOT NULL,
        created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_revisions_entity
        ON content_revisions (entity_type, entity_id, created_at DESC);
    `,
  },
  {
    // Extra case-study fields so the homepage slider can be driven entirely
    // from the CMS (what I delivered, tag chips, trusted-by logo aliases).
    name: '004_case_study_homepage_fields',
    sql: `
      ALTER TABLE case_study_details ADD COLUMN solution TEXT;
      ALTER TABLE case_study_details ADD COLUMN tags TEXT;
      ALTER TABLE case_study_details ADD COLUMN aliases TEXT;
    `,
  },
  {
    // Dedicated tables for 100% CMS-driven landing page:
    // Partners, Experiences, Education, Certifications, Toolkits, Other Projects, Testimonials.
    name: '005_full_landing_cms',
    sql: `
      CREATE TABLE IF NOT EXISTS client_partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        logo_image TEXT NOT NULL DEFAULT '',
        logo_text TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        period TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'Full-time',
        badge TEXT,
        description TEXT NOT NULL DEFAULT '',
        impact TEXT,
        achievements TEXT NOT NULL DEFAULT '',
        skills TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        year TEXT NOT NULL DEFAULT '',
        details TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        issuer TEXT NOT NULL,
        year TEXT NOT NULL DEFAULT 'Certified',
        credential_id TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS toolkits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        tools TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS other_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        domain TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        logo_image TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        quote TEXT NOT NULL,
        linkedin TEXT,
        avatar_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '006_partner_case_link_and_venture_images',
    sql: `
      ALTER TABLE client_partners ADD COLUMN linked_case_study_id INTEGER;
      ALTER TABLE venture_details ADD COLUMN cover_image TEXT;
    `,
  },
  {
    name: '007_landing_sections_customizer',
    sql: `
      CREATE TABLE IF NOT EXISTS landing_sections (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        kicker TEXT,
        kicker_icon TEXT DEFAULT 'sparkles',
        kicker_logo_url TEXT,
        kicker_font_size TEXT DEFAULT '0.75rem',
        kicker_font_family TEXT DEFAULT 'mono',
        kicker_font_weight TEXT DEFAULT '600',
        kicker_text_color TEXT DEFAULT 'var(--accent-gold-light)',
        kicker_bg_color TEXT DEFAULT 'var(--accent-gold-bg)',
        kicker_border_color TEXT DEFAULT 'var(--accent-gold-border)',
        kicker_icon_color TEXT DEFAULT 'var(--accent-gold)',
        kicker_letter_spacing TEXT DEFAULT '0.08em',
        kicker_text_transform TEXT DEFAULT 'uppercase',
        kicker_enabled INTEGER NOT NULL DEFAULT 1,
        main_heading TEXT,
        highlight_text TEXT,
        subtitle TEXT,
        is_enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    name: '008_collapsible_sections',
    sql: `
      ALTER TABLE landing_sections ADD COLUMN is_collapsible INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE landing_sections ADD COLUMN default_collapsed INTEGER NOT NULL DEFAULT 0;
    `,
  },
];
