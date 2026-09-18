import React from 'react';
import Image from '@/components/ui/Img';
import { HOMEPAGE_DEFAULTS, type HomepageContent } from '@/lib/cms/homepage.types';
import type { ProcessPhase as Phase } from '@/lib/cms/home.adapters';

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
}

export default function ProcessSection({ content, phases }: ProcessSectionProps) {
  const copy = content ?? HOMEPAGE_DEFAULTS;
  const steps = phases && phases.length ? phases : fallbackPhases;

  return (
    <section id="process" className="section-wrapper process-section">
      <div className="site-container process-layout">
        <div className="process-story reveal--left">
          <header className="process-heading">
            <p className="process-kicker">{copy.process_kicker}</p>
            <h2>
              {copy.process_title} <span className="gradient-text-purple">{copy.process_highlight}</span>
            </h2>
            <p>{copy.process_subtitle}</p>
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
                  {phase.toolchain.map((tool) => <span key={tool}>{tool}</span>)}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="process-visual reveal--right">
          <div className="process-visual__index" aria-hidden="true">01—04</div>
          <div className="process-visual__line" aria-hidden="true" />
          <Image
            src="/images/malek-side-potrait.png"
            alt="Malek Hussein presenting his product delivery framework"
            fill
            sizes="(max-width: 900px) 92vw, 48vw"
            style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
            priority
          />
          <figcaption>
            <span>Clarity</span>
            <i aria-hidden="true" />
            <span>Momentum</span>
            <i aria-hidden="true" />
            <span>Scale</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}