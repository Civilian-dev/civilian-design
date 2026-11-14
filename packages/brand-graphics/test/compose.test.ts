import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type ComposeOptions,
  calloutBackground,
  compose,
  type Hue,
  type Kit,
  type Layout,
  parsePiece,
  texture,
} from "../src/compose";

const src = new URL("../src/", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, src), "utf8");

const shapes = readdirSync(new URL("shapes/", src)).filter((f) =>
  f.endsWith(".svg"),
);
const kit: Kit = {
  shapes: Object.fromEntries(
    shapes.map((f) => [
      f.replace(/\.svg$/, ""),
      parsePiece(read(`shapes/${f}`), f),
    ]),
  ),
  mark: parsePiece(read("mark/civilian.svg"), "civilian.svg"),
};
const hex = (path: string) => `#${path.length.toString(16).padStart(6, "0")}`;

const svg = (body: string, root = 'viewBox="0 0 10 10" fill="currentColor"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${root}>${body}</svg>`;

describe("parsePiece", () => {
  it("keeps attributes that are on separate lines", () => {
    const piece = parsePiece(
      svg('\n  <rect\n    width="10"\n    height="10"/>\n'),
    );
    expect(piece).toEqual({
      w: 10,
      h: 10,
      body: '<rect width="10" height="10"/>',
    });
  });

  it.each([
    ['<rect id="a" width="10" height="10"/>', "an id"],
    ['<rect style="opacity:1" width="10" height="10"/>', "a style"],
    ['<rect color="#ff0000" width="10" height="10"/>', "a hex colour"],
    ['<rect fill="red" width="10" height="10"/>', "a fill below the root"],
    ['<rect stroke="black" width="10" height="10"/>', "a stroke"],
  ])("rejects %s", (body, what) => {
    expect(() => parsePiece(svg(body), "bad.svg")).toThrow(what);
  });

  it("needs a currentColor root and a viewBox at 0 0", () => {
    expect(() => parsePiece(svg("<rect/>", 'viewBox="0 0 10 10"'))).toThrow(
      "currentColor",
    );
    expect(() =>
      parsePiece(svg("<rect/>", 'viewBox="1 1 10 10" fill="currentColor"')),
    ).toThrow("viewBox");
  });

  it("accepts every source in the kit", () => {
    expect(Object.keys(kit.shapes).length).toBeGreaterThan(0);
  });
});

describe("compose", () => {
  const base = { scheme: "paper", feature: "weave", seed: 7 } as const;

  it("returns the same SVG for the same options (G9)", () => {
    const o: ComposeOptions = {
      ...base,
      width: 1200,
      height: 630,
      layout: "sign",
    };
    expect(compose(kit, hex, o)).toBe(compose(kit, hex, o));
  });

  const sizes = [
    [1200, 630],
    [1200, 631],
    [1080, 1080],
    [1920, 1080],
    [1200, 800],
    [1600, 900],
    [1500, 500],
    [999, 777],
    [2400, 1260],
  ] as const;
  const layouts: Layout[] = ["sign", "ledger"];

  it.each(
    layouts.flatMap((layout) => sizes.map(([w, h]) => [layout, w, h] as const)),
  )(
    "%s %ix%i tiles the weave in whole pixels (G5)",
    (layout, width, height) => {
      const out = compose(kit, hex, { ...base, layout, width, height });
      const pattern = out.match(/<pattern [^>]*>/)?.[0] ?? "";
      for (const attr of ["x", "y", "width", "height"]) {
        const value = pattern.match(new RegExp(` ${attr}="([^"]+)"`))?.[1];
        expect(Number.isInteger(Number(value)), `${attr}=${value}`).toBe(true);
      }
    },
  );
});

describe("ids", () => {
  it("are unique across outputs inlined on one page", () => {
    const hues: Hue[] = ["salmon", "gold", "teal", "violet"];
    const page = [
      ...hues.map((hue, i) => calloutBackground(kit, hex, hue, i)),
      texture(kit, hex, { scheme: "paper", feature: "weave", seed: 1 }),
      texture(kit, hex, { scheme: "paper", feature: "grain", seed: 1 }),
      compose(kit, hex, {
        width: 1200,
        height: 630,
        layout: "sign",
        scheme: "paper",
        feature: "weave",
        seed: 1,
      }),
      compose(kit, hex, {
        width: 1200,
        height: 630,
        layout: "ledger",
        scheme: "concrete",
        feature: "grain",
        seed: 1,
      }),
    ].join("");
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
