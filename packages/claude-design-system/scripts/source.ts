/**
 * Shared source for every Claude-facing output (skill, brand book, artifact bundle):
 * semantic roles with light/dark values and usage text, plus the written guidance.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Json = any;

const tokensDir = dirname(
  fileURLToPath(import.meta.resolve("@civilian-dev/design-tokens/json")),
);
const readJson = (f: string): Json =>
  JSON.parse(readFileSync(resolve(tokensDir, f), "utf8"));
export const readText = (f: string): string =>
  readFileSync(resolve(tokensDir, f), "utf8");

export interface Role {
  name: string; // bg.canvas
  group: string;
  key: string;
  light: { hex: string; oklch: string; alpha: number };
  dark: { hex: string; oklch: string; alpha: number };
  usage: string;
  fromFigma: boolean;
}

const GROUP_HINTS: Record<string, string> = {
  bg: "Surface background",
  fg: "Text and icons",
  border: "Borders and dividers",
  brand: "Primary brand (teal)",
  accent: "Warm accent (salmon), used sparingly",
  highlight: "Gold highlight, used sparingly",
  secondary: "Secondary (violet)",
  success: "Success state",
  warning: "Warning state",
  danger: "Danger / destructive state",
  info: "Informational state",
  shadow: "Shadow colour",
  overlay: "Overlay",
};

const KEY_HINTS: Record<string, string> = {
  canvas: "page background behind everything",
  default: "default",
  subtle: "subtle tinted fill",
  muted: "muted fill",
  emphasized: "emphasised fill or stronger line",
  inverse: "inverted surface or text on inverted surface",
  disabled: "disabled content",
  focus: "focus ring",
  solid: "solid fill",
  hover: "hover state of the solid fill",
  fg: "text or icons on neutral surfaces",
  contrast: "text or icons placed on the solid fill",
  faint: "faint elevation",
  strong: "strong elevation",
  scrim: "scrim behind modals and drawers",
};

export interface Roles {
  roles: Role[];
  missingDescriptions: string[];
}

/** Semantic colour roles. Usage text comes from Figma variable descriptions, with a naming-based fallback. */
export function loadRoles(): Roles {
  const tokens = readJson("tokens.json");
  const resolved = readJson("resolved.json");
  const roles: Role[] = [];
  const missing: string[] = [];
  for (const [group, entries] of Object.entries<Json>(tokens.colors)) {
    for (const [key, t] of Object.entries<Json>(entries)) {
      if (typeof t.$value !== "string") continue; // primitives have literal values; roles are aliases
      const name = `${group}.${key}`;
      const fromFigma = Boolean(t.$description);
      if (!fromFigma) missing.push(name);
      const pick = (theme: "light" | "dark") =>
        resolved[theme].colors[group][key];
      roles.push({
        name,
        group,
        key,
        light: pick("light"),
        dark: pick("dark"),
        usage:
          t.$description ??
          `${GROUP_HINTS[group] ?? group}: ${KEY_HINTS[key] ?? key}`,
        fromFigma,
      });
    }
  }
  return { roles, missingDescriptions: missing };
}

export function assertDescriptions(r: Roles): void {
  if (!r.missingDescriptions.length) return;
  const msg = `${r.missingDescriptions.length} semantic colour roles have no Figma description (usage text falls back to naming hints): ${r.missingDescriptions.slice(0, 5).join(", ")}…`;
  if (process.env.STRICT_DESCRIPTIONS === "1") throw new Error(msg);
  console.warn(`warning: ${msg}`);
}

export const rolesTable = (roles: Role[]): string =>
  [
    "| Role | Light | Dark | Usage |",
    "|---|---|---|---|",
    ...roles.map(
      (r) =>
        `| \`${r.name}\` | \`${r.light.hex}\` | \`${r.dark.hex}\` | ${r.usage} |`,
    ),
  ].join("\n");

export const aesthetic = `Plain, exact and calm, with a little warmth: ink on paper, one framed card at the top of each page, and open space for reading. Warm accents (salmon and gold) are rationed against the cool teal and neutral base.`;

export const usageRules = [
  "Use semantic roles (`bg.canvas`, `fg.default`, `brand.solid`), never primitives (`teal.700`) or raw hex values.",
  "Support light and dark. Roles resolve per theme, so a role-based design adapts automatically.",
  "Corners: artwork, cards, callouts and code blocks are square; controls use `radii.sm`; pills and avatars use `radii.full`.",
  "Type: Poppins 600 for headings, Instrument Sans for body text and labels, Monaspace Xenon for code and file paths only.",
  "Text contrast must be at least 4.5:1 against its background. Pair `*.solid` with `*.contrast`, and use `fg.*` on `bg.*` surfaces.",
  "In the body, separate things with space. Rules belong to the card frame and tables only.",
];

export const consumption = `### CSS variables (any web output)

Include \`references/tokens.css\` (also published as \`@civilian-dev/design-tokens/css\`) and use the variables:

\`\`\`css
body { background: var(--colors-bg-canvas); color: var(--colors-fg-default); font-family: var(--fonts-body); }
\`\`\`

Dark mode follows the OS, and can be forced with \`<html data-theme="dark">\` or \`<html data-theme="light">\`.

### Panda CSS

\`\`\`ts
presets: ["@pandacss/preset-base", "@civilian-dev/panda-design-preset"]
\`\`\`

Then use roles in styles: \`css({ bg: "bg.canvas", color: "fg.default", textStyle: "body.medium" })\`.

### Raster, canvas, slides, OG images

CSS variables are unavailable here. Read \`references/tokens.resolved.json\`: per-theme final values, with \`hex\` and \`oklch\` for each colour (\`resolved.light.colors.bg.canvas.hex\`). Never hardcode colours. For a card or banner image, use \`compose()\` and \`toPng()\` from \`@civilian-dev/brand-graphics\`.

### Fonts, patterns, cards and diagrams

- **Fonts:** \`@civilian-dev/brand-fonts\` (\`fonts.css\` for pages, OpenType files for renderers). Never load fonts from a CDN.
- **Graphics:** \`@civilian-dev/brand-graphics\` draws the card (\`compose\`), patterns (\`pattern\`, \`calloutArt\`), PNGs (\`toPng\`) and diagrams (\`mermaidTheme\`). Never draw a pattern or the card by hand.`;
