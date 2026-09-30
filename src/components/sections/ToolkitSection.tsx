import React from 'react';
import { toolkitData } from '@/data/portfolioData';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

export interface ToolkitItem {
  id?: number | string;
  title: string;
  tools: string[];
  note: string;
}

interface ToolkitSectionProps {
  toolkits?: ToolkitItem[];
  section?: Partial<LandingSection>;
}

export default function ToolkitSection({ toolkits, section }: ToolkitSectionProps) {
  const list = toolkits && toolkits.length ? toolkits : toolkitData;

  return (
    <section id="toolkit" className="section-wrapper" style={{ backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
      <div className="site-container">
        <div className="section-header reveal" style={{ marginBottom: '3rem' }}>
          <SectionBadge
            section={section}
            kicker={section?.kicker || 'TECHNICAL TOOLKIT'}
            icon={section?.kicker_icon || 'wrench'}
          />

          <h2 className="section-title">
            {section?.main_heading || 'The stack behind'}{' '}
            <span className="gradient-text-purple">{section?.highlight_text || 'the delivery'}</span>
          </h2>
          <p className="section-subtitle">
            {section?.subtitle ||
              'What I actually use, phase by phase — and why it matters on a real project.'}
          </p>
        </div>

        <div className="toolkit-grid">
          {list.map((group, idx) => (
            <article key={group.title} className="reveal toolkit-card">
              <div className="toolkit-card__index">{String(idx + 1).padStart(2, '0')}</div>
              <h3 className="toolkit-card__title">{group.title}</h3>
              <div className="toolkit-card__tools">
                {group.tools.map((tool) => (
                  <span key={tool} className="toolkit-chip">
                    {tool}
                  </span>
                ))}
              </div>
              <p className="toolkit-card__note">{group.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
