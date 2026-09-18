import { ProjectItem } from '@/types';
import { projectsData } from './portfolioData';

export type CaseDomain =
  | 'Logistics'
  | 'Entertainment'
  | 'Insurance'
  | 'Real Estate & Infrastructure'
  | 'FinTech'
  | 'B2B Marketplaces'
  | 'GovTech';

export const caseFilters: Array<'All' | CaseDomain> = [
  'All',
  'Logistics',
  'Entertainment',
  'Insurance',
  'Real Estate & Infrastructure',
  'FinTech',
  'B2B Marketplaces',
  'GovTech',
];

const entertainmentCase: ProjectItem = {
  id: 'proj-entertainment',
  title: 'Kid-Safe Streaming Media & Marketplace Platform',
  companyName: 'Tuby & 3Yshah',
  category: 'Product Delivery',
  featured: false,
  summary:
    'Managed product architecture and delivery for kid-safe video streaming (Tuby) and lifestyle marketplace platform (3Yshah), scaling engagement and stream reliability.',
  challenge:
    'Balancing rigorous kid-safe content compliance with low-latency streaming across regional CDNs, while streamlining vendor integrations.',
  solution:
    'Designed content gating pipelines, automated media ingestion, and standardized sprint delivery between mobile clients and backend video infrastructure.',
  architecture: [
    'Video Streaming CDN',
    'Content Safety Gating',
    'Mobile Client Engineering',
    'Real-time Analytics',
  ],
  results: [
    'Over 99.8% streaming uptime achieved during high-traffic broadcast events.',
    'Smooth multi-platform release on iOS and Android.',
    'Compliant content-safety workflow for youth entertainment.',
  ],
  tags: ['Entertainment', 'Video Streaming', 'Content Safety', 'Mobile Delivery', 'Marketplace'],
};

const insuranceCase: ProjectItem = {
  id: 'proj-insurance',
  title: 'Digital Insurance & Investment Platform Architecture',
  companyName: 'Razeen',
  category: 'Integration & Systems',
  featured: false,
  summary:
    'Spearheaded technical requirements and digital insurance integration workflows for Razeen, improving transaction throughput and regulatory compliance.',
  challenge:
    'Complex insurance policy underwriting rules and legacy broker system connections caused quote latency and customer onboarding drop-offs.',
  solution:
    'Re-engineered policy quote APIs, unified client data models, and instituted strict SLA monitoring across external insurance carrier endpoints.',
  architecture: [
    'Policy Underwriting Engine',
    'Broker Gateway API',
    'Regulatory Audit Trail',
    'Instant KYC Verification',
  ],
  results: [
    '35% reduction in quote turnaround time for online policies.',
    '100% compliance with regional insurance authority data mandates.',
    'Significant reduction in customer onboarding drop-offs.',
  ],
  tags: ['Insurance', 'FinTech', 'API Architecture', 'Regulatory Compliance', 'Underwriting'],
};

const infrastructureCase: ProjectItem = {
  id: 'proj-infrastructure',
  title: 'Infrastructure Delivery Management & Property Systems',
  companyName: 'ASL Agrodrain & Al Tharwah AlAqariya',
  category: 'Integration & Systems',
  featured: false,
  summary:
    'Coordinated technical initiatives, project timelines, and operational tracking for complex municipal and environmental infrastructure programs at ASL Agrodrain, and digital real estate platforms.',
  challenge:
    'Multi-vendor public-works dependencies, rigorous cost tracking, and operational bottlenecks across civil engineering and technical units.',
  solution:
    'Deployed structured milestone governance, real-time variance reporting, and automated administrative compliance reviews.',
  architecture: [
    'Project Control Systems',
    'Operational Timelines',
    'Budget Variance Analysis',
    'Compliance Tracking',
  ],
  results: [
    '15% improvement in operational turnaround time across key initiatives.',
    'Elimination of budget discrepancies through real-time variance analysis.',
    'Streamlined compliance documentation approved without audit friction.',
  ],
  tags: ['Infrastructure', 'Real Estate', 'Project Delivery', 'Operational Compliance', 'Reporting'],
};

/**
 * GovTech engagement delivered under the Qawafel enterprise practice.
 */
const govTechCase: ProjectItem = {
  id: 'proj-5',
  title: 'Investment Authority Digital Services Rollout',
  companyName: 'General Investment Authority (MISA)',
  category: 'Integration & Systems',
  featured: false,
  summary:
    'Coordinated delivery of digital services and enterprise integrations for a national investment authority and its defense-sector partners, working to public-sector governance, security, and audit requirements.',
  challenge:
    'Public-sector programmes carry strict approval chains, security review gates, and multi-vendor dependencies — all of which slow down release cycles and blur ownership of technical decisions.',
  solution:
    'Established a single delivery cadence across vendors, wrote the integration and acceptance documentation that review boards signed against, and ran sprint governance that kept engineering unblocked while approvals ran in parallel.',
  architecture: [
    'Enterprise Integration Layer',
    'Role-Based Access & Audit Trails',
    'Vendor & Stakeholder Governance',
    'Documentation-Led Acceptance',
  ],
  results: [
    'Predictable release cadence across multi-vendor public-sector delivery.',
    'Approval-ready integration documentation reducing review turnaround.',
    'Clear ownership between authority stakeholders and engineering teams.',
  ],
  tags: ['GovTech', 'Enterprise Integration', 'Governance', 'Stakeholder Management', 'Documentation'],
};

export interface CaseMeta {
  domain: CaseDomain;
  /** Company names (from the trusted-by logos) that resolve to this case study. */
  aliases: string[];
  /** Headline metric shown on the filter row. */
  keyDecisions: string[];
  architectureNote: string;
}

export const caseMeta: Record<string, CaseMeta> = {
  'proj-1': {
    domain: 'B2B Marketplaces',
    aliases: ['Qawafel', 'Trustangle', 'Kunooz'],
    keyDecisions: [
      'Standardised one Jira workflow across engineering, design and QA instead of per-team boards.',
      'Sequenced CRM enhancements behind lead-generation impact rather than internal request order.',
      'Made release readiness a checklist gate, which removed most late-stage deployment surprises.',
    ],
    architectureNote:
      'A CRM core wired into the commerce platform, with reporting surfaces for sales and marketing and an Agile delivery pipeline governing every change.',
  },
  'proj-2': {
    domain: 'Logistics',
    aliases: ['Pass On', 'Dopravo'],
    keyDecisions: [
      'Invested in the DevOps pipeline first — release friction was the real bottleneck, not team velocity.',
      'Replaced assumption-led UX changes with decisions backed by usage data and user research.',
      'Kept operations in sprint planning so field realities shaped the roadmap.',
    ],
    architectureNote:
      'A peer-to-peer logistics platform with automated deployment pipelines and an analytics layer feeding feature prioritisation.',
  },
  'proj-3': {
    domain: 'FinTech',
    aliases: ['Lendo'],
    keyDecisions: [
      'Treated integration documentation as a product deliverable, not an afterthought.',
      'Built a repeatable triage path for transaction failures shared with third-party providers.',
      'Aligned internal engineering and external payment partners on one escalation protocol.',
    ],
    architectureNote:
      'Lending workflows integrated with banking and payment providers through documented APIs, with monitoring and structured troubleshooting around transaction processing.',
  },
  'proj-entertainment': {
    domain: 'Entertainment',
    aliases: ['Tuby', '3YSHAH', '3Ysha', 'Enjoy Saudi'],
    keyDecisions: [
      'Prioritised video stream reliability and low-latency buffering over complex UI animations.',
      'Integrated strict child-protection content gating at the ingestion and CDN distribution layer.',
      'Coordinated parallel mobile (iOS/Android) and web client releases for simultaneous seasonal launches.',
    ],
    architectureNote:
      'A distributed media streaming architecture with edge caching, content moderation gates, and mobile client performance monitoring.',
  },
  'proj-insurance': {
    domain: 'Insurance',
    aliases: ['Razeen'],
    keyDecisions: [
      'Cached dynamic quote pricing models locally to protect user flow from third-party latency.',
      'Standardised API data contracts between insurance brokers and the core platform.',
      'Automated compliance reporting to satisfy regional monetary and insurance regulatory audits.',
    ],
    architectureNote:
      'An enterprise insurance quote engine and policy administration layer with real-time audit verification.',
  },
  'proj-infrastructure': {
    domain: 'Real Estate & Infrastructure',
    aliases: ['ASL Agrodrain', 'Fortune Realty', 'Al Tharwah AlAqariya', 'Al Tharwah'],
    keyDecisions: [
      'Implemented automated project timeline tracking to flag procurement bottlenecks early.',
      'Instituted standard operating procedure reviews that cut approval wait times by 15%.',
      'Created shared operational dashboards between technical delivery and field management teams.',
    ],
    architectureNote:
      'A delivery coordination and project controls system connecting operational workflows, cost tracking, and regulatory compliance.',
  },
  'proj-5': {
    domain: 'GovTech',
    aliases: ['General Investment Authority', 'AEC (SAMI)', 'MISA'],
    keyDecisions: [
      'Ran approvals in parallel with build rather than serialising them behind each milestone.',
      'Wrote acceptance criteria review boards could sign directly.',
      'Named a single delivery owner across vendors to stop decisions stalling between parties.',
    ],
    architectureNote:
      'An integration and access-control layer over authority systems, governed by audit trails and documentation-led acceptance.',
  },
};

export const allCaseStudies: ProjectItem[] = [
  ...projectsData.filter((p) => p.id !== 'proj-4'), // Exclude duplicate AI exploration from case studies; it belongs to outside client work
  entertainmentCase,
  insuranceCase,
  infrastructureCase,
  govTechCase,
];

/** Resolves a trusted-by brand name to its case study id. */
export function findCaseByCompany(company: string): string | null {
  const direct = allCaseStudies.find((c) => c.companyName === company);
  if (direct) return direct.id;
  const entry = Object.entries(caseMeta).find(([, meta]) => meta.aliases.includes(company));
  return entry ? entry[0] : null;
}
