"use client";

import { useEffect, useRef, useState } from "react";

/** "$ whoami" that answers back on hover. An easter egg; keep it quiet. */
export default function Kicker({ text, reply }: { text: string; reply: string }) {
  const [shown, setShown] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try { console.log("%cwagwan 👋", 'font: 12px "Geist Mono", monospace; color: #e08a3c'); } catch {}
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const typeTo = (target: string) => {
    if (timer.current) clearInterval(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(target); return; }
    timer.current = setInterval(() => {
      setShown((cur) => {
        if (cur === target) { if (timer.current) clearInterval(timer.current); return cur; }
        // backspace to the shared prefix, then type the rest
        let i = 0;
        while (i < cur.length && cur[i] === target[i]) i++;
        return cur.length > i ? cur.slice(0, -1) : target.slice(0, cur.length + 1);
      });
    }, 55);
  };

  return (
    <p className="kicker" onPointerEnter={() => typeTo(reply)} onPointerLeave={() => typeTo(text)}>
      {shown}
    </p>
  );
}
