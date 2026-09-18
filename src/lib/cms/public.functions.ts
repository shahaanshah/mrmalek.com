import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { Category, VideoWithCategory } from './types';
import { CONTENT_TYPES, type ContentRecord, type ContentType } from './content.types';

/** Published items of one content type, ordered for the public site. */
export const listPublishedContent = createServerFn({ method: 'GET' })
  .validator((input: { type: ContentType }) => z.object({ type: z.enum(CONTENT_TYPES) }).parse(input))
  .handler(async ({ data }): Promise<ContentRecord[]> => {
    try {
      const { contentRepository } = await import('@/server/repositories/contentRepository.server');
      return await contentRepository.listPublished(data.type as ContentType);
    } catch (error) {
      console.error('[cms] listPublishedContent failed', error);
      return [];
    }
  });

/** All published episodes, newest first. Never exposes drafts. */
export const listPublishedVideos = createServerFn({ method: 'GET' }).handler(async (): Promise<VideoWithCategory[]> => {
  try {
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    return await videoRepository.listPublished();
  } catch (error) {
    console.error('[cms] listPublishedVideos failed', error);
    return [];
  }
});

export const listCategories = createServerFn({ method: 'GET' }).handler(async (): Promise<Category[]> => {
  try {
    const { categoryRepository } = await import('@/server/repositories/categoryRepository.server');
    return await categoryRepository.list();
  } catch (error) {
    console.error('[cms] listCategories failed', error);
    return [];
  }
});

export const getPublishedVideo = createServerFn({ method: 'GET' })
  .validator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<VideoWithCategory | null> => {
    try {
      const { videoRepository } = await import('@/server/repositories/videoRepository.server');
      return await videoRepository.findPublishedBySlug(data.slug);
    } catch (error) {
      console.error('[cms] getPublishedVideo failed', error);
      return null;
    }
  });

/** Search / share overrides for a public page path, set in /admin/seo. */
export const getPageSeo = createServerFn({ method: 'GET' })
  .validator((input: { path: string }) => z.object({ path: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { pageSeoRoute, PAGE_SEO_ENTITY } = await import('./pageSeo');
      const route = pageSeoRoute(data.path);
      if (!route) return null;
      const { seoRepository } = await import('@/server/repositories/seoRepository.server');
      return await seoRepository.find(PAGE_SEO_ENTITY, route.id);
    } catch (error) {
      console.error('[cms] getPageSeo failed', error);
      return null;
    }
  });
