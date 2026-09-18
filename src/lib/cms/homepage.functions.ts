// Homepage copy: one public reader and one protected writer.
import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { homepageSchema, HOMEPAGE_DEFAULTS } from './homepage.types';
import type { HomepageContent, HomepageKey } from './homepage.types';

export const getHomepageContent = createServerFn({ method: 'GET' }).handler(async (): Promise<HomepageContent> => {
  try {
    const { homepageRepository } = await import('@/server/repositories/homepageRepository.server');
    return await homepageRepository.all();
  } catch (error) {
    console.error('[cms] getHomepageContent failed', error);
    return HOMEPAGE_DEFAULTS;
  }
});

export const adminGetHomepage = createServerFn({ method: 'GET' }).handler(async (): Promise<HomepageContent> => {
  const { currentAdminId } = await import('@/server/auth/session.server');
  if (!(await currentAdminId())) throw redirect({ to: '/admin/login' });
  const { homepageRepository } = await import('@/server/repositories/homepageRepository.server');
  return homepageRepository.all();
});

export const adminSaveHomepage = createServerFn({ method: 'POST' })
  .validator((input: unknown) => homepageSchema.parse(input))
  .handler(async ({ data }) => {
    const { currentAdminId } = await import('@/server/auth/session.server');
    const adminId = await currentAdminId();
    if (!adminId) throw redirect({ to: '/admin/login' });

    const { homepageRepository } = await import('@/server/repositories/homepageRepository.server');
    await homepageRepository.save(data as Partial<Record<HomepageKey, string>>);

    const [{ activityRepository }, { adminRepository }, { invalidate, CacheKeys }] = await Promise.all([
      import('@/server/repositories/activityRepository.server'),
      import('@/server/repositories/adminRepository.server'),
      import('@/server/cache.server'),
    ]);
    const profile = await adminRepository.findById(adminId);
    await activityRepository.log({
      adminId,
      adminEmail: profile?.email ?? '',
      action: 'update',
      entityType: 'homepage',
      entityId: null,
      summary: 'Homepage content',
    });
    invalidate(CacheKeys.settings, CacheKeys.content);
    return { ok: true as const };
  });
