import { getDb } from '../db/client.server';

export interface ClientPartnerRow {
  id: number;
  name: string;
  category: string;
  logo_image: string;
  logo_text: string;
  sort_order: number;
  linked_case_study_id: number | null;
  created_at: string;
}

export interface ExperienceRow {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  badge?: string | null;
  description: string;
  impact?: string | null;
  achievements: string; // newline-separated
  skills: string; // newline-separated
  sort_order: number;
  created_at: string;
}

export interface EducationRow {
  id: number;
  degree: string;
  institution: string;
  location: string;
  year: string;
  details: string; // newline-separated
  sort_order: number;
  created_at: string;
}

export interface CertificationRow {
  id: number;
  name: string;
  issuer: string;
  year: string;
  credential_id?: string | null;
  sort_order: number;
  created_at: string;
}

export interface ToolkitRow {
  id: number;
  title: string;
  tools: string; // newline-separated
  note: string;
  sort_order: number;
  created_at: string;
}

export interface OtherProjectRow {
  id: number;
  name: string;
  domain: string;
  role: string;
  summary: string;
  logo_image?: string | null;
  sort_order: number;
  created_at: string;
}

export interface TestimonialRow {
  id: number;
  author: string;
  role: string;
  company: string;
  quote: string;
  linkedin?: string | null;
  avatar_url?: string | null;
  sort_order: number;
  created_at: string;
}

export const landingRepository = {
  // ─── Client Partners ───
  async listPartners(): Promise<ClientPartnerRow[]> {
    const db = await getDb();
    return db.all<ClientPartnerRow>('SELECT * FROM client_partners ORDER BY sort_order ASC, id ASC');
  },

  async savePartner(data: Partial<ClientPartnerRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE client_partners
         SET name = ?, category = ?, logo_image = ?, logo_text = ?, sort_order = ?, linked_case_study_id = ?
         WHERE id = ?`,
        [
          data.name ?? '',
          data.category ?? '',
          data.logo_image ?? '',
          data.logo_text ?? '',
          data.sort_order ?? 0,
          data.linked_case_study_id ?? null,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO client_partners (name, category, logo_image, logo_text, sort_order, linked_case_study_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name ?? '',
        data.category ?? '',
        data.logo_image ?? '',
        data.logo_text ?? '',
        data.sort_order ?? 0,
        data.linked_case_study_id ?? null,
      ],
    );
    return res.lastInsertRowid;
  },

  async deletePartner(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM client_partners WHERE id = ?', [id]);
  },

  // ─── Experiences ───
  async listExperiences(): Promise<ExperienceRow[]> {
    const db = await getDb();
    return db.all<ExperienceRow>('SELECT * FROM experiences ORDER BY sort_order ASC, id ASC');
  },

  async saveExperience(data: Partial<ExperienceRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE experiences
         SET role = ?, company = ?, location = ?, period = ?, type = ?, badge = ?, description = ?, impact = ?, achievements = ?, skills = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.role ?? '',
          data.company ?? '',
          data.location ?? '',
          data.period ?? '',
          data.type ?? 'Full-time',
          data.badge ?? null,
          data.description ?? '',
          data.impact ?? null,
          data.achievements ?? '',
          data.skills ?? '',
          data.sort_order ?? 0,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO experiences (role, company, location, period, type, badge, description, impact, achievements, skills, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.role ?? '',
        data.company ?? '',
        data.location ?? '',
        data.period ?? '',
        data.type ?? 'Full-time',
        data.badge ?? null,
        data.description ?? '',
        data.impact ?? null,
        data.achievements ?? '',
        data.skills ?? '',
        data.sort_order ?? 0,
      ],
    );
    return res.lastInsertRowid;
  },

  async deleteExperience(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM experiences WHERE id = ?', [id]);
  },

  // ─── Education ───
  async listEducation(): Promise<EducationRow[]> {
    const db = await getDb();
    return db.all<EducationRow>('SELECT * FROM education ORDER BY sort_order ASC, id ASC');
  },

  async saveEducation(data: Partial<EducationRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE education
         SET degree = ?, institution = ?, location = ?, year = ?, details = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.degree ?? '',
          data.institution ?? '',
          data.location ?? '',
          data.year ?? '',
          data.details ?? '',
          data.sort_order ?? 0,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO education (degree, institution, location, year, details, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.degree ?? '',
        data.institution ?? '',
        data.location ?? '',
        data.year ?? '',
        data.details ?? '',
        data.sort_order ?? 0,
      ],
    );
    return res.lastInsertRowid;
  },

  async deleteEducation(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM education WHERE id = ?', [id]);
  },

  // ─── Certifications ───
  async listCertifications(): Promise<CertificationRow[]> {
    const db = await getDb();
    return db.all<CertificationRow>('SELECT * FROM certifications ORDER BY sort_order ASC, id ASC');
  },

  async saveCertification(data: Partial<CertificationRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE certifications
         SET name = ?, issuer = ?, year = ?, credential_id = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.name ?? '',
          data.issuer ?? '',
          data.year ?? 'Certified',
          data.credential_id ?? null,
          data.sort_order ?? 0,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO certifications (name, issuer, year, credential_id, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name ?? '',
        data.issuer ?? '',
        data.year ?? 'Certified',
        data.credential_id ?? null,
        data.sort_order ?? 0,
      ],
    );
    return res.lastInsertRowid;
  },

  async deleteCertification(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM certifications WHERE id = ?', [id]);
  },

  // ─── Toolkits ───
  async listToolkits(): Promise<ToolkitRow[]> {
    const db = await getDb();
    return db.all<ToolkitRow>('SELECT * FROM toolkits ORDER BY sort_order ASC, id ASC');
  },

  async saveToolkit(data: Partial<ToolkitRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE toolkits
         SET title = ?, tools = ?, note = ?, sort_order = ?
         WHERE id = ?`,
        [data.title ?? '', data.tools ?? '', data.note ?? '', data.sort_order ?? 0, data.id],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO toolkits (title, tools, note, sort_order)
       VALUES (?, ?, ?, ?)`,
      [data.title ?? '', data.tools ?? '', data.note ?? '', data.sort_order ?? 0],
    );
    return res.lastInsertRowid;
  },

  async deleteToolkit(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM toolkits WHERE id = ?', [id]);
  },

  // ─── Other Projects (Badges) ───
  async listOtherProjects(): Promise<OtherProjectRow[]> {
    const db = await getDb();
    return db.all<OtherProjectRow>('SELECT * FROM other_projects ORDER BY sort_order ASC, id ASC');
  },

  async saveOtherProject(data: Partial<OtherProjectRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE other_projects
         SET name = ?, domain = ?, role = ?, summary = ?, logo_image = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.name ?? '',
          data.domain ?? '',
          data.role ?? '',
          data.summary ?? '',
          data.logo_image ?? null,
          data.sort_order ?? 0,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO other_projects (name, domain, role, summary, logo_image, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name ?? '',
        data.domain ?? '',
        data.role ?? '',
        data.summary ?? '',
        data.logo_image ?? null,
        data.sort_order ?? 0,
      ],
    );
    return res.lastInsertRowid;
  },

  async deleteOtherProject(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM other_projects WHERE id = ?', [id]);
  },

  // ─── Testimonials ───
  async listTestimonials(): Promise<TestimonialRow[]> {
    const db = await getDb();
    return db.all<TestimonialRow>('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC');
  },

  async saveTestimonial(data: Partial<TestimonialRow> & { id?: number }): Promise<number> {
    const db = await getDb();
    if (data.id) {
      await db.run(
        `UPDATE testimonials
         SET author = ?, role = ?, company = ?, quote = ?, linkedin = ?, avatar_url = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.author ?? '',
          data.role ?? '',
          data.company ?? '',
          data.quote ?? '',
          data.linkedin ?? null,
          data.avatar_url ?? null,
          data.sort_order ?? 0,
          data.id,
        ],
      );
      return data.id;
    }
    const res = await db.run(
      `INSERT INTO testimonials (author, role, company, quote, linkedin, avatar_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.author ?? '',
        data.role ?? '',
        data.company ?? '',
        data.quote ?? '',
        data.linkedin ?? null,
        data.avatar_url ?? null,
        data.sort_order ?? 0,
      ],
    );
    return res.lastInsertRowid;
  },

  async deleteTestimonial(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM testimonials WHERE id = ?', [id]);
  },

  // ─── Site Settings & Branding ───
  async getSettings(): Promise<Record<string, string>> {
    const db = await getDb();
    const rows = await db.all<{ key: string; value: string }>('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return settings;
  },

  async saveSettings(settings: Record<string, string>): Promise<void> {
    const db = await getDb();
    for (const [key, val] of Object.entries(settings)) {
      await db.run(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [key, val],
      );
    }
  },
};
