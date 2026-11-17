# @civilian-dev/brand-graphics

The Civilian brand artwork: a small kit of single-colour SVG pieces, a pattern library, and a composer that draws the card as a social image, banner or profile. The rules it follows are in [`DESIGN.md`](../../DESIGN.md) (sections Components, Patterns and Artefacts). The specimens are in [`docs/brand-seeds`](../../docs/brand-seeds/README.md).

Published as `@civilian-dev/brand-graphics`. Open [`examples/index.html`](examples/index.html) to see everything on one page.

## Install and use

```ts
import { compose } from "@civilian-dev/brand-graphics";

const svg = compose({
  width: 1200,
  height: 630,
  theme: "light",
  feature: "weave",
  seed: 11,
});
```

| Import                                                     | What                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@civilian-dev/brand-graphics`                             | `compose`, `layout`, `layoutVars`, `pattern`, `calloutArt`, `avatar`, `calloutBackground` and `texture` with the shape kit and token colours built in; `defineTheme`, `put`, `rect`, `kit`, `hex`, `THEMES`, `TILES`, `CSS_PAINT`, `BORDER_WIDTHS`, `ART_WIDTH` and the types |
| `@civilian-dev/brand-graphics/patterns.css`                | Default pattern colours as custom properties                                                                                                                                                                                                                                  |
| `@civilian-dev/brand-graphics/compose`                     | The same functions taking `kit` and `hex` as their first arguments, for a custom kit or colour lookup                                                                                                                                                                         |
| `@civilian-dev/brand-graphics/shapes/*.svg`, `/mark/*.svg` | The source SVGs, for placing pieces yourself                                                                                                                                                                                                                                  |

`BORDER_WIDTHS` and `ART_WIDTH` stand in for design tokens that do not exist yet. Read them from here rather than writing the numbers.

## Patterns

Every pattern is one tile repeated over a two-colour noise gradient, made by `pattern()` or `calloutArt()`. They return an inline SVG that fills its box and is coloured by CSS custom properties, so the same markup works in light and dark. Load the defaults once:

```css
@import "@civilian-dev/design-tokens/css";
@import "@civilian-dev/brand-graphics/patterns.css";
```

Patterns go in three places only ([`DESIGN.md`](../../DESIGN.md), Patterns):

| Where        | Call                                                                                        | Box                                                                                                                 | Colours                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Card feature | `pattern({ tile: "triangle" })`, or `tile: "none"` for grain with one anchored quarter-disc | The feature cell, a whole number of tiles each way (tiles are 24px unless `size` is set)                            | `--cv-pattern-tile` set to the card's ground                                               |
| Footer strip | `pattern({ tile: "quarter-disc" })`                                                         | Full screen width, three tiles high                                                                                 | The defaults                                                                               |
| Callout      | `calloutArt()`                                                                              | Absolutely placed at the callout's right edge, full height, `min(ART_WIDTH px, 33%)` wide; the text stops before it | `--cv-pattern-from` and `--cv-pattern-tile` set to the tint, `--cv-pattern-to` to the tone |

Nothing else in a page gets a pattern. Copy the surrounding markup from the specimens in [`docs/brand-seeds`](../../docs/brand-seeds/README.md) (card, article, patterns).

- **Dials:** `tile` (`TILES`, or `none`), `turn` in quarter turns, `size` in px, `dir` (`down`, `diagonal`, `edge`), and `soft` noise for interface surfaces. `seed` changes the grain only.
- **Ids:** pass a unique `id` when a page has more than one pattern with the same options.
- **Without CSS** (rasters, PDFs): pass `paint: { from, to, tile }` with colours from `hex()`.

## Layout

| Path                 | What                                                                             | Edited by         |
| -------------------- | -------------------------------------------------------------------------------- | ----------------- |
| `src/shapes/`        | The working pieces: disc, quarter-disc, half-disc, triangle, square              | hand              |
| `src/mark/`          | The civilian figure (provisional brand mark)                                     | hand              |
| `src/pattern.ts`     | The pattern library: `pattern()` and `calloutArt()`                              | hand              |
| `src/patterns.css`   | Default pattern colours as custom properties, and the `.cv-pattern` box          | hand              |
| `src/compose.ts`     | Composer: layouts, feature blocks, callout backgrounds, textures                 | hand              |
| `src/index.ts`       | The package entry: the composer with the kit and token colours built in          | hand              |
| `src/kit.ts`         | The shape kit, pre-parsed from `src/shapes` and `src/mark`                       | `pnpm build` only |
| `scripts/prepare.ts` | Writes `src/kit.ts` and copies the SVGs into `dist/` before `tsc` compiles `src` | hand              |
| `scripts/build.ts`   | Writes `examples/` from the sources and the design tokens                        | hand              |
| `examples/`          | Generated output, committed and drift-checked by CI                              | `pnpm build` only |

## Source rules

- Every source SVG is one colour, written as `fill="currentColor"` on the root, with a `viewBox` starting at `0 0`. No ids, no embedded styles, no hex values.
- `parsePiece` checks these rules, so a source that breaks them fails the build.
- Pieces fill their `viewBox` edge to edge and have square corners (S1). No strokes.
- To add a piece, drop a file in `src/shapes` and rebuild. It only appears in compositions once it is added to `KEY_PIECES` or `WEAVE_PIECES` in `src/compose.ts`, and those lists take pieces with square bounds only.

## The card

`compose()` draws the card from `DESIGN.md` (Components, Card) as one SVG: a 2px ink frame of six cells on the card's own ground, the same component as the card in the specimens.

```ts
import { compose } from "@civilian-dev/brand-graphics";

const svg = compose({
  width: 1200,
  height: 630,
  theme: "light", // light | dark
  feature: "weave", // weave | grain | none
  seed: 11,
  text: {
    letter: "A",
    kind: "Article",
    number: "012",
    section: "Field notes",
    title: ["A field guide to", "small libraries"],
    meta: "14 Nov 2026 · 6 min read",
  },
});
```

- **Themes** read semantic tokens: the card ground is `bg.emphasized` in light and `bg.default` in dark. The colours per theme are in `THEMES`, as token paths.
- **The feature** is drawn by the pattern library. `weave` repeats a tile; the seed chooses the tile, turn and colour pair unless `tile` or `turn` is given. `grain` is the gradient alone with one ink quarter-disc anchored in the corner.
- **Any size works.** Sizes scale from the 1200 by 630 card, and the feature is always a whole number of tiles.
- **Profile:** `profile: true` sets the wordmark as the title and puts the civilian in the feature cell. `wordmark` changes the wordmark everywhere.
- **Same options, same SVG.** The seed never picks a position or a size. Change the inputs for a different result; do not edit the output.

### Text in HTML over a composed card

Leave out `text` for a background, and set the text in HTML on the same grid. `layout()` returns every cell and type size in px; `layoutVars()` gives the title cell as custom properties, and the SVG carries the same values as `data-title-*` attributes.

```ts
import { compose, layout, layoutVars } from "@civilian-dev/brand-graphics";

const size = { width: 1200, height: 630 };
const background = compose({
  ...size,
  theme: "light",
  feature: "weave",
  seed: 3,
});
const vars = layoutVars(layout({ ...size, feature: "weave" }));
// <div style="position:relative; --cv-card-title-x:…">
//   {background}<h1 style="position:absolute; left:calc(var(--cv-card-title-x) + var(--cv-card-cell-pad)); …">
```

The Card specimen in `docs/brand-seeds` has the full markup (`card-overlay`).

### Theme contract

`defineTheme()` takes the bounded choices a derivative theme may make (`DESIGN.md`, Theme contract), checks them and fills in defaults: theme, feature, tile, turn, callout hue, bullet letter and wordmark.

### Building your own artefact

`put()` places a piece from `kit` by its top-left corner at a height, in one colour and a quarter turn; `rect()` draws a box. They are the only drawing primitives the composer uses, so an artefact built with them keeps to the same rules.

## Using the fluid pieces

The callout backgrounds and textures have no `viewBox`, so they fill any box:

```css
.callout {
  background: url("callout-salmon-light.svg") right / 100% 100% no-repeat;
}
```

On a page with CSS, prefer `calloutArt()` and `patterns.css` (see Patterns): they follow the theme without a second file.

## Known gaps

- Titles are wrapped by the caller; the composer does not measure text.
- Text uses Poppins and Instrument Sans by name. Rasterising to PNG for social cards needs the fonts embedded (PR 8 of [`docs/design-system-v2-plan.md`](../../docs/design-system-v2-plan.md), using `@civilian-dev/brand-fonts`).
- Tests cover parsing, layout geometry at many sizes, whole tiles, determinism, themes, red placement, ids and `defineTheme`. Contrast and label style are not checked yet (plan PR 10).
