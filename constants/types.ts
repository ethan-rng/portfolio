/** Shared shapes for everything in constants/. */

export type Category = "projects" | "writing" | "blog";

export type Link = { label: string; href: string };

/** One line of the hero timeline: "company, role, team". */
export type TimelineRow = {
  when: string;
  org: string;
  role: string;
  /** Rendered dimmed after the role. Optional. */
  detail?: string;
  /** A sentence or two under the row (home page only). Inline HTML allowed. */
  blurb?: string;
  /** "read more" link after the blurb. */
  href?: string;
};

export type Photo = {
  src: string;
  /** Describe the photo; these carry meaning, so don't leave it empty. */
  alt: string;
  /** Filename-style caption, e.g. "torii.jpg". */
  label: string;
  /** Optional one-line caption, shown under the hero reel. */
  caption?: string;
  portrait?: boolean;
};

/**
 * A stretch of a hero photo that renders as moving ASCII: a road, a walkway,
 * the rim of a bowl. Coordinates are fractions of the photo (0..1), so they
 * hold however the photo is cropped to the screen.
 */
export type Flow = {
  /** The centre line, in the direction things move. */
  points: [number, number][];
  /** Band width as a fraction of the photo's width; [start, end] tapers it (for perspective). Ignored with `shape`. */
  width?: number | [number, number];
  /**
   * An outline (fractions of the photo) to fill with ASCII, for areas a band
   * can't follow (a bridge deck, a lantern). `points` then only sets which way
   * the characters stream.
   */
  shape?: [number, number][];
  /**
   * With `shape`: let the outline snap to the photo's real edges. Cells within a
   * couple of cells of the outline are kept or dropped by colour, growing out from
   * the inside. The number is how different neighbouring cells may be (0..1, default 0.09); false turns it off.
   */
  snap?: number | false;
  /** Leave out cells whose photo colour is grey (low saturation), blue, green (plants in the way), or anything but green (for plants only). */
  skip?: ("gray" | "blue" | "green" | "nongreen")[];
  /** How dark the bed under the characters is, 0..1 (default 0.5). Raise it where the photo is bright and the characters get lost. */
  bed?: number;
  /** Pixels per second along the path at a 1000px-tall screen. Negative runs backwards. */
  speed: number;
  /** Join the last point back to the first (rings, loops). */
  closed?: boolean;
  /** "light" for bright areas like sky: pale bed, dark characters. Default "dark". */
  tone?: "dark" | "light";
};

export type HeroPhoto = Photo & {
  /** Point of the photo kept in view when cropped to the screen, like object-position. */
  focus?: [number, number];
  flows: Flow[];
  /** Where flows stop, e.g. a person on the road: boxes [x0, y0, x1, y1] or outlines [[x, y], ...], in fractions. */
  holes?: ([number, number, number, number] | [number, number][])[];
};

/** One prompt and/or its output in a terminal block. */
export type TermLine = { cmd?: string; out?: string };

/**
 * Post bodies are a list of blocks. Strings marked `html` may contain inline
 * markup (<strong>, <em>, <code>, <a>) and are rendered as-is, so only put
 * trusted content in them.
 */
export type Block =
  | { type: "p"; html: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | {
      type: "figure";
      src: string;
      alt: string;
      caption?: string;
      /** plain: screenshot; diagram: line art, inverted for the dark page; cutout: already transparent. */
      variant: "plain" | "diagram" | "cutout";
    }
  /** `poster`: a local still, drawn in characters until the video is played */
  | { type: "video"; youtubeId: string; caption: string; poster?: string }
  /** Polaroids, like the "elsewhere" strip. */
  | { type: "photos"; photos: Photo[]; caption?: string }
  /** A typed-out shell session; plays when scrolled into view. */
  | { type: "terminal"; title?: string; lines: TermLine[] }
  /** A photo drawn in characters; hover (or tap) shows the real one. */
  | { type: "ascii"; src: string; alt: string; caption?: string };

export type Post = {
  /** URL segment: /<slug>/ */
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-08-28". Sorts the lists. */
  date: string;
  category: Category;
  /** One or two lines, shown in the lists. */
  excerpt: string;
  /** Thumbnail on the Projects page, under public/. */
  image?: string;
  /** The image at the top of the article, if not `image` (e.g. a tighter crop of it); false for none, when the post places it itself. */
  cover?: string | false;
  /** The label/value grid at the top of a post. */
  facts?: { label: string; value: string }[];
  blocks: Block[];
  /** Links at the end of the post. */
  back: Link[];
};
