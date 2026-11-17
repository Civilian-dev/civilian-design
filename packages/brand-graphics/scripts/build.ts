/**
 * Generates `examples/` from the package and the design tokens.
 * Output is committed and deterministic; CI fails if it drifts.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  avatar,
  type ComposeOptions,
  calloutBackground,
  compose,
  type Hue,
  hex,
  kit,
  type TextBlock,
  THEMES,
  type Theme,
  texture,
} from "../src/index";

const root = fileURLToPath(new URL("..", import.meta.url));

const OG = { width: 1200, height: 630 };
const BANNER = { width: 1600, height: 600 };
const PROFILE = { width: 1500, height: 500 };

const article: TextBlock = {
  letter: "A",
  kind: "Article",
  number: "012",
  section: "Field notes",
  title: ["A field guide to", "small libraries"],
  meta: "14 Nov 2026 · 6 min read",
};
const library: TextBlock = {
  letter: "L",
  kind: "Library",
  number: "004",
  section: "Tools",
  title: ["Make it plain,", "make it useful"],
  meta: "2 Oct 2026 · 4 min read",
};
const notes: TextBlock = {
  letter: "N",
  kind: "Notes",
  number: "031",
  section: "Changelog",
  title: ["What changed", "and why"],
  meta: "30 Sep 2026 · 2 min read",
};

/** File names carry the kind, theme, feature and seed. */
const composed: [string, ComposeOptions][] = [
  ["og", { ...OG, theme: "light", feature: "weave", seed: 11, text: article }],
  ["og", { ...OG, theme: "light", feature: "grain", seed: 5, text: library }],
  ["og", { ...OG, theme: "light", feature: "none", seed: 3, text: notes }],
  ["og", { ...OG, theme: "dark", feature: "weave", seed: 9, text: article }],
  ["og", { ...OG, theme: "dark", feature: "grain", seed: 4, text: library }],
  ["banner", { ...BANNER, theme: "light", feature: "weave", seed: 14 }],
  ["banner", { ...BANNER, theme: "light", feature: "grain", seed: 6 }],
  ["banner", { ...BANNER, theme: "dark", feature: "weave", seed: 8 }],
  [
    "profile",
    { ...PROFILE, theme: "light", feature: "none", seed: 2, profile: true },
  ],
  [
    "profile",
    { ...PROFILE, theme: "dark", feature: "none", seed: 6, profile: true },
  ],
];

/** Output files by name. Two outputs with one name is a mistake, not an overwrite. */
const files = new Map<string, string>();
const emit = (name: string, content: string): void => {
  if (files.has(name)) throw new Error(`Duplicate output: ${name}`);
  files.set(name, content);
};

for (const [prefix, o] of composed) {
  const feature = o.profile ? "profile" : o.feature;
  emit(`${prefix}-${o.theme}-${feature}-s${o.seed}.svg`, compose(o));
}

const hues: Hue[] = ["salmon", "gold", "teal", "violet"];
for (const theme of ["light", "dark"] as Theme[]) {
  hues.forEach((hue, i) => {
    emit(
      `callout-${hue}-${theme}.svg`,
      calloutBackground({ hue, theme, seed: 11 + i }),
    );
  });
  emit(`texture-${theme}.svg`, texture({ theme, seed: 7 }));
  emit(`avatar-${theme}.svg`, avatar(theme));
}

// --- gallery -----------------------------------------------------------------

const names = [...files.keys()];
const light = THEMES.light;

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
        `<figure><div class="fluid${/-dark/.test(f) ? " dark" : ""}" style="background-image:url(${f})">${withText ? "<p>Text sits on the flat part of the ground.</p>" : ""}</div><figcaption>${f}</figcaption></figure>`,
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
  body { margin: 0; padding: 48px 6vw 96px; background: ${hex(light.page)}; color: ${hex(light.ink)}; font: 16px/1.6 "Instrument Sans", system-ui, sans-serif; }
  h1, h2 { font-family: Poppins, system-ui, sans-serif; font-weight: 600; letter-spacing: -0.025em; }
  h2 { margin: 64px 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px; }
  .wide { display: grid; gap: 32px; }
  figure { margin: 0; }
  figure img { display: block; width: 100%; height: auto; }
  figcaption { margin-top: 8px; font: 12px "Monaspace Xenon", ui-monospace, monospace; color: ${hex(light.muted)}; }
  .fluid { min-height: 120px; overflow: hidden; background-size: 100% 100%; display: flex; align-items: center; }
  .fluid p { margin: 0; padding: 24px; max-width: 60%; }
  .fluid.dark p { color: ${hex("fg.default", "dark")}; }
  .kit { display: flex; flex-wrap: wrap; gap: 24px; }
  .kit figure { width: 96px; }
  .kit img { height: 72px; object-fit: contain; }
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
<div class="kit">${Object.keys(kit.shapes)
    .map(
      (name) =>
        `<figure><img src="../src/shapes/${name}.svg" alt=""><figcaption>${name}</figcaption></figure>`,
    )
    .join(
      "",
    )}<figure><img src="../src/mark/civilian.svg" alt=""><figcaption>civilian</figcaption></figure></div>
</html>
`,
);

const out = join(root, "examples");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const [name, file] of files) writeFileSync(join(out, name), file);
console.log(`brand-graphics: wrote ${files.size} files to examples/`);
