import type { Post } from "../types";

/** DeepSeek and the economics of open-source AI (writing, 2025-05-01). */
export const deepseekCase: Post = {
  slug: "deepseek-case",
  title: "DeepSeek and the economics of open-source AI",
  date: "2025-05-01",
  category: "writing",
  image: "/media/deepseek-ivey-thumb.jpg",
  excerpt: "An Ivey Publishing case on DeepSeek's open-source strategy and how open foundation models make money. Taught to 1,000+ students.",
  blocks: [
    {
      type: "p",
      html: "As a research assistant at Ivey Business School, I co-authored a published case study on DeepSeek's open-source AI strategy, <em>DeepSeek and Open-Source AI: Navigating the Path to Sustainable Monetization</em>. It's now taught to 1,000+ students across strategy, technology and finance courses."
    },
    {
      type: "p",
      html: "The case looks at a question that sounds simple and isn't: if you give the model away, how do you make money? It evaluates three monetization models for open-source foundation models and their financial feasibility. Alongside it, I benchmarked DeepSeek against ChatGPT on three use cases to inform an AI vendor choice, and found DeepSeek more token-efficient."
    }
  ],
  back: [
    {
      label: "read the case on ivey publishing",
      href: "https://www.iveypublishing.ca/s/product/deepseek-and-opensource-ai-navigating-the-path-to-sustainable-monetization/01tOF000008VT4LYAW"
    },
    {
      label: "all writing",
      href: "/writing/"
    }
  ]
};
