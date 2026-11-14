/**
 * Normalise the raw Token Forge export (src/tokens.json) into canonical DTCG 2025.10.
 * Writes dist/tokens.json (light/base), dist/tokens.dark.json (dark overrides)
 * and dist/resolver.json (DTCG resolver with a `theme` modifier).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// biome-ignore lint/suspicious/noExplicitAny: raw export is untyped JSON
type Json = any;
export type TokenTree = Record<string, Json>;

export interface Normalised {
  tokens: TokenTree;
  dark: TokenTree;
  resolver: Json;
}

/** Fixed list of CSS-variable groups, in kebab-case, as they appear in codeSyntax.WEB. */
const GROUPS = [
  "colors",
  "fonts",
  "font-sizes",
  "font-weights",
  "line-heights",
  "letter-spacings",
  "spacing",
  "radii",
  "sizes",
  "breakpoints",
  "durations",
  "easings",
  "z-index",
];

const FONT_FALLBACKS: Record<string, string[]> = {
  heading: ["ui-sans-serif", "system-ui", "sans-serif"],
  body: ["ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
};

const VALID_TYPES = new Set([
  "color",
  "dimension",
  "duration",
  "fontFamily",
  "fontWeight",
  "cubicBezier",
  "number",
  "shadow",
  "typography",
]);

const SKIP_GROUPS = new Set(["effects", "Figma Styles"]);

export const camel = (s: string): string =>
  s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** Round to 4 significant digits (removes float noise). */
export const round4 = (n: number): number => Number(n.toPrecision(4));

export function isLeaf(n: Json): boolean {
  return n !== null && typeof n === "object" && "$value" in n;
}

function* leaves(node: Json, path: string[] = []): Generator<[string[], Json]> {
  if (isLeaf(node)) {
    yield [path, node];
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith("$")) yield* leaves(v, [...path, k]);
    }
  }
}

/** `var(--font-sizes-md)` -> `["fontSizes", "md"]`; colours split on every `-`, other groups camel-case the remainder. */
export function pathFromCodeSyntax(web: string): string[] {
  const m = /^var\(--([a-z0-9-]+)\)$/.exec(web);
  if (!m?.[1]) throw new Error(`Unparseable codeSyntax.WEB: ${web}`);
  const name = m[1];
  const group = [...GROUPS]
    .sort((a, b) => b.length - a.length)
    .find((g) => name.startsWith(`${g}-`));
  if (!group) throw new Error(`Unknown token group in ${web}`);
  const rest = name.slice(group.length + 1);
  return [
    camel(group),
    ...(group === "colors" ? rest.split("-") : [camel(rest)]),
  ];
}

const num = (s: string | number): number =>
  typeof s === "number" ? s : Number.parseFloat(s);

const dim = (value: number, unit: "px" | "rem") => ({
  value: round4(value),
  unit,
});

function setPath(tree: TokenTree, path: string[], token: Json): void {
  let cur = tree;
  path.forEach((seg, i) => {
    if (i === path.length - 1) {
      if (seg in cur) throw new Error(`Name collision at ${path.join(".")}`);
      cur[seg] = token;
      return;
    }
    const next = cur[seg] ?? {};
    if (isLeaf(next))
      throw new Error(
        `Name collision: ${path.slice(0, i + 1).join(".")} is both token and group`,
      );
    cur[seg] = next;
    cur = next;
  });
}

function roundDeep(v: Json): Json {
  if (typeof v === "number") return round4(v);
  if (Array.isArray(v)) return v.map(roundDeep);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, k === "hex" ? x : roundDeep(x)]),
    );
  }
  return v;
}

const refName = (v: string): string | undefined =>
  /^\{([^{}]+)\}$/.exec(v)?.[1];

interface Converted {
  type: string;
  value: Json;
}

function convertLeaf(
  group: string,
  name: string,
  raw: Json,
  rewriteRef: (r: string) => string,
): Converted {
  const v = raw.$value;
  const alias = typeof v === "string" ? refName(v) : undefined;
  if (alias)
    return {
      type: raw.$type === "color" ? "color" : raw.$type,
      value: `{${rewriteRef(alias)}}`,
    };
  switch (group) {
    case "colors": {
      // DTCG hex is a 6-digit sRGB fallback; alpha lives in `alpha`.
      const c = roundDeep(v);
      if (typeof v.hex === "string" && v.hex.length === 9)
        c.hex = v.hex.slice(0, 7);
      return { type: "color", value: c };
    }
    case "fonts":
      return {
        type: "fontFamily",
        value: [v, ...(FONT_FALLBACKS[name] ?? ["sans-serif"])],
      };
    case "fontSizes":
      return { type: "dimension", value: dim(num(v), "rem") };
    case "fontWeights":
      return { type: "fontWeight", value: round4(num(v)) };
    case "lineHeights":
      return { type: "number", value: round4(num(v)) };
    case "letterSpacings":
      // Figma binds em values as px numbers; DTCG dimensions only allow px/rem so we emit a number (em).
      return { type: "number", value: Math.round(num(v) * 1000) / 1000 };
    case "spacing":
      return { type: "dimension", value: dim(num(v) / 16, "rem") };
    case "radii":
    case "sizes":
    case "breakpoints":
      return { type: "dimension", value: dim(num(v), "px") };
    case "durations":
      return { type: "duration", value: { value: round4(num(v)), unit: "ms" } };
    case "easings": {
      if (v === "linear") return { type: "cubicBezier", value: [0, 0, 1, 1] };
      const m = /^cubic-bezier\(([^)]+)\)$/.exec(v);
      if (!m?.[1]) throw new Error(`Unsupported easing: ${v}`);
      return {
        type: "cubicBezier",
        value: m[1].split(",").map((x) => round4(Number(x.trim()))),
      };
    }
    case "zIndex":
      return { type: "number", value: round4(num(v)) };
    default:
      throw new Error(`No converter for group ${group}`);
  }
}

const px = (s: string) => dim(num(s), "px");

function convertShadow(layers: Json[]): Json[] {
  return layers.map((l) => {
    const colour = refName(l.color);
    if (!colour)
      throw new Error(`Shadow colour must be a reference, got ${l.color}`);
    // {shadow.default} does not name a theme: it means the themed colours.shadow.* token.
    const target = colour.startsWith("colors.") ? colour : `colors.${colour}`;
    return {
      color: `{${target}}`,
      offsetX: px(l.offsetX),
      offsetY: px(l.offsetY),
      blur: px(l.blur),
      spread: px(l.spread),
      inset: Boolean(l.inset),
    };
  });
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Letter spacing in em (kept in $extensions for CSS; $value gets the rem equivalent). */
const letterSpacingEm = (raw: Json): number =>
  round4(num(String(raw.$value.letterSpacing).replace(/em$/, "")));

function convertTypography(
  raw: Json,
  fontSizeRem: (ref: string) => number,
): Json {
  const v = raw.$value;
  let family: string = v.fontFamily;
  if (!refName(family)) {
    // Figma stand-in family: the description names the intended token (e.g. `fonts.mono · ...`).
    const intended = /^(fonts\.[A-Za-z]+)/.exec(raw.$description ?? "")?.[1];
    if (!intended)
      throw new Error(`Literal fontFamily ${family} with no intended token`);
    family = `{${intended}}`;
  }
  return {
    fontFamily: family,
    fontWeight: v.fontWeight,
    fontSize: v.fontSize,
    lineHeight: round4(num(v.lineHeight)),
    // em x the style's own font size, expressed in rem (DTCG has no em unit).
    letterSpacing: dim(letterSpacingEm(raw) * fontSizeRem(v.fontSize), "rem"),
  };
}

export function normalise(raw: Json): Normalised {
  const tokens: TokenTree = {};
  const dark: TokenTree = {};

  // 1. raw path -> canonical path (codeSyntax is the authority)
  const rawToNew = new Map<string, string[]>();
  const entries: { rawPath: string[]; path: string[]; leaf: Json }[] = [];
  for (const [rawPath, leaf] of leaves(raw)) {
    if (SKIP_GROUPS.has(rawPath[0] as string)) continue;
    const web = leaf.$extensions?.["com.figma"]?.codeSyntax?.WEB;
    if (!web) throw new Error(`Missing codeSyntax.WEB on ${rawPath.join(".")}`);
    const path = pathFromCodeSyntax(web);
    const isDark = rawPath[0] === "colorDark";
    if (!isDark) rawToNew.set(rawPath.join("."), path);
    entries.push({ rawPath, path, leaf });
  }
  const rewriteRef = (r: string): string => {
    const hit = rawToNew.get(r);
    if (!hit) throw new Error(`Unresolved reference {${r}}`);
    return hit.join(".");
  };

  // 2. tokens
  const lightColours = new Map<string, Converted>();
  const darkColours: {
    path: string[];
    c: Converted;
    desc?: string;
    cssVar: string;
  }[] = [];
  for (const { rawPath, path, leaf } of entries) {
    const group = path[0] as string;
    const c = convertLeaf(
      group,
      path[path.length - 1] as string,
      leaf,
      rewriteRef,
    );
    const cssVar = (
      leaf.$extensions["com.figma"].codeSyntax.WEB as string
    ).slice(4, -1);
    if (rawPath[0] === "colorDark") {
      darkColours.push({ path, c, desc: leaf.$description, cssVar });
      continue;
    }
    const token: Json = {
      $type: c.type,
      $value: c.value,
      ...(group === "colors" && leaf.$description
        ? { $description: leaf.$description }
        : {}),
      $extensions: { "dev.civilian": { cssVar } },
    };
    if (rawPath[0] === "colorLight") lightColours.set(path.join("."), c);
    setPath(tokens, path, token);
  }

  // 3. dark overrides: only where the value differs from light
  for (const { path, c, desc, cssVar } of darkColours) {
    const light = lightColours.get(path.join("."));
    if (!light)
      throw new Error(`Dark token ${path.join(".")} has no light counterpart`);
    if (JSON.stringify(light.value) === JSON.stringify(c.value)) continue;
    setPath(dark, path, {
      $type: c.type,
      $value: c.value,
      ...(desc ? { $description: desc } : {}),
      $extensions: { "dev.civilian": { cssVar } },
    });
  }

  // 4. composites
  const fontSizeRem = (ref: string): number => {
    const t = flatten(tokens).get(refName(ref) ?? "");
    if (t?.$value?.unit !== "rem")
      throw new Error(`Cannot resolve font size ${ref}`);
    return t.$value.value;
  };
  const styles = raw["Figma Styles"] ?? {};
  for (const [group, styleGroup] of Object.entries<Json>(
    styles.Typography ?? {},
  )) {
    for (const [name, leaf] of Object.entries<Json>(styleGroup)) {
      if (!isLeaf(leaf)) continue;
      setPath(tokens, ["textStyles", lowerFirst(group), lowerFirst(name)], {
        $type: "typography",
        $value: convertTypography(leaf, fontSizeRem),
        $extensions: {
          "dev.civilian": { letterSpacing: letterSpacingEm(leaf) },
        },
      });
    }
  }
  const shadowSets = styles.Effects?.Shadow ?? {};
  for (const [name, leaf] of Object.entries<Json>(shadowSets.Light ?? {})) {
    setPath(tokens, ["shadows", name], {
      $type: "shadow",
      $value: convertShadow(leaf.$value),
    });
  }
  for (const [name, leaf] of Object.entries<Json>(shadowSets.Dark ?? {})) {
    const value = convertShadow(leaf.$value);
    if (
      JSON.stringify(value) === JSON.stringify(tokens.shadows?.[name]?.$value)
    )
      continue;
    setPath(dark, ["shadows", name], { $type: "shadow", $value: value });
  }

  validate(tokens, dark);

  const resolver = {
    name: "civilian",
    version: "2025.10",
    description:
      "Civilian design tokens. Light is the base set; dark overrides apply through the theme modifier.",
    sets: { foundation: { sources: [{ $ref: "tokens.json" }] } },
    modifiers: {
      theme: {
        default: "light",
        contexts: { light: [], dark: [{ $ref: "tokens.dark.json" }] },
      },
    },
    resolutionOrder: [
      { $ref: "#/sets/foundation" },
      { $ref: "#/modifiers/theme" },
    ],
  };

  return { tokens, dark, resolver };
}

/** Collect tokens by dotted path. */
export function flatten(tree: TokenTree): Map<string, Json> {
  const out = new Map<string, Json>();
  for (const [p, t] of leaves(tree)) out.set(p.join("."), t);
  return out;
}

function refsIn(v: Json): string[] {
  if (typeof v === "string") {
    const r = refName(v);
    return r ? [r] : [];
  }
  if (Array.isArray(v)) return v.flatMap(refsIn);
  if (v && typeof v === "object") return Object.values(v).flatMap(refsIn);
  return [];
}

/** Strict validation: valid types, resolvable refs, no cycles. Name collisions throw in setPath. */
export function validate(tokens: TokenTree, dark: TokenTree): void {
  const all = flatten(tokens);
  const errors: string[] = [];
  for (const [path, t] of [...all, ...flatten(dark)]) {
    if (!VALID_TYPES.has(t.$type))
      errors.push(`${path}: invalid $type ${t.$type}`);
    for (const r of refsIn(t.$value)) {
      if (!all.has(r)) errors.push(`${path}: unresolved reference {${r}}`);
    }
  }
  for (const path of flatten(dark).keys()) {
    if (!all.has(path)) errors.push(`${path}: dark override has no base token`);
  }
  for (const [path, t] of all) {
    const seen = new Set([path]);
    let cur = t;
    while (typeof cur?.$value === "string" && refName(cur.$value)) {
      const next = refName(cur.$value) as string;
      if (seen.has(next)) {
        errors.push(`${path}: reference cycle via {${next}}`);
        break;
      }
      seen.add(next);
      cur = all.get(next);
    }
  }
  if (errors.length)
    throw new Error(`Token validation failed:\n${errors.join("\n")}`);
}

/** Validate canonical output with the DTCG 2025.10-aware Terrazzo parser. */
export async function validateWithTerrazzo(tokens: TokenTree): Promise<void> {
  const { parse, defineConfig } = await import("@terrazzo/parser");
  const config = defineConfig(
    { lint: { rules: { "core/consistent-naming": "off" } } },
    { cwd: new URL(`file://${process.cwd()}/`) },
  );
  await parse(
    [{ filename: new URL("file:///tokens.json"), src: JSON.stringify(tokens) }],
    {
      config,
      continueOnError: false,
      resolveAliases: true,
    },
  );
}

export const paths = {
  src: resolve(dirname(fileURLToPath(import.meta.url)), "../src/tokens.json"),
  dist: resolve(dirname(fileURLToPath(import.meta.url)), "../dist"),
};

export async function run(): Promise<Normalised> {
  const raw = JSON.parse(readFileSync(paths.src, "utf8"));
  const out = normalise(raw);
  await validateWithTerrazzo(out.tokens);
  mkdirSync(paths.dist, { recursive: true });
  const w = (f: string, d: Json) =>
    writeFileSync(resolve(paths.dist, f), `${JSON.stringify(d, null, 2)}\n`);
  w("tokens.json", out.tokens);
  w("tokens.dark.json", out.dark);
  w("resolver.json", out.resolver);
  return out;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  run().then(
    () => console.log("normalised tokens -> dist/"),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}
