/**
 * Generates `examples/` from the sources in `src/` and the design tokens.
 * Output is committed and deterministic; CI fails if it drifts.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolved } from "@civilian-dev/design-tokens/resolved";
import {
  avatar,
  type ComposeOptions,
  calloutBackground,
  compose,
  type Hex,
  type Hue,
  type Kit,
  type Piece,
  parsePiece,
  SCHEMES,
  type SchemeName,
  type TextBlock,
  texture,
} from "../src/compose";

const root = fileURLToPath(new URL("..", import.meta.url));

function read(path: string): Piece {
  return parsePiece(readFileSync(join(root, "src", path), "utf8"), path);
}

const shapeFiles = readdirSync(join(root, "src", "shapes"))
  .filter((f) => f.endsWith(".svg"))
  .sort();

const kit: Kit = {
  shapes: Object.fromEntries(
    shapeFiles.map((f) => [basename(f, ".svg"), read(`shapes/${f}`)]),
  ),
  mark: read("mark/civilian.svg"),
};

const hex: Hex = (path) => {
  const [group, step] = path.split(".") as [string, string];
  const value = resolved.light.colors?.[group]?.[step]?.hex;
  if (typeof value !== "string") throw new Error(`Unknown colour: ${path}`);
  return value;
};

const OG = { width: 1200, height: 630 };
const BANNER = { width: 1600, height: 600 };
const PROFILE = { width: 1500, height: 500 };

function text(
  letter: string,
  kind: string,
  number: string,
  section: string,
  title: [string, string],
  meta: string,
): TextBlock {
  return { letter, kind, number, section, title, meta };
}

/** File names carry layout, scheme, feature and seed (G9). */
const composed: [string, ComposeOptions][] = [
  [
    "og",
    {
      ...OG,
      layout: "sign",
      scheme: "paper",
      feature: "weave",
      seed: 11,
      text: text(
        "A",
        "Article",
        "012",
        "Field notes",
        ["A field guide to", "small libraries"],
        "14 Nov 2026 · 6 min",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "sign",
      scheme: "paper",
      feature: "grain",
      seed: 5,
      text: text(
        "L",
        "Library",
        "004",
        "Tools",
        ["Make it plain,", "make it useful"],
        "2 Oct 2026 · 4 min",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "sign",
      scheme: "paper",
      feature: "none",
      seed: 3,
      text: text(
        "N",
        "Notes",
        "031",
        "Changelog",
        ["What changed", "and why"],
        "30 Sep 2026 · 2 min",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "sign",
      scheme: "night",
      feature: "weave",
      seed: 9,
      text: text(
        "T",
        "Talk",
        "007",
        "Talks",
        ["Boring tools,", "happy people"],
        "21 Aug 2026 · 25 min",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "sign",
      scheme: "night",
      feature: "grain",
      seed: 4,
      text: text(
        "P",
        "Project",
        "018",
        "Projects",
        ["Things I made", "this year"],
        "1 Dec 2026 · 8 min",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "ledger",
      scheme: "concrete",
      feature: "grain",
      seed: 5,
      text: text(
        "A",
        "Article",
        "012",
        "Field notes",
        ["A field guide to", "small libraries"],
        "14 Nov 2026 · 6 min read",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "ledger",
      scheme: "concrete",
      feature: "weave",
      seed: 3,
      text: text(
        "G",
        "Guide",
        "009",
        "Guides",
        ["Four ways to", "say it simply"],
        "9 Jul 2026 · 5 min read",
      ),
    },
  ],
  [
    "og",
    {
      ...OG,
      layout: "ledger",
      scheme: "concrete",
      feature: "none",
      seed: 2,
      text: text(
        "N",
        "Notes",
        "030",
        "Field notes",
        ["Software for", "the rest of us"],
        "12 Jun 2026 · 3 min read",
      ),
    },
  ],
  [
    "banner",
    { ...BANNER, layout: "sign", scheme: "paper", feature: "weave", seed: 14 },
  ],
  [
    "banner",
    { ...BANNER, layout: "sign", scheme: "paper", feature: "grain", seed: 6 },
  ],
  [
    "banner",
    { ...BANNER, layout: "sign", scheme: "night", feature: "weave", seed: 8 },
  ],
  [
    "banner",
    {
      ...BANNER,
      layout: "ledger",
      scheme: "concrete",
      feature: "weave",
      seed: 21,
    },
  ],
  [
    "profile",
    {
      ...PROFILE,
      layout: "sign",
      scheme: "paper",
      feature: "none",
      seed: 2,
      profile: true,
    },
  ],
  [
    "profile",
    {
      ...PROFILE,
      layout: "sign",
      scheme: "night",
      feature: "none",
      seed: 6,
      profile: true,
    },
  ],
];

/** Output files by name. Two outputs with one name is a mistake, not an overwrite. */
const files = new Map<string, string>();
const emit = (name: string, content: string): void => {
  if (files.has(name)) throw new Error(`Duplicate output: ${name}`);
  files.set(name, content);
};

for (const [prefix, o] of composed) {
  emit(
    `${prefix}-${o.layout}-${o.scheme}-${o.feature}-s${o.seed}.svg`,
    compose(kit, hex, o),
  );
}

const hues: Hue[] = ["salmon", "gold", "teal", "violet"];
hues.forEach((hue, i) => {
  emit(`callout-${hue}.svg`, calloutBackground(kit, hex, hue, 11 + i));
});

const textures: [SchemeName, "grain" | "weave", number][] = [
  ["paper", "grain", 5],
  ["paper", "weave", 7],
  ["concrete", "weave", 3],
  ["night", "weave", 9],
];
for (const [scheme, feature, seed] of textures) {
  emit(
    `texture-${feature}-${scheme}.svg`,
    texture(kit, hex, { scheme, feature, seed }),
  );
}

for (const scheme of ["paper", "night"] as const) {
  emit(`avatar-${scheme}.svg`, avatar(kit, hex, scheme));
}

// --- gallery ---------------------------------------------------------------

const names = [...files.keys()];
const paper = SCHEMES.paper;

const figures = (prefix: string) =>
  names
    .filter((f) => f.startsWith(prefix))
    .map(
      (f) =>
        `<figure><img src="${f}" alt=""><figcaption>${f}</figcaption></figure>`,
    )
    .join("\n");

const fluid = (prefix: string, withText: boolean) =>
  names
    .filter((f) => f.startsWith(prefix))
    .map(
      (f) =>
        `<figure><div class="fluid" style="background-image:url(${f})">${withText ? "<p>Text sits on the flat part of the ground.</p>" : ""}</div><figcaption>${f}</figcaption></figure>`,
    )
    .join("\n");

emit(
  "index.html",
  `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Civilian brand graphics</title>
<style>
  body { margin: 0; padding: 48px 6vw 96px; background: ${hex(paper.ground)}; color: ${hex(paper.ink)}; font: 16px/1.6 "Instrument Sans", system-ui, sans-serif; }
  h1, h2 { font-family: Poppins, system-ui, sans-serif; font-weight: 600; letter-spacing: -0.025em; }
  h2 { margin: 64px 0 16px; padding-top: 16px; border-top: 2px solid ${hex(paper.ink)}; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px; }
  .wide { display: grid; gap: 32px; }
  figure { margin: 0; }
  figure img { display: block; width: 100%; height: auto; border: 1px solid ${hex("neutral.200")}; }
  figcaption { margin-top: 8px; font: 12px "Monaspace Xenon", ui-monospace, monospace; color: ${hex(paper.muted)}; }
  .fluid { min-height: 120px; border-radius: 8px; overflow: hidden; background-size: 100% 100%; display: flex; align-items: center; }
  .fluid p { margin: 0; padding: 24px; max-width: 55%; }
  .kit { display: flex; flex-wrap: wrap; gap: 24px; }
  .kit figure { width: 96px; }
  .kit img { border: 0; height: 72px; object-fit: contain; }
  .avatars { display: flex; gap: 32px; }
  .avatars img { width: 160px; border-radius: 50%; }
</style>
<h1>Civilian brand graphics</h1>
<p>Generated by <code>pnpm build</code>. Rules are in <code>DESIGN.md</code> at the repo root.</p>
<h2>Open Graph images</h2>
<div class="grid">${figures("og-")}</div>
<h2>Banners</h2>
<div class="wide">${figures("banner-")}${figures("profile-")}</div>
<h2>Callout backgrounds</h2>
<div class="grid">${fluid("callout-", true)}</div>
<h2>Textures</h2>
<div class="grid">${fluid("texture-", false)}</div>
<h2>Avatars</h2>
<div class="avatars">${figures("avatar-")}</div>
<h2>Kit</h2>
<div class="kit">${shapeFiles.map((f) => `<figure><img src="../src/shapes/${f}" alt=""><figcaption>${basename(f, ".svg")}</figcaption></figure>`).join("")}<figure><img src="../src/mark/civilian.svg" alt=""><figcaption>civilian</figcaption></figure></div>
</html>
`,
);

const out = join(root, "examples");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const [name, file] of files) writeFileSync(join(out, name), file);
console.log(`brand-graphics: wrote ${files.size} files to examples/`);
