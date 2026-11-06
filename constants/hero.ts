import type { Flow, HeroPhoto, Photo, TimelineRow } from "./types";

export const hero = {
  /** Above the name. Hovering it retypes this as `easterEgg`. */
  kicker: "$ whoami",
  easterEgg: "$ wagwan",
  /** The first line under the kicker, in place of the bare name. */
  greeting: "Hi, I'm Ethan Rong.",
  /** Inline HTML allowed (links). */
  intro:
    'I work in infra between Toronto and the Bay Area, and study CS @ <a href="https://www.uwo.ca/">Western</a> and business @ <a href="https://www.ivey.uwo.ca/">Ivey</a>. Off the clock, I like to cook and travel.',
  /** More paragraphs under the intro, below the photos. Inline HTML allowed. */
  about: [
    'Most of my work is on the systems underneath other systems: the gatekeepers, schedulers and pipelines that decide whether a job gets a GPU, or whether a thousand hackers get through the door on time.',
    'Outside of internships I build for <a href="/projects/">Hack Western</a> and at hackathons, most recently <a href="/cityflow/">CityFlow</a>, an on-device agent that took 1st of 100+ teams at NVIDIA Spark Hack Toronto.',
    'The rest goes in the <a href="/blog/">blog</a>: food, trips, and whatever else I felt like rendering in ASCII.',
  ],
};

export const experience: TimelineRow[] = [
  { when: "next", org: "Wealthsimple", role: "SWE Intern", detail: "Platform Engineering" },
  {
    when: "2026", org: "Meta", role: "SRE Intern", detail: "AI Infrastructure",
    blurb: "Built an AI agent that reads failed GPU jobs and writes the policies that stop them: 6 policies, 12K+ GPU hours and $13K+ saved in six weeks.",
    href: "/mlgk-autopilot/",
  },
  { when: "2025", org: "Meta", role: "SRE Intern", detail: "Reliability Infrastructure" },
  {
    when: "2025", org: "Western University", role: "Research Assistant", detail: "Ivey",
    blurb: "Co-authored a published Ivey case on DeepSeek's open-source strategy and how open models make money. Taught to 1,000+ students.",
    href: "/deepseek-case/",
  },
];

/** Same format as experience. */
export const education: TimelineRow[] = [
  { when: "2027", org: "Western University", role: "BSc Computer Science" },
  { when: "2027", org: "Ivey Business School", role: "Honors Business Administration" },
];

/** The ASCII photo reel on the right of the hero, in order. */
export const reelPhotos: Photo[] = [
  { src: "/media/elsewhere-torii.jpg", label: "torii.jpg", caption: "A long row of vermilion torii gates, late afternoon.", alt: "Leaning against one of a long row of vermilion torii gates." },
  { src: "/media/elsewhere-karts.jpg", label: "karts.jpg", caption: "Go-karts threading through a neon-lit street after dark.", alt: "Go-karts lined up on a neon-lit city street at night." },
  { src: "/media/food-ramen.jpg", label: "tonkotsu.jpg", caption: "Tonkotsu ramen: chashu, sesame, spring onion.", alt: "A bowl of tonkotsu ramen with chashu pork, sesame and spring onion." },
  { src: "/media/elsewhere-walkway.jpg", label: "walkway.jpg", caption: "An elevated green walkway under a big, cloudy sky.", alt: "Walking along an elevated green walkway under a bright, cloudy sky." },
  { src: "/media/elsewhere-mirror.jpg", label: "mirror.jpg", caption: "Fitting-room mirror check, denim over white.", alt: "A fitting-room mirror shot in a denim jacket over a white shirt." },
];

/** A ring, as flow points: centre (cx, cy) and radii, all as fractions of the photo. */
const ring = (cx: number, cy: number, rx: number, ry: number, n = 28): Flow["points"] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

/**
 * The full-screen hero, in order. Each photo shows as itself, except along its
 * `flows`, which run as moving ASCII. Use big photos here (2000px+ on the long
 * side); they fill the screen. Strip metadata (EXIF, GPS) before adding one.
 */
export const heroPhotos: HeroPhoto[] = [
  {
    src: "/media/hero-bridge.jpg",
    label: "kyoto.jpg",
    caption: "Crossing a footbridge in Kyoto at noon. Apr 2025.",
    alt: "Walking away from the camera along a rusty, mint-green pedestrian bridge in Kyoto under a big, cloudy sky.",
    focus: [0.5, 0.64],
    flows: [
      // the deck, streaming away toward the far end
      { points: [[0.4, 1.02], [0.49, 0.62]], shape: [[0.06, 1.01], [0.44, 0.624], [0.553, 0.622], [0.6, 0.7], [0.64, 0.8], [0.675, 0.9], [0.7, 1.01]], speed: 70 },
      // the left wall and its railing
      {
        points: [[0.0, 0.9], [0.43, 0.56]],
        // top edge traced along the rusty top beam, out to the wall's far end
        shape: [[0, 0.324], [0.05, 0.338], [0.1, 0.36], [0.15, 0.377], [0.2, 0.396], [0.25, 0.413], [0.29, 0.435], [0.36, 0.475], [0.424, 0.504], [0.43, 0.62], [0.44, 0.624], [0.06, 1.01], [0, 1.01]],
        speed: 55,
      },
      // the right railing and handrail
      {
        points: [[1.0, 0.9], [0.55, 0.6]],
        // top edge along the top of the silver handrail; inner edge along the base of the panels
        shape: [
          [0.548, 0.565], [0.6, 0.578], [0.65, 0.599], [0.7, 0.622], [0.75, 0.649], [0.8, 0.674], [0.85, 0.705], [0.9, 0.73], [0.95, 0.759], [1.01, 0.787],
          [1.01, 1.01], [0.7, 1.01], [0.675, 0.9], [0.64, 0.8], [0.6, 0.7], [0.553, 0.622],
        ],
        snap: false, // the grey handrail would snap away from the mint panels; the trace is tight enough
        speed: 55,
      },
      // the top of the bridge, where it crests at the far end
      { points: [[0.44, 0.6], [0.6, 0.58]], shape: [[0.426, 0.589], [0.49, 0.571], [0.55, 0.556], [0.553, 0.622], [0.44, 0.628], [0.43, 0.625]], speed: 35 },
      // the second bridge, off to the right
      { points: [[0.62, 0.575], [1.01, 0.56]], shape: [[0.55, 0.556], [0.75, 0.548], [1.01, 0.541], [1.01, 0.598], [0.85, 0.61], [0.75, 0.625], [0.7, 0.627], [0.6, 0.62]], snap: false, speed: 35 },
      // the steel stairs down from the second bridge, far right
      { points: [[0.83, 0.62], [1.0, 0.68]], shape: [[0.83, 0.618], [0.9, 0.603], [1.01, 0.6], [1.01, 0.69], [0.95, 0.668], [0.88, 0.645], [0.83, 0.648]], snap: false, speed: 30 },
    ],
    // me, traced close around the hair, collar and shoulders
    holes: [[
      [0.244, 0.455], [0.284, 0.438], [0.338, 0.445], [0.362, 0.472], [0.353, 0.512], [0.358, 0.543], [0.385, 0.555],
      [0.422, 0.586], [0.442, 0.64], [0.44, 0.78], [0.405, 0.79], [0.4, 1.01], [0.2, 1.01], [0.2, 0.85], [0.16, 0.84],
      [0.128, 0.82], [0.132, 0.65], [0.142, 0.606], [0.16, 0.587], [0.196, 0.561], [0.23, 0.547], [0.24, 0.522], [0.256, 0.508],
    ]],
  },
  {
    src: "/media/hero-karts.jpg",
    label: "osaka.jpg",
    caption: "Street karting through Osaka after dark. Apr 2025.",
    alt: "A line of street karts with green underglow on a narrow, sign-lit Osaka street at night.",
    focus: [0.5, 0.42],
    flows: [
      // the lit signs up the left-hand side, flickering downward
      { points: [[0.39, 0.03], [0.39, 0.21]], shape: [[0.352, 0.049], [0.444, 0.038], [0.429, 0.188], [0.334, 0.196]], snap: false, speed: 25 }, // the big mint sign, its tilted panel
      { points: [[0.31, 0.22], [0.3, 0.46]], shape: [[0.296, 0.225], [0.34, 0.237], [0.313, 0.429], [0.278, 0.427]], snap: false, speed: 25 }, // the tall sign, leaning with the camera
      { points: [[0.072, 0.25], [0.072, 0.37]], shape: [[0.031, 0.253], [0.099, 0.256], [0.098, 0.371], [0.029, 0.368]], snap: false, speed: 25 },
      { points: [[0.232, 0.31], [0.232, 0.375]], shape: [[0.214, 0.308], [0.248, 0.307], [0.247, 0.374], [0.213, 0.374]], snap: false, speed: 20 },
      { points: [[0.125, 0.0], [0.125, 0.05]], shape: ring(0.125, 0.025, 0.032, 0.022), snap: false, speed: 20 }, // the street lamp
      { points: [[0.4, 0.27], [0.4, 0.335]], shape: [[0.335, 0.268], [0.42, 0.27], [0.47, 0.31], [0.47, 0.335], [0.4, 0.33], [0.335, 0.31]], snap: false, speed: 20 }, // shopfront
      // and on down the street: the big white panel, the hanging signs, the tall banner, the neon
      { points: [[0.72, 0.0], [0.69, 0.135]], shape: [[0.678, 0], [0.764, 0], [0.733, 0.131], [0.656, 0.138]], snap: false, speed: 20 },
      { points: [[0.52, 0.215], [0.52, 0.248]], shape: [[0.494, 0.216], [0.553, 0.215], [0.546, 0.247], [0.494, 0.248]], snap: false, speed: 18 },
      { points: [[0.575, 0.273], [0.575, 0.298]], shape: [[0.552, 0.273], [0.598, 0.273], [0.597, 0.298], [0.553, 0.296]], snap: false, speed: 18 },
      { points: [[0.623, 0.265], [0.623, 0.347]], shape: [[0.6125, 0.266], [0.653, 0.265], [0.648, 0.344], [0.611, 0.345]], snap: false, speed: 20 },
      { points: [[0.585, 0.3], [0.585, 0.35]], shape: [[0.572, 0.3], [0.599, 0.301], [0.599, 0.355], [0.569, 0.348]], snap: false, speed: 18 },
      { points: [[0.77, 0.198], [0.747, 0.383]], shape: [[0.756, 0.2], [0.783, 0.197], [0.761, 0.383], [0.733, 0.383]], snap: false, speed: 25 },
      { points: [[0.49, 0.332], [0.5, 0.375]], shape: [[0.475, 0.332], [0.492, 0.332], [0.493, 0.35], [0.513, 0.365], [0.51, 0.375], [0.478, 0.363], [0.475, 0.346]], snap: false, speed: 18 },
      { points: [[0.52, 0.331], [0.52, 0.358]], shape: [[0.505, 0.331], [0.534, 0.331], [0.534, 0.358], [0.505, 0.358]], snap: false, speed: 18 },
      { points: [[0.688, 0.358], [0.688, 0.396]], shape: [[0.681, 0.358], [0.695, 0.358], [0.695, 0.396], [0.681, 0.396]], snap: false, speed: 18 },
      { points: [[0.772, 0.33], [0.772, 0.375]], shape: [[0.77, 0.33], [0.779, 0.33], [0.772, 0.375], [0.763, 0.375]], snap: false, speed: 18 },
      { points: [[0.823, 0.36], [0.883, 0.362]], shape: [[0.823, 0.353], [0.883, 0.355], [0.883, 0.37], [0.823, 0.368]], snap: false, speed: 18 }, // SPOTAKA
      // the brick building on the far right, from the roofline down to the street
      { points: [[0.95, 0.1], [0.95, 0.53]], shape: [[1.01, 0.0], [0.958, 0.0], [0.944, 0.06], [0.92, 0.21], [0.895, 0.33], [0.886, 0.4], [0.887, 0.497], [1.01, 0.535]], snap: false, speed: 15 }, // its left edge leans in toward the top
      { points: [[0.843, 0.316], [0.843, 0.338]], shape: ring(0.843, 0.327, 0.015, 0.011), snap: false, speed: 15 }, // the lamp pair
      { points: [[0.87, 0.319], [0.87, 0.341]], shape: ring(0.87, 0.33, 0.015, 0.011), snap: false, speed: 15 },
    ],
  },
  {
    src: "/media/hero-lanterns.jpg",
    label: "jiufen.jpg",
    caption: "Under the red lanterns in Jiufen, Taiwan. Feb 2026.",
    alt: "Climbing a stone staircase in Jiufen, Taiwan, under a string of red paper lanterns.",
    focus: [0.5, 0.4],
    flows: [
      // each lantern, ribs streaming downward (traced on the full-res photo)
      { points: [[0.2155, 0.338], [0.2155, 0.394]], shape: ring(0.2155, 0.366, 0.054, 0.027), speed: 30, bed: 0.9 },
      { points: [[0.491, 0.353], [0.491, 0.403]], shape: ring(0.491, 0.378, 0.048, 0.024), speed: 30, bed: 0.9 },
      { points: [[0.69, 0.356], [0.69, 0.402]], shape: ring(0.69, 0.379, 0.043, 0.022), speed: 30, bed: 0.9 },
      { points: [[0.871, 0.336], [0.871, 0.378]], shape: ring(0.871, 0.357, 0.04, 0.02), speed: 30, bed: 0.9 },
      // the wire they hang from, all the way in from the left edge (thicker there, where the cables bundle)
      {
        points: [[0, 0.303], [0.1, 0.317], [0.2, 0.331], [0.32, 0.34], [0.44, 0.347], [0.52, 0.35], [0.6, 0.349], [0.71, 0.344], [0.815, 0.331], [0.89, 0.321], [0.945, 0.313]],
        width: [0.024, 0.012],
        speed: 40,
      },
      // the post and the metal eave at the right edge, above the shop entrance
      { points: [[0.94, 0.31], [0.97, 0.5]], shape: [[0.925, 0.36], [0.96, 0.36], [0.965, 0.4], [1.01, 0.42], [1.01, 0.515], [0.98, 0.505], [0.958, 0.49], [0.952, 0.45], [0.945, 0.41], [0.925, 0.4]], snap: false, skip: ["green"], speed: 20 },
      // everything below the plants (ledge, shop, stairs, people) except me, drifting down the stairs
      {
        points: [[0.6, 0.5], [0.55, 1.02]],
        // top edge: the planter ledge's top bar above the shop sign, then under the bush on the right
        shape: [[0, 0.56], [0.15, 0.56], [0.3, 0.535], [0.45, 0.5], [0.6, 0.47], [0.7, 0.455], [0.85, 0.452], [0.86, 0.49], [0.9, 0.5], [0.97, 0.5], [1.01, 0.5], [1.01, 1.01], [0, 1.01]],
        skip: ["green"], // moss hanging over the ledge is plant, not shop
        speed: 40,
      },
    ],
    holes: [
      // me, traced around hair, backpack, arm, cup hand and both legs
      [
        [0.3, 0.515], [0.338, 0.494], [0.413, 0.49], [0.444, 0.508], [0.438, 0.543], [0.463, 0.56], [0.494, 0.592], [0.494, 0.656], [0.476, 0.666],
        [0.463, 0.698], [0.438, 0.719], [0.432, 0.755], [0.438, 0.818], [0.432, 0.874], [0.438, 0.93], [0.413, 0.945], [0.363, 0.938], [0.35, 0.903],
        [0.35, 0.853], [0.332, 0.846], [0.3, 0.85], [0.269, 0.839], [0.257, 0.804], [0.238, 0.754], [0.225, 0.712], [0.188, 0.698], [0.15, 0.684],
        [0.144, 0.606], [0.169, 0.564], [0.25, 0.553], [0.3, 0.55], [0.298, 0.536],
      ],
      [[0.64, 1.01], [0.68, 0.9], [0.78, 0.86], [0.9, 0.87], [1.01, 0.85], [1.01, 1.01]], // the croton (a plant) at the bottom right
      [[0.78, 0.16], [1.01, 0.16], [1.01, 0.36], [0.95, 0.33], [0.9, 0.322], [0.85, 0.326], [0.8, 0.32]], // the roof, top right
    ],
  },
];
