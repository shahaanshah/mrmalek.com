// Client-safe registry of the public pages whose search / share metadata is
// editable from /admin/seo. Overrides are stored in the `seo_meta` table with
// entity_type = 'route' and the stable numeric id below.
import type { SeoMeta } from './content.types';

export const PAGE_SEO_ENTITY = 'route';

export interface PageSeoDefaults {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogType?: string;
}

export interface PageSeoRoute {
  id: number;
  path: string;
  label: string;
  defaults: PageSeoDefaults;
}

export const PAGE_SEO_ROUTES: PageSeoRoute[] = [
  {
    id: 1,
    path: '/',
    label: 'Single-Page Portfolio (Home)',
    defaults: {
      title: 'Malek Hussein | Technical Product Leader & Digital Builder',
      description:
        'Portfolio of Malek Hussein — Technical Product Leader in Ottawa, Canada. Enterprise platforms, B2B marketplaces, fintech and GovTech delivery.',
      ogTitle: 'Malek Hussein | Technical Product Leader & Digital Builder',
      ogDescription:
        'Building digital products from strategy to delivery. Technical Product Leader based in Ottawa, Ontario, Canada.',
      ogImage: 'https://mrmalek.com/images/og-preview.png',
      ogType: 'website',
    },
  },
];

export function pageSeoRoute(path: string): PageSeoRoute | null {
  return PAGE_SEO_ROUTES.find((route) => route.path === path) ?? null;
}

export type PageSeoOverride = Partial<SeoMeta> | null | undefined;

function pick(value: string | null | undefined, fallback: string | undefined): string | undefined {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed !== '' ? trimmed : fallback;
}

/** Builds the head() meta array for a public page, applying CMS overrides. */
export function pageSeoMeta(defaults: PageSeoDefaults, seo: PageSeoOverride) {
  const title = pick(seo?.seo_title, defaults.title)!;
  const description = pick(seo?.meta_description, defaults.description)!;
  const ogTitle = pick(seo?.og_title, defaults.ogTitle) ?? title;
  const ogDescription = pick(seo?.og_description, defaults.ogDescription) ?? description;
  const ogImage = pick(seo?.og_image, defaults.ogImage);
  const robots: string[] = [];
  if (seo?.no_index) robots.push('noindex');
  if (seo?.no_follow) robots.push('nofollow');

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:type', content: defaults.ogType ?? 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    ...(ogImage
      ? [
          { property: 'og:image', content: ogImage },
          { name: 'twitter:image', content: ogImage },
        ]
      : []),
    ...(robots.length ? [{ name: 'robots', content: robots.join(', ') }] : []),
  ];
}

/** Canonical link entry, or none when neither an override nor a site URL exists. */
export function pageSeoLinks(seo: PageSeoOverride) {
  const canonical = pick(seo?.canonical_url, undefined);
  return canonical ? [{ rel: 'canonical', href: canonical }] : [];
}
