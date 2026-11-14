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
      fonts: FONT_WEIGHTS.map((w) => ({
        family: "Monaspace Xenon",
        file: `fonts/monaspace-xenon-latin-${w}-normal.woff2`,
        weight: w,
      })),
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

export function coverHtml(): string {
  const resolved: Json = readJsonFile("resolved.json");
  const c = resolved.light.colors;
  const swatches = [
    c.bg.canvas,
    c.brand.solid,
    c.accent.solid,
    c.highlight.solid,
    c.secondary.solid,
    c.fg.default,
  ]
    .map((x: { hex: string }) => `<i style="background:${x.hex}"></i>`)
    .join("");
  return `<!-- @dsCard group="Cover" height=320 -->
<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; min-height: 100vh; display: grid; align-content: center; gap: 24px; padding: 48px;
         background: ${c.bg.canvas.hex}; color: ${c.fg.default.hex}; font-family: "Poppins", system-ui, sans-serif; }
  h1 { margin: 0; font-size: 2.75rem; font-weight: 500; letter-spacing: -0.025em; line-height: 1.25; }
  p { margin: 0; max-width: 40ch; font-family: "Instrument Sans", system-ui, sans-serif; line-height: 1.625; color: ${c.fg.muted.hex}; }
  .sw { display: flex; gap: 8px; } .sw i { width: 40px; height: 40px; border-radius: 4px; border: 1px solid ${c.border.default.hex}; }
</style>
<h1>Civilian</h1>
<p>Clean, professional and roomy, with warm accents used sparingly.</p>
<div class="sw">${swatches}</div>
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

  // Fonts: Monaspace Xenon (OFL), pinned via @fontsource/monaspace-xenon.
  const fontDir = dirname(
    createRequire(import.meta.url).resolve(
      "@fontsource/monaspace-xenon/package.json",
    ),
  );
  mkdirSync(resolve(projectDir, "fonts"), { recursive: true });
  const fontFiles = FONT_WEIGHTS.map(
    (w) => `monaspace-xenon-latin-${w}-normal.woff2`,
  );
  for (const f of fontFiles)
    copyFileSync(resolve(fontDir, "files", f), resolve(projectDir, "fonts", f));
  copyFileSync(
    resolve(fontDir, "LICENSE"),
    resolve(projectDir, "fonts/OFL.txt"),
  );

  const hash = createHash("sha256");
  for (const p of Object.keys(files).sort()) hash.update(files[p] as string);
  for (const f of fontFiles)
    hash.update(readFileSync(resolve(projectDir, "fonts", f)));
  out("design-system.json", json(indexJson(hash.digest("hex").slice(0, 8))));
}
