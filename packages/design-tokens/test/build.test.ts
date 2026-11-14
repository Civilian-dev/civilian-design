import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { transform } from "lightningcss";
import { describe, expect, it } from "vitest";
import {
  buildCss,
  buildJs,
  buildResolved,
  oklchString,
} from "../scripts/build";
import { normalise } from "../scripts/normalise";

type Json = any;
const raw: Json = JSON.parse(
  readFileSync(new URL("../src/tokens.json", import.meta.url), "utf8"),
);
const n = normalise(raw);

describe("tokens.css", () => {
  const css = buildCss(n);
  it("parses with Lightning CSS", () => {
    expect(() =>
      transform({
        filename: "tokens.css",
        code: Buffer.from(css),
        errorRecovery: false,
      }),
    ).not.toThrow();
  });
  it("uses codeSyntax variable names", () => {
    expect(css).toContain("--colors-bg-canvas: var(--colors-base-paper);");
    expect(css).toContain("--spacing-4: 1rem;");
    expect(css).toContain("--z-index-skip-link: 1600;");
  });
  it("uses the D4 dark selectors", () => {
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root:not([data-theme="light"])');
  });
});

describe("index.js", () => {
  it("emits typed paths", () => {
    const { js, dts } = buildJs(n);
    expect(js).toContain('"colors.bg.canvas": "var(--colors-bg-canvas)"');
    expect(dts).toContain('| "colors.bg.canvas"');
  });
});

describe("resolved", () => {
  const resolved = buildResolved(n);

  /** Resolve a raw Figma alias chain to the hex string Figma holds. */
  const figmaHex = (
    group: "colorLight" | "colorDark",
    path: string[],
  ): string => {
    let node: Json =
      group === "colorLight" || group === "colorDark" ? raw[group] : raw;
    for (const p of path) node = node[p];
    let v = node.$value;
    while (typeof v === "string") {
      let t: Json = raw;
      for (const p of v.slice(1, -1).split(".")) t = t[p];
      v = t.$value;
    }
    return v.hex;
  };

  const roles = (g: string): string[][] =>
    Object.entries<Json>(raw[g]).flatMap(([a, ts]) =>
      Object.keys(ts).map((b) => [a, b] as string[]),
    );

  for (const [group, theme] of [
    ["colorLight", "light"],
    ["colorDark", "dark"],
  ] as const) {
    it(`${theme} resolved colours match Figma hex values`, () => {
      for (const [a, b] of roles(group)) {
        expect(
          resolved[theme].colors[a as string][b as string].hex,
          `${theme} ${a}.${b}`,
        ).toBe(figmaHex(group, [a as string, b as string]).slice(0, 7));
      }
    });
  }

  it("includes oklch for each colour", () => {
    expect(resolved.light.colors.bg.canvas.oklch).toMatch(/^oklch\(/);
    expect(oklchString([1, 1, 1], 1)).toBe("oklch(1 0 0)");
  });
});

describe("package contents", () => {
  it("packs only dist/", () => {
    const out = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
        env: { ...process.env, npm_config_loglevel: "error" },
      },
    );
    const files: string[] = JSON.parse(
      out.slice(out.indexOf("[")),
    )[0].files.map((f: { path: string }) => f.path);
    expect(
      files.filter((f) => f !== "package.json" && !f.startsWith("dist/")),
    ).toEqual([]);
    expect(files).toContain("dist/tokens.css");
  });
});
