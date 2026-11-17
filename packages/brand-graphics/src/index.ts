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

export type {
  ComposeOptions,
  Feature,
  Hex,
  Hue,
  Kit,
  Layout,
  Piece,
  SchemeName,
  TextBlock,
} from "./compose.js";
export { FONTS, parsePiece, SCHEMES, stippleFilter } from "./compose.js";
export { kit };

/** Looks up a primitive colour by token path, such as `salmon.300`. */
export const hex: raw.Hex = (path) => {
  const [group, step] = path.split(".") as [string, string];
  const value = resolved.light.colors?.[group]?.[step]?.hex;
  if (typeof value !== "string") throw new Error(`Unknown colour: ${path}`);
  return value;
};

/** A banner, social image or profile card as an SVG string. */
export const compose = (options: raw.ComposeOptions): string =>
  raw.compose(kit, hex, options);

/** The civilian on the scheme's ground, 400 by 400. */
export const avatar = (scheme: raw.SchemeName): string =>
  raw.avatar(kit, hex, scheme);

/** A fluid callout background in one hue. */
export const calloutBackground = (hue: raw.Hue, seed: number): string =>
  raw.calloutBackground(kit, hex, hue, seed);

/** A fluid section texture. */
export const texture = (options: Parameters<typeof raw.texture>[2]): string =>
  raw.texture(kit, hex, options);

/**
 * Rule widths in px, until `borderWidths` tokens exist: hairlines between
 * items, rules in the card frame and table heads, a callout's edge.
 */
export const BORDER_WIDTHS = { hairline: 1, rule: 2, edge: 4 } as const;

/** The widest a callout's art may be, in px, until a size token exists. */
export const ART_WIDTH = 240;
