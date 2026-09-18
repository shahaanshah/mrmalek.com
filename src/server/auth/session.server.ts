import { useSession } from '@tanstack/react-start/server';

export interface AdminSessionData {
  adminId?: number;
  email?: string;
}

// Built per call: env is injected per request on edge runtimes.
function sessionConfig() {
  const password = process.env['CMS_SESSION_SECRET'];
  if (!password) throw new Error('CMS_SESSION_SECRET is not set');
  return {
    password,
    name: 'mrmalek-admin',
    maxAge: 60 * 60 * 12,
    // SameSite=None so the session also works inside the Lovable preview
    // iframe, which is a cross-site context. Server functions stay protected
    // by the CSRF origin check in src/start.ts.
    cookie: { httpOnly: true, secure: true, sameSite: 'none' as const, path: '/' },
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
