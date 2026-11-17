import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FAMILIES,
  faces,
  fontsCss,
  indexJs,
  MAGIC,
  WEIGHTS,
} from "../scripts/build";

const dist = (file: string) =>
  fileURLToPath(new URL(`../dist/${file}`, import.meta.url));
const list = faces();

describe("faces", () => {
  it("has every weight of every family", () => {
    expect(list).toHaveLength(FAMILIES.length * WEIGHTS.length);
  });

  it.each(list)("$family $weight ships woff2 and OpenType", (f) => {
    expect(readFileSync(dist(f.woff2)).subarray(0, 4).toString("latin1")).toBe(
      "wOF2",
    );
    const ext = f.opentype.endsWith(".otf") ? "otf" : "ttf";
    expect(readFileSync(dist(f.opentype)).readUInt32BE(0)).toBe(MAGIC[ext]);
  });

  it.each(FAMILIES)("$family ships its licence", ({ slug }) => {
    const licence = readFileSync(dist(`licences/${slug}-OFL.txt`), "utf8");
    expect(licence).toMatch(/SIL OPEN FONT LICENSE/i);
  });
});

describe("generated files", () => {
  it("fonts.css matches the build", () => {
    expect(readFileSync(dist("fonts.css"), "utf8")).toBe(fontsCss(list));
  });

  it("index.js matches the build", () => {
    expect(readFileSync(dist("index.js"), "utf8")).toBe(indexJs(list));
  });

  it("fonts.css only points at files in the package", () => {
    const urls = [...fontsCss(list).matchAll(/url\("\.\/([^"]+)"\)/g)].map(
      (m) => m[1] as string,
    );
    expect(urls).toHaveLength(list.length);
    for (const url of urls) expect(existsSync(dist(url))).toBe(true);
  });

  it("fontPath resolves to a file on disk", async () => {
    const mod = await import("../dist/index.js");
    for (const face of mod.fonts) {
      expect(existsSync(mod.fontPath(face.opentype))).toBe(true);
    }
  });
});
