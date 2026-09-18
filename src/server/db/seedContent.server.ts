// First-run import of the homepage content that used to live in code.
// Runs once per content type and only when that type has no rows at all, so
// editor changes are never overwritten.
import type { SqlExecutor } from './client.server';
import { slugify } from '@/lib/cms/types';
import { allCaseStudies, caseMeta } from '@/data/caseStudyMeta';
import { venturesData } from '@/data/portfolioData';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Understand the problem',
    excerpt: 'I talk to users, map the business goal, and find the real blockers before we build.',
    tools: ['Research', 'Figma', 'Notion'],
  },
  {
    step: '02',
    title: 'Design the solution',
    excerpt: 'I turn findings into a clear plan: what to build, how the systems connect, and why.',
    tools: ['Specs', 'AWS', 'Postman'],
  },
  {
    step: '03',
    title: 'Build with the team',
    excerpt: 'I run agile delivery with design, engineering and stakeholders focused on one outcome.',
    tools: ['Jira', 'Linear', 'CI/CD'],
  },
  {
    step: '04',
    title: 'Launch and improve',
    excerpt: 'I ship, measure what matters, and use the data to make the product stronger.',
    tools: ['GA4', 'Metabase', 'Scale'],
  },
];

async function isEmpty(db: SqlExecutor, type: string): Promise<boolean> {
  const row = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM content_items WHERE type = ?', [type]);
  return !row || row.count === 0;
}

async function insertItem(
  db: SqlExecutor,
  item: {
    type: string;
    title: string;
    slug: string;
    excerpt: string;
    body?: string;
    sort_order: number;
    is_featured?: boolean;
  },
): Promise<number> {
  const { lastInsertRowid } = await db.run(
    `INSERT INTO content_items (type, title, slug, excerpt, body, status, is_featured, sort_order, publish_date, published_at)
     VALUES (?, ?, ?, ?, ?, 'published', ?, ?, date('now'), datetime('now'))`,
    [item.type, item.title, item.slug, item.excerpt, item.body ?? '', item.is_featured ? 1 : 0, item.sort_order],
  );
  return lastInsertRowid;
}

export async function seedHomepageContent(db: SqlExecutor): Promise<void> {
  if (await isEmpty(db, 'case_study')) {
    let order = 0;
    for (const project of allCaseStudies) {
      const meta = caseMeta[project.id];
      const id = await insertItem(db, {
        type: 'case_study',
        title: project.title,
        slug: slugify(`${project.companyName ?? ''} ${project.title}`) || slugify(project.title),
        excerpt: project.summary,
        sort_order: order++,
        is_featured: !!project.featured && order === 1,
      });
      await db.run(
        `INSERT INTO case_study_details
          (content_id, client, industry, role, problem, solution, architecture, decisions, outcomes, results, tags, aliases)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          project.companyName ?? '',
          meta?.domain ?? '',
          project.category,
          project.challenge,
          project.solution,
          project.architecture.join('\n'),
          (meta?.keyDecisions ?? []).join('\n'),
          meta?.architectureNote ?? '',
          project.results.join('\n'),
          project.tags.join('\n'),
          (meta?.aliases ?? []).join('\n'),
        ],
      );
    }
  }

  if (await isEmpty(db, 'framework')) {
    let order = 0;
    for (const phase of PROCESS_STEPS) {
      const id = await insertItem(db, {
        type: 'framework',
        title: phase.title,
        slug: slugify(phase.title),
        excerpt: phase.excerpt,
        body: phase.tools.join('\n'),
        sort_order: order++,
      });
      await db.run('INSERT INTO framework_details (content_id, step_label) VALUES (?, ?)', [id, phase.step]);
    }
  }

  if (await isEmpty(db, 'venture')) {
    let order = 0;
    for (const venture of venturesData) {
      const id = await insertItem(db, {
        type: 'venture',
        title: venture.name,
        slug: venture.id,
        excerpt: venture.tagline,
        body: venture.description,
        sort_order: order++,
      });
      await db.run(
        'INSERT INTO venture_details (content_id, website_url, venture_status) VALUES (?, ?, ?)',
        [id, venture.url, venture.status],
      );
    }
  }
}
