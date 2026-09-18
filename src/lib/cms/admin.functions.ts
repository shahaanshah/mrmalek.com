import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { categoryInputSchema, loginSchema, videoInputSchema } from './types';
import type { Category, VideoWithCategory } from './types';

/**
 * Server-side authorization. Every admin server function calls this first —
 * the route guard is only UX, this is the security boundary.
 */
async function requireAdmin(): Promise<number> {
  const { currentAdminId } = await import('@/server/auth/session.server');
  const adminId = await currentAdminId();
  if (!adminId) throw redirect({ to: '/admin/login' });
  return adminId;
}

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const idsSchema = z.object({ ids: z.array(z.coerce.number().int().positive()).min(1).max(100) });

async function auditVideo(action: string, entityId: number | null, summary: string) {
  const adminId = await requireAdmin();
  const [{ adminRepository }, { activityRepository }] = await Promise.all([
    import('@/server/repositories/adminRepository.server'),
    import('@/server/repositories/activityRepository.server'),
  ]);
  const profile = await adminRepository.findById(adminId);
  await activityRepository.log({ adminId, adminEmail: profile?.email ?? '', action, entityType: 'video', entityId, summary });
}

/* ------------------------------- auth ---------------------------------- */

export const adminLogin = createServerFn({ method: 'POST' })
  .validator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const { adminRepository } = await import('@/server/repositories/adminRepository.server');
    const { getAdminSession } = await import('@/server/auth/session.server');
    const admin = await adminRepository.verifyCredentials(data.email, data.password);
    if (!admin) return { ok: false as const, error: 'Incorrect email or password' };
    const session = await getAdminSession();
    await session.update({ adminId: admin.id, email: admin.email });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => {
  const { getAdminSession } = await import('@/server/auth/session.server');
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

/** Redirects to the login page when there is no valid session. */
export const requireAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const adminId = await requireAdmin();
  const { adminRepository } = await import('@/server/repositories/adminRepository.server');
  const profile = await adminRepository.findById(adminId);
  return { email: profile?.email ?? '', id: adminId };
});

/* ------------------------------ dashboard ------------------------------- */

export const adminDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const { videoRepository } = await import('@/server/repositories/videoRepository.server');
  return videoRepository.stats();
});

/* -------------------------------- videos -------------------------------- */

export const adminListVideos = createServerFn({ method: 'GET' }).handler(async (): Promise<VideoWithCategory[]> => {
  await requireAdmin();
  const { videoRepository } = await import('@/server/repositories/videoRepository.server');
  return videoRepository.listAll();
});

export const adminGetVideo = createServerFn({ method: 'GET' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }): Promise<VideoWithCategory | null> => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    return videoRepository.findById(data.id);
  });

export const adminCreateVideo = createServerFn({ method: 'POST' })
  .validator((input: unknown) => videoInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    const video = await videoRepository.create(data);
    return { ok: true as const, id: video.id };
  });

export const adminUpdateVideo = createServerFn({ method: 'POST' })
  .validator((input: unknown) => videoInputSchema.extend({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const adminId = await requireAdmin();
    const { id, ...input } = data;
    const [{ videoRepository }, { revisionRepository }] = await Promise.all([
      import('@/server/repositories/videoRepository.server'),
      import('@/server/repositories/revisionRepository.server'),
    ]);
    const previous = await videoRepository.findById(id);
    if (previous) await revisionRepository.create('video', id, previous, adminId);
    await videoRepository.update(id, input);
    await auditVideo('update', id, input.title);
    return { ok: true as const, id };
  });

export const adminDeleteVideo = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    await videoRepository.remove(data.id);
    return { ok: true as const };
  });

export const adminSetPublished = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ published: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    await videoRepository.setPublished(data.id, data.published);
    return { ok: true as const };
  });

export const adminSetFeatured = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ featured: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    await videoRepository.setFeatured(data.id, data.featured);
    return { ok: true as const };
  });

export const adminDuplicateVideo = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    const copy = await videoRepository.duplicate(data.id);
    if (!copy) return { ok: false as const, error: 'That episode no longer exists.' };
    await auditVideo('duplicate', copy.id, copy.title);
    return { ok: true as const, id: copy.id };
  });

export const adminBulkVideos = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    idsSchema.extend({ action: z.enum(['publish', 'draft', 'delete']) }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    for (const id of data.ids) {
      if (data.action === 'delete') await videoRepository.remove(id);
      else await videoRepository.setPublished(id, data.action === 'publish');
    }
    await auditVideo('bulk', null, `${data.action}: ${data.ids.length} episodes`);
    return { ok: true as const };
  });

export const adminListVideoRevisions = createServerFn({ method: 'GET' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { revisionRepository } = await import('@/server/repositories/revisionRepository.server');
    const revisions = await revisionRepository.list('video', data.id);
    return revisions.map(({ id, created_at }) => ({ id, created_at }));
  });

export const adminRestoreVideoRevision = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ videoId: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const adminId = await requireAdmin();
    const [{ revisionRepository }, { videoRepository }] = await Promise.all([
      import('@/server/repositories/revisionRepository.server'),
      import('@/server/repositories/videoRepository.server'),
    ]);
    const revision = await revisionRepository.findById(data.id);
    const current = await videoRepository.findById(data.videoId);
    if (!revision || !current || revision.entity_type !== 'video' || revision.entity_id !== data.videoId) {
      return { ok: false as const, error: 'That revision is unavailable.' };
    }
    await revisionRepository.create('video', current.id, current, adminId);
    const snapshot = videoInputSchema.parse(JSON.parse(revision.snapshot));
    await videoRepository.update(current.id, snapshot);
    await auditVideo('restore', current.id, current.title);
    return { ok: true as const };
  });

/* ------------------------------ categories ------------------------------ */

export const adminListCategories = createServerFn({ method: 'GET' }).handler(async (): Promise<Category[]> => {
  await requireAdmin();
  const { categoryRepository } = await import('@/server/repositories/categoryRepository.server');
  return categoryRepository.list();
});

export const adminCreateCategory = createServerFn({ method: 'POST' })
  .validator((input: unknown) => categoryInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { categoryRepository } = await import('@/server/repositories/categoryRepository.server');
    const category = await categoryRepository.create(data.name);
    return { ok: true as const, id: category.id };
  });

export const adminDeleteCategory = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { categoryRepository } = await import('@/server/repositories/categoryRepository.server');
    await categoryRepository.remove(data.id);
    return { ok: true as const };
  });
