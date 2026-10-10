import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

// Auto-load .env
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

const adminEmail = (process.argv[2] || process.env['CMS_ADMIN_EMAIL'] || 'admin@mrmalek.com').toLowerCase();
const adminPass = process.argv[3] || process.env['CMS_ADMIN_INITIAL_PASSWORD'] || 'admin123456';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const iterations = 120000;
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256');
  return `pbkdf2$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function main() {
  console.log(`🔑 Setting admin account credentials:`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPass}`);

  const pool = databaseUrl
    ? mysql.createPool({ uri: databaseUrl, waitForConnections: true })
    : mysql.createPool({ host, port, user, password, database, waitForConnections: true });

  const passwordHash = hashPassword(adminPass);

  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
    [adminEmail, passwordHash, passwordHash]
  );

  console.log(`✅ Admin account updated successfully in database!`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to update admin:', err);
  process.exit(1);
});
