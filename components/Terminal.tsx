"use client";

/*
 * A terminal window. With `lines` it types out a scripted session once it
 * scrolls into view. With `entries` it also takes commands (try `help`).
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { Link, TermLine } from "@/constants/types";

export type TermEntry = { slug: string; title: string; date: string };

type Printed = { cmd?: string; out?: string };


export default function Terminal({ title = "zsh", lines = [], entries, archives = [] }: {
  title?: string;
  lines?: TermLine[];
  /** Posts that `ls` lists and `open` goes to. Passing this makes the terminal interactive. */
  entries?: TermEntry[];
  /** Old versions of the site, for `archive`. */
  archives?: Link[];
}) {
  const router = useRouter();
  const PROMPT = `${title.startsWith("~") ? title : "~"} $`;
  const interactive = !!entries;
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Server render shows the whole script; the client replays it.
  const [printed, setPrinted] = useState<Printed[]>(lines);
  const [typing, setTyping] = useState<string | null>(null);
  const [ready, setReady] = useState(true);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);

  useEffect(() => {
    if (!lines.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPrinted([]); setReady(false);
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    const play = async () => {
      for (const l of lines) {
        if (l.cmd) {
          for (let k = 1; k <= l.cmd.length; k++) {
            if (cancelled) return;
            setTyping(l.cmd.slice(0, k));
            await wait(28 + Math.random() * 45);
          }
          await wait(220);
        }
        if (cancelled) return;
        setTyping(null);
        setPrinted((p) => [...p, l]);
        await wait(l.out ? 260 : 80);
      }
      setReady(true);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); play(); }
    }, { threshold: 0.3 });
    io.observe(boxRef.current!);
    return () => { cancelled = true; io.disconnect(); timers.forEach(clearTimeout); };
  }, [lines]);

  useEffect(() => {
    const body = boxRef.current?.querySelector(".term-body");
    if (body) body.scrollTop = body.scrollHeight;
  }, [printed, typing]);

  const slugs = entries?.map((e) => e.slug) ?? [];

  const run = (raw: string): string | null => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd) {
      case "": return null;
      case "help":
        return [
          "ls               list posts",
          "open <post>      read one (cat and cd work too)",
          "archive          older versions of this site",
          "whoami, date, echo, clear",
        ].join("\n");
      case "ls":
        if (!entries?.length) return "(empty)";
        return entries.map((e) => `${e.date}  ${e.slug.padEnd(18)} ${e.title}`).join("\n");
      case "open": case "cat": case "cd": case "less": {
        if (!arg || arg === "~" || arg === "..") { if (cmd === "cd") router.push("/"); return cmd === "cd" ? null : `usage: ${cmd} <post>`; }
        const slug = arg.replace(/^\.?\//, "").replace(/\/$/, "").replace(/\.md$/, "");
        if (!slugs.includes(slug)) return `${cmd}: ${arg}: no such post (try ls)`;
        router.push(`/${slug}/`);
        return `opening ${slug}...`;
      }
      case "archive":
        if (!archives.length) return "nothing archived yet";
        return archives.map((a) => `${a.label.padEnd(6)} ${a.href}`).join("\n") + "\n\nopen one with: archive <version>";
      case "whoami": return "ethan rong";
      case "date": return new Date().toString();
      case "echo": return arg;
      case "pwd": return "/home/ethan/blog";
      case "wagwan": return "wagwan 👋";
      case "sudo": return "nice try.";
      case "exit": router.push("/"); return "logout";
      default: return `zsh: command not found: ${cmd}`;
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const raw = input;
      setInput(""); hIdx.current = -1;
      if (raw.trim()) history.current.unshift(raw);
      const [cmd, ...rest] = raw.trim().split(/\s+/);
      if (cmd === "clear") { setPrinted([]); return; }
      if (cmd === "archive" && rest[0]) {
        const a = archives.find((x) => x.label === rest[0]);
        setPrinted((p) => [...p, { cmd: raw, out: a ? `opening ${a.href}...` : `archive: ${rest[0]}: not found` }]);
        if (a) window.location.href = a.href;
        return;
      }
      const out = run(raw);
      setPrinted((p) => [...p, { cmd: raw, out: out ?? undefined }]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      hIdx.current = Math.max(-1, Math.min(h.length - 1, hIdx.current + (e.key === "ArrowUp" ? 1 : -1)));
      setInput(hIdx.current < 0 ? "" : h[hIdx.current]);
    } else if (e.key === "Tab") {
      // complete post slugs after open/cat/cd
      const m = input.match(/^(\s*(?:open|cat|cd|less)\s+)(\S*)$/);
      if (!m) return;
      e.preventDefault();
      const hits = slugs.filter((s) => s.startsWith(m[2]));
      if (hits.length === 1) setInput(m[1] + hits[0]);
      else if (hits.length > 1) setPrinted((p) => [...p, { cmd: input, out: hits.join("  ") }]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault(); setPrinted([]);
    }
  };

  return (
    <div className="term" ref={boxRef} onClick={() => interactive && inputRef.current?.focus({ preventScroll: true })}>
      <div className="term-bar" aria-hidden="true">
        <span className="term-dots"><i /><i /><i /></span>
        <span>{title}</span>
        <span />
      </div>
      <div className="term-body" role="log" aria-live="polite">
        {printed.map((l, i) => (
          <div key={i}>
            {l.cmd !== undefined && <div className="term-cmd"><span className="term-ps">{PROMPT}</span> {l.cmd}</div>}
            {l.out && <pre className="term-out">{l.out}</pre>}
          </div>
        ))}
        {typing !== null && <div className="term-cmd"><span className="term-ps">{PROMPT}</span> {typing}<span className="term-caret" /></div>}
        {interactive && ready && (
          <label className="term-cmd term-input">
            <span className="term-ps">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              aria-label="Terminal command"
              autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
            />
          </label>
        )}
        {!interactive && ready && typing === null && <div className="term-cmd"><span className="term-ps">{PROMPT}</span> <span className="term-caret" /></div>}
      </div>
    </div>
  );
}
