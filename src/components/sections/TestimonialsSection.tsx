
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export type TestimonialData = {
  id?: number | string;
  quote: string;
  author: string;
  role: string;
  company: string;
  linkedin?: string | null;
  avatar_url?: string | null;
};

const defaultTestimonials: TestimonialData[] = [
  {
    quote:
      'Malek bridges the gap between commercial objectives and engineering realities better than anyone I\'ve worked with. He translates high-level executive strategy into clean, prioritized sprint backlogs that developers actually trust.',
    author: 'Abdulrahman',
    role: 'VP of Engineering',
    company: 'Enterprise B2B Commerce Platform',
    linkedin: 'https://www.linkedin.com/in/malek-hussein/',
  },
  {
    quote:
      'Under Malek\'s delivery leadership, our sprint velocity accelerated by 25%. He doesn\'t just run Scrum ceremonies; he actively dives into technical dependencies, unblocks cross-functional bottlenecks, and ships on time.',
    author: 'Arifi',
    role: 'Lead Technical Architect',
    company: 'Logistics & Crowd-Shipping Scale-Up',
    linkedin: 'https://www.linkedin.com/in/malek-hussein/',
  },
  {
    quote:
      'A rare product manager who truly understands banking API integrations, payment reliability, and developer experience. He brought structure, speed, and real accountability to our platform rollout.',
    author: 'Qays Bahormoz',
    role: 'FinTech Managing Director',
    company: 'Financial Services & Lending Platform',
    linkedin: 'https://www.linkedin.com/in/malek-hussein/',
  },
];

const AUTOPLAY_MS = 7000;

interface TestimonialsSectionProps {
  testimonials?: TestimonialData[];
}

export default function TestimonialsSection({ testimonials: customTestimonials }: TestimonialsSectionProps = {}) {
  const items = customTestimonials && customTestimonials.length ? customTestimonials : defaultTestimonials;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const dragStart = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + items.length) % items.length), [items.length]);

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Autoplay with a visible progress bar so the timing is never a surprise.
  useEffect(() => {
    if (isPaused || reducedMotion) {
      barRef.current?.style.setProperty('--autoplay', '0');
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ratio = (now - start) / AUTOPLAY_MS;
      barRef.current?.style.setProperty('--autoplay', String(Math.min(ratio, 1)));
      if (ratio >= 1) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, next, current, reducedMotion]);

  // Keyboard control on the slider region.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  };

  // Pointer / touch swipe.
  const onPointerDown = (event: React.PointerEvent) => {
    dragStart.current = event.clientX;
    setIsPaused(true);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;
    setDragDelta(event.clientX - dragStart.current);
  };
  const endDrag = () => {
    if (dragStart.current === null) return;
    const width = viewportRef.current?.offsetWidth ?? 1;
    const threshold = Math.min(width * 0.18, 120);
    if (dragDelta <= -threshold) next();
    else if (dragDelta >= threshold) prev();
    dragStart.current = null;
    setDragDelta(0);
    setIsPaused(false);
  };

  const dragging = dragStart.current !== null;


  return (
    <section className="section-wrapper" style={{ backgroundColor: 'var(--bg-space)', position: 'relative' }}>
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
              backgroundColor: 'var(--accent-gold-bg)',
              border: '1px solid var(--accent-gold-border)',
              marginBottom: '1.25rem',
            }}
          >
            <Star size={13} color="var(--accent-gold)" />
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
              CLIENT REVIEWS
            </span>
          </div>

          <h2 className="section-title">
            What Clients &amp; Partners <span className="gradient-text-purple">Say</span>
          </h2>
          <p className="section-subtitle">
            Feedback from engineering leaders, founders, and executive stakeholders.
          </p>
        </div>

        {/* Swipeable, keyboard-driven quote slider */}
        <div
          className="reveal"
          style={{ maxWidth: '800px', margin: '0 auto' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={onKeyDown}
          role="group"
          aria-roledescription="carousel"
          aria-label="Client reviews"
          tabIndex={0}
        >
          <div
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            style={{
              overflow: 'hidden',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              cursor: dragging ? 'grabbing' : 'grab',
              touchAction: 'pan-y',
            }}
          >
            <div
              className="quote-track"
              style={{
                transform: `translate3d(calc(${-current * 100}% + ${dragDelta}px), 0, 0)`,
                transition: dragging ? 'none' : undefined,
              }}
            >
              {items.map((item, idx) => {
                const isActive = idx === current;
                return (
                  <div
                    key={item.author}
                    aria-hidden={!isActive}
                    style={{
                      padding: '3rem 3.5rem',
                      textAlign: 'center',
                      opacity: isActive ? 1 : 0.25,
                      transform: isActive ? 'scale(1)' : 'scale(0.96)',
                      transition: 'opacity 0.55s ease, transform 0.55s ease',
                    }}
                  >
                    {/* Quote Icon */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.75rem',
                      }}
                    >
                      <Quote size={22} color="var(--accent-purple-light)" />
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '1.5rem' }}>
                      {[...Array(5)].map((_, sIdx) => (
                        <Star key={sIdx} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      ))}
                    </div>

                    {/* Quote Text */}
                    <p
                      style={{
                        fontSize: '1.15rem',
                        lineHeight: 1.75,
                        color: 'var(--text-primary)',
                        fontStyle: 'italic',
                        maxWidth: '640px',
                        margin: '0 auto 2.5rem',
                        userSelect: dragging ? 'none' : 'auto',
                      }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {item.author}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                        {item.role}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                        {item.company}
                      </div>
                      {item.linkedin && (
                        <a
                          href={item.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--accent-purple-light)', fontWeight: 600 }}
                        >
                          View on LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autoplay progress */}
          <div
            style={{
              height: '2px',
              borderRadius: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              overflow: 'hidden',
              marginTop: '1rem',
            }}
          >
            <div ref={barRef} className="autoplay-bar" />
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
            }}
          >
            Drag, swipe or use ← → · {current + 1} of {items.length}
          </div>


          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.75rem' }}>
            <button
              onClick={prev}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  style={{
                    width: current === idx ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: current === idx ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
