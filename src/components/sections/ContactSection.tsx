
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Copy, Sparkles, MessageCircle, Clock } from 'lucide-react';
import LinkedIn from '@/components/ui/LinkedInIcon';

import { personalInfo } from '@/data/portfolioData';

interface ContactSectionProps {
  settings?: Record<string, string>;
}

export default function ContactSection({ settings }: ContactSectionProps = {}) {
  const phone = settings?.['contact_phone'] || personalInfo.formattedPhone;
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const email = settings?.['contact_email'] || personalInfo.email;
  const whatsapp = settings?.['contact_whatsapp'] || phone;
  const rawWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const linkedin = settings?.['social_linkedin'] || 'https://www.linkedin.com/in/malek-hussein/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Product Management & Delivery',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(rawPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', topic: 'Product Management & Delivery', message: '' });
    }, 4000);
  };

  const socialLinks = [
    {
      icon: <Phone size={18} />,
      label: 'Call Direct',
      value: phone,
      href: `tel:${rawPhone}`,
      color: 'var(--accent-emerald)',
    },
    {
      icon: <MessageCircle size={18} />,
      label: 'WhatsApp',
      value: 'Chat on WhatsApp',
      href: `https://wa.me/${rawWhatsapp}`,
      color: '#25D366',
    },
    {
      icon: <Mail size={18} />,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
      color: 'var(--accent-purple-light)',
    },
    {
      icon: <LinkedIn size={18} />,
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: linkedin,
      color: '#0A66C2',
    },
  ];

  return (
    <section id="contact" className="section-wrapper" style={{ backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
      <div className="site-container">
        {/* Section Header */}
        <div className="section-header reveal" style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={13} color="var(--accent-purple-light)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                color: 'var(--accent-purple-light)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              GET IN TOUCH
            </span>
          </div>

          <h2 className="section-title">
            Let&apos;s Build <span className="gradient-text-purple">Something Real</span>
          </h2>
          <p className="section-subtitle">
            Whether you&apos;re looking for a Technical Product Manager, an agile delivery leader, or an entrepreneurial collaborator — let&apos;s talk.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="contact-content-grid">
          {/* Left: All Contact Channels in One Card */}
          <div className="reveal contact-channel-column">
            {/* Location + Availability */}
            <div
              className="contact-location-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                className="contact-location-header"
                style={{
                  position: 'relative',
                  padding: '2rem 2rem 1.5rem',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(5, 7, 14, 0) 60%)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
                  }}
                />
                <div className="contact-location-title">
                  <MapPin size={22} color="var(--accent-gold)" />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    Ottawa, Ontario, Canada
                  </h3>
                </div>
                <div
                  className="contact-availability"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(5, 7, 14, 0.75)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#34d399',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="pulse-dot" />
                  Available in Ottawa / Remote
                </div>
              </div>

              <div className="contact-location-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Operating across Eastern Time (ET) with global delivery experience across North America and the Middle East.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    <span className="status-dot status-dot--emerald" />
                    Available for Q3/Q4 Engagements
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    <Clock size={14} color="var(--accent-gold)" />
                    Response time: within 24 business hours
                  </div>
                </div>
              </div>
            </div>


            {/* Social/Contact Links Grid */}
            <div className="contact-link-grid">
              {socialLinks.map((link, idx) => (
                <a
                  className="contact-link-card"
                  key={idx}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    padding: '1.15rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    transition: 'border-color 0.25s ease, transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: link.color,
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </div>
                  <div className="contact-link-copy">
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      {link.label}
                    </div>
                    <div className="contact-link-value" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {link.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Copy Phone Number */}
            <button
              onClick={handleCopyPhone}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: copiedPhone ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-card)',
                border: `1px solid ${copiedPhone ? '#34d399' : 'var(--border-subtle)'}`,
                color: copiedPhone ? '#34d399' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.25s ease',
              }}
            >
              {copiedPhone ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              <span>{copiedPhone ? 'Phone Copied!' : 'Copy Phone Number'}</span>
            </button>
          </div>

          {/* Right: Contact Form */}
          <div
            className="reveal contact-form-card"
            style={{
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              Send a Direct Message
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              I review all inquiries personally and respond within 24 business hours.
            </p>

            {submitted ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={40} color="#34d399" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>Message Received</h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  Thank you. I will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="contact-form-row">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Phone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Discussion Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="form-select"
                  >
                    <option value="Product & Project Management">Technical Product Leadership / TPM Role</option>
                    <option value="Enterprise Delivery & Systems">Enterprise Delivery &amp; Systems Architecture</option>
                    <option value="Venture Partnership">Venture Partnership (Malekting / Malektness / AI)</option>
                    <option value="General Consultation">General Discussion / Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Project or Role Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly describe what you are looking to build or achieve..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="btn-primary btn-full" style={{ marginTop: '0.5rem' }}>
                  <span>Send Message</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
