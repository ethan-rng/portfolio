"use client";

/*
 * Full-screen hero. Each photo fills the screen as itself, except along its
 * flows (a road, a walkway, the rim of a bowl), where it turns into ASCII that
 * streams in the direction the thing moves. Photos rotate; the flow scrambles in fresh.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HeroPhoto } from "@/constants/types";
import { ACCENT, BG, CREAM, cover, noise, randomGlyph, rampChar, sampleGrid, tint, type Grid, type Rect } from "@/lib/ascii";

/**
 * The photo's own colour at a cell, true to its hue with a light saturation lift,
 * brought up to brightness k (0..1) so it reads on the dark bed. The flows draw in this, unwashed.
 */
const vivid = (g: Grid, i: number, k: number) => {
  const r = g.R[i], gr = g.G[i], b = g.B[i], l = 0.3 * r + 0.59 * gr + 0.11 * b;
  const sat = (c: number) => Math.max(0, l + (c - l) * 1.3);
  const R = sat(r), G = sat(gr), B = sat(b);
  const scale = Math.min(3.5, (110 + 145 * k) / Math.max(R, G, B, 1));
  const m = (c: number) => Math.min(255, Math.round(c * scale));
  return `rgb(${m(R)},${m(G)},${m(B)})`;
};

const HOLD_MS = 9000;
const FADE_MS = 900;
const FPS = 30;
const LEVELS = 6;
/** Radius of the cursor lens, px: a small window onto the photo in full colour. */
const LENS_R = 48;

/** One cell inside a flow, precomputed per photo per layout. */
type FlowCell = {
  i: number; x: number; y: number;
  /** distance along the path and across it, in px */
  s: number; d: number;
  /** soft edge, 0..1 */
  e: number;
  /** px/s */
  v: number;
  /** characters for "streaming" cells, chosen by the path's direction here */
  dir: string;
  /** precomputed fill colours by brightness level */
  colors: string[];
  light: boolean;
  /** opacity of the dark bed under this cell, edge fade included */
  bed: number;
  /** false for cells dithered out along a shape's edge, so the boundary breaks up instead of stepping */
  keep: boolean;
  settle: number;
};

/** backing: the dark bed under the characters. patch: the photo in colour, cut to the flows' areas. */
type Prepared = { photo: number; grid: Grid; dst: Rect; src: Rect; cells: FlowCell[]; backing: HTMLCanvasElement; patch: HTMLCanvasElement };

const dirChars = (angle: number) => {
  // fold to 0..PI, then pick a stroke that reads as that direction on screen
  const a = ((angle % Math.PI) + Math.PI) % Math.PI;
  if (a < Math.PI / 8 || a > (7 * Math.PI) / 8) return "-=~";
  if (a < (3 * Math.PI) / 8) return "\\\\>";
  if (a < (5 * Math.PI) / 8) return "|!:";
  return "//<";
};

/** True if the photo's colour at cell i is one a flow asked to skip: grey (washed out), blue, or not green. */
const skipColour = (g: Grid, i: number, skip: ("gray" | "blue" | "green" | "nongreen")[]) => {
  const r = g.R[i], gr = g.G[i], b = g.B[i];
  const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b), sat = mx ? (mx - mn) / mx : 0;
  if (skip.includes("gray") && sat < 0.2) return true;
  if (skip.includes("blue") && b >= r && b >= gr - 8 && b - r > 12) return true;
  // leaves run from yellow-green to deep green: green leads (or ties red, for yellow), and isn't washed out
  const green = gr >= r * 0.95 && gr > b * 1.05 && sat > 0.14;
  if (skip.includes("green") && green && sat > 0.25) return true;
  if (skip.includes("nongreen") && !(gr >= r * 0.95 && gr > b * 1.05 && sat > 0.14)) return true;
  return false;
};

/** Distance from (x, y) to the polygon's edge: positive inside, negative outside. */
const edgeDistance = (poly: number[][], x: number, y: number) => {
  let inside = false, best = Infinity;
  for (let j = 0, k = poly.length - 1; j < poly.length; k = j++) {
    const [ax, ay] = poly[k], [bx, by] = poly[j];
    if ((by > y) !== (ay > y) && x < ((ax - bx) * (y - by)) / (ay - by) + bx) inside = !inside;
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
  }
  return inside ? best : -best;
};

/** `children` are laid over the photo (left side, above the shade, below the controls). */
export default function HeroFlow({ photos, children }: { photos: HeroPhoto[]; children?: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<HTMLCanvasElement>(null);
  const asciiRef = useRef<HTMLCanvasElement>(null);
  const showRef = useRef<(i: number, holdMs?: number) => void>(() => {});
  const [current, setCurrent] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const lensCanvas = lensRef.current!, lctx = lensCanvas.getContext("2d")!;
    // the flows draw on their own canvas, above the washed-out photo, so they keep their colour
    const asciiCanvas = asciiRef.current!, fctx = asciiCanvas.getContext("2d")!;
    const lens = { x: 0, y: 0, on: false };
    const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgs = photos.map((p) => { const im = new Image(); im.src = p.src; return im; });

    let W = 0, H = 0, cw = 0, ch = 0, cols = 0, rows = 0, font = 10, fontFamily = "monospace";
    let cur: Prepared | null = null, prev: Prepared | null = null;
    let changedAt = 0, nextAt = 0, hold = 0, visible = true, raf = 0, last = 0, disposed = false;
    const cache = new Map<number, Prepared>();

    // Map a photo onto the screen (cover + focus), then work out which cells
    // sit on each flow and where along it they are.
    const prepare = (pi: number): Prepared => {
      const hit = cache.get(pi);
      if (hit) return hit;
      const p = photos[pi], img = imgs[pi];
      const src = cover(img, cols * cw, rows * ch, p.focus);
      // the whole photo's size on screen, so photo fractions map to px
      const k = (cols * cw) / src[2];
      const dst: Rect = [-src[0] * k, -src[1] * k, img.naturalWidth * k, img.naturalHeight * k];
      const toPx = ([u, v]: [number, number]) => [dst[0] + u * dst[2], dst[1] + v * dst[3]];
      const grid = sampleGrid(sampler, img, src, cols, rows);
      const scale = H / 1000;

      // every hole as an outline in px; a box becomes its four corners
      const holes = (p.holes ?? []).map((h) => {
        if (typeof h[0] !== "number") return (h as [number, number][]).map(toPx);
        const [x0, y0, x1, y1] = h as number[];
        return ([[x0, y0], [x1, y0], [x1, y1], [x0, y1]] as [number, number][]).map(toPx);
      });
      const inHole = (x: number, y: number) => holes.some((poly) => edgeDistance(poly, x, y) >= 0);

      const cells: FlowCell[] = [];
      const taken = new Uint8Array(cols * rows);
      for (const [fi, f] of p.flows.entries()) {
        const pts = f.points.map(toPx);
        if (f.closed) pts.push(pts[0]);
        const segs: { ax: number; ay: number; dx: number; dy: number; len: number; at: number }[] = [];
        let total = 0;
        for (let j = 0; j < pts.length - 1; j++) {
          const [ax, ay] = pts[j], [bx, by] = pts[j + 1];
          const len = Math.hypot(bx - ax, by - ay) || 1;
          segs.push({ ax, ay, dx: bx - ax, dy: by - ay, len, at: total });
          total += len;
        }
        const [w0, w1] = typeof f.width === "number" ? [f.width, f.width] : (f.width ?? [0, 0]);
        const shape = f.shape?.map(toPx);
        const tol = shape && f.snap !== false ? (f.snap ?? 0.09) : 0;
        // how far either side of the outline a snapped edge may move
        const reach = cw * 2;
        const maxHalf = shape ? (tol ? reach : 0) : (Math.max(w0, w1) * dst[2]) / 2 * 1.25;
        const cand: { i: number; gx: number; gy: number; cx: number; cy: number; s: number; best: number; side: number; angle: number; edge: number }[] = [];
        const push = (i: number, gx: number, gy: number, cx: number, cy: number, s: number, best: number, side: number, angle: number, e: number) => {
          taken[i] = 1;
          const light = f.tone === "light";
          // dark tone: brighter value, brighter glyph. light tone: the reverse, inked onto a pale bed.
          const colors = Array.from({ length: LEVELS }, (_, lv) =>
            light ? tint(grid, i, 0.62 - (0.42 * (lv + 1)) / LEVELS) : vivid(grid, i, 0.5 + (0.5 * (lv + 1)) / LEVELS));
          cells.push({
            i, x: gx * cw, y: gy * ch, s, d: best * side, e, v: f.speed * scale, dir: dirChars(angle), colors, light,
            // a darkened flow also darkens right out to its rim, or small shapes (lanterns) stay bright at the edges
            // and the brighter the photo under a cell, the darker its bed, so characters still read on lit signs
            bed: f.bed ? f.bed * Math.min(1, e * 2.2) ** 1.2 : (0.42 + 0.45 * grid.L[i]) * e ** 1.6, settle: 0, keep: e >= 1 || noise(cx / 9, cy / 9) < e * 1.4,
          });
        };
        // only test cells near the path's (or the shape's) bounding box
        const box = shape ?? pts;
        const xs = box.map((q) => q[0]), ys = box.map((q) => q[1]);
        const gx0 = Math.max(0, Math.floor((Math.min(...xs) - maxHalf) / cw)), gx1 = Math.min(cols - 1, Math.ceil((Math.max(...xs) + maxHalf) / cw));
        const gy0 = Math.max(0, Math.floor((Math.min(...ys) - maxHalf) / ch)), gy1 = Math.min(rows - 1, Math.ceil((Math.max(...ys) + maxHalf) / ch));
        for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
          const i = gy * cols + gx;
          if (taken[i]) continue;
          const cx = gx * cw + cw / 2, cy = gy * ch + ch / 2;
          if (inHole(cx, cy)) continue;
          if (f.skip && skipColour(grid, i, f.skip)) continue;
          let best = Infinity, s = 0, side = 0, angle = 0;
          for (const g of segs) {
            const t = Math.max(0, Math.min(1, ((cx - g.ax) * g.dx + (cy - g.ay) * g.dy) / (g.len * g.len)));
            const px = g.ax + g.dx * t, py = g.ay + g.dy * t;
            const dist = Math.hypot(cx - px, cy - py);
            if (dist < best) {
              best = dist; s = g.at + t * g.len; angle = Math.atan2(g.dy, g.dx);
              side = Math.sign(g.dx * (cy - g.ay) - g.dy * (cx - g.ax)) || 1;
            }
          }
          if (shape) {
            // filled area: collect everything near the outline, then decide the edge below
            const edge = edgeDistance(shape, cx, cy);
            if (edge < (tol ? -reach : 0)) continue;
            cand.push({ i, gx, gy, cx, cy, s, best, side, angle, edge });
            continue;
          }
          // ragged edges, so a band reads as a stream rather than a bar
          const half = ((w0 + (w1 - w0) * (s / total)) * dst[2]) / 2 * (0.75 + 0.5 * noise(s / 55, fi * 17.3));
          if (best > half) continue;
          push(i, gx, gy, cx, cy, s, best, side, angle, Math.min(1, (1 - best / half) * 2.2));
        }
        if (!shape || !cand.length) continue;

        // Snap the outline to the photo: everything well inside is in; near the
        // outline, grow outward from the inside only into cells whose colour
        // matches their neighbour and the area as a whole, so it stops at real edges.
        const at = new Map(cand.map((c, k) => [c.i, k]));
        const kept = new Uint8Array(cand.length);
        const diff = (a: number, b: number) => {
          const dr = grid.R[a] - grid.R[b], dg = grid.G[a] - grid.G[b], db = grid.B[a] - grid.B[b];
          return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / 765;
        };
        if (!tol) cand.forEach((c, k) => { kept[k] = c.edge >= 0 ? 1 : 0; });
        else {
          let seeds = cand.flatMap((c, k) => (c.edge >= reach ? [k] : []));
          if (!seeds.length) seeds = cand.flatMap((c, k) => (c.edge >= 0 ? [k] : []));
          let mr = 0, mg = 0, mb = 0;
          for (const k of seeds) { const i = cand[k].i; mr += grid.R[i]; mg += grid.G[i]; mb += grid.B[i]; }
          mr /= seeds.length || 1; mg /= seeds.length || 1; mb /= seeds.length || 1;
          const offMean = (i: number) => {
            const dr = grid.R[i] - mr, dg = grid.G[i] - mg, db = grid.B[i] - mb;
            return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / 765;
          };
          const queue = [...seeds];
          for (const k of seeds) kept[k] = 1;
          while (queue.length) {
            const c = cand[queue.pop()!];
            for (const n of [c.gx > 0 ? c.i - 1 : -1, c.gx < cols - 1 ? c.i + 1 : -1, c.i - cols, c.i + cols]) {
              const k = at.get(n);
              if (k === undefined || kept[k]) continue;
              const nc = cand[k];
              if (nc.edge >= reach || (diff(c.i, n) < tol && offMean(n) < tol * 2)) { kept[k] = 1; queue.push(k); }
            }
          }
        }
        // fade in from the snapped edge, measured in cells
        const depth = new Int16Array(cand.length).fill(-1);
        const ring: number[] = [];
        cand.forEach((c, k) => {
          if (!kept[k]) return;
          const nb = [c.i - 1, c.i + 1, c.i - cols, c.i + cols];
          if (nb.some((n) => { const j = at.get(n); return j === undefined || !kept[j]; })) { depth[k] = 0; ring.push(k); }
        });
        for (let q = 0; q < ring.length; q++) {
          const c = cand[ring[q]];
          for (const n of [c.i - 1, c.i + 1, c.i - cols, c.i + cols]) {
            const j = at.get(n);
            if (j !== undefined && kept[j] && depth[j] < 0 && depth[ring[q]] < 6) { depth[j] = depth[ring[q]] + 1; ring.push(j); }
          }
        }
        cand.forEach((c, k) => {
          if (!kept[k]) return;
          const d = depth[k] < 0 ? 6 : depth[k];
          push(c.i, c.gx, c.gy, c.cx, c.cy, c.s, c.best, c.side, c.angle, Math.min(1, 0.55 + d / 3)); // short fade, so thin parts (a handrail) still fill
        });
      }

      // the dark bed the characters sit on, drawn once: one pixel per cell, then
      // scaled up with smoothing so its edges fade out instead of stepping in squares
      const backing = document.createElement("canvas");
      backing.width = cols; backing.height = rows;
      const b = backing.getContext("2d")!, bed = b.createImageData(cols, rows);
      for (const c of cells) {
        const o = c.i * 4;
        if (c.light) {
          for (let j = 0; j < 3; j++) bed.data[o + j] = Math.round([grid.R, grid.G, grid.B][j][c.i] * 0.55 + CREAM[j] * 0.45);
          bed.data[o + 3] = Math.round(255 * 0.8 * c.e * c.e);
        } else {
          // a deep shade of the photo's own colour, so the bed sits in the picture rather than on it
          bed.data[o] = Math.round(12 + grid.R[c.i] * 0.2); bed.data[o + 1] = Math.round(11 + grid.G[c.i] * 0.2); bed.data[o + 2] = Math.round(10 + grid.B[c.i] * 0.2);
          bed.data[o + 3] = Math.round(255 * c.bed);
        }
      }
      b.putImageData(bed, 0, 0);

      // The flows' areas in colour, so only they come out of the grey wash: the
      // photo, cut by a soft mask of the cells (one pixel each, scaled up smooth).
      const mask = document.createElement("canvas");
      mask.width = cols; mask.height = rows;
      const mctx = mask.getContext("2d")!, md = mctx.createImageData(cols, rows);
      for (const c of cells) md.data[c.i * 4 + 3] = Math.round(255 * Math.min(1, c.e * 1.4));
      mctx.putImageData(md, 0, 0);
      const patch = document.createElement("canvas");
      patch.width = canvas.width; patch.height = canvas.height;
      const pctx = patch.getContext("2d")!;
      pctx.scale(patch.width / W, patch.height / H);
      pctx.drawImage(img, ...src, 0, 0, cols * cw, rows * ch);
      pctx.globalCompositeOperation = "destination-in";
      pctx.imageSmoothingEnabled = true; pctx.imageSmoothingQuality = "high";
      pctx.filter = `blur(${(cw * 0.8).toFixed(1)}px)`;
      pctx.drawImage(mask, 0, 0, cols * cw, rows * ch);
      const prep = { photo: pi, grid, dst, src, cells, backing, patch };
      cache.set(pi, prep);
      return prep;
    };

    const layout = () => {
      W = stage.clientWidth; H = stage.clientHeight;
      font = W < 600 ? 7 : W < 1400 ? 8 : 9;
      cw = font * 0.62; ch = font * 1.05;
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const [cv, cx] of [[lensCanvas, lctx], [asciiCanvas, fctx]] as const) {
        cv.width = canvas.width; cv.height = canvas.height;
        cv.style.width = W + "px"; cv.style.height = H + "px";
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.textBaseline = "top";
      }
      ctx.textBaseline = "top";
      fontFamily = getComputedStyle(document.body).fontFamily;
      cache.clear();
      if (cur) { cur = prepare(cur.photo); prev = null; }
    };

    const show = (i: number, holdMs = 0) => {
      i = (i + photos.length) % photos.length;
      if (holdMs) hold = performance.now() + holdMs;
      if (cur && i === cur.photo) return;
      prev = cur;
      cur = prepare(i);
      changedAt = performance.now();
      for (const c of cur.cells) c.settle = reduceMotion ? 0 : 250 + Math.random() * 1100;
      nextAt = changedAt + HOLD_MS;
      canvas.setAttribute("aria-label", photos[i].alt);
      setCurrent(i);
    };
    showRef.current = show;

    const drawFlow = (p: Prepared, t: number, age: number, alpha: number) => {
      fctx.globalAlpha = alpha;
      fctx.drawImage(p.patch, 0, 0, W, H);
      fctx.imageSmoothingEnabled = true; fctx.imageSmoothingQuality = "high";
      fctx.filter = `blur(${(cw * 0.7).toFixed(1)}px)`; // softens the bed further where supported
      fctx.drawImage(p.backing, 0, 0, cols * cw, rows * ch);
      fctx.filter = "none";
      for (const c of p.cells) {
        if (age < c.settle) {
          // still scrambling in
          if (Math.random() < 0.35 * c.e) {
            fctx.fillStyle = Math.random() < 0.15 ? ACCENT : "#5c5851";
            fctx.fillText(randomGlyph(), c.x, c.y);
          }
          continue;
        }
        if (!c.keep) continue;
        const lum = p.grid.L[c.i];
        // streaks stretched along the path, sliding with it
        const n = noise((c.s - t * c.v) / 34, c.d / 7);
        const val = (0.5 * lum + 0.85 * n * n) * (0.4 + 0.6 * c.e);
        if (val < 0.13) continue;
        const lv = Math.min(LEVELS - 1, (val * LEVELS) | 0);
        if (val > 0.78 && n > 0.93) fctx.fillStyle = ACCENT;
        else fctx.fillStyle = c.colors[lv];
        const chr = val > 0.5 ? c.dir[(n * 97) % c.dir.length | 0] : rampChar(val);
        fctx.fillText(chr, c.x, c.y);
      }
      fctx.globalAlpha = 1;
    };

    // The lens sits on its own unfiltered canvas: the plain photo, in colour, no ASCII.
    const drawLens = () => {
      lctx.clearRect(0, 0, W, H);
      if (!lens.on || !cur) return;
      lctx.save();
      lctx.beginPath(); lctx.arc(lens.x, lens.y, LENS_R, 0, Math.PI * 2); lctx.clip();
      lctx.drawImage(imgs[cur.photo], ...cur.src, 0, 0, cols * cw, rows * ch);
      // colour fills the whole lens, with just the last couple of px softened against the ring
      const fade = lctx.createRadialGradient(lens.x, lens.y, LENS_R - 2.5, lens.x, lens.y, LENS_R);
      fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
      lctx.globalCompositeOperation = "destination-in";
      lctx.fillStyle = fade; lctx.fillRect(lens.x - LENS_R, lens.y - LENS_R, LENS_R * 2, LENS_R * 2);
      lctx.globalCompositeOperation = "source-over";
      lctx.restore();
      // the old lens's ring: dashed, in the accent
      lctx.setLineDash([4, 5]); lctx.lineWidth = 1; lctx.strokeStyle = ACCENT;
      lctx.beginPath(); lctx.arc(lens.x, lens.y, LENS_R + 0.5, 0, Math.PI * 2); lctx.stroke();
      lctx.setLineDash([]);
    };

    const draw = (now: number) => {
      if (!cur) return;
      const t = reduceMotion ? 0 : now / 1000;
      const age = now - changedAt;
      const fade = prev && !reduceMotion ? Math.min(1, age / FADE_MS) : 1;
      if (fade >= 1) prev = null;
      fctx.font = `${font}px ${fontFamily}`;
      fctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (prev) {
        ctx.drawImage(imgs[prev.photo], ...prev.src, 0, 0, cols * cw, rows * ch);
        drawFlow(prev, t, Infinity, 1 - fade);
      }
      ctx.globalAlpha = fade;
      ctx.drawImage(imgs[cur.photo], ...cur.src, 0, 0, cols * cw, rows * ch);
      ctx.globalAlpha = 1;
      drawFlow(cur, t, age, fade);
      drawLens();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 1000 / FPS) return;
      if (!stage.clientWidth || !stage.clientHeight) return; // collapsed (mid-resize, HMR): wait for a real size
      last = now;
      if (stage.clientWidth !== W || stage.clientHeight !== H) layout();
      if (!reduceMotion && now > nextAt && now > hold) show((cur?.photo ?? -1) + 1);
      draw(now);
    };

    const section = stage.parentElement!;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = stage.getBoundingClientRect();
      lens.x = e.clientX - r.left; lens.y = e.clientY - r.top;
      // step aside over links and buttons so they read normally
      lens.on = !(e.target as Element).closest("a, button");
      drawLens();
    };
    const onLeave = () => { lens.on = false; drawLens(); };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(stage);
    let rt: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (disposed || !stage.clientWidth || !stage.clientHeight) return; layout(); draw(performance.now()); }, 120);
    });
    ro.observe(stage);

    Promise.all([document.fonts?.ready, ...imgs.map((im) => im.decode().catch(() => {}))]).then(() => {
      if (disposed) return;
      layout();
      show(0);
      setLive(true);
      draw(performance.now());
      raf = requestAnimationFrame(tick);
    });

    return () => {
      disposed = true;
      section.removeEventListener("pointermove", onMove); section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); clearTimeout(rt);
    };
  }, [photos]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const photo = photos[current];
  const go = (i: number) => showRef.current(i, 12000);
  const focus = (p?: HeroPhoto) => p?.focus ? `${p.focus[0] * 100}% ${p.focus[1] * 100}%` : "50% 50%";

  const ui = (
      <div className="hero-ui">
        <div className="hero-meta">
          <p className="hero-file">{`${pad(current + 1)}/${pad(photos.length)}  ${photo?.label ?? ""}`}</p>
          {photo?.caption && <p className="hero-caption" aria-live="polite">{photo.caption}</p>}
        </div>
        <div className="hero-controls">
          <button type="button" aria-label="Previous photo" onClick={() => go(current - 1)}>{"<-"}</button>
          {photos.map((p, i) => (
            <button key={p.src} type="button" aria-pressed={i === current} aria-label={`Show photo ${i + 1}: ${p.label}`} onClick={() => go(i)}>
              {pad(i + 1)}
            </button>
          ))}
          <button type="button" aria-label="Next photo" onClick={() => go(current + 1)}>{"->"}</button>
        </div>
      </div>
  );

  return (
    <section className="hero-flow" aria-roledescription="carousel" aria-label="Photos">
      <div className="hero-stage" ref={stageRef}>
        <canvas ref={canvasRef} role="img" aria-label={photos[0]?.alt} />
        <canvas ref={asciiRef} className="hero-ascii" aria-hidden="true" />
        {!live && photos[0] && (
          // Shown until the canvas is ready (and if JS never runs).
          <img className="hero-fallback" src={photos[0].src} alt={photos[0].alt} style={{ objectPosition: focus(photos[0]) }} />
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <canvas ref={lensRef} className="hero-lens" aria-hidden="true" />
      {/* with children, the controls go inside the overlay so they can sit just above the page's bottom band */}
      {children ? <div className="hero-overlay">{children}{ui}</div> : ui}
    </section>
  );
}
