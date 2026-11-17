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
});

describe("ready-made functions", () => {
  const options: raw.ComposeOptions = {
    width: 1200,
    height: 630,
    layout: "sign",
    scheme: "paper",
    feature: "weave",
    seed: 3,
  };

  it("compose matches the raw composer", () => {
    expect(compose(options)).toBe(raw.compose(kit, hex, options));
  });

  it("avatar, callouts and textures match the raw composer", () => {
    expect(avatar("night")).toBe(raw.avatar(kit, hex, "night"));
    expect(calloutBackground("gold", 7)).toBe(
      raw.calloutBackground(kit, hex, "gold", 7),
    );
    const t = { scheme: "concrete", feature: "weave", seed: 2 } as const;
    expect(texture(t)).toBe(raw.texture(kit, hex, t));
  });
});
