// Admin-only server functions for the generic content system.
// Every handler re-checks authorisation server-side and validates its input.
import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { z } from 'zod';
import {
  baseContentSchema,
  CONTENT_TYPES,
  mediaSchema,
  seoSchema,
  siteSettingsSchema,
} from './content.types';
import type {
  ActivityEntry,
  ContentRecord,
  ContentType,
  MediaItem,
  SeoMeta,
  SiteSettings,
} from './content.types';

async function requireAdmin(): Promise<{ id: number; email: string }> {
  const { currentAdminId } = await import('@/server/auth/session.server');
  const adminId = await currentAdminId();
  if (!adminId) throw redirect({ to: '/admin/login' });
  const { adminRepository } = await import('@/server/repositories/adminRepository.server');
  const profile = await adminRepository.findById(adminId);
  return { id: adminId, email: profile?.email ?? '' };
}

async function audit(action: string, entityType: string, entityId: number | null, summary: string) {
  const admin = await requireAdmin();
  const { activityRepository } = await import('@/server/repositories/activityRepository.server');
  await activityRepository.log({
    adminId: admin.id,
    adminEmail: admin.email,
    action,
    entityType,
    entityId,
    summary,
  });
}

async function bustContentCache(type?: string) {
  const { invalidateContent } = await import('@/server/cache.server');
  invalidateContent(type);
}

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const typeSchema = z.object({ type: z.enum(CONTENT_TYPES) });
const idsSchema = z.object({ ids: z.array(z.coerce.number().int().positive()).min(1).max(100) });

/* ------------------------------- content -------------------------------- */

export const adminListContent = createServerFn({ method: 'GET' })
  .validator((input: unknown) =>
    typeSchema
      .extend({
        search: z.string().trim().max(120).optional(),
        status: z.enum(['all', 'draft', 'published']).optional(),
        categoryId: z.coerce.number().int().positive().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ContentRecord[]> => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    return contentRepository.list(data.type as ContentType, {
      ...(data.search ? { search: data.search } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
    });
  });

export const adminGetContent = createServerFn({ method: 'GET' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }): Promise<ContentRecord | null> => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    return contentRepository.findById(data.id);
  });

export const adminSaveContent = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    baseContentSchema.extend({ id: z.coerce.number().int().positive().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const { id, ...input } = data;
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    const previous = id ? await contentRepository.findById(id) : null;
    if (previous) {
      const { revisionRepository } = await import('@/server/repositories/revisionRepository.server');
      await revisionRepository.create(previous.type, previous.id, previous, admin.id);
    }
    const saved = id ? await contentRepository.update(id, input) : await contentRepository.create(input);
    if (!saved) return { ok: false as const, error: 'That item no longer exists.' };
    await audit(id ? 'update' : 'create', input.type, saved.id, saved.title);
    await bustContentCache(input.type);
    return { ok: true as const, id: saved.id, slug: saved.slug };
  });

export const adminDuplicateContent = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    const copy = await contentRepository.duplicate(data.id);
    if (!copy) return { ok: false as const, error: 'That item no longer exists.' };
    await audit('duplicate', copy.type, copy.id, copy.title);
    await bustContentCache(copy.type);
    return { ok: true as const, id: copy.id };
  });

export const adminBulkContent = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    idsSchema.extend({ action: z.enum(['publish', 'draft', 'delete']) }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    const items = await Promise.all(data.ids.map((id) => contentRepository.findById(id)));
    for (const id of data.ids) {
      if (data.action === 'delete') await contentRepository.remove(id);
      else await contentRepository.setStatus(id, data.action === 'publish' ? 'published' : 'draft');
    }
    const types = [...new Set(items.flatMap((item) => (item ? [item.type] : [])))];
    await Promise.all(types.map((type) => bustContentCache(type)));
    await audit('bulk', 'content', null, `${data.action}: ${data.ids.length} items`);
    return { ok: true as const };
  });

export const adminListRevisions = createServerFn({ method: 'GET' })
  .validator((input: unknown) =>
    z.object({ entityType: z.string().min(1).max(40), entityId: z.coerce.number().int().positive() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { revisionRepository } = await import('@/server/repositories/revisionRepository.server');
    const revisions = await revisionRepository.list(data.entityType, data.entityId);
    return revisions.map(({ id, created_at }) => ({ id, created_at }));
  });

export const adminRestoreContentRevision = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ contentId: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const [{ revisionRepository }, { contentRepository }] = await Promise.all([
      import('@/server/repositories/revisionRepository.server'),
      import('@/server/repositories/contentRepository.server'),
    ]);
    const revision = await revisionRepository.findById(data.id);
    const current = await contentRepository.findById(data.contentId);
    if (!revision || !current || revision.entity_id !== data.contentId || revision.entity_type !== current.type) {
      return { ok: false as const, error: 'That revision is unavailable.' };
    }
    await revisionRepository.create(current.type, current.id, current, admin.id);
    const snapshot = JSON.parse(revision.snapshot) as ContentRecord;
    await contentRepository.update(current.id, {
      type: current.type,
      title: snapshot.title,
      slug: snapshot.slug,
      excerpt: snapshot.excerpt,
      body: snapshot.body,
      status: snapshot.status,
      is_featured: !!snapshot.is_featured,
      sort_order: snapshot.sort_order,
      category_id: snapshot.category_id ?? undefined,
      publish_date: snapshot.publish_date ?? '',
      details: Object.fromEntries(Object.entries(snapshot.details).map(([key, value]) => [key, value ?? ''])),
      seo: snapshot.seo
        ? {
            seo_title: snapshot.seo.seo_title ?? '', meta_description: snapshot.seo.meta_description ?? '',
            canonical_url: snapshot.seo.canonical_url ?? '', og_title: snapshot.seo.og_title ?? '',
            og_description: snapshot.seo.og_description ?? '', og_image: snapshot.seo.og_image ?? '',
            twitter_title: snapshot.seo.twitter_title ?? '', twitter_description: snapshot.seo.twitter_description ?? '',
            twitter_image: snapshot.seo.twitter_image ?? '', no_index: !!snapshot.seo.no_index,
            no_follow: !!snapshot.seo.no_follow,
          }
        : undefined,
    });
    await audit('restore', current.type, current.id, current.title);
    await bustContentCache(current.type);
    return { ok: true as const };
  });

export const adminDeleteContent = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    const item = await contentRepository.findById(data.id);
    await contentRepository.remove(data.id);
    await audit('delete', item?.type ?? 'content', data.id, item?.title ?? '');
    await bustContentCache(item?.type);
    return { ok: true as const };
  });

export const adminSetContentStatus = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ status: z.enum(['draft', 'published']) }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    await contentRepository.setStatus(data.id, data.status);
    const item = await contentRepository.findById(data.id);
    await audit('status', item?.type ?? 'content', data.id, `${item?.title ?? ''} → ${data.status}`);
    await bustContentCache(item?.type);
    return { ok: true as const };
  });

export const adminSetContentFeatured = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.extend({ featured: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    await contentRepository.setFeatured(data.id, data.featured);
    const item = await contentRepository.findById(data.id);
    await bustContentCache(item?.type);
    return { ok: true as const };
  });

/* ------------------------------ dashboard ------------------------------- */

export const adminOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const [{ contentRepository }, { videoRepository }, { mediaRepository }, { activityRepository }] = await Promise.all([
    import('@/server/repositories/contentRepository.server'),
    import('@/server/repositories/videoRepository.server'),
    import('@/server/repositories/mediaRepository.server'),
    import('@/server/repositories/activityRepository.server'),
  ]);
  const [counts, videoStats, recent, media, activity] = await Promise.all([
    contentRepository.countsByType(),
    videoRepository.stats(),
    contentRepository.recent(6),
    mediaRepository.list(),
    activityRepository.list(6),
  ]);
  return {
    counts,
    videos: { published: videoStats.published, draft: videoStats.draft, latest: videoStats.latest },
    recent: recent.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      status: item.status,
      updated_at: item.updated_at,
    })),
    mediaCount: media.length,
    activity,
  };
});

/* -------------------------------- media --------------------------------- */

export const adminListMedia = createServerFn({ method: 'GET' }).handler(async (): Promise<MediaItem[]> => {
  await requireAdmin();
  const { mediaRepository } = await import('@/server/repositories/mediaRepository.server');
  return mediaRepository.list();
});

export const adminSaveMedia = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    mediaSchema.extend({ id: z.coerce.number().int().positive().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { id, ...input } = data;
    const { mediaRepository } = await import('@/server/repositories/mediaRepository.server');
    if (id) await mediaRepository.update(id, input);
    else await mediaRepository.create(input);
    await audit(id ? 'update' : 'create', 'media', id ?? null, input.file_name);
    return { ok: true as const };
  });

export const adminDeleteMedia = createServerFn({ method: 'POST' })
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { mediaRepository } = await import('@/server/repositories/mediaRepository.server');
    await mediaRepository.remove(data.id);
    await audit('delete', 'media', data.id, '');
    return { ok: true as const };
  });

/* ------------------------------- settings -------------------------------- */

export const adminGetSettings = createServerFn({ method: 'GET' }).handler(async (): Promise<SiteSettings> => {
  await requireAdmin();
  const { settingsRepository } = await import('@/server/repositories/settingsRepository.server');
  return settingsRepository.all();
});

export const adminSaveSettings = createServerFn({ method: 'POST' })
  .validator((input: unknown) => siteSettingsSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { settingsRepository } = await import('@/server/repositories/settingsRepository.server');
    await settingsRepository.save(data as Partial<SiteSettings>);
    const { invalidate, CacheKeys } = await import('@/server/cache.server');
    invalidate(CacheKeys.settings, CacheKeys.sitemap);
    await audit('update', 'settings', null, 'Site settings');
    return { ok: true as const };
  });

/* ---------------------------------- SEO ---------------------------------- */

export const adminSeoOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const [{ contentRepository }, { videoRepository }, { settingsRepository }] = await Promise.all([
    import('@/server/repositories/contentRepository.server'),
    import('@/server/repositories/videoRepository.server'),
    import('@/server/repositories/settingsRepository.server'),
  ]);

  const [health, settings, videos] = await Promise.all([
    contentRepository.seoHealth(),
    settingsRepository.all(),
    videoRepository.listAll(),
  ]);

  const { seoRepository } = await import('@/server/repositories/seoRepository.server');
  const videoHealth = await Promise.all(
    videos.map(async (video) => {
      const seo = await seoRepository.find('video', video.id);
      const issues: string[] = [];
      if (!seo?.seo_title) issues.push('No SEO title');
      if (!seo?.meta_description) issues.push('No meta description');
      if (!seo?.og_image && !video.thumbnail_url) issues.push('No share image');
      return {
        id: video.id,
        type: 'video',
        title: video.title,
        slug: video.slug,
        status: video.is_published ? 'published' : 'draft',
        issues,
      };
    }),
  );

  return { health: [...health, ...videoHealth], settings };
});

export const adminSaveEntitySeo = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    seoSchema.extend({ entityType: z.string().min(1).max(40), entityId: z.coerce.number().int().positive() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { entityType, entityId, ...seo } = data;
    const { seoRepository } = await import('@/server/repositories/seoRepository.server');
    await seoRepository.save(entityType, entityId, seo);
    await bustContentCache(entityType);
    await audit('update', `seo:${entityType}`, entityId, 'SEO metadata');
    return { ok: true as const };
  });

export const adminGetEntitySeo = createServerFn({ method: 'GET' })
  .validator((input: unknown) =>
    z.object({ entityType: z.string().min(1).max(40), entityId: z.coerce.number().int().positive() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { seoRepository } = await import('@/server/repositories/seoRepository.server');
    return seoRepository.find(data.entityType, data.entityId);
  });

/* ------------------------------ page seo --------------------------------- */

/** Stored search / share overrides for every editable public page. */
export const adminListPageSeo = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const { PAGE_SEO_ROUTES, PAGE_SEO_ENTITY } = await import('./pageSeo');
  const { seoRepository } = await import('@/server/repositories/seoRepository.server');
  const entries = await Promise.all(
    PAGE_SEO_ROUTES.map(async (route) => [route.path, await seoRepository.find(PAGE_SEO_ENTITY, route.id)] as const),
  );
  return Object.fromEntries(entries) as Record<string, SeoMeta | null>;
});

export const adminSavePageSeo = createServerFn({ method: 'POST' })
  .validator((input: unknown) => seoSchema.extend({ path: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { path, ...seo } = data;
    const { PAGE_SEO_ROUTES, PAGE_SEO_ENTITY } = await import('./pageSeo');
    const route = PAGE_SEO_ROUTES.find((item) => item.path === path);
    if (!route) return { ok: false as const, error: 'Unknown page.' };
    const { seoRepository } = await import('@/server/repositories/seoRepository.server');
    await seoRepository.save(PAGE_SEO_ENTITY, route.id, seo);
    await bustContentCache(PAGE_SEO_ENTITY);
    await audit('update', 'seo:page', route.id, `Page metadata — ${route.label}`);
    return { ok: true as const };
  });

/* ------------------------------- activity -------------------------------- */



export const adminActivity = createServerFn({ method: 'GET' }).handler(async (): Promise<ActivityEntry[]> => {
  await requireAdmin();
  const { activityRepository } = await import('@/server/repositories/activityRepository.server');
  return activityRepository.list(100);
});

/* ----------------------------- admin users -------------------------------- */

export const adminListUsers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const { getDb } = await import('@/server/db/client.server');
  const db = await getDb();
  return db.all<{ id: number; email: string; created_at: string }>(
    'SELECT id, email, created_at FROM admins ORDER BY id ASC',
  );
});

export const adminChangePassword = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        current_password: z.string().min(1, 'Enter your current password'),
        new_password: z.string().min(8, 'Use at least 8 characters').max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const { adminRepository } = await import('@/server/repositories/adminRepository.server');
    const verified = await adminRepository.verifyCredentials(admin.email, data.current_password);
    if (!verified) return { ok: false as const, error: 'Your current password is incorrect.' };
    await adminRepository.updatePassword(admin.id, data.new_password);
    await audit('update', 'admin', admin.id, 'Password changed');
    return { ok: true as const };
  });
