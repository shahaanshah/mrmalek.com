// Converts CMS records into the shapes the existing homepage sections expect,
// so the public design keeps working unchanged.
import type { ContentRecord } from './content.types';
import { lines } from './homepage.types';
import type { CaseMeta } from '@/data/caseStudyMeta';
import type { ProjectItem, Venture } from '@/types';

export interface HomeCase {
  project: ProjectItem;
  meta: CaseMeta;
}

function detail(record: ContentRecord, key: string): string {
  return (record.details[key] as string | null) ?? '';
}

export function toCase(record: ContentRecord): HomeCase {
  return {
    project: {
      id: record.slug,
      title: record.title,
      companyName: detail(record, 'client') || undefined,
      category: (detail(record, 'role') || detail(record, 'industry') || 'Product Delivery') as ProjectItem['category'],
      summary: record.excerpt,
      challenge: detail(record, 'problem'),
      solution: detail(record, 'solution'),
      architecture: lines(detail(record, 'architecture')),
      results: lines(detail(record, 'results')),
      tags: lines(detail(record, 'tags')),
      featured: !!record.is_featured,
    },
    meta: {
      domain: (detail(record, 'industry') || 'Enterprise Platforms') as CaseMeta['domain'],
      aliases: lines(detail(record, 'aliases')),
      keyDecisions: lines(detail(record, 'decisions')),
      architectureNote: detail(record, 'outcomes'),
    },
  };
}

export interface ProcessPhase {
  number: string;
  title: string;
  statement: string;
  toolchain: string[];
}

export function toPhase(record: ContentRecord, index: number): ProcessPhase {
  return {
    number: detail(record, 'step_label') || String(index + 1).padStart(2, '0'),
    title: record.title,
    statement: record.excerpt,
    toolchain: lines(record.body),
  };
}

export function toVenture(record: ContentRecord): Venture {
  return {
    id: record.slug,
    name: record.title,
    slug: record.slug,
    tagline: record.excerpt,
    description: record.body,
    category: '',
    status: (detail(record, 'venture_status') || 'Exploring') as Venture['status'],
    url: detail(record, 'website_url'),
    accentColor: 'purple',
    features: [],
    icon: '',
  };
}
