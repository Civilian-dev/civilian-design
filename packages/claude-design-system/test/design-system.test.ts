import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTokensJson,
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
      "fonts/OFL.txt",
      "fonts/monaspace-xenon-latin-400-normal.woff2",
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
  it("every font file named by tokens.json exists", () => {
    const t = JSON.parse(
      readFileSync(resolve(projectDir, "tokens.json"), "utf8"),
    );
    for (const f of t.type.fonts)
      expect(existsSync(resolve(projectDir, f.file)), f.file).toBe(true);
  });
});
