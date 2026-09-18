import { useEffect, useRef, useState } from 'react';

/**
 * Parses a metric string like "$50M+", "+140%", "99.98%" into a numeric target
 * plus its prefix/suffix, so it can be animated without losing formatting.
 */
export function parseMetric(raw: string): { prefix: string; value: number; suffix: string; decimals: number } {
  const match = raw.match(/-?\d[\d,]*\.?\d*/);
  if (!match) return { prefix: '', value: NaN, suffix: raw, decimals: 0 };
  const numeric = match[0];
  const index = match.index ?? 0;
  const value = parseFloat(numeric.replace(/,/g, ''));
  const decimalPart = numeric.split('.')[1];
  return {
    prefix: raw.slice(0, index),
    value,
    suffix: raw.slice(index + numeric.length),
    decimals: decimalPart ? decimalPart.length : 0,
  };
}

/**
 * Counts a number up from 0 once the element scrolls into view.
 * Falls back to the final value when motion is reduced.
 */
export default function useCountUp(target: number, duration = 1600) {
  const ref = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState(0);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target)) return;

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setDisplay(target);
      return;
    }

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(target * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, display };
}
