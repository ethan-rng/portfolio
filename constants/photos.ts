import type { Photo } from "./types";

/** The "elsewhere" polaroids on the home page. None of these repeat the hero reel. */
export const elsewhere = {
  note: "Off the clock, mostly cooking. Some of these are mine, the rest were meals good enough to keep a picture of.",
  photos: [
    { src: "/media/elsewhere-candle.jpg", label: "candle.jpg", portrait: true, alt: 'Holding a candle and a small handwritten note reading "Please Return".' },
    { src: "/media/food-curry.jpg", label: "curry.jpg", alt: "Shrimp and tofu curry served with a mound of jasmine rice." },
    { src: "/media/food-steak.jpg", label: "steak.jpg", alt: "Sliced medium-rare steak with chimichurri, roast potatoes and a tomato salad." },
    { src: "/media/food-congee.jpg", label: "congee.jpg", alt: "Congee topped with fried dough sticks, spring onion and soy sauce." },
    { src: "/media/food-porkbelly.jpg", label: "porkbelly.jpg", alt: "A glazed slab of pork belly resting on mashed potato with chives." },
    { src: "/media/food-tonkatsu.jpg", label: "tonkatsu-set.jpg", alt: "A tonkatsu set meal on a black tray with shredded cabbage, rice and small dishes of sauce." },
  ] satisfies Photo[],
};
