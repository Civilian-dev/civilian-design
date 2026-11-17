# @civilian-dev/brand-graphics

The Civilian brand artwork: a small kit of single-colour SVG pieces and a composer that sets them into sign-style banners, social images and backgrounds. The rules it follows are in [`DESIGN.md`](../../DESIGN.md) (sections Layout, Graphics and Artefacts). Reference images for the direction are in [`docs/brand-seeds`](../../docs/brand-seeds/README.md).

Published as `@civilian-dev/brand-graphics`. Open [`examples/index.html`](examples/index.html) to see everything on one page.

## Install and use

```ts
import { compose } from "@civilian-dev/brand-graphics";

const svg = compose({
  width: 1200,
  height: 630,
  layout: "sign",
  scheme: "paper",
  feature: "weave",
  seed: 11,
});
```

| Import                                                     | What                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@civilian-dev/brand-graphics`                             | `pattern` and `calloutArt`; `compose`, `avatar`, `calloutBackground` and `texture` with the shape kit and token colours built in; `kit`, `hex`, `TILES`, `CSS_PAINT`, `SCHEMES`, `BORDER_WIDTHS`, `ART_WIDTH` and the types |
| `@civilian-dev/brand-graphics/patterns.css`                | Default pattern colours as custom properties                                                                                                                                                                                |
| `@civilian-dev/brand-graphics/compose`                     | The same functions taking `kit` and `hex` as their first arguments, for a custom kit or colour lookup                                                                                                                       |
| `@civilian-dev/brand-graphics/shapes/*.svg`, `/mark/*.svg` | The source SVGs, for placing pieces yourself                                                                                                                                                                                |

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

## Composer

```ts
import { compose } from "@civilian-dev/brand-graphics/compose";

const svg = compose(kit, hex, {
  width: 1200,
  height: 630,
  layout: "sign", // sign | ledger
  scheme: "paper", // paper | concrete | night
  feature: "weave", // none | grain | weave
  seed: 11,
  text: {
    letter: "A",
    kind: "Article",
    number: "012",
    section: "Field notes",
    title: ["A field guide to", "small libraries"],
    meta: "14 Nov 2026 · 6 min",
  },
});
```

- `kit` is the parsed sources (`parsePiece`), `hex` looks up a primitive token such as `salmon.300`. See `scripts/build.ts`.
- A scheme is a whole colour set (ground, ink, band, bullet, key colours, gradient pairs), defined in `SCHEMES` as token paths. Change schemes there and in the table in `DESIGN.md`. No colour value is written in this package.
- `sign` is a band, a bullet row, a rule, the body, a rule and a footer row. `ledger` is a ruled frame of six cells. Both are sized from one module (the height divided by 6), so they work at any size.
- `feature` fills the one feature block: `grain` is a two-colour noise gradient with a quarter-disc anchored in the corner; `weave` is small tiles in the ground colour over a noise gradient. Tiles are always a whole number of pixels, across and down.
- The seed picks the gradient pair, the weave piece and its quarter turn, the number of weave rows and the order of the key. It never picks a position or a size.
- Leave out `text` for a background: the page sets the title. `profile: true` sets the wordmark as the title and puts the civilian in place of the feature block.
- The same options always return the same SVG. Change the inputs for a different result; do not edit the output.
- Also exported: `avatar`, `calloutBackground`, `texture`, `stippleFilter`.

## Using the fluid pieces

The callout backgrounds and textures have no `viewBox`, so they fill any box:

```css
.callout {
  background: url("callout-salmon.svg") right / 100% 100% no-repeat;
}
```

## Known gaps

- Titles are wrapped by the caller; the composer does not measure text.
- Text uses Poppins and Monaspace Xenon by name. Rasterising to PNG for social cards needs the fonts embedded (PR 8 of [`docs/design-system-v2-plan.md`](../../docs/design-system-v2-plan.md), using `@civilian-dev/brand-fonts`).
- Tests cover parsing, determinism, whole-pixel tiles, ids, the grain disc colour (G5) and red placement (C4). Other `DESIGN.md` rules are not checked yet.
- The dark scheme reads the light token set, because `night` is an inverse scheme built from primitives. It does not yet use the dark semantic tokens.
