// Client-safe types + validation for the generic content system.
// Shared by the admin UI, the public pages and the server repositories.
import { z } from 'zod';

export const CONTENT_TYPES = ['case_study', 'venture', 'framework'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_STATUSES = ['draft', 'published'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface SeoMeta {
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  no_index: 0 | 1;
  no_follow: 0 | 1;
}

export interface ContentItem {
  id: number;
  type: ContentType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentStatus;
  is_featured: 0 | 1;
  sort_order: number;
  category_id: number | null;
  publish_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentRecord extends ContentItem {
  category_name: string | null;
  details: Record<string, string | null>;
  seo: SeoMeta | null;
}

export const seoSchema = z.object({
  seo_title: z.string().trim().max(70, 'Keep the SEO title under 70 characters').optional().or(z.literal('')),
  meta_description: z
    .string()
    .trim()
    .max(180, 'Keep the meta description under 180 characters')
    .optional()
    .or(z.literal('')),
  canonical_url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  og_title: z.string().trim().max(120).optional().or(z.literal('')),
  og_description: z.string().trim().max(220).optional().or(z.literal('')),
  og_image: z.string().trim().url('Enter a valid image URL').optional().or(z.literal('')),
  twitter_title: z.string().trim().max(120).optional().or(z.literal('')),
  twitter_description: z.string().trim().max(220).optional().or(z.literal('')),
  twitter_image: z.string().trim().url('Enter a valid image URL').optional().or(z.literal('')),
  no_index: z.boolean().optional(),
  no_follow: z.boolean().optional(),
});

export type SeoInput = z.infer<typeof seoSchema>;

/** Fields every content type shares. */
export const baseContentSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  slug: z.string().trim().max(120).optional().or(z.literal('')),
  excerpt: z.string().trim().max(400, 'Keep the summary under 400 characters').optional().or(z.literal('')),
  body: z.string().trim().max(20000).optional().or(z.literal('')),
  status: z.enum(CONTENT_STATUSES).default('draft'),
  is_featured: z.boolean().optional(),
  sort_order: z.coerce.number().int().min(0).max(999).optional(),
  category_id: z.coerce.number().int().positive().optional().nullable(),
  publish_date: z.string().trim().max(40).optional().or(z.literal('')),
  seo: seoSchema.optional(),
  details: z.record(z.string(), z.string().max(8000)).optional(),
});

export type ContentInput = z.infer<typeof baseContentSchema>;

/** Per-type detail fields rendered by the shared admin form. */
export interface DetailField {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'url';
  placeholder?: string;
  help?: string;
}

export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  labelPlural: string;
  publicPath: string | null;
  usesCategory: boolean;
  usesFeatured: boolean;
  detailFields: DetailField[];
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  case_study: {
    type: 'case_study',
    label: 'Case study',
    labelPlural: 'Case Studies',
    publicPath: null,
    usesCategory: true,
    usesFeatured: true,
    detailFields: [
      {
        key: 'client',
        label: 'Client / Brand Partner',
        kind: 'text',
        placeholder: 'e.g. Qawafel, Razeen, Pass On, Dopravo, Lendo',
        help: 'When visitors click this brand logo in the partner banner, it opens this case study.',
      },
      {
        key: 'industry',
        label: 'Domain / Filter Tab',
        kind: 'text',
        placeholder: 'e.g. FinTech, B2B Marketplaces, Enterprise Platforms, GovTech',
        help: 'Used for the domain filter buttons in the case studies slider.',
      },
      { key: 'role', label: 'Discipline / Role', kind: 'text', placeholder: 'e.g. Technical Product Manager & Agile Delivery' },
      { key: 'problem', label: 'The Challenge', kind: 'textarea', placeholder: 'The business, scale, or operational challenge faced...' },
      { key: 'solution', label: 'What I Delivered', kind: 'textarea', placeholder: 'Strategic architecture, roadmap, and delivery execution...' },
      { key: 'architecture', label: 'Technical Architecture Highlights', kind: 'textarea', help: 'One architectural point per line.' },
      { key: 'decisions', label: 'Key Decisions & Trade-offs', kind: 'textarea', help: 'One strategic decision per line.' },
      { key: 'results', label: 'Headline Results & Metrics', kind: 'textarea', help: 'One measurable outcome per line (e.g. "40% reduction in cycle time").' },
      { key: 'tags', label: 'Tags', kind: 'textarea', help: 'One methodology or tech tag per line (e.g. "Event-Driven", "Scrum").' },
    ],
  },
  venture: {
    type: 'venture',
    label: 'Venture',
    labelPlural: 'Ventures',
    publicPath: null,
    usesCategory: false,
    usesFeatured: true,
    detailFields: [
      { key: 'website_url', label: 'Website URL', kind: 'url', placeholder: 'https://...' },
      { key: 'logo_url', label: 'Logo / Image URL', kind: 'url', placeholder: '/images/ventures/...' },
      { key: 'venture_status', label: 'Status label', kind: 'text', placeholder: 'e.g. Live, Scaling, Concept' },
    ],
  },
  framework: {
    type: 'framework',
    label: 'Framework step',
    labelPlural: 'Frameworks',
    publicPath: null,
    usesCategory: false,
    usesFeatured: false,
    detailFields: [
      { key: 'step_label', label: 'Phase Step Number (01, 02, 03, 04)', kind: 'text', placeholder: '01' },
      { key: 'tools', label: 'Toolchain & Methodologies', kind: 'textarea', help: 'One tool/method per line (e.g. "Linear", "Figma", "Datadog").' },
    ],
  },
};

export const DETAIL_TABLE: Record<ContentType, string | null> = {
  case_study: 'case_study_details',
  venture: 'venture_details',
  framework: 'framework_details',
};

export interface MediaItem {
  id: number;
  file_name: string;
  url: string;
  thumbnail_url: string | null;
  alt_text: string;
  usage_note: string | null;
  created_at: string;
  updated_at: string;
}

export const mediaSchema = z.object({
  file_name: z.string().trim().min(1, 'Asset name is required').max(160),
  url: z
    .string()
    .trim()
    .min(1, 'URL or file path is required')
    .max(600)
    .refine(
      (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
      'URL must start with /, http://, or https://',
    ),
  thumbnail_url: z
    .string()
    .trim()
    .max(600)
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Thumbnail URL must start with /, http://, or https://',
    ),
  alt_text: z.string().trim().max(300).optional().or(z.literal('')),
  usage_note: z.string().trim().max(300).optional().or(z.literal('')),
});

export type MediaInput = z.infer<typeof mediaSchema>;

export const SITE_SETTING_KEYS = [
  'site_title',
  'site_description',
  'site_logo',
  'site_favicon',
  'default_og_image',
  'twitter_handle',
  'contact_email',
  'contact_phone',
  'linkedin_url',
  'x_url',
  'youtube_url',
  'indexing_enabled',
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];
export type SiteSettings = Record<SiteSettingKey, string>;

export const siteSettingsSchema = z.object({
  site_title: z.string().trim().max(120).optional().or(z.literal('')),
  site_description: z.string().trim().max(300).optional().or(z.literal('')),
  site_logo: z.string().trim().max(600).optional().or(z.literal('')),
  site_favicon: z.string().trim().max(600).optional().or(z.literal('')),
  default_og_image: z.string().trim().max(600).optional().or(z.literal('')),
  twitter_handle: z.string().trim().max(60).optional().or(z.literal('')),
  contact_email: z.string().trim().max(160).optional().or(z.literal('')),
  contact_phone: z.string().trim().max(60).optional().or(z.literal('')),
  linkedin_url: z.string().trim().max(300).optional().or(z.literal('')),
  x_url: z.string().trim().max(300).optional().or(z.literal('')),
  youtube_url: z.string().trim().max(300).optional().or(z.literal('')),
  indexing_enabled: z.string().trim().max(10).optional().or(z.literal('')),
});

export interface ActivityEntry {
  id: number;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  summary: string;
  created_at: string;
}

export interface RevisionSummary {
  id: number;
  created_at: string;
}
