"use client";

import { useEffect, type RefObject } from "react";
import { ACCENT, BG, cover, randomGlyph, rampChar, sampleGrid, tint } from "@/lib/ascii";

/**
 * Draws `src` into `canvasRef` in characters, sized to `boxRef` (cover-cropped).
 * It scrambles in the first time the box scrolls into view. Shared by the
 * in-post ASCII photos (the ramen bowl) and the ASCII thumbnails.
 * `font` picks the character size from the box width.
 */
export function useAscii(
  boxRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  src: string,
  { font: pickFont = (w: number) => (w < 420 ? 5 : 6.5), onReady }: { font?: (w: number) => number; onReady?: (img: HTMLImageElement) => void } = {},
) {
  useEffect(() => {
    const box = boxRef.current, canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image(); img.src = src;
    let raf = 0, start = 0, played = false, disposed = false;
    let paint: (now: number) => boolean = () => true;

    const layout = () => {
      const W = box.clientWidth, H = box.clientHeight;
      if (!W || !H || !img.naturalWidth) return;
      const font = pickFont(W), cw = font * 0.62, ch = font * 1.02;
      const cols = Math.floor(W / cw), rows = Math.floor(H / ch);
      if (cols < 1 || rows < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "top";
      const g = sampleGrid(sampler, img, cover(img, cols * cw, rows * ch), cols, rows);
      const settle = Float32Array.from({ length: cols * rows }, () => 100 + Math.random() * 900);
      const family = getComputedStyle(document.body).fontFamily;
      paint = (now) => {
        const age = reduceMotion || played ? Infinity : now - start;
        ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
        ctx.font = `${font}px ${family}`;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const i = y * cols + x, l = g.L[i];
          if (age < settle[i]) {
            if (Math.random() < 0.4) { ctx.fillStyle = Math.random() < 0.15 ? ACCENT : "#5c5851"; ctx.fillText(randomGlyph(), x * cw, y * ch); }
            continue;
          }
          if (l < 0.05) continue;
          ctx.fillStyle = tint(g, i, 0.2 + l * 0.8);
          ctx.fillText(rampChar(l), x * cw, y * ch);
        }
        return age > 1000;
      };
      paint(performance.now());
    };

    const loop = (now: number) => {
      if (paint(now)) { played = true; return; }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || played) return;
      io.disconnect();
      start = performance.now();
      raf = requestAnimationFrame(loop);
    }, { threshold: 0.25 });

    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); layout(); if (start && !played) raf = requestAnimationFrame(loop); });

    Promise.all([document.fonts?.ready, img.decode().catch(() => {})]).then(() => {
      if (disposed || !img.naturalWidth) return;
      onReady?.(img);
      ro.observe(box);
      io.observe(box);
    });

    return () => { disposed = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
}
