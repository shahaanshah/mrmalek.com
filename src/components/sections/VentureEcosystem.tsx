
import React, { useState } from 'react';
import {
  ExternalLink,
  TrendingUp,
  Mic,
  CheckCircle2,
  Sparkles,
  Dumbbell,
  ArrowUpRight,
} from 'lucide-react';
import { venturesData } from '@/data/portfolioData';
import { HOMEPAGE_DEFAULTS, type HomepageContent } from '@/lib/cms/homepage.types';


import { Venture } from '@/types';
import Modal from '@/components/ui/Modal';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

interface VentureEcosystemProps {
  content?: HomepageContent;
  ventures?: Venture[];
  section?: Partial<LandingSection>;
}

export default function VentureEcosystem({ content, ventures, section }: VentureEcosystemProps = {}) {
  const copy = { ...HOMEPAGE_DEFAULTS, ...(content || {}) };
  const items = ventures && ventures.length ? ventures : venturesData;
  const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);

  const ventureIcons: Record<string, React.ReactNode> = {
    malekting: <TrendingUp size={20} />,
    malektness: <Dumbbell size={20} />,
    'ai-voice': <Mic size={20} />,
  };

  const ventureColors: Record<string, string> = {
    malekting: 'var(--accent-purple-light)',
    malektness: 'var(--accent-gold)',
    'ai-voice': 'var(--accent-purple-light)',
  };

  const ventureStatuses: Record<string, { label: string; color: string }> = {
    malekting: { label: 'Active', color: 'var(--accent-emerald)' },
    malektness: { label: 'Beta', color: 'var(--accent-gold)' },
    'ai-voice': { label: 'R&D', color: 'var(--accent-purple-light)' },
  };

  return (
    <section id="ventures" className="section-wrapper" style={{ backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
      <div className="site-container">
        {/* Section Header */}
        <div className="section-header reveal" style={{ marginBottom: '3rem' }}>
          <SectionBadge
            section={section}
            kicker={section?.kicker || copy.ventures_kicker}
            icon={section?.kicker_icon || 'rocket'}
          />

          <h2 className="section-title" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)' }}>
            {section?.main_heading || copy.ventures_title}{' '}
            <span className="gradient-text-purple">
              {section?.highlight_text || copy.ventures_highlight}
            </span>
          </h2>
          <p className="section-subtitle">{section?.subtitle || copy.ventures_subtitle}</p>
        </div>

        {/* Editorial Venture Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((venture, idx) => {
            const icon = ventureIcons[venture.id] || <Sparkles size={20} />;
            const accentColor = ventureColors[venture.id] || 'var(--accent-purple-light)';
            const status = ventureStatuses[venture.id] || { label: 'Active', color: 'var(--accent-emerald)' };

            return (
              <div
                key={venture.id}
                className="reveal venture-row"
                onClick={() => {
                  if (venture.url.includes('#')) {
                    setSelectedVenture(venture);
                  } else {
                    window.open(venture.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                {/* Icon */}
                <div
                  className="venture-row__icon"
                  style={{ color: accentColor }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="venture-row__content">
                  <div className="venture-row__header">
                    <h3>{venture.name}</h3>
                    <span className="venture-row__status" style={{ color: status.color, borderColor: `${status.color}33` }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="venture-row__tagline" style={{ color: accentColor }}>
                    {venture.tagline}
                  </div>
                  <p className="venture-row__desc">
                    {venture.description}
                  </p>
                </div>

                {/* Action Arrow */}
                <div className="venture-row__action">
                  {venture.url.includes('#') ? (
                    <ArrowUpRight size={16} color="var(--text-muted)" />
                  ) : (
                    <ExternalLink size={14} color="var(--text-muted)" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Venture Detail Modal */}
      {selectedVenture && (
        <Modal
          isOpen={!!selectedVenture}
          onClose={() => setSelectedVenture(null)}
          title={`${selectedVenture.name} — Product Overview`}
          subtitle={selectedVenture.tagline}
          maxWidth="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              {selectedVenture.description}
            </p>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-purple-light)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Development Scope:
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedVenture.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.875rem', color: '#ffffff' }}>
                    <CheckCircle2 size={15} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            {selectedVenture.url && !selectedVenture.url.includes('#') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <a href={selectedVenture.url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                  <span>Visit {selectedVenture.url.replace('https://', '')}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
