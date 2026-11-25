#!/usr/bin/env node
/**
 * brand: make brand assets from @civilian-dev/brand-graphics.
 *
 *   brand list                                  every dial and its choices, as JSON
 *   brand pattern <tile> <surface> <WxH> [opts] a pattern image, e.g. grain paper 1280x288
 *
 * Pattern options:
 *   --pair ink-red|ink-teal|salmon-red   --scale fine|regular|coarse
 *   --turn 0|90|180|270   --dir down|diagonal|edge   --noise crisp|soft
 *   --seed <n>   --format svg|png   --density <n> (PNG pixels per px, default 1)
 *   --out <file>   (default: <tile>-<surface>-<W>x<H>.<format> in the current folder)
 *
 * Prints the path written.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { toPng } from "@civilian-dev/brand-graphics/raster";
import {
  choices,
  DIRECTIONS,
  fileName,
  generate,
  NOISES,
  type Options,
  PAIRS,
  parseSize,
  SCALES,
  SURFACES,
  TILE_NAMES,
  TURNS,
} from "./generate.ts";

function oneOf<T>(name: string, value: unknown, list: readonly T[]): T {
  const found = list.find((v) => String(v) === String(value));
  if (found === undefined) {
    throw new Error(
      `${name} must be one of ${list.join(", ")}, not "${value}"`,
    );
  }
  return found;
}

function pattern(args: string[]): string {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      pair: { type: "string" },
      scale: { type: "string" },
      turn: { type: "string" },
      dir: { type: "string" },
      noise: { type: "string" },
      seed: { type: "string" },
      format: { type: "string", default: "svg" },
      density: { type: "string", default: "1" },
      out: { type: "string" },
    },
  });
  const [tile, surface, size] = positionals;
  if (!tile || !surface || !size) {
    throw new Error("usage: brand pattern <tile> <surface> <WxH> [options]");
  }
  const o: Options = {
    tile: oneOf("tile", tile.toLowerCase(), TILE_NAMES),
    surface: oneOf(
      "surface",
      surface.toLowerCase(),
      Object.keys(SURFACES) as (keyof typeof SURFACES)[],
    ),
    ...parseSize(size),
  };
  if (values.pair)
    o.pair = oneOf(
      "pair",
      values.pair,
      Object.keys(PAIRS) as (keyof typeof PAIRS)[],
    );
  if (values.scale)
    o.scale = oneOf(
      "scale",
      values.scale,
      Object.keys(SCALES) as (keyof typeof SCALES)[],
    );
  if (values.turn) o.turn = oneOf("turn", Number(values.turn), TURNS);
  if (values.dir) o.dir = oneOf("dir", values.dir, DIRECTIONS);
  if (values.noise) o.noise = oneOf("noise", values.noise, NOISES);
  if (values.seed) {
    o.seed = Number(values.seed);
    if (!Number.isInteger(o.seed))
      throw new Error("seed must be a whole number");
  }
  const format = oneOf("format", values.format, ["svg", "png"] as const);
  const density = Number(values.density);
  if (!(density > 0 && density <= 4))
    throw new Error("density must be above 0 and at most 4");

  const svg = generate(o);
  const out = resolve(values.out ?? `${fileName(o)}.${format}`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    format === "png"
      ? toPng(svg, { width: Math.round(o.width * density) })
      : svg,
  );
  return out;
}

try {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "list") {
    console.log(JSON.stringify(choices(), null, 2));
  } else if (command === "pattern") {
    console.log(pattern(rest));
  } else {
    console.error("usage: brand list | brand pattern <tile> <surface> <WxH>");
    process.exit(2);
  }
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
