/**
 * Generates the front matter of the repo's DESIGN.md from the design tokens.
 * The prose below the front matter is hand-written and never touched.
 *
 * The names are DESIGN.md's (`ink`, `concrete`, `label`); each points at a
 * token. Change a value in Figma, never here; change a name or what it
 * points at here.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readText } from "./source";

type Json = any;

/** DESIGN.md colour names, light theme, as token paths. */
const COLORS: [name: string, token: string][] = [
  ["primary", "brand.solid"],
  ["primary-hover", "brand.hover"],
  ["ink", "fg.default"],
  ["paper", "bg.canvas"],
  ["surface", "bg.default"],
  ["concrete", "bg.emphasized"],
  ["secondary", "secondary.solid"],
  ["tertiary", "accent.solid"],
  ["highlight", "highlight.solid"],
  ["signal", "red.500"],
  ["neutral", "bg.subtle"],
  ["neutral-muted", "bg.muted"],
  ["border", "border.default"],
  ["border-strong", "border.emphasized"],
  ["text-muted", "fg.muted"],
  ["text-subtle", "fg.subtle"],
  ["tint-salmon", "accent.subtle"],
  ["tint-gold", "highlight.subtle"],
  ["tint-violet", "info.subtle"],
  ["tint-teal", "brand.subtle"],
];

/** DESIGN.md type names, as text style paths. */
const TYPOGRAPHY: [name: string, style: string][] = [
  ["display", "heading.display"],
  ["heading-xl", "heading.h1"],
  ["heading-lg", "heading.h2"],
  ["body-lg", "body.large"],
  ["body-md", "body.medium"],
  ["body-sm", "body.small"],
  ["label", "label.overline"],
  ["code", "code.medium"],
];

/** Radii the guide uses: none for artwork and containers, sm for controls, full for pills. */
const ROUNDED = ["none", "sm", "md", "full"];

const SPACING = ["1", "2", "3", "4", "6", "8", "12", "16", "24", "32"];

/** Components reference the names above, so they need no values of their own. */
const COMPONENTS = `components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
  label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.concrete}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: 24px
  callout:
    backgroundColor: "{colors.tint-salmon}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 24px
  callout-tip:
    backgroundColor: "{colors.tint-gold}"
    textColor: "{colors.ink}"
  callout-note:
    backgroundColor: "{colors.tint-teal}"
    textColor: "{colors.ink}"
  callout-info:
    backgroundColor: "{colors.tint-violet}"
    textColor: "{colors.ink}"
  code-block:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: 16px`;

const at = (tree: Json, path: string): Json => {
  let node = tree;
  for (const key of path.split(".")) {
    node = node?.[key];
    if (node === undefined) throw new Error(`DESIGN.md: no token ${path}`);
  }
  return node;
};

export function frontMatter(): string {
  const light = JSON.parse(readText("resolved.json")).light;
  const lines = [
    "version: alpha",
    "name: Civilian Dev",
    "description: Plain, spacious and useful. Ink on paper, one framed card at the top of each page, and open space for reading.",
    "colors:",
    ...COLORS.map(
      ([name, path]) => `  ${name}: "${at(light.colors, path).hex}"`,
    ),
    "typography:",
  ];
  for (const [name, path] of TYPOGRAPHY) {
    const s = at(light.textStyles, path);
    lines.push(
      `  ${name}:`,
      `    fontFamily: ${s.fontFamily[0]}`,
      `    fontSize: ${s.fontSize}`,
      `    fontWeight: ${s.fontWeight}`,
      `    lineHeight: ${s.lineHeight}`,
    );
    if (s.letterSpacing !== "0em")
      lines.push(`    letterSpacing: ${s.letterSpacing}`);
  }
  lines.push(
    "rounded:",
    ...ROUNDED.map((k) => `  ${k}: ${at(light.radii, k)}`),
    "spacing:",
    ...SPACING.map((k) => `  "${k}": ${at(light.spacing, k)}`),
    `  prose: ${light.sizes.prose}`,
    COMPONENTS,
  );
  return `---\n${lines.join("\n")}\n---\n`;
}

/** DESIGN.md with its front matter replaced by the generated one. */
export function designMd(current: string): string {
  const match = current.match(/^---\n[\s\S]*?\n---\n/);
  if (!match) throw new Error("DESIGN.md: no front matter to replace");
  return frontMatter() + current.slice(match[0].length);
}

export function updateDesignMd(repoRoot: string): string {
  const path = resolve(repoRoot, "DESIGN.md");
  const next = designMd(readFileSync(path, "utf8"));
  writeFileSync(path, next);
  return next;
}
