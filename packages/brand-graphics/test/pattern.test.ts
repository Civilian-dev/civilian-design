import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calloutArt, pattern, TILES } from "../src/index";

const ids = (svg: string) =>
  [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1] as string);

describe("pattern", () => {
  it.each(TILES)("draws a %s tile over noise", (tile) => {
    const svg = pattern({ tile });
    expect(svg).toContain(`data-tile="${tile}"`);
    expect(svg).toContain("<pattern ");
    expect(svg).toContain("<feTurbulence ");
  });

  it("draws grain without a tile layer", () => {
    const svg = pattern({ tile: "none" });
    expect(svg).not.toContain("<pattern ");
    expect(svg).toContain("<feTurbulence ");
  });

  it("is coloured by custom properties by default", () => {
    const svg = pattern({ tile: "triangle" });
    for (const name of ["from", "to", "tile"]) {
      expect(svg).toContain(`var(--cv-pattern-${name})`);
    }
    expect(svg).not.toMatch(/#[0-9a-f]{6}/i);
  });

  it("uses resolved colours when paint is given", () => {
    const svg = pattern({
      tile: "triangle",
      paint: { from: "#000001", to: "#000002", tile: "#000003" },
    });
    expect(svg).not.toContain("var(");
    for (const hex of ["#000001", "#000002", "#000003"]) {
      expect(svg).toContain(hex);
    }
  });

  it("is deterministic for the same options", () => {
    const o = { tile: "disc", turn: 90, seed: 4 } as const;
    expect(pattern(o)).toBe(pattern(o));
  });

  it("keeps ids unique when given different ids", () => {
    const a = ids(pattern({ tile: "triangle", id: "a" }));
    const b = ids(pattern({ tile: "triangle", id: "b" }));
    expect(new Set([...a, ...b]).size).toBe(a.length + b.length);
  });

  it("rejects a tile that is not in the kit", () => {
    // @ts-expect-error: not a tile
    expect(() => pattern({ tile: "star" })).toThrow(/Unknown tile/);
  });
});

describe("calloutArt", () => {
  it("is a soft edge fade with a fine tile", () => {
    const svg = calloutArt();
    expect(svg).toContain('data-direction="edge"');
    expect(svg).toContain('data-noise="soft"');
    expect(svg).toContain('data-size="12"');
    expect(svg).toContain('data-tile="triangle"');
  });

  it("varies by tile, turn and seed", () => {
    const base = calloutArt();
    expect(calloutArt({ tile: "disc" })).not.toBe(base);
    expect(calloutArt({ turn: 90 })).not.toBe(base);
    expect(calloutArt({ seed: 2 })).not.toBe(base);
  });
});

describe("patterns.css", () => {
  it("defines every property a pattern reads", () => {
    const css = readFileSync(
      new URL("../src/patterns.css", import.meta.url),
      "utf8",
    );
    for (const name of ["from", "to", "tile"]) {
      expect(css).toContain(`--cv-pattern-${name}:`);
    }
  });
});
