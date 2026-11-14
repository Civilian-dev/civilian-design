import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  flatten,
  normalise,
  pathFromCodeSyntax,
  round4,
  validate,
  validateWithTerrazzo,
} from "../scripts/normalise";

const raw = JSON.parse(
  readFileSync(new URL("../src/tokens.json", import.meta.url), "utf8"),
);
const out = normalise(raw);
const all = flatten(out.tokens);
const get = (p: string) => all.get(p);

/** Minimal raw-export fixture around one variable. */
const fixture = (
  group: string,
  name: string,
  web: string,
  type: string,
  value: unknown,
) => ({
  [group]: {
    [name]: {
      $value: value,
      $type: type,
      $extensions: { "com.figma": { codeSyntax: { WEB: web } } },
    },
  },
});

describe("paths from codeSyntax", () => {
  it("derives group and path", () => {
    expect(pathFromCodeSyntax("var(--colors-bg-canvas)")).toEqual([
      "colors",
      "bg",
      "canvas",
    ]);
    expect(pathFromCodeSyntax("var(--font-sizes-md)")).toEqual([
      "fontSizes",
      "md",
    ]);
    expect(pathFromCodeSyntax("var(--z-index-skip-link)")).toEqual([
      "zIndex",
      "skipLink",
    ]);
    expect(pathFromCodeSyntax("var(--spacing-4)")).toEqual(["spacing", "4"]);
    expect(pathFromCodeSyntax("var(--easings-in-out)")).toEqual([
      "easings",
      "inOut",
    ]);
  });
  it("rewrites aliases from collection paths to canonical paths", () => {
    expect(get("colors.bg.canvas")?.$value).toBe("{colors.base.paper}");
  });
});

describe("units", () => {
  it("emits unitless line heights", () => {
    expect(get("lineHeights.tight")?.$value).toBe(1.25);
  });
  it("converts letter spacings to em numbers rounded to 3dp", () => {
    expect(get("letterSpacings.tight")).toMatchObject({
      $type: "number",
      $value: -0.025,
    });
    expect(get("letterSpacings.widest")?.$value).toBe(0.1);
  });
  it("converts durations to ms", () => {
    expect(get("durations.normal")?.$value).toEqual({ value: 200, unit: "ms" });
  });
  it("uses rem for font sizes and spacing, px for radii and breakpoints", () => {
    expect(get("fontSizes.md")?.$value).toEqual({ value: 1, unit: "rem" });
    expect(get("spacing.4")?.$value).toEqual({ value: 1, unit: "rem" });
    expect(get("radii.sm")?.$value).toEqual({ value: 4, unit: "px" });
    expect(get("breakpoints.md")?.$value).toEqual({ value: 768, unit: "px" });
  });
});

describe("types", () => {
  it("types fonts as fontFamily with fallbacks", () => {
    expect(get("fonts.heading")).toMatchObject({ $type: "fontFamily" });
    expect((get("fonts.mono")?.$value as string[])[0]).toBe("Monaspace Xenon");
    expect((get("fonts.mono")?.$value as string[]).length).toBeGreaterThan(1);
  });
  it("types easings as cubicBezier arrays", () => {
    expect(get("easings.default")).toMatchObject({
      $type: "cubicBezier",
      $value: [0.4, 0, 0.2, 1],
    });
    expect(get("easings.linear")?.$value).toEqual([0, 0, 1, 1]);
  });
  it("types z-index as number", () => {
    expect(get("zIndex.modal")).toMatchObject({
      $type: "number",
      $value: 1400,
    });
  });
});

describe("float noise", () => {
  it("rounds to 4 significant digits", () => {
    expect(round4(0.05000000074505806)).toBe(0.05);
    expect(get("colors.neutral.50")?.$value.components[0]).toBe(0.9765);
    expect(get("colors.alpha.ink.5")?.$value).toMatchObject({
      alpha: 0.05,
      hex: "#022628",
    });
  });
});

describe("themes", () => {
  it("emits dark overrides only for differing values", () => {
    const dark = flatten(out.dark);
    expect(dark.get("colors.bg.canvas")?.$value).toBe("{colors.neutral.950}");
    expect(dark.has("colors.accent.solid")).toBe(false); // identical in both themes
  });
  it("defines a theme modifier in the resolver", () => {
    expect(out.resolver.modifiers.theme.contexts).toHaveProperty("light");
    expect(out.resolver.modifiers.theme.contexts).toHaveProperty("dark");
  });
});

describe("composites", () => {
  it("emits text styles referencing canonical paths", () => {
    expect(get("textStyles.heading.display")?.$value).toMatchObject({
      fontFamily: "{fonts.heading}",
      fontSize: "{fontSizes.display}",
      fontWeight: "{fontWeights.medium}",
      lineHeight: 1.25,
    });
    expect(
      get("textStyles.heading.display")?.$extensions["dev.civilian"]
        .letterSpacing,
    ).toBe(-0.025);
    expect(get("textStyles.code.small")?.$value.fontFamily).toBe(
      "{fonts.mono}",
    );
  });
  it("maps shadow colours to colors.shadow.*", () => {
    expect(get("shadows.sm")?.$value[0].color).toBe("{colors.shadow.default}");
    expect(get("shadows.sm")?.$value[0].offsetY).toEqual({
      value: 1,
      unit: "px",
    });
  });
  it("drops loose effects.shadows parts", () => {
    expect(out.tokens).not.toHaveProperty("effects");
  });
});

describe("validation", () => {
  it("fails on unresolved references", () => {
    const bad = fixture(
      "colorLight",
      "a",
      "var(--colors-a-b)",
      "color",
      "{primitives.nope}",
    );
    expect(() => normalise(bad)).toThrow(/Unresolved reference/);
  });
  it("fails on invalid $type", () => {
    expect(() => validate({ x: { $type: "bogus", $value: 1 } }, {})).toThrow(
      /invalid \$type/,
    );
  });
  it("fails on name collisions", () => {
    const f = {
      g: {
        a: {
          $value: 1,
          $type: "number",
          $extensions: {
            "com.figma": { codeSyntax: { WEB: "var(--z-index-a)" } },
          },
        },
        b: {
          $value: 2,
          $type: "number",
          $extensions: {
            "com.figma": { codeSyntax: { WEB: "var(--z-index-a)" } },
          },
        },
      },
    };
    expect(() => normalise(f)).toThrow(/collision/);
  });
  it("has zero unresolved references and passes strict Terrazzo validation", async () => {
    expect(() => validate(out.tokens, out.dark)).not.toThrow();
    await expect(validateWithTerrazzo(out.tokens)).resolves.toBeUndefined();
  });
});

describe("snapshot", () => {
  it("matches the canonical tokens", () => {
    expect(out.tokens).toMatchSnapshot();
    expect(out.dark).toMatchSnapshot();
    expect(out.resolver).toMatchSnapshot();
  });
});
