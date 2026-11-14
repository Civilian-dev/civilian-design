import { describe, expect, it } from "vitest";
import {
  classify,
  diffSnapshots,
  renderChangeset,
  renderMarkdown,
  type Snapshot,
} from "../scripts/token-diff";

const colour = (hex: string) => ({
  hex,
  oklch: "oklch(0 0 0)",
  alpha: 1,
  css: hex,
});
const snap = (colours: Record<string, string>): Snapshot => ({
  tokens: {
    colors: Object.fromEntries(
      Object.keys(colours).map((k) => [k, { $type: "color", $value: "x" }]),
    ),
  },
  dark: {},
  resolved: {
    light: {
      colors: Object.fromEntries(
        Object.entries(colours).map(([k, v]) => [k, colour(v)]),
      ),
    },
    dark: {
      colors: Object.fromEntries(
        Object.entries(colours).map(([k, v]) => [k, colour(v)]),
      ),
    },
  },
});

describe("token diff", () => {
  const base = snap({ a: "#111111", b: "#222222" });
  it("classifies a changed value as patch", () => {
    const d = diffSnapshots(base, snap({ a: "#111112", b: "#222222" }));
    expect(d.changed.map((c) => c.path)).toEqual([
      "colors.a",
      "colors.a (dark)",
    ]);
    expect(classify(d, "1.0.0")).toBe("patch");
    expect(classify(d, "0.1.0")).toBe("patch");
  });
  it("classifies an addition as minor (patch on 0.x)", () => {
    const d = diffSnapshots(
      base,
      snap({ a: "#111111", b: "#222222", c: "#333333" }),
    );
    expect(d.added.map((c) => c.path)).toEqual(["colors.c"]);
    expect(classify(d, "1.2.0")).toBe("minor");
    expect(classify(d, "0.2.0")).toBe("patch");
  });
  it("classifies removal/rename as major (minor on 0.x)", () => {
    const d = diffSnapshots(base, snap({ a: "#111111", z: "#222222" }));
    expect(d.removed.map((c) => c.path)).toEqual(["colors.b"]);
    expect(classify(d, "1.0.0")).toBe("major");
    expect(classify(d, "0.2.0")).toBe("minor");
  });
  it("reports no change", () => {
    const d = diffSnapshots(base, base);
    expect(classify(d, "0.1.0")).toBeUndefined();
    expect(renderMarkdown(d, undefined)).toContain("No token changes");
  });
  it("renders swatches and changeset", () => {
    const d = diffSnapshots(base, snap({ a: "#111112", b: "#222222" }));
    expect(renderMarkdown(d, "patch")).toContain(
      "placehold.co/14x14/111111/111111.png",
    );
    expect(renderChangeset(d, "patch")).toContain(
      '"@civilian-dev/design-tokens": patch',
    );
  });
});
