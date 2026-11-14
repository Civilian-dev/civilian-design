/**
 * Classify the token change between a base ref and the working tree, write a changeset
 * and a markdown report for the PR comment.
 *
 *   tsx scripts/token-diff.ts --base origin/main --out token-diff.md
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Json = any;

export interface Snapshot {
  tokens: Json;
  dark: Json;
  resolved: Json;
}

export interface Change {
  path: string;
  before?: Json;
  after?: Json;
}

export interface Diff {
  added: Change[];
  removed: Change[];
  changed: Change[];
}

type Bump = "major" | "minor" | "patch";

const isLeaf = (n: Json) => n && typeof n === "object" && "$value" in n;

function flat(
  tree: Json,
  prefix: string[] = [],
  out = new Map<string, Json>(),
): Map<string, Json> {
  if (isLeaf(tree)) {
    out.set(prefix.join("."), tree);
    return out;
  }
  for (const [k, v] of Object.entries<Json>(tree ?? {}))
    if (!k.startsWith("$")) flat(v, [...prefix, k], out);
  return out;
}

const at = (tree: Json, path: string): Json =>
  path.split(".").reduce((n, s) => n?.[s], tree);

export function diffSnapshots(base: Snapshot, head: Snapshot): Diff {
  const b = flat(base.tokens);
  const h = flat(head.tokens);
  const added: Change[] = [];
  const removed: Change[] = [];
  const changed: Change[] = [];
  for (const p of h.keys())
    if (!b.has(p)) added.push({ path: p, after: at(head.resolved.light, p) });
  for (const p of b.keys())
    if (!h.has(p))
      removed.push({ path: p, before: at(base.resolved.light, p) });
  for (const p of h.keys()) {
    if (!b.has(p)) continue;
    for (const theme of ["light", "dark"] as const) {
      const before = at(base.resolved[theme], p);
      const after = at(head.resolved[theme], p);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        changed.push({
          path: theme === "dark" ? `${p} (dark)` : p,
          before,
          after,
        });
      }
    }
  }
  return { added, removed, changed };
}

/** removed/renamed = major, added = minor, changed value = patch. While on 0.x everything shifts down one level. */
export function classify(diff: Diff, version: string): Bump | undefined {
  let bump: Bump | undefined;
  if (diff.changed.length) bump = "patch";
  if (diff.added.length) bump = "minor";
  if (diff.removed.length) bump = "major";
  if (!bump) return undefined;
  if (version.startsWith("0.")) return bump === "major" ? "minor" : "patch";
  return bump;
}

const swatch = (hex: string) =>
  `![${hex}](https://placehold.co/14x14/${hex.slice(1)}/${hex.slice(1)}.png)`;

function show(v: Json): string {
  if (v && typeof v === "object" && typeof v.hex === "string")
    return `${swatch(v.hex)} \`${v.hex}\``;
  if (v === undefined) return "";
  return `\`${JSON.stringify(v)}\``;
}

export function renderMarkdown(diff: Diff, bump: Bump | undefined): string {
  const total = diff.added.length + diff.removed.length + diff.changed.length;
  if (!total) return "### Token diff\n\nNo token changes.\n";
  const row = (kind: string, c: Change) =>
    `| ${kind} | \`${c.path}\` | ${show(c.before)} | ${show(c.after)} |`;
  return [
    "### Token diff",
    "",
    `${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed. Changeset: **${bump}**.`,
    "",
    "| Change | Token | Before | After |",
    "|---|---|---|---|",
    ...diff.added.map((c) => row("added", c)),
    ...diff.removed.map((c) => row("removed", c)),
    ...diff.changed.map((c) => row("changed", c)),
    "",
  ].join("\n");
}

export function renderChangeset(diff: Diff, bump: Bump): string {
  const list = (label: string, cs: Change[]) =>
    cs.length
      ? [`- ${label}: ${cs.map((c) => `\`${c.path}\``).join(", ")}`]
      : [];
  return [
    "---",
    `"@civilian-dev/design-tokens": ${bump}`,
    "---",
    "",
    "Token Forge sync.",
    "",
    ...list("Added", diff.added),
    ...list("Removed", diff.removed),
    ...list("Changed", diff.changed),
    "",
  ].join("\n");
}

const pkgDir = resolve(fileURLToPath(import.meta.url), "../..");
const repoRoot = resolve(pkgDir, "../..");

function loadHead(): Snapshot {
  const rd = (f: string) =>
    JSON.parse(readFileSync(resolve(pkgDir, "dist", f), "utf8"));
  return {
    tokens: rd("tokens.json"),
    dark: rd("tokens.dark.json"),
    resolved: rd("resolved.json"),
  };
}

function loadBase(ref: string): Snapshot | undefined {
  const show = (f: string) =>
    JSON.parse(
      execFileSync("git", ["show", `${ref}:packages/design-tokens/dist/${f}`], {
        cwd: repoRoot,
        encoding: "utf8",
      }),
    );
  try {
    return {
      tokens: show("tokens.json"),
      dark: show("tokens.dark.json"),
      resolved: show("resolved.json"),
    };
  } catch {
    return undefined;
  }
}

function main() {
  const args = process.argv.slice(2);
  const arg = (n: string) => args[args.indexOf(`--${n}`) + 1];
  const base = loadBase(arg("base") ?? "origin/main");
  const head = loadHead();
  const out = arg("out");
  if (!base) {
    if (out)
      writeFileSync(
        out,
        "### Token diff\n\nNo base tokens to compare against.\n",
      );
    return;
  }
  const diff = diffSnapshots(base, head);
  const version = JSON.parse(
    readFileSync(resolve(pkgDir, "package.json"), "utf8"),
  ).version as string;
  const bump = classify(diff, version);
  if (out) writeFileSync(out, renderMarkdown(diff, bump));

  const dir = resolve(repoRoot, ".changeset");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir))
      if (/^tokens-.*\.md$/.test(f)) rmSync(resolve(dir, f));
  }
  if (bump) {
    const id = createHash("sha256")
      .update(readFileSync(resolve(pkgDir, "src/tokens.json")))
      .digest("hex")
      .slice(0, 8);
    writeFileSync(resolve(dir, `tokens-${id}.md`), renderChangeset(diff, bump));
  }
  console.log(`token diff: ${bump ?? "no changes"}`);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
)
  main();
