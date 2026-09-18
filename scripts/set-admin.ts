import { hashPassword } from '../src/server/auth/password.server';
import { getDb } from '../src/server/db/client.server';

const email = process.argv[2] || process.env['CMS_ADMIN_EMAIL'] || 'admin@mrmalek.com';
const password = process.argv[3] || process.env['CMS_ADMIN_INITIAL_PASSWORD'] || 'admin123456';

async function main() {
  console.log(`Setting admin credentials for: ${email}`);
  const db = await getDb();
  const passwordHash = await hashPassword(password);

  const existing = await db.get<{ id: number }>('SELECT id FROM admins WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    await db.run('UPDATE admins SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [
      passwordHash,
      existing.id,
    ]);
    console.log(`Updated password for admin: ${email}`);
  } else {
    await db.run('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [email.toLowerCase(), passwordHash]);
    console.log(`Created new admin user: ${email}`);
  }
}

main().catch((err) => {
  console.error('Failed to set admin:', err);
  process.exit(1);
});
