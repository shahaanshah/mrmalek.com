import { useCallback, useRef } from 'react';

interface TiltOptions {
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** Extra lift in px on hover. */
  lift?: number;
  /** Scale factor on hover. */
  scale?: number;
}

/**
 * 3D pointer tilt for cards. Returns props to spread on the element.
 * No-ops on touch / coarse pointers and under prefers-reduced-motion.
 */
export default function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: TiltOptions = {},
) {
  const { max = 8, lift = 6, scale = 1.015 } = options;
  const ref = useRef<T | null>(null);
  const frame = useRef<number>(0);

  const enabled = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el || !enabled()) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(
          2,
        )}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-${lift}px) scale(${scale})`;
      });
    },
    [max, lift, scale],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
  }, []);

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: {
      transformStyle: 'preserve-3d' as const,
      transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease',
      willChange: 'transform',
    },
  };
}
