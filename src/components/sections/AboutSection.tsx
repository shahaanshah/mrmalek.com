import React from 'react';
import type { HomepageContent } from '@/lib/cms/homepage.types';

interface AboutSectionProps {
  content: HomepageContent;
}

export default function AboutSection({ content }: AboutSectionProps) {
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
            {content.intro_kicker && <p className="process-kicker">{content.intro_kicker}</p>}
            {content.intro_title && <h2 id="about-title" className="section-title gradient-text-purple">{content.intro_title}</h2>}
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