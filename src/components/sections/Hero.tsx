"use client";

import React from "react";
import Image from "@/components/ui/Img";
import { ArrowRight, MessageSquare } from "lucide-react";
import { HOMEPAGE_DEFAULTS, parseHeroMetrics, type HomepageContent } from "@/lib/cms/homepage.types";
import SectionBadge from "@/components/ui/SectionBadge";
import type { LandingSection } from "@/lib/cms/sections.types";

interface HeroProps {
  onScrollToContact: () => void;
  content?: HomepageContent;
  settings?: Record<string, string>;
  section?: Partial<LandingSection>;
}

export default function Hero({ onScrollToContact, content, settings, section }: HeroProps) {
  const copy = content ?? HOMEPAGE_DEFAULTS;
  const metrics = parseHeroMetrics(copy.hero_metrics);
  return (
    <section className="hero" style={{ paddingTop: "8.5rem", paddingBottom: "4.5rem", position: "relative" }}>
      <div className="site-container" style={{ position: "relative", zIndex: 10 }}>
        {/* Top Hero 2-Column Grid */}
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "3.5rem",
            alignItems: "center",
            marginBottom: "4.5rem",
          }}
        >
          {/* Left Column: Headline & Value Prop */}
          <div>
            {/* Identity & Eyebrow */}
            <div className="reveal stagger-1" style={{ marginBottom: "1.75rem" }}>
              <SectionBadge
                section={section}
                kicker={section?.kicker || copy.hero_eyebrow}
                icon={section?.kicker_icon || 'sparkles'}
                textColor={section?.kicker_text_color || 'var(--accent-purple-light)'}
                bgColor={section?.kicker_bg_color || 'rgba(168, 85, 247, 0.08)'}
                borderColor={section?.kicker_border_color || 'rgba(168, 85, 247, 0.25)'}
                iconColor={section?.kicker_icon_color || 'var(--accent-purple-light)'}
              />
            </div>

            {/* Editorial Headline */}
            <h1
              className="reveal stagger-2"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.4rem, 4.8vw, 3.85rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "#ffffff",
                marginBottom: "1.5rem",
              }}
            >
              {(section?.main_heading || copy.hero_title)}{" "}
              <span className="gradient-text-purple">{(section?.highlight_text || copy.hero_highlight)}</span>
            </h1>

            {/* Strategic Subtitle */}
            <p
              className="reveal stagger-3"
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: "2.5rem",
                maxWidth: "560px",
              }}
            >
              {section?.subtitle || copy.hero_subtitle}
            </p>

            {/* Action CTAs */}
            <div
              className="reveal stagger-4"
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <a href="#work" className="btn-primary">
                <span>{copy.hero_cta_primary}</span>
                <ArrowRight size={16} />
              </a>
              <button onClick={onScrollToContact} className="btn-secondary">
                <MessageSquare size={15} />
                <span>{copy.hero_cta_secondary}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Floating Portrait — No circles, no orbit */}
          <div
            className="reveal--right stagger-3"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "520px",
            }}
          >
            {/* Portrait Cutout Container — Larger & cleaner */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "480px",
                height: "560px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Image
                src={copy.hero_image || "/images/malek-glasses.png"}
                alt="Malek Hussein - Technical Product Leader based in Ottawa, Canada"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                style={{
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 30px rgba(168, 85, 247, 0.15))",
                  maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Authority Metrics Strip */}
        <div
          className="reveal stagger-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.75rem",
            padding: "2.25rem 2.5rem",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.7)",
          }}
        >
          {metrics.map((m, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <div
                style={{
                  fontSize: "clamp(2.1rem, 3.8vw, 3rem)",
                  fontWeight: 800,
                  fontFamily: "var(--font-heading)",
                  color: "var(--accent-gold)",
                  lineHeight: 1,
                  marginBottom: "0.45rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {m.value}
              </div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.2rem" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
