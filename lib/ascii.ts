/** Shared bits for turning photos into characters (hero, ascii blocks). */

export const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@01";
export const RAMP = " .`,:;-~=+*ixco%#&8@";
export const CREAM = [236, 230, 220] as const;
export const ACCENT = "#e08a3c";
export const BG = "#141311";

export type Rect = [number, number, number, number];

/**
 * object-fit: cover, as a source rect for drawImage. `focus` is the point of
 * the image (0..1, 0..1) kept in view when cropping, like object-position.
 */
export function cover(img: HTMLImageElement, w: number, h: number, focus: [number, number] = [0.5, 0.5]): Rect {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const ir = iw / ih, r = w / h;
  let sw = iw, sh = ih, sx = 0, sy = 0;
  if (ir > r) { sw = sh * r; sx = (iw - sw) * focus[0]; } else { sh = sw / r; sy = (ih - sh) * focus[1]; }
  return [sx, sy, sw, sh];
}

/** Per-cell colour and auto-levelled brightness (0..1) of a photo on a cols x rows grid. */
export type Grid = { cols: number; rows: number; R: Float32Array; G: Float32Array; B: Float32Array; L: Float32Array };

export function sampleGrid(
  sampler: CanvasRenderingContext2D, img: HTMLImageElement, src: Rect, cols: number, rows: number,
): Grid {
  const SS = 2, sw = cols * SS, sh = rows * SS;
  // nothing to sample yet (a 0-size layout mid-resize/HMR, or an image that failed to load): return a blank grid
  if (sw < 1 || sh < 1 || !img.naturalWidth || !img.naturalHeight) {
    const n = Math.max(0, cols * rows), z = () => new Float32Array(n);
    return { cols, rows, R: z(), G: z(), B: z(), L: z() };
  }
  sampler.canvas.width = sw; sampler.canvas.height = sh;
  sampler.imageSmoothingQuality = "high";
  sampler.drawImage(img, ...src, 0, 0, sw, sh);
  const d = sampler.getImageData(0, 0, sw, sh).data, n = cols * rows;
  const R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), raw = new Float32Array(n);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    let r = 0, g = 0, b = 0;
    for (let j = 0; j < SS; j++) for (let k = 0; k < SS; k++) {
      const o = ((y * SS + j) * sw + (x * SS + k)) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2];
    }
    const i = y * cols + x, q = SS * SS;
    R[i] = r / q; G[i] = g / q; B[i] = b / q;
    raw[i] = (0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i]) / 255;
  }
  // auto-level, then a light unsharp mask so edges survive the glyph ramp
  const sorted = Float32Array.from(raw).sort();
  const lo = sorted[(n * 0.02) | 0], hi = sorted[(n * 0.98) | 0] || 1, span = Math.max(0.05, hi - lo);
  const S = raw.map((l) => Math.min(1, Math.max(0, (l - lo) / span)));
  const L = new Float32Array(n);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    const nb = (x > 0 ? S[i - 1] : S[i]) + (x < cols - 1 ? S[i + 1] : S[i]) + (y > 0 ? S[i - cols] : S[i]) + (y < rows - 1 ? S[i + cols] : S[i]);
    L[i] = Math.min(1, Math.max(0, S[i] + 0.55 * (S[i] - nb / 4))) ** 0.92;
  }
  return { cols, rows, R, G, B, L };
}

/** The photo's own colour, pulled toward cream and scaled by brightness `k`. */
export function tint(g: Grid, i: number, k: number) {
  const m = (c: number, j: number) => Math.round((c * 0.62 + CREAM[j] * 0.38) * k);
  return `rgb(${m(g.R[i], 0)},${m(g.G[i], 1)},${m(g.B[i], 2)})`;
}

export const rampChar = (l: number) => RAMP[Math.min(RAMP.length - 1, (l * RAMP.length) | 0)];
export const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/** Cheap 2D value noise, roughly 0..1. */
const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
export function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
