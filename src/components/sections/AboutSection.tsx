import React from 'react';
import type { HomepageContent } from '@/lib/cms/homepage.types';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

interface AboutSectionProps {
  content: HomepageContent;
  section?: Partial<LandingSection>;
}

export default function AboutSection({ content, section }: AboutSectionProps) {
  const paragraphs = content.intro_body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return null;

  return (
    <section className="section-wrapper about-section" aria-labelledby="about-title">
      <div className="site-container">
        <div className="about-layout">
          <header className="about-heading">
            <SectionBadge
              section={section}
              kicker={section?.kicker || content.intro_kicker}
              icon={section?.kicker_icon || 'sparkles'}
            />
            {(section?.main_heading || content.intro_title) && (
              <h2 id="about-title" className="section-title gradient-text-purple">
                {section?.main_heading || content.intro_title}
              </h2>
            )}
          </header>

          <div className="about-body">
            {paragraphs.map((paragraph, index) => (
              <div className="about-paragraph" key={`about-paragraph-${index}`}>
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}