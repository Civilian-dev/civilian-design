import { describe, expect, it } from "vitest";
import { compose, hex, mermaidTheme } from "../src/index";
import { toPng } from "../src/raster";

/** Width and height from a PNG's IHDR chunk. */
const size = (png: Uint8Array) => {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

const card = compose({
  width: 1200,
  height: 630,
  theme: "light",
  feature: "weave",
  seed: 3,
  text: {
    letter: "A",
    kind: "Article",
    number: "012",
    section: "Field notes",
    title: ["A field guide to", "small libraries"],
    meta: "14 Nov 2026 · 6 min read",
  },
});

describe("toPng", () => {
  it("renders a PNG at the SVG's size", () => {
    const png = toPng(card);
    expect(
      [...png.subarray(1, 4)].map((c) => String.fromCharCode(c)).join(""),
    ).toBe("PNG");
    expect(size(png)).toEqual({ width: 1200, height: 630 });
  });

  it("scales to a given width", () => {
    expect(size(toPng(card, { width: 2400 }))).toEqual({
      width: 2400,
      height: 1260,
    });
  });

  it("draws the text with the brand fonts", () => {
    // Without a font to draw with, the text would vanish and the two match.
    const withText = toPng(card);
    const without = toPng(
      compose({
        width: 1200,
        height: 630,
        theme: "light",
        feature: "weave",
        seed: 3,
      }),
    );
    expect(
      Buffer.compare(Buffer.from(withText), Buffer.from(without)),
    ).not.toBe(0);
  });

  it("is the same every time", () => {
    expect(Buffer.from(toPng(card)).equals(Buffer.from(toPng(card)))).toBe(
      true,
    );
  });
});

describe("mermaidTheme", () => {
  it.each(["light", "dark"] as const)(
    "uses the %s page ground and ink",
    (theme) => {
      const config = mermaidTheme(theme);
      expect(config.theme).toBe("base");
      expect(config.themeVariables.background).toBe(hex("bg.canvas", theme));
      expect(config.themeVariables.lineColor).toBe(hex("fg.default", theme));
      expect(config.themeVariables.darkMode).toBe(theme === "dark");
    },
  );

  it("fills the output node with ink and squares every box", () => {
    const { themeCSS } = mermaidTheme("light");
    expect(themeCSS).toContain(
      `.node.output rect, .node.output polygon { fill: ${hex("fg.default")}; }`,
    );
    expect(themeCSS).toMatch(
      /\.node rect[^{]*\{ rx: 0; ry: 0; stroke-width: 2px; \}/,
    );
  });

  it("sets resolved colours only, since Mermaid cannot read custom properties", () => {
    expect(JSON.stringify(mermaidTheme("dark"))).not.toContain("var(");
  });
});
