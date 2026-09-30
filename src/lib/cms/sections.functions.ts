import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireAdminSession } from './admin.functions';
import { landingSectionSchema, LandingSection, DEFAULT_LANDING_SECTIONS } from './sections.types';

export const getPublicLandingSections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Record<string, LandingSection>> => {
    try {
      const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
      return await sectionRepository.getMap();
    } catch (error) {
      console.error('[cms] getPublicLandingSections failed:', error);
      return Object.fromEntries(DEFAULT_LANDING_SECTIONS.map((s) => [s.id, s]));
    }
  }
);

export const adminListLandingSections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LandingSection[]> => {
    await requireAdminSession();
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    return await sectionRepository.list();
  }
);

export const adminSaveLandingSection = createServerFn({ method: 'POST' })
  .validator((input: unknown) => landingSectionSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await requireAdminSession();
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    await sectionRepository.save(data);

    const [{ activityRepository }, { invalidate, CacheKeys }] = await Promise.all([
      import('@/server/repositories/activityRepository.server'),
      import('@/server/cache.server'),
    ]);

    await activityRepository.log({
      adminId: session.id,
      adminEmail: session.email,
      action: 'update',
      entityType: 'landing_section',
      entityId: null,
      summary: `Updated section: ${data.title} (${data.id})`,
    });

    invalidate(CacheKeys.settings, CacheKeys.content);
    return { ok: true as const };
  });

export const adminToggleLandingSection = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.string().min(1),
        isEnabled: z.boolean(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const session = await requireAdminSession();
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    await sectionRepository.toggleEnabled(data.id, data.isEnabled);

    const [{ activityRepository }, { invalidate, CacheKeys }] = await Promise.all([
      import('@/server/repositories/activityRepository.server'),
      import('@/server/cache.server'),
    ]);

    await activityRepository.log({
      adminId: session.id,
      adminEmail: session.email,
      action: 'update',
      entityType: 'landing_section',
      entityId: null,
      summary: `${data.isEnabled ? 'Enabled' : 'Disabled'} section ${data.id}`,
    });

    invalidate(CacheKeys.settings, CacheKeys.content);
    return { ok: true as const };
  });

export const adminDeleteLandingSection = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const session = await requireAdminSession();
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    await sectionRepository.delete(data.id);

    const [{ activityRepository }, { invalidate, CacheKeys }] = await Promise.all([
      import('@/server/repositories/activityRepository.server'),
      import('@/server/cache.server'),
    ]);

    await activityRepository.log({
      adminId: session.id,
      adminEmail: session.email,
      action: 'delete',
      entityType: 'landing_section',
      entityId: null,
      summary: `Deleted section ${data.id}`,
    });

    invalidate(CacheKeys.settings, CacheKeys.content);
    return { ok: true as const };
  });

export const adminReorderLandingSections = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ ids: z.array(z.string().min(1)) }).parse(input))
  .handler(async ({ data }) => {
    const session = await requireAdminSession();
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    await sectionRepository.reorder(data.ids);

    const [{ invalidate, CacheKeys }] = await Promise.all([
      import('@/server/cache.server'),
    ]);
    invalidate(CacheKeys.settings, CacheKeys.content);
    return { ok: true as const };
  });
