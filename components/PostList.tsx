import Link from "next/link";
import AsciiThumb from "@/components/AsciiThumb";
import type { Post } from "@/constants/types";
import { monthYear, year } from "@/lib/format";

type Variant = "home" | "rows" | "cards";

export default function PostList({ posts, variant = "rows", dateFormat = "year", ascii = false }: {
  posts: Post[];
  variant?: Variant;
  dateFormat?: "year" | "month";
  /** cards only: draw the thumbnails in characters, the real image on hover */
  ascii?: boolean;
}) {
  const cls = variant === "home" ? "posts posts--home" : variant === "cards" ? "posts posts--cards" : "posts";
  return (
    <ul className={cls}>
      {posts.map((p) => (
        <li className="post-row" key={p.slug}>
          {variant === "cards" && p.image && (
            <Link className="post-thumb" href={`/${p.slug}/`} tabIndex={-1} aria-hidden="true">
              {ascii ? <AsciiThumb src={p.image} /> : <img src={p.image} alt="" loading="lazy" />}
            </Link>
          )}
          <time className="post-date" dateTime={p.date}>
            {dateFormat === "month" ? monthYear(p.date) : year(p.date)}
          </time>
          <h3 className="post-title">
            <Link href={`/${p.slug}/`}>{p.title}</Link>
          </h3>
          <p className="post-excerpt">{p.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
