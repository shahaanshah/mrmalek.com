import {
  Venture,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  ProjectItem,
  BookDetails,
  ClientPartner,
} from '@/types';

export const personalInfo = {
  name: 'Malek Hussein',
  brandName: 'Mr. Malek',
  title: 'Technical Product Leader | Digital Product Builder | Entrepreneur',
  location: 'Ottawa, Ontario, Canada',
  coordinates: '45.4215° N, 75.6972° W',
  phone: '+1 343 552 7477',
  formattedPhone: '+1 (343) 552-7477',
  email: 'contact@mrmalek.com',
  statusBadge: 'Ottawa, ON • Open to Opportunities',
  yearsExperience: '7+',
  industriesServed: '5+',
  productsShipped: '10+',
  venturesBuilding: '3',
  heroTagline: 'Building Digital Products From Strategy to Delivery.',
  bioSummary:
    'I lead complex digital products from idea to execution—bringing together business strategy, technology, teams, and delivery. With experience across SaaS, e-commerce, fintech, and enterprise platforms, I bridge the gap between technical execution and business outcomes. Alongside my professional work, I build and explore ventures in AI, digital growth, and performance.',
};

export const venturesData: Venture[] = [
  {
    id: 'malekting',
    name: 'Malekting',
    slug: 'marketing-agency',
    tagline: 'Digital growth experiments',
    category: 'Digital Growth & Marketing',
    status: 'Exploring',
    url: 'https://malekting.com',
    accentColor: 'cyan',
    icon: 'TrendingUp',
    description:
      'Testing paid media, sales funnels and analytics for B2B SaaS and e-commerce brands.',
    features: [
      'Paid media strategy & customer acquisition (Meta, Google, LinkedIn)',
      'Conversion-focused funnel design & landing page optimization',
      'Analytics, attribution modeling & performance dashboards',
      'Growth strategy & marketing leadership',
    ],
  },
  {
    id: 'malektness',
    name: 'Malektness',
    slug: 'fitness-performance',
    tagline: 'Fitness systems for busy professionals',
    category: 'Personal Performance',
    status: 'Exploring',
    url: 'https://malektness.com',
    accentColor: 'amber',
    icon: 'Flame',
    description:
      'Building training and habit frameworks for people who sit at desks all day.',
    features: [
      'Structured fitness programs for desk-bound professionals',
      'Sleep quality & energy management frameworks',
      'Mental resilience & habit systems for high-stress environments',
      'Upcoming book on discipline and performance systems',
    ],
  },
  {
    id: 'ai-voice',
    name: 'AI Voice Assistance',
    slug: 'ai-voice-agents',
    tagline: 'AI phone agents for small business',
    category: 'Conversational AI & Automation',
    status: 'Exploring',
    url: 'https://mrmalek.com#ventures',
    accentColor: 'purple',
    icon: 'Bot',
    description:
      'Voice assistants that answer calls, qualify leads and book appointments.',
    features: [
      'Conversational voice agents for customer triage & scheduling',
      'CRM integration & automated lead qualification workflows',
      'Business process automation through AI-powered communication',
      'Multi-channel support (phone, chat, messaging platforms)',
    ],
  },
];

export const experienceData: ExperienceItem[] = [
  {
    id: 'exp-founder',
    role: 'Founder & Entrepreneur',
    company: 'Malekting · AI Voice Assistance',
    companyDescription: 'Independent ventures in digital growth and conversational AI.',
    location: 'Ottawa, ON, Canada',
    period: 'Jun 2026 - Present',
    type: 'Venture',
    badge: 'Current',
    description:
      'Building and running my own ventures: Malekting (digital growth and paid acquisition) and AI Voice Assistance (AI phone agents for small business).',
    impact: 'Full ownership of product, delivery, and go-to-market across two live ventures.',
    achievements: [
      'Product & Delivery: Own roadmap, build, and release cycles end to end.',
      'Growth: Run paid acquisition, funnels, and analytics for client and in-house offers.',
      'AI Automation: Design voice agents and automation flows for call handling and lead qualification.',
    ],
    skills: ['Venture Building', 'Product Management', 'Paid Acquisition', 'Conversational AI', 'Automation'],
  },
  {
    id: 'exp-asl',
    role: 'Technical Delivery Lead (Co-op)',
    company: 'ASL Agrodrain',
    companyDescription: 'Environmental and infrastructure services contractor.',
    location: 'Ottawa, ON, Canada',
    period: 'Jan 2025 - Jun 2026',
    type: 'Contract',
    description:
      'Coordinated technical programmes, compliance documentation, and operational reviews across multidisciplinary teams.',
    impact: 'Improved operational turnaround by 15 percent.',
    achievements: [
      'Programme Coordination: Monitored project timelines, budget allocations, and deliverable schedules for complex technical initiatives, improving operational turnaround by 15 percent.',
      'Administrative Compliance: Reviewed project documentation, cost plans, and operational requests to ensure full alignment with standard operating procedures and organizational guidelines.',
      'Meeting & Workshop Logistics: Organized operational review meetings, setting up documentation, recording actions, and tracking follow up items across multidisciplinary teams.',
    ],
    skills: ['Programme Coordination', 'Compliance', 'Budget Tracking', 'Stakeholder Reporting'],
  },
  {
    id: 'exp-qawafel',
    role: 'Senior Technical Product & Delivery Lead',
    company: 'Qawafel',
    companyDescription: 'B2B marketplace and enterprise platform company.',
    location: 'Remote / MENA Region',
    period: 'Jan 2024 - Dec 2025',
    type: 'Full-time',
    description:
      'Coordinated multi-stage delivery across operations, finance, and engineering, with hands-on ownership of ERP workflows and budget tracking.',
    impact: 'Reduced budget overruns by 12 percent.',
    achievements: [
      'End to End Project Administration: Coordinated medium to large multi stage project initiatives, tracking receipt of project proposals, budget revisions, and deliverable readiness.',
      'ERP & Data System Maintenance: Managed technical workflows within enterprise management systems, updating metadata, tracking system delivery, and resolving administrative bottlenecks.',
      'Cross Unit Liaison: Acted as primary focal point for administrative coordination between operations, finance, and technical departments to align resources and contract commitments.',
      'Budget & Deliverable Tracking: Conducted periodic budget reviews and project evaluations, identifying shortfalls early and presenting variance analysis reports to senior leadership, reducing budget overruns by 12 percent.',
    ],
    skills: ['ERP Systems', 'Delivery Leadership', 'Budget Analysis', 'Cross-functional Coordination'],
  },
  {
    id: 'exp-passon',
    role: 'Technical Product Lead / Business Analyst',
    company: 'Pass On',
    companyDescription: 'Crowd-shipping logistics platform.',
    location: 'Remote',
    period: 'Jan 2022 - Jan 2024',
    type: 'Full-time',
    description:
      'Optimized operational workflows, produced executive reporting, and managed schedules and resources across the delivery cycle.',
    impact: 'Increased organizational efficiency by 39 percent.',
    achievements: [
      'Process Optimization: Streamlined administrative and operational workflows, eliminating 8 redundant process steps to increase organizational efficiency by 39 percent.',
      'Documentation & Briefings: Drafted administrative briefing notes, project summaries, and status updates for key internal and external stakeholders.',
      'Resource & Schedule Management: Coordinated daily operational schedules, tracked resource allocation, and ensured project activities met established delivery deadlines.',
      'Data Visualizations: Compiled and summarized operational data into clear visualizations, graphic summaries, and periodic reports for executive reviews.',
    ],
    skills: ['Business Analysis', 'Process Optimization', 'Reporting', 'Resource Planning'],
  },
  {
    id: 'exp-lendo',
    role: 'Technical Product Manager',
    company: 'Lendo',
    companyDescription: 'Regulated fintech lending platform.',
    location: 'Remote / MENA Region',
    period: 'Jan 2021 - Dec 2021',
    type: 'Full-time',
    description:
      'Owned compliance-heavy product administration, analytics, records management, and procurement support in a regulated environment.',
    impact: 'Boosted reporting accuracy by 25 percent.',
    achievements: [
      'Compliance & Financial Administration: Reviewed project budgets, compliance documentation, and financial reports within regulated operational frameworks.',
      'Data Driven Analysis: Utilized database tools and data analytics to monitor platform performance indicators, boosting reporting accuracy by 25 percent.',
      'Information Management & Records: Maintained comprehensive project files, tracking logs, and administrative records with strict version control.',
      'Vendor & Procurement Support: Assisted with procurement requests, authorization of payments, and verification of fund availability prior to project sign offs.',
    ],
    skills: ['FinTech', 'Compliance', 'Data Analytics', 'Procurement'],
  },
  {
    id: 'exp-dopravo',
    role: 'Delivery Lead & Scrum Master',
    company: 'Dopravo',
    companyDescription: 'Digital solutions and platform studio.',
    location: 'Remote',
    period: 'Jul 2018 - Dec 2020',
    type: 'Full-time',
    description:
      'Facilitated agile delivery, coached junior team members, and safeguarded quality across sprints and releases.',
    impact: 'Increased deliverable velocity by 45 percent.',
    achievements: [
      'Team Facilitation & Guidance: Facilitated collaborative team sessions, guided junior staff on workflow procedures, and increased deliverable velocity by 45 percent.',
      'Project Planning & Tracking: Managed sprint backlogs, project milestones, and team deliverables using structured agile tools and tracking systems.',
      'Cross Functional Communication: Coordinated communication between technical teams, project managers, and external partners to maintain project alignment.',
      'Quality & Review Support: Conducted regular reviews of project artifacts and deliverables to ensure compliance with quality standards before final delivery.',
    ],
    skills: ['Scrum', 'Agile Delivery', 'Team Coaching', 'Quality Assurance'],
  },
];

export interface ToolkitGroup {
  title: string;
  tools: string[];
  note: string;
}

export const toolkitData: ToolkitGroup[] = [
  {
    title: 'Discovery & Strategy',
    tools: ['Research', 'Figma', 'Notion', 'Stakeholder mapping', 'Competitive analysis'],
    note: 'Turning a vague business goal into a validated problem statement before anyone writes a spec.',
  },
  {
    title: 'Specs & Architecture',
    tools: ['Technical specs', 'System design', 'Postman', 'AWS', 'API documentation'],
    note: "Specifying integrations so engineers aren't guessing at edge cases mid-sprint.",
  },
  {
    title: 'Delivery & Agile Leadership',
    tools: ['Jira', 'Linear', 'Scrum ceremonies', 'Sprint planning', 'CI/CD'],
    note: 'Running the ceremonies that actually change velocity, not just the ones on the calendar.',
  },
  {
    title: 'Platforms & Systems',
    tools: ['CRM enhancement', 'Salesforce', 'Payment / e-wallet integration', 'Transaction processing'],
    note: 'Hands-on with the systems of record most PMs only see in a roadmap slide.',
  },
  {
    title: 'Analytics & Measurement',
    tools: ['GA4', 'Metabase', 'Pipeline & GMV reporting', 'A/B testing'],
    note: 'Shipping is the midpoint, not the finish line — this is how I know if it worked.',
  },
  {
    title: 'Process & Quality',
    tools: ['Agile Delivery', 'Six Sigma (Yellow Belt)', 'Process improvement', 'Cross-functional coordination'],
    note: 'Where the 25% delivery-timeline improvement on the Qawafel case study actually came from.',
  },
  {
    title: 'AI & Emerging Tech',
    tools: ['Perplexity', 'Otter.ai', 'n8n', 'Vapi', 'AWS AI Practitioner', 'Google AI'],
    note: 'Perplexity and Otter for research and call synthesis; n8n and Vapi as the automation and voice-agent layer behind the AI Voice Assistance venture.',
  },
];


export const educationData: EducationItem[] = [
  {
    id: 'edu-1',
    degree: 'Master of Science — Information Technology Systems',
    institution: 'Syracuse University',
    location: 'Syracuse, NY',
    year: 'Graduate',
    details: [
      'Systems architecture, data management and technology leadership.',
    ],
  },
  {
    id: 'edu-2',
    degree: 'Graduate Certificate — Project Management',
    institution: 'Algonquin College',
    location: 'Ottawa, ON',
    year: 'Graduate Certificate',
    details: [
      'Project planning, budgeting, risk and stakeholder management.',
    ],
  },
  {
    id: 'edu-3',
    degree: 'Bachelor of Science — Computer Science',
    institution: 'Girne American University',
    location: 'Kyrenia, Cyprus',
    year: 'Bachelor',
    details: [
      'Software engineering, algorithms and database systems.',
    ],
  },
];

export const certificationsData: CertificationItem[] = [
  { name: 'Certified ScrumMaster', issuer: 'Scrum Alliance', year: 'Certified' },
  { name: 'Salesforce Administrator', issuer: 'Salesforce', year: 'Certified' },
  { name: 'Google Project Management', issuer: 'Google', year: 'Certified' },
  { name: 'AWS Certified AI Practitioner', issuer: 'Amazon Web Services', year: 'Certified' },
  { name: 'Google AI Essentials', issuer: 'Google', year: 'Certified' },
  { name: 'Six Sigma Yellow Belt', issuer: 'Six Sigma', year: 'Certified' },
];


export const clientPartnersData: ClientPartner[] = [
  { name: 'ASL Agrodrain', category: 'Infrastructure & Environmental Services', logoText: 'ASL AGRODRAIN', logoImage: '/images/companies/aslagrodrain.png' },
  { name: 'Pass On', category: 'Logistics & Crowd-Shipping', logoText: 'PASS ON', logoImage: '/images/companies/pass-on.png' },
  { name: 'Lendo', category: 'FinTech & Lending', logoText: 'LENDO', logoImage: '/images/companies/lendo.png' },
  { name: 'Qawafel', category: 'Enterprise Technology & CRM', logoText: 'QAWAFEL', logoImage: '/images/companies/qawafel.png' },
  { name: 'AEC (SAMI)', category: 'Defense & Advanced Electronics', logoText: 'AEC', logoImage: '/images/companies/aec.png' },
  { name: 'Dopravo', category: 'Digital Solutions & Platforms', logoText: 'DOPRAVO', logoImage: '/images/companies/dopravo.png' },
  { name: 'General Investment Authority', category: 'Government & Enterprise', logoText: 'MISA / GIA', logoImage: '/images/companies/misa.png' },
  { name: 'Fortune Realty', category: 'Real Estate Software', logoText: 'FORTUNE REALTY', logoImage: '/images/companies/fortune-realty.png' },
  { name: 'Razeen', category: 'Digital Investment Platform', logoText: 'RAZEEN', logoImage: '/images/companies/razeen.png' },
  { name: 'Trustangle', category: 'Enterprise Retail Solutions', logoText: 'TRUSTANGLE', logoImage: '/images/companies/trustangle.png' },
  { name: 'Enjoy Saudi', category: 'National Events & Entertainment', logoText: 'ENJOY SAUDI', logoImage: '/images/companies/enjoy-saudi.png' },
  { name: 'Tuby', category: 'Media & Streaming App', logoText: 'TUBY', logoImage: '/images/companies/tuby.png' },
  { name: 'Kunooz', category: 'Retail & Commerce', logoText: 'KUNOOZ', logoImage: '/images/companies/kunooz.png' },
];

export const projectsData: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'CRM Enhancement & Agile Delivery Improvement',
    companyName: 'Qawafel',
    category: 'TPM & Agile',
    featured: true,
    summary:
      'Led Agile delivery process improvements and CRM system enhancements that resulted in measurably faster project timelines and improved team coordination.',
    challenge:
      'Delivery timelines were inconsistent, cross-functional coordination was fragmented, and the CRM system needed significant enhancements to better serve lead generation and user engagement goals.',
    solution:
      'Implemented structured Agile ceremonies, improved sprint planning practices, and coordinated CRM feature rollouts with engineering and design teams across time zones.',
    architecture: ['Jira Workflows', 'Agile/Scrum Framework', 'CRM Platform', 'Cross-functional Coordination'],
    results: [
      '25% improvement in project delivery timelines.',
      'Measurable improvements in lead generation through CRM enhancements.',
      'Improved user engagement metrics across the platform.',
      'Streamlined deployment workflow reducing release issues.',
    ],
    tags: ['Agile Delivery', 'CRM', 'Cross-functional Leadership', 'Process Improvement', 'E-commerce'],
  },
  {
    id: 'proj-2',
    title: 'Crowd-Shipping Platform Product Delivery',
    companyName: 'Pass On',
    category: 'Logistics',
    featured: true,
    summary:
      'Managed end-to-end product delivery for a crowd-shipping logistics platform, introducing DevOps improvements and data-driven UX enhancements.',
    challenge:
      'The platform needed faster release cycles, better coordination between engineering and operations, and UX improvements driven by user data rather than assumptions.',
    solution:
      'Introduced DevOps workflow improvements, structured sprint planning, and established a data-driven approach to feature prioritization and UX decisions.',
    architecture: ['DevOps Pipeline', 'Sprint Planning Framework', 'Analytics & User Research', 'Stakeholder Management'],
    results: [
      'Accelerated deployment cycles through DevOps improvements.',
      'Data-driven UX enhancements improved user satisfaction.',
      'Better coordination between engineering, design, and operations teams.',
    ],
    tags: ['Product Delivery', 'Logistics Tech', 'DevOps', 'UX Research', 'Agile'],
  },
  {
    id: 'proj-3',
    title: 'Financial Services Integration & Reliability',
    companyName: 'Lendo',
    category: 'Integration & Systems',
    featured: true,
    summary:
      'Managed complex financial service integrations, improving transaction processing speed and reducing failure rates through systematic troubleshooting and documentation.',
    challenge:
      'Transaction processing had reliability issues, integration documentation was incomplete, and coordination between internal teams and third-party payment providers was inconsistent.',
    solution:
      'Established structured integration documentation, implemented systematic troubleshooting processes, and improved coordination workflows between product, engineering, and external payment partners.',
    architecture: ['API Integrations', 'Payment Processing Systems', 'Integration Documentation', 'Third-Party Provider Coordination'],
    results: [
      'Faster transaction processing through optimized integrations.',
      'Reduced transaction failure rates via systematic troubleshooting.',
      'Comprehensive integration documentation enabling faster onboarding.',
    ],
    tags: ['FinTech', 'API Integration', 'Payment Systems', 'Documentation', 'Technical Coordination'],
  },
  {
    id: 'proj-4',
    title: 'Conversational AI Voice Agent Exploration',
    companyName: 'Personal Venture',
    category: 'AI & Automation',
    featured: false,
    summary:
      'Exploring the development of AI-powered voice agents for business communication, combining product management experience with emerging AI technologies.',
    challenge:
      'Small businesses struggle with high call volumes, missed inquiries, and manual phone triage that takes hours of productive time every week.',
    solution:
      'Researching and prototyping conversational AI systems that can handle customer inquiries, qualify leads, and integrate with existing CRM tools.',
    architecture: ['Conversational AI Models', 'CRM Integration', 'Voice Processing Pipeline', 'Business Automation Workflows'],
    results: [
      'Exploring AI-powered solutions for business phone handling.',
      'Prototyping CRM integration workflows for automated lead qualification.',
      'Connecting CS background with AI product management experience.',
    ],
    tags: ['Conversational AI', 'Voice Agents', 'CRM Automation', 'Product Exploration', 'AI/ML'],
  },
];

export const bookData: BookDetails = {
  title: 'The Architecture of Discipline',
  subtitle: 'Practical Systems for Performance, Fitness & Execution in Tech Careers',
  status: 'In Writing',
  targetRelease: 'TBD',
  description:
    'A practical guide for tech professionals who want to build sustainable fitness habits, mental resilience, and disciplined execution systems—without burning out. Written from real experience managing high-output work while prioritizing physical health.',
  chapters: [
    {
      number: '01',
      title: 'Systems Thinking for Your Body',
      summary: 'Applying structured, repeatable frameworks to nutrition, training, and recovery.',
    },
    {
      number: '02',
      title: 'Energy Management & Sleep',
      summary: 'Practical approaches to sleep quality, energy cycles, and sustained focus for desk-bound professionals.',
    },
    {
      number: '03',
      title: 'Efficient Training for Busy Professionals',
      summary: 'Time-efficient strength and conditioning approaches designed around demanding work schedules.',
    },
    {
      number: '04',
      title: 'Consistency Over Intensity',
      summary: 'Building sustainable habits that compound over months and years, not quick fixes.',
    },
  ],
  keyTakeaways: [
    'How to build a sustainable fitness routine around a demanding tech career.',
    'Practical sleep and energy management strategies that actually work.',
    'A structured approach to mental resilience under professional pressure.',
    'Why consistency and systems beat motivation every time.',
  ],
  preorderCount: 0,
};


export interface SideProject {
  name: string;
  domain: string;
  role: string;
  summary: string;
  logoImage?: string;
}

/** Shorter engagements and product builds outside the main career timeline. */
export const otherProjectsData: SideProject[] = [
  {
    name: 'TUBY',
    domain: 'Media & streaming app',
    role: 'Product lead',
    summary: 'Kid-safe video streaming app — shaped the product scope, content-safety rules and release plan with the engineering team.',
    logoImage: '/images/companies/tuby.png',
  },
  {
    name: 'AEC (SAMI)',
    domain: 'Defence & advanced electronics',
    role: 'Delivery & requirements',
    summary: 'Enterprise systems work in a highly regulated environment — requirements, documentation and coordination across technical units.',
    logoImage: '/images/companies/aec.png',
  },
  {
    name: 'KUNOOZ',
    domain: 'Retail & commerce',
    role: 'Product & analytics',
    summary: 'Retail commerce platform — mapped the buying journey, defined the reporting layer and prioritised the roadmap with the founders.',
    logoImage: '/images/companies/kunooz.png',
  },
  {
    name: '3YSHAH',
    domain: 'Lifestyle & services marketplace',
    role: 'Product consulting',
    summary: 'Marketplace concept work — discovery, feature definition and a delivery plan the team could build against.',
  },
];
