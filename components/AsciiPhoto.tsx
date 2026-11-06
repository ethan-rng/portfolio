"use client";

/*
 * A photo drawn in characters. It scrambles in when it scrolls into view;
 * hover (or tap) shows the real photo underneath.
 */
import { useRef, useState } from "react";
import { useAscii } from "@/lib/useAscii";

export default function AsciiPhoto({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(4 / 3);
  const [reveal, setReveal] = useState(false);
  useAscii(boxRef, canvasRef, src, { onReady: (img) => setRatio(img.naturalWidth / img.naturalHeight) });

  return (
    <figure className="ascii">
      <div
        className={reveal ? "ascii-box is-revealed" : "ascii-box"}
        ref={boxRef}
        style={{ aspectRatio: String(ratio), width: `min(100%, calc(72vh * ${ratio.toFixed(4)}))` }}
        onClick={() => setReveal((r) => !r)}
      >
        <img src={src} alt={alt} loading="lazy" />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <figcaption>
        {caption && <span dangerouslySetInnerHTML={{ __html: caption }} />}
        <span className="ascii-hint">hover or tap for the photo</span>
      </figcaption>
    </figure>
  );
}
