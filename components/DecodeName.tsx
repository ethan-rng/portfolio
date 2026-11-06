"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@01";

/** The name scrambles in letter by letter when it first scrolls into view. */
export default function DecodeName({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const order = [...text].map((_, i) => 180 + i * 70 + Math.random() * 220);
      const frame = (t: number) => {
        const dt = t - start;
        let done = true;
        setShown([...text].map((c, i) => {
          if (c === " " || dt >= order[i]) return c;
          done = false;
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }).join(""));
        if (!done) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      run();
    }, { threshold: 1 });
    io.observe(ref.current!);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [text]);

  return (
    <h1 className="name" ref={ref} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </h1>
  );
}
