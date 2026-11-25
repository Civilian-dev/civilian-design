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
 * The surface a pattern sits on. Its colour is the tile colour, and its
 * theme picks the noise colours.
 */
export const SURFACES = {
  paper: { label: "Paper", theme: "light", token: "bg.canvas" },
  concrete: { label: "Concrete", theme: "light", token: "bg.emphasized" },
  dark: { label: "Dark", theme: "dark", token: "bg.canvas" },
  "dark-card": { label: "Dark card", theme: "dark", token: "bg.default" },
} as const satisfies Record<
  string,
  { label: string; theme: Theme; token: string }
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

/**
 * The tile size closest to `target` that gives whole tiles both ways. When
 * no size within half or double the target does, the width decides and the
 * last row is cut.
 */
export function fitTile(
  width: number,
  height: number,
  target: number,
): { size: number; whole: boolean } {
  let best = 0;
  for (let s = Math.ceil(target / 2); s <= target * 2; s++) {
    if (width % s === 0 && height % s === 0) {
      if (!best || Math.abs(s - target) <= Math.abs(best - target)) best = s;
    }
  }
  if (best) return { size: best, whole: true };
  const across = Math.max(1, Math.round(width / target));
  return { size: Math.round((width / across) * 100) / 100, whole: false };
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
  const { size } = fitTile(
    o.width,
    o.height,
    SCALES[o.scale ?? DEFAULTS.scale],
  );
  const tile: Tile = o.tile === "grain" ? "none" : o.tile;
  const inner = pattern({
    tile,
    turn: o.turn ?? DEFAULTS.turn,
    dir: o.dir ?? (tile === "none" ? "diagonal" : DEFAULTS.dir),
    size,
    soft: (o.noise ?? DEFAULTS.noise) === "soft",
    seed: o.seed ?? DEFAULTS.seed,
    id: "cv",
    paint: {
      from: hex(from, theme),
      to: hex(to, theme),
      tile: hex(token, theme),
    },
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}" viewBox="0 0 ${o.width} ${o.height}">` +
    `<title>${label(o.tile, o.surface)}</title>${inner}</svg>\n`
  );
}

/** Every dial and its choices, for a UI or `brand list`. */
export function choices() {
  return {
    tiles: TILE_NAMES.map((id) => ({ id, label: title(id) })),
    surfaces: Object.entries(SURFACES).map(([id, s]) => ({
      id,
      label: s.label,
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
