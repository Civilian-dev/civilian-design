/**
 * The pattern library: one construction with a few dials (DESIGN.md,
 * Patterns). A tile is repeated on a square grid in the colour of the
 * surface it sits on, over a two-colour noise gradient, so the noise shows
 * only through the gaps.
 *
 * By default the output is coloured by CSS custom properties, so one
 * pattern works in light and dark and follows the theme. Pass `paint` with
 * resolved colours for renderers that have no CSS (rasters, PDFs).
 */
import type { Kit } from "./compose.js";

/** The pieces a pattern may repeat; `none` is grain (the gradient alone). */
export const TILES = [
  "triangle",
  "quarter-disc",
  "half-disc",
  "disc",
  "check",
] as const;

export type Tile = (typeof TILES)[number] | "none";
export type Turn = 0 | 90 | 180 | 270;
export type Direction = "down" | "diagonal" | "edge";

/** The three colours of a pattern, as any CSS colour value. */
export interface Paint {
  /** The ground the noise starts from. */
  from: string;
  /** The noise colour. */
  to: string;
  /** The tile: the colour of the surface the pattern sits on. */
  tile: string;
}

/** Colours from custom properties; see `patterns.css` for their defaults. */
export const CSS_PAINT: Paint = {
  from: "var(--cv-pattern-from)",
  to: "var(--cv-pattern-to)",
  tile: "var(--cv-pattern-tile)",
};

export interface PatternOptions {
  tile: Tile;
  turn?: Turn;
  dir?: Direction;
  /** Tile size in px. Size the box to a whole number of tiles. */
  size?: number;
  /** Soft noise for interface surfaces; crisp noise is for artwork. */
  soft?: boolean;
  /** Noise seed. Changes the grain, never the layout. */
  seed?: number;
  /** Prefix for the SVG ids. Must be unique on the page. */
  id?: string;
  /** Resolved colours. Leave out to colour by custom properties. */
  paint?: Paint;
}

const VECTORS: Record<Direction, string> = {
  down: 'x1="0" y1="0" x2="0" y2="1"',
  diagonal: 'x1="0" y1="1" x2="1" y2="0"',
  edge: 'x1="0" y1="0" x2="1" y2="0"',
};

/**
 * Noise: thresholds turbulence against the source alpha and floods the
 * result with the noise colour. Crisp gives hard printed dots; soft leaves
 * partial alpha, so the fade reads as grain, not speckle.
 */
function noise(id: string, seed: number, soft: boolean, to: string): string {
  const [slope, intercept] = soft ? [3, -1.1] : [14, -6.5];
  return (
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed}" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.4 0 0 0 -0.7" result="a"/>` +
    `<feComposite in="SourceGraphic" in2="a" operator="arithmetic" k1="0" k2="1.4" k3="1" k4="-0.62"/>` +
    `<feComponentTransfer result="t"><feFuncA type="linear" slope="${slope}" intercept="${intercept}"/></feComponentTransfer>` +
    `<feFlood style="flood-color:${to}"/><feComposite in2="t" operator="in"/>` +
    "</filter>"
  );
}

/** A pattern as an inline SVG string that fills its box. */
export function pattern(kit: Kit, o: PatternOptions): string {
  const t = o.size ?? 24;
  const dir = o.dir ?? "down";
  const seed = o.seed ?? 1;
  const id = o.id ?? `cv-${o.tile}-${o.turn ?? 0}-${dir}-${t}-s${seed}`;
  const paint = o.paint ?? CSS_PAINT;
  // An edge fade ends below full strength; a page may lower it further.
  const end = o.paint
    ? 'stop-opacity="0.9"'
    : 'style="stop-opacity:var(--cv-noise-max, 0.9)"';
  const stops =
    dir === "edge"
      ? `<stop offset="0" stop-opacity="0"/><stop offset="1" ${end}/>`
      : '<stop offset="0" stop-opacity="0"/><stop offset="0.5" stop-opacity="0.5"/><stop offset="1" stop-opacity="1"/>';
  let cell = "";
  let over = "";
  if (o.tile !== "none") {
    const piece = kit.shapes[o.tile === "check" ? "square" : o.tile];
    if (!piece) throw new Error(`Unknown tile: ${o.tile}`);
    const s = Math.round((t / piece.w) * 10000) / 10000;
    const spin = o.turn
      ? ` rotate(${o.turn} ${piece.w / 2} ${piece.h / 2})`
      : "";
    const one = (x: number, y: number) =>
      `<g transform="translate(${x} ${y}) scale(${s})${spin}">${piece.body}</g>`;
    const span = o.tile === "check" ? t * 2 : t;
    const tiles = o.tile === "check" ? one(0, 0) + one(t, t) : one(0, 0);
    cell = `<pattern id="${id}-p" patternUnits="userSpaceOnUse" width="${span}" height="${span}" style="fill:${paint.tile}">${tiles}</pattern>`;
    over = `<rect width="100%" height="100%" fill="url(#${id}-p)"/>`;
  }
  return (
    `<svg class="cv-pattern" data-tile="${o.tile}" data-turn="${o.turn ?? 0}" data-direction="${dir}" data-size="${t}" data-noise="${o.soft ? "soft" : "crisp"}" aria-hidden="true">` +
    `<defs><linearGradient id="${id}-g" ${VECTORS[dir]}>${stops}</linearGradient>${noise(`${id}-f`, seed, o.soft ?? false, paint.to)}${cell}</defs>` +
    `<rect width="100%" height="100%" style="fill:${paint.from}"/>` +
    `<rect width="100%" height="100%" fill="url(#${id}-g)" filter="url(#${id}-f)"/>${over}</svg>`
  );
}

export interface CalloutArtOptions {
  /** Defaults to the triangle. Any tile except grain. */
  tile?: Exclude<Tile, "none">;
  turn?: Turn;
  seed?: number;
  id?: string;
  paint?: Paint;
}

/**
 * A callout's art: a fine tile over a soft noise fade from the right edge.
 * Place it in a box at the callout's right edge, at most `ART_WIDTH` wide
 * and a third of the callout, and set the paint to the callout's tint
 * (`from`, `tile`) and tone (`to`). No pieces.
 */
export function calloutArt(kit: Kit, o: CalloutArtOptions = {}): string {
  return pattern(kit, {
    tile: o.tile ?? "triangle",
    turn: o.turn,
    dir: "edge",
    size: 12,
    soft: true,
    seed: o.seed,
    id: o.id,
    paint: o.paint,
  });
}
