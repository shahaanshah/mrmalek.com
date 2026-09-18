export interface Venture {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  status: 'Live' | 'Scaling' | 'Beta' | 'Upcoming' | 'Exploring';
  url: string;
  accentColor: 'cyan' | 'purple' | 'amber' | 'emerald';
  features: string[];
  metrics?: { label: string; value: string }[];
  icon: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyDescription?: string;
  location: string;
  period: string;
  type: 'Full-time' | 'Contract' | 'Venture' | 'Freelance';
  description: string;
  impact?: string;
  achievements: string[];
  skills: string[];
  badge?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  honors?: string;
  details: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
  credentialId?: string;
  icon?: string;
}

export type ProjectCategory =
  | 'Logistics'
  | 'Entertainment'
  | 'Insurance'
  | 'Real Estate & Infrastructure'
  | 'FinTech'
  | 'B2B Marketplaces'
  | 'GovTech'
  | 'TPM & Agile'
  | 'AI & Automation'
  | 'Growth Systems'
  | 'Cloud & Web'
  | 'Product Delivery'
  | 'Integration & Systems'
  | (string & {});

export interface ProjectItem {
  id: string;
  title: string;
  companyName?: string;
  category: ProjectCategory;
  summary: string;
  challenge: string;
  solution: string;
  architecture: string[];
  results: string[];
  tags: string[];
  featured?: boolean;
}

export interface BookDetails {
  title: string;
  subtitle: string;
  status: string;
  targetRelease: string;
  description: string;
  chapters: { number: string; title: string; summary: string }[];
  keyTakeaways: string[];
  preorderCount: number;
}

export interface ClientPartner {
  name: string;
  category: string;
  logoText: string;
  logoImage?: string;
  badge?: string;
}

export interface LeadershipPhoto {
  id: string;
  title: string;
  roleTag: string;
  description: string;
  location: string;
  image: string;
  aspect: string;
  accent: 'purple' | 'amber' | 'cyan' | 'emerald';
}

export interface AspectRatioSpec {
  purpose: string;
  ratio: string;
  dimensions: string;
  orientation: 'Square' | 'Vertical' | 'Horizontal' | 'Panoramic';
  description: string;
  tips: string[];
  previewClass: string;
}
