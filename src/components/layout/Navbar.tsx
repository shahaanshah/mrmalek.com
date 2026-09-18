
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface NavbarProps {
  onOpenConsultation: () => void;
  settings?: Record<string, string>;
}

export default function Navbar({ onOpenConsultation, settings }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Work', href: '/#work' },
    { label: 'Clients', href: '/#businesses' },
    { label: 'Process', href: '/#process' },
    { label: 'PM Talks', href: '/#insights' },
    { label: 'Toolkit', href: '/#focus' },
    { label: 'Ventures', href: '/#ventures' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'navbar-wrapper--scrolled' : ''}`}>
      <div className="site-container">
        <nav className="navbar">
          {/* Professional Brand Logo */}
          <a href="#" className="nav-logo" aria-label="Mr. Malek Home">
            <Logo size={36} showText={true} logoSrc={settings?.['site_logo']} />
          </a>

          {/* Desktop Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions: Clean CTA */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onOpenConsultation} className="btn-primary btn-sm">
              <span>Get in Touch</span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-xs text-muted">{settings?.['contact_phone'] || '+1 (613) 400-3490'}</span>
                <span className="text-xs text-muted">{settings?.['contact_location'] || 'Ottawa, Canada'}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Get in Touch
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
