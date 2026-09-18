import React from 'react';
import useCountUp, { parseMetric } from '@/hooks/useCountUp';

interface CountUpMetricProps {
  /** Raw metric string, e.g. "$50M+", "+140%", "99.98%". */
  value: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

/**
 * Renders a metric that counts up from zero the first time it scrolls into view,
 * preserving any prefix ($, +) and suffix (M+, %, x).
 */
export default function CountUpMetric({ value, className, style, duration }: CountUpMetricProps) {
  const { prefix, value: target, suffix, decimals } = parseMetric(value);
  const { ref, display } = useCountUp(target, duration);

  if (!Number.isFinite(target)) {
    return (
      <span className={className} style={style}>
        {value}
      </span>
    );
  }

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
