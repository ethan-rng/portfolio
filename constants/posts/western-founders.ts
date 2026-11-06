import type { Post } from "../types";

/**
 * Four years leading the projects portfolio at Western Founders Network (writing, 2024-09-01).
 * Club facts are from westernfoundersnetwork.com; Harbour Link from its repo
 * (github.com/ethan-rng/contactAppV2). The lessons are a first draft: edit them to match what happened.
 */
export const westernFounders: Post = {
  slug: "western-founders",
  title: "Four years running my uni's projects portfolio",
  date: "2024-09-01",
  category: "writing",
  image: "/media/wfn-projects.jpg",
  excerpt: "Four years leading the largest projects portfolio at Western University with 40+ students into their dream jobs, 5 at FAANG. Here's what I learned.",
  facts: [
    { label: "role", value: "VP Projects (two years), then Senior Advisor (two years)" },
    { label: "timeline", value: "2023-2026" },
    { label: "club", value: "400+ members, business, tech and entrepreneurship" },
    { label: "impact", value: "40+ students into their dream jobs, 5 at FAANG" },
  ],
  blocks: [
    {
      type: "p",
      html: 'For four years I led the projects portfolio at <a href="https://westernfoundersnetwork.com/">Western Founders Network</a>, the largest business, tech and entrepreneurship club at Western. Students join small teams and build real digital products over the school year, and for a lot of them that project is what gets them the interview. Over those four years, 40+ of them went on to land their dream jobs, 5 of them at FAANG. Here\'s what I learned running it.',
    },
    { type: "h2", text: "Context" },
    {
      type: "p",
      html: "WFN has 400+ members and runs 50+ events, including three case competitions: Pitch the Future, the Technology Consulting Competition and the Product Design Sprint. Projects is the part of the club where people build things instead of pitching them.",
    },
    {
      type: "p",
      html: "Student teams have a short runway. Everyone has midterms, recruiting season and a dozen other commitments, and the team turns over every spring. Most of the job was working with that, not against it.",
    },
    {
      type: "p",
      html: "I ran the portfolio as VP for two years, then stayed on as a senior advisor for two more, helping the next leads pick projects and keep teams on track.",
    },
    { type: "h2", text: "One project: Harbour Link" },
    {
      type: "p",
      html: 'Harbour Link was one of our 2024 projects: a contact app for people who meet a lot of people. Point your phone at someone and it recognises their face and pulls up their contact, with notes on where you met. Five students built it over one semester, from a Figma design to a working app, across 75 commits.',
    },
    {
      type: "p",
      html: 'The app is React Native on Expo, with screens for your network, recent contacts and a camera view. Behind it is a Django API for contacts and events, and a small face-recognition service built on OpenCV. The code is on <a href="https://github.com/ethan-rng/contactAppV2">GitHub</a>.',
    },
    { type: "h2", text: "What I learned" },
    {
      type: "ul",
      items: [
        "<strong>Scope is the whole job.</strong> A small project that ships beats an ambitious one that stalls in February. Cutting scope early was the most useful thing I did as a lead.",
        "<strong>Pick for follow-through.</strong> The best teammates weren't always the most experienced, they were the ones who showed up with something done every week.",
        "<strong>Demos over status updates.</strong> \"Show me what works\" surfaces problems that \"how's it going\" never does.",
        "<strong>Get a real user early.</strong> Projects with someone waiting on them finished. Projects built for an imagined user drifted.",
        "<strong>Write it down for next year.</strong> Every spring half the knowledge graduates. Short handover docs saved the next team weeks.",
        "<strong>Leading is unblocking.</strong> My most useful hours were spent clearing the way for teams, not writing their code.",
      ],
    },
  ],
  back: [{ label: "all writing", href: "/writing/" }],
};
