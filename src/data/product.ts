export const PRODUCT = {
  brand: "AEROSTEP",
  model: "AEROSTEP // GLIDE 01",
  tagline: "ENGINEERED TO MOVE.",
  price: "$220",
  drop: "LIMITED RUN — 500 PAIRS",
};

export type Colorway = {
  id: string;
  name: string;
  code: string;
  swatch: string;
  colors: {
    upper: string;
    toe: string;
    heel: string;
    tongue: string;
    collar: string;
    midsole: string;
    insole: string;
    outsole: string;
    accent: string;
    lace: string;
    glow: string;
  };
};

export const COLORWAYS: Colorway[] = [
  {
    id: "onyx",
    name: "ONYX CORE",
    code: "GL01-BLK",
    swatch: "#1b1f27",
    colors: {
      upper: "#14161c",
      toe: "#f2f3f5",
      heel: "#20242e",
      tongue: "#1b1f27",
      collar: "#2a2f3a",
      midsole: "#eceef1",
      insole: "#c9ced8",
      outsole: "#0d0f14",
      accent: "#dfe6f2",
      lace: "#e8eaee",
      glow: "#4d8cff",
    },
  },
  {
    id: "chrome",
    name: "LIQUID SILVER",
    code: "GL01-SLV",
    swatch: "#b8c0cc",
    colors: {
      upper: "#8e97a6",
      toe: "#e9edf3",
      heel: "#c3cbd8",
      tongue: "#6f7887",
      collar: "#7b8493",
      midsole: "#dfe4ea",
      insole: "#b9c1cd",
      outsole: "#2a2f38",
      accent: "#ffffff",
      lace: "#eef1f5",
      glow: "#9fd4ff",
    },
  },
  {
    id: "ice",
    name: "ICE FIELD",
    code: "GL01-ICE",
    swatch: "#eaf0f7",
    colors: {
      upper: "#e6ebf2",
      toe: "#ffffff",
      heel: "#cdd7e4",
      tongue: "#d5dce7",
      collar: "#c2ccda",
      midsole: "#ffffff",
      insole: "#dde4ee",
      outsole: "#aab6c6",
      accent: "#7fb2ff",
      lace: "#ffffff",
      glow: "#69b6ff",
    },
  },
  {
    id: "voltage",
    name: "VOLTAGE",
    code: "GL01-VLT",
    swatch: "#2f6bff",
    colors: {
      upper: "#101623",
      toe: "#2f6bff",
      heel: "#16304f",
      tongue: "#0f1520",
      collar: "#1b2b45",
      midsole: "#dfe8f8",
      insole: "#9ec4ff",
      outsole: "#0a0d13",
      accent: "#5fa2ff",
      lace: "#cfe0ff",
      glow: "#3b82ff",
    },
  },
];

export type Section = {
  id: string;
  index: string;
  nav: string;
  start: number;
  end: number;
  kicker: string;
  title: string;
  body: string;
  points?: string[];
};

/** Six-act launch film. Each act owns a slice of scroll progress. */
export const SECTIONS: Section[] = [
  {
    id: "hero",
    index: "01",
    nav: "REVEAL",
    start: 0.0,
    end: 0.12,
    kicker: "THE DROP",
    title: "GLIDE 01",
    body: "A running silhouette engineered as one continuous piece of motion.",
  },
  {
    id: "why",
    index: "02",
    nav: "WHY",
    start: 0.12,
    end: 0.3,
    kicker: "WHY IT EXISTS",
    title: "CITIES GOT FASTER.\nSHOES DIDN'T.",
    body: "Commutes turned into sprints. GLIDE 01 was built for people who move all day — cushioned like a trainer, shaped like a design object.",
    points: [
      "One-piece adaptive upper — no break-in period",
      "Energy return foam tuned for 12+ hour days",
      "218g — lighter than most daily trainers",
    ],
  },
  {
    id: "inspect",
    index: "03",
    nav: "INSPECT",
    start: 0.3,
    end: 0.52,
    kicker: "360° INSPECTION",
    title: "LOOK CLOSER",
    body: "The shoe turns as you scroll. Tap a marker to read what each zone is doing.",
    points: ["Click any + marker on the shoe", "Four engineered zones", "Every panel has a job"],
  },
  {
    id: "build",
    index: "04",
    nav: "BUILD",
    start: 0.52,
    end: 0.74,
    kicker: "MATERIAL & PERFORMANCE",
    title: "TAKEN APART",
    body: "Five layers, deconstructed. Nothing decorative — each layer earns its weight.",
  },
  {
    id: "color",
    index: "05",
    nav: "COLOR",
    start: 0.74,
    end: 0.9,
    kicker: "COLORWAYS",
    title: "FOUR FINISHES",
    body: "Switch the finish live. The whole shoe re-skins in real time — same engineering, four moods.",
  },
  {
    id: "launch",
    index: "06",
    nav: "LAUNCH",
    start: 0.9,
    end: 1.001,
    kicker: "LAUNCH",
    title: "ENGINEERED TO MOVE.",
    body: "GLIDE 01 drops in limited quantities. Reserve a pair before the run closes.",
  },
];

export type Hotspot = {
  id: string;
  label: string;
  index: string;
  position: [number, number, number];
  material: string;
  detail: string;
  stat: string;
};

/** Clickable zones in model space (before the 0.7 scene scale). */
export const HOTSPOTS: Hotspot[] = [
  {
    id: "upper",
    label: "ADAPTIVE UPPER",
    index: "01",
    position: [-0.15, 1.02, 0.42],
    material: "Knitted TPU mesh",
    detail:
      "A single seamless knit that tightens across the midfoot and opens at the toes, so the shoe holds without pressure points.",
    stat: "0 seams · 42% recycled yarn",
  },
  {
    id: "foam",
    label: "ENERGY FOAM",
    index: "02",
    position: [1.05, 0.42, 0.44],
    material: "Supercritical nitrogen EVA",
    detail:
      "Nitrogen-injected midsole foam that compresses under load and snaps back, returning energy instead of absorbing it.",
    stat: "78% energy return",
  },
  {
    id: "sole",
    label: "AEROFLOW OUTSOLE",
    index: "03",
    position: [-1.1, 0.05, 0.44],
    material: "Abrasion rubber lattice",
    detail:
      "A channelled rubber lattice that flexes with the foot and grips wet pavement without adding mass.",
    stat: "+31% wet grip",
  },
  {
    id: "heel",
    label: "FLEX HEEL CAGE",
    index: "04",
    position: [-1.35, 0.82, 0.4],
    material: "Carbon-weave counter",
    detail:
      "A lightweight carbon-weave counter locks the heel in place during push-off, then relaxes when you stand still.",
    stat: "12g total weight",
  },
];

export const LAYERS = [
  { name: "ADAPTIVE UPPER", material: "Knit TPU mesh", note: "Breathable, seamless, zero break-in" },
  { name: "PADDED COLLAR", material: "Memory foam", note: "Ankle lock without pressure" },
  { name: "ENERGY INSOLE", material: "Contoured PU", note: "Arch support, removable" },
  { name: "GLIDE MIDSOLE", material: "N2 supercritical foam", note: "78% energy return" },
  { name: "AEROFLOW OUTSOLE", material: "Rubber lattice", note: "Wet grip, low mass" },
];

export const SPECS = [
  { k: "WEIGHT", v: "218 g", s: "UK 9, single shoe" },
  { k: "DROP", v: "6 mm", s: "Heel 28 / forefoot 22" },
  { k: "ENERGY RETURN", v: "78 %", s: "Lab tested, 1000 cycles" },
  { k: "UPPER", v: "Knit TPU", s: "42% recycled yarn" },
  { k: "MIDSOLE", v: "N2 foam", s: "Supercritical nitrogen EVA" },
  { k: "OUTSOLE", v: "Lattice rubber", s: "+31% wet grip" },
  { k: "SIZES", v: "UK 3 – 13", s: "Unisex, true to size" },
  { k: "RELEASE", v: "500 pairs", s: "One global drop" },
];
