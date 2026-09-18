import { useCallback } from 'react';
import type React from 'react';

/**
 * Tracks the pointer inside a card and exposes it as --mx / --my
 * so `.spotlight-card` can render a follow highlight without re-rendering React.
 */
export default function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const onMouseMove = useCallback((event: React.MouseEvent<T>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, []);

  return { onMouseMove };
}
