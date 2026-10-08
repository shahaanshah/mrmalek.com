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
    console.error('[cms] getLandingPageData failed, serving graceful fallback data:', error);
    return getFallbackLandingData();
  }
});

async function getFallbackLandingData() {
  const [
    { DEFAULT_LANDING_SECTIONS },
    { defaultSettings },
    {
      clientPartnersData,
      experienceData,
      educationData,
      certificationsData,
      toolkitData,
      otherProjectsData,
      venturesData,
    },
    { allCaseStudies, caseMeta },
  ] = await Promise.all([
    import('@/lib/cms/sections.types'),
    import('@/lib/cms/homepage.types'),
    import('@/data/portfolioData'),
    import('@/data/caseStudyMeta'),
  ]);

  const sectionsMap = Object.fromEntries(DEFAULT_LANDING_SECTIONS.map((s) => [s.id, s]));

  const fallbackTestimonials = [
    {
      id: 1,
      author: 'Abdulrahman',
      role: 'VP of Engineering',
      company: 'Enterprise B2B Commerce Platform',
      quote:
        "Malek bridges the gap between commercial objectives and engineering realities better than anyone I've worked with. He translates high-level executive strategy into clean, prioritized sprint backlogs that developers actually trust.",
      linkedin: 'https://linkedin.com/in/malekhussein',
      avatar_url: null,
      sort_order: 0,
      created_at: '',
    },
    {
      id: 2,
      author: 'Arifi',
      role: 'Lead Technical Architect',
      company: 'Logistics & Crowd-Shipping Scale-Up',
      quote:
        "Under Malek's delivery leadership, our sprint velocity accelerated by 25%. He doesn't just run Scrum ceremonies; he actively dives into technical dependencies, unblocks cross-functional bottlenecks, and ships on time.",
      linkedin: 'https://linkedin.com/in/malekhussein',
      avatar_url: null,
      sort_order: 1,
      created_at: '',
    },
    {
      id: 3,
      author: 'Qays Bahormoz',
      role: 'FinTech Managing Director',
      company: 'Financial Services & Lending Platform',
      quote:
        'A rare product manager who truly understands banking API integrations, payment reliability, and developer experience. He brought structure, speed, and real accountability to our platform rollout.',
      linkedin: 'https://linkedin.com/in/malekhussein',
      avatar_url: null,
      sort_order: 2,
      created_at: '',
    },
  ];

  const fallbackPhases = [
    {
      number: '01',
      title: 'Understand the problem',
      statement: 'I talk to users, map the business goal, and find the real blockers before we build.',
      toolchain: ['Research', 'Figma', 'Notion'],
    },
    {
      number: '02',
      title: 'Design the solution',
      statement: 'I turn findings into a clear plan: what to build, how the systems connect, and why.',
      toolchain: ['Specs', 'AWS', 'Postman'],
    },
    {
      number: '03',
      title: 'Build with the team',
      statement: 'I run agile delivery with design, engineering and stakeholders focused on one outcome.',
      toolchain: ['Jira', 'Linear', 'CI/CD'],
    },
    {
      number: '04',
      title: 'Launch and improve',
      statement: 'I ship, measure what matters, and use the data to make the product stronger.',
      toolchain: ['GA4', 'Metabase', 'Scale'],
    },
  ];

  return {
    settings: defaultSettings,
    content: {},
    sections: sectionsMap,
    partners: clientPartnersData.map((p, i) => ({
      id: i + 1,
      name: p.name,
      category: p.category,
      logo_image: p.logoImage ?? '',
      logo_text: p.logoText,
      sort_order: i,
      linked_case_study_id: null,
      created_at: '',
    })),
    experiences: experienceData.map((e, i) => ({
      id: i + 1,
      role: e.role,
      company: e.company,
      location: e.location,
      period: e.period,
      type: e.type,
      badge: e.badge ?? null,
      description: e.description,
      impact: e.impact ?? null,
      achievements: e.achievements ? (Array.isArray(e.achievements) ? e.achievements : [e.achievements]) : [],
      skills: e.skills ? (Array.isArray(e.skills) ? e.skills : [e.skills]) : [],
      sort_order: i,
      created_at: '',
    })),
    education: educationData.map((ed, i) => ({
      id: i + 1,
      degree: ed.degree,
      institution: ed.institution,
      location: ed.location,
      year: ed.year,
      details: ed.details ? (Array.isArray(ed.details) ? ed.details : [ed.details]) : [],
      sort_order: i,
      created_at: '',
    })),
    certifications: certificationsData.map((c, i) => ({
      id: i + 1,
      name: c.name,
      issuer: c.issuer,
      year: c.year,
      credential_id: c.credentialId ?? null,
      sort_order: i,
      created_at: '',
    })),
    toolkits: toolkitData.map((t, i) => ({
      id: i + 1,
      title: t.title,
      tools: t.tools ? (Array.isArray(t.tools) ? t.tools : [t.tools]) : [],
      note: t.note,
      sort_order: i,
      created_at: '',
    })),
    otherProjects: otherProjectsData.map((p, i) => ({
      id: i + 1,
      name: p.name,
      domain: p.domain,
      role: p.role,
      summary: p.summary,
      logo_image: p.logoImage ?? null,
      sort_order: i,
      created_at: '',
    })),
    testimonials: fallbackTestimonials,
    cases: allCaseStudies,
    caseMetaMap: caseMeta,
    phases: fallbackPhases,
    ventures: venturesData,
    videos: [],
    topics: ['Product Strategy', 'Agile & Delivery', 'Career', 'Case Study Breakdown'],
  };
}

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
