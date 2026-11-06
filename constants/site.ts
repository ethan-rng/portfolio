import type { Link } from "./types";

export const site = {
  name: "Ethan Rong",
  tagline: "Software Engineer",
  description: "Ethan Rong: software engineer building reliable infrastructure. CS at Western, business at Ivey.",
  email: "ethan.rong@gmail.com",
  resume: "/media/ethan-rong-resume.pdf",
  github: "https://github.com/ethan-rng",
  linkedin: "https://www.linkedin.com/in/ethanrong2004/",
};

/** Top navigation, in order. */
export const nav: Link[] = [
  { label: "home", href: "/" },
  { label: "tech. work", href: "/projects/" },
  { label: "writing", href: "/writing/" },
  { label: "fun", href: "/blog/" },
  { label: "resume", href: site.resume },
];

/** The "github / linkedin / resume" row under the hero. */
export const heroLinks: Link[] = [
  { label: "github", href: site.github },
  { label: "linkedin", href: site.linkedin },
  { label: "resume", href: site.resume },
];

/** Footer: socials on the left, the blog archive on the right. */
export const footer = {
  socials: [
    { label: "github", href: site.github },
    { label: "linkedin", href: site.linkedin },
    { label: "email", href: `mailto:${site.email}` },
  ] as Link[],
  archive: { label: "archive", href: "/blog/#archive" } as Link,
  /** The small credit line; Hack Western's link is filled in at build time (lib/hackwestern.ts). */
  inspiredBy: { daoho: { label: "daoho.dev", href: "https://www.daoho.dev/" }, hackWestern: "hack western" },
};
