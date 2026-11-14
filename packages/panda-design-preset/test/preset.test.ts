import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = resolve(here, "fixture");
const tokensCss = readFileSync(
  fileURLToPath(import.meta.resolve("@civilian-dev/design-tokens/css")),
  "utf8",
);

const varsIn = (css: string) =>
  new Set([...css.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1] as string));

describe("panda fixture", () => {
  let css = "";
  beforeAll(() => {
    rmSync(resolve(fixture, "styled-system"), { recursive: true, force: true });
    rmSync(resolve(fixture, "out"), { recursive: true, force: true });
    const run = (...a: string[]) =>
      execFileSync("pnpm", ["exec", "panda", ...a], {
        cwd: fixture,
        encoding: "utf8",
        stdio: "pipe",
      });
    run("codegen");
    run("cssgen", "--outfile", "out/styles.css");
    css = readFileSync(resolve(fixture, "out/styles.css"), "utf8");
  }, 120_000);

  it("emits exactly the variable names from design-tokens/css (no mismatches)", () => {
    const panda = varsIn(css);
    // Panda scopes some vars (e.g. its own helpers); only compare token namespaces.
    const ns =
      /^--(colors|fonts|font-sizes|font-weights|line-heights|letter-spacings|spacing|radii|sizes|durations|easings|z-index|shadows)-/;
    const expected = [...varsIn(tokensCss)].filter((v) => ns.test(v));
    const missing = expected.filter((v) => !panda.has(v));
    // Panda derives --sizes-breakpoint-* from theme.breakpoints; those are not design tokens.
    const extra = [...panda].filter(
      (v) =>
        ns.test(v) &&
        !v.startsWith("--sizes-breakpoint-") &&
        !varsIn(tokensCss).has(v),
    );
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it("uses the D4 dark selectors", () => {
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root:not([data-theme="light"])');
  });

  it("emits text style utilities", () => {
    expect(css).toContain("font-family: var(--fonts-heading)");
  });
});
