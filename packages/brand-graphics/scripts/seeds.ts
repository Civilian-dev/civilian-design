/**
 * Generates the brand seeds in `docs/brand-seeds/`: specimen pages for the
 * merged style, in light and dark. Output is committed; CI fails on drift.
 *
 * The pages are styled only by tokens.css and the hand-written seeds.css.
 * Patterns are inline SVG coloured by custom properties, so one specimen
 * works in both themes. `pattern()` here is the prototype for the pattern
 * library in the v2 plan (PR 6).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Piece, parsePiece, stippleFilter } from "../src/compose";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = fileURLToPath(
  new URL("../../../docs/brand-seeds/", import.meta.url),
);

const shapes: Record<string, Piece> = Object.fromEntries(
  readdirSync(join(root, "src", "shapes"))
    .filter((f) => f.endsWith(".svg"))
    .sort()
    .map((f) => [
      basename(f, ".svg"),
      parsePiece(readFileSync(join(root, "src", "shapes", f), "utf8"), f),
    ]),
);

function shape(name: string): Piece {
  const piece = shapes[name];
  if (!piece) throw new Error(`Unknown shape: ${name}`);
  return piece;
}

// --- parts -----------------------------------------------------------------

/** One piece as inline SVG. Colour comes from CSS `color`. */
function piece(name: string, cls = "", turn = 0, colour = ""): string {
  const p = shape(name);
  const style = [
    colour && `color:${colour}`,
    turn && `transform:rotate(${turn}deg)`,
  ]
    .filter(Boolean)
    .join(";");
  return `<svg class="cv-piece ${cls}" viewBox="0 0 ${p.w} ${p.h}" fill="currentColor"${style ? ` style="${style}"` : ""} aria-hidden="true">${p.body}</svg>`;
}

const key = () =>
  `<span class="cv-key">${piece("disc", "", 0, "var(--cv-ink)")}${piece("quarter-disc", "", 0, "var(--cv-key-2)")}${piece("triangle", "", 270, "var(--cv-key-3)")}</span>`;

type Tile =
  | "none"
  | "triangle"
  | "quarter-disc"
  | "half-disc"
  | "disc"
  | "check";
type Direction = "down" | "diagonal" | "edge";

const VECTORS: Record<Direction, string> = {
  down: 'x1="0" y1="0" x2="0" y2="1"',
  diagonal: 'x1="0" y1="1" x2="1" y2="0"',
  edge: 'x1="0" y1="0" x2="1" y2="0"',
};

let patterns = 0;

/**
 * A pattern: one tile repeated on a square grid in the ground colour, over
 * a two-colour noise gradient. Fills its box. `size` is the tile in px.
 */
function pattern(o: {
  tile: Tile;
  turn?: 0 | 90 | 180 | 270;
  dir?: Direction;
  size?: number;
}): string {
  const id = `p${++patterns}`;
  const t = o.size ?? 24;
  const dir = o.dir ?? "down";
  const stops =
    dir === "edge"
      ? '<stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="0.9"/>'
      : '<stop offset="0" stop-opacity="0"/><stop offset="0.5" stop-opacity="0.5"/><stop offset="1" stop-opacity="1"/>';
  let cell = "";
  let over = "";
  if (o.tile !== "none") {
    const name = o.tile === "check" ? "square" : o.tile;
    const p = shape(name);
    const s = Math.round((t / p.w) * 10000) / 10000;
    const spin = o.turn ? ` rotate(${o.turn} ${p.w / 2} ${p.h / 2})` : "";
    const one = (x: number, y: number) =>
      `<g transform="translate(${x} ${y}) scale(${s})${spin}">${p.body}</g>`;
    const span = o.tile === "check" ? t * 2 : t;
    const tiles = o.tile === "check" ? one(0, 0) + one(t, t) : one(0, 0);
    cell = `<pattern id="${id}-p" patternUnits="userSpaceOnUse" width="${span}" height="${span}" style="color:var(--cv-ground)" fill="currentColor">${tiles}</pattern>`;
    over = `<rect width="100%" height="100%" fill="url(#${id}-p)"/>`;
  }
  return (
    `<svg class="cv-pattern" data-tile="${o.tile}" data-turn="${o.turn ?? 0}" data-direction="${dir}" data-size="${t}" aria-hidden="true">` +
    `<defs><linearGradient id="${id}-g" ${VECTORS[dir]}>${stops}</linearGradient>${stippleFilter(`${id}-f`, "var(--cv-pattern-to)", patterns)}${cell}</defs>` +
    `<rect width="100%" height="100%" style="fill:var(--cv-pattern-from)"/>` +
    `<rect width="100%" height="100%" fill="url(#${id}-g)" filter="url(#${id}-f)"/>${over}</svg>`
  );
}

/** The feature: a tiled pattern, or grain with one piece anchored in the corner. */
function feature(o: Parameters<typeof pattern>[0], style = ""): string {
  const anchor =
    o.tile === "none" ? piece("quarter-disc", "cv-anchor", 270) : "";
  return `<div class="cv-feature"${style ? ` style="${style}"` : ""}>${pattern(o)}${anchor}</div>`;
}

type Corner = "top" | "bottom";

/** Callout art: an edge fade from the right, optionally one piece in a corner. */
function calloutArt(name?: string, corner: Corner = "bottom"): string {
  const turn = name === "square" ? 0 : corner === "bottom" ? 270 : 180;
  const one = name ? piece(name, `cv-piece-${corner}`, turn) : "";
  return `<div class="cv-callout-art">${pattern({ tile: "none", dir: "edge" })}${one}</div>`;
}

const label = (text: string, quiet = false) =>
  `<span class="cv-label${quiet ? " cv-label-quiet" : ""}">${text}</span>`;

// --- the frame, closed: a card ---------------------------------------------

interface Card {
  feature?: Parameters<typeof pattern>[0];
  cls?: string;
  style?: string;
}

function card(o: Card = {}): string {
  const wide = o.feature ? "" : " cv-span";
  return `<article class="cv-card ${o.cls ?? "cv-standalone"}"${o.style ? ` style="${o.style}"` : ""}>
  <div class="cv-frame">
    <div class="cv-cell"><span class="cv-bullet">A</span>${label("Article")}<span class="cv-push">${label("No. 012")}</span></div>
    <div class="cv-cell"><span class="cv-wordmark">civilian.dev</span></div>
    <div class="cv-cell cv-cell-title${wide}"><h1>A field guide to<br>small libraries</h1></div>
    ${o.feature ? `<div class="cv-cell cv-cell-feature">${feature(o.feature, "width:100%;height:100%")}</div>` : ""}
    <div class="cv-cell">${label("14 Nov 2026 · 6 min read")}</div>
    <div class="cv-cell">${label("Field notes")}<span class="cv-push">${key()}</span></div>
  </div>
</article>`;
}

// --- the frame, open: a page header ----------------------------------------

function header(o: {
  letter: string;
  kind: string;
  section: string;
  title: string;
  meta: string;
  feature?: Parameters<typeof pattern>[0];
}): string {
  return `<header class="cv-header" data-seed="page-header" data-rules="L2 L3 L4 L5 G3 G4 G5">
  <div class="cv-header-row"><span class="cv-bullet">${o.letter}</span>${label(o.kind)}<span class="cv-push">${label(o.section, true)}</span></div>
  <div class="cv-header-body"><h1>${o.title}</h1>${o.feature ? feature(o.feature) : ""}</div>
  <div class="cv-header-row">${label(o.meta, true)}<span class="cv-push">${key()}</span></div>
</header>`;
}

const footer = `<footer class="cv-footer" data-seed="footer"><span class="cv-wordmark">civilian.dev</span><span class="cv-push">${label("Plain tools for everyday builders", true)}</span></footer>`;

// --- pages ------------------------------------------------------------------

const PAGES = [
  ["index", "Contents"],
  ["card", "Card"],
  ["article", "Article"],
  ["listing", "Index page"],
  ["patterns", "Patterns"],
] as const;

type Theme = "light" | "dark";
const file = (name: string, theme: Theme) =>
  `${name}${theme === "dark" ? "-dark" : ""}.html`;

function doc(name: string, title: string, theme: Theme, body: string): string {
  const other: Theme = theme === "light" ? "dark" : "light";
  const links = PAGES.map(([n, t]) =>
    n === name
      ? label(t)
      : `<a class="cv-label" href="${file(n, theme)}">${t}</a>`,
  ).join("");
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Civilian brand seeds</title>
<link rel="stylesheet" href="../../packages/design-tokens/dist/tokens.css">
<link rel="stylesheet" href="seeds.css">
<nav class="seed-sheet seed-nav" style="padding-bottom:0">${links}<a class="cv-label cv-push" href="${file(name, other)}">Switch to ${other}</a></nav>
${body}
</html>
`;
}

const seed = (id: string, name: string, note: string, html: string) =>
  `<section class="seed" id="${id}"><p class="cv-label">${name}</p><p class="seed-note">${note}</p>${html}</section>`;

const cardPage = `<main class="seed-sheet">
<h1>Card</h1>
<p class="seed-note">The frame, closed. Open Graph size, 1200 by 630. Layout and colour from the ledger; bullet, key, weave and wordmark from the sign.</p>
${seed("card", "Proposed", "Concrete ground, no band, headings at 600, weave feature.", card({ feature: { tile: "triangle", size: 32 } }))}
${seed("card-grain", "Grain feature", "A noise gradient with one ink quarter-disc anchored in the corner.", card({ feature: { tile: "none", dir: "diagonal" }, style: "--cv-pattern-from:var(--colors-accent-solid)" }))}
${seed("card-plain", "No feature", "A card with no feature is complete. The title takes the full width.", card())}
${seed("d1", "D1 · Heading weight 500", "What the tokens say today. Compare with the proposed card above (600).", card({ feature: { tile: "triangle", size: 32 }, style: "--cv-heading-weight:500" }))}
${seed("d2", "D2 · With the top band", "The band from the sign, kept above the frame. The proposal drops it.", card({ feature: { tile: "triangle", size: 32 }, cls: "cv-standalone cv-has-band" }))}
${seed("d9", "D9 · Paper ground", "The same card on the page ground instead of concrete.", card({ feature: { tile: "triangle", size: 32 }, cls: "" }))}
</main>`;

const diagram = `<svg class="cv-diagram" viewBox="0 -20 672 276" role="img" aria-label="A brief becomes a profile, then scores. Three concerns are researched, then one document is written.">
  <g class="cv-group"><rect x="420" y="-18" width="130" height="270"/><text x="430" y="-2">Research</text></g>
  <path d="M110 125H140M250 125H280M390 125H430M390 125H405V42H430M390 125H405V208H430M540 125H562M540 42H551V125M540 208H551V125"/>
  <path class="cv-head" d="M133 120l7 5-7 5zM273 120l7 5-7 5zM423 120l7 5-7 5zM423 37l7 5-7 5zM423 203l7 5-7 5zM555 120l7 5-7 5z"/>
  <g><rect x="0" y="103" width="110" height="44"/><text x="55" y="130">Brief</text></g>
  <g><rect x="140" y="103" width="110" height="44"/><text x="195" y="130">Profile</text></g>
  <g><rect x="280" y="103" width="110" height="44"/><text x="335" y="130">Scores</text></g>
  <g><rect x="430" y="20" width="110" height="44"/><text x="485" y="47">Hosting</text></g>
  <g><rect x="430" y="103" width="110" height="44"/><text x="485" y="130">Data</text></g>
  <g><rect x="430" y="186" width="110" height="44"/><text x="485" y="213">Sign-in</text></g>
  <g class="cv-node-out"><rect x="562" y="103" width="110" height="44"/><text x="617" y="130">Document</text></g>
</svg>`;

const articlePage = `<main class="cv-page" data-seed="article" data-rules="A7 T5 L1 L6">
${header({ letter: "A", kind: "Article · No. 012", section: "Field notes", title: "A field guide to small libraries", meta: "14 Nov 2026 · 6 min read", feature: { tile: "triangle" } })}
<p class="cv-standfirst" data-seed="standfirst">How to pick, read and keep the small pieces of code that most projects are really made of.</p>
<div class="cv-prose">
  <p>Most software is assembled, not written. The parts that matter are small, and choosing them well is most of the job. This guide covers how to judge a small library before you depend on it, with a <a href="https://civilian.dev">short checklist</a> at the end.</p>

  <aside class="cv-callout" data-seed="callout" data-rules="A4 C6 G6">${calloutArt("quarter-disc")}<p class="cv-label">In short</p><p>Read the source before the README. If you cannot read it in one sitting, it is not a small library.</p></aside>

  <section class="cv-section" data-seed="section" data-rules="L6"><p class="cv-label cv-label-quiet">01</p><h2>What makes a library small?</h2>
  <p>Size is not line count. A small library does one job and says so. It can be described by an unordered list:</p>
  <ul data-seed="list-unordered"><li>One job, named in the first line of the README.</li><li>No settings you do not need on day one.</li><li>Few or no dependencies of its own.</li></ul>
  <p>Or by the order you would check them in:</p>
  <ol data-seed="list-ordered"><li>Open the source and count the files.</li><li>Read the tests to see what it promises.</li><li>Check when it last changed, and why.</li></ol>
  <p>And these are the terms used in the rest of the guide:</p>
  <dl class="cv-terms" data-seed="list-terms"><dt class="cv-label">Surface</dt><dd>Everything you can call. Smaller is better.</dd><dt class="cv-label">Weight</dt><dd>What it adds to an install, including its own dependencies.</dd><dt class="cv-label">Upkeep</dt><dd>How often you will have to think about it again.</dd></dl>
  </section>

  <blockquote class="cv-pullquote" data-seed="pull-quote"><p>If you cannot read it in one sitting, it is not a small library.</p></blockquote>

  <section class="cv-section"><p class="cv-label cv-label-quiet">02</p><h2>How do they compare?</h2>
  <p>Three ways to parse a date, scored the same way. Use <code>npm ls</code> to check the weight yourself.</p>
  <table class="cv-table" data-seed="table" data-rules="L2 L6"><thead><tr><th class="cv-label">Library</th><th class="cv-label">Surface</th><th class="cv-label">Weight</th><th class="cv-label">Verdict</th></tr></thead>
  <tbody><tr><td>Hand-written</td><td class="cv-num">1</td><td class="cv-num">0 kB</td><td>Fine until time zones arrive</td></tr><tr><td>Small parser</td><td class="cv-num">4</td><td class="cv-num">2 kB</td><td>The usual answer</td></tr><tr><td>Full toolkit</td><td class="cv-num">200+</td><td class="cv-num">70 kB</td><td>Only if you need most of it</td></tr></tbody></table>
  <pre class="cv-code" data-seed="code"><code>import { parse } from "small-parser";

const date = parse("2026-11-14");</code></pre>
  <aside class="cv-callout cv-callout-tip" data-seed="callout-tip">${calloutArt("triangle", "top")}<p class="cv-label">Tip</p><p>Pin the exact version. A small library can change a lot in a minor release.</p></aside>
  <aside class="cv-callout cv-callout-note" data-seed="callout-note">${calloutArt()}<p class="cv-label">Note</p><p>A callout may carry the edge fade alone, with no piece.</p></aside>
  <aside class="cv-callout cv-callout-info" data-seed="callout-info" data-rules="D5"><p class="cv-label">Info</p><p>The info callout uses the interface colour for information, so it carries no art.</p></aside>
  </section>

  <section class="cv-section"><p class="cv-label cv-label-quiet">03</p><h2>How does a choice get made?</h2>
  <p>The same steps every time. Keep diagrams to one line of steps with a single place where it fans out.</p>
  <figure class="cv-figure" data-seed="diagram">${diagram}<figcaption class="cv-label cv-label-quiet">Fig. 1 · From a brief to a document</figcaption></figure>
  </section>

  <section class="cv-ruled cv-attachments" data-seed="attachments"><p class="cv-label">Attachments · 3</p><ul>
  <li><a href="#">Benchmarks</a><span class="cv-path">attachments/benchmarks</span></li>
  <li><a href="#">Checklist</a><span class="cv-path">attachments/checklist</span></li>
  <li><a href="#">Example project</a><span class="cv-path">examples/README</span></li></ul></section>

  <section class="cv-footnotes" data-seed="footnotes"><ol><li>Sizes are minified and compressed, measured on 14 Nov 2026.</li></ol></section>
</div>

<section class="seed" id="d10"><p class="cv-label">D10 · Rounded containers</p><p class="seed-note">New question from building these seeds. The current guide rounds callouts and code blocks (S2). The specimens above are square, to match the frame. This is the rounded version for comparison.</p>
<div class="cv-prose"><aside class="cv-callout cv-rounded">${calloutArt("quarter-disc")}<p class="cv-label">In short</p><p>Read the source before the README.</p></aside><pre class="cv-code cv-rounded"><code>const date = parse("2026-11-14");</code></pre></div></section>
${footer}
</main>`;

const row = (no: string, title: string, text: string, date: string) =>
  `<li><span class="cv-label cv-label-quiet">${no}</span><div><h3><a href="article.html">${title}</a></h3><p>${text}</p></div>${label(date, true)}</li>`;

const listingPage = `<main class="cv-page" data-seed="index-page">
${header({ letter: "I", kind: "Index", section: "civilian.dev", title: "Articles", meta: "12 articles · Updated 14 Nov 2026" })}
<nav class="cv-ruled cv-index" data-seed="index" data-rules="L2 L6 T4" style="margin-top:var(--spacing-16)"><p class="cv-label">Field notes · 3</p><ol>
${row("012", "A field guide to small libraries", "How to pick, read and keep the small pieces of code most projects are made of.", "14 Nov 2026")}
${row("011", "Boring tools, happy people", "Why the dull choice is usually the kind one.", "02 Nov 2026")}
${row("010", "One thing at a time", "A way of working that survives interruptions.", "19 Oct 2026")}
</ol></nav>
<div class="cv-texture" data-seed="section-texture" data-rules="A6 G6">${pattern({ tile: "quarter-disc" })}</div>
${footer}
</main>`;

const swatch = (name: string, o: Parameters<typeof pattern>[0], style = "") =>
  `<div>${feature(o, style)}${label(name)}</div>`;

const patternsPage = `<main class="seed-sheet">
<h1>Patterns</h1>
<p class="seed-note">One construction: a tile repeated on a square grid in the ground colour, over a two-colour noise gradient. Everything below is that, with a different dial turned.</p>
${seed("tiles", "Tile", "Which piece is repeated. Grain is the gradient alone, with one anchored piece.", `<div class="seed-grid">${swatch("Triangle", { tile: "triangle" })}${swatch("Quarter-disc", { tile: "quarter-disc" })}${swatch("Half-disc", { tile: "half-disc" })}${swatch("Disc", { tile: "disc" })}${swatch("Check", { tile: "check" })}${swatch("Grain", { tile: "none", dir: "diagonal" })}</div>`)}
${seed("turns", "Turn", "Quarter turns only.", `<div class="seed-grid">${swatch("0", { tile: "triangle" })}${swatch("90", { tile: "triangle", turn: 90 })}${swatch("180", { tile: "triangle", turn: 180 })}${swatch("270", { tile: "triangle", turn: 270 })}</div>`)}
${seed("scales", "Scale", "Fine, regular and coarse. Always whole tiles across the box.", `<div class="seed-grid">${swatch("Fine · 20 across", { tile: "triangle", size: 12 })}${swatch("Regular · 10 across", { tile: "triangle", size: 24 })}${swatch("Coarse · 6 across", { tile: "triangle", size: 40 })}</div>`)}
${seed("gradients", "Gradient", "The direction the two colours dissolve in.", `<div class="seed-grid">${swatch("Down", { tile: "quarter-disc", dir: "down" })}${swatch("Diagonal", { tile: "quarter-disc", dir: "diagonal" })}${swatch("From an edge", { tile: "quarter-disc", dir: "edge" })}</div>`)}
${seed("pairs", "Pair", "The two colours. The default is ink into red; the cool pair is for pages that already have a warm element nearby.", `<div class="seed-grid">${swatch("Ink to red", { tile: "triangle" })}${swatch("Ink to teal", { tile: "triangle" }, "--cv-pattern-to:var(--colors-teal-500)")}${swatch("Salmon to red", { tile: "triangle" }, "--cv-pattern-from:var(--colors-accent-solid)")}</div>`)}
</main>`;

const indexPage = `<main class="cv-page">
${header({ letter: "S", kind: "Brand seeds", section: "Round 4", title: "One style", meta: "17 Nov 2026 · Built by pnpm build" })}
<p class="cv-standfirst">Specimens for the merged style: the ledger's frame and colour, with the sign's bullet, key, weave and wordmark. Each page exists in light and dark.</p>
<nav class="cv-ruled cv-index" style="margin-top:var(--spacing-16)"><p class="cv-label">Specimens · 4</p><ol>
<li>${label("01", true)}<div><h3><a href="card.html">Card</a></h3><p>The frame, closed. Includes the comparisons for decisions D1, D2 and D9.</p></div>${label("Open Graph", true)}</li>
<li>${label("02", true)}<div><h3><a href="article.html">Article</a></h3><p>The frame, open, as a page header. Then every element an article uses: lists, table, callouts, pull quote, code, diagram, attachments, footnotes. Print it to see the print rules.</p></div>${label("Page", true)}</li>
<li>${label("03", true)}<div><h3><a href="listing.html">Index page</a></h3><p>A header with no feature, an index of articles, and a section texture.</p></div>${label("Page", true)}</li>
<li>${label("04", true)}<div><h3><a href="patterns.html">Patterns</a></h3><p>Every dial of the one pattern construction: tile, turn, scale, gradient and pair.</p></div>${label("Sheet", true)}</li>
</ol></nav>
${footer}
</main>`;

const pages: [string, string, string][] = [
  ["index", "Contents", indexPage],
  ["card", "Card", cardPage],
  ["article", "Article", articlePage],
  ["listing", "Index page", listingPage],
  ["patterns", "Patterns", patternsPage],
];

for (const [name, title, body] of pages) {
  for (const theme of ["light", "dark"] as const) {
    writeFileSync(join(out, file(name, theme)), doc(name, title, theme, body));
  }
}
console.log(
  `brand-graphics: wrote ${pages.length * 2} seed pages to docs/brand-seeds/`,
);
