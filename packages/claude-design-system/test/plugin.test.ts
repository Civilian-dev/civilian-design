import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { skillMd } from "../scripts/build";
import { designMd, frontMatter } from "../scripts/design-md";
import { brandReferences, patternTable } from "../scripts/references";
import { assertDescriptions, loadRoles, rolesTable } from "../scripts/source";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const repoRoot = new URL("../../../", import.meta.url).pathname;
const guide = read("../../../DESIGN.md");

describe("skill", () => {
  const md = skillMd(guide);
  it("has frontmatter that triggers on visual output", () => {
    expect(md).toMatch(
      /^---\nname: civilian-design\ndescription: .*(pages|React|slides|OG).*\n---/s,
    );
  });
  it("sends the reader to the guide and the specimens first", () => {
    expect(md).toContain("Read `references/DESIGN.md`");
    expect(md).toContain("references/specimens/index.md");
  });
  it("carries the pattern placement table word for word", () => {
    expect(md).toContain(patternTable(guide));
    expect(md).toMatch(/\| Callout \| A fine tile in the tint/);
  });
  it("covers type, contrast and every consumption surface", () => {
    for (const s of [
      "Poppins",
      "Instrument Sans",
      "Monaspace Xenon",
      "4.5:1",
      "panda-design-preset",
      "tokens.resolved.json",
      "@civilian-dev/brand-fonts",
      "mermaidTheme",
      "toPng",
    ]) {
      expect(md).toContain(s);
    }
    expect(md).not.toContain("are coming");
  });
  it("matches the committed output", () => {
    expect(read("../plugin/skills/civilian-design/SKILL.md")).toBe(md);
  });
});

describe("references", () => {
  const refs = brandReferences(repoRoot, guide);
  const byPath = new Map(refs.map((r) => [r.path, r.content]));

  it("index the attachments specimen on the article page", () => {
    expect(byPath.get("specimens/index.md")).toMatch(
      /\| `attachments` \| `article.html` \|/,
    );
  });
  it("leave out the decisions page and seed numbers", () => {
    expect([...byPath.keys()].some((p) => p.includes("decisions"))).toBe(false);
    expect(byPath.get("specimens/index.md")).not.toMatch(/\| `\d+` \|/);
  });
  it("point every specimen link inside the skill", () => {
    for (const [path, content] of byPath) {
      if (path.endsWith(".html"))
        expect(content).not.toContain("../../packages");
    }
    expect(byPath.get("specimens/seeds.css")).not.toContain("@font-face");
  });
  it("keep no links out of the skill in the graphics README", () => {
    expect(byPath.get("brand-graphics.md")).not.toMatch(/\]\(\.\.\//);
  });
  it("match the committed copies", () => {
    for (const [path, content] of byPath) {
      expect(
        read(`../plugin/skills/civilian-design/references/${path}`),
        path,
      ).toBe(content);
    }
  });
});

describe("DESIGN.md front matter", () => {
  it("is generated from the tokens", () => {
    expect(guide.startsWith(frontMatter())).toBe(true);
  });
  it("keeps the hand-written body when regenerated", () => {
    expect(designMd(guide)).toBe(guide);
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
