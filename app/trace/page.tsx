import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TraceTool from "@/components/TraceTool";
import { heroPhotos } from "@/constants/hero";

export const metadata: Metadata = { title: "Trace", robots: { index: false } };

/** Dev-only: drag the hero's ASCII outlines into place, then copy the numbers into constants/hero.ts. */
export default function Trace() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TraceTool photos={heroPhotos} />;
}
