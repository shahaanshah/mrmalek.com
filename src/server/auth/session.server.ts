import { useSession } from '@tanstack/react-start/server';

export interface AdminSessionData {
  adminId?: number;
  email?: string;
}

function sessionConfig() {
  const password = process.env['CMS_SESSION_SECRET'] || 'mrmalek-secure-session-key-fallback-32chars-minimum!';
  // Secure cookies require HTTPS. Only enforce 'secure' if explicitly forced via COOKIE_SECURE=true
  // or FORCE_SSL=true, or if APP_URL starts with https://.
  // This allows logging in on HTTP testing URLs (e.g. sslip.io or raw VPS IP) while still supporting HTTPS.
  const isHttps =
    process.env['COOKIE_SECURE'] === 'true' ||
    process.env['FORCE_SSL'] === 'true' ||
    (process.env['APP_URL']?.startsWith('https://') ?? false);

  return {
    password,
    name: 'mrmalek-admin',
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax' as const,
      path: '/',
    },
  };
}

export async function getAdminSession() {
  return useSession<AdminSessionData>(sessionConfig());
}

/** Returns the signed-in admin id, or null. Server-side source of truth. */
export async function currentAdminId(): Promise<number | null> {
  const session = await getAdminSession();
  return session.data.adminId ?? null;
}
