import type { Post } from "../types";

/** Agentic AI Infra @ Meta (projects, 2026-08-28). */
export const mlgkAutopilot: Post = {
  slug: "mlgk-autopilot",
  title: "Agentic AI Infra @ Meta",
  date: "2026-08-28",
  category: "projects",
  excerpt: "An AI agent that reads failed GPU jobs and writes the rules to stop them. 6 policies, 12K+ GPU hours and $13K+ saved in six weeks.",
  image: "/media/mlgk-thumb-cutout.png",
  cover: "/media/mlgk-cover-cutout.png", // the same, without the padding the list crop needs
  facts: [
    {
      label: "role",
      value: "SRE intern, Meta (ads monetization)"
    },
    {
      label: "timeline",
      value: "Summer 2026, six weeks in production"
    },
    {
      label: "stack",
      value: "Hive, serverless agents, SQLite, Next.js"
    },
    {
      label: "impact",
      value: "6 policies · 12K+ GPU hours · $13K+"
    }
  ],
  blocks: [
    {
      type: "p",
      html: "Every ML job at Meta passes a gatekeeper before it gets a GPU, which checks it against rules (<em>policies</em>) so jobs that are going to crash don't waste capacity. Writing those policies was slow, manual work. Autopilot does it instead: it reads failed jobs every day and drafts the policies itself."
    },
    {
      type: "h2",
      text: "Context"
    },
    {
      type: "p",
      html: "Thousands of jobs a day (model retraining, LLM training, notebooks) go through the gatekeeper, about 1.5M GPU requests in all. It works well, as long as someone has written a policy for the failure in question."
    },
    {
      type: "p",
      html: "That was the gap. Finding a pattern worth a policy meant digging through failed jobs by hand, so it rarely felt worth the time. Policies got written after a service launched, not before, and usually only once a problem had grown big enough to demand attention."
    },
    {
      type: "figure",
      src: "/media/mlgk-before-after-cutout.png",
      alt: "Before Autopilot: engineering time, a reactive process and a big blast radius. After: runs autonomously, scans GPU job errors daily, and prioritizes patterns seen more than 1,000 times a day.",
      variant: "cutout",
      caption: "The three problems, and what Autopilot changes about each."
    },
    {
      type: "h2",
      text: "The shape of it"
    },
    {
      type: "p",
      html: "Three parts. A daily pipeline collects failed GPU jobs, groups them by error and ranks them by cost. An agentic layer turns the worst ones into policies. Storage keeps the results somewhere on call can review them: code review, a small database, and a dashboard."
    },
    {
      type: "figure",
      src: "/media/mlgk-architecture-cutout.png",
      alt: "Architecture: a Hive table of failed GPU jobs feeds an ETL pipeline and a daily cron job, which runs a proposal agent and then a policy agent; policies are published to code review, a dashboard and SQLite.",
      variant: "cutout",
      caption: "Source of truth, agents, storage. It only runs once a day, so the pipeline can afford to do the expensive joins."
    },
    {
      type: "h2",
      text: "What broke"
    },
    {
      type: "p",
      html: "I went on call for it after launch. Three things broke:"
    },
    {
      type: "ul",
      items: [
        "<strong>It ran out of memory.</strong> The policy agent crashed compiling the codebase at 32GB. Doubling its RAM would have taken capacity other teams needed, so it went to 48GB, with a new alert for memory pressure above 90%.",
        "<strong>It kept rediscovering policies.</strong> New policies take a while to reach production, so the agents kept finding and proposing the same ones. Proposals are now deduplicated by a hash of the error message.",
        "<strong>It triggered itself.</strong> Exploring its dev machine, an agent called its own trigger and started a loop. That's now blocked twice over: instructions telling it not to, and hard guards in code."
      ]
    },
    {
      type: "figure",
      src: "/media/mlgk-oom-cutout.png",
      alt: "Memory graph spiking past the limit, next to the trade-off between a small increase to 48GB and a large one to 64GB, and the solution: 48GB plus a new alert.",
      variant: "cutout",
      caption: "The out-of-memory fix and its trade-off. (Illustrative graph, not the real one.)"
    },
    {
      type: "h2",
      text: "Results"
    },
    {
      type: "p",
      html: "In six weeks, Autopilot wrote <strong>6 policies</strong> end to end, avoided <strong>12K+ hours</strong> of wasted GPU time, and saved about <strong>$13K+</strong> a year in compute."
    },
    {
      type: "figure",
      src: "/media/mlgk-impact-cutout.png",
      alt: "Impact over six weeks: $13K in annualized infrastructure cost savings, 12K hours of GPU wall time, and 6 policies generated end to end.",
      variant: "cutout",
      caption: "Six weeks in, measured against what the policies caught in shadow mode."
    }
  ],
  back: [
    {
      label: "full presentation on google slides",
      href: "https://docs.google.com/presentation/d/1huS6VJuQrQnLn7hItfJ5oB0s4RiSEEiwUySmMh4gAbc/edit?usp=sharing"
    },
    {
      label: "all tech. work",
      href: "/projects/"
    }
  ]
};
