/**
 * Generate the committed Claude plugin + skill and the marketplace pointer.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { updateDesignMd } from "./design-md";
import { buildDesignSystem } from "./design-system";
import { brandReferences, patternTable } from "./references";
import {
  aesthetic,
  assertDescriptions,
  consumption,
  loadRoles,
  readText,
  rolesTable,
  usageRules,
} from "./source";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(pkgRoot, "../..");

const write = (path: string, content: string) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

export function skillMd(designMd: string): string {
  return `---
name: civilian-design
description: Civilian visual design system - brand guide, tokens, colour roles, type, the card, patterns, diagrams and page specimens. Use for ANY visual output - web pages, React components, slides, documents, charts, images, OG images, banners - so it matches the Civilian look.
---

# Civilian design system

## Before you start

1. Read \`references/DESIGN.md\`, the brand guide. It sets the three layers of a page, twelve rules in priority order, colour, type, components, patterns and what a new theme may change.
2. Find the nearest element in \`references/specimens/index.md\` and copy its markup from the specimen page with \`references/specimens/seeds.css\`. Do not rebuild a component from a description.
3. Take every value from the tokens. Never write a hex value.

When something is not covered, use the nearest specimen and say what was missing. Do not invent an element, colour, size or pattern.

## Aesthetic

${aesthetic}

## Usage rules

${usageRules.map((r) => `- ${r}`).join("\n")}

## Patterns

${patternTable(designMd)}

Make patterns with \`pattern()\` and \`calloutArt()\` from \`@civilian-dev/brand-graphics\`, never by hand. How to size and colour each one is in \`references/brand-graphics.md\`.

## How to consume the system

${consumption}

## Reference

Each file is copied from the repo at build time; the source is in brackets.

- \`references/DESIGN.md\`: the brand guide (\`DESIGN.md\`).
- \`references/specimens/\`: a page for every element, in light and dark, with \`index.md\` listing which page holds each one (\`docs/brand-seeds\`).
- \`references/brand-graphics.md\`: the card, patterns, PNG output and diagrams in code (\`packages/brand-graphics/README.md\`).
- \`references/patterns.css\`: pattern colour defaults (\`packages/brand-graphics/src/patterns.css\`).
- \`references/roles.md\`: every semantic colour role with light and dark values and usage (built from the tokens).
- \`references/tokens.css\`: all CSS variables, with light and dark (\`@civilian-dev/design-tokens/css\`).
- \`references/tokens.resolved.json\`: final values per theme, hex and oklch (\`@civilian-dev/design-tokens/resolved\`).
`;
}

export function build(): void {
  const roles = loadRoles();
  assertDescriptions(roles);
  const designMd = updateDesignMd(repoRoot);

  const plugin = resolve(pkgRoot, "plugin");
  rmSync(plugin, { recursive: true, force: true });

  write(
    resolve(plugin, ".claude-plugin/plugin.json"),
    `${JSON.stringify(
      {
        name: "civilian-design",
        description:
          "Civilian design system: brand guide, tokens, colour roles, patterns and page specimens for any visual output.",
        author: { name: "Tim Kinnane" },
        license: "MIT",
        repository: "https://github.com/Civilian-dev/civilian-design",
      },
      null,
      2,
    )}\n`,
  );

  const skill = resolve(plugin, "skills/civilian-design");
  write(resolve(skill, "SKILL.md"), skillMd(designMd));
  for (const ref of brandReferences(repoRoot, designMd)) {
    write(resolve(skill, "references", ref.path), ref.content);
  }
  write(resolve(skill, "references/tokens.css"), readText("tokens.css"));
  write(
    resolve(skill, "references/tokens.resolved.json"),
    readText("resolved.json"),
  );
  write(
    resolve(skill, "references/roles.md"),
    `# Colour roles\n\nGenerated from the design tokens. Light and dark hex values per semantic role.\n\n${rolesTable(roles.roles)}\n`,
  );

  buildDesignSystem();

  write(
    resolve(repoRoot, ".claude-plugin/marketplace.json"),
    `${JSON.stringify(
      {
        name: "civilian-design",
        owner: { name: "Tim Kinnane" },
        plugins: [
          {
            name: "civilian-design",
            source: "./packages/claude-design-system/plugin",
            description:
              "Civilian design system skill: brand guide, tokens, patterns and page specimens.",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  build();
  console.log("built claude plugin");
}
