import React from 'react';
import { Wrench } from 'lucide-react';
import { toolkitData } from '@/data/portfolioData';

export interface ToolkitItem {
  id?: number | string;
  title: string;
  tools: string[];
  note: string;
}

interface ToolkitSectionProps {
  toolkits?: ToolkitItem[];
}

export default function ToolkitSection({ toolkits }: ToolkitSectionProps) {
  const list = toolkits && toolkits.length ? toolkits : toolkitData;

  return (
    <section id="toolkit" className="section-wrapper" style={{ backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
      <div className="site-container">
        <div className="section-header reveal" style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-gold-bg)',
              border: '1px solid var(--accent-gold-border)',
              marginBottom: '1.25rem',
            }}
          >
            <Wrench size={13} color="var(--accent-gold)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                color: 'var(--accent-gold-light)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              TOOLKIT
            </span>
          </div>

          <h2 className="section-title">
            The stack behind <span className="gradient-text-purple">the delivery</span>
          </h2>
          <p className="section-subtitle">
            What I actually use, phase by phase — and why it matters on a real project.
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
