// Client-safe schema for the editable homepage copy.
// Stored as simple key/value rows so new fields can be added without a migration.
import { z } from "zod";

export const HOMEPAGE_KEYS = [
  "hero_eyebrow",
  "hero_title",
  "hero_highlight",
  "hero_subtitle",
  "hero_cta_primary",
  "hero_cta_secondary",
  "hero_image",
  "hero_metrics",
  "intro_kicker",
  "intro_title",
  "intro_body",
  "work_kicker",
  "work_title",
  "work_highlight",
  "work_subtitle",
  "process_kicker",
  "process_title",
  "process_highlight",
  "process_subtitle",
  "ventures_kicker",
  "ventures_title",
  "ventures_highlight",
  "ventures_subtitle",
  "pmtalks_kicker",
  "pmtalks_title",
  "pmtalks_highlight",
  "pmtalks_subtitle",
  "toolkit_kicker",
  "toolkit_title",
  "toolkit_highlight",
  "toolkit_subtitle",
  "history_kicker",
  "history_title",
  "history_highlight",
  "history_subtitle",
  "testimonials_kicker",
  "testimonials_title",
  "testimonials_highlight",
  "testimonials_subtitle",
  "contact_kicker",
  "contact_title",
  "contact_highlight",
  "contact_subtitle",
  "cv_banner_kicker",
  "cv_banner_title",
  "cv_banner_highlight",
  "cv_banner_subtitle",
  "cv_banner_button_text",
  "cv_banner_file_url",
] as const;

export type HomepageKey = (typeof HOMEPAGE_KEYS)[number];
export type HomepageContent = Record<HomepageKey, string>;

export const HOMEPAGE_DEFAULTS: HomepageContent = {
  hero_eyebrow: "MALEK HUSSEIN • PRODUCT LEADER & BUILDER",
  hero_title: "I build digital products, businesses, and systems that",
  hero_highlight: "turn ideas into revenue.",
  hero_subtitle:
    "Bridging technical engineering with commercial strategy to ship revenue-generating software across SaaS, e-commerce, fintech, and operational AI.",
  hero_cta_primary: "View My Work",
  hero_cta_secondary: "Let's Talk",
  hero_image: "/images/malek-glasses.png",
  hero_metrics: [
    "8+ | Years Product Delivery | SaaS, FinTech & Enterprise",
    "20+ | Digital Products Shipped | From Strategy to Launch",
    "10+ | Enterprise & Venture Brands | North America & MENA",
    "$50M+ | GMV & Pipeline Handled | High-Volume Systems",
  ].join("\n"),
  intro_kicker: "ABOUT",
  intro_title: "About Me",
  intro_body: [
    "I started at Dopravo in Riyadh, working in entertainment through the 3yshaya project, then moved to Razeen in insurance. From there I went into technical project management at Pass On, which was logistics, and then Qawafel, which sits in B2B marketplace and e-commerce SaaS. For Qawafel I worked remotely for a while, researching and helping open their first North America team and a hub in the US. Alongside all that I picked up a few projects too: Tuby in entertainment, Lendo in fintech, AEC in the semi-government and defense space, and Fortune Realty Co. in real estate. Different industries, different stakeholders, same pattern really: someone had a business goal and no clear path from that goal to a working product.",
    "On the education side, I've bounced around a bit too. Bachelor's in MIS from Girne American University in Cyprus, Master's in Management Information Technology from Syracuse University in New York, and a postgraduate certificate in Project Management from Algonquin College here in Canada. Three countries, three schools, and honestly each one taught me something the others didn't.",
    "These days I'm based in Ottawa, running Malketing as CEO and Founder, and working with ASL Agrodrain on the side. I still take on technical product and delivery leadership work directly too, mostly because I like staying close enough to the build to know when something's actually going to ship versus when it just looks good on a roadmap slide. If there's a thread through all of it, it's that I never really separated the commercial side from the technical side. I want to know why a feature matters to revenue and whether the API can actually support it, in the same conversation. At this point I've worked across enough industries that I'm basically qualified to build anything except a stable career narrative for a resume template.",
  ].join("\n\n"),
  work_kicker: "FEATURED WORK",
  work_title: "Case Studies &",
  work_highlight: "Real Results",
  work_subtitle:
    "Measurable outcomes delivered for enterprise platforms, B2B marketplaces, and venture-backed scale-ups.",
  process_kicker: "How I Work",
  process_title: "From idea to",
  process_highlight: "shipped product.",
  process_subtitle: "A simple, repeatable path: understand, design, build, and improve.",
  ventures_kicker: "SIDE VENTURES",
  ventures_title: "Outside",
  ventures_highlight: "Client Work",
  ventures_subtitle: "The ventures I build and run on my own time.",
  pmtalks_kicker: "PM TALKS & BREAKDOWNS",
  pmtalks_title: "Insights on",
  pmtalks_highlight: "product management",
  pmtalks_subtitle: "Weekly short videos on how I plan, prioritise, and ship real products.",
  toolkit_kicker: "TECHNICAL TOOLKIT",
  toolkit_title: "Tools, stack &",
  toolkit_highlight: "methodologies",
  toolkit_subtitle: "The engineering, product, and leadership stack behind the delivery.",
  history_kicker: "CAREER MATRIX",
  history_title: "Experience &",
  history_highlight: "Credentials",
  history_subtitle: "Tenure across enterprise platforms, scale-ups, and academic qualifications.",
  testimonials_kicker: "ENDORSEMENTS",
  testimonials_title: "Recommendations &",
  testimonials_highlight: "Social Proof",
  testimonials_subtitle: "Feedback from executive stakeholders, engineering directors, and founders.",
  contact_kicker: "DIRECT INQUIRIES",
  contact_title: "Let's build",
  contact_highlight: "something great.",
  contact_subtitle: "Open to select technical product consulting, fractional delivery leadership, and high-impact advisory.",
  cv_banner_kicker: "RESUME",
  cv_banner_title: "Looking for my full CV / Resume?",
  cv_banner_highlight: "",
  cv_banner_subtitle:
    "Download a clean 1-page PDF summary of my experience, leadership tenure, and technical delivery track record.",
  cv_banner_button_text: "Download CV (PDF)",
  cv_banner_file_url: "",
};

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  site_title: "Malek Hussein | Technical Product Leader & Digital Builder",
  site_description:
    "Portfolio of Malek Hussein — Technical Product Leader based in Ottawa, Canada. Leading complex digital products across SaaS, e-commerce, fintech, and enterprise platforms.",
  brand_name: "Mr. Malek",
  site_logo: "/images/malek-logo.png",
  site_favicon: "/favicon.ico",
  cv_url: "/cv-malek-hussein.pdf",
  contact_email: "contact@mrmalek.com",
  contact_phone: "+1 343 552 7477",
  whatsapp_phone: "+13435527477",
  status_badge: "Ottawa, ON • Open to Opportunities",
  location: "Ottawa, Ontario, Canada",
  linkedin_url: "https://linkedin.com/in/malekhussein",
  x_url: "https://x.com/mrmalek",
  youtube_url: "https://youtube.com",
};

export const homepageSchema = z.object(
  Object.fromEntries(HOMEPAGE_KEYS.map((key) => [key, z.string().max(2000).optional()])) as Record<
    HomepageKey,
    z.ZodOptional<z.ZodString>
  >,
);

export type HomepageInput = z.infer<typeof homepageSchema>;

export interface HomepageField {
  key: HomepageKey;
  label: string;
  kind: "text" | "textarea";
  help?: string;
}

export interface HomepageGroup {
  label: string;
  description: string;
  fields: HomepageField[];
}

export const HOMEPAGE_GROUPS: HomepageGroup[] = [
  {
    label: "Hero",
    description: "The first thing visitors read, plus the four numbers underneath it.",
    fields: [
      { key: "hero_eyebrow", label: "Small label above the headline", kind: "text" },
      { key: "hero_title", label: "Headline", kind: "textarea" },
      { key: "hero_highlight", label: "Highlighted end of the headline", kind: "text" },
      { key: "hero_subtitle", label: "Supporting paragraph", kind: "textarea" },
      { key: "hero_cta_primary", label: "Primary button label", kind: "text" },
      { key: "hero_cta_secondary", label: "Secondary button label", kind: "text" },
      { key: "hero_image", label: "Portrait image URL", kind: "text" },
      {
        key: "hero_metrics",
        label: "Numbers strip",
        kind: "textarea",
        help: "One per line: value | label | small note.",
      },
    ],
  },
  {
    label: "Intro",
    description: 'An optional short paragraph shown just before "How I Work". Leave blank to hide it.',
    fields: [
      { key: "intro_kicker", label: "Small label", kind: "text" },
      { key: "intro_title", label: "Heading", kind: "text" },
      { key: "intro_body", label: "Paragraph", kind: "textarea" },
    ],
  },
  {
    label: "Featured work heading",
    description: "Wording above the case study slider.",
    fields: [
      { key: "work_kicker", label: "Small label", kind: "text" },
      { key: "work_title", label: "Heading", kind: "text" },
      { key: "work_highlight", label: "Highlighted words", kind: "text" },
      { key: "work_subtitle", label: "Supporting line", kind: "textarea" },
    ],
  },
  {
    label: "How I work heading",
    description: "Wording above the four delivery steps (the steps live under Frameworks).",
    fields: [
      { key: "process_kicker", label: "Small label", kind: "text" },
      { key: "process_title", label: "Heading", kind: "text" },
      { key: "process_highlight", label: "Highlighted words", kind: "text" },
      { key: "process_subtitle", label: "Supporting line", kind: "textarea" },
    ],
  },
  {
    label: "Outside client work heading",
    description: "Wording above the ventures list (the ventures live under Ventures).",
    fields: [
      { key: "ventures_kicker", label: "Small label", kind: "text" },
      { key: "ventures_title", label: "Heading", kind: "text" },
      { key: "ventures_highlight", label: "Highlighted words", kind: "text" },
      { key: "ventures_subtitle", label: "Supporting line", kind: "textarea" },
    ],
  },
];

export interface HeroMetric {
  value: string;
  label: string;
  sub: string;
}

export function parseHeroMetrics(raw?: string | null): HeroMetric[] {
  if (!raw || typeof raw !== "string") {
    return [
      { value: "8+ Years", label: "Product & Engineering", sub: "Enterprise & Scale-Ups" },
      { value: "10+", label: "Products Shipped", sub: "FinTech, GovTech, SaaS" },
      { value: "39%", label: "Operational Gains", sub: "Measurable Delivery Results" },
      { value: "3", label: "Ventures Founded", sub: "Product & AI Focus" },
    ];
  }
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value = "", label = "", sub = ""] = line.split("|").map((part) => part.trim());
      return { value, label, sub };
    });
}

/** Splits a multi-line detail field into a clean list. */
export function lines(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}
