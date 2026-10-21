import React from 'react';
import Image from '@/components/ui/Img';
import { HOMEPAGE_DEFAULTS, type HomepageContent } from '@/lib/cms/homepage.types';
import type { ProcessPhase as Phase } from '@/lib/cms/home.adapters';
import SectionBadge from '@/components/ui/SectionBadge';
import type { LandingSection } from '@/lib/cms/sections.types';

const fallbackPhases: Phase[] = [
  {
    number: '01',
    title: 'Understand the problem',
    statement: 'I talk to users, map the business goal, and find the real blockers before we build.',
    toolchain: ['Research', 'Figma', 'Notion'],
  },
  {
    number: '02',
    title: 'Design the solution',
    statement: 'I turn findings into a clear plan: what to build, how the systems connect, and why.',
    toolchain: ['Specs', 'AWS', 'Postman'],
  },
  {
    number: '03',
    title: 'Build with the team',
    statement: 'I run agile delivery with design, engineering and stakeholders focused on one outcome.',
    toolchain: ['Jira', 'Linear', 'CI/CD'],
  },
  {
    number: '04',
    title: 'Launch and improve',
    statement: 'I ship, measure what matters, and use the data to make the product stronger.',
    toolchain: ['GA4', 'Metabase', 'Scale'],
  },
];

interface ProcessSectionProps {
  content?: HomepageContent;
  phases?: Phase[];
  section?: Partial<LandingSection>;
}

export default function ProcessSection({ content, phases, section }: ProcessSectionProps) {
  const copy = { ...HOMEPAGE_DEFAULTS, ...(content || {}) };
  const steps = phases && phases.length ? phases : fallbackPhases;

  return (
    <section
      id="process"
      className="section-wrapper process-section"
      style={{
        '--process-bg-img': `url("${copy.process_bg_image || '/images/process-nebula-bg.jpg'}")`,
      } as React.CSSProperties}
    >
      <div className="site-container process-layout">
        <div className="process-story reveal--left">
          <header className="process-heading">
            <SectionBadge
              section={section}
              kicker={section?.kicker || copy.process_kicker}
              icon={section?.kicker_icon || 'route'}
            />
            <h2>
              {section?.main_heading || copy.process_title}{' '}
              <span className="gradient-text-purple">
                {section?.highlight_text || copy.process_highlight}
              </span>
            </h2>
            <p>{section?.subtitle || copy.process_subtitle}</p>
          </header>

          <ol className="process-steps" aria-label="Four stages of delivery">
            {steps.map((phase) => (
              <li className="process-step" key={phase.number}>
                <span className="process-step__number">{phase.number}</span>
                <div className="process-step__copy">
                  <h3>{phase.title}</h3>
                  <p>{phase.statement}</p>
                </div>
                <div className="process-step__tools" aria-label={`${phase.title} tools`}>
                  {phase.toolchain.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="process-visual reveal--right">
          {/* Centered Hexagon Frame Stage with Locked Aspect Ratio */}
          <div className="process-frame-stage">
            {/* Glowing Double Concentric Hexagon SVG */}
            <svg
              className="process-hexagon-svg"
              viewBox="0 0 520 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                {/* Left (Purple) to Right (Cyan) Gradient */}
                <linearGradient id="procHexNeonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="28%" stopColor="#c084fc" />
                  <stop offset="68%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                {/* Outer Hexagon Tech Gradient */}
                <linearGradient id="procOuterHexGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
                  <stop offset="42%" stopColor="#a855f7" stopOpacity="0.7" />
                  <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
                </linearGradient>

                {/* Smooth Studio Violet Rim Aura behind Head */}
                <radialGradient id="procHeadGlow" cx="50%" cy="30%" r="42%">
                  <stop offset="0%" stopColor="rgba(217, 70, 239, 0.45)" />
                  <stop offset="35%" stopColor="rgba(168, 85, 247, 0.28)" />
                  <stop offset="70%" stopColor="rgba(139, 92, 246, 0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Clean Neon Drop Shadow for the Hexagon */}
                <filter id="procHexGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur1" />
                  <feGaussianBlur stdDeviation="8" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Head / Upper Body Radial Aura */}
              <ellipse cx="260" cy="190" rx="150" ry="150" fill="url(#procHeadGlow)" />

              {/* Outer Hexagon with Tech Dash Pattern */}
              <polygon
                points="260,16 496,150 496,440 260,574 24,440 24,150"
                stroke="url(#procOuterHexGrad)"
                strokeWidth="1.6"
                strokeDasharray="26 8 92 8 26 8"
                fill="none"
                opacity="0.8"
                filter="url(#procHexGlow)"
              />

              {/* Inner Hexagon with Translucent Glass Backdrop & Vivid Neon Border */}
              <polygon
                points="260,38 474,158 474,432 260,552 46,432 46,158"
                stroke="url(#procHexNeonGrad)"
                strokeWidth="3"
                fill="rgba(6, 9, 22, 0.4)"
                filter="url(#procHexGlow)"
              />

              {/* Glowing Corner Notches / Tech Vertices */}
              <circle cx="260" cy="38" r="3.5" fill="#c084fc" filter="url(#procHexGlow)" />
              <circle cx="474" cy="158" r="3.5" fill="#38bdf8" filter="url(#procHexGlow)" />
              <circle cx="474" cy="432" r="3.5" fill="#22d3ee" filter="url(#procHexGlow)" />
              <circle cx="260" cy="552" r="3.5" fill="#818cf8" filter="url(#procHexGlow)" />
              <circle cx="46" cy="432" r="3.5" fill="#e879f9" filter="url(#procHexGlow)" />
              <circle cx="46" cy="158" r="3.5" fill="#d946ef" filter="url(#procHexGlow)" />
            </svg>

            {/* Portrait Image Layered Inside Hexagon */}
            <div className="process-portrait-img">
              <Image
                src={copy.process_image || '/images/malek-side-potrait.png'}
                alt="Malek Hussein presenting his product delivery framework"
                fill
                sizes="(max-width: 900px) 92vw, 480px"
                style={{ objectFit: 'contain', objectPosition: 'center 38%' }}
                priority
              />
            </div>

            {/* Front Bottom V Hexagon Border - Locks portrait strictly inside hexagon at bottom */}
            <svg
              className="process-hexagon-svg-bottom"
              viewBox="0 0 520 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="procHexNeonGradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="28%" stopColor="#c084fc" />
                  <stop offset="68%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <filter id="procHexGlowBottom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur1" />
                  <feGaussianBlur stdDeviation="8" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Bottom V of Outer Hexagon */}
              <path
                d="M 24 440 L 260 574 L 496 440"
                stroke="url(#procOuterHexGrad)"
                strokeWidth="1.6"
                strokeDasharray="26 8 92 8"
                fill="none"
                opacity="0.8"
                filter="url(#procHexGlowBottom)"
              />

              {/* Bottom V of Inner Hexagon wrapping in front of torso base */}
              <path
                d="M 46 432 L 260 552 L 474 432"
                stroke="url(#procHexNeonGradBottom)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                filter="url(#procHexGlowBottom)"
              />

              {/* Bottom Vertex Dot */}
              <circle cx="260" cy="552" r="3.5" fill="#818cf8" filter="url(#procHexGlowBottom)" />
            </svg>
          </div>
        </figure>
      </div>
    </section>
  );
}