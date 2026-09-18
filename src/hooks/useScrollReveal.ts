
import { useEffect } from 'react';

export default function useScrollReveal() {
  useEffect(() => {
    // If user prefers reduced motion, reveal everything immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '150px 0px 150px 0px', // Trigger 150px before entering viewport
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll(
        '.reveal:not(.revealed), .reveal--left:not(.revealed), .reveal--right:not(.revealed), .reveal--scale:not(.revealed)'
      );
      elements.forEach((el) => observer.observe(el));
    };

    observeAll();

    // Listen to DOM mutations for dynamically inserted reveal elements
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Safety fallback: reveal all elements so content is never stuck at opacity 0
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed), .reveal--left:not(.revealed), .reveal--right:not(.revealed), .reveal--scale:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
    }, 1200);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(safetyTimer);
    };
  }, []);
}
