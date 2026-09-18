
import React from 'react';
import Image from '@/components/ui/Img';

interface LogoProps {
  size?: number;
  showText?: boolean;
  logoSrc?: string;
}

export default function Logo({ size = 36, showText = true, logoSrc }: LogoProps) {
  const finalSrc = logoSrc || '/images/malek-logo.png';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
      {/* Official Brand Logo */}
      <div
        style={{
          position: 'relative',
          height: `${size}px`,
          width: `${size * 2.1}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Image
          src={finalSrc}
          alt="Malek Logo"
          fill
          sizes="140px"
          style={{
            objectFit: 'contain',
            objectPosition: 'left center',
            filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.45))',
          }}
          priority
        />
      </div>

      {/* Title & Role Sub-badge */}
      {/* {showText && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid rgba(168, 85, 247, 0.3)',
            paddingLeft: '0.75rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            MR. MALEK
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--accent-purple-light)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            TECHNICAL PRODUCT LEADER
          </span>
        </div>
      )} */}
    </div>
  );
}
