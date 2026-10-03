import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import CosmicCanvas from '@/components/background/CosmicCanvas';
import ScrollProgress from '@/components/ui/ScrollProgress';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import BusinessesBanner from '@/components/sections/BusinessesBanner';
import CareerMatrix from '@/components/sections/CareerMatrix';
import ProcessSection from '@/components/sections/ProcessSection';
import ToolkitSection from '@/components/sections/ToolkitSection';
import OtherProjects from '@/components/sections/OtherProjects';
import InsightsSection from '@/components/sections/InsightsSection';
import VentureEcosystem from '@/components/sections/VentureEcosystem';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import CollapsibleSectionWrapper from '@/components/ui/CollapsibleSectionWrapper';
import { findCaseByCompany } from '@/data/caseStudyMeta';
import useScrollReveal from '@/hooks/useScrollReveal';
import { getPageSeo } from '@/lib/cms/public.functions';
import { pageSeoLinks, pageSeoMeta, pageSeoRoute } from '@/lib/cms/pageSeo';
import { getLandingPageData } from '@/lib/cms/landing.functions';

function HomePage() {
  const {
    settings,
    content,
    sections,
    partners,
    experiences,
    education,
    certifications,
    toolkits,
    otherProjects,
    testimonials,
    cases,
    caseMetaMap,
    phases,
    ventures,
    videos,
    topics,
  } = Route.useLoaderData();

  const isEnabled = (key: string) => sections?.[key]?.is_enabled !== 0;

  // Case study targeted from a Trusted By logo click. Object wrapper so
  // clicking the same brand twice still re-triggers the jump.
  const [focusCase, setFocusCase] = useState<{ id: string; n: number } | null>(null);

  // Activate scroll-triggered entrance animations
  useScrollReveal();

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-space)' }}>
      {/* Scroll-linked reading progress */}
      <ScrollProgress />

      {/* 60fps Starfield Canvas Background */}
      <CosmicCanvas />

      {/* Floating Glass Navbar */}
      <Navbar onOpenConsultation={scrollToContact} settings={settings} />

      {/* 01. Hero: Positioning, Value Prop & Authority Metrics */}
      {isEnabled('hero') && (
        <CollapsibleSectionWrapper section={sections?.['hero']} sectionId="hero">
          <Hero onScrollToContact={scrollToContact} content={content} settings={settings} section={sections?.['hero']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 02. Enterprise Clients & Brands Worked With */}
      {isEnabled('partners') && (
        <CollapsibleSectionWrapper section={sections?.['partners']} sectionId="partners">
          <BusinessesBanner
            section={sections?.['partners']}
            partners={partners}
            onSelectCompany={(company) => {
              // Find the partner record to check for an explicit case study link
              const partner = partners.find(
                (p) => (p.name || p.logo_text || '') === company
              );
              const linkedId = partner?.linked_case_study_id;

              let caseId: string | null = null;

              if (linkedId) {
                // Explicit link: find the case study whose content_id matches
                // The case study id in the cases array is the slug from content_items
                // We need to find by the content_items.id which is linked_case_study_id
                // The slug is stored as the case id, so we look up by the content id
                const match = cases.find((c) => {
                  // The cases array ids are slugs, but the linked_case_study_id is the content_items.id
                  // We stored the mapping in caseMetaMap keyed by slug. We need a reverse lookup.
                  // Since we don't have content_id on the case, try checking via the __content_id field
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return (c as any).__content_id === linkedId;
                });
                if (match) {
                  caseId = match.id;
                }
              }

              // Fallback: name-based matching if no explicit link or not found
              if (!caseId) {
                const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cNorm = norm(company);
                const match = cases.find((c) => {
                  const compName = norm(c.companyName || '');
                  const aliases = (caseMetaMap[c.id]?.aliases || []).map(norm);
                  return (
                    compName === cNorm ||
                    aliases.some((a) => a === cNorm)
                  );
                });
                caseId = match?.id || findCaseByCompany(company);
              }

              if (caseId) {
                setFocusCase((prev) => ({ id: caseId!, n: (prev?.n ?? 0) + 1 }));
              }
            }}
          />
        </CollapsibleSectionWrapper>
      )}

      {/* 03. Featured Case Studies (Proof) */}
      {isEnabled('cases') && (
        <CollapsibleSectionWrapper section={sections?.['cases']} sectionId="work">
          <CareerMatrix
            variant="cases"
            section={sections?.['cases']}
            onScrollToContact={scrollToContact}
            focusCaseId={focusCase ? `${focusCase.id}#${focusCase.n}` : null}
            cases={cases}
            meta={caseMetaMap}
            content={content}
          />
        </CollapsibleSectionWrapper>
      )}

      {/* 03b. Optional intro paragraph, editable in the admin */}
      {isEnabled('about') && content.intro_body && (
        <CollapsibleSectionWrapper section={sections?.['about']} sectionId="about">
          <AboutSection content={content} section={sections?.['about']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 04. How I Work: From Problem to Delivery */}
      {isEnabled('process') && (
        <CollapsibleSectionWrapper section={sections?.['process']} sectionId="process">
          <ProcessSection content={content} phases={phases} section={sections?.['process']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 04b. Insights / PM Talks: Adjacent to How I Work per review */}
      {isEnabled('videos') && (
        <CollapsibleSectionWrapper section={sections?.['videos']} sectionId="pmtalks">
          <InsightsSection videos={videos} topics={topics} content={content} section={sections?.['videos']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 05. Toolkit: The stack behind the delivery */}
      {isEnabled('toolkit') && (
        <CollapsibleSectionWrapper section={sections?.['toolkit']} sectionId="toolkit">
          <ToolkitSection toolkits={toolkits} section={sections?.['toolkit']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 06. Career History, Education & Certifications */}
      {isEnabled('history') && (
        <CollapsibleSectionWrapper section={sections?.['history']} sectionId="experience">
          <CareerMatrix
            variant="history"
            section={sections?.['history']}
            onScrollToContact={scrollToContact}
            experiences={experiences}
            education={education}
            certifications={certifications}
            settings={settings}
            content={content}
          />
        </CollapsibleSectionWrapper>
      )}

      {/* 06b. Other projects */}
      {isEnabled('other_projects') && (
        <CollapsibleSectionWrapper section={sections?.['other_projects']} sectionId="projects">
          <OtherProjects projects={otherProjects} section={sections?.['other_projects']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 07. Social Proof & Leadership Endorsements */}
      {isEnabled('testimonials') && (
        <CollapsibleSectionWrapper section={sections?.['testimonials']} sectionId="testimonials">
          <TestimonialsSection testimonials={testimonials} section={sections?.['testimonials']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 08. Conclusion: Contact & Direct Inquiries */}
      {isEnabled('contact') && (
        <CollapsibleSectionWrapper section={sections?.['contact']} sectionId="contact">
          <ContactSection settings={settings} section={sections?.['contact']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 09. Outside Client Work: Ventures */}
      {isEnabled('ventures') && (
        <CollapsibleSectionWrapper section={sections?.['ventures']} sectionId="ventures">
          <VentureEcosystem content={content} ventures={ventures} section={sections?.['ventures']} />
        </CollapsibleSectionWrapper>
      )}

      {/* 10. Polished Editorial Footer */}
      <Footer onOpenConsultation={scrollToContact} settings={settings} />
    </main>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const [landingData, seo] = await Promise.all([
      getLandingPageData(),
      getPageSeo({ data: { path: '/' } }),
    ]);

    return {
      ...landingData,
      seo,
    };
  },
  head: ({ loaderData }) => {
    const baseLinks = pageSeoLinks(loaderData?.seo);
    const faviconHref = loaderData?.settings?.['site_favicon'];
    const links = faviconHref
      ? [{ rel: 'icon', href: faviconHref, sizes: 'any' }, ...baseLinks]
      : baseLinks;

    return {
      meta: pageSeoMeta(pageSeoRoute('/')!.defaults, loaderData?.seo),
      links,
    };
  },
  component: HomePage,
});
