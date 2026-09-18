import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    cyan: {
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.3)',
      text: '#7dd3fc',
      dotColor: '#38bdf8',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.3)',
      text: '#c084fc',
      dotColor: '#a855f7',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fcd34d',
      dotColor: '#f59e0b',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#6ee7b7',
      dotColor: '#10b981',
    },
    subtle: {
      bg: 'rgba(255, 255, 255, 0.04)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#94a3b8',
      dotColor: '#94a3b8',
    },
  }[variant];

  const sizeStyles = {
    sm: '0.25rem 0.65rem; font-size: 0.75rem;',
    md: '0.35rem 0.875rem; font-size: 0.8125rem;',
    lg: '0.5rem 1.125rem; font-size: 0.875rem;',
  }[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        borderRadius: '9999px',
        backgroundColor: variantStyles.bg,
        border: `1px solid ${variantStyles.border}`,
        color: variantStyles.text,
        fontFamily: 'var(--font-tech)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        padding: size === 'sm' ? '0.2rem 0.6rem' : size === 'lg' ? '0.5rem 1.1rem' : '0.35rem 0.85rem',
        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '0.875rem' : '0.8125rem',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: variantStyles.dotColor,
            boxShadow: `0 0 6px ${variantStyles.dotColor}`,
          }}
        />
      )}
      {children}
    </span>
  );
}
