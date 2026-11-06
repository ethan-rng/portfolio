"use client";

/*
 * ASCII reel, as the hero background.
 *
 * Each photo is sampled onto a character grid that fills the whole hero;
 * brightness picks the glyph and the photo's own colour (muted toward cream)
 * tints it. The grid fades toward the left (where the text sits) and into the
 * page at the bottom. Every few seconds it scrambles into the next photo;
 * under the pointer, a dashed lens shows the real photograph. "wagwan" is
 * hidden in every frame.
 *
 * It only redraws while something is changing (a transition or the lens),
 * so the large canvas costs nothing when it's idle.
 */
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/constants/types";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@01";
const RAMP = " .`,:;-~=+*ixco%#&8@";
const CREAM = [236, 230, 220];
const ACCENT = "#e08a3c";
const HOLD_MS = 6500;

type Cell = { ch: string; color: string };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type ReelPhoto = Photo & { focus?: [number, number] };

export default function Reel({ photos }: { photos: ReelPhoto[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const showRef = useRef<(i: number, holdMs?: number) => void>(() => {});
  const [current, setCurrent] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgs = photos.map((p) => { const im = new Image(); im.src = p.src; return im; });

    let W = 0, H = 0, cw = 0, ch = 0, cols = 0, rows = 0, font = 8, narrow = false;
    let cur = -1, grid: Cell[] = [], prev: Cell[] | null = null, settle: Float32Array | null = null;
    let changedAt = 0, nextAt = 0, hold = 0, visible = true, raf = 0, disposed = false, dirty = true;
    let fade = new Float32Array(0);
    const lens = { x: 0, y: 0, on: false, r: 0 };

    /** Crop rect for drawing `img` over a w×h area, centred on the photo's focus point. */
    const cover = (i: number, w: number, h: number): [number, number, number, number] => {
      const img = imgs[i], [fx, fy] = photos[i].focus ?? [0.5, 0.42];
      const ir = img.naturalWidth / img.naturalHeight, r = w / h;
      let sw = img.naturalWidth, sh = img.naturalHeight;
      if (ir > r) sw = sh * r; else sh = sw / r;
      const sx = Math.min(img.naturalWidth - sw, Math.max(0, fx * img.naturalWidth - sw / 2));
      const sy = Math.min(img.naturalHeight - sh, Math.max(0, fy * img.naturalHeight - sh / 2));
      return [sx, sy, sw, sh];
    };

    // Photo -> glyph grid: sampled at 2x and averaged, auto-levelled, lightly
    // sharpened, then faded by position so the text on top stays readable.
    const sample = (pi: number): Cell[] => {
      const img = imgs[pi];
      const SS = 2, sw = cols * SS, sh = rows * SS;
      sampler.canvas.width = sw; sampler.canvas.height = sh;
      sampler.imageSmoothingQuality = "high";
      sampler.drawImage(img, ...cover(pi, cols * cw, rows * ch), 0, 0, sw, sh);
      const d = sampler.getImageData(0, 0, sw, sh).data, n = cols * rows;
      const R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), L = new Float32Array(n);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        let r = 0, g = 0, b = 0;
        for (let j = 0; j < SS; j++) for (let k = 0; k < SS; k++) {
          const o = ((y * SS + j) * sw + (x * SS + k)) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2];
        }
        const i = y * cols + x, q = SS * SS;
        R[i] = r / q; G[i] = g / q; B[i] = b / q;
        L[i] = (0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i]) / 255;
      }
      const sorted = Float32Array.from(L).sort();
      const lo = sorted[(n * 0.02) | 0], hi = sorted[(n * 0.98) | 0] || 1, span = Math.max(0.05, hi - lo);
      const S = L.map((l) => Math.min(1, Math.max(0, (l - lo) / span)));
      const out: Cell[] = new Array(n);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const nb = (x > 0 ? S[i - 1] : S[i]) + (x < cols - 1 ? S[i + 1] : S[i]) + (y > 0 ? S[i - cols] : S[i]) + (y < rows - 1 ? S[i + cols] : S[i]);
        const l = Math.min(1, Math.max(0, S[i] + 0.55 * (S[i] - nb / 4))) ** 0.92;
        const k = (0.2 + l * 0.8) * fade[i];
        const mix = (c: number, j: number) => Math.round((c * 0.62 + CREAM[j] * 0.38) * k);
        out[i] = { ch: RAMP[Math.min(RAMP.length - 1, (l * RAMP.length) | 0)], color: `rgb(${mix(R[i], 0)},${mix(G[i], 1)},${mix(B[i], 2)})` };
      }
      // easter egg: "wagwan" tucked into the visible part of the photo
      const word = "wagwan";
      const seed = [...img.src].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
      const x0 = Math.floor(cols * (narrow ? 0.1 : 0.62)), span2 = Math.max(1, Math.floor(cols * (narrow ? 0.7 : 0.3)) - word.length);
      const wy = Math.min(rows - 2, Math.floor(rows * 0.3 + (seed % Math.max(1, Math.floor(rows * 0.45)))));
      const wx = x0 + ((seed >>> 8) % span2);
      for (let k = 0; k < word.length; k++) { const i = wy * cols + wx + k; if (out[i]) out[i] = { ch: word[k], color: "#8a847a" }; }
      return out;
    };

    const layout = () => {
      W = stage.clientWidth; H = stage.clientHeight;
      narrow = W < 760;
      font = narrow ? 6.5 : 8; cw = font * 0.62; ch = font * 1.02;
      cols = Math.floor(W / cw); rows = Math.floor(H / ch);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "top";
      lens.r = Math.min(W, H) * (narrow ? 0.22 : 0.17);
      // Brightness falloff: dark under the text (left), fading out at the bottom.
      fade = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const u = x / cols, v = y / rows;
        const across = narrow ? 0.34 : 0.14 + 0.86 * smooth(0.3, 0.7, u);
        const down = (1 - smooth(0.8, 1, v)) * (0.65 + 0.35 * smooth(0, 0.12, v));
        fade[y * cols + x] = across * down;
      }
      if (cur >= 0) { grid = sample(cur); prev = null; settle = null; }
      dirty = true;
    };

    const show = (i: number, holdMs = 0) => {
      i = (i + photos.length) % photos.length;
      if (holdMs) hold = performance.now() + holdMs;
      if (i === cur) return;
      prev = cur >= 0 ? grid : null;
      cur = i;
      grid = sample(i);
      changedAt = performance.now();
      settle = reduceMotion ? null : Float32Array.from({ length: cols * rows }, () => 120 + Math.random() * 720);
      nextAt = changedAt + HOLD_MS;
      canvas.setAttribute("aria-label", photos[i].alt);
      dirty = true;
      setCurrent(i);
    };
    showRef.current = show;

    const draw = (now: number) => {
      ctx.fillStyle = "#141311"; ctx.fillRect(0, 0, W, H);
      const family = getComputedStyle(document.body).fontFamily;
      ctx.font = `${font}px ${family}`;
      const age = now - changedAt;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        let cell = grid[i];
        if (settle && age < settle[i]) {
          if (age / settle[i] < 0.55 && prev) cell = prev[i];
          else if (Math.random() < 0.5 && fade[i] > 0.2) cell = { ch: GLYPHS[(Math.random() * GLYPHS.length) | 0], color: Math.random() < 0.18 ? ACCENT : "#5c5851" };
        }
        if (!cell || cell.ch === " ") continue;
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.ch, x * cw, y * ch);
      }
      if (settle && age > 900) settle = null;
      if (lens.on) {
        ctx.save(); ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(imgs[cur], ...cover(cur, cols * cw, rows * ch), 0, 0, cols * cw, rows * ch);
        ctx.restore();
        ctx.setLineDash([4, 5]); ctx.lineWidth = 1; ctx.strokeStyle = ACCENT;
        ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r + 0.5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ACCENT; ctx.font = `11px ${family}`;
        ctx.fillText("+", lens.x - 3, lens.y - 7);
      }
    };

    // The text sits on top of the canvas, so listen on the whole hero.
    const hero = stage.closest(".hero") ?? stage;
    const overInteractive = (e: Event) => !!(e.target as HTMLElement).closest?.("a, button, .kicker");
    const moveLens = (e: Event) => {
      const pe = e as PointerEvent;
      if (overInteractive(pe)) { if (lens.on) { lens.on = false; dirty = true; } return; }
      const r = canvas.getBoundingClientRect();
      lens.x = pe.clientX - r.left; lens.y = pe.clientY - r.top; lens.on = true; dirty = true;
      hold = performance.now() + 4000;
    };
    const leave = () => { lens.on = false; dirty = true; };
    const up = (e: Event) => { if ((e as PointerEvent).pointerType !== "mouse") { lens.on = false; dirty = true; } };
    hero.addEventListener("pointermove", moveLens);
    hero.addEventListener("pointerdown", moveLens);
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("pointerup", up);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || cur < 0) return;
      if (!reduceMotion && now > nextAt && now > hold && !lens.on) show(cur + 1);
      if (dirty || settle) { draw(now); dirty = false; }
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) dirty = true; });
    io.observe(stage);
    let rt: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(layout, 120); });
    ro.observe(stage);

    Promise.all([document.fonts?.ready, ...imgs.map((im) => im.decode().catch(() => {}))]).then(() => {
      if (disposed) return;
      layout();
      show(0);
      setLive(true);
      raf = requestAnimationFrame(tick);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); clearTimeout(rt);
      hero.removeEventListener("pointermove", moveLens);
      hero.removeEventListener("pointerdown", moveLens);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointerup", up);
    };
  }, [photos]);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="reel">
      <div className="reel-stage" ref={stageRef}>
        <canvas ref={canvasRef} role="img" aria-label={photos[0]?.alt} />
        {!live && photos[0] && <img className="reel-fallback" src={photos[0].src} alt="" aria-hidden="true" />}
      </div>
      <div className="reel-meta">
        <div className="reel-bar">
          <span className="reel-caption">{`${pad(current + 1)}/${pad(photos.length)}  ${photos[current]?.label ?? ""}`}</span>
          <div className="reel-dots">
            {photos.map((p, i) => (
              <button key={p.src} type="button" aria-pressed={i === current} aria-label={`Show photo ${i + 1}: ${p.label}`}
                onClick={() => showRef.current(i, 9000)}>
                {pad(i + 1)}
              </button>
            ))}
          </div>
        </div>
        {photos[current]?.caption && <p className="reel-note">{photos[current].caption}</p>}
      </div>
    </div>
  );
}
