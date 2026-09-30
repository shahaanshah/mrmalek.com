import React from 'react';
import {
  Sparkles,
  Briefcase,
  Video,
  Wrench,
  Star,
  Mail,
  Rocket,
  GraduationCap,
  Layers,
  Route,
  Code,
  Terminal,
  Shield,
  Flame,
  Compass,
  Cpu,
  Globe,
  Zap,
  Trophy,
} from 'lucide-react';
import type { LandingSection } from '@/lib/cms/sections.types';

export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  sparkles: Sparkles,
  briefcase: Briefcase,
  video: Video,
  wrench: Wrench,
  star: Star,
  mail: Mail,
  rocket: Rocket,
  'graduation-cap': GraduationCap,
  layers: Layers,
  route: Route,
  code: Code,
  terminal: Terminal,
  shield: Shield,
  flame: Flame,
  compass: Compass,
  cpu: Cpu,
  globe: Globe,
  zap: Zap,
  trophy: Trophy,
};

export function renderBadgeIcon(iconName?: string, color?: string, size = 13) {
  if (!iconName || iconName === 'none') return null;
  const IconComponent = ICON_MAP[iconName.toLowerCase()] || Sparkles;
  return <IconComponent size={size} color={color || 'var(--accent-gold)'} />;
}

interface SectionBadgeProps {
  section?: Partial<LandingSection> | null;
  /** Direct overrides if section object is not fully populated */
  kicker?: string;
  icon?: string;
  logoUrl?: string;
  fontSize?: string;
  fontFamily?: 'mono' | 'sans' | 'heading';
  fontWeight?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
  letterSpacing?: string;
  textTransform?: 'uppercase' | 'capitalize' | 'none';
  enabled?: boolean | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SectionBadge({
  section,
  kicker: kickerProp,
  icon: iconProp,
  logoUrl: logoUrlProp,
  fontSize: fontSizeProp,
  fontFamily: fontFamilyProp,
  fontWeight: fontWeightProp,
  textColor: textColorProp,
  bgColor: bgColorProp,
  borderColor: borderColorProp,
  iconColor: iconColorProp,
  letterSpacing: letterSpacingProp,
  textTransform: textTransformProp,
  enabled: enabledProp,
  className = '',
  style = {},
}: SectionBadgeProps) {
  const isEnabled = enabledProp !== undefined ? Boolean(enabledProp) : (section?.kicker_enabled !== 0);
  const text = kickerProp ?? section?.kicker;

  if (!isEnabled || !text) return null;

  const iconName = iconProp ?? section?.kicker_icon ?? 'sparkles';
  const logoUrl = logoUrlProp ?? section?.kicker_logo_url;
  const fontSize = fontSizeProp ?? section?.kicker_font_size ?? '0.75rem';
  const fontFamilyChoice = fontFamilyProp ?? section?.kicker_font_family ?? 'mono';
  const fontWeight = fontWeightProp ?? section?.kicker_font_weight ?? '600';
  const textColor = textColorProp ?? section?.kicker_text_color ?? 'var(--accent-gold-light)';
  const bgColor = bgColorProp ?? section?.kicker_bg_color ?? 'var(--accent-gold-bg)';
  const borderColor = borderColorProp ?? section?.kicker_border_color ?? 'var(--accent-gold-border)';
  const iconColor = iconColorProp ?? section?.kicker_icon_color ?? 'var(--accent-gold)';
  const letterSpacing = letterSpacingProp ?? section?.kicker_letter_spacing ?? '0.08em';
  const textTransform = textTransformProp ?? section?.kicker_text_transform ?? 'uppercase';

  const resolvedFontFamily =
    fontFamilyChoice === 'mono'
      ? 'var(--font-mono)'
      : fontFamilyChoice === 'heading'
        ? 'var(--font-heading)'
        : 'var(--font-sans)';

  return (
    <div
      className={`section-badge-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.95rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        marginBottom: '1.25rem',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          style={{
            width: '15px',
            height: '15px',
            objectFit: 'contain',
            borderRadius: '2px',
          }}
        />
      ) : (
        renderBadgeIcon(iconName, iconColor, 13)
      )}

      <span
        style={{
          fontFamily: resolvedFontFamily,
          fontSize,
          letterSpacing,
          color: textColor,
          textTransform: textTransform as React.CSSProperties['textTransform'],
          fontWeight: Number(fontWeight) || 600,
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>
    </div>
  );
}
