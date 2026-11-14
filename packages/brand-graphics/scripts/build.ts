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
  type Kit,
  type Piece,
  parsePiece,
  resolveInks,
  texture,
} from "../src/compose";

const root = fileURLToPath(new URL("..", import.meta.url));

function load(dir: string): Record<string, Piece> {
  const folder = join(root, "src", dir);
  const entries = readdirSync(folder)
    .filter((f) => f.endsWith(".svg"))
    .sort();
  return Object.fromEntries(
    entries.map((f) => [
      basename(f, ".svg"),
      parsePiece(readFileSync(join(folder, f), "utf8")),
    ]),
  );
}

const kit: Kit = {
  shapes: load("shapes"),
  lines: load("lines"),
  patterns: load("patterns"),
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

/** File names carry recipe, scheme and seed (G10). */
const composed: [string, ComposeOptions][] = [
  [
    "og",
    {
      ...OG,
      recipe: "corner",
      scheme: "paper",
      seed: 7,
      text: {
        kicker: "Field notes",
        title: ["Software for", "the rest of us"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "corner",
      scheme: "press",
      seed: 12,
      text: {
        kicker: "Article",
        title: ["A field guide to", "small libraries"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "corner",
      scheme: "night",
      seed: 18,
      text: {
        kicker: "Library",
        title: ["Make it plain,", "make it useful"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "tile",
      scheme: "press",
      seed: 7,
      text: {
        kicker: "Projects",
        title: ["Things I made", "this year"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "tile",
      scheme: "plum",
      seed: 12,
      text: {
        kicker: "Talk",
        title: ["Boring tools,", "happy people"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "row",
      scheme: "sun",
      seed: 12,
      text: {
        kicker: "Guide",
        title: ["Four ways to", "say it simply"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "row",
      scheme: "mint",
      seed: 7,
      text: {
        kicker: "Notes",
        title: ["One thing", "at a time"],
        footer: true,
      },
    },
  ],
  [
    "og",
    {
      ...OG,
      recipe: "band",
      scheme: "paper",
      seed: 9,
      text: {
        kicker: "Changelog",
        title: ["What changed", "and why"],
        footer: true,
      },
    },
  ],
  ["banner", { ...BANNER, recipe: "tile", scheme: "night", seed: 8 }],
  ["banner", { ...BANNER, recipe: "tile", scheme: "paper", seed: 14 }],
  ["banner", { ...BANNER, recipe: "band", scheme: "press", seed: 14 }],
  ["banner", { ...BANNER, recipe: "corner", scheme: "sun", seed: 2 }],
  ["banner", { ...BANNER, recipe: "corner", scheme: "plum", seed: 14 }],
  ["banner", { ...BANNER, recipe: "corner", scheme: "mint", seed: 10 }],
  ["banner", { ...BANNER, recipe: "row", scheme: "paper", seed: 21 }],
  ["banner", { ...BANNER, recipe: "row", scheme: "night", seed: 4 }],
  [
    "profile",
    { ...PROFILE, recipe: "tile", scheme: "press", seed: 6, profile: true },
  ],
  [
    "profile",
    { ...PROFILE, recipe: "band", scheme: "night", seed: 2, profile: true },
  ],
];

const files = new Map<string, string>();

for (const [kind, o] of composed) {
  const name = `${kind}-${o.recipe}-${o.scheme}-s${o.seed}.svg`;
  const svg = compose(kit, hex, o);
  files.set(name, svg);
  console.log(`  ${name}: ${svg.match(/data-motif="([^"]*)"/)?.[1]}`);
}

files.set("avatar-press.svg", avatar(kit, hex, { size: 400, scheme: "press" }));
files.set("avatar-night.svg", avatar(kit, hex, { size: 400, scheme: "night" }));

/** Tint, texture and two-tone motif from one hue: steps 50, 300 and 500. */
const callouts = [
  ["salmon", "quarter", 11],
  ["violet", "rings", 12],
  ["gold", "stair", 13],
  ["teal", "arc", 14],
] as const;
for (const [hue, motif, seed] of callouts) {
  files.set(
    `callout-${hue}.svg`,
    calloutBackground(kit, {
      tint: hex(`${hue}.50`),
      tone: hex(`${hue}.300`),
      colors: [hex(`${hue}.500`), hex(`${hue}.300`), hex(`${hue}.500`)],
      motif,
      seed,
    }),
  );
}

const paper = resolveInks(hex, "paper");
const press = resolveInks(hex, "press");
const night = resolveInks(hex, "night");
const plum = resolveInks(hex, "plum");
files.set(
  "texture-stipple-press.svg",
  texture({
    kind: "stipple",
    ground: press.ground,
    color: press.tone,
    ink: press.ink,
    seed: 31,
  }),
);
files.set(
  "texture-stipple-night.svg",
  texture({
    kind: "stipple",
    ground: night.ground,
    color: night.tone,
    ink: night.ink,
    seed: 32,
  }),
);
files.set(
  "texture-grain-paper.svg",
  texture({
    kind: "grain",
    ground: paper.ground,
    color: paper.tone,
    ink: paper.ink,
    seed: 33,
  }),
);
files.set(
  "texture-grain-plum.svg",
  texture({
    kind: "grain",
    ground: plum.ground,
    color: plum.tone,
    ink: hex("base.black"),
    seed: 34,
  }),
);
const ink = night;

// A plain gallery page for reviewing the kit and the examples by eye.
const names = [...files.keys()];
const sources = (["shapes", "lines", "patterns"] as const).flatMap((dir) =>
  Object.keys(kit[dir]).map((name) => `${dir}/${name}`),
);
const figures = (prefix: string, cls = "") =>
  names
    .filter((f) => f.startsWith(prefix))
    .map(
      (f) =>
        `<figure class="${cls}"><img src="${f}" alt=""><figcaption>${f}</figcaption></figure>`,
    )
    .join("\n");
const fluid = (prefix: string) =>
  names
    .filter((f) => f.startsWith(prefix))
    .map(
      (f) =>
        `<figure><div class="fluid${/-(night|plum)\.svg$/.test(f) ? " dark" : ""}" style="background-image:url(${f})"><p>Text sits on the flat part of the ground.</p></div><figcaption>${f}</figcaption></figure>`,
    )
    .join("\n");
files.set(
  "index.html",
  `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Civilian brand graphics</title>
<style>
  body { margin: 0; padding: 48px 6vw 96px; background: ${paper.ground}; color: ${paper.ink}; font: 16px/1.6 "Instrument Sans", system-ui, sans-serif; }
  h1, h2 { font-family: Poppins, system-ui, sans-serif; font-weight: 600; letter-spacing: -0.025em; }
  h2 { margin: 64px 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 32px; }
  .wide { display: grid; gap: 32px; }
  figure { margin: 0; }
  figure img { display: block; width: 100%; height: auto; border: 1px solid ${hex("neutral.200")}; }
  figcaption { margin-top: 8px; font: 12px "Monaspace Xenon", ui-monospace, monospace; color: ${paper.muted}; }
  .fluid { min-height: 120px; border-radius: 16px; overflow: hidden; background-size: 100% 100%; display: flex; align-items: center; }
  .fluid p { margin: 0; padding: 24px; max-width: 55%; }
  .dark p { color: ${ink.ink}; }
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
<div class="grid">${fluid("callout-")}</div>
<h2>Textures</h2>
<div class="grid">${fluid("texture-")}</div>
<h2>Avatars</h2>
<div class="avatars">${figures("avatar-")}</div>
<h2>Kit</h2>
<div class="kit">${sources.map((s) => `<figure><img src="../src/${s}.svg" alt=""><figcaption>${s}</figcaption></figure>`).join("")}<figure><img src="../src/mark/civilian.svg" alt=""><figcaption>mark/civilian</figcaption></figure></div>
</html>
`,
);

const out = join(root, "examples");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const [name, file] of files) writeFileSync(join(out, name), file);
console.log(`brand-graphics: wrote ${files.size} files to examples/`);
