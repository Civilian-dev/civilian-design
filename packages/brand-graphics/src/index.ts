/**
 * Civilian brand graphics, ready to use: the shape kit and the design-token
 * colours are built in, so each function needs only its own options.
 *
 * The same functions without the built-in kit and colours are in
 * `@civilian-dev/brand-graphics/compose`.
 */
import { resolved } from "@civilian-dev/design-tokens/resolved";
import * as raw from "./compose.js";
import { kit } from "./kit.js";
import * as patterns from "./pattern.js";

export type {
  Box,
  CalloutOptions,
  CardLayout,
  ComposeOptions,
  DefinedTheme,
  Feature,
  Hex,
  Hue,
  Kit,
  Piece,
  TextBlock,
  TextureOptions,
  Theme,
  ThemeChoices,
} from "./compose.js";
export {
  defineTheme,
  FONTS,
  layout,
  layoutVars,
  parsePiece,
  put,
  rect,
  THEMES,
  WORDMARK,
} from "./compose.js";
export type {
  CalloutArtOptions,
  Direction,
  Paint,
  PatternOptions,
  Tile,
  Turn,
} from "./pattern.js";
export { CSS_PAINT, TILES } from "./pattern.js";
export { kit };

/**
 * Looks up a colour by token path for a theme, such as `bg.emphasized` or
 * `red.500`. Semantic roles resolve per theme; primitives are the same in both.
 */
export const hex: raw.Hex = (path, theme = "light") => {
  const [group, step] = path.split(".") as [string, string];
  const value = resolved[theme].colors?.[group]?.[step]?.hex;
  if (typeof value !== "string") throw new Error(`Unknown colour: ${path}`);
  return value;
};

/** The card as a standalone image: Open Graph, banner or profile. */
export const compose = (options: raw.ComposeOptions): string =>
  raw.compose(kit, hex, options);

/** The civilian on the page ground, 400 by 400. */
export const avatar = (theme: raw.Theme): string => raw.avatar(kit, hex, theme);

/** A fluid callout background in one hue and theme. */
export const calloutBackground = (options: raw.CalloutOptions): string =>
  raw.calloutBackground(kit, hex, options);

/** A fluid section texture on the page ground. */
export const texture = (options: raw.TextureOptions): string =>
  raw.texture(kit, hex, options);

/**
 * A pattern as an inline SVG string that fills its box: a tile over a
 * two-colour noise gradient. Coloured by custom properties unless `paint`
 * is given. Where patterns may go is in DESIGN.md, Patterns.
 */
export const pattern = (options: patterns.PatternOptions): string =>
  patterns.pattern(kit, options);

/** A callout's art: a fine tile over a soft noise fade from the right edge. */
export const calloutArt = (options?: patterns.CalloutArtOptions): string =>
  patterns.calloutArt(kit, options);

/**
 * Rule widths in px, until `borderWidths` tokens exist: hairlines between
 * items, rules in the card frame and table heads, a callout's edge.
 */
export const BORDER_WIDTHS = { hairline: 1, rule: 2, edge: 4 } as const;

/** The widest a callout's art may be, in px, until a size token exists. */
export const ART_WIDTH = 240;
