import { describe, expect, it } from "vitest";
import {
  choices,
  fileName,
  fitTile,
  generate,
  label,
  parseSize,
  TILE_NAMES,
} from "../src/generate.ts";

describe("parseSize", () => {
  it("reads WxH with or without spaces", () => {
    expect(parseSize("1280x288")).toEqual({ width: 1280, height: 288 });
    expect(parseSize("1280 x 288")).toEqual({ width: 1280, height: 288 });
  });

  it("rejects anything else", () => {
    expect(() => parseSize("1280")).toThrow();
    expect(() => parseSize("0x10")).toThrow();
  });
});

describe("fitTile", () => {
  it("picks a size that gives whole tiles both ways", () => {
    const { size, whole } = fitTile(1280, 288, 24);
    expect(whole).toBe(true);
    expect(1280 % size).toBe(0);
    expect(288 % size).toBe(0);
  });

  it("fits the width when no whole size is near", () => {
    const { size, whole } = fitTile(1001, 333, 24);
    expect(whole).toBe(false);
    expect(Math.round(1001 / size) * size).toBeCloseTo(1001, 0);
  });
});

describe("generate", () => {
  it.each(TILE_NAMES)("makes a %s SVG at the given size", (tile) => {
    const svg = generate({ tile, surface: "paper", width: 1280, height: 288 });
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg).toContain('width="1280" height="288"');
    expect(svg).not.toContain("var(--");
  });

  it("is the same for the same options", () => {
    const o = {
      tile: "disc",
      surface: "dark",
      width: 600,
      height: 200,
    } as const;
    expect(generate(o)).toBe(generate(o));
  });

  it("names a tile and surface the way people do", () => {
    expect(label("grain", "paper")).toBe("Grain Paper");
    expect(
      fileName({ tile: "grain", surface: "paper", width: 1280, height: 288 }),
    ).toBe("grain-paper-1280x288");
  });

  it("lists every choice with resolved surface colours", () => {
    const c = choices();
    expect(c.tiles.map((t) => t.id)).toEqual([...TILE_NAMES]);
    for (const s of c.surfaces) expect(s.colour).toMatch(/^#[0-9a-f]{6}/i);
  });
});
