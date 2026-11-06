import type { Link } from "./types";

/** Older versions of this site, linked from the blog. Newest first. */
export const archives: (Link & { note?: string })[] = [
  { label: "v0", href: "https://archive.ethan-rng.site/v0/", note: "the first version of this site, made pre-AI" },
];
