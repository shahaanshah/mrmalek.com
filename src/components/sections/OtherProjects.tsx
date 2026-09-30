import React from 'react';
import Image from '@/components/ui/Img';
import { otherProjectsData } from '@/data/portfolioData';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

export interface OtherProjectItem {
  id?: number | string;
  name: string;
  domain: string;
  role: string;
  summary: string;
  logo_image?: string | null;
  logoImage?: string;
}

interface OtherProjectsProps {
  projects?: OtherProjectItem[];
  section?: Partial<LandingSection>;
}

export default function OtherProjects({ projects, section }: OtherProjectsProps) {
  const list = projects && projects.length ? projects : otherProjectsData;

  return (
    <section id="projects" className="section-wrapper" style={{ backgroundColor: 'var(--bg-space)', position: 'relative' }}>
      <div className="site-container">
        <div className="section-header reveal" style={{ marginBottom: '2.75rem' }}>
          <SectionBadge
            section={section}
            kicker={section?.kicker || 'OTHER PROJECTS'}
            icon={section?.kicker_icon || 'layers'}
          />

          <h2 className="section-title">
            {section?.main_heading || 'Shorter builds &'}{' '}
            <span className="gradient-text-purple">{section?.highlight_text || 'engagements'}</span>
          </h2>
          <p className="section-subtitle">
            {section?.subtitle ||
              'Work outside the main timeline — products I helped scope, ship or steady.'}
          </p>
        </div>

        <div className="project-badge-grid">
          {list.map((project) => {
            const rawLogo = ('logo_image' in project ? project.logo_image : undefined) || ('logoImage' in project ? project.logoImage : undefined);
            const logo = typeof rawLogo === 'string' && rawLogo.trim().length > 0 ? rawLogo : null;
            return (
              <article key={project.name} className="reveal project-badge">
                <div className="project-badge__top">
                  {logo ? (
                    <span className="project-badge__logo">
                      <Image src={logo} alt={`${project.name} logo`} fill sizes="86px" style={{ objectFit: 'contain' }} />
                    </span>
                  ) : (
                    <span className="project-badge__wordmark">{project.name}</span>
                  )}
                  <span className="project-badge__role">{project.role}</span>
                </div>
                <h3 className="project-badge__name">{project.name}</h3>
                <p className="project-badge__domain">{project.domain}</p>
                <p className="project-badge__summary">{project.summary}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
