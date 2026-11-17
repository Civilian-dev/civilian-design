/**
 * Generates the brand seeds in `docs/brand-seeds/`: specimen pages for the
 * Civilian style, in light and dark, plus the one list of design decisions.
 * Output is committed; CI fails on drift.
 *
 * Pages are styled only by tokens.css, the package's patterns.css and the
 * hand-written seeds.css.
 * Patterns are inline SVG coloured by custom properties, so one specimen
 * works in both themes. Patterns come from the package's pattern library.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Piece } from "../src/compose";
import { kit } from "../src/kit";
import {
  type PatternOptions as LibPatternOptions,
  calloutArt as libCalloutArt,
  pattern as libPattern,
} from "../src/pattern";

const out = fileURLToPath(
  new URL("../../../docs/brand-seeds/", import.meta.url),
);

function shape(name: string): Piece {
  const piece = kit.shapes[name];
  if (!piece) throw new Error(`Unknown shape: ${name}`);
  return piece;
}

// --- pieces ------------------------------------------------------------------

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

/** The key: three pieces of one size, ink first (G3). */
const key = () =>
  `<span class="cv-key">${piece("disc", "", 0, "var(--cv-ink)")}${piece("quarter-disc", "", 0, "var(--cv-key-2)")}${piece("triangle", "", 270, "var(--cv-key-3)")}</span>`;

// --- patterns ------------------------------------------------------------------

type PatternOptions = Omit<LibPatternOptions, "id" | "seed" | "paint">;

let ids = 0;

/** A pattern from the library, numbered so ids are unique across the pages. */
function pattern(o: PatternOptions): string {
  const n = ++ids;
  return libPattern(kit, { ...o, id: `p${n}`, seed: n });
}

/** Callout art from the library, numbered the same way. */
function calloutArt(): string {
  const n = ++ids;
  return libCalloutArt(kit, { id: `p${n}`, seed: n });
}

/** The card's feature: a tiled pattern, or grain with one anchored piece. */
function feature(o: PatternOptions, style = ""): string {
  const anchor =
    o.tile === "none" ? piece("quarter-disc", "cv-anchor", 270) : "";
  return `<div class="cv-feature"${style ? ` style="${style}"` : ""}>${pattern(o)}${anchor}</div>`;
}

const label = (text: string, quiet = false) =>
  `<span class="cv-label${quiet ? " cv-label-quiet" : ""}">${text}</span>`;

// --- the card ------------------------------------------------------------------

interface Card {
  /** Open Graph size, 1200 by 630. Otherwise it fills the page width. */
  og?: boolean;
  letter: string;
  kind: string;
  section: string;
  /** HTML; break lines with <br> where they should break. */
  title: string;
  meta: string;
  feature?: PatternOptions;
  style?: string;
}

/**
 * The card: the one framed component. The same markup is the Open Graph
 * image and the top of a page. Only one slot changes: on its own, the
 * top-right cell carries the wordmark; on a page, where the window header
 * already has it, that cell carries the section.
 */
function card(o: Card): string {
  const topRight = o.og
    ? `<span class="cv-wordmark">civilian.dev</span>`
    : label(o.section);
  const bottomRight = o.og
    ? `${label(o.section)}<span class="cv-push">${key()}</span>`
    : `<span class="cv-push">${key()}</span>`;
  const cls = ["cv-card", o.og && "cv-card-og", !o.feature && "cv-no-feature"]
    .filter(Boolean)
    .join(" ");
  return `<article class="${cls}" data-seed="card"${o.style ? ` style="${o.style}"` : ""}>
  <div class="cv-frame">
    <div class="cv-cell"><span class="cv-bullet">${o.letter}</span>${label(o.kind)}</div>
    <div class="cv-cell">${topRight}</div>
    <div class="cv-cell cv-cell-title"><h1>${o.title}</h1></div>
    ${o.feature ? `<div class="cv-cell cv-cell-feature">${feature(o.feature)}</div>` : ""}
    <div class="cv-cell">${label(o.meta, true)}</div>
    <div class="cv-cell">${bottomRight}</div>
  </div>
</article>`;
}

// --- callouts ------------------------------------------------------------------

type Hue = "salmon" | "gold" | "teal" | "violet";

/**
 * A callout: an aside on a tint. Its art is a soft noise fade from the
 * right edge, covered by a small tile in the tint colour, so the noise only
 * shows through the gaps. No pieces.
 */
function callout(hue: Hue, title: string, text: string, seed = ""): string {
  const art = calloutArt();
  return `<aside class="cv-callout cv-callout-${hue}" data-seed="${seed || `callout-${hue}`}"><div class="cv-callout-art">${art}</div><p class="cv-label">${title}</p><p>${text}</p></aside>`;
}

// --- the window ----------------------------------------------------------------

const PAGES = [
  ["index", "Contents"],
  ["decisions", "Decisions"],
  ["card", "Card"],
  ["article", "Article"],
  ["listing", "Index page"],
  ["patterns", "Patterns"],
] as const;

type Theme = "light" | "dark";
const file = (name: string, theme: Theme) =>
  `${name}${theme === "dark" ? "-dark" : ""}.html`;

/** Window header: spans the screen, on the page ground. */
function windowHeader(name: string, theme: Theme): string {
  const other: Theme = theme === "light" ? "dark" : "light";
  const links = PAGES.map(([n, t]) =>
    n === name
      ? `<a class="cv-label" aria-current="page" href="${file(n, theme)}">${t}</a>`
      : `<a class="cv-label" href="${file(n, theme)}">${t}</a>`,
  ).join("");
  return `<header class="cv-window" data-seed="window-header"><a class="cv-wordmark" href="${file("index", theme)}">civilian.dev</a><nav>${links}<a class="cv-label cv-label-quiet" href="${file(name, other)}">${other === "dark" ? "Dark" : "Light"}</a></nav></header>`;
}

/** Window footer: a pattern edge to edge, then a row aligned with the header. */
const windowFooter = `<footer class="cv-window-foot" data-seed="window-footer">
  <div class="cv-strip">${pattern({ tile: "quarter-disc" })}</div>
  <div class="cv-window"><span class="cv-wordmark">civilian.dev</span><nav>${label("Articles")}${label("Projects")}${label("About")}</nav>${label("Plain tools for everyday builders", true)}</div>
</footer>`;

function doc(name: string, title: string, theme: Theme, body: string): string {
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Civilian brand seeds</title>
<link rel="stylesheet" href="../../packages/design-tokens/dist/tokens.css">
<link rel="stylesheet" href="../../packages/brand-graphics/src/patterns.css">
<link rel="stylesheet" href="seeds.css">
${windowHeader(name, theme)}
${body}
${windowFooter}
</html>
`;
}

// --- specimens -----------------------------------------------------------------

const ARTICLE: Omit<Card, "feature"> = {
  letter: "A",
  kind: "Article · No. 012",
  section: "Field notes",
  title: "A field guide to<br>small libraries",
  meta: "14 Nov 2026 · 6 min read",
};

const seed = (id: string, name: string, note: string, html: string) =>
  `<section class="seed" id="${id}"><p class="cv-label">${name}</p><p class="seed-note">${note}</p>${html}</section>`;

const cardPage = `<main class="cv-main">
<h1 class="seed-title">Card</h1>
<p class="seed-note">The one framed component. At 1200 by 630 it is the Open Graph image; at page width it is the top of an article (see the Article page). On its own the top-right cell carries the wordmark.</p>
${seed("card-weave", "Weave", "A tile repeated in the card ground, over a crisp noise gradient.", `<div class="seed-wide">${card({ ...ARTICLE, og: true, feature: { tile: "triangle", size: 32 } })}</div>`)}
${seed("card-grain", "Grain", "A noise gradient with one ink quarter-disc anchored in the corner.", `<div class="seed-wide">${card({ ...ARTICLE, og: true, feature: { tile: "none", dir: "diagonal" }, style: "--cv-pattern-from:var(--colors-accent-solid)" })}</div>`)}
${seed("card-plain", "No feature", "A card with no feature is complete. The title takes the full width.", `<div class="seed-wide">${card({ ...ARTICLE, og: true })}</div>`)}
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

const tableHtml = `<table class="cv-table" data-seed="table"><thead><tr><th class="cv-label">Library</th><th class="cv-label">Surface</th><th class="cv-label">Weight</th><th class="cv-label">Verdict</th></tr></thead>
<tbody><tr><td>Hand-written</td><td class="cv-num">1</td><td class="cv-num">0 kB</td><td>Fine until time zones arrive</td></tr><tr><td>Small parser</td><td class="cv-num">4</td><td class="cv-num">2 kB</td><td>The usual answer</td></tr><tr><td>Full toolkit</td><td class="cv-num">200+</td><td class="cv-num">70 kB</td><td>Only if you need most of it</td></tr></tbody></table>`;

const codeHtml = `<pre class="cv-code" data-seed="code"><code>import { parse } from "small-parser";

const date = parse("2026-11-14");</code></pre>`;

const articlePage = `<main class="cv-main" data-seed="article">
${card({ ...ARTICLE, feature: { tile: "triangle" } })}
<div class="cv-body">
<p class="cv-standfirst" data-seed="standfirst">How to pick, read and keep the small pieces of code that most projects are really made of.</p>
<div class="cv-prose">
  <p>Most software is assembled, not written. The parts that matter are small, and choosing them well is most of the job. This guide covers how to judge a small library before you depend on it, with a <a href="https://civilian.dev">short checklist</a> at the end.</p>
  ${callout("salmon", "In short", "Read the source before the README. If you cannot read it in one sitting, it is not a small library.", "callout")}

  <section class="cv-section" data-seed="section"><p class="cv-label cv-label-quiet">01</p><h2>What makes a library small?</h2>
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
  ${tableHtml}
  ${codeHtml}
  ${callout("gold", "Tip", "Pin the exact version. A small library can change a lot in a minor release.", "callout-tip")}
  ${callout("teal", "Note", "Every callout works the same way, in its own hue.", "callout-note")}
  ${callout("violet", "Info", "Violet is for information in the interface, so it is a callout hue too.", "callout-info")}
  </section>

  <section class="cv-section"><p class="cv-label cv-label-quiet">03</p><h2>How does a choice get made?</h2>
  <p>The same steps every time. Keep diagrams to one line of steps with a single place where it fans out.</p>
  <figure class="cv-figure" data-seed="diagram">${diagram}<figcaption class="cv-label cv-label-quiet">Fig. 1 · From a brief to a document</figcaption></figure>
  </section>

  <section class="cv-list cv-attachments" data-seed="attachments"><p class="cv-label">Attachments · 3</p><ul>
  <li><a href="#">Benchmarks</a><span class="cv-path">attachments/benchmarks</span></li>
  <li><a href="#">Checklist</a><span class="cv-path">attachments/checklist</span></li>
  <li><a href="#">Example project</a><span class="cv-path">examples/README</span></li></ul></section>

  <section class="cv-footnotes" data-seed="footnotes"><p class="cv-label cv-label-quiet">Notes</p><ol><li>Sizes are minified and compressed, measured on 14 Nov 2026.</li></ol></section>
</div>
</div>
</main>`;

const row = (no: string, title: string, text: string, date: string) =>
  `<li><span class="cv-label cv-label-quiet">${no}</span><div><h3><a href="article.html">${title}</a></h3><p>${text}</p></div>${label(date, true)}</li>`;

const listingPage = `<main class="cv-main" data-seed="index-page">
${card({ letter: "I", kind: "Index", section: "Field notes", title: "Articles", meta: "12 articles · Updated 14 Nov 2026" })}
<div class="cv-body">
<nav class="cv-list cv-index" data-seed="index"><p class="cv-label">Field notes · 3</p><ol>
${row("012", "A field guide to small libraries", "How to pick, read and keep the small pieces of code most projects are made of.", "14 Nov 2026")}
${row("011", "Boring tools, happy people", "Why the dull choice is usually the kind one.", "02 Nov 2026")}
${row("010", "One thing at a time", "A way of working that survives interruptions.", "19 Oct 2026")}
</ol></nav>
</div>
</main>`;

const swatch = (name: string, o: PatternOptions, style = "") =>
  `<div class="seed-swatch">${feature(o, style)}${label(name)}</div>`;

const calloutSwatch = (hue: Hue) =>
  `<div class="seed-swatch"><div class="cv-callout cv-callout-${hue} seed-callout-art"><div class="cv-callout-art">${calloutArt()}</div></div>${label(hue)}</div>`;

const patternsPage = `<main class="cv-main">
<h1 class="seed-title">Patterns</h1>
<p class="seed-note">One construction: a tile repeated on a square grid, over a two-colour noise gradient. Each row turns one dial.</p>
${seed("tiles", "Tile", "Which piece is repeated. Grain is the gradient alone, with one anchored piece.", `<div class="seed-grid">${swatch("Triangle", { tile: "triangle" })}${swatch("Quarter-disc", { tile: "quarter-disc" })}${swatch("Half-disc", { tile: "half-disc" })}${swatch("Disc", { tile: "disc" })}${swatch("Check", { tile: "check" })}${swatch("Grain", { tile: "none", dir: "diagonal" })}</div>`)}
${seed("turns", "Turn", "Quarter turns only.", `<div class="seed-grid">${swatch("0", { tile: "triangle" })}${swatch("90", { tile: "triangle", turn: 90 })}${swatch("180", { tile: "triangle", turn: 180 })}${swatch("270", { tile: "triangle", turn: 270 })}</div>`)}
${seed("scales", "Scale", "Always whole tiles across the box.", `<div class="seed-grid">${swatch("Fine · 20 across", { tile: "triangle", size: 12 })}${swatch("Regular · 10 across", { tile: "triangle", size: 24 })}${swatch("Coarse · 6 across", { tile: "triangle", size: 40 })}</div>`)}
${seed("gradients", "Gradient", "The direction the two colours dissolve in.", `<div class="seed-grid">${swatch("Down", { tile: "quarter-disc", dir: "down" })}${swatch("Diagonal", { tile: "quarter-disc", dir: "diagonal" })}${swatch("From an edge", { tile: "quarter-disc", dir: "edge" })}</div>`)}
${seed("pairs", "Pair", "The two colours. Ink into red by default; ink into teal beside other warm colour.", `<div class="seed-grid">${swatch("Ink to red", { tile: "triangle" })}${swatch("Ink to teal", { tile: "triangle" }, "--cv-pattern-to:var(--colors-teal-500)")}${swatch("Salmon to red", { tile: "triangle" }, "--cv-pattern-from:var(--colors-accent-solid)")}</div>`)}
${seed("noise", "Noise", "Crisp in artwork (the card, the footer strip). Soft on interface surfaces (callouts), where it must not compete with text.", `<div class="seed-grid">${swatch("Crisp", { tile: "triangle", size: 16, dir: "edge" })}${swatch("Soft", { tile: "triangle", size: 16, dir: "edge", soft: true })}</div>`)}
${seed("callout-art", "Callout art", "Soft noise in the hue's tone, a fine tile in the tint over it.", `<div class="seed-grid">${calloutSwatch("salmon")}${calloutSwatch("gold")}${calloutSwatch("teal")}${calloutSwatch("violet")}</div>`)}
</main>`;

// --- decisions -----------------------------------------------------------------

interface Option {
  name: string;
  html: string;
}

interface Open {
  id: string;
  question: string;
  options: Option[];
  /** Index of the recommended option. */
  pick: number;
  why: string;
  /** Where the recommended option appears in full. */
  see: [href: string, text: string];
}

/** Open questions. Empty when everything in this round is settled. */
const OPEN: Open[] = [];

/** Decided items: the question and the answer, newest round first. */
const DECIDED: [question: string, answer: string, by: string][] = [
  [
    "Label typeface",
    "Instrument Sans, weight 600, uppercase with wide tracking. This is what the tokens already say",
    "You, 17 Nov",
  ],
  ["Corners on callouts and code blocks", "Square", "You, 17 Nov"],
  [
    "Pieces a pattern can repeat",
    "All five: triangle, quarter-disc, half-disc, disc and check",
    "You, 17 Nov",
  ],
  ["Heading weight", "600", "You, 17 Nov"],
  ["Top band on the card", "None", "You, 17 Nov"],
  [
    "Top of an article",
    "The card, the same component as the Open Graph image",
    "You, 17 Nov",
  ],
  [
    "Callout art",
    "A fine tile in the tint over a soft noise fade. No shapes",
    "You, 17 Nov",
  ],
  [
    "Rules on pages",
    "Only in the card frame and in tables. Everything else is separated by space",
    "You, 17 Nov",
  ],
  [
    "Window header and footer",
    "Span the screen. The footer pattern runs edge to edge",
    "You, 17 Nov",
  ],
  [
    "Card ground",
    "Different from the page so the card sits apart: concrete on paper, a lighter dark on the dark page",
    "Follows from your note on hierarchy",
  ],
  [
    "Callout hues",
    "All four work the same way, violet included",
    "Simplification: one rule instead of an exception",
  ],
];

const option = (o: Option, picked: boolean) =>
  `<div class="seed-option${picked ? " seed-picked" : ""}"><p class="cv-label">${o.name}${picked ? ' <span class="seed-tag">Recommended</span>' : ""}</p>${o.html}</div>`;

const decisionsPage = `<main class="cv-main" data-seed="decisions">
<h1 class="seed-title">Decisions</h1>
<p class="seed-note">The one list of design decisions for this round. Open questions first, each with the options side by side. Reply with the option name; anything decided moves to the list at the end.</p>
${OPEN.length ? "" : '<p class="seed-why"><strong>No open questions.</strong> Everything in this round is settled.</p>'}
${OPEN.map(
  (d, i) => `<section class="seed-decision" id="${d.id}">
  <p class="cv-label cv-label-quiet">Open · ${i + 1} of ${OPEN.length}</p>
  <h2>${d.question}</h2>
  <div class="seed-options">${d.options.map((o, j) => option(o, j === d.pick)).join("")}</div>
  <p class="seed-why"><strong>${d.options[d.pick]?.name}.</strong> ${d.why} <a href="${d.see[0]}">${d.see[1]}</a></p>
</section>`,
).join("\n")}
<section class="seed-decision" id="decided"><p class="cv-label cv-label-quiet">Decided · ${DECIDED.length}</p><h2>Already settled</h2>
<dl class="seed-decided">${DECIDED.map(([q, a, by]) => `<dt>${q}</dt><dd>${a}<span class="cv-label cv-label-quiet">${by}</span></dd>`).join("")}</dl>
</section>
</main>`;

const indexPage = `<main class="cv-main">
${card({ letter: "S", kind: "Brand seeds", section: "Round 5", title: "One style", meta: "17 Nov 2026 · Built by pnpm build" })}
<div class="cv-body">
<p class="cv-standfirst">Specimens for the Civilian style. Three layers: the window spans the screen, the card sits apart at the top, and the body is open space for reading.</p>
<nav class="cv-list cv-index"><p class="cv-label">Pages · 5</p><ol>
<li>${label("01", true)}<div><h3><a href="decisions.html">Decisions</a></h3><p>The one list of open and settled design decisions, with the options side by side.</p></div>${label("Start here", true)}</li>
<li>${label("02", true)}<div><h3><a href="card.html">Card</a></h3><p>The one framed component, at Open Graph size.</p></div>${label("Artwork", true)}</li>
<li>${label("03", true)}<div><h3><a href="article.html">Article</a></h3><p>The card at the top, then every element an article uses. Print it to see the print rules.</p></div>${label("Page", true)}</li>
<li>${label("04", true)}<div><h3><a href="listing.html">Index page</a></h3><p>A card with no feature, then an index of articles.</p></div>${label("Page", true)}</li>
<li>${label("05", true)}<div><h3><a href="patterns.html">Patterns</a></h3><p>Every dial of the one pattern construction.</p></div>${label("Sheet", true)}</li>
</ol></nav>
</div>
</main>`;

const pages: [string, string, string][] = [
  ["index", "Contents", indexPage],
  ["decisions", "Decisions", decisionsPage],
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
