import React from 'react';
import Image from '@/components/ui/Img';
import { clientPartnersData } from '@/data/portfolioData';
import { ArrowUpRight } from 'lucide-react';

export interface ClientPartnerItem {
  id?: number | string;
  name: string;
  category: string;
  logoImage?: string;
  logo_image?: string;
  logoText?: string;
  logo_text?: string;
  linked_case_study_id?: number | null;
}

interface BusinessesBannerProps {
  /** Jumps the case-study module to the matching company. */
  onSelectCompany: (companyName: string) => void;
  partners?: ClientPartnerItem[];
}

/** Marquee needs a duplicated track so the loop is seamless. */
function LogoMark({ partner, onSelect }: { partner: ClientPartnerItem; onSelect: () => void }) {
  const image = partner.logo_image || partner.logoImage;
  const text = partner.logo_text || partner.logoText || partner.name;

  return (
    <button
      type="button"
      className="logo-mark"
      onClick={onSelect}
      title={`Click to inspect case study for ${partner.name} — ${partner.category}`}
      style={{
        cursor: 'pointer',
      }}
    >
      {image ? (
        <span style={{ position: 'relative', width: '184px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            src={image}
            alt={`${partner.name} logo`}
            fill
            sizes="184px"
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))',
            }}
          />
        </span>
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            letterSpacing: '0.16em',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            fontWeight: 700,
          }}
        >
          {text}
        </span>
      )}
    </button>
  );
}

export default function BusinessesBanner({ onSelectCompany, partners }: BusinessesBannerProps) {
  const partnerList = partners && partners.length ? partners : clientPartnersData;

  return (
    <section id="businesses" className="trust-banner">
      <div className="site-container trust-banner__inner">
        <div className="trust-banner__statement reveal">
          <span className="trust-banner__eyebrow">Trusted across borders</span>
          <h2>
            Trusted to ship <span>products that matter.</span>
          </h2>
          <p>
            Government, enterprise, and high-growth teams call me when delivery can&apos;t slip.
            I turn complex requirements into products that actually launch.
          </p>
        </div>

        <div className="trust-banner__hero-stat reveal stagger-1" aria-label="Career reach">
          <div className="trust-banner__stat-ring">
            <span className="trust-banner__stat-number">8+</span>
            <span className="trust-banner__stat-label">years leading delivery</span>
          </div>
          <div className="trust-banner__stat-divider" />
          <div className="trust-banner__stat-row">
            <span><strong>12</strong> organisations</span>
            <span><strong>3</strong> regions</span>
          </div>
        </div>
      </div>

      <div className="trust-banner__logos reveal stagger-2">
        <div className="site-container">
          <div className="logo-marquee">
            <div className="logo-marquee__track">
              {[...partnerList, ...partnerList].map((partner, idx) => (
                <LogoMark key={`${partner.name}-${idx}`} partner={partner} onSelect={() => onSelectCompany(partner.name)} />
              ))}
            </div>
          </div>
          <div className="trust-banner__hint">
            <ArrowUpRight size={13} style={{ flexShrink: 0 }} />
            <span>Select a company to inspect the work</span>
          </div>
        </div>
      </div>
    </section>
  );
}
