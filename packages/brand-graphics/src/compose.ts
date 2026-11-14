/**
 * Composer for Civilian brand graphics. Pure functions: kit + colours in,
 * SVG string out. Rule ids (G1, C2, ...) refer to DESIGN.md at the repo root.
 */

export interface Piece {
  w: number;
  h: number;
  /** Presentation attributes from the source <svg> root. */
  attrs: string;
  body: string;
}

export interface Kit {
  shapes: Record<string, Piece>;
  lines: Record<string, Piece>;
  patterns: Record<string, Piece>;
}

/** Looks up a primitive colour by token path, e.g. `salmon.300`. */
export type Hex = (path: string) => string;

export type Ground = "paper" | "ink";
export type Recipe = "totem" | "scatter" | "band" | "field";

/** Named palettes (C2): three magnet inks per ground, as token paths. */
export const PALETTES = {
  sunrise: {
    paper: ["salmon.300", "gold.300", "teal.500"],
    ink: ["salmon.300", "gold.300", "teal.300"],
  },
  dusk: {
    paper: ["violet.500", "salmon.300", "teal.700"],
    ink: ["violet.300", "salmon.300", "teal.300"],
  },
  harbour: {
    paper: ["teal.700", "teal.300", "gold.300"],
    ink: ["teal.500", "teal.300", "gold.300"],
  },
  signal: {
    paper: ["violet.500", "gold.300", "red.500"],
    ink: ["violet.300", "gold.300", "red.500"],
  },
} as const;

export type PaletteName = keyof typeof PALETTES;

export interface Inks {
  ground: string;
  /** Text and line marks. */
  ink: string;
  muted: string;
  accents: [string, string, string];
}

export function resolveInks(
  hex: Hex,
  palette: PaletteName,
  ground: Ground,
): Inks {
  const [a, b, c] = PALETTES[palette][ground];
  const accents: [string, string, string] = [hex(a), hex(b), hex(c)];
  return ground === "paper"
    ? {
        ground: hex("base.paper"),
        ink: hex("teal.900"),
        muted: hex("neutral.800"),
        accents,
      }
    : {
        ground: hex("teal.900"),
        ink: hex("base.paper"),
        muted: hex("teal.300"),
        accents,
      };
}

export interface TextBlock {
  kicker?: string;
  /** Pre-wrapped title lines, at most three (T1). */
  title?: string[];
  /** Mark plus `civilian.dev` in the bottom-left corner. */
  footer?: boolean;
}

export interface ComposeOptions {
  width: number;
  height: number;
  recipe: Recipe;
  palette: PaletteName;
  ground: Ground;
  seed: number;
  text?: TextBlock;
  /** `scatter` only: stand the civilian in the graphics zone with a wordmark. */
  profile?: boolean;
}

export const FONTS = {
  heading: "Poppins, 'Helvetica Neue', Arial, sans-serif",
  mono: "'Monaspace Xenon', ui-monospace, Menlo, monospace",
};

const NS = 'xmlns="http://www.w3.org/2000/svg"';

/** Parse a single-colour source SVG into a placeable piece. */
export function parsePiece(svg: string): Piece {
  const m = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  const vb = m?.[1]?.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!m || !vb) throw new Error("Source SVG needs a root viewBox at 0 0");
  return {
    w: Number(vb[1]),
    h: Number(vb[2]),
    attrs: (m[1] ?? "").replace(/\s(xmlns|viewBox)="[^"]*"/g, "").trim(),
    body: (m[2] ?? "").replace(/<title>[^<]*<\/title>/, "").trim(),
  };
}

// --- helpers ---------------------------------------------------------------

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => String(Math.round(v * 100) / 100);

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

interface Placement {
  x: number;
  y: number;
  /** Rendered size of 120 source units, in px (G2: uniform scale only). */
  size: number;
  color: string;
  rot?: number;
  flip?: boolean;
}

function put(piece: Piece, p: Placement): string {
  const t = [`translate(${n(p.x)} ${n(p.y)})`, `scale(${n(p.size / 120)})`];
  if (p.rot) t.push(`rotate(${p.rot} ${piece.w / 2} ${piece.h / 2})`);
  if (p.flip) t.push(`translate(${piece.w} 0)`, "scale(-1 1)");
  const paint = (s: string) => s.replaceAll("currentColor", p.color);
  return `<g transform="${t.join(" ")}" ${paint(piece.attrs)}>${paint(piece.body)}</g>`;
}

interface Ctx {
  w: number;
  h: number;
  /** Module (G1). */
  u: number;
  rng: Rng;
  inks: Inks;
  kit: Kit;
  defs: string[];
  out: string[];
  uid: (prefix: string) => string;
}

function shape(c: Ctx, name: string): Piece {
  const p = c.kit.shapes[name] ?? c.kit.lines[name];
  if (!p) throw new Error(`Unknown piece: ${name}`);
  return p;
}

/** Accent colours in a shuffled cycle so neighbours differ. */
function colourCycle(c: Ctx): () => string {
  const order = shuffle(c.rng, c.inks.accents);
  let i = 0;
  return () => order[i++ % order.length] as string;
}

// --- textures (G7) ---------------------------------------------------------

/**
 * Stipple: turns the alpha of whatever it is applied to into a dither of
 * `color` dots, so an alpha gradient becomes a printed fade.
 */
export function stippleFilter(id: string, color: string, seed: number): string {
  return (
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed}" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.4 0 0 0 -0.7" result="a"/>` +
    `<feComposite in="SourceGraphic" in2="a" operator="arithmetic" k1="0" k2="1.4" k3="1" k4="-0.62"/>` +
    `<feComponentTransfer result="t"><feFuncA type="linear" slope="14" intercept="-6.5"/></feComponentTransfer>` +
    `<feFlood flood-color="${color}"/><feComposite in2="t" operator="in"/>` +
    "</filter>"
  );
}

/** Grain: fine static monochrome noise in `color`, laid over a gradient. */
export function grainFilter(id: string, color: string, seed: number): string {
  return (
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.6 0 0 0 -0.55" result="a"/>` +
    `<feFlood flood-color="${color}"/><feComposite in2="a" operator="in"/>` +
    "</filter>"
  );
}

// --- recipes ---------------------------------------------------------------

const SQUARE_FILLERS = ["disc", "square", "ring", "cross"] as const;
const TURNABLE_FILLERS = [
  "quarter-disc",
  "arc",
  "arch",
  "stair",
  "wedge",
] as const;
const PAIR_FILLERS = ["bars", "pills", "halves"] as const;
const FLOATERS = [
  "triangle",
  "half-disc",
  "pill",
  "cross",
  "disc",
  "wedge",
] as const;

/** Fill one grid cell with a snapped piece or pair (G3). */
function fillCell(
  c: Ctx,
  name: string,
  x: number,
  y: number,
  cell: number,
  next: () => string,
): void {
  const gap = cell / 30;
  const s = cell - gap;
  const half = (s - gap) / 2;
  if (name === "bars") {
    c.out.push(put(shape(c, "bar"), { x, y, size: half * 2, color: next() }));
    c.out.push(
      put(shape(c, "bar"), {
        x: x + half + gap,
        y,
        size: half * 2,
        color: next(),
      }),
    );
  } else if (name === "pills" || name === "halves") {
    const piece = shape(c, name === "pills" ? "pill" : "half-disc");
    const inset = (s - half * 2) / 2;
    c.out.push(put(piece, { x: x + inset, y, size: half * 2, color: next() }));
    c.out.push(
      put(piece, {
        x: x + inset,
        y: y + half + gap,
        size: half * 2,
        color: next(),
        rot: name === "halves" ? 180 : 0,
      }),
    );
  } else {
    const turnable = (TURNABLE_FILLERS as readonly string[]).includes(name);
    const rot = turnable ? 90 * Math.floor(c.rng() * 4) : 0;
    c.out.push(put(shape(c, name), { x, y, size: s, color: next(), rot }));
  }
}

function totem(c: Ctx): void {
  const { w, h, u, rng } = c;
  const rows = 3;
  const cell = Math.min(1.5 * u, (h - 1.5 * u) / rows);
  const x0 = w - u - cell;
  const y0 = (h - rows * cell) / 2;
  const next = colourCycle(c);

  // At most one pair cell keeps the piece count within G5.
  const pair = rng() < 0.6 ? [pick(rng, PAIR_FILLERS)] : [];
  const singles = shuffle(rng, [...SQUARE_FILLERS, ...TURNABLE_FILLERS]);
  const stack = shuffle(rng, [...pair, ...singles.slice(0, rows - pair.length)]);
  const inkRow = rng() < 0.5 ? Math.floor(rng() * rows) : -1;
  stack.forEach((name, row) => {
    const colour = row === inkRow ? () => c.inks.ink : next;
    fillCell(c, name, x0, y0 + row * cell, cell, colour);
  });

  // One piece snapped to the side breaks the column's silhouette.
  const sideRow = 1 + Math.floor(rng() * 2);
  const side = pick(rng, ["quarter-disc", "arc", "wedge", "stair"] as const);
  c.out.push(
    put(shape(c, side), {
      x: x0 - cell,
      y: y0 + sideRow * cell,
      size: cell - cell / 30,
      color: next(),
      flip: true,
    }),
  );

  // Floating pieces (G3) in the free cell beside the stack and lower left.
  const freeRow = sideRow === 1 ? 2 : 1;
  const a = 0.5 * cell;
  c.out.push(
    put(shape(c, pick(rng, FLOATERS)), {
      x: x0 - cell + (cell - a) * (0.2 + rng() * 0.3),
      y: y0 + freeRow * cell + (cell - a) * (0.3 + rng() * 0.4),
      size: a,
      color: next(),
      rot: 15 * Math.floor(rng() * 24),
    }),
  );

  // One spark, radiating away from the top piece (G6).
  c.out.push(
    put(shape(c, "spark"), {
      x: x0 - 0.08 * cell - u,
      y: y0 + 0.16 * cell - u,
      size: u,
      color: c.inks.ink,
      flip: true,
    }),
  );
}

function patternBlock(
  c: Ctx,
  name: string,
  x: number,
  y: number,
  s: number,
  colour: string,
): void {
  const tile = c.kit.patterns[name];
  if (!tile) throw new Error(`Unknown pattern: ${name}`);
  const id = c.uid("pat");
  // Two 120-unit tiles per cell side keeps the pattern finer than the magnets.
  const k = s / 240;
  const paint = (v: string) => v.replaceAll("currentColor", colour);
  c.defs.push(
    `<pattern id="${id}" width="${tile.w}" height="${tile.h}" patternUnits="userSpaceOnUse" patternTransform="translate(${n(x)} ${n(y)}) scale(${n(k)})"><g ${paint(tile.attrs)}>${paint(tile.body)}</g></pattern>`,
  );
  c.out.push(
    `<rect x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}" rx="${n(s / 30)}" fill="url(#${id})"/>`,
  );
}

function band(c: Ctx): void {
  const { w, h, u, rng } = c;
  const cell = 1.5 * u;
  const gap = cell / 30;
  const count = Math.floor((w * 0.62) / cell);
  const next = colourCycle(c);
  const fillers = shuffle(rng, [
    ...SQUARE_FILLERS,
    ...TURNABLE_FILLERS,
    ...TURNABLE_FILLERS,
    ...PAIR_FILLERS,
  ]);
  const patterns = shuffle(rng, Object.keys(c.kit.patterns).sort());
  let filled = 0;
  let upper = 0;
  let usedPattern = false;
  let lastEmpty = false;
  for (let i = 0; i < count && filled < 6; i++) {
    const x = w - (i + 1) * cell + gap;
    const y = h - cell + gap;
    if (i > 0 && !lastEmpty && rng() < 0.3) {
      lastEmpty = true;
      continue;
    }
    lastEmpty = false;
    if (!usedPattern && i > 0 && rng() < 0.35) {
      // One pattern per composition (G5), in ink so it reads as texture.
      patternBlock(c, patterns[0] as string, x, y, cell - gap, c.inks.ink);
      usedPattern = true;
    } else {
      fillCell(c, fillers[filled] as string, x, y, cell, next);
    }
    filled++;
    // A second storey on a few cells gives the band a skyline.
    if (upper < 2 && i < count - 2 && rng() < 0.3) {
      const name = pick(rng, [...SQUARE_FILLERS, ...TURNABLE_FILLERS]);
      fillCell(c, name, x, y - cell, cell, next);
      upper++;
      filled++;
    }
  }
  // One mark floating over the open end of the band.
  const mark = pick(rng, ["squiggle", "zigzag"] as const);
  c.out.push(
    put(shape(c, mark), {
      x: w - count * cell - 0.4 * u + rng() * 0.6 * u,
      y: h - cell - 1.1 * u,
      size: u,
      color: c.inks.ink,
      rot: pick(rng, [0, -15, 15]),
    }),
  );
}

function field(c: Ctx): void {
  const { w, h, u, rng, inks } = c;
  const [a, b, d] = shuffle(rng, inks.accents) as [string, string, string];

  // Texture from the bottom-right corner, gone before the text zone (G7).
  const grad = c.uid("fade");
  const filt = c.uid("stipple");
  c.defs.push(
    `<radialGradient id="${grad}" cx="1" cy="1" r="1"><stop offset="0" stop-opacity="0.95"/><stop offset="0.55" stop-opacity="0.5"/><stop offset="1" stop-opacity="0"/></radialGradient>`,
    stippleFilter(filt, a, 1 + Math.floor(rng() * 90)),
  );
  c.out.push(
    `<rect x="${n(w * 0.38)}" y="0" width="${n(w * 0.62)}" height="${h}" fill="url(#${grad})" filter="url(#${filt})"/>`,
  );

  // One very large cropped magnet (G4).
  const big = 3.6 * u;
  const name = pick(rng, ["disc", "quarter-disc", "arc", "ring"] as const);
  c.out.push(
    put(shape(c, name), {
      x: w - big * 0.7,
      y: h - big * 0.64,
      size: big,
      color: b,
      rot: name === "quarter-disc" || name === "arc" ? 90 : 0,
    }),
  );

  // One small floating piece and one mark.
  c.out.push(
    put(shape(c, pick(rng, FLOATERS)), {
      x: w - big * 0.7 - 1.3 * u + rng() * 0.3 * u,
      y: 0.7 * u + rng() * 0.5 * u,
      size: 0.8 * u,
      color: d,
      rot: 15 * Math.floor(rng() * 24),
    }),
  );
  c.out.push(
    put(shape(c, pick(rng, ["squiggle", "zigzag"] as const)), {
      x: w - big * 0.7 - 2.5 * u,
      y: h - 1.5 * u,
      size: u,
      color: inks.ink,
      rot: -15,
    }),
  );
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlaps = (a: Rect, b: Rect, pad: number) =>
  a.x < b.x + b.w + pad &&
  b.x < a.x + a.w + pad &&
  a.y < b.y + b.h + pad &&
  b.y < a.y + a.h + pad;

/** The civilian (G9): disc, square and two bars, feet at `bottom`. */
function figure(c: Ctx, x: number, bottom: number, height: number): Rect {
  const k = height / 364;
  const y = bottom - height;
  const [a, b, d] = c.inks.accents;
  const size = 120 * k;
  const leg = (58 / 60) * size;
  c.out.push(put(shape(c, "disc"), { x, y, size, color: a }));
  c.out.push(put(shape(c, "square"), { x, y: y + 124 * k, size, color: b }));
  c.out.push(put(shape(c, "bar"), { x, y: y + 248 * k, size: leg, color: a }));
  c.out.push(
    put(shape(c, "bar"), {
      x: x + 62 * k,
      y: y + 248 * k,
      size: leg,
      color: d,
    }),
  );
  return { x, y, w: size, h: height };
}

/** Slots as [centre x, centre y, size in modules], fractions of the canvas. */
const SCATTER_SLOTS: readonly (readonly [number, number, number])[] = [
  [0.07, 0.2, 1.2],
  [0.22, 0.98, 1.7],
  [0.4, 0.02, 1.6],
  [0.56, 0.95, 1.1],
  [0.9, 0.14, 1.1],
  [1.0, 0.6, 1.9],
  [0.27, 0.22, 0.8],
  [0.72, 0.08, 0.9],
  [0.02, 0.62, 1.3],
];

function scatter(c: Ctx, profile: boolean): void {
  const { w, h, u, rng, inks } = c;
  const taken: Rect[] = [];
  if (profile) {
    // Wordmark, left-aligned (T2), with the civilian standing to its right.
    const size = 1.5 * u;
    const tx = w * 0.3;
    const person = figure(c, w * 0.74, h, 4.7 * u);
    taken.push(person, { x: tx, y: h * 0.18, w: w * 0.4, h: h * 0.7 });
    // Keep the avatar overlap clear (A3).
    taken.push({ x: 0, y: h - 200, w: 200, h: 200 });
    c.out.push(
      `<text x="${n(tx)}" y="${n(h * 0.5)}" font-family="${FONTS.heading}" font-weight="600" font-size="${n(size)}" letter-spacing="${n(-0.025 * size)}" fill="${inks.ink}">Civilian<tspan x="${n(tx)}" dy="${n(size * 1.05)}">.dev</tspan></text>`,
    );
    c.out.push(
      put(shape(c, "spark"), {
        x: person.x + person.w + 0.05 * u,
        y: person.y - 0.35 * u,
        size: u,
        color: inks.ink,
      }),
    );
  }
  const next = colourCycle(c);
  const names = shuffle(rng, [
    "triangle",
    "half-disc",
    "arc",
    "pill",
    "quarter-disc",
    "cross",
    "ring",
    "wedge",
    "stair",
  ]);
  let placed = 0;
  for (const [fx, fy, fs] of shuffle(rng, SCATTER_SLOTS)) {
    if (placed >= (profile ? 4 : 6)) break;
    const size = fs * u;
    const box = {
      x: fx * w + (rng() - 0.5) * 0.04 * w - size / 2,
      y: fy * h + (rng() - 0.5) * 0.04 * h - size / 2,
      w: size,
      h: size,
    };
    if (taken.some((t) => overlaps(box, t, u / 2))) continue;
    taken.push(box);
    c.out.push(
      put(shape(c, names[placed] as string), {
        x: box.x,
        y: box.y,
        size,
        color: next(),
        rot: 15 * Math.floor(rng() * 24),
      }),
    );
    placed++;
  }
}

// --- text (T1, L4) ---------------------------------------------------------

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function textBlock(c: Ctx, t: TextBlock): void {
  const { w, h, inks } = c;
  const k = w / 1200;
  const m = 72 * k;
  let y = m;
  if (t.kicker) {
    c.out.push(
      `<rect x="${n(m)}" y="${n(y)}" width="${n(48 * k)}" height="${n(6 * k)}" fill="${inks.accents[0]}"/>`,
      `<text x="${n(m)}" y="${n(y + 46 * k)}" font-family="${FONTS.mono}" font-weight="500" font-size="${n(22 * k)}" letter-spacing="${n(2.2 * k)}" fill="${inks.muted}">${esc(t.kicker.toUpperCase())}</text>`,
    );
    y += 46 * k;
  }
  if (t.title) {
    const size = 62 * k;
    const spans = t.title
      .slice(0, 3)
      .map(
        (line, i) =>
          `<tspan x="${n(m)}" dy="${i === 0 ? 0 : n(size * 1.18)}">${esc(line)}</tspan>`,
      )
      .join("");
    c.out.push(
      `<text x="${n(m)}" y="${n(y + 96 * k)}" font-family="${FONTS.heading}" font-weight="600" font-size="${n(size)}" letter-spacing="${n(-0.025 * size)}" fill="${inks.ink}">${spans}</text>`,
    );
  }
  if (t.footer) {
    const fh = 46 * k;
    const person = figure(c, m, h - m, fh);
    c.out.push(
      `<text x="${n(m + person.w + 14 * k)}" y="${n(h - m - 11 * k)}" font-family="${FONTS.heading}" font-weight="600" font-size="${n(26 * k)}" fill="${inks.ink}">civilian.dev</text>`,
    );
  }
}

// --- entry points ----------------------------------------------------------

function context(
  kit: Kit,
  inks: Inks,
  w: number,
  h: number,
  seed: number,
): Ctx {
  let ids = 0;
  return {
    w,
    h,
    u: Math.round(Math.min(w, h) / 6),
    rng: mulberry32(seed),
    inks,
    kit,
    defs: [],
    out: [],
    uid: (prefix) => `${prefix}-${seed}-${ids++}`,
  };
}

function wrap(c: Ctx, meta: string): string {
  const defs = c.defs.length ? `<defs>${c.defs.join("")}</defs>\n` : "";
  return `<svg ${NS} viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" ${meta}>\n${defs}<rect width="${c.w}" height="${c.h}" fill="${c.inks.ground}"/>\n${c.out.join("\n")}\n</svg>\n`;
}

/** Compose a fixed-size artefact (A1, A2, A3). Deterministic per seed (G10). */
export function compose(kit: Kit, hex: Hex, o: ComposeOptions): string {
  const c = context(
    kit,
    resolveInks(hex, o.palette, o.ground),
    o.width,
    o.height,
    o.seed,
  );
  if (o.recipe === "totem") totem(c);
  else if (o.recipe === "band") band(c);
  else if (o.recipe === "field") field(c);
  else scatter(c, o.profile ?? false);
  if (o.text) textBlock(c, o.text);
  return wrap(
    c,
    `data-recipe="${o.recipe}" data-palette="${o.palette}" data-ground="${o.ground}" data-seed="${o.seed}"`,
  );
}

/** Avatar (A5): the civilian on a flat ground, safe for a circular crop. */
export function avatar(
  kit: Kit,
  hex: Hex,
  o: { size: number; palette: PaletteName; ground: Ground },
): string {
  const c = context(
    kit,
    resolveInks(hex, o.palette, o.ground),
    o.size,
    o.size,
    0,
  );
  const height = o.size * 0.6;
  figure(c, (o.size - (120 * height) / 364) / 2, o.size * 0.8, height);
  return wrap(
    c,
    `data-recipe="avatar" data-palette="${o.palette}" data-ground="${o.ground}"`,
  );
}

/**
 * Callout background (A4). Fluid: no viewBox, so it fills any box. The
 * texture and the piece are anchored to the right edge and bottom-right
 * corner; everything left of them stays flat tint for text (C4).
 */
export function calloutBackground(
  kit: Kit,
  o: { tint: string; color: string; piece: string; seed: number },
): string {
  const piece = kit.shapes[o.piece];
  if (!piece) throw new Error(`Unknown piece: ${o.piece}`);
  const size = 96;
  return (
    `<svg ${NS} width="100%" height="100%" data-recipe="callout" data-seed="${o.seed}">\n` +
    `<defs><linearGradient id="fade"><stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="0.75"/></linearGradient>${stippleFilter("stipple", o.color, o.seed)}</defs>\n` +
    `<rect width="100%" height="100%" fill="${o.tint}"/>\n` +
    `<svg x="100%" overflow="visible"><rect x="-240" width="240" height="100%" fill="url(#fade)" filter="url(#stipple)"/></svg>\n` +
    `<svg x="100%" y="100%" overflow="visible">${put(piece, { x: -size, y: -size, size, color: o.color, flip: true })}</svg>\n` +
    "</svg>\n"
  );
}

/**
 * Section texture (A6). Fluid. `stipple` dissolves `color` up from the
 * bottom edge; `grain` is a soft sideways gradient under print grain.
 */
export function texture(o: {
  kind: "stipple" | "grain";
  ground: string;
  color: string;
  ink: string;
  seed: number;
}): string {
  const head = `<svg ${NS} width="100%" height="100%" data-recipe="texture-${o.kind}" data-seed="${o.seed}">\n`;
  const base = `<rect width="100%" height="100%" fill="${o.ground}"/>\n`;
  if (o.kind === "stipple") {
    return (
      `${head}<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-opacity="0"/><stop offset="1" stop-opacity="0.9"/></linearGradient>${stippleFilter("stipple", o.color, o.seed)}</defs>\n` +
      `${base}<rect width="100%" height="100%" fill="url(#fade)" filter="url(#stipple)"/>\n</svg>\n`
    );
  }
  return (
    `${head}<defs><linearGradient id="fade"><stop offset="0" stop-color="${o.color}" stop-opacity="0"/><stop offset="0.45" stop-color="${o.color}" stop-opacity="0.35"/><stop offset="1" stop-color="${o.color}"/></linearGradient>${grainFilter("grain", o.ink, o.seed)}</defs>\n` +
    `${base}<rect width="100%" height="100%" fill="url(#fade)"/>\n<rect width="100%" height="100%" filter="url(#grain)" opacity="0.5"/>\n</svg>\n`
  );
}
