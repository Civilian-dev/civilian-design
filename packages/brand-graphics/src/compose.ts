/**
 * Composer for Civilian brand graphics. Pure functions: kit + colours in,
 * SVG string out. Rule ids (G1, C3, L4, ...) refer to DESIGN.md at the repo root.
 */

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

/** Looks up a primitive colour by token path, e.g. `salmon.300`. */
export type Hex = (path: string) => string;

export type Layout = "sign" | "ledger";
export type Feature = "none" | "grain" | "weave";

type Pair = readonly [from: string, to: string];

interface Scheme {
  ground: string;
  ink: string;
  muted: string;
  /** Top band colour; `null` for layouts framed by rules only. */
  band: string | null;
  bullet: string;
  bulletInk: string;
  /** Key colours, first piece first (G3). */
  key: readonly [string, string, string];
  /** The one large piece in a grain block (G5). */
  piece: string;
  grain: readonly Pair[];
  weave: readonly Pair[];
}

/**
 * Colour schemes as token paths (C2). Keep in step with the table in
 * DESIGN.md. Values are read from the design tokens at build time.
 */
export const SCHEMES = {
  paper: {
    ground: "base.paper",
    ink: "teal.900",
    muted: "neutral.800",
    band: "teal.900",
    bullet: "red.500",
    bulletInk: "base.paper",
    key: ["teal.900", "red.500", "gold.300"],
    piece: "teal.900",
    grain: [["salmon.300", "red.500"]],
    weave: [
      ["teal.900", "red.500"],
      ["teal.900", "teal.500"],
    ],
  },
  concrete: {
    ground: "neutral.200",
    ink: "teal.900",
    muted: "teal.900",
    band: null,
    bullet: "red.500",
    bulletInk: "base.paper",
    key: ["teal.900", "red.500", "salmon.300"],
    piece: "teal.900",
    grain: [["salmon.300", "red.500"]],
    weave: [
      ["teal.900", "teal.500"],
      ["teal.900", "salmon.300"],
    ],
  },
  night: {
    ground: "teal.900",
    ink: "base.paper",
    muted: "teal.300",
    band: "teal.500",
    bullet: "red.500",
    bulletInk: "base.paper",
    key: ["base.paper", "red.500", "gold.300"],
    piece: "teal.900",
    grain: [["salmon.300", "red.500"]],
    weave: [["salmon.300", "red.500"]],
  },
} as const satisfies Record<string, Scheme>;

export type SchemeName = keyof typeof SCHEMES;

export interface TextBlock {
  /** One letter for the route bullet (G4), e.g. "A" for article. */
  letter: string;
  /** Content type, e.g. "Article". */
  kind: string;
  /** Running number, e.g. "012". */
  number: string;
  /** Section, e.g. "Field notes". */
  section: string;
  /** One or two lines, wrapped by the caller. */
  title: readonly string[];
  /** Facts for the footer, e.g. "14 Nov 2026 · 6 min". */
  meta: string;
}

export interface ComposeOptions {
  width: number;
  height: number;
  layout: Layout;
  scheme: SchemeName;
  feature: Feature;
  seed: number;
  /** Omit for backgrounds: the page sets the text (P8). */
  text?: TextBlock;
  /** Profile banner: wordmark as the title, the civilian as the feature. */
  profile?: boolean;
}

export const FONTS = {
  heading: "Poppins, 'Helvetica Neue', Arial, sans-serif",
  mono: "'Monaspace Xenon', ui-monospace, Menlo, monospace",
} as const;

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const WORDMARK = "civilian.dev";
/** Pieces allowed in the key and the weave (square bounds only). */
const KEY_PIECES = ["disc", "quarter-disc", "triangle", "square"] as const;
const WEAVE_PIECES = ["triangle", "quarter-disc"] as const;

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
  for (const [pattern, what] of FORBIDDEN) {
    if (pattern.test(body)) throw new Error(`${name}: must not have ${what}`);
  }
  return { w: Number(vb[1]), h: Number(vb[2]), body };
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

/**
 * Rule thickness for a module. Always even, so a stroke centred on a whole
 * pixel has whole-pixel edges and the cells either side stay integral.
 */
function ruleWidth(u: number): number {
  return 2 * Math.max(1, Math.round(u / 104));
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rect(b: Box, attrs: string): string {
  return `<rect x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}" ${attrs}/>`;
}

/** Place a piece by its top-left corner at a given height (G2). */
function put(
  piece: Piece,
  x: number,
  y: number,
  height: number,
  colour: string,
  turn = 0,
): string {
  const s = height / piece.h;
  const spin = turn
    ? ` rotate(${turn} ${n(piece.w / 2)} ${n(piece.h / 2)})`
    : "";
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${Math.round(s * 10000) / 10000})${spin}" fill="${colour}">${piece.body}</g>`;
}

/**
 * Stipple: thresholds noise against the source alpha and floods the result
 * with `color`, so an alpha gradient becomes a printed fade (G6).
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

type Direction = "down" | "diagonal" | "left";

const VECTORS: Record<Direction, string> = {
  down: 'x1="0" y1="0" x2="0" y2="1"',
  diagonal: 'x1="0" y1="1" x2="1" y2="0"',
  left: 'x1="0" y1="0" x2="1" y2="0"',
};

interface Ctx {
  kit: Kit;
  hex: Hex;
  o: ComposeOptions;
  s: { [K in keyof Scheme]: Scheme[K] };
  rng: Rng;
  /** Module (G1). */
  u: number;
  defs: string[];
  out: string[];
}

function shape(c: Ctx, name: string): Piece {
  const piece = c.kit.shapes[name];
  if (!piece) throw new Error(`Unknown shape: ${name}`);
  return piece;
}

/** A two-colour noise gradient filling a box (G6). */
function noise(c: Ctx, id: string, b: Box, pair: Pair, dir: Direction): void {
  const [from, to] = pair;
  c.defs.push(
    `<linearGradient id="${id}-g" ${VECTORS[dir]}><stop offset="0" stop-opacity="0"/><stop offset="0.5" stop-opacity="0.5"/><stop offset="1" stop-opacity="1"/></linearGradient>`,
    stippleFilter(`${id}-f`, c.hex(to), c.o.seed),
  );
  c.out.push(
    rect(b, `fill="${c.hex(from)}"`),
    rect(b, `fill="url(#${id}-g)" filter="url(#${id}-f)"`),
  );
}

/** Small tiles in the ground colour over a noise gradient (G5 weave). */
function weave(c: Ctx, b: Box, tile: number): void {
  const id = `w${c.o.seed}`;
  const piece = shape(c, pick(c.rng, WEAVE_PIECES));
  const turn = pick(c.rng, [0, 90, 180, 270] as const);
  noise(c, id, b, pick(c.rng, c.s.weave), "down");
  c.defs.push(
    `<pattern id="${id}-p" patternUnits="userSpaceOnUse" x="${n(b.x)}" y="${n(b.y)}" width="${n(tile)}" height="${n(tile)}">${put(piece, 0, 0, tile, c.hex(c.s.ground), turn)}</pattern>`,
  );
  c.out.push(rect(b, `fill="url(#${id}-p)"`));
}

/** A noise gradient with one quarter-disc anchored in the corner (G5 grain). */
function grain(c: Ctx, b: Box): void {
  noise(c, `g${c.o.seed}`, b, pick(c.rng, c.s.grain), "diagonal");
  const r = Math.min(b.w, b.h) * 0.66;
  c.out.push(
    put(
      shape(c, "quarter-disc"),
      b.x + b.w - r,
      b.y + b.h - r,
      r,
      c.hex(c.s.piece),
      270,
    ),
  );
}

function label(
  c: Ctx,
  x: number,
  y: number,
  size: number,
  text: string,
  colour: string,
  anchor: "start" | "end" = "start",
): void {
  c.out.push(
    `<text x="${n(x)}" y="${n(y)}" font-family="${FONTS.mono}" font-size="${n(size)}" font-weight="500" letter-spacing="0.1em" text-anchor="${anchor}" fill="${colour}">${esc(text.toUpperCase())}</text>`,
  );
}

function heading(
  c: Ctx,
  x: number,
  y: number,
  size: number,
  text: string,
  tracking = "-0.025em",
): void {
  c.out.push(
    `<text x="${n(x)}" y="${n(y)}" font-family="${FONTS.heading}" font-size="${n(size)}" font-weight="600" letter-spacing="${tracking}" fill="${c.hex(c.s.ink)}">${esc(text)}</text>`,
  );
}

/** Three pieces of one size on one baseline, flush right (G3). */
function key(c: Ctx, right: number, top: number, size: number): void {
  const names = [...KEY_PIECES];
  const gap = size * 0.4;
  let x = right - size * 3 - gap * 2;
  for (const colour of c.s.key) {
    const [name] = names.splice(Math.floor(c.rng() * names.length), 1);
    c.out.push(put(shape(c, name as string), x, top, size, c.hex(colour)));
    x += size + gap;
  }
}

// --- layouts ---------------------------------------------------------------

/** Band, bullet row, rule, body, rule, footer row (DESIGN.md Layout). */
function sign(c: Ctx): void {
  const { width: W, height: H, text, feature, profile } = c.o;
  const u = c.u;
  const ink = c.hex(c.s.ink);
  const m = Math.round(W * 0.06);
  const rule = ruleWidth(u);
  const top = Math.round(u * 1.714);
  // Snap the body to a multiple of 36 so 9 or 12 rows of tiles are whole
  // pixels and the weave has no seams (G5).
  const bodyH = Math.round((H - Math.round(u * 1.162) - top - rule) / 36) * 36;
  const bottom = top + rule + bodyH;
  const body: Box = { x: m, y: top + rule, w: W - m * 2, h: bodyH };

  if (c.s.band) {
    c.out.push(
      rect(
        { x: 0, y: 0, w: W, h: Math.round(u * 0.267) },
        `fill="${c.hex(c.s.band)}"`,
      ),
    );
  }

  if (text) {
    const r = u * 0.343;
    const cy = u * 1.067;
    c.out.push(
      `<circle cx="${n(m + r)}" cy="${n(cy)}" r="${n(r)}" fill="${c.hex(c.s.bullet)}"/>`,
      `<text x="${n(m + r)}" y="${n(cy + r * 0.44)}" font-family="${FONTS.heading}" font-size="${n(r * 1.22)}" font-weight="600" text-anchor="middle" fill="${c.hex(c.s.bulletInk)}">${esc(text.letter)}</text>`,
    );
    const lx = m + r * 2 + u * 0.267;
    label(c, lx, u * 0.99, u * 0.171, text.kind, ink);
    label(
      c,
      lx,
      u * 1.257,
      u * 0.171,
      `No. ${text.number} · ${text.section}`,
      c.hex(c.s.muted),
    );
  }

  // Feature block: bounded by the two rules, flush with the right margin (G5).
  if (profile) {
    const h = body.h - u * 0.3;
    const figure = c.kit.mark;
    const w = (h * figure.w) / figure.h;
    c.out.push(put(figure, W - m - w - u * 0.5, bottom - h, h, ink));
  } else if (feature !== "none") {
    const rows = pick(c.rng, [9, 12] as const);
    const tile = body.h / rows;
    const cols = Math.max(4, Math.round((W * 0.245) / tile));
    const block: Box = {
      x: W - m - cols * tile,
      y: body.y,
      w: cols * tile,
      h: body.h,
    };
    if (feature === "weave") {
      weave(c, block, tile);
    } else {
      grain(c, block);
      c.out.push(
        rect(
          { x: block.x - rule, y: top, w: rule, h: bottom - top },
          `fill="${ink}"`,
        ),
      );
    }
  }

  c.out.push(
    rect({ x: m, y: top, w: W - m * 2, h: rule }, `fill="${ink}"`),
    rect({ x: m, y: bottom, w: W - m * 2, h: rule }, `fill="${ink}"`),
  );

  const title = profile ? ["Civilian", ".dev"] : (text?.title ?? []);
  title.forEach((line, i) => {
    heading(c, m, top + u * (1.257 + i * 1.01), u * 0.876, line);
  });

  if (text || profile) {
    heading(c, m, H - u * 0.61, u * 0.248, WORDMARK, "-0.01em");
  }
  if (text) {
    label(
      c,
      m + u * 2.457,
      H - u * 0.629,
      u * 0.152,
      text.meta,
      c.hex(c.s.muted),
    );
  }
  const size = u * 0.381;
  key(c, W - m, H - u * 0.857, size);
}

/** A ruled frame of six cells; the feature fills the middle-right cell. */
function ledger(c: Ctx): void {
  const { width: W, height: H, text, feature } = c.o;
  const u = c.u;
  const ink = c.hex(c.s.ink);
  const f = Math.round(u * 0.381);
  const rule = ruleWidth(u);
  // Grow the label rows until the middle cell is 12 whole-pixel tiles high.
  // An odd height gives the footer row the spare pixel, so the cell height
  // is even and stepping both rows (2px a step) reaches a multiple of 12.
  let row = Math.round(u * 0.838);
  const spare = H % 2;
  const cellHeight = () => H - f * 2 - row * 2 - spare - rule;
  for (let i = 0; i < 6 && cellHeight() % 12 !== 0; i++) row++;
  if (cellHeight() % 12 !== 0) {
    throw new Error(`ledger: no whole-pixel tile at height ${H}`);
  }
  const footer = row + spare;
  const top = f + row;
  const bottom = H - f - footer;
  // Size the feature cell in whole tiles: 12 down, 10 across (G5).
  const cellH = bottom - top - rule;
  const tile = cellH / 12;
  const cellW = tile * 10;
  const vx = W - f - rule / 2 - cellW - rule;
  const cell: Box = {
    x: vx + rule,
    y: top + rule / 2,
    w: cellW,
    h: cellH + rule / 2,
  };
  const pad = u * 0.305;

  if (feature === "weave")
    weave(c, { ...cell, y: top + rule / 2, h: tile * 12 }, tile);
  if (feature === "grain") grain(c, cell);

  const half = rule / 2;
  c.out.push(
    `<g fill="none" stroke="${ink}" stroke-width="${rule}"><rect x="${f}" y="${f}" width="${W - f * 2}" height="${H - f * 2}"/><path d="M${f} ${top}H${W - f}M${f} ${bottom}H${W - f}M${n(vx + half)} ${f}V${H - f}"/></g>`,
  );

  if (text) {
    const ly = f + row * 0.59;
    label(c, f + pad, ly, u * 0.171, text.kind, ink);
    label(c, vx - pad, ly, u * 0.171, text.number, ink, "end");
    label(c, vx + rule + pad, ly, u * 0.171, WORDMARK, ink);
    text.title.forEach((line, i) => {
      heading(c, f + pad, top + u * (1.543 + i * 0.933), u * 0.8, line);
    });
    const by = bottom + footer * 0.59;
    label(c, f + pad, by, u * 0.152, text.meta, ink);
    label(c, vx + rule + pad, by, u * 0.152, text.section, ink);
  }
  // The one marker (C4).
  const mark = u * 0.229;
  c.out.push(
    rect(
      {
        x: W - f - pad - mark,
        y: bottom + (footer - mark) / 2,
        w: mark,
        h: mark,
      },
      `fill="${c.hex(c.s.bullet)}"`,
    ),
  );
}

// --- entry points ----------------------------------------------------------

function wrap(c: Ctx, meta: string): string {
  const { width: W, height: H } = c.o;
  return (
    `<svg ${NS} viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${meta}>\n` +
    (c.defs.length ? `<defs>${c.defs.join("")}</defs>\n` : "") +
    `<rect width="${W}" height="${H}" fill="${c.hex(c.s.ground)}"/>\n` +
    `${c.out.join("\n")}\n</svg>\n`
  );
}

/** Compose one artefact. The same options always return the same SVG (G9). */
export function compose(kit: Kit, hex: Hex, o: ComposeOptions): string {
  const c: Ctx = {
    kit,
    hex,
    o,
    s: SCHEMES[o.scheme],
    rng: mulberry32(o.seed),
    u: o.height / 6,
    defs: [],
    out: [],
  };
  if (o.layout === "ledger") ledger(c);
  else sign(c);
  return wrap(
    c,
    `data-layout="${o.layout}" data-scheme="${o.scheme}" data-feature="${o.feature}" data-seed="${o.seed}"`,
  );
}

/** The civilian on a flat ground; survives a circular crop (A5). */
export function avatar(kit: Kit, hex: Hex, scheme: SchemeName): string {
  const s = SCHEMES[scheme];
  const size = 400;
  const h = 240;
  const w = (h * kit.mark.w) / kit.mark.h;
  return (
    `<svg ${NS} viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-scheme="${scheme}">\n` +
    `<rect width="${size}" height="${size}" fill="${hex(s.ground)}"/>\n` +
    `${put(kit.mark, (size - w) / 2, (size - h) / 2, h, hex(s.ink))}\n</svg>\n`
  );
}

export type Hue = "salmon" | "gold" | "teal" | "violet";

/**
 * Fluid callout background: a stipple fade from the right edge over the
 * tint, with one small piece in the corner (A4). No viewBox, so it fills
 * any box.
 */
export function calloutBackground(
  kit: Kit,
  hex: Hex,
  hue: Hue,
  seed: number,
): string {
  const piece = kit.shapes["quarter-disc"];
  if (!piece) throw new Error("Unknown shape: quarter-disc");
  const size = 56;
  return (
    `<svg ${NS} width="100%" height="100%" data-feature="stipple" data-hue="${hue}" data-seed="${seed}">\n` +
    `<defs><linearGradient id="c-g" ${VECTORS.left}><stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="0.9"/></linearGradient>${stippleFilter("c-f", hex(`${hue}.300`), seed)}</defs>\n` +
    `<rect width="100%" height="100%" fill="${hex(`${hue}.50`)}"/>\n` +
    `<rect x="60%" width="40%" height="100%" fill="url(#c-g)" filter="url(#c-f)"/>\n` +
    `<svg x="100%" y="100%" overflow="visible">${put(piece, -size, -size, size, hex(`${hue}.500`), 270)}</svg>\n` +
    "</svg>\n"
  );
}

/** Fluid section texture: a noise gradient, optionally under a weave (A6). */
export function texture(
  kit: Kit,
  hex: Hex,
  o: { scheme: SchemeName; feature: "grain" | "weave"; seed: number },
): string {
  const s = SCHEMES[o.scheme];
  const [from, to] = (o.feature === "weave" ? s.weave : s.grain)[0] as Pair;
  const tile = 32;
  const triangle = kit.shapes.triangle;
  if (!triangle) throw new Error("Unknown shape: triangle");
  const dir = o.feature === "weave" ? VECTORS.down : VECTORS.left;
  const over =
    o.feature === "weave"
      ? `<rect width="100%" height="100%" fill="url(#t-p)"/>\n`
      : "";
  const pattern =
    o.feature === "weave"
      ? `<pattern id="t-p" patternUnits="userSpaceOnUse" width="${tile}" height="${tile}">${put(triangle, 0, 0, tile, hex(s.ground))}</pattern>`
      : "";
  return (
    `<svg ${NS} width="100%" height="100%" data-feature="${o.feature}" data-scheme="${o.scheme}" data-seed="${o.seed}">\n` +
    `<defs><linearGradient id="t-g" ${dir}><stop offset="0" stop-opacity="0"/><stop offset="0.5" stop-opacity="0.5"/><stop offset="1" stop-opacity="1"/></linearGradient>${stippleFilter("t-f", hex(to), o.seed)}${pattern}</defs>\n` +
    `<rect width="100%" height="100%" fill="${hex(from)}"/>\n` +
    `<rect width="100%" height="100%" fill="url(#t-g)" filter="url(#t-f)"/>\n` +
    `${over}</svg>\n`
  );
}
