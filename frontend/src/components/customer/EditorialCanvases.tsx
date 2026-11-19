import React, { useEffect, useRef } from 'react';

/**
 * Stage 1: Fine Editorial Print-Registration & Linework Canvas
 * Renders abstract ink registration strokes, print marks, calibration crosshairs,
 * and drifting paper fibers in Dotcom burgundy & pastel gold.
 */
export const HeroPrintCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // Drifting paper linework strokes
    const strokeCount = 18;
    const strokes = Array.from({ length: strokeCount }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      length: 80 + Math.random() * 140,
      angle: (Math.random() - 0.5) * 0.4,
      speedX: (Math.random() - 0.5) * 0.0003,
      speedY: 0.0002 + Math.random() * 0.0004,
      width: 0.75 + Math.random() * 1.25,
      alpha: 0.08 + (i % 4 === 0 ? 0.12 : 0.05),
      color: i % 4 === 0 ? '#F5E593' : '#8C857B',
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw static editorial print registration marks (crosshairs and calibration ticks)
      ctx.save();
      ctx.strokeStyle = 'rgba(246, 231, 168, 0.18)';
      ctx.lineWidth = 1;

      // 4 Corner registration targets
      const corners = [
        { x: 40, y: 40 },
        { x: width - 40, y: 40 },
        { x: 40, y: height - 40 },
        { x: width - 40, y: height - 40 },
      ];

      corners.forEach(({ x, y }) => {
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x + 14, y);
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x, y + 14);
        ctx.stroke();

        // Registration circle
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Top & bottom fine alignment rulers
      const step = 60;
      for (let x = 80; x < width - 80; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 26);
        ctx.lineTo(x, 32);
        ctx.moveTo(x, height - 26);
        ctx.lineTo(x, height - 32);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw drifting harmonic paper & ink strokes
      strokes.forEach((s) => {
        s.y += s.speedY;
        s.x += s.speedX + Math.sin(time + s.phase) * 0.0002;
        if (s.y > 1.2) s.y = -0.2;
        if (s.x > 1.2) s.x = -0.2;
        if (s.x < -0.2) s.x = 1.2;

        const startX = s.x * width;
        const startY = s.y * height;
        const curAngle = s.angle + Math.sin(time * 0.5 + s.phase) * 0.08;
        const endX = startX + Math.cos(curAngle) * s.length;
        const endY = startY + Math.sin(curAngle) * s.length;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = s.alpha * (0.8 + Math.sin(time * 2 + s.phase) * 0.2);
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 1 }}
    />
  );
};

/**
 * Stage 5: 22 Stacked Academic Editorial Contour Lines Canvas
 * Features 22 harmonic sine curves, secondary harmonic oscillation,
 * and brand accent coloring on every 5th curve.
 */
export const ContourChaptersCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const totalLines = 22;
    let time = 0;

    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      const spacing = height / (totalLines + 3);

      for (let i = 0; i < totalLines; i++) {
        const isAccent = (i + 1) % 5 === 0;
        const baseY = (i + 2) * spacing;
        const lineTime = time + i * 0.18;

        ctx.beginPath();
        const strokeColor = isAccent ? '#EED97A' : '#A39D94';
        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = isAccent ? 0.65 : 0.18;
        ctx.lineWidth = isAccent ? 1.8 : 1.0;

        const segments = 45;
        for (let j = 0; j <= segments; j++) {
          const x = (j / segments) * width;
          // Primary wave + slower harmonic
          const y =
            baseY +
            Math.sin(j * 0.22 + lineTime) * 14 +
            Math.cos(j * 0.11 - lineTime * 0.6) * 8;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-90"
      style={{ zIndex: 1 }}
    />
  );
};
