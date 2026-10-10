import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

// 1. Auto-load .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const databaseUrl = process.env['DATABASE_URL'];
const host = process.env['MYSQL_HOST'] || '127.0.0.1';
const port = Number(process.env['MYSQL_PORT'] || 3306);
const user = process.env['MYSQL_USER'] || 'root';
const password = process.env['MYSQL_PASSWORD'] || '';
const database = process.env['MYSQL_DATABASE'] || 'malekpm';

const adminEmail = (process.env['CMS_ADMIN_EMAIL'] || 'admin@mrmalek.com').toLowerCase();
const adminPass = process.env['CMS_ADMIN_INITIAL_PASSWORD'] || 'admin123456';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const iterations = 120000;
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256');
  return `pbkdf2$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
}


async function run() {
  console.log('🔄 Connecting to MySQL...');
  const pool = databaseUrl
    ? mysql.createPool({ uri: databaseUrl, waitForConnections: true })
    : mysql.createPool({ host, port, user, password, database, waitForConnections: true });

  await pool.query('SELECT 1');
  console.log('✅ Connected to MySQL successfully!');

  // Schema creation
  const SCHEMA_STATEMENTS = [
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
    )`
  ];

  for (const stmt of SCHEMA_STATEMENTS) {
    await pool.query(stmt);
  }
  console.log('✅ Created/verified all 23 tables in MySQL!');

  // Ensure missing columns exist in existing tables
  const REQUIRED_COLUMNS = [
    { table: 'content_items', column: 'publish_date', definition: 'VARCHAR(50) NULL' },
    { table: 'content_items', column: 'published_at', definition: 'VARCHAR(50) NULL' },
    { table: 'case_study_details', column: 'industry', definition: 'VARCHAR(255) NULL' },
    { table: 'case_study_details', column: 'role', definition: 'VARCHAR(255) NULL' },
    { table: 'case_study_details', column: 'period', definition: 'VARCHAR(255) NULL' },
    { table: 'case_study_details', column: 'image_url', definition: 'TEXT NULL' },
    { table: 'case_study_details', column: 'problem', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'architecture', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'decisions', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'outcomes', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'results', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'solution', definition: 'LONGTEXT NULL' },
    { table: 'case_study_details', column: 'tags', definition: 'TEXT NULL' },
    { table: 'case_study_details', column: 'aliases', definition: 'TEXT NULL' },
    { table: 'venture_details', column: 'website_url', definition: 'TEXT NULL' },
    { table: 'venture_details', column: 'logo_url', definition: 'TEXT NULL' },
    { table: 'venture_details', column: 'venture_status', definition: 'VARCHAR(64) NULL' },
    { table: 'venture_details', column: 'cover_image', definition: 'TEXT NULL' },
    { table: 'framework_details', column: 'image_url', definition: 'TEXT NULL' },
    { table: 'framework_details', column: 'step_label', definition: 'VARCHAR(64) NULL' },
    { table: 'client_partners', column: 'linked_case_study_id', definition: 'INT NULL' },
    { table: 'experiences', column: 'type', definition: "VARCHAR(64) NOT NULL DEFAULT 'Full-time'" },
    { table: 'experiences', column: 'badge', definition: 'VARCHAR(255) NULL' },
    { table: 'experiences', column: 'impact', definition: 'TEXT NULL' },
    { table: 'experiences', column: 'achievements', definition: 'LONGTEXT NULL' },
    { table: 'experiences', column: 'skills', definition: 'TEXT NULL' },
    { table: 'media', column: 'file_name', definition: 'VARCHAR(255) NULL' },
    { table: 'media', column: 'thumbnail_url', definition: 'TEXT NULL' },
    { table: 'media', column: 'alt_text', definition: 'TEXT NULL' },
    { table: 'media', column: 'usage_note', definition: 'TEXT NULL' },
  ];

  for (const { table, column, definition } of REQUIRED_COLUMNS) {
    try {
      const [cols] = await pool.query(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [table, column]
      );
      if (Array.isArray(cols) && cols.length === 0) {
        console.log(`[migration] Adding missing column ${column} to table ${table}...`);
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      }
    } catch (colErr) {
      console.warn(`[migration] Notice on ${table}.${column}:`, colErr.message);
    }
  }

  // Seed default admin
  const hashed = hashPassword(adminPass);
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
    [adminEmail, hashed, hashed]
  );
  console.log(`✅ Admin account configured: ${adminEmail}`);

  // Fetch created tables
  const [tables] = await pool.query('SHOW TABLES');
  console.log(`🎉 Total tables in database: ${tables.length}`);

  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
