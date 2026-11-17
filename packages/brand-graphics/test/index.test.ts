import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as raw from "../src/compose";
import {
  avatar,
  calloutBackground,
  compose,
  hex,
  kit,
  texture,
} from "../src/index";

const src = new URL("../src/", import.meta.url);

describe("built-in kit", () => {
  it("matches the source SVGs", () => {
    const files = readdirSync(new URL("shapes/", src))
      .filter((f) => f.endsWith(".svg"))
      .sort();
    expect(Object.keys(kit.shapes)).toEqual(
      files.map((f) => f.replace(/\.svg$/, "")),
    );
    for (const f of files) {
      const parsed = raw.parsePiece(
        readFileSync(new URL(`shapes/${f}`, src), "utf8"),
        f,
      );
      expect(kit.shapes[f.replace(/\.svg$/, "")]).toEqual(parsed);
    }
  });
});

describe("hex", () => {
  it("reads a primitive colour from the tokens", () => {
    expect(hex("red.500")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("throws on an unknown colour", () => {
    expect(() => hex("nope.500")).toThrow(/Unknown colour/);
  });

  it("resolves semantic roles per theme", () => {
    expect(hex("bg.canvas", "dark")).not.toBe(hex("bg.canvas", "light"));
    expect(hex("red.500", "dark")).toBe(hex("red.500", "light"));
  });
});

describe("ready-made functions", () => {
  const options: raw.ComposeOptions = {
    width: 1200,
    height: 630,
    theme: "light",
    feature: "weave",
    seed: 3,
  };

  it("compose matches the raw composer", () => {
    expect(compose(options)).toBe(raw.compose(kit, hex, options));
  });

  it("avatar, callouts and textures match the raw composer", () => {
    expect(avatar("dark")).toBe(raw.avatar(kit, hex, "dark"));
    const c = { hue: "gold", theme: "dark", seed: 7 } as const;
    expect(calloutBackground(c)).toBe(raw.calloutBackground(kit, hex, c));
    const t = { theme: "light", seed: 2 } as const;
    expect(texture(t)).toBe(raw.texture(kit, hex, t));
  });
});
