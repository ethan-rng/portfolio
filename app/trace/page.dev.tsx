import type { Metadata } from "next";
import TraceTool from "@/components/TraceTool";
import { heroPhotos } from "@/constants/hero";

export const metadata: Metadata = { title: "Trace", robots: { index: false } };

/**
 * Dev-only (the .dev.tsx name keeps it out of production builds, see next.config.ts):
 * drag the hero's ASCII outlines into place, then copy the numbers into constants/hero.ts.
 */
export default function Trace() {
  return <TraceTool photos={heroPhotos} />;
}
