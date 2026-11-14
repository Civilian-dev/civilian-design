# @civilian-dev/brand-graphics

The Civilian brand artwork: a small kit of single-colour SVG pieces and a composer that sets them into sign-style banners, social images and backgrounds. The rules it follows are in [`DESIGN.md`](../../DESIGN.md) (sections Layout, Graphics and Artefacts). Reference images for the direction are in [`docs/brand-seeds`](../../docs/brand-seeds/README.md).

Private for now. Open [`examples/index.html`](examples/index.html) to see everything on one page.

## Layout

| Path               | What                                                                | Edited by         |
| ------------------ | ------------------------------------------------------------------- | ----------------- |
| `src/shapes/`      | The working pieces: disc, quarter-disc, half-disc, triangle, square | hand              |
| `src/mark/`        | The civilian figure (provisional brand mark)                        | hand              |
| `src/reserve/`     | Earlier pieces, line marks and pattern tiles. Not loaded, not used. | hand              |
| `src/compose.ts`   | Composer: layouts, feature blocks, callout backgrounds, textures    | hand              |
| `scripts/build.ts` | Writes `examples/` from the sources and the design tokens           | hand              |
| `examples/`        | Generated output, committed and drift-checked by CI                 | `pnpm build` only |

## Source rules

- Every source SVG is one colour, written as `fill="currentColor"` on the root, with a `viewBox` starting at `0 0`. No ids, no embedded styles, no hex values.
- `parsePiece` checks these rules, so a source that breaks them fails the build.
- Pieces fill their `viewBox` edge to edge and have square corners (S1). No strokes.
- To add a piece, drop a file in `src/shapes` and rebuild. It only appears in compositions once it is added to `KEY_PIECES` or `WEAVE_PIECES` in `src/compose.ts`, and those lists take pieces with square bounds only.
- Files in `src/reserve` keep the earlier rounded style and do not follow these rules.

## Composer

```ts
import { compose } from "./src/compose";

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
- Text uses Poppins and Monaspace Xenon by name. Rasterising to PNG for social cards needs the fonts embedded (stage 4 of [`docs/brand-plan.md`](../../docs/brand-plan.md)).
- No tests yet. The rules in `DESIGN.md` are followed by construction, not checked.
- The dark scheme reads the light token set, because `night` is an inverse scheme built from primitives. It does not yet use the dark semantic tokens.
