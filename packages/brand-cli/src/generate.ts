/**
 * Standalone pattern images: a pattern from @civilian-dev/brand-graphics at
 * a fixed size, painted with resolved token colours so it renders anywhere
 * (an SVG file, a PNG). The dials are the ones in DESIGN.md, Patterns.
 */
import {
  type Direction,
  hex,
  pattern,
  type Theme,
  TILES,
  type Tile,
  type Turn,
} from "@civilian-dev/brand-graphics";

/** Tiles by their CLI name; `grain` is the gradient with no tile. */
export const TILE_NAMES = ["grain", ...TILES] as const;
export type TileName = (typeof TILE_NAMES)[number];

/**
 * The surface a pattern sits on: the background colour, which is also the
 * tile colour. Its theme picks the noise colours. Grounds are the page and
 * card grounds; colours are the solid brand colours.
 */
export const SURFACES = {
  paper: { label: "Paper", group: "Light", theme: "light", token: "bg.canvas" },
  concrete: {
    label: "Concrete",
    group: "Light",
    theme: "light",
    token: "bg.emphasized",
  },
  brand: {
    label: "Brand",
    group: "Colour",
    theme: "light",
    token: "brand.solid",
  },
  accent: {
    label: "Accent",
    group: "Colour",
    theme: "light",
    token: "accent.solid",
  },
  highlight: {
    label: "Highlight",
    group: "Colour",
    theme: "light",
    token: "highlight.solid",
  },
  dark: { label: "Dark", group: "Dark", theme: "dark", token: "bg.canvas" },
  "dark-card": {
    label: "Dark card",
    group: "Dark",
    theme: "dark",
    token: "bg.default",
  },
} as const satisfies Record<
  string,
  { label: string; group: string; theme: Theme; token: string }
>;
export type Surface = keyof typeof SURFACES;

/** Noise pairs, from and to, per theme. Ink starts from salmon in dark. */
export const PAIRS = {
  "ink-red": {
    label: "Ink into red",
    light: ["fg.default", "red.500"],
    dark: ["accent.solid", "red.500"],
  },
  "ink-teal": {
    label: "Ink into teal",
    light: ["fg.default", "teal.500"],
    dark: ["accent.solid", "teal.500"],
  },
  "salmon-red": {
    label: "Salmon into red",
    light: ["accent.solid", "red.500"],
    dark: ["accent.solid", "red.500"],
  },
} as const satisfies Record<
  string,
  { label: string } & Record<Theme, readonly [string, string]>
>;
export type Pair = keyof typeof PAIRS;

/** Target tile sizes in px. The actual size is fitted to the box. */
export const SCALES = { fine: 12, regular: 24, coarse: 48 } as const;
export type Scale = keyof typeof SCALES;

export const TURNS = [0, 90, 180, 270] as const satisfies readonly Turn[];
export const DIRECTIONS = [
  "down",
  "diagonal",
  "edge",
] as const satisfies readonly Direction[];
export const NOISES = ["crisp", "soft"] as const;
export type Noise = (typeof NOISES)[number];

export interface Options {
  tile: TileName;
  surface: Surface;
  width: number;
  height: number;
  pair?: Pair;
  scale?: Scale;
  turn?: Turn;
  dir?: Direction;
  noise?: Noise;
  seed?: number;
}

export const DEFAULTS = {
  pair: "ink-red",
  scale: "regular",
  turn: 0,
  dir: "down",
  noise: "crisp",
  seed: 1,
} as const satisfies Required<
  Omit<Options, "tile" | "surface" | "width" | "height">
>;

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The name people use for a tile and surface, e.g. "Grain Paper". */
export function label(tile: TileName, surface: Surface): string {
  return `${title(tile)} ${SURFACES[surface].label}`;
}

export interface Grid {
  /** Tile size in px; may be fractional. */
  size: number;
  /** True when the box holds whole tiles both ways. */
  whole: boolean;
  /** How far the grid starts outside the box, to centre cut tiles. */
  x: number;
  y: number;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const closest = (list: number[], target: number) =>
  list.reduce<number | undefined>(
    (best, s) =>
      best === undefined || Math.abs(s - target) <= Math.abs(best - target)
        ? s
        : best,
    undefined,
  );

/**
 * Tile sizes for each scale. Sizes that give whole tiles both ways are
 * the box's common divisor over 1, 2, 3...; each scale takes the one
 * nearest its target, within half to double, whole pixels first, ties to
 * the smaller, and coarser scales always
 * take bigger tiles. A scale with no whole size left fits whole tiles on
 * the short side and centres the long side, so its cut tiles match.
 */
export function grids(width: number, height: number): Record<Scale, Grid> {
  const g = gcd(width, height);
  const whole: number[] = [];
  for (let k = 1; g / k >= 4; k++) whole.push(g / k);
  // Whole-pixel tiles first: they draw without seams.
  const near = (target: number, keep: (s: number) => boolean) => {
    const fits = whole.filter(
      (s) => keep(s) && s >= target / 2 && s <= target * 2,
    );
    return (
      closest(fits.filter(Number.isInteger), target) ?? closest(fits, target)
    );
  };
  const short = Math.min(width, height);
  const fallback = (target: number, keep: (s: number) => boolean): Grid => {
    const sizes: number[] = [];
    for (let rows = 1; short / rows >= 2; rows++) {
      if (keep(short / rows)) sizes.push(short / rows);
    }
    const size =
      closest(sizes, target) ?? short / Math.max(1, Math.round(short / target));
    const cut = (n: number) => (Math.ceil(n / size - 1e-9) * size - n) / 2;
    return { size, whole: false, x: cut(width), y: cut(height) };
  };
  const pick = (target: number, keep: (s: number) => boolean): Grid => {
    const size = near(target, keep);
    return size === undefined
      ? fallback(target, keep)
      : { size, whole: true, x: 0, y: 0 };
  };
  const regular = pick(SCALES.regular, () => true);
  return {
    regular,
    coarse: pick(SCALES.coarse, (s) => s > regular.size),
    fine: pick(SCALES.fine, (s) => s < regular.size),
  };
}

/** Reads `1280x288` (or `1280 x 288`) as a size. */
export function parseSize(s: string): { width: number; height: number } {
  const m = /^\s*(\d+)\s*[x×]\s*(\d+)\s*$/i.exec(s);
  if (!m) throw new Error(`Size must look like 1280x288, not "${s}"`);
  const width = Number(m[1]);
  const height = Number(m[2]);
  if (width < 1 || height < 1 || width > 8000 || height > 8000) {
    throw new Error("Width and height must be between 1 and 8000");
  }
  return { width, height };
}

/** A file name for the options, e.g. `grain-paper-1280x288`. */
export function fileName(o: Options): string {
  return `${o.tile}-${o.surface}-${o.width}x${o.height}`;
}

/** A pattern as a standalone SVG document of the given size. */
export function generate(o: Options): string {
  const { theme, token } = SURFACES[o.surface];
  const [from, to] = PAIRS[o.pair ?? DEFAULTS.pair][theme];
  const grid = grids(o.width, o.height)[o.scale ?? DEFAULTS.scale];
  const tile: Tile = o.tile === "grain" ? "none" : o.tile;
  const inner = pattern({
    tile,
    turn: o.turn ?? DEFAULTS.turn,
    dir: o.dir ?? (tile === "none" ? "diagonal" : DEFAULTS.dir),
    size: grid.size,
    soft: (o.noise ?? DEFAULTS.noise) === "soft",
    seed: o.seed ?? DEFAULTS.seed,
    id: "cv",
    paint: {
      from: hex(from, theme),
      to: hex(to, theme),
      tile: hex(token, theme),
    },
  });
  // A cut grid is drawn a little larger than the box and shifted, so the
  // cut tiles are the same at both ends.
  const placed =
    grid.x || grid.y
      ? inner.replace(
          "<svg ",
          `<svg x="${-grid.x}" y="${-grid.y}" width="${o.width + 2 * grid.x}" height="${o.height + 2 * grid.y}" `,
        )
      : inner;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}">` +
    `<title>${label(o.tile, o.surface)}</title>${placed}</svg>\n`
  );
}

/** Every dial and its choices, for a UI or `brand list`. */
export function choices() {
  return {
    tiles: TILE_NAMES.map((id) => ({ id, label: title(id) })),
    surfaces: Object.entries(SURFACES).map(([id, s]) => ({
      id,
      label: s.label,
      group: s.group,
      theme: s.theme,
      colour: hex(s.token, s.theme),
    })),
    pairs: Object.entries(PAIRS).map(([id, p]) => ({ id, label: p.label })),
    scales: Object.entries(SCALES).map(([id, px]) => ({ id, px })),
    turns: TURNS,
    directions: DIRECTIONS,
    noises: NOISES,
    defaults: DEFAULTS,
  };
}
