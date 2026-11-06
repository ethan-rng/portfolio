import type { Post } from "../types";
import { elsewhere } from "../photos";

/** Good meals, kept (blog). Photos + a terminal block. */
export const goodMeals: Post = {
  slug: "good-meals",
  title: "Good meals, kept",
  date: "2026-11-04",
  category: "blog",
  excerpt: "Some of these are mine, the rest were meals good enough to keep a picture of.",
  image: "/media/food-ramen.jpg",
  blocks: [
    { type: "p", html: elsewhere.note },
    { type: "ascii", src: "/media/food-ramen.jpg", alt: "A bowl of tonkotsu ramen with chashu pork, sesame and spring onion.", caption: "<code>tonkotsu.jpg</code>, in characters." },
    {
      type: "terminal",
      title: "~/food",
      lines: [
        { cmd: "ls ~/food/", out: elsewhere.photos.filter((p) => !p.portrait).map((p) => p.label).join("  ") },
        { cmd: "open *.jpg" },
      ],
    },
    { type: "photos", photos: elsewhere.photos.filter((p) => !p.portrait), caption: "Hover one to see it in colour." },
  ],
  back: [{ label: "all fun", href: "/blog/" }],
};
