import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTokensJson,
  COVER_ROLES,
  coverHtml,
  projectDir,
  readmeMd,
} from "../scripts/design-system";
import { checkTokensJson } from "../scripts/schema";

describe("tokens.json schema check", () => {
  it("passes for the generated tokens", () => {
    expect(checkTokensJson(buildTokensJson())).toEqual([]);
  });
  it("is a list shape, not DTCG", () => {
    const t = buildTokensJson();
    expect(Array.isArray(t.color.tokens)).toBe(true);
    expect(JSON.stringify(t)).not.toContain("$value");
  });
  it("rejects what the type drops", () => {
    const base = () => ({
      color: {
        themes: [{ id: "light" }, { id: "dark" }],
        tokens: [{ name: "a", value: "#fff", usage: "x" }],
      },
      type: { fonts: [], families: {}, groups: [] },
    });
    const bad = (value: unknown, name = "b") => {
      const t = base();
      t.color.tokens.push({ name, value, usage: "x" } as never);
      return checkTokensJson(t);
    };
    expect(bad("var(--x)")).not.toEqual([]);
    expect(bad("red")).not.toEqual([]);
    expect(bad("transparent")).not.toEqual([]);
    expect(bad("color-mix(in srgb, red, blue)")).not.toEqual([]);
    expect(bad("{missing}")).not.toEqual([]);
    expect(bad("{b}")).not.toEqual([]);
    expect(bad("#fff", "bad name")).not.toEqual([]);
    expect(bad("#fff", "a")).not.toEqual([]); // duplicate
    expect(bad("{a}")).toEqual([]);
    expect(bad("oklch(0.5 0.1 200)")).toEqual([]);
  });
});

describe("bundle", () => {
  it("has the index, fonts and licence", () => {
    const index = JSON.parse(
      readFileSync(resolve(projectDir, "design-system.json"), "utf8"),
    );
    expect(index.editing).toBe("code");
    expect(index.createdOnFiles).toBeTruthy();
    expect(index.lastChange.via).toMatch(/^CI [0-9a-f]{8}$/);
    for (const f of [
      "fonts/poppins-OFL.txt",
      "fonts/instrument-sans-OFL.txt",
      "fonts/monaspace-xenon-OFL.txt",
      "README.md",
      "tokens.json",
    ]) {
      expect(existsSync(resolve(projectDir, f)), f).toBe(true);
    }
  });
  it("README matches the committed file", () => {
    expect(readFileSync(resolve(projectDir, "README.md"), "utf8")).toBe(
      readmeMd(),
    );
  });
  it("bundles a file for every family the type styles use", () => {
    const t = buildTokensJson();
    const bundled = new Set(
      t.type.fonts.map((f: { family: string }) => f.family),
    );
    for (const stack of Object.values<string>(t.type.families)) {
      const first = stack.match(/^"([^"]+)"/)?.[1];
      expect(bundled.has(first), stack).toBe(true);
    }
  });
  it("every font file named by tokens.json exists", () => {
    const t = JSON.parse(
      readFileSync(resolve(projectDir, "tokens.json"), "utf8"),
    );
    for (const f of t.type.fonts)
      expect(existsSync(resolve(projectDir, f.file)), f.file).toBe(true);
  });
});

describe("cover", () => {
  const html = coverHtml();
  const t = buildTokensJson();
  const hex = (role: string, theme: "light" | "dark"): string =>
    t.color.tokens.find((c: { name: string }) => c.name === role).value[theme];
  const luminance = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = Number.parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
      number,
      number,
    ];
    return (hi + 0.05) / (lo + 0.05);
  };

  it("starts with a dsCard marker, height 240 to 360", () => {
    const m = html
      .split("\n")[0]
      ?.match(/^<!-- @dsCard\b.*\bheight=(\d+) -->$/);
    expect(m).toBeTruthy();
    expect(Number(m?.[1])).toBeGreaterThanOrEqual(240);
    expect(Number(m?.[1])).toBeLessThanOrEqual(360);
  });
  it("has no colour literals", () => {
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(html).not.toMatch(/\b(rgba?|hsla?|oklch)\(/i);
  });
  it("only uses variables the tokens define", () => {
    const names = new Set<string>([
      ...t.color.tokens.map((c: { name: string }) => c.name),
      ...t.spacing.tokens.map((s: { name: string }) => s.name),
      ...t.radius.tokens.map((r: { name: string }) => r.name),
      ...Object.keys(t.type.families).map((f) => `font-${f}`),
    ]);
    const used = [...html.matchAll(/var\(--([^)]+)\)/g)].map((m) =>
      (m[1] as string).replace(/\\\./g, "."),
    );
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) expect(names.has(name), name).toBe(true);
  });
  it("is not responsive", () => {
    expect(html).not.toMatch(/@media|@container|\d(vw|vh|cqw|cqh)\b/);
  });
  it("has exactly one svg", () => {
    expect(html.match(/<svg\b/g)).toHaveLength(1);
  });
  for (const theme of ["light", "dark"] as const) {
    it(`text reads at 4.5:1 or more on bg.canvas (${theme})`, () => {
      const ground = hex(COVER_ROLES.ground, theme);
      for (const role of Object.values(COVER_ROLES.text))
        expect(contrast(hex(role, theme), ground), role).toBeGreaterThanOrEqual(
          4.5,
        );
    });
    it(`every block stands off bg.canvas (${theme})`, () => {
      const ground = hex(COVER_ROLES.ground, theme);
      const roles = {
        ...COVER_ROLES.light,
        ...(theme === "dark" ? COVER_ROLES.dark : {}),
      };
      for (const role of Object.values(roles))
        expect(contrast(hex(role, theme), ground), role).toBeGreaterThanOrEqual(
          1.1,
        );
    });
  }
  it("matches the committed file", () => {
    expect(
      readFileSync(
        resolve(projectDir, "components/Cover/preview.html"),
        "utf8",
      ),
    ).toBe(html);
  });
  it("stays a bare cover: no README or types beside it", () => {
    for (const f of ["README.md", "index.d.ts", "preview.d.ts"])
      expect(existsSync(resolve(projectDir, "components/Cover", f)), f).toBe(
        false,
      );
  });
});
