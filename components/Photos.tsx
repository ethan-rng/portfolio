import type { Photo } from "@/constants/types";

/** Polaroids: dashed frame, tilted, greyed out until you look at one. */
export default function Photos({ photos, wide = false }: { photos: Photo[]; wide?: boolean }) {
  return (
    <ul className={wide ? "photos photos--wide" : "photos"}>
      {photos.map((p) => (
        <li key={p.src} className={p.portrait ? "portrait" : undefined}>
          <figure>
            <img src={p.src} alt={p.alt} loading="lazy" />
            <figcaption>{p.label}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
