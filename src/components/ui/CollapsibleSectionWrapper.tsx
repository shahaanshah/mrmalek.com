import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import SectionBadge from './SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

interface CollapsibleSectionWrapperProps {
  section?: Partial<LandingSection>;
  sectionId: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackHighlight?: string;
  fallbackSubtitle?: string;
  className?: string;
}

export default function CollapsibleSectionWrapper({
  section,
  sectionId,
  children,
  fallbackTitle,
  fallbackHighlight,
  fallbackSubtitle,
  className = '',
}: CollapsibleSectionWrapperProps) {
  const isCollapsible = Boolean(section?.is_collapsible);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => Boolean(section?.default_collapsed));

  // If not configured as collapsible, render children transparently
  if (!isCollapsible) {
    return <>{children}</>;
  }

  const title = section?.main_heading || fallbackTitle;
  const highlight = section?.highlight_text || fallbackHighlight;
  const subtitle = section?.subtitle || fallbackSubtitle;

  return (
    <div className={`collapsible-section-root ${className}`} style={{ position: 'relative' }}>
      {isCollapsed ? (
        <section
          id={sectionId}
          aria-expanded={false}
          className="section-wrapper"
          style={{
            padding: '3rem 0',
            position: 'relative',
          }}
        >
          <div className="site-container">
            <div
              onClick={() => setIsCollapsed(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsCollapsed(false);
                }
              }}
              style={{
                position: 'relative',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                backgroundColor: 'rgba(18, 18, 24, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Header preview & details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <SectionBadge
                    section={section}
                    kicker={section?.kicker}
                    icon={section?.kicker_icon}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.04em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    • Collapsed Section
                  </span>
                </div>

                {title && (
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {title}{' '}
                    {highlight && (
                      <span className="gradient-text-purple">{highlight}</span>
                    )}
                  </h3>
                )}

                {subtitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: 'var(--text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Action expand CTA button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.35rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                  }}
                >
                  <ChevronDown size={16} />
                  <span>Expand Section</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Top Collapse Control */}
          <div
            className="site-container"
            style={{
              position: 'relative',
              height: 0,
              zIndex: 30,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Collapse this section to save space"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(18, 18, 24, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.backgroundColor = 'rgba(18, 18, 24, 0.85)';
                }}
              >
                <ChevronUp size={14} />
                <span>Collapse</span>
              </button>
            </div>
          </div>

          {/* Expanded Children Section */}
          {children}

          {/* Bottom Collapse Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1.5rem 0 2.5rem',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsCollapsed(true);
                const el = document.getElementById(sectionId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(18, 18, 24, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ChevronUp size={14} />
              <span>Collapse {section?.title || 'Section'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
