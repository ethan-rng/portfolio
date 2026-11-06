"use client";

/*
 * A thumbnail drawn in characters, like the in-post ASCII photos; the real image
 * shows on hover (the parent decides what counts as hover, via CSS).
 * It fills its box, so the box sets the shape.
 */
import { useRef } from "react";
import { useAscii } from "@/lib/useAscii";

export default function AsciiThumb({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAscii(boxRef, canvasRef, src, { font: (w) => (w < 240 ? 4.5 : w < 480 ? 5.5 : 6.5) });
  return (
    <div className={`ascii-thumb ${className}`} ref={boxRef}>
      <img src={src} alt={alt} loading="lazy" />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
