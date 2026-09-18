import React, { useEffect, useRef } from 'react';

interface Star {
  /** Home position — the star always drifts back toward this anchor. */
  hx: number;
  hy: number;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  vx: number;
  vy: number;
}

const REPEL_RADIUS = 160;
const LINK_RADIUS = 110;

export default function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];

    const mouse = { x: -9999, y: -9999, active: false };

    const sizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initStars = () => {
      const starCount = Math.floor((Math.min(width, 1920) * Math.min(height, 1200)) / 11000);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const maxAlpha = 0.15 + Math.random() * 0.65;
        const hx = Math.random() * width;
        const hy = Math.random() * height;
        stars.push({
          hx,
          hy,
          x: hx,
          y: hy,
          radius: 0.5 + Math.random() * 1.2,
          alpha: Math.random() * maxAlpha,
          maxAlpha,
          pulseSpeed: 0.004 + Math.random() * 0.012,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
        });
      }
    };

    sizeCanvas();
    initStars();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const handleResize = () => {
      sizeCanvas();
      initStars();
    };
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        cancelAnimationFrame(animFrameRef.current);
        render();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    const paintNebula = () => {
      const g1 = ctx.createRadialGradient(
        width * 0.2, height * 0.25, 0,
        width * 0.2, height * 0.25, width * 0.55,
      );
      g1.addColorStop(0, 'rgba(76, 29, 149, 0.18)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(
        width * 0.8, height * 0.7, 0,
        width * 0.8, height * 0.7, width * 0.45,
      );
      g2.addColorStop(0, 'rgba(126, 34, 206, 0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
    };

    const paintStars = (animate: boolean) => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;

        if (animate) {
          // Twinkle
          s.alpha += s.pulseSpeed;
          if (s.alpha > s.maxAlpha || s.alpha < 0.05) s.pulseSpeed = -s.pulseSpeed;

          // Continuous drift around the home anchor
          s.hx += s.vx;
          s.hy += s.vy;
          if (s.hx < 0) s.hx = width;
          if (s.hx > width) s.hx = 0;
          if (s.hy < 0) s.hy = height;
          if (s.hy > height) s.hy = 0;

          // Gentle gravitational repulsion from the cursor
          let tx = s.hx;
          let ty = s.hy;
          if (mouse.active) {
            const dx = s.hx - mouse.x;
            const dy = s.hy - mouse.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < REPEL_RADIUS) {
              const force = (1 - dist / REPEL_RADIUS) ** 2 * 42;
              tx += (dx / dist) * force;
              ty += (dy / dist) * force;
            }
          }

          // Ease toward the target so movement stays silky
          s.x += (tx - s.x) * 0.08;
          s.y += (ty - s.y) * 0.08;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 232, 255, ${Math.max(0, s.alpha)})`;
        ctx.fill();

        if (animate && mouse.active) {
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_RADIUS) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - dist / LINK_RADIUS) * 0.32})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      if (!isVisibleRef.current) return;
      ctx.clearRect(0, 0, width, height);
      paintNebula();
      paintStars(true);
      animFrameRef.current = requestAnimationFrame(render);
    };

    if (reduceMotion) {
      ctx.clearRect(0, 0, width, height);
      paintNebula();
      paintStars(false);
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
