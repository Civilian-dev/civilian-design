import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { skillMd } from "../scripts/build";
import { assertDescriptions, loadRoles, rolesTable } from "../scripts/source";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

describe("skill", () => {
  const md = skillMd();
  it("has frontmatter that triggers on visual output", () => {
    expect(md).toMatch(
      /^---\nname: civilian-design\ndescription: .*(pages|React|slides|OG).*\n---/s,
    );
  });
  it("covers the usage rules and consumption surfaces", () => {
    for (const s of [
      "Poppins",
      "Instrument Sans",
      "Monaspace Xenon",
      "4.5:1",
      "panda-design-preset",
      "tokens.resolved.json",
    ]) {
      expect(md).toContain(s);
    }
    expect(md).toContain("## Generative assets");
  });
  it("matches the committed output", () => {
    expect(read("../plugin/skills/civilian-design/SKILL.md")).toBe(md);
  });
});

describe("roles", () => {
  const roles = loadRoles();
  it("lists every semantic role with light and dark hex", () => {
    expect(roles.roles.length).toBeGreaterThan(40);
    const table = rolesTable(roles.roles);
    expect(table).toContain("`bg.canvas` | `#fdfbf8`");
  });
  it("fails the build in strict mode when Figma descriptions are missing", () => {
    const prev = process.env.STRICT_DESCRIPTIONS;
    process.env.STRICT_DESCRIPTIONS = "1";
    try {
      expect(() =>
        assertDescriptions({ roles: [], missingDescriptions: ["bg.canvas"] }),
      ).toThrow(/no Figma description/);
      expect(() =>
        assertDescriptions({ roles: [], missingDescriptions: [] }),
      ).not.toThrow();
    } finally {
      if (prev === undefined) delete process.env.STRICT_DESCRIPTIONS;
      else process.env.STRICT_DESCRIPTIONS = prev;
    }
  });
});
