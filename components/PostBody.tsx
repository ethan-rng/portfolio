import AsciiPhoto from "@/components/AsciiPhoto";
import Photos from "@/components/Photos";
import Terminal from "@/components/Terminal";
import Video from "@/components/Video";
import type { Block } from "@/constants/types";

// Block strings come from constants/ (trusted, written by hand), so inline
// markup like <strong> and <a> is rendered as-is.
const html = (s: string) => ({ __html: s });

export default function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="body">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i} dangerouslySetInnerHTML={html(b.html)} />;
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((item, j) => <li key={j} dangerouslySetInnerHTML={html(item)} />)}
              </ul>
            );
          case "figure":
            return (
              <figure key={i} className={`fig--${b.variant}`}>
                <img src={b.src} alt={b.alt} loading="lazy" />
                {b.caption && <figcaption dangerouslySetInnerHTML={html(b.caption)} />}
              </figure>
            );
          case "video":
            return (
              <figure key={i}>
                <Video id={b.youtubeId} title={b.caption || "Video"} poster={b.poster} />
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
          case "photos":
            return (
              <figure key={i} className="fig--photos">
                <Photos photos={b.photos} />
                {b.caption && <figcaption dangerouslySetInnerHTML={html(b.caption)} />}
              </figure>
            );
          case "terminal":
            return <figure key={i}><Terminal title={b.title} lines={b.lines} /></figure>;
          case "ascii":
            return <AsciiPhoto key={i} src={b.src} alt={b.alt} caption={b.caption} />;
        }
      })}
    </div>
  );
}
