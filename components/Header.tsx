"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/constants/site";

export default function Header() {
  const path = usePathname();
  // On home the header floats over the full-screen photo until you scroll past it.
  const overlay = path === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);
  const isCurrent = (href: string) =>
    href === "/" ? path === "/" : href.endsWith("/") && path.startsWith(href);

  return (
    <header className={overlay ? `header header--overlay${scrolled ? " is-scrolled" : ""}` : "header"}>
      <Link className="brand" href="/">
        {site.name.toLowerCase()}
      </Link>
      <nav aria-label="Primary">
        <ul className="menu">
          {nav.map((item) => (
            <li key={item.href}>
              {item.href.endsWith(".pdf") ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
