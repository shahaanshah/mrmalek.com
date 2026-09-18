import type { SqlExecutor } from './client.server';
import {
  clientPartnersData,
  experienceData,
  educationData,
  certificationsData,
  toolkitData,
  otherProjectsData,
} from '@/data/portfolioData';

const DEFAULT_TESTIMONIALS = [
  {
    author: 'Abdulrahman',
    role: 'VP of Engineering',
    company: 'Enterprise B2B Commerce Platform',
    quote:
      "Malek bridges the gap between commercial objectives and engineering realities better than anyone I've worked with. He translates high-level executive strategy into clean, prioritized sprint backlogs that developers actually trust.",
    linkedin: 'https://linkedin.com/in/malekhussein',
  },
  {
    author: 'Arifi',
    role: 'Lead Technical Architect',
    company: 'Logistics & Crowd-Shipping Scale-Up',
    quote:
      "Under Malek's delivery leadership, our sprint velocity accelerated by 25%. He doesn't just run Scrum ceremonies; he actively dives into technical dependencies, unblocks cross-functional bottlenecks, and ships on time.",
    linkedin: 'https://linkedin.com/in/malekhussein',
  },
  {
    author: 'Qays Bahormoz',
    role: 'FinTech Managing Director',
    company: 'Financial Services & Lending Platform',
    quote:
      'A rare product manager who truly understands banking API integrations, payment reliability, and developer experience. He brought structure, speed, and real accountability to our platform rollout.',
    linkedin: 'https://linkedin.com/in/malekhussein',
  },
];

async function countRows(db: SqlExecutor, table: string): Promise<number> {
  const row = await db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table}`);
  return row?.count ?? 0;
}

export async function seedLandingContent(db: SqlExecutor): Promise<void> {
  // 1. Client Partners / Logos
  if ((await countRows(db, 'client_partners')) === 0) {
    let order = 0;
    for (const partner of clientPartnersData) {
      await db.run(
        `INSERT INTO client_partners (name, category, logo_image, logo_text, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [partner.name, partner.category, partner.logoImage ?? '', partner.logoText, order++],
      );
    }
  }

  // 2. Career Experience Timeline
  if ((await countRows(db, 'experiences')) === 0) {
    let order = 0;
    for (const exp of experienceData) {
      await db.run(
        `INSERT INTO experiences (role, company, location, period, type, badge, description, impact, achievements, skills, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exp.role,
          exp.company,
          exp.location,
          exp.period,
          exp.type,
          exp.badge ?? null,
          exp.description,
          exp.impact ?? null,
          (exp.achievements ?? []).join('\n'),
          (exp.skills ?? []).join('\n'),
          order++,
        ],
      );
    }
  }

  // 3. Education / Degrees
  if ((await countRows(db, 'education')) === 0) {
    let order = 0;
    for (const edu of educationData) {
      await db.run(
        `INSERT INTO education (degree, institution, location, year, details, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [edu.degree, edu.institution, edu.location, edu.year, (edu.details ?? []).join('\n'), order++],
      );
    }
  }

  // 4. Certifications
  if ((await countRows(db, 'certifications')) === 0) {
    let order = 0;
    for (const cert of certificationsData) {
      await db.run(
        `INSERT INTO certifications (name, issuer, year, credential_id, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [cert.name, cert.issuer, cert.year ?? 'Certified', cert.credentialId ?? null, order++],
      );
    }
  }

  // 5. Toolkits
  if ((await countRows(db, 'toolkits')) === 0) {
    let order = 0;
    for (const group of toolkitData) {
      await db.run(
        `INSERT INTO toolkits (title, tools, note, sort_order)
         VALUES (?, ?, ?, ?)`,
        [group.title, (group.tools ?? []).join('\n'), group.note, order++],
      );
    }
  }

  // 6. Other Projects (Badges)
  if ((await countRows(db, 'other_projects')) === 0) {
    let order = 0;
    for (const proj of otherProjectsData) {
      await db.run(
        `INSERT INTO other_projects (name, domain, role, summary, logo_image, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [proj.name, proj.domain, proj.role, proj.summary, proj.logoImage ?? null, order++],
      );
    }
  }

  // 7. Testimonials
  if ((await countRows(db, 'testimonials')) === 0) {
    let order = 0;
    for (const t of DEFAULT_TESTIMONIALS) {
      await db.run(
        `INSERT INTO testimonials (author, role, company, quote, linkedin, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.author, t.role, t.company, t.quote, t.linkedin, order++],
      );
    }
  }

  // 8. Site Settings Initial Branding Keys (if not present)
  const defaultSettings: Record<string, string> = {
    site_title: 'Malek Hussein | Technical Product Leader & Digital Builder',
    site_description:
      'Portfolio of Malek Hussein — Technical Product Leader based in Ottawa, Canada. Leading complex digital products across SaaS, e-commerce, fintech, and enterprise platforms.',
    brand_name: 'Mr. Malek',
    site_logo: '/images/malek-logo.png',
    site_favicon: '/favicon.ico',
    cv_url: '/cv-malek-hussein.pdf',
    contact_email: 'contact@mrmalek.com',
    contact_phone: '+1 343 552 7477',
    whatsapp_phone: '+13435527477',
    status_badge: 'Ottawa, ON • Open to Opportunities',
    location: 'Ottawa, Ontario, Canada',
    linkedin_url: 'https://linkedin.com/in/malekhussein',
    x_url: 'https://x.com/mrmalek',
    youtube_url: 'https://youtube.com',
  };

  for (const [key, val] of Object.entries(defaultSettings)) {
    await db.run('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', [key, val]);
  }

  // Self-heal: If site_logo in database was previously set to the partner company logo, fix to official logo
  const currentLogo = await db.get<{ value: string }>('SELECT value FROM site_settings WHERE key = ?', ['site_logo']);
  if (!currentLogo || currentLogo.value === '/images/companies/aslagrodrain.png' || !currentLogo.value) {
    await db.run('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', [
      'site_logo',
      '/images/malek-logo.png',
      '/images/malek-logo.png',
    ]);
  }
}
