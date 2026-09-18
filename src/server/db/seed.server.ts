// First-run seeding: the admin account, the initial topics and a few example
// episodes. Every step is idempotent, so it is safe on every boot.
import type { SqlExecutor } from './client.server';
import { hashPassword } from '../auth/password.server';
import { slugify } from '@/lib/cms/types';

const DEFAULT_CATEGORIES = ['Product Strategy', 'Agile & Delivery', 'Career', 'Case Study Breakdown'];

const SEED_VIDEOS = [
  {
    title: 'How I turn a vague business goal into a spec',
    description:
      'The three questions I ask before anyone writes a line of code, and how they keep a discovery phase from drifting.',
    video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    category: 'Product Strategy',
    duration: '6:12',
    publish_date: '2026-08-14',
    is_featured: 1,
    is_published: 1,
  },
  {
    title: 'The only three agile ceremonies that changed my velocity',
    description: 'Most teams run every ceremony on the calendar. Here are the ones that actually move delivery.',
    video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    category: 'Agile & Delivery',
    duration: '5:40',
    publish_date: '2026-08-07',
    is_featured: 0,
    is_published: 1,
  },
  {
    title: 'Breaking down the Qawafel delivery turnaround',
    description: 'Where the 25% delivery-timeline improvement came from — process, not heroics.',
    video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    category: 'Case Study Breakdown',
    duration: '8:03',
    publish_date: '2026-07-31',
    is_featured: 0,
    is_published: 1,
  },
  {
    title: 'Moving from business analyst to technical product lead',
    description: 'The skills that mattered, the ones that did not, and what I would do differently.',
    video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    category: 'Career',
    duration: '7:25',
    publish_date: '2026-09-04',
    is_featured: 0,
    is_published: 0,
  },
];

export async function seedDatabase(db: SqlExecutor): Promise<void> {
  // Admin account
  const adminCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM admins');
  if (!adminCount || adminCount.count === 0) {
    const email = process.env['CMS_ADMIN_EMAIL'] ?? 'admin@mrmalek.com';
    const password = process.env['CMS_ADMIN_INITIAL_PASSWORD'];
    if (password) {
      await db.run('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [
        email.toLowerCase(),
        await hashPassword(password),
      ]);
    } else {
      console.warn('[cms] CMS_ADMIN_INITIAL_PASSWORD is not set — no admin account was created.');
    }
  }

  // Categories
  for (const name of DEFAULT_CATEGORIES) {
    await db.run('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)', [name, slugify(name)]);
  }

  // Homepage content that used to be hard-coded (case studies, steps, ventures)
  const { seedHomepageContent } = await import('./seedContent.server');
  await seedHomepageContent(db);

  // Landing page CMS tables (partners, experiences, education, certs, toolkits, projects, testimonials)
  const { seedLandingContent } = await import('./seedLanding.server');
  await seedLandingContent(db);

  // Example episodes (only on a completely empty videos table)
  const videoCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM videos');
  if (videoCount && videoCount.count > 0) return;

  for (const video of SEED_VIDEOS) {
    const category = await db.get<{ id: number }>('SELECT id FROM categories WHERE slug = ?', [
      slugify(video.category),
    ]);
    await db.run(
      `INSERT INTO videos (title, slug, description, video_url, category_id, duration, publish_date, is_featured, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        video.title,
        slugify(video.title),
        video.description,
        video.video_url,
        category?.id ?? null,
        video.duration,
        video.publish_date,
        video.is_featured,
        video.is_published,
      ],
    );
  }
}
