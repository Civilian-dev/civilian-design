/**
 * Generate the committed Claude plugin + skill and the marketplace pointer.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDesignSystem } from "./design-system";
import {
  aesthetic,
  assertDescriptions,
  consumption,
  generativePlaceholder,
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

export function skillMd(): string {
  return `---
name: civilian-design
description: Civilian visual design system (tokens, colour roles, type, spacing, radii). Use for ANY visual output - web pages, React components, slides, documents, charts, images, OG images, banners - so it matches the Civilian look.
---

# Civilian design system

## Aesthetic

${aesthetic}

## Usage rules

${usageRules.map((r) => `- ${r}`).join("\n")}

## How to consume the system

${consumption}

## Reference

- \`references/roles.md\`: every semantic colour role with light and dark values and usage.
- \`references/tokens.css\`: all CSS variables, with light and dark.
- \`references/tokens.resolved.json\`: final values per theme (hex and oklch).

## Generative assets

${generativePlaceholder}
`;
}

export function build(): void {
  const roles = loadRoles();
  assertDescriptions(roles);

  const plugin = resolve(pkgRoot, "plugin");
  rmSync(plugin, { recursive: true, force: true });

  write(
    resolve(plugin, ".claude-plugin/plugin.json"),
    `${JSON.stringify(
      {
        name: "civilian-design",
        description:
          "Civilian design system: tokens, colour roles and usage guidance for any visual output.",
        author: { name: "Tim Kinnane" },
        license: "MIT",
        repository: "https://github.com/Civilian-dev/civilian-design",
      },
      null,
      2,
    )}\n`,
  );

  const skill = resolve(plugin, "skills/civilian-design");
  write(resolve(skill, "SKILL.md"), skillMd());
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
              "Civilian design system skill: tokens, colour roles and usage guidance.",
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
