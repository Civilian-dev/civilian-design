/**
 * Composer for Civilian brand graphics. Pure functions: kit and colours in,
 * SVG string out. Every artefact is the card from DESIGN.md (Components,
 * Card), drawn as a standalone image: a 2px ink frame of six cells on the
 * card's own ground, with an optional pattern in the feature cell.
 */
import { calloutArt, pattern, TILES, type Tile, type Turn } from "./pattern.js";

export interface Piece {
  w: number;
  h: number;
  body: string;
}

export interface Kit {
  shapes: Record<string, Piece>;
  /** The civilian figure. */
  mark: Piece;
}

export type Theme = "light" | "dark";

/**
 * Looks up a colour by token path for a theme, e.g. `bg.emphasized` or
 * `red.500`. Primitives resolve the same in both themes.
 */
export type Hex = (path: string, theme?: Theme) => string;

export type Feature = "none" | "grain" | "weave";
export type Hue = "salmon" | "gold" | "teal" | "violet";

type Pair = readonly [from: string, to: string];

interface ThemeColours {
  /** The card's ground, different from the page so it sits apart. */
  ground: string;
  /** The page ground, for avatars and section textures. */
  page: string;
  ink: string;
  muted: string;
  signal: string;
  onSignal: string;
  /** Key colours, ink first; at most one red. */
  key: readonly [string, string, string];
  weave: readonly Pair[];
  grain: readonly Pair[];
}

/** Colours per theme, as token paths (DESIGN.md, Colors). */
export const THEMES = {
  light: {
    ground: "bg.emphasized",
    page: "bg.canvas",
    ink: "fg.default",
    muted: "fg.subtle",
    signal: "red.500",
    onSignal: "base.white",
    key: ["fg.default", "red.500", "highlight.solid"],
    weave: [
      ["fg.default", "red.500"],
      ["fg.default", "teal.500"],
    ],
    grain: [["accent.solid", "red.500"]],
  },
  dark: {
    ground: "bg.default",
    page: "bg.canvas",
    ink: "fg.default",
    muted: "fg.subtle",
    signal: "red.500",
    onSignal: "base.white",
    key: ["fg.default", "red.500", "highlight.solid"],
    weave: [["accent.solid", "red.500"]],
    grain: [["accent.solid", "red.500"]],
  },
} as const satisfies Record<Theme, ThemeColours>;

export interface TextBlock {
  /** One capital letter for the bullet, e.g. "A" for article. */
  letter: string;
  /** Content type, e.g. "Article". */
  kind: string;
  /** Running number, e.g. "012". */
  number: string;
  /** Section, e.g. "Field notes". */
  section: string;
  /** One or two lines, wrapped by the caller. */
  title: readonly string[];
  /** Facts for the bottom row, e.g. "14 Nov 2026 · 6 min". */
  meta: string;
}

export interface ComposeOptions {
  width: number;
  height: number;
  theme: Theme;
  feature: Feature;
  seed: number;
  /** Leave out for a background: the page sets the text over `layout()`. */
  text?: TextBlock;
  /** Profile banner: the wordmark as the title, the civilian as the feature. */
  profile?: boolean;
  /** Defaults to `civilian.dev`. */
  wordmark?: string;
  /** The weave's tile; the seed chooses when left out. */
  tile?: Exclude<Tile, "none">;
  /** The weave's quarter turn; the seed chooses when left out. */
  turn?: Turn;
}

export const FONTS = {
  heading: "Poppins, 'Helvetica Neue', Arial, sans-serif",
  body: "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif",
  mono: "'Monaspace Xenon', ui-monospace, Menlo, monospace",
} as const;

export const WORDMARK = "civilian.dev";

const NS = 'xmlns="http://www.w3.org/2000/svg"';
/** Pieces allowed in the key (square bounds only). */
const KEY_PIECES = ["disc", "quarter-disc", "triangle", "square"] as const;
const TURNS: readonly Turn[] = [0, 90, 180, 270];

/** What a source SVG body must not contain (README, Source rules). */
const FORBIDDEN: readonly [RegExp, string][] = [
  [/\sid=/, "an id"],
  [/<style|\sstyle=/, "a style"],
  [/#[0-9a-f]{3,8}\b/i, "a hex colour"],
  [/\sstroke/, "a stroke"],
  [/\sfill=/, "a fill below the root"],
];

/**
 * Parse a single-colour source SVG into a placeable piece. Throws if the
 * source breaks the rules in the README, so a bad file fails the build.
 */
export function parsePiece(svg: string, name = "source SVG"): Piece {
  const m = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  const root = m?.[1] ?? "";
  const vb = root.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!m || !vb) throw new Error(`${name}: needs a root viewBox at 0 0`);
  if (!/\sfill="currentColor"/.test(root)) {
    throw new Error(`${name}: needs fill="currentColor" on the root`);
  }
  const body = (m[2] ?? "")
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
  for (const [p, what] of FORBIDDEN) {
    if (p.test(body)) throw new Error(`${name}: must not have ${what}`);
  }
  return { w: Number(vb[1]), h: Number(vb[2]), body };
}

// --- helpers -----------------------------------------------------------------

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

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

/** Round to two decimals so output is stable and short. */
function n(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rectangle with extra attributes, e.g. `rect(box, 'fill="#000"')`. */
export function rect(b: Box, attrs: string): string {
  return `<rect x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}" ${attrs}/>`;
}

/**
 * Place a piece by its top-left corner at a given height, in one colour,
 * turned by a quarter turn. The only transforms a piece may take.
 */
export function put(
  piece: Piece,
  x: number,
  y: number,
  height: number,
  colour: string,
  turn: Turn = 0,
): string {
  const s = height / piece.h;
  const spin = turn
    ? ` rotate(${turn} ${n(piece.w / 2)} ${n(piece.h / 2)})`
    : "";
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${Math.round(s * 10000) / 10000})${spin}" fill="${colour}">${piece.body}</g>`;
}

/** Nest an SVG string in a box, so it fills that box. */
function inBox(b: Box, svg: string): string {
  return `<svg x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}">${svg}</svg>`;
}

// --- layout ------------------------------------------------------------------

export interface CardLayout {
  width: number;
  height: number;
  /** Rule width in px: the frame and the gaps between cells. */
  rule: number;
  /** Feature tile size in px; the feature cell is a whole number of tiles. */
  tile: number;
  tilesX: number;
  tilesY: number;
  /** The ink frame, inset from the edges. */
  frame: Box;
  cells: {
    topLeft: Box;
    topRight: Box;
    /** Spans both columns when the card has no feature. */
    title: Box;
    feature: Box | null;
    bottomLeft: Box;
    bottomRight: Box;
  };
  /** Type sizes in px. Line heights are multiples of the size. */
  type: {
    title: number;
    titleLineHeight: number;
    label: number;
    wordmark: number;
    bullet: number;
    key: number;
    keyGap: number;
    /** Inset of text from the edge of its cell. */
    cellPad: number;
  };
}

/**
 * The card's geometry at any size. Sizes scale from the Open Graph card
 * (1200 by 630), where the module is 105px. Use it to set text in HTML over
 * a composed background: every value is in px from the top-left corner.
 */
export function layout(o: {
  width: number;
  height: number;
  feature?: Feature | boolean;
}): CardLayout {
  const { width: W, height: H } = o;
  const hasFeature =
    o.feature !== undefined && o.feature !== "none" && o.feature !== false;
  const k = Math.min(W, H) / 6 / 105;
  const rule = 2 * Math.max(1, Math.round(Math.min(W, H) / 6 / 104));
  const tilesX = 11;
  const tilesY = 12;
  const row = Math.round(88 * k);
  const padX = Math.round(40 * k);
  // The feature column is at most as wide as the title column.
  const widest = Math.floor((W - 2 * padX - 3 * rule) / (2 * tilesX));
  let tile = Math.max(8, Math.min(Math.round(32 * k), widest));
  const padYFor = (t: number) => (H - t * tilesY - 4 * rule - 2 * row) / 2;
  while (tile > 8 && padYFor(tile) < tile / 2) tile--;
  const padY = padYFor(tile);
  if (padY < 0)
    throw new Error(`layout: ${W} by ${H} is too short for the card`);
  const right = tile * tilesX;
  const frame: Box = { x: padX, y: padY, w: W - padX * 2, h: H - padY * 2 };
  const x0 = padX + rule;
  const left = frame.w - 3 * rule - right;
  if (left < right)
    throw new Error(`layout: ${W} by ${H} is too narrow for the card`);
  const xR = x0 + left + rule;
  const y0 = padY + rule;
  const yMid = y0 + row + rule;
  const yBottom = yMid + tile * tilesY + rule;
  const middle = tile * tilesY;
  return {
    width: W,
    height: H,
    rule,
    tile,
    tilesX,
    tilesY,
    frame,
    cells: {
      topLeft: { x: x0, y: y0, w: left, h: row },
      topRight: { x: xR, y: y0, w: right, h: row },
      title: {
        x: x0,
        y: yMid,
        w: hasFeature ? left : left + rule + right,
        h: middle,
      },
      feature: hasFeature ? { x: xR, y: yMid, w: right, h: middle } : null,
      bottomLeft: { x: x0, y: yBottom, w: left, h: row },
      bottomRight: { x: xR, y: yBottom, w: right, h: row },
    },
    type: {
      title: Math.round(88 * k),
      titleLineHeight: 1.1,
      label: Math.round(16 * k),
      wordmark: Math.round(20 * k),
      bullet: Math.round(48 * k),
      key: Math.round(32 * k),
      keyGap: Math.round(8 * k),
      cellPad: Math.round(32 * k),
    },
  };
}

/**
 * The title cell and type sizes as CSS custom properties, for setting a
 * title in HTML over a composed background of the same size.
 */
export function layoutVars(l: CardLayout): Record<string, string> {
  const t = l.cells.title;
  return {
    "--cv-card-title-x": `${t.x}px`,
    "--cv-card-title-y": `${t.y}px`,
    "--cv-card-title-w": `${t.w}px`,
    "--cv-card-title-h": `${t.h}px`,
    "--cv-card-title-size": `${l.type.title}px`,
    "--cv-card-cell-pad": `${l.type.cellPad}px`,
  };
}

// --- drawing -----------------------------------------------------------------

interface Ctx {
  kit: Kit;
  col: (path: string) => string;
  c: ThemeColours;
  l: CardLayout;
  rng: Rng;
  id: string;
  out: string[];
}

function shape(x: Ctx, name: string): Piece {
  const piece = x.kit.shapes[name];
  if (!piece) throw new Error(`Unknown shape: ${name}`);
  return piece;
}

/** Text set as a label: Instrument Sans 600, uppercase, wide tracking. */
function label(
  x: Ctx,
  left: number,
  baseline: number,
  text: string,
  colour: string,
): void {
  x.out.push(
    `<text x="${n(left)}" y="${n(baseline)}" font-family="${FONTS.body}" font-size="${x.l.type.label}" font-weight="600" letter-spacing="0.1em" fill="${colour}">${esc(text.toUpperCase())}</text>`,
  );
}

function heading(
  x: Ctx,
  left: number,
  baseline: number,
  size: number,
  text: string,
): void {
  x.out.push(
    `<text x="${n(left)}" y="${n(baseline)}" font-family="${FONTS.heading}" font-size="${size}" font-weight="600" letter-spacing="-0.025em" fill="${x.col(x.c.ink)}">${esc(text)}</text>`,
  );
}

/** Baseline that centres a line of text of `size` on a row. */
const centred = (b: Box, size: number) => b.y + b.h / 2 + size * 0.36;

/** Three pieces of one size, ink first, flush right in a cell. */
function key(x: Ctx, b: Box): void {
  const { key: size, keyGap: gap, cellPad } = x.l.type;
  const names = [...KEY_PIECES];
  let left = b.x + b.w - cellPad - size * 3 - gap * 2;
  const top = b.y + (b.h - size) / 2;
  for (const colour of x.c.key) {
    const [name] = names.splice(Math.floor(x.rng() * names.length), 1);
    x.out.push(put(shape(x, name as string), left, top, size, x.col(colour)));
    left += size + gap;
  }
}

function feature(x: Ctx, o: ComposeOptions, b: Box): void {
  if (o.profile) {
    const h = b.h * 0.8;
    const w = (h * x.kit.mark.w) / x.kit.mark.h;
    x.out.push(
      put(x.kit.mark, b.x + (b.w - w) / 2, b.y + b.h - h, h, x.col(x.c.ink)),
    );
    return;
  }
  const seed = o.seed;
  if (o.feature === "weave") {
    const [from, to] = pick(x.rng, x.c.weave);
    const tile = o.tile ?? pick(x.rng, TILES);
    const turn = o.turn ?? pick(x.rng, TURNS);
    x.out.push(
      inBox(
        b,
        pattern(x.kit, {
          tile,
          turn,
          size: x.l.tile,
          dir: "down",
          seed,
          id: `${x.id}-weave`,
          paint: { from: x.col(from), to: x.col(to), tile: x.col(x.c.ground) },
        }),
      ),
    );
  } else if (o.feature === "grain") {
    const [from, to] = pick(x.rng, x.c.grain);
    x.out.push(
      inBox(
        b,
        pattern(x.kit, {
          tile: "none",
          dir: "diagonal",
          seed,
          id: `${x.id}-grain`,
          paint: { from: x.col(from), to: x.col(to), tile: x.col(x.c.ground) },
        }),
      ),
    );
    const r = Math.min(b.w, b.h) * 0.66;
    x.out.push(
      put(
        shape(x, "quarter-disc"),
        b.x + b.w - r,
        b.y + b.h - r,
        r,
        x.col(x.c.ink),
        270,
      ),
    );
  }
}

// --- entry points ------------------------------------------------------------

/**
 * Compose the card as a standalone image (Open Graph, banner, profile).
 * The same options always return the same SVG.
 */
export function compose(kit: Kit, hex: Hex, o: ComposeOptions): string {
  const hasFeature = o.profile || o.feature !== "none";
  const l = layout({ width: o.width, height: o.height, feature: hasFeature });
  const c: ThemeColours = THEMES[o.theme];
  const x: Ctx = {
    kit,
    col: (path) => hex(path, o.theme),
    c,
    l,
    rng: mulberry32(o.seed),
    id: `card-${o.theme}-${o.feature}-s${o.seed}`,
    out: [],
  };
  const { cells, type } = l;
  const ink = x.col(c.ink);
  const ground = x.col(c.ground);
  const wordmark = o.wordmark ?? WORDMARK;

  // The frame: ink behind, cells in the ground, so the gaps are the rules.
  x.out.push(rect(l.frame, `fill="${ink}"`));
  for (const cell of Object.values(cells)) {
    if (cell) x.out.push(rect(cell, `fill="${ground}"`));
  }
  if (cells.feature) feature(x, o, cells.feature);

  const pad = type.cellPad;
  if (o.text) {
    const t = o.text;
    const b = cells.topLeft;
    const r = type.bullet / 2;
    const cx = b.x + pad + r;
    const cy = b.y + b.h / 2;
    x.out.push(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${x.col(c.signal)}"/>`,
      `<text x="${n(cx)}" y="${n(cy + type.wordmark * 0.36)}" font-family="${FONTS.heading}" font-size="${type.wordmark}" font-weight="600" text-anchor="middle" fill="${x.col(c.onSignal)}">${esc(t.letter)}</text>`,
    );
    label(
      x,
      cx + r + Math.round(type.label * 0.75),
      centred(b, type.label),
      `${t.kind} · No. ${t.number}`,
      ink,
    );
    label(
      x,
      cells.bottomLeft.x + pad,
      centred(cells.bottomLeft, type.label),
      t.meta,
      x.col(c.muted),
    );
    label(
      x,
      cells.bottomRight.x + pad,
      centred(cells.bottomRight, type.label),
      t.section,
      ink,
    );
  }
  if (o.text || o.profile) {
    x.out.push(
      `<text x="${n(cells.topRight.x + pad)}" y="${n(centred(cells.topRight, type.wordmark))}" font-family="${FONTS.heading}" font-size="${type.wordmark}" font-weight="600" letter-spacing="-0.025em" fill="${ink}">${esc(wordmark)}</text>`,
    );
  }
  const title = o.profile ? [wordmark] : (o.text?.title ?? []);
  const lh = type.title * type.titleLineHeight;
  const tb = cells.title;
  const top = tb.y + (tb.h - lh * title.length) / 2;
  title.forEach((line, i) => {
    heading(
      x,
      tb.x + pad,
      top + lh * i + lh / 2 + type.title * 0.36,
      type.title,
      line,
    );
  });
  key(x, cells.bottomRight);

  const t = cells.title;
  const meta = [
    `data-theme="${o.theme}"`,
    `data-feature="${o.profile ? "profile" : o.feature}"`,
    `data-seed="${o.seed}"`,
    `data-title-x="${t.x}" data-title-y="${t.y}" data-title-w="${t.w}" data-title-h="${t.h}" data-title-size="${type.title}"`,
  ].join(" ");
  return (
    `<svg ${NS} viewBox="0 0 ${o.width} ${o.height}" width="${o.width}" height="${o.height}" ${meta}>\n` +
    `<rect width="${o.width}" height="${o.height}" fill="${ground}"/>\n` +
    `${x.out.join("\n")}\n</svg>\n`
  );
}

/** The civilian on the page ground, 400 by 400; survives a circular crop. */
export function avatar(kit: Kit, hex: Hex, theme: Theme): string {
  const c = THEMES[theme];
  const size = 400;
  const h = 240;
  const w = (h * kit.mark.w) / kit.mark.h;
  return (
    `<svg ${NS} viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-theme="${theme}">\n` +
    `<rect width="${size}" height="${size}" fill="${hex(c.page, theme)}"/>\n` +
    `${put(kit.mark, (size - w) / 2, (size - h) / 2, h, hex(c.ink, theme))}\n</svg>\n`
  );
}

export interface CalloutOptions {
  hue: Hue;
  theme: Theme;
  seed: number;
  tile?: Exclude<Tile, "none">;
  turn?: Turn;
}

/**
 * A fluid callout background: the tint, with the callout art in the right
 * third. No viewBox, so it fills any box. In light the tint is the hue's
 * step 50 and the noise step 300; in dark the ground is `bg.default` and
 * the noise step 700, at a lower strength.
 */
export function calloutBackground(
  kit: Kit,
  hex: Hex,
  o: CalloutOptions,
): string {
  const dark = o.theme === "dark";
  const tint = dark ? hex("bg.default", "dark") : hex(`${o.hue}.50`);
  const tone = hex(`${o.hue}.${dark ? 700 : 300}`);
  const art = calloutArt(kit, {
    tile: o.tile,
    turn: o.turn,
    seed: o.seed,
    id: `callout-${o.hue}-${o.theme}-s${o.seed}`,
    paint: { from: tint, to: tone, tile: tint, strength: dark ? 0.55 : 0.9 },
  });
  return (
    `<svg ${NS} width="100%" height="100%" data-hue="${o.hue}" data-theme="${o.theme}" data-seed="${o.seed}">\n` +
    `<rect width="100%" height="100%" fill="${tint}"/>\n` +
    `<svg x="67%" width="33%" height="100%">${art}</svg>\n</svg>\n`
  );
}

export interface TextureOptions {
  theme: Theme;
  seed: number;
  tile?: Tile;
  turn?: Turn;
  /** Tile size in px. Size the box to a whole number of tiles. */
  size?: number;
}

/**
 * A fluid section texture on the page ground: the footer strip, or a band
 * across a page section. The seed chooses the colour pair.
 */
export function texture(kit: Kit, hex: Hex, o: TextureOptions): string {
  const c: ThemeColours = THEMES[o.theme];
  const [from, to] = pick(mulberry32(o.seed), c.weave);
  const svg = pattern(kit, {
    tile: o.tile ?? "quarter-disc",
    turn: o.turn,
    size: o.size ?? 24,
    dir: "down",
    seed: o.seed,
    id: `texture-${o.theme}-s${o.seed}`,
    paint: {
      from: hex(from, o.theme),
      to: hex(to, o.theme),
      tile: hex(c.page, o.theme),
    },
  });
  return `<svg ${NS} width="100%" height="100%" data-theme="${o.theme}" data-seed="${o.seed}">${svg}</svg>\n`;
}

// --- theme contract ----------------------------------------------------------

/** The bounded choices a derivative theme may make (DESIGN.md, Theme contract). */
export interface ThemeChoices {
  theme?: Theme;
  feature?: Feature;
  tile?: Exclude<Tile, "none">;
  turn?: Turn;
  calloutHue?: Hue;
  /** One capital letter for the bullet. */
  letter?: string;
  wordmark?: string;
}

export type DefinedTheme = Readonly<Required<ThemeChoices>>;

/**
 * Check a theme's choices and fill in the defaults. Types bound most of
 * them; the letter and wordmark are checked here, because a string type
 * cannot.
 */
export function defineTheme(choices: ThemeChoices = {}): DefinedTheme {
  const theme: Required<ThemeChoices> = {
    theme: "light",
    feature: "weave",
    tile: "triangle",
    turn: 0,
    calloutHue: "salmon",
    letter: "A",
    wordmark: WORDMARK,
    ...choices,
  };
  if (!/^[A-Z]$/.test(theme.letter)) {
    throw new Error(
      `defineTheme: the bullet letter must be one capital, got "${theme.letter}"`,
    );
  }
  if (!theme.wordmark.trim()) {
    throw new Error("defineTheme: the wordmark cannot be empty");
  }
  return Object.freeze(theme);
}
