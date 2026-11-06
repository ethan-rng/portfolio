import type { Post } from "../types";

/** Interview rooms, off one PC (writing, 2026-02-08). */
export const interviewRooms: Post = {
  slug: "interview-rooms",
  title: "Interview rooms, off one PC",
  date: "2026-02-08",
  category: "writing",
  excerpt: "A self-hosted tool that gave every Hack Western candidate a disposable, isolated VS Code in their own browser. Built in two days.",
  image: "/media/interviews-cover.jpg",
  facts: [
    {
      label: "role",
      value: "Web organizer, Hack Western 13"
    },
    {
      label: "timeline",
      value: "Two days, idea to running interviews"
    },
    {
      label: "stack",
      value: "Docker, code-server, Tailscale, Bash"
    },
    {
      label: "hosting",
      value: "One desktop, every room"
    }
  ],
  blocks: [
    {
      type: "p",
      html: "Live technical interviews used to mean candidates coding on an interviewer's laptop: unfamiliar editor, unfamiliar keyboard, and no way for the interviewer to take notes on the same machine. This gave every candidate a disposable workspace in their own browser instead."
    },
    {
      type: "h2",
      text: "Context"
    },
    {
      type: "p",
      html: "Every year the web team runs a live technical interview built around React and Tailwind. To avoid leaking the questions, candidates had always written code on an interviewer's laptop, adjusting to someone else's editor, settings and keyboard inside a thirty-minute window."
    },
    {
      type: "p",
      html: "The goal was narrow on purpose: candidates code on their own laptop in a standard editor, they're isolated from each other but can still run a dev server, and interviewers keep remote access to every room."
    },
    {
      type: "figure",
      src: "/media/interviews-candidate.jpg",
      alt: "A candidate's browser showing VS Code running inside an interview room.",
      variant: "plain"
    },
    {
      type: "h2",
      text: "The shape of it"
    },
    {
      type: "p",
      html: "Everything runs on one desktop. A Tailscale Funnel puts that machine on the public internet without touching the home router, each room is mapped to its own path and local port, and an HTTP proxy sits between those paths and the Docker containers that hold the interviews. Interviewers get the root path and can see every room. Candidates get exactly one."
    },
    {
      type: "figure",
      src: "/media/interviews-architecture.png",
      alt: "Architecture diagram: a client connects through a Tailscale Funnel to a PC, where interviewer and candidate paths pass through an HTTP proxy into separate Docker containers for room1 and room2.",
      variant: "diagram",
      caption: "Client to funnel to proxy to container. The proxy exists because of the path prefix, which is the part that broke first."
    },
    {
      type: "h2",
      text: "Rooms, not a container per candidate"
    },
    {
      type: "p",
      html: "A container per interview was too expensive in memory, so a fixed pool of rooms gets reused. Assigning a candidate clones a fresh copy of the evaluation, mounts it into a room and rotates that room's password, which is also what stops anyone rejoining after their slot. Reassigning someone restores their previous code, which matters when a connection drops mid-interview."
    },
    {
      type: "figure",
      src: "/media/interviews-rooms.jpg",
      alt: "Terminal output of the interview list command, showing room1 occupied with a URL, password, PID and running status, and room2 free.",
      variant: "plain",
      caption: "<code>interview list</code>: who is in which room, and what's still free."
    },
    {
      type: "p",
      html: "One command creates the workspace, reclaims permissions, generates a password, starts the proxy for that port, installs dependencies inside the container and prints the link to send."
    },
    {
      type: "figure",
      src: "/media/interviews-assign.jpg",
      alt: "Terminal output of interview assign: creating a workspace, reclaiming permissions, generating a password, starting the proxy, installing dependencies, then printing the room URL and password.",
      variant: "plain",
      caption: "One command from an empty room to a link you can paste into the chat."
    },
    {
      type: "h2",
      text: "What broke, and what's next"
    },
    {
      type: "p",
      html: "Serving rooms under a path prefix broke the apps inside them twice over. The React router read the prefix as a route, and asset requests resolved against the wrong base, so the proxy strips the prefix on the way in and Vite's base path is injected per container at runtime."
    },
    {
      type: "p",
      html: "Self-hosting was the fun part and also the weak point: a home network drop or a reboot meant falling back to the old laptop method mid-schedule. A serverless container runtime would trade the fun for reliability. The core logic is also Bash, which stopped scaling with the complexity."
    }
  ],
  back: [
    {
      label: "full write-up on medium",
      href: "https://medium.com/hack-western/we-ran-hack-western-interviews-off-my-pc-heres-how-we-built-it-in-two-days-b7d0d601a853"
    },
    {
      label: "all writing",
      href: "/writing/"
    }
  ]
};
