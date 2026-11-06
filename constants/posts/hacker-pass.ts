import type { Post } from "../types";

/** The hacker pass (projects, 2025-11-21). */
export const hackerPass: Post = {
  slug: "hacker-pass",
  title: "The hacker pass",
  date: "2025-11-21",
  category: "projects",
  excerpt: "Apple and Google Wallet passes for Hack Western, plus the approval gate that stopped anyone from minting a working one.",
  image: "/media/hackwestern-thumb.jpg",
  facts: [
    {
      label: "role",
      value: "Web organizer, Hack Western"
    },
    {
      label: "timeline",
      value: "Hack Western 12 → 13"
    },
    {
      label: "stack",
      value: "Next.js, tRPC, Drizzle, Cloudflare R2"
    },
    {
      label: "impact",
      value: "600+ badges replaced for 500+ hackers"
    }
  ],
  blocks: [
    {
      type: "p",
      html: "Every accepted hacker generates a pass from their dashboard: an Apple <code>.pkpass</code> served from R2, or a Google Wallet object signed through a service account. The QR on it is their identity for check-in, 9 meals, 13 events and the scavenger hunt."
    },
    {
      type: "h2",
      text: "Context"
    },
    {
      type: "p",
      html: "Hack Western's site carries the whole hacker lifecycle: application, review, acceptance, then the dashboard people use during the event. The wallet pass is where the digital half meets the physical one. It's what someone holds up at a door, a meal line, or a workshop table."
    },
    {
      type: "p",
      html: "Because the same QR drives check-in and the points system, the pass isn't just a convenience. It's a credential, and it needed to behave like one."
    },
    {
      type: "h2",
      text: "Passes"
    },
    {
      type: "p",
      html: "The two platforms want different things. Google's pass is a generic object created against an issuer through a service-account JWT. Apple's is a signed <code>.pkpass</code> bundle, which the site stores in Cloudflare R2, handing back the newest one for that hacker. Both start from the same user record and the same generated QR."
    },
    {
      type: "p",
      html: "My work here was the manual pass creation path and, later, the gating around it. The initial QR and wallet plumbing was a teammate's."
    },
    {
      type: "figure",
      src: "/media/pass-flow.png",
      alt: "Flow diagram: the dashboard calls qrRouter.generate with a wallet type, which runs isUserApprovedForEvent. An unapproved user gets a 403. An approved user gets a QR encoding their user id, then either the newest Apple pkpass from R2 or a Google generic pass object signed with a service-account JWT.",
      variant: "diagram",
      caption: "One record in, two very different pass formats out."
    },
    {
      type: "h2",
      text: "The hole, and closing it"
    },
    {
      type: "p",
      html: "The QR encodes a user id and nothing more, and generation only required being signed in. An applicant who was still pending, rejected or waitlisted could produce a fully working pass. The scan endpoint checked that the <em>scanner</em> was an organizer, but never the status of the person being scanned, so scanning an unapproved pass still awarded points, meals and redemptions."
    },
    {
      type: "p",
      html: "Closing it meant one shared approval predicate rather than two separate checks that could drift, applied at both the generate and the scan boundary, plus tests over the scavenger hunt flow that depended on it."
    },
    {
      type: "figure",
      src: "/media/pass-gate.png",
      alt: "Before and after diagram. Before: generate only required a signed-in user and scan only checked the scanner was an organizer. After: both endpoints pass through one isUserApprovedForEvent predicate, which allows accepted or confirmed applications plus organizers and sponsors.",
      variant: "diagram",
      caption: "The same two endpoints, before and after. The gate is one predicate, not two checks that can drift apart."
    },
    {
      type: "h2",
      text: "The rest of the loop"
    },
    {
      type: "p",
      html: "The pass only matters because of what it unlocks, and most of that was the same stretch of work: the scavenger hunt endpoints, the scan table, redemptions and prize quantities, the backend that turns a scanned QR into points somebody can spend."
    }
  ],
  back: [
    {
      label: "source on github",
      href: "https://github.com/hackwestern/hackwestern"
    },
    {
      label: "all tech. work",
      href: "/projects/"
    }
  ]
};
