/**
 * Generate the Design System artifact bundle (claude.ai "Design System" type, files layout)
 * under design-system/project/. Format: tokens.json in the type's LIST shape (not DTCG).
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aesthetic,
  consumption,
  loadRoles,
  type Role,
  rolesTable,
  usageRules,
} from "./source";
import { readJsonFile } from "./util";

type Json = any;

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const projectDir = resolve(pkgRoot, "design-system/project");

const FONT_WEIGHTS = ["400", "500", "600", "700"];

/** Bundled families (all SIL OFL 1.1), pinned via @fontsource so the page needs no font CDN. */
const FONTS = [
  { family: "Poppins", slug: "poppins" },
  { family: "Instrument Sans", slug: "instrument-sans" },
  { family: "Monaspace Xenon", slug: "monaspace-xenon" },
] as const;

const fontFile = (slug: string, weight: string) =>
  `${slug}-latin-${weight}-normal.woff2`;

const hexWithAlpha = (c: { hex: string; alpha: number }): string =>
  c.alpha < 1
    ? `${c.hex}${Math.round(c.alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    : c.hex;

const hexOf = (r: Role, theme: "light" | "dark"): string =>
  hexWithAlpha(r[theme]);

const SPACE_USAGE: Record<string, string> = {
  "0": "No space.",
  "1": "Tight gaps: icon to label.",
  "2": "Compact gaps inside controls.",
  "3": "Control padding.",
  "4": "Default gap and card padding.",
  "6": "Gaps between related groups.",
  "8": "Section padding on small screens.",
  "12": "Large gaps between sections.",
  "16": "Section spacing.",
  "24": "Large section spacing.",
  "32": "Hero and page-level spacing.",
  "48": "Maximum page-level spacing.",
};

const RADIUS_USAGE: Record<string, string> = {
  none: "Square corners.",
  sm: "Controls: buttons, inputs.",
  md: "Surfaces: cards, panels.",
  lg: "Rare emphasis only.",
  xl: "Rare emphasis only.",
  full: "Pills and avatars.",
};

const SHADOW_USAGE: Record<string, string> = {
  sm: "Subtle lift: controls, small cards.",
  md: "Cards and popovers.",
  lg: "Dropdowns and floating panels.",
  xl: "Modals and the highest elevation.",
};

export function buildTokensJson(): Json {
  const resolved: Json = readJsonFile("resolved.json");
  const { roles } = loadRoles();
  const light = resolved.light;

  const shadowCss = (layers: Json[]) =>
    layers
      .map(
        (l) =>
          `${l.inset ? "inset " : ""}${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${hexWithAlpha(l.color)}`,
      )
      .join(", ");

  return {
    name: "Civilian",
    version: 1,
    color: {
      themes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" },
      ],
      tokens: roles.map((r) => ({
        name: r.name,
        value: { light: hexOf(r, "light"), dark: hexOf(r, "dark") },
        usage: r.usage,
      })),
    },
    type: {
      fonts: FONTS.flatMap(({ family, slug }) =>
        FONT_WEIGHTS.map((w) => ({
          family,
          file: `fonts/${fontFile(slug, w)}`,
          weight: w,
        })),
      ),
      families: {
        heading: '"Poppins", system-ui, sans-serif',
        body: '"Instrument Sans", system-ui, sans-serif',
        mono: '"Monaspace Xenon", ui-monospace, SFMono-Regular, Menlo, monospace',
      },
      groups: Object.entries<Json>(light.textStyles).map(([group, styles]) => ({
        name: group.charAt(0).toUpperCase() + group.slice(1),
        family:
          group === "heading" ? "heading" : group === "code" ? "mono" : "body",
        styles: Object.entries<Json>(styles).map(([name, s]) => ({
          name: `${group}-${name}`,
          fontSize: s.fontSize,
          lineHeight: String(s.lineHeight),
          fontWeight: s.fontWeight,
          letterSpacing: s.letterSpacing,
        })),
      })),
    },
    spacing: {
      tokens: Object.entries<string>(light.spacing).map(([k, v]) => ({
        name: `space-${k}`,
        value: v,
        usage: SPACE_USAGE[k] ?? "Spacing step.",
      })),
    },
    radius: {
      tokens: Object.entries<string>(light.radii).map(([k, v]) => ({
        name: `radius-${k}`,
        value: v,
        usage: RADIUS_USAGE[k] ?? "Corner radius.",
      })),
    },
    shadow: {
      tokens: Object.entries<Json>(light.shadows).map(([k, v]) => ({
        name: `shadow-${k}`,
        value: shadowCss(v),
        usage: SHADOW_USAGE[k] ?? "Elevation.",
      })),
    },
  };
}

export function readmeMd(): string {
  const { roles } = loadRoles();
  return `# Civilian design system

${aesthetic}

## Visual foundations

- **Colour:** teal and cool neutrals carry the interface; salmon and gold are warm accents, used sparingly. Always use semantic roles, which resolve per theme (light and dark).
- **Type:** Poppins for headings, Instrument Sans for body text, Monaspace Xenon for code. Text styles are defined in \`tokens.json\` (\`heading-display\` … \`code-small\`).
- **Space and shape:** a 4px-based spacing scale (\`space-*\`). Radius \`radius-sm\` for controls, \`radius-md\` for surfaces; \`radius-lg\` / \`radius-xl\` only for rare emphasis.
- **Elevation:** \`shadow-sm\` to \`shadow-xl\`; shadow colours are themed.

## Usage rules

${usageRules.map((r) => `- ${r}`).join("\n")}

## Colour roles

${rolesTable(roles)}

## Using the system

${consumption}

---

*Generated from \`@civilian-dev/design-tokens\` by CI. Do not edit here; change the tokens in Figma.*
`;
}

/** `brand.solid` → `var(--brand\.solid)`, as named in the type's compiled tokens.css. */
const cssVar = (token: string): string =>
  `var(--${token.replace(/\./g, "\\.")})`;

/**
 * Colour roles on the cover, by class. The page sets `data-theme` and loads
 * the tokens, so the cover names roles and never colours. `dark` swaps a role
 * whose dark value sits too close to `bg.canvas` to read as a block.
 */
export const COVER_ROLES = {
  text: { name: "fg.default", tagline: "fg.muted" },
  ground: "bg.canvas",
  light: {
    teal: "brand.solid",
    ink: "bg.inverse",
    salmon: "accent.solid",
    gold: "highlight.solid",
    tint: "brand.muted",
  },
  dark: { tint: "brand.hover" },
} as const;

export const COVER_HEIGHT = 320;

/** Quarter-disc from packages/brand-graphics/src/shapes, centre on (cx, cy), turned to `corner`. */
const quarterDisc = (
  cx: number,
  cy: number,
  r: number,
  corner: "bottom-left" | "top-right",
): string =>
  corner === "bottom-left"
    ? `M${cx} ${cy}V${cy - r}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z`
    : `M${cx - r} ${cy}A${r} ${r} 0 0 0 ${cx} ${cy + r}V${cy}Z`;

/**
 * The Design System page's cover card (the type's cover.md): solid blocks in
 * the identity colours, one pattern from the brand's own pieces, and the name.
 * Fixed 960 × COVER_HEIGHT; every size is a spacing step (1rem = 16px).
 */
export function coverHtml(): string {
  const H = COVER_HEIGHT;
  const tile = 32; // space-8
  // Weave (G5): one piece tiled edge to edge in whole tiles, one turn.
  const weave: string[] = [];
  for (let y = 192; y < H; y += tile)
    for (let x = 480; x < 672; x += tile)
      weave.push(quarterDisc(x, y + tile, tile, "bottom-left"));
  const fills = Object.entries(COVER_ROLES.light)
    .map(([cls, role]) => `.${cls}{fill:${cssVar(role)}}`)
    .join("");
  const darkFills = Object.entries(COVER_ROLES.dark)
    .map(([cls, role]) => `[data-theme="dark"] .${cls}{fill:${cssVar(role)}}`)
    .join("");
  return `<!-- @dsCard group="Cover" height=${H} -->
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; }
  body { position: relative; width: 960px; height: ${H}px; overflow: hidden; background: ${cssVar(COVER_ROLES.ground)}; }
  svg { position: absolute; inset: 0; display: block; }
  ${fills}
  ${darkFills}
  rect { rx: ${cssVar("radius-none")}; }
  h1, p { position: absolute; left: ${cssVar("space-12")}; margin: 0; max-width: 400px; }
  h1 { bottom: calc(${cssVar("space-12")} + ${cssVar("space-8")}); font: 600 112px/0.92 ${cssVar("font-heading")}; letter-spacing: -0.025em; color: ${cssVar(COVER_ROLES.text.name)}; }
  p { bottom: ${cssVar("space-12")}; font: 400 14px/1.4 ${cssVar("font-body")}; color: ${cssVar(COVER_ROLES.text.tagline)}; }
</style>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${H}" viewBox="0 0 960 ${H}" aria-hidden="true">
  <!-- Blocks: brand.solid 288×192 (space-24×3 by space-48), bg.inverse 192×128 (space-48 by space-32), highlight.solid 96×128 (space-24 by space-32), brand.muted 192×128 under the weave (brand.hover in dark), accent.solid quarter-disc r=96 (space-24). -->
  <!-- Arrangement: blocks share edges on a space-8 grid at x ≥ 480 and bleed off the top, right and bottom; bg.canvas stays open top left so the name owns that side. -->
  <!-- Pattern: brand.solid quarter-discs from brand-graphics/src/shapes tiled edge to edge in one turn over brand.muted, the G5 weave without its gradient; the accent.solid quarter-disc sits centred on the corner like the G5 grain piece. -->
  <!-- Steps and radii: space-8 tiles and grid, space-24 / space-32 / space-48 sides, space-12 text inset, radius-none on every rect (pieces keep square corners, G2). -->
  <rect class="teal" x="672" y="0" width="288" height="192"/>
  <path class="salmon" d="${quarterDisc(960, 0, 96, "top-right")}"/>
  <rect class="tint" x="480" y="192" width="192" height="128"/>
  <path class="teal" d="${weave.join("")}"/>
  <rect class="ink" x="672" y="192" width="192" height="128"/>
  <rect class="gold" x="864" y="192" width="96" height="128"/>
</svg>
<h1>Civilian</h1>
<p>Clean, professional, roomy, verging on cold.</p>
`;
}

function indexJson(contentHash: string): Json {
  return {
    v: 3,
    layout: "files",
    createdOnFiles: { v: 1, at: "2026-11-14T00:00:00Z" },
    editing: "code",
    title: "Civilian",
    namespace: "Civilian",
    libraries: [],
    sections: {},
    groups: [],
    assetGroups: {},
    blobs: {},
    docs: { readme: "project/README.md", sections: [] },
    // `at` is a build-stable placeholder; the publish routine rewrites it with the real time and release tag.
    lastChange: {
      by: "Civilian CI",
      at: "2026-11-14T00:00:00Z",
      via: `CI ${contentHash}`,
      note: "Generated from @civilian-dev/design-tokens. Edit the tokens in Figma, not here.",
    },
  };
}

export function buildDesignSystem(): void {
  rmSync(resolve(pkgRoot, "design-system"), { recursive: true, force: true });
  const out = (p: string, c: string) => {
    mkdirSync(dirname(resolve(projectDir, p)), { recursive: true });
    writeFileSync(resolve(projectDir, p), c);
  };
  const json = (o: unknown) => `${JSON.stringify(o, null, 2)}\n`;

  const files: Record<string, string> = {
    "tokens.json": json(buildTokensJson()),
    "README.md": readmeMd(),
    "components/Cover/preview.html": coverHtml(),
  };
  for (const [p, c] of Object.entries(files)) out(p, c);

  // Fonts: each family's latin woff2 files plus its licence as <slug>-OFL.txt.
  mkdirSync(resolve(projectDir, "fonts"), { recursive: true });
  const require = createRequire(import.meta.url);
  const fontFiles: string[] = [];
  for (const { slug } of FONTS) {
    const dir = dirname(require.resolve(`@fontsource/${slug}/package.json`));
    for (const w of FONT_WEIGHTS) {
      const f = fontFile(slug, w);
      copyFileSync(resolve(dir, "files", f), resolve(projectDir, "fonts", f));
      fontFiles.push(f);
    }
    copyFileSync(
      resolve(dir, "LICENSE"),
      resolve(projectDir, `fonts/${slug}-OFL.txt`),
    );
  }

  const hash = createHash("sha256");
  for (const p of Object.keys(files).sort()) hash.update(files[p] as string);
  for (const f of fontFiles)
    hash.update(readFileSync(resolve(projectDir, "fonts", f)));
  out("design-system.json", json(indexJson(hash.digest("hex").slice(0, 8))));
}
