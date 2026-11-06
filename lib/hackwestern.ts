/**
 * Hack Western's link: the 2026 archive once it's live, the main site until then.
 * Checked when the site builds; the daily rebuild (.github/workflows/pages.yml)
 * picks the archive up on its own the day it goes up.
 */
const ARCHIVE = "https://archive.hackwestern.com/2026/";
const LIVE = "https://www.hackwestern.com/";

export async function hackWesternUrl(): Promise<string> {
  try {
    const res = await fetch(ARCHIVE, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(5000), cache: "force-cache" });
    return res.ok ? ARCHIVE : LIVE;
  } catch {
    return LIVE;
  }
}
