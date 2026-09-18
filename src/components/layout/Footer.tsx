
import React from 'react';
import { ArrowUp, MapPin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import LinkedIn from '@/components/ui/LinkedInIcon';
import Logo from '@/components/ui/Logo';
import { personalInfo } from '@/data/portfolioData';

interface FooterProps {
  onOpenConsultation?: () => void;
  settings?: Record<string, string>;
}

export default function Footer({ onOpenConsultation, settings }: FooterProps) {
  const phone = settings?.['contact_phone'] || personalInfo.formattedPhone;
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const email = settings?.['contact_email'] || personalInfo.email;
  const whatsapp = settings?.['contact_whatsapp'] || phone;
  const rawWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const linkedin = settings?.['social_linkedin'] || 'https://www.linkedin.com/in/malek-hussein/';
  const location = settings?.['contact_location'] || 'Ottawa, ON • EST (UTC-5)';
  const tagline = settings?.['footer_tagline'] || 'Technical Product Leader based in Ottawa, Canada. Building digital products that drive real business outcomes.';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: '#04060a',
        overflow: 'hidden',
      }}
    >
      {/* Top Gradient Border */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--accent-purple), var(--accent-gold), var(--accent-purple), transparent)',
        }}
      />

      {/* CTA Banner */}
      <div
        style={{
          padding: '3.5rem 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="site-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.3,
                  marginBottom: '0.5rem',
                }}
              >
                Ready to build something <span className="gradient-text-purple">together?</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                I&apos;m always open to discussing product leadership roles, venture collaborations, and interesting technical challenges.
              </p>
            </div>
            {onOpenConsultation && (
              <button onClick={onOpenConsultation} className="btn-primary">
                <span>Start a Conversation</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Columns */}
      <div style={{ paddingTop: '3.5rem', paddingBottom: '2.5rem' }}>
        <div className="site-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2.5rem',
              paddingBottom: '3rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {/* Column 1: Brand */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <Logo logoSrc={settings?.['site_logo']} />
              </div>
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                {tagline}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                <MapPin size={13} color="var(--accent-gold)" />
                <span>{location}</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '1.15rem',
                }}
              >
                NAVIGATION
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'Featured Work', href: '#work' },
                  { label: 'Clients', href: '#businesses' },
                  { label: 'Process', href: '#process' },
                  { label: 'PM Talks', href: '#insights' },
                  { label: 'Toolkit', href: '#focus' },
                  { label: 'Ventures', href: '#ventures' },
                  { label: 'Contact', href: '#contact' },
                ].map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Ventures */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '1.15rem',
                }}
              >
                VENTURES
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Malektness', url: 'https://malektness.com' },
                  { name: 'Malekting', url: 'https://malekting.com' },
                  { name: 'AI Voice Ops', url: '#ventures' },
                ].map((v, idx) => (
                  <li key={idx}>
                    <a
                      href={v.url}
                      target={v.url.startsWith('http') ? '_blank' : undefined}
                      rel={v.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {v.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '1.15rem',
                }}
              >
                CONNECT
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                <a
                  href={`tel:${rawPhone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                >
                  <Phone size={14} color="var(--accent-purple-light)" />
                  <span>{phone}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                >
                  <Mail size={14} color="var(--accent-purple-light)" />
                  <span>{email}</span>
                </a>
              </div>

              {/* Social Icons Row */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {[
                  { icon: <LinkedIn size={16} />, href: linkedin, label: 'LinkedIn' },
                  { icon: <MessageCircle size={16} />, href: `https://wa.me/${rawWhatsapp}`, label: 'WhatsApp' },
                  { icon: <Mail size={16} />, href: `mailto:${email}`, label: 'Email' },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={social.label}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      transition: 'color 0.2s, border-color 0.2s, background-color 0.2s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '2rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Malek Hussein. All rights reserved.
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label="Scroll to top of page"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
