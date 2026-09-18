// URL segment ↔ content type mapping used by the /admin/content/$type routes.
// Strictly manages single-page landing sections (Case Studies, Ventures, How I Work Framework).
import type { ContentType } from './content.types';

export const TYPE_BY_SLUG: Record<string, ContentType> = {
  'case-studies': 'case_study',
  ventures: 'venture',
  frameworks: 'framework',
};

export const SLUG_BY_TYPE: Record<ContentType, string> = {
  case_study: 'case-studies',
  venture: 'ventures',
  framework: 'frameworks',
};

export function typeFromSlug(slug: string): ContentType | null {
  return TYPE_BY_SLUG[slug] ?? null;
}
