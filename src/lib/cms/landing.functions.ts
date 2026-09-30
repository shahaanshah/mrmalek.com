import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireAdminSession } from './admin.functions';

export const getLandingPageData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const { homepageRepository } = await import('@/server/repositories/homepageRepository.server');
    const { contentRepository } = await import('@/server/repositories/contentRepository.server');
    const { videoRepository } = await import('@/server/repositories/videoRepository.server');
    const { categoryRepository } = await import('@/server/repositories/categoryRepository.server');
    const { sectionRepository } = await import('@/server/repositories/sectionRepository.server');
    const { toCase, toPhase, toVenture } = await import('./home.adapters');

    const [
      settings,
      content,
      sections,
      partners,
      experiences,
      education,
      certifications,
      toolkits,
      otherProjects,
      testimonials,
      caseRows,
      frameworkRows,
      ventureRows,
      videos,
      categories,
    ] = await Promise.all([
      landingRepository.getSettings(),
      homepageRepository.all(),
      sectionRepository.getMap(),
      landingRepository.listPartners(),
      landingRepository.listExperiences(),
      landingRepository.listEducation(),
      landingRepository.listCertifications(),
      landingRepository.listToolkits(),
      landingRepository.listOtherProjects(),
      landingRepository.listTestimonials(),
      contentRepository.listPublished('case_study'),
      contentRepository.listPublished('framework'),
      contentRepository.listPublished('venture'),
      videoRepository.listPublished(),
      categoryRepository.list(),
    ]);

    const cmsCases = caseRows.map(toCase);

    return {
      settings,
      content,
      sections,
      partners,
      experiences: experiences.map((e) => ({
        ...e,
        achievements: e.achievements ? e.achievements.split('\n').filter(Boolean) : [],
        skills: e.skills ? e.skills.split('\n').filter(Boolean) : [],
      })),
      education: education.map((ed) => ({
        ...ed,
        details: ed.details ? ed.details.split('\n').filter(Boolean) : [],
      })),
      certifications,
      toolkits: toolkits.map((t) => ({
        ...t,
        tools: t.tools ? t.tools.split('\n').filter(Boolean) : [],
      })),
      otherProjects,
      testimonials,
      cases: cmsCases.map((c) => c.project),
      caseMetaMap: Object.fromEntries(cmsCases.map((c) => [c.project.id, c.meta])),
      phases: frameworkRows.map(toPhase),
      ventures: ventureRows.map(toVenture),
      videos,
      topics: categories.map((c) => c.name),
    };
  } catch (error) {
    console.error('[cms] getLandingPageData failed:', error);
    throw error;
  }
});

// ─── Admin CRUD Server Functions ───

// Partners
export const adminListPartners = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  return landingRepository.listPartners();
});

export const adminSavePartner = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        name: z.string().min(1, 'Company name is required'),
        category: z.string().min(1, 'Category is required'),
        logo_image: z.string().optional().default(''),
        logo_text: z.string().optional().default(''),
        sort_order: z.coerce.number().int().default(0),
        linked_case_study_id: z.coerce.number().int().nullable().optional().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.savePartner(data);
    return { ok: true as const, id };
  });

export const adminDeletePartner = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deletePartner(data.id);
    return { ok: true as const };
  });

// Experience
export const adminListExperiences = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  return landingRepository.listExperiences();
});

export const adminSaveExperience = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        role: z.string().min(1, 'Role title is required'),
        company: z.string().min(1, 'Company is required'),
        location: z.string().default(''),
        period: z.string().default(''),
        type: z.string().default('Full-time'),
        badge: z.string().nullable().optional(),
        description: z.string().default(''),
        impact: z.string().nullable().optional(),
        achievements: z.string().default(''),
        skills: z.string().default(''),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveExperience(data);
    return { ok: true as const, id };
  });

export const adminDeleteExperience = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteExperience(data.id);
    return { ok: true as const };
  });

// Credentials (Education & Certifications)
export const adminListCredentials = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  const [education, certifications] = await Promise.all([
    landingRepository.listEducation(),
    landingRepository.listCertifications(),
  ]);
  return { education, certifications };
});

export const adminSaveEducation = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        degree: z.string().min(1, 'Degree title is required'),
        institution: z.string().min(1, 'Institution is required'),
        location: z.string().default(''),
        year: z.string().default(''),
        details: z.string().default(''),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveEducation(data);
    return { ok: true as const, id };
  });

export const adminDeleteEducation = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteEducation(data.id);
    return { ok: true as const };
  });

export const adminSaveCertification = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        name: z.string().min(1, 'Certification name is required'),
        issuer: z.string().min(1, 'Issuer is required'),
        year: z.string().default('Certified'),
        credential_id: z.string().nullable().optional(),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveCertification(data);
    return { ok: true as const, id };
  });

export const adminDeleteCertification = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteCertification(data.id);
    return { ok: true as const };
  });

// Toolkits
export const adminListToolkits = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  return landingRepository.listToolkits();
});

export const adminSaveToolkit = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        title: z.string().min(1, 'Title is required'),
        tools: z.string().default(''),
        note: z.string().default(''),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveToolkit(data);
    return { ok: true as const, id };
  });

export const adminDeleteToolkit = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteToolkit(data.id);
    return { ok: true as const };
  });

// Other Projects (Badges)
export const adminListOtherProjects = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  return landingRepository.listOtherProjects();
});

export const adminSaveOtherProject = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        name: z.string().min(1, 'Project name is required'),
        domain: z.string().default(''),
        role: z.string().default(''),
        summary: z.string().default(''),
        logo_image: z.string().nullable().optional(),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveOtherProject(data);
    return { ok: true as const, id };
  });

export const adminDeleteOtherProject = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteOtherProject(data.id);
    return { ok: true as const };
  });

// Testimonials
export const adminListTestimonials = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  return landingRepository.listTestimonials();
});

export const adminSaveTestimonial = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().optional(),
        author: z.string().min(1, 'Author name is required'),
        role: z.string().default(''),
        company: z.string().default(''),
        quote: z.string().min(1, 'Quote text is required'),
        linkedin: z.string().nullable().optional(),
        avatar_url: z.string().nullable().optional(),
        sort_order: z.coerce.number().int().default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    const id = await landingRepository.saveTestimonial(data);
    return { ok: true as const, id };
  });

export const adminDeleteTestimonial = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.deleteTestimonial(data.id);
    return { ok: true as const };
  });

// Branding & Settings
export const adminGetBranding = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  const { landingRepository } = await import('@/server/repositories/landingRepository.server');
  const { adminListMedia } = await import('./content.functions');
  const [settings, mediaItems] = await Promise.all([landingRepository.getSettings(), adminListMedia()]);
  return { settings, mediaItems };
});

export const adminSaveBranding = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.record(z.string()).parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { landingRepository } = await import('@/server/repositories/landingRepository.server');
    await landingRepository.saveSettings(data);
    return { ok: true as const };
  });
