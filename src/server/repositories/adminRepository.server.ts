import { getDb } from '../db/client.server';
import { hashPassword, verifyPassword } from '../auth/password.server';

export interface AdminRecord {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

/** Public shape — never includes the password hash. */
export interface AdminProfile {
  id: number;
  email: string;
  created_at: string;
}

export const adminRepository = {
  async findByEmail(email: string): Promise<AdminRecord | null> {
    const db = await getDb();
    return db.get<AdminRecord>('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
  },

  async findById(id: number): Promise<AdminProfile | null> {
    const db = await getDb();
    return db.get<AdminProfile>('SELECT id, email, created_at FROM admins WHERE id = ?', [id]);
  },

  /** Returns the admin profile when the credentials are valid, otherwise null. */
  async verifyCredentials(email: string, password: string): Promise<AdminProfile | null> {
    const admin = await this.findByEmail(email);
    if (!admin) return null;
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) return null;
    return { id: admin.id, email: admin.email, created_at: admin.created_at };
  },

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const db = await getDb();
    await db.run("UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [
      await hashPassword(newPassword),
      id,
    ]);
  },
};
