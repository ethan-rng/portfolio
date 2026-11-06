import type { Post } from "../types";

/** CityFlow (projects, 2026-05-30). */
export const cityflow: Post = {
  slug: "cityflow",
  title: "CityFlow",
  date: "2026-05-30",
  category: "projects",
  excerpt: "An on-device AI agent that turns local data into actionable insights for small businesses. 1st of 100+ teams at the NVIDIA Spark Hackathon.",
  image: "/media/cityflow-thumb.jpg",
  facts: [
    {
      label: "event",
      value: "NVIDIA Spark Hack Toronto"
    },
    {
      label: "result",
      value: "1st of 100+ teams, Economic System track"
    },
    {
      label: "stack",
      value: "Python, NVIDIA Nemotron, DGX Spark, LangChain, FastAPI"
    },
    {
      label: "demo",
      value: "Live-streamed to 700+ viewers"
    }
  ],
  blocks: [
    {
      type: "p",
      html: "CityFlow is an AI agent that runs entirely on-device on an NVIDIA DGX Spark and generates actionable insights for small businesses. It won the Economic System track out of 100+ teams, and we demoed it live during an NVIDIA livestream to 700+ viewers."
    },
    {
      type: "video",
      youtubeId: "CqZiFrRohGw",
      poster: "/media/cityflow-thumb.jpg",
      caption: "NVIDIA's winner spotlight from Spark Hack Toronto, featuring CityFlow."
    },
    {
      type: "p",
      html: "A full write-up of how it works is coming soon."
    }
  ],
  back: [
    {
      label: "all tech. work",
      href: "/projects/"
    }
  ]
};
