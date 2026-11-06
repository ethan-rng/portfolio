"use client";

/*
 * Dev-only outline editor for the hero photos (/trace). Every flow's outline is
 * drawn over its photo. Drag a point to move it, click a line to add a point,
 * right-click (or shift-click) a point to delete it. "Copy" puts the selected
 * outline on the clipboard, ready to paste over its `shape:` in constants/hero.ts.
 */
import { useMemo, useRef, useState } from "react";
import type { HeroPhoto } from "@/constants/types";

type Pt = [number, number];
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const fmt = (pts: Pt[]) => `[${pts.map(([x, y]) => `[${r3(x)}, ${r3(y)}]`).join(", ")}]`;

export default function TraceTool({ photos }: { photos: HeroPhoto[] }) {
  const [pi, setPi] = useState(0);
  const photo = photos[pi];
  const initial = useMemo(
    () => photos.map((p) => p.flows.map((f) => (f.shape ?? []).map(([x, y]) => [x, y] as Pt))),
    [photos],
  );
  const [shapes, setShapes] = useState(initial);
  const [sel, setSel] = useState(0);
  const [size, setSize] = useState<[number, number]>([1, 1]);
  const [copied, setCopied] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ fi: number; k: number } | null>(null);

  const cur = shapes[pi];
  const [w, h] = size;
  const toPt = (e: { clientX: number; clientY: number }): Pt => {
    const b = svgRef.current!.getBoundingClientRect();
    return [Math.min(1.01, Math.max(-0.01, (e.clientX - b.left) / b.width)), Math.min(1.01, Math.max(-0.01, (e.clientY - b.top) / b.height))];
  };
  const update = (fi: number, pts: Pt[]) =>
    setShapes((all) => all.map((ps, i) => (i !== pi ? ps : ps.map((s, j) => (j === fi ? pts : s)))));

  const addPoint = (fi: number, e: React.MouseEvent) => {
    // insert on the nearest edge
    const p = toPt(e), pts = cur[fi];
    let best = 0, bestD = Infinity;
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
      const d = Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t);
      if (d < bestD) { bestD = d; best = k; }
    });
    update(fi, [...pts.slice(0, best + 1), p, ...pts.slice(best + 1)]);
  };

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(what); setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main style={{ padding: "90px 24px 40px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, alignItems: "start", fontSize: 13 }}>
      {/* the box takes the image's own size, so the outline layer sits exactly on it */}
      <div style={{ position: "relative", justifySelf: "center", width: `min(100%, calc((100vh - 130px) * ${w / h}))`, aspectRatio: `${w} / ${h}` }}>
        <img
          src={photo.src} alt="" draggable={false}
          onLoad={(e) => setSize([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight])}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", userSelect: "none" }}
        />
        <svg
          ref={svgRef} viewBox="0 0 1 1" preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
          onPointerMove={(e) => { if (drag.current) { const { fi, k } = drag.current; update(fi, cur[fi].map((q, j) => (j === k ? toPt(e) : q))); } }}
          onPointerUp={() => { drag.current = null; }}
          onPointerLeave={() => { drag.current = null; }}
        >
          {cur.map((pts, fi) => pts.length > 0 && (
            <g key={fi} opacity={fi === sel ? 1 : 0.45}>
              <polygon
                points={pts.map((q) => q.join(",")).join(" ")}
                fill={fi === sel ? "rgba(224,138,60,.18)" : "rgba(255,255,255,.06)"}
                stroke={fi === sel ? "#e08a3c" : "#ece6dc"} strokeWidth={fi === sel ? 2 : 1} vectorEffect="non-scaling-stroke"
                style={{ cursor: "copy" }}
                onPointerDown={(e) => { if (fi !== sel) setSel(fi); else addPoint(fi, e); }}
              />
              {fi === sel && pts.map(([x, y], k) => (
                <ellipse
                  key={k} cx={x} cy={y} rx={6 / Math.max(1, svgRef.current?.clientWidth ?? 600)} ry={6 / Math.max(1, svgRef.current?.clientHeight ?? 600)}
                  fill="#141311" stroke="#e08a3c" strokeWidth={2} vectorEffect="non-scaling-stroke" style={{ cursor: "grab" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (e.shiftKey || e.button === 2) { if (pts.length > 3) update(fi, pts.filter((_, j) => j !== k)); return; }
                    drag.current = { fi, k }; (e.target as Element).setPointerCapture(e.pointerId);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <aside style={{ position: "sticky", top: 90 }}>
        <p style={{ margin: "0 0 12px" }}>
          {photos.map((p, i) => (
            <button key={p.src} type="button" onClick={() => { setPi(i); setSel(0); }}
              style={{ font: "inherit", background: "none", border: 0, padding: "2px 8px 2px 0", cursor: "pointer", color: i === pi ? "var(--accent)" : "var(--muted)" }}>
              {p.label}
            </button>
          ))}
        </p>
        <p style={{ color: "var(--faint)", margin: "0 0 12px", lineHeight: 1.6 }}>
          drag a point to move it · click the selected outline to add a point · shift-click a point to delete it · click another outline to select it
        </p>
        <ol style={{ margin: "0 0 12px", paddingLeft: 22, maxHeight: "40vh", overflow: "auto" }}>
          {photo.flows.map((f, fi) => (
            <li key={fi} onClick={() => setSel(fi)} style={{ cursor: "pointer", color: fi === sel ? "var(--accent)" : cur[fi].length ? "var(--text)" : "var(--faint)" }}>
              {cur[fi].length ? `${cur[fi].length} points` : "band (no outline)"}{f.speed ? ` · speed ${f.speed}` : ""}
            </li>
          ))}
        </ol>
        <p style={{ display: "flex", gap: 12, margin: "0 0 8px" }}>
          <button type="button" className="trace-btn" onClick={() => copy(fmt(cur[sel]), "outline")} disabled={!cur[sel]?.length}>copy outline</button>
          <button type="button" className="trace-btn" onClick={() => copy(cur.map((pts, i) => `${i}: ${pts.length ? fmt(pts) : "-"}`).join("\n"), "all")}>copy all</button>
          <button type="button" className="trace-btn" onClick={() => update(sel, initial[pi][sel])}>reset</button>
        </p>
        <p style={{ color: "var(--accent)", minHeight: 20, margin: 0 }}>{copied && `copied ${copied}`}</p>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", color: "var(--muted)", fontSize: 12 }}>{cur[sel]?.length ? fmt(cur[sel]) : ""}</pre>
      </aside>
    </main>
  );
}
