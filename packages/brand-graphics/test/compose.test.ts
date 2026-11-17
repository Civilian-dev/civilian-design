import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type Box,
  type ComposeOptions,
  calloutBackground,
  compose,
  defineTheme,
  type Hue,
  type Kit,
  layout,
  layoutVars,
  parsePiece,
  type TextBlock,
  THEMES,
  type Theme,
  texture,
} from "../src/compose";
import { kit as builtKit } from "../src/kit";

const kit: Kit = builtKit;
// Colours pass through as `theme:path`, so tests can assert on roles.
const hex = (path: string, theme = "light") => `${theme}:${path}`;

const svg = (body: string, root = 'viewBox="0 0 10 10" fill="currentColor"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${root}>${body}</svg>`;

const article: TextBlock = {
  letter: "A",
  kind: "Article",
  number: "001",
  section: "Notes",
  title: ["One", "Two"],
  meta: "1 Jan 2026",
};

const SIZES = [
  [1200, 630],
  [1200, 631],
  [1080, 1080],
  [1920, 1080],
  [1200, 800],
  [1600, 600],
  [1500, 500],
  [999, 777],
  [2400, 1260],
] as const;

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

  it("accepts the mark", () => {
    const source = readFileSync(
      new URL("../src/mark/civilian.svg", import.meta.url),
      "utf8",
    );
    expect(parsePiece(source).h).toBeGreaterThan(0);
  });
});

describe("layout", () => {
  const inside = (b: Box, outer: Box) =>
    b.x >= outer.x &&
    b.y >= outer.y &&
    b.x + b.w <= outer.x + outer.w &&
    b.y + b.h <= outer.y + outer.h;

  it.each(SIZES)("%ix%i keeps every cell inside the frame", (width, height) => {
    const l = layout({ width, height, feature: "weave" });
    for (const cell of Object.values(l.cells)) {
      if (cell) expect(inside(cell, l.frame)).toBe(true);
    }
    expect(inside(l.frame, { x: 0, y: 0, w: width, h: height })).toBe(true);
  });

  it.each(SIZES)(
    "%ix%i makes the feature a whole number of tiles",
    (width, height) => {
      const l = layout({ width, height, feature: "weave" });
      const f = l.cells.feature as Box;
      expect(Number.isInteger(l.tile)).toBe(true);
      expect(f.w).toBe(l.tile * l.tilesX);
      expect(f.h).toBe(l.tile * l.tilesY);
    },
  );

  it("matches the Open Graph card in the seeds", () => {
    const l = layout({ width: 1200, height: 630, feature: "weave" });
    expect(l.tile).toBe(32);
    expect(l.rule).toBe(2);
    expect(l.type.title).toBe(88);
    expect(l.cells.title.y).toBe(123);
  });

  it("gives the title both columns when there is no feature", () => {
    const l = layout({ width: 1200, height: 630, feature: "none" });
    expect(l.cells.feature).toBeNull();
    expect(l.cells.title.w).toBe(
      l.cells.topLeft.w + l.rule + l.cells.topRight.w,
    );
  });

  it("layoutVars carries the title cell", () => {
    const l = layout({ width: 1200, height: 630, feature: "weave" });
    expect(layoutVars(l)["--cv-card-title-y"]).toBe(`${l.cells.title.y}px`);
  });
});

describe("compose", () => {
  const base: ComposeOptions = {
    width: 1200,
    height: 630,
    theme: "light",
    feature: "weave",
    seed: 7,
    text: article,
  };

  it("returns the same SVG for the same options", () => {
    expect(compose(kit, hex, base)).toBe(compose(kit, hex, base));
  });

  it("records the title cell from layout() on the SVG", () => {
    const out = compose(kit, hex, base);
    const t = layout({ width: 1200, height: 630, feature: "weave" }).cells
      .title;
    expect(out).toContain(`data-title-x="${t.x}" data-title-y="${t.y}"`);
  });

  it.each(["light", "dark"] as Theme[])(
    "%s uses the theme's card ground",
    (theme) => {
      const out = compose(kit, hex, { ...base, theme });
      expect(out).toContain(`fill="${theme}:${THEMES[theme].ground}"`);
    },
  );

  it("has no text when text is left out", () => {
    const { text: _, ...rest } = base;
    expect(compose(kit, hex, rest)).not.toContain("<text");
  });

  it("uses the wordmark option", () => {
    expect(compose(kit, hex, { ...base, wordmark: "tim.dev" })).toContain(
      ">tim.dev<",
    );
  });

  it.each(
    (["light", "dark"] as Theme[]).flatMap((theme) =>
      (["weave", "grain", "none"] as const).map(
        (feature) => [theme, feature] as const,
      ),
    ),
  )(
    "%s %s: red only in the bullet, one key piece and the pattern",
    (theme, feature) => {
      const out = compose(kit, hex, { ...base, theme, feature, seed: 2 });
      const reds =
        out.match(new RegExp(`fill="${theme}:red\\.500"`, "g")) ?? [];
      // The bullet and at most one key piece; patterns use red as noise, not fill.
      expect(reds.length).toBeLessThanOrEqual(2);
    },
  );
});

describe("callouts and textures", () => {
  const hues: Hue[] = ["salmon", "gold", "teal", "violet"];

  it.each(hues)("%s varies with the seed", (hue) => {
    const a = calloutBackground(kit, hex, { hue, theme: "light", seed: 1 });
    const b = calloutBackground(kit, hex, { hue, theme: "light", seed: 2 });
    expect(a).not.toBe(b);
  });

  it("dark callouts sit on a neutral ground", () => {
    const out = calloutBackground(kit, hex, {
      hue: "salmon",
      theme: "dark",
      seed: 1,
    });
    expect(out).toContain('fill="dark:bg.default"');
  });

  it("keeps ids unique across outputs inlined on one page", () => {
    const page = [
      ...hues.map((hue, i) =>
        calloutBackground(kit, hex, { hue, theme: "light", seed: i }),
      ),
      texture(kit, hex, { theme: "light", seed: 1 }),
      compose(kit, hex, {
        width: 1200,
        height: 630,
        theme: "light",
        feature: "weave",
        seed: 1,
      }),
      compose(kit, hex, {
        width: 1200,
        height: 630,
        theme: "dark",
        feature: "grain",
        seed: 1,
      }),
    ].join("");
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("defineTheme", () => {
  it("fills in the defaults", () => {
    expect(defineTheme()).toMatchObject({
      theme: "light",
      letter: "A",
      wordmark: "civilian.dev",
    });
  });

  it("rejects a bullet that is not one capital letter", () => {
    expect(() => defineTheme({ letter: "ab" })).toThrow(/one capital/);
  });

  it("rejects an empty wordmark", () => {
    expect(() => defineTheme({ wordmark: " " })).toThrow(/wordmark/);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(defineTheme())).toBe(true);
  });
});
