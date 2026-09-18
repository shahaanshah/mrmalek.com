import { getDb } from '../src/server/db/client.server';
import { slugify } from '../src/lib/cms/types';
import { allCaseStudies, caseMeta } from '../src/data/caseStudyMeta';

async function main() {
  console.log('Synchronizing Case Studies in SQLite with client review specifications...');
  const db = await getDb();

  // Delete existing case_study content items (cascades to case_study_details)
  const existingCases = await db.all<{ id: number }>('SELECT id FROM content_items WHERE type = "case_study"');
  for (const c of existingCases) {
    await db.run('DELETE FROM case_study_details WHERE content_id = ?', [c.id]);
    await db.run('DELETE FROM content_items WHERE id = ?', [c.id]);
  }

  let order = 0;
  for (const project of allCaseStudies) {
    const meta = caseMeta[project.id];
    const slug = slugify(`${project.companyName ?? ''} ${project.title}`) || slugify(project.title);
    
    const result = await db.run(
      `INSERT INTO content_items (type, title, slug, excerpt, body, status, is_featured, sort_order, publish_date, published_at)
       VALUES ('case_study', ?, ?, ?, '', 'published', ?, ?, date('now'), datetime('now'))`,
      [project.title, slug, project.summary, order === 0 ? 1 : 0, order],
    );
    
    const contentId = result.lastInsertRowid;
    await db.run(
      `INSERT INTO case_study_details
        (content_id, client, industry, role, problem, solution, architecture, decisions, outcomes, results, tags, aliases)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contentId,
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
    console.log(`+ Seeded [${meta?.domain}]: ${project.companyName} - ${project.title}`);
    order++;
  }

  console.log(`Successfully synchronized ${order} case studies in SQLite.`);
}

main().catch((err) => {
  console.error('Failed to seed case studies:', err);
  process.exit(1);
});
