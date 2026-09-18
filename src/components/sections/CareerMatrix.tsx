import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  Building2,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Sparkles,
  FileDown,
} from 'lucide-react';
import {
  experienceData,
  educationData,
  certificationsData,
} from '@/data/portfolioData';
import { allCaseStudies, caseFilters, caseMeta, type CaseMeta } from '@/data/caseStudyMeta';
import useTilt from '@/hooks/useTilt';
import Drawer from '@/components/ui/Drawer';
import { ProjectItem } from '@/types';
import { HOMEPAGE_DEFAULTS, type HomepageContent } from '@/lib/cms/homepage.types';

export interface ExperienceRecord {
  id: number | string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  badge?: string | null;
  description: string;
  impact?: string | null;
  achievements: string[];
  skills: string[];
  sort_order?: number;
}

export interface EducationRecord {
  id: number | string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  details: string[];
  sort_order?: number;
}

export interface CertificationRecord {
  id?: number | string;
  name: string;
  issuer: string;
  year: string;
  credential_id?: string | null;
  credentialId?: string;
  sort_order?: number;
}

interface CareerMatrixProps {
  onScrollToContact: () => void;
  /** Case study id to jump to, set when a trusted-by logo is clicked. */
  focusCaseId?: string | null;
  /** 'cases' renders the featured work slider, 'history' the timeline + credentials. */
  variant?: 'cases' | 'history' | 'all';
  /** Case studies coming from the admin; falls back to the built-in list. */
  cases?: ProjectItem[];
  meta?: Record<string, CaseMeta>;
  content?: HomepageContent;
  experiences?: ExperienceRecord[];
  education?: EducationRecord[];
  certifications?: CertificationRecord[];
  settings?: Record<string, string>;
}

export default function CareerMatrix({
  onScrollToContact,
  focusCaseId,
  variant = 'all',
  cases,
  meta,
  content,
  experiences,
  education,
  certifications,
  settings,
}: CareerMatrixProps) {
  const copy = content ?? HOMEPAGE_DEFAULTS;
  const cvDownloadUrl = copy.cv_banner_file_url || settings?.['cv_resume_pdf'] || '/cv-malek-hussein.pdf';
  const caseList = cases && cases.length ? cases : allCaseStudies;
  const metaMap = meta && Object.keys(meta).length ? meta : caseMeta;
  const expList = experiences && experiences.length ? experiences : experienceData;
  const eduList = education && education.length ? education : educationData;
  const certList = certifications && certifications.length ? certifications : certificationsData;
  const showCases = variant === 'cases' || variant === 'all';
  const showHistory = variant === 'history' || variant === 'all';
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt<HTMLDivElement>({ max: 4, lift: 0, scale: 1 });

  const visibleCases = useMemo(
    () =>
      activeFilter === 'All'
        ? caseList
        : caseList.filter((c) => metaMap[c.id]?.domain === activeFilter),
    [activeFilter, caseList, metaMap],
  );

  const totalSlides = visibleCases.length;
  const safeIndex = Math.min(currentSlide, Math.max(totalSlides - 1, 0));
  const currentProject = visibleCases[safeIndex] ?? caseList[0];
  const currentMeta = metaMap[currentProject.id];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  // Jump to the case study behind a clicked partner logo and open its drawer
  useEffect(() => {
    if (!focusCaseId) return;
    setActiveFilter('All');
    const targetId = focusCaseId.split('#')[0];
    const norm = (s?: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
    const normTarget = norm(targetId);
    const idx = caseList.findIndex(
      (c) =>
        c.id === targetId ||
        norm(c.id) === normTarget ||
        (c.companyName && (norm(c.companyName) === normTarget || normTarget.includes(norm(c.companyName))))
    );
    if (idx >= 0) {
      setCurrentSlide(idx);
      setSelectedProject(caseList[idx]);
    }
    sliderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlight(true);
    const t = window.setTimeout(() => setHighlight(false), 1700);
    return () => window.clearTimeout(t);
  }, [focusCaseId, caseList]);


  return (
    <section id={showCases ? 'work' : 'experience'} className="section-wrapper" style={{ position: 'relative', backgroundColor: 'var(--bg-space)' }}>
      <div className="site-container">
        {showCases && (<>
        {/* ─── Section Header ─── */}
        <div className="section-header reveal">
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
            <Sparkles size={13} color="var(--accent-gold)" />
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
              {copy.work_kicker}
            </span>
          </div>

          <h2 className="section-title">
            {copy.work_title} <span className="gradient-text-purple">{copy.work_highlight}</span>
          </h2>
          <p className="section-subtitle">{copy.work_subtitle}</p>
        </div>

        {/* ─── FILTER TABS ─── */}
        <div
          className="reveal stagger-2"
          role="group"
          aria-label="Filter case studies by domain"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}
        >
          {caseFilters.map((f) => (
            <button
              key={f}
              type="button"
              className="filter-tab"
              aria-pressed={activeFilter === f}
              onClick={() => {
                setActiveFilter(f);
                setCurrentSlide(0);
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ─── CASE STUDY SLIDER ─── */}
        <div ref={sliderRef} className="reveal stagger-2" style={{ marginBottom: '5rem', scrollMarginTop: '120px' }}>
          {/* Slide Content */}
          <div
            ref={tilt.ref}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
            className={highlight ? 'case-highlight' : undefined}
            style={{
              ...tilt.style,
              position: 'relative',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',

            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
              }}
            />

            {/* Slide Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem 2.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: 'var(--accent-purple-light)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {currentProject.category}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={14} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
                    {currentProject.companyName}
                  </span>
                </div>
              </div>

              {/* Slide Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={prevSlide}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    aria-label="Previous case study"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextSlide}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    aria-label="Next case study"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Body — 2-Column */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                padding: '2.5rem',
                alignItems: 'flex-start',
              }}
            >
              {/* Left: Narrative */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1.25,
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {currentProject.title}
                </h3>

                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    marginBottom: '1.75rem',
                  }}
                >
                  {currentProject.summary}
                </p>

                {/* Challenge / Solution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.025)', borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#f87171', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>
                      THE CHALLENGE
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.5 }}>
                      {currentProject.challenge}
                    </p>
                  </div>

                  <div style={{ padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.025)', borderLeft: '3px solid var(--accent-purple)' }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple-light)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>
                      WHAT I DELIVERED
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.5 }}>
                      {currentProject.solution}
                    </p>
                  </div>
                </div>

                <button onClick={() => setSelectedProject(currentProject)} className="btn-primary btn-sm">
                  <span>Inspect Case Study</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Right: Metrics + Tags */}
              <div
                style={{
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  KEY OUTCOMES
                </div>

                {/* Results list */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentProject.results.map((res, rIdx) => (
                    <li key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9375rem', color: '#ffffff' }}>
                      <CheckCircle2 size={16} color="var(--accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
                    TECH & METHODOLOGIES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {currentProject.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0 2.5rem 1.5rem' }}>
              {visibleCases.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: safeIndex === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: safeIndex === idx ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  aria-label={`Go to case study ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        </>)}

        {showHistory && (<>
        {/* ─── CAREER TIMELINE ─── */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <Briefcase size={18} color="var(--accent-gold)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-gold-light)',
                    fontWeight: 700,
                  }}
                >
                  Career Journey
                </span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                }}
              >
                Eight years of owning delivery, <span className="gradient-text-purple">role by role</span>
              </h3>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              2017 — Present • Expand a role for the detail
            </span>
          </div>

          <div className="timeline">
            {expList.map((exp, idx) => {
              const expKey = String(exp.id);
              const isExpanded = expandedExp === expKey;
              return (
                <div key={expKey} className={`timeline-item reveal${isExpanded ? ' timeline-item--open' : ''}`}>
                  {/* Rail node */}
                  <span className="timeline-node" aria-hidden>
                    {String(expList.length - idx).padStart(2, '0')}
                  </span>

                  <div className="timeline-card">
                    <button
                      onClick={() => setExpandedExp(isExpanded ? null : expKey)}
                      aria-expanded={isExpanded}
                      className="timeline-trigger"
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.06em',
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            gap: '0.6rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ color: 'var(--accent-gold-light)' }}>{exp.period}</span>
                          <span aria-hidden>•</span>
                          <span>{exp.location}</span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              fontFamily: 'var(--font-heading)',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {exp.role}
                          </span>
                          {exp.badge && (
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.62rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                color: '#34d399',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                              }}
                            >
                              {exp.badge}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                          {exp.company}
                        </div>

                        {exp.impact && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.45rem',
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px dashed var(--border-subtle)',
                            }}
                          >
                            <TrendingUp size={14} color="var(--accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--accent-gold-light)', fontWeight: 600, lineHeight: 1.5 }}>
                              {exp.impact}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className="timeline-expand-hint"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.04em',
                            color: isExpanded ? 'var(--accent-purple-light)' : 'var(--text-muted)',
                            textTransform: 'uppercase',
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {isExpanded ? 'Collapse' : 'Details'}
                        </span>
                        <span
                          className="timeline-chevron"
                          aria-hidden
                          style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s ease',
                            display: 'inline-flex',
                          }}
                        >
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </button>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div style={{ padding: '0 1.75rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '1.25rem 0' }}>
                          {exp.description}
                        </p>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                          {exp.achievements.map((ach, aIdx) => (
                            <li
                              key={aIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-primary)',
                                lineHeight: 1.5,
                              }}
                            >
                              <CheckCircle2 size={15} color="var(--accent-purple-light)" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {exp.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Credentials Row ─── */}
        <div className="creds-grid">
          {/* Education & Diplomas */}
          <div className="reveal creds-panel">
            <div className="creds-panel__head">
              <GraduationCap size={16} color="var(--accent-gold)" />
              <span>Degrees &amp; Diplomas</span>
            </div>

            {eduList.map((edu) => (
              <div key={edu.id} className="edu-entry">
                <div className="edu-entry__year">{edu.year}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                  {edu.degree}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--accent-purple-light)', fontWeight: 600, marginBottom: '0.9rem' }}>
                  {edu.institution} • {edu.location}
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {edu.details.map((d, dIdx) => (
                    <li key={dIdx} style={{ display: 'flex', gap: '0.55rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <CheckCircle2 size={14} color="var(--accent-gold)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="reveal creds-panel">
            <div className="creds-panel__head">
              <Award size={16} color="var(--accent-gold)" />
              <span>Industry Certifications</span>
              <span className="creds-panel__count">{certList.length} active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {certList.map((cert, idx) => (
                <div key={idx} className="cert-row">
                  <span className="cert-row__seal">
                    <Award size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>
                      {cert.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {cert.issuer}
                    </div>
                  </div>
                  <span className="cert-row__id">
                    {('credential_id' in cert ? cert.credential_id : cert.credentialId) ?? cert.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CV Download Strip (Below Education) ─── */}
        <div className="cv-download-banner reveal">
          <div className="cv-download-banner__content">
            <h3 className="cv-download-banner__title">
              {copy.cv_banner_title || 'Looking for my full CV / Resume?'}
            </h3>
            <p className="cv-download-banner__subtitle">
              {copy.cv_banner_subtitle ||
                'Download a clean 1-page PDF summary of my experience, leadership tenure, and technical delivery track record.'}
            </p>
          </div>

          <div className="cv-download-banner__action">
            <a
              href={cvDownloadUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <FileDown size={16} />
              <span>{copy.cv_banner_button_text || 'Download CV (PDF)'}</span>
            </a>
          </div>
        </div>
        </>)}
      </div>


      {/* Case Study Slide-Over Drawer */}
      <Drawer
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title ?? ''}
        subtitle={
          selectedProject
            ? `${metaMap[selectedProject.id]?.domain ?? selectedProject.category} • ${
                selectedProject.companyName || 'Featured Product'
              }`
            : ''
        }
      >
        {selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Problem Statement */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Problem Statement
              </div>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {selectedProject.challenge}
              </p>
            </div>

            {/* Technical Architecture */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Technical Architecture
              </div>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                {metaMap[selectedProject.id]?.architectureNote ?? selectedProject.solution}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(selectedProject.architecture ?? []).map((layer, lIdx) => (
                  <span
                    key={lIdx}
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.28rem 0.7rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.22)',
                      color: 'var(--accent-purple-light)',
                    }}
                  >
                    {layer}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Decisions */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                Key Decisions
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(metaMap[selectedProject.id]?.keyDecisions ?? []).map((d, dIdx) => (
                  <li key={dIdx} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.55 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', flexShrink: 0 }}>
                      {String(dIdx + 1).padStart(2, '0')}
                    </span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outcomes */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                Outcomes
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedProject.results.map((res, rIdx) => (
                  <li key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9375rem', color: '#ffffff' }}>
                    <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setSelectedProject(null)} className="btn-secondary btn-sm">
                Close
              </button>
              <button onClick={onScrollToContact} className="btn-primary btn-sm">
                <span>Discuss a similar build</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Drawer>

    </section>
  );
}
