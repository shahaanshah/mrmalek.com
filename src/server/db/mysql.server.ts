import type { SqlExecutor } from './client.server';

/**
 * Translates SQLite dialect idioms into standard MySQL syntax.
 */
export function adaptQueryForMysql(sql: string): string {
  let adapted = sql
    // Normalize datetime/date functions
    .replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE')
    // Insert ignore
    .replace(/INSERT\s+OR\s+IGNORE/gi, 'INSERT IGNORE')
    // SQLite upsert ON CONFLICT ... DO UPDATE SET to MySQL ON DUPLICATE KEY UPDATE
    .replace(/ON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET/gi, 'ON DUPLICATE KEY UPDATE')
    // SQLite excluded.column to MySQL VALUES(column)
    .replace(/excluded\.(\w+)/gi, 'VALUES($1)');

  return adapted;
}

const MYSQL_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS _migrations (
    name VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration VARCHAR(50),
    category_id INT NULL,
    publish_date VARCHAR(50),
    is_featured INT NOT NULL DEFAULT 0,
    is_published INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS content_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT,
    body LONGTEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_featured INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    category_id INT NULL,
    publish_date VARCHAR(50),
    published_at VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_content_type_slug (type, slug),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS case_study_details (
    content_id INT PRIMARY KEY,
    client VARCHAR(255),
    industry VARCHAR(255),
    role VARCHAR(255),
    period VARCHAR(255),
    image_url TEXT,
    problem LONGTEXT,
    architecture LONGTEXT,
    decisions LONGTEXT,
    outcomes LONGTEXT,
    results LONGTEXT,
    solution LONGTEXT,
    tags TEXT,
    aliases TEXT,
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS venture_details (
    content_id INT PRIMARY KEY,
    website_url TEXT,
    logo_url TEXT,
    venture_status VARCHAR(64),
    cover_image TEXT,
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS framework_details (
    content_id INT PRIMARY KEY,
    image_url TEXT,
    step_label VARCHAR(64),
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS seo_meta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id INT NOT NULL,
    seo_title VARCHAR(255),
    meta_description TEXT,
    canonical_url TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    twitter_title VARCHAR(255),
    twitter_description TEXT,
    twitter_image TEXT,
    no_index INT NOT NULL DEFAULT 0,
    no_follow INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_seo_entity (entity_type, entity_id)
  )`,

  `CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    usage_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS content_tags (
    content_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (content_id, tag_id),
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    \`key\` VARCHAR(191) PRIMARY KEY,
    value LONGTEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    admin_email VARCHAR(255),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id INT,
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS content_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id INT NOT NULL,
    snapshot LONGTEXT NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS client_partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL DEFAULT '',
    logo_image TEXT,
    logo_text VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    linked_case_study_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL DEFAULT '',
    period VARCHAR(255) NOT NULL DEFAULT '',
    type VARCHAR(64) NOT NULL DEFAULT 'Full-time',
    badge VARCHAR(255) NULL,
    description LONGTEXT,
    impact TEXT NULL,
    achievements LONGTEXT,
    skills TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL DEFAULT '',
    year VARCHAR(64) NOT NULL DEFAULT '',
    details TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    year VARCHAR(64) NOT NULL DEFAULT 'Certified',
    credential_id VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS toolkits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tools LONGTEXT,
    note TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS other_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(255) NOT NULL DEFAULT '',
    summary LONGTEXT,
    logo_image TEXT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '',
    company VARCHAR(255) NOT NULL DEFAULT '',
    quote LONGTEXT NOT NULL,
    linkedin VARCHAR(255) NULL,
    avatar_url TEXT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS landing_sections (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    kicker VARCHAR(255),
    kicker_icon VARCHAR(64) DEFAULT 'sparkles',
    kicker_logo_url TEXT,
    kicker_font_size VARCHAR(32) DEFAULT '0.75rem',
    kicker_font_family VARCHAR(32) DEFAULT 'mono',
    kicker_font_weight VARCHAR(32) DEFAULT '600',
    kicker_text_color VARCHAR(64) DEFAULT 'var(--accent-gold-light)',
    kicker_bg_color VARCHAR(64) DEFAULT 'var(--accent-gold-bg)',
    kicker_border_color VARCHAR(64) DEFAULT 'var(--accent-gold-border)',
    kicker_icon_color VARCHAR(64) DEFAULT 'var(--accent-gold)',
    kicker_letter_spacing VARCHAR(32) DEFAULT '0.08em',
    kicker_text_transform VARCHAR(32) DEFAULT 'uppercase',
    kicker_enabled INT NOT NULL DEFAULT 1,
    main_heading TEXT,
    highlight_text TEXT,
    subtitle TEXT,
    is_enabled INT NOT NULL DEFAULT 1,
    is_collapsible INT NOT NULL DEFAULT 0,
    default_collapsed INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
];

export async function createMysqlExecutor(databaseUrl?: string): Promise<SqlExecutor> {
  const mysql = await import('mysql2/promise');

  const pool = databaseUrl
    ? mysql.createPool({
        uri: databaseUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      })
    : mysql.createPool({
        host: process.env['MYSQL_HOST'] || process.env['DB_HOST'] || '127.0.0.1',
        port: Number(process.env['MYSQL_PORT'] || process.env['DB_PORT'] || 3306),
        user: process.env['MYSQL_USER'] || process.env['DB_USER'] || 'root',
        password: process.env['MYSQL_PASSWORD'] || process.env['DB_PASSWORD'] || '',
        database: process.env['MYSQL_DATABASE'] || process.env['DB_NAME'] || 'mrmalek',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

  // Test the connection immediately
  await pool.query('SELECT 1');

  return {
    async all<T>(sql: string, params: unknown[] = []) {
      const mysqlSql = adaptQueryForMysql(sql);
      const [rows] = await pool.query(mysqlSql, params as never[]);
      return rows as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      const mysqlSql = adaptQueryForMysql(sql);
      const [rows] = await pool.query(mysqlSql, params as never[]);
      const arr = rows as T[];
      return (arr && arr.length > 0 ? arr[0] : null) as T | null;
    },
    async run(sql: string, params: unknown[] = []) {
      const mysqlSql = adaptQueryForMysql(sql);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [result] = (await pool.execute(mysqlSql, params as never[])) as any;
      return { lastInsertRowid: Number(result?.insertId ?? 0) };
    },
    async exec(sql: string) {
      const mysqlSql = adaptQueryForMysql(sql);
      await pool.query(mysqlSql);
    },
  };
}

export async function initMysqlSchema(db: SqlExecutor): Promise<void> {
  for (const statement of MYSQL_SCHEMA_STATEMENTS) {
    await db.exec(statement);
  }
}
