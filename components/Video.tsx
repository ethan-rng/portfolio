"use client";

/*
 * A YouTube embed. With a poster, it starts as that still (a light, local
 * image instead of YouTube's player); clicking loads the player and starts it.
 */
import { useState } from "react";

export default function Video({ id, title, poster }: { id: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(!poster);
  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}${poster ? "?autoplay=1" : ""}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
          <img src={poster} alt="" />
          <span className="video-play" aria-hidden="true">[ &gt; play ]</span>
        </button>
      )}
    </div>
  );
}
