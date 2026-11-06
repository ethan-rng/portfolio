import type { Post } from "../types";
import { elsewhere } from "../photos";
import { reelPhotos } from "../hero";

/** Out of office (blog). An ASCII photo, polaroids and a terminal block. */
export const outOfOffice: Post = {
  slug: "out-of-office",
  title: "Out of office",
  date: "2026-11-03",
  category: "blog",
  excerpt: "Photos from trips, drawn the way the rest of this site sees them.",
  image: "/media/elsewhere-torii.jpg",
  blocks: [
    { type: "p", html: "Photos from trips, drawn the way the rest of this site sees them." },
    { type: "ascii", src: "/media/elsewhere-torii.jpg", alt: reelPhotos[0].alt, caption: reelPhotos[0].caption },
    {
      type: "terminal",
      title: "~/travel",
      lines: [
        { cmd: "ls ~/travel/", out: [...reelPhotos.filter((p) => p.src.includes("elsewhere")), elsewhere.photos[0]].map((p) => p.label).join("  ") },
        { cmd: "file karts.jpg", out: "karts.jpg: JPEG image data, go-karts, neon, after dark" },
      ],
    },
    {
      type: "photos",
      photos: [...reelPhotos.filter((p) => p.src.includes("elsewhere")), elsewhere.photos[0]].map((p) => ({ ...p, portrait: true })),
    },
  ],
  back: [{ label: "all posts", href: "/blog/" }],
};
