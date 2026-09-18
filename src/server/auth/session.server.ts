import { useSession } from '@tanstack/react-start/server';

export interface AdminSessionData {
  adminId?: number;
  email?: string;
}

// Built per call: env is injected per request on edge runtimes.
function sessionConfig() {
  const password = process.env['CMS_SESSION_SECRET'] || 'mrmalek-secure-session-key-fallback-32chars-minimum!';
  const isProduction = process.env['NODE_ENV'] === 'production';
  return {
    password,
    name: 'mrmalek-admin',
    maxAge: 60 * 60 * 12,
    // SameSite=None + secure on production for iframe preview compatibility, Lax on dev
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
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
