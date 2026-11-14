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

export type Recipe = "corner" | "row" | "tile" | "band";

/**
 * Colour schemes (C2), as token paths. Each is one flat ground, one ink for
 * type, three magnet inks ordered by contrast with the ground, a block
 * colour for panels and bands with two inks that read on it, and a tonal
 * colour for textures.
 */
export const SCHEMES = {
  paper: {
    ground: "base.paper",
    ink: "teal.900",
    muted: "neutral.800",
    shapes: ["red.500", "teal.700", "gold.300"],
    block: "teal.900",
    onBlock: ["gold.300", "red.500"],
    tone: "salmon.300",
  },
  press: {
    ground: "salmon.300",
    ink: "teal.900",
    muted: "teal.900",
    shapes: ["teal.900", "red.500", "gold.300"],
    block: "red.500",
    onBlock: ["teal.900", "gold.300"],
    tone: "salmon.500",
  },
  sun: {
    ground: "gold.300",
    ink: "teal.900",
    muted: "teal.900",
    shapes: ["violet.500", "teal.900", "red.500"],
    block: "violet.500",
    onBlock: ["gold.300", "teal.900"],
    tone: "gold.500",
  },
  mint: {
    ground: "teal.300",
    ink: "teal.900",
    muted: "teal.900",
    shapes: ["teal.900", "red.500", "gold.300"],
    block: "teal.900",
    onBlock: ["teal.300", "gold.300"],
    tone: "teal.500",
  },
  night: {
    ground: "teal.900",
    ink: "base.paper",
    muted: "teal.300",
    shapes: ["salmon.300", "gold.300", "red.500"],
    block: "teal.700",
    onBlock: ["gold.300", "salmon.300"],
    tone: "teal.500",
  },
  plum: {
    ground: "violet.900",
    ink: "base.paper",
    muted: "violet.300",
    shapes: ["gold.300", "salmon.300", "violet.300"],
    block: "violet.500",
    onBlock: ["gold.300", "violet.900"],
    tone: "violet.500",
  },
} as const;

export type SchemeName = keyof typeof SCHEMES;

export interface Inks {
  ground: string;
  /** Text and line marks. */
  ink: string;
  muted: string;
  shapes: [string, string, string];
  block: string;
  onBlock: [string, string];
  tone: string;
  /** First magnet ink that is not the text ink; used for the kicker bar. */
  accent: string;
}

export function resolveInks(hex: Hex, scheme: SchemeName): Inks {
  const s = SCHEMES[scheme];
  const shapes = s.shapes.map(hex) as [string, string, string];
  const ink = hex(s.ink);
  return {
    ground: hex(s.ground),
    ink,
    muted: hex(s.muted),
    shapes,
    block: hex(s.block),
    onBlock: s.onBlock.map(hex) as [string, string],
    tone: hex(s.tone),
    accent: shapes.find((c) => c !== ink) ?? shapes[0],
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
  scheme: SchemeName;
  seed: number;
  text?: TextBlock;
  /** Add the wordmark and the civilian (A3). Use with `tile` or `band`. */
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
  /** Motif the recipe chose, recorded on the root element (G10). */
  motif: string;
  /** Edges of the area left free for text and the figure. */
  bottom: number;
  right: number;
}

function shape(c: Ctx, name: string): Piece {
  const p = c.kit.shapes[name] ?? c.kit.lines[name];
  if (!p) throw new Error(`Unknown piece: ${name}`);
  return p;
}

/** Register a pattern tile as a paint server and return its id (G8). */
function patternFill(c: Ctx, name: string, colour: string, scale: number) {
  const tile = c.kit.patterns[name];
  if (!tile) throw new Error(`Unknown pattern: ${name}`);
  const id = c.uid("pat");
  const paint = (v: string) => v.replaceAll("currentColor", colour);
  c.defs.push(
    `<pattern id="${id}" width="${tile.w}" height="${tile.h}" patternUnits="userSpaceOnUse" patternTransform="scale(${n(scale)})"><g ${paint(tile.attrs)}>${paint(tile.body)}</g></pattern>`,
  );
  return id;
}

/**
 * Quarter-turn that puts the anchored corner of a corner-weighted piece
 * (quarter-disc, arc, wedge: source corner is bottom-left) where we want it.
 */
const TURN = { bl: 0, tl: 90, tr: 180, br: 270 } as const;
type Corner = keyof typeof TURN;

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

interface Ring {
  name: string;
  size: number;
  color: string;
}

/**
 * Concentric pieces for a corner, sized in px, innermost first. Arcs nest
 * exactly: an arc's inner radius is half its size.
 */
function cornerRings(
  motif: string,
  u: number,
  colors: readonly string[],
): Ring[] {
  const g = u / 30;
  const [a, b, d] = colors as [string, string, string];
  if (motif === "rings") {
    const r = 1.4 * u;
    return [
      { name: "quarter-disc", size: r - g, color: a },
      { name: "arc", size: 2 * r, color: b },
    ];
  }
  if (motif === "rings3") {
    const r = 0.9 * u;
    return [
      { name: "quarter-disc", size: r - g, color: a },
      { name: "arc", size: 2 * r, color: b },
      { name: "arc", size: 4 * r + 2 * g, color: d },
    ];
  }
  if (motif === "arc") return [{ name: "arc", size: 3.6 * u, color: a }];
  if (motif === "stair") return [{ name: "stair", size: 3 * u, color: a }];
  if (motif === "wedge") return [{ name: "wedge", size: 3 * u, color: a }];
  return [{ name: "quarter-disc", size: 3 * u, color: a }];
}

const CORNER_MOTIFS = [
  "quarter",
  "rings",
  "rings3",
  "arc",
  "stair",
  "wedge",
] as const;
const HALOS = ["stipple", "stipple", "dots", "plus"] as const;

/**
 * One motif anchored exactly in a corner, over a halo of texture or
 * pattern. The same idea as the callout background (A4).
 */
function corner(c: Ctx, where: Corner): void {
  const { w, h, u, rng, inks } = c;
  const motif = pick(rng, CORNER_MOTIFS);
  const halo = pick(rng, HALOS);
  const swap = rng() < 0.5;
  const colors = swap
    ? [inks.shapes[0], inks.shapes[2], inks.shapes[1]]
    : inks.shapes;
  const rings = cornerRings(motif, u, colors);
  const reach = Math.max(...rings.map((r) => r.size));
  c.motif = `${motif}+${halo}`;

  // Drawn for the bottom-right corner, then mirrored into place.
  const parts: string[] = [];
  if (halo === "stipple") {
    const grad = c.uid("fade");
    const filt = c.uid("stipple");
    const span = reach * 1.9;
    c.defs.push(
      `<radialGradient id="${grad}" cx="1" cy="1" r="1"><stop offset="0" stop-opacity="0.95"/><stop offset="0.55" stop-opacity="0.5"/><stop offset="1" stop-opacity="0"/></radialGradient>`,
      stippleFilter(filt, inks.tone, 1 + Math.floor(rng() * 90)),
    );
    parts.push(
      `<rect x="${n(w - span)}" y="${n(h - span)}" width="${n(span)}" height="${n(span)}" fill="url(#${grad})" filter="url(#${filt})"/>`,
    );
  } else {
    const id = patternFill(c, halo, inks.tone, u / 60);
    parts.push(
      `<circle cx="${w}" cy="${h}" r="${n(reach * 1.35)}" fill="url(#${id})"/>`,
    );
  }
  for (const r of [...rings].reverse()) {
    parts.push(
      put(shape(c, r.name), {
        x: w - r.size,
        y: h - r.size,
        size: r.size,
        color: r.color,
        rot: r.name === "stair" ? 0 : TURN.br,
      }),
    );
  }
  const mirror = {
    br: "",
    bl: `translate(${w} 0) scale(-1 1)`,
    tr: `translate(0 ${h}) scale(1 -1)`,
    tl: `translate(${w} ${h}) scale(-1 -1)`,
  }[where];
  c.out.push(
    mirror
      ? `<g transform="${mirror}">${parts.join("")}</g>`
      : parts.join("\n"),
  );
}

/**
 * A short row of same-size pieces on one baseline, following one rule:
 * route bullets, a piece turning through its positions, or an alternation.
 */
function row(c: Ctx, withText: boolean): void {
  const { w, h, u, rng, inks } = c;
  const motif = pick(rng, ["bullets", "turn", "pair", "phase"] as const);
  const turner = pick(rng, ["quarter-disc", "arc", "wedge", "stair"] as const);
  const pair = pick(rng, [
    ["disc", "square"],
    ["square", "ring"],
    ["disc", "cross"],
    ["arch", "disc"],
  ] as const);
  c.motif = motif === "turn" ? `turn-${turner}` : motif;

  const cell = (withText ? 1.25 : 1.5) * u;
  const count = (withText ? 4 : 5) + (motif === "phase" ? 2 : 0);
  const gap = motif === "phase" ? cell / 30 : cell / 4;
  const total = count * cell + (count - 1) * gap;
  const m = 72 * (w / 1200);
  const x0 = withText ? w - m - total : (w - total) / 2;
  const top = withText ? c.bottom - m - cell : (h - cell) / 2;
  const [a, b, d] = inks.shapes;
  // Four distinct inks for bullets, whatever the scheme shares with its ink.
  const four = [...new Set([a, b, d, inks.ink, inks.tone, inks.block])];

  for (let i = 0; i < count; i++) {
    const x = x0 + i * (cell + gap);
    if (motif === "bullets") {
      c.out.push(
        put(shape(c, "disc"), {
          x,
          y: top,
          size: cell,
          color: four[i % 4] as string,
        }),
      );
    } else if (motif === "turn") {
      c.out.push(
        put(shape(c, turner), {
          x,
          y: top,
          size: cell,
          color: i % 2 ? b : a,
          rot: 90 * (i % 4),
        }),
      );
    } else if (motif === "pair") {
      c.out.push(
        put(shape(c, pair[i % 2] as string), {
          x,
          y: top,
          size: cell,
          color: i % 2 ? b : a,
        }),
      );
    } else {
      // Half-discs alternately above and below the centre line: a wave.
      c.out.push(
        put(shape(c, "half-disc"), {
          x,
          y: top + (i % 2 ? cell / 2 : 0),
          size: cell,
          color: i % 2 ? b : a,
          rot: i % 2 ? 180 : 0,
        }),
      );
    }
  }
}

interface Motif {
  piece: (col: number, row: number) => string;
  rot: (col: number, row: number) => number;
}

const even = (v: number) => v % 2 === 0;
/** Corners meet at every second grid crossing: four cells make one figure. */
const meet = (col: number, row: number) =>
  TURN[even(col) ? (even(row) ? "br" : "tr") : even(row) ? "bl" : "tl"];
const checker = (col: number, row: number) => (even(col + row) ? 0 : 180);

/** Symmetric repeats on the cell grid (G3). */
const TILE_MOTIFS: Record<string, Motif> = {
  discs: { piece: () => "quarter-disc", rot: meet },
  rings: { piece: () => "arc", rot: meet },
  diamonds: { piece: () => "wedge", rot: meet },
  leaves: { piece: () => "quarter-disc", rot: checker },
  ribbons: { piece: () => "arc", rot: checker },
  steps: { piece: () => "stair", rot: checker },
  arches: { piece: () => "arch", rot: () => 0 },
  counters: {
    piece: (col, row) => (even(col + row) ? "disc" : "square"),
    rot: () => 0,
  },
};

/** Fill a grid of cells on a flat block with one symmetric motif. */
function grid(
  c: Ctx,
  name: string,
  x0: number,
  y0: number,
  cols: number,
  rows: number,
  cell: number,
  colour: (col: number, row: number) => string,
): void {
  const motif = TILE_MOTIFS[name];
  if (!motif) throw new Error(`Unknown motif: ${name}`);
  const g = cell / 30;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      c.out.push(
        put(shape(c, motif.piece(col, r)), {
          x: x0 + col * cell + g / 2,
          y: y0 + r * cell + g / 2,
          size: cell - g,
          color: colour(col, r),
          rot: motif.rot(col, r),
        }),
      );
    }
  }
}

/** A full-height panel on the right edge, like the cover of a paperback. */
function tile(c: Ctx, withText: boolean): void {
  const { w, h, rng, inks } = c;
  const name = pick(rng, Object.keys(TILE_MOTIFS));
  c.motif = name;
  const rows = 3;
  const cell = h / rows;
  const cols = withText ? 2 : 3;
  const x0 = w - cols * cell;
  c.right = x0;
  c.out.push(
    `<rect x="${n(x0)}" y="0" width="${n(cols * cell)}" height="${h}" fill="${inks.block}"/>`,
  );
  const [a, b] = inks.onBlock;
  grid(c, name, x0, 0, cols, rows, cell, (col, r) => (even(col + r) ? a : b));
}

/** A frieze along the bottom edge: one unit repeated, centred on the canvas. */
function band(c: Ctx): void {
  const { w, h, u, rng, inks } = c;
  const name = pick(rng, [
    "discs",
    "rings",
    "diamonds",
    "steps",
    "arches",
    "counters",
  ] as const);
  c.motif = name;
  const cell = u;
  const cols = Math.ceil(w / cell / 2) * 2;
  const x0 = (w - cols * cell) / 2;
  c.bottom = h - cell;
  c.out.push(
    `<rect x="0" y="${n(h - cell)}" width="${w}" height="${n(cell)}" fill="${inks.block}"/>`,
  );
  const [a, b] = inks.onBlock;
  // Colour in pairs so each two-cell figure is one colour.
  grid(c, name, x0, h - cell, cols, 1, cell, (col) =>
    even(Math.floor(col / 2)) ? a : b,
  );
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The civilian (G9): disc, square and two bars, feet at `bottom`. */
function figure(c: Ctx, x: number, bottom: number, height: number): Rect {
  const k = height / 364;
  const y = bottom - height;
  const [a, b, d] = c.inks.shapes;
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

/** Wordmark, left-aligned (T2), with the civilian standing to its right. */
function profile(c: Ctx): void {
  const { w, u, inks } = c;
  const size = 1.5 * u;
  const tx = w * 0.18;
  const height = 4.2 * u;
  const width = (120 * height) / 364;
  const x = Math.min(w * 0.72, c.right - 1.5 * u - width);
  const person = figure(c, x, c.bottom, height);
  c.out.push(
    `<text x="${n(tx)}" y="${n(c.bottom * 0.5)}" font-family="${FONTS.heading}" font-weight="600" font-size="${n(size)}" letter-spacing="${n(-0.025 * size)}" fill="${inks.ink}">Civilian<tspan x="${n(tx)}" dy="${n(size * 1.05)}">.dev</tspan></text>`,
  );
  // The one burst of energy (P6), beside the head.
  c.out.push(
    put(shape(c, "spark"), {
      x: person.x + person.w + 0.05 * u,
      y: person.y - 0.3 * u,
      size: u,
      color: inks.ink,
    }),
  );
}

// --- text (T1, L4) ---------------------------------------------------------

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function textBlock(c: Ctx, t: TextBlock): void {
  const { w, inks } = c;
  const k = w / 1200;
  const m = 72 * k;
  let y = m;
  if (t.kicker) {
    c.out.push(
      `<rect x="${n(m)}" y="${n(y)}" width="${n(48 * k)}" height="${n(6 * k)}" fill="${inks.accent}"/>`,
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
    const base = c.bottom - (c.bottom < c.h ? m * 0.6 : m);
    const person = figure(c, m, base, 46 * k);
    c.out.push(
      `<text x="${n(m + person.w + 14 * k)}" y="${n(base - 11 * k)}" font-family="${FONTS.heading}" font-weight="600" font-size="${n(26 * k)}" fill="${inks.ink}">civilian.dev</text>`,
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
    motif: "",
    bottom: h,
    right: w,
  };
}

function wrap(c: Ctx, meta: string): string {
  const defs = c.defs.length ? `<defs>${c.defs.join("")}</defs>\n` : "";
  return `<svg ${NS} viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}" ${meta}>\n${defs}<rect width="${c.w}" height="${c.h}" fill="${c.inks.ground}"/>\n${c.out.join("\n")}\n</svg>\n`;
}

/** Compose a fixed-size artefact (A1, A2, A3). Deterministic per seed (G10). */
export function compose(kit: Kit, hex: Hex, o: ComposeOptions): string {
  const c = context(kit, resolveInks(hex, o.scheme), o.width, o.height, o.seed);
  const withText = Boolean(o.text) || Boolean(o.profile);
  if (o.recipe === "corner") {
    // Text sits top-left, so the motif takes the opposite corner.
    const where = withText
      ? "br"
      : pick(c.rng, ["br", "bl", "tr", "tl"] as const);
    corner(c, where);
  } else if (o.recipe === "row") row(c, withText);
  else if (o.recipe === "tile") tile(c, withText);
  else band(c);
  if (o.profile) profile(c);
  if (o.text) textBlock(c, o.text);
  return wrap(
    c,
    `data-recipe="${o.recipe}" data-scheme="${o.scheme}" data-seed="${o.seed}" data-motif="${c.motif}"`,
  );
}

/** Avatar (A5): the civilian on a flat ground, safe for a circular crop. */
export function avatar(
  kit: Kit,
  hex: Hex,
  o: { size: number; scheme: SchemeName },
): string {
  const c = context(kit, resolveInks(hex, o.scheme), o.size, o.size, 0);
  const height = o.size * 0.6;
  figure(c, (o.size - (120 * height) / 364) / 2, o.size * 0.8, height);
  return wrap(c, `data-recipe="avatar" data-scheme="${o.scheme}"`);
}

/**
 * Callout background (A4). Fluid: no viewBox, so it fills any box. The
 * texture and the motif are anchored to the right edge and bottom-right
 * corner; everything left of them stays flat tint for text (C4).
 */
export function calloutBackground(
  kit: Kit,
  o: {
    tint: string;
    /** Texture colour. */
    tone: string;
    /** Motif colours, innermost first. */
    colors: [string, string, string];
    motif: (typeof CORNER_MOTIFS)[number];
    seed: number;
  },
): string {
  // A 32px module puts the largest motif at about 96 to 115px.
  const rings = cornerRings(o.motif, 32, o.colors);
  const pieces = [...rings]
    .reverse()
    .map((r) => {
      const piece = kit.shapes[r.name];
      if (!piece) throw new Error(`Unknown piece: ${r.name}`);
      return put(piece, {
        x: -r.size,
        y: -r.size,
        size: r.size,
        color: r.color,
        rot: r.name === "stair" ? 0 : TURN.br,
      });
    })
    .join("");
  return (
    `<svg ${NS} width="100%" height="100%" data-recipe="callout" data-motif="${o.motif}" data-seed="${o.seed}">\n` +
    `<defs><linearGradient id="fade"><stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="0.75"/></linearGradient>${stippleFilter("stipple", o.tone, o.seed)}</defs>\n` +
    `<rect width="100%" height="100%" fill="${o.tint}"/>\n` +
    `<svg x="100%" overflow="visible"><rect x="-240" width="240" height="100%" fill="url(#fade)" filter="url(#stipple)"/></svg>\n` +
    `<svg x="100%" y="100%" overflow="visible">${pieces}</svg>\n` +
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
