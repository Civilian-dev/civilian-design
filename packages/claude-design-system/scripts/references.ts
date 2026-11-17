/**
 * Brand references the skill ships alongside the tokens: the guide, the
 * graphics package's README and the specimen pages, copied from the repo
 * and rewritten so their links work inside the skill folder.
 */
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface Reference {
  /** Path inside the skill's `references/` folder. */
  path: string;
  content: string;
}

/** Markdown links that point outside the skill: mapped, or reduced to their text. */
const LINKS: Record<string, string> = {
  "../../DESIGN.md": "DESIGN.md",
  "../../docs/brand-seeds/README.md": "specimens/index.md",
};

function rewriteLinks(markdown: string): string {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, text, target) => {
    if (LINKS[target]) return `[${text}](${LINKS[target]})`;
    if (target.startsWith("../") || target.startsWith("examples/")) return text;
    return all;
  });
}

/** The pattern placement table from DESIGN.md, word for word. */
export function patternTable(designMd: string): string {
  const start = designMd.indexOf("**Where patterns go.**");
  if (start < 0) throw new Error("DESIGN.md: no pattern placement table");
  const rest = designMd.slice(start);
  const end = rest.indexOf("\n## ");
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

/** Specimen pages and their stylesheet, with links pointing inside the skill. */
function specimens(seedsDir: string): Reference[] {
  // The decisions page is for reviewing a round, not a specimen to copy.
  const pages = readdirSync(seedsDir)
    .filter((f) => f.endsWith(".html") && !f.startsWith("decisions"))
    .sort();
  const out: Reference[] = pages.map((f) => ({
    path: `specimens/${f}`,
    content: readFileSync(resolve(seedsDir, f), "utf8")
      .replaceAll(
        "../../packages/design-tokens/dist/tokens.css",
        "../tokens.css",
      )
      .replaceAll(
        "../../packages/brand-graphics/src/patterns.css",
        "../patterns.css",
      ),
  }));
  // The repo's @font-face rules point at files the skill does not ship.
  const css = readFileSync(resolve(seedsDir, "seeds.css"), "utf8").replace(
    /@font-face \{[^}]*\}\n/g,
    "",
  );
  out.push({
    path: "specimens/seeds.css",
    content: css.replace(
      /^(\/\*[\s\S]*?\*\/\n)/,
      "$1\n/* Fonts: load @civilian-dev/brand-fonts/fonts.css before this file. */\n",
    ),
  });
  out.push({
    path: "specimens/index.md",
    content: specimenIndex(seedsDir, pages),
  });
  return out;
}

/** Which page holds the specimen for each element, by its data-seed name. */
function specimenIndex(seedsDir: string, pages: string[]): string {
  const where = new Map<string, string[]>();
  for (const page of pages.filter((f) => !f.endsWith("-dark.html"))) {
    const html = readFileSync(resolve(seedsDir, page), "utf8");
    // Element names only: composed SVGs carry their numeric seed in data-seed.
    for (const [, name] of html.matchAll(/data-seed="([a-z][a-z-]*)"/g)) {
      const list = where.get(name as string) ?? [];
      if (!list.includes(page)) list.push(page);
      where.set(name as string, list);
    }
  }
  const rows = [...where.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([name, list]) =>
        `| \`${name}\` | ${list.map((p) => `\`${p}\``).join(", ")} |`,
    );
  return `# Specimens

Built pages for every element of the Civilian style, from \`docs/brand-seeds\` in the repo. Each page has a \`-dark\` twin. Find the element below, open its page, search for \`data-seed="<name>"\` and copy that markup with \`seeds.css\`. Load \`../tokens.css\`, \`@civilian-dev/brand-fonts/fonts.css\` and \`../patterns.css\` first.

| Element (\`data-seed\`) | Page |
| --- | --- |
${rows.join("\n")}
`;
}

export function brandReferences(
  repoRoot: string,
  designMd: string,
): Reference[] {
  const graphics = resolve(repoRoot, "packages/brand-graphics");
  return [
    { path: "DESIGN.md", content: designMd },
    {
      path: "brand-graphics.md",
      content: rewriteLinks(
        readFileSync(resolve(graphics, "README.md"), "utf8"),
      ),
    },
    {
      path: "patterns.css",
      content: readFileSync(resolve(graphics, "src/patterns.css"), "utf8"),
    },
    ...specimens(resolve(repoRoot, "docs/brand-seeds")),
  ];
}
