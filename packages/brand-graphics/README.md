# @civilian-dev/brand-graphics

The Civilian brand artwork: a small kit of single-colour SVG pieces and a composer that arranges them into banners, social images and backgrounds. The rules it follows are in [`DESIGN.md`](../../DESIGN.md) (sections Graphics and Artefacts).

Private for now. Open [`examples/index.html`](examples/index.html) to see everything on one page.

## Layout

| Path               | What                                                                   | Edited by              |
| ------------------ | ---------------------------------------------------------------------- | ---------------------- |
| `src/shapes/`      | Magnets: solid pieces on a 120-unit module with a 4-unit corner radius | hand (or Figma export) |
| `src/lines/`       | Marks: line accents, 12-unit stroke, round ends                        | hand                   |
| `src/patterns/`    | Seamless pattern tiles                                                 | hand                   |
| `src/mark/`        | The civilian figure (provisional brand mark)                           | hand                   |
| `src/compose.ts`   | Composer and texture generators                                        | hand                   |
| `scripts/build.ts` | Writes `examples/` from the sources and the design tokens              | hand                   |
| `examples/`        | Generated output, committed and drift-checked by CI                    | `pnpm build` only      |

## Source rules

- Every source SVG is one colour, written as `currentColor`, with a `viewBox` starting at `0 0`. No ids, no embedded styles, no hex values.
- Solids are inset by 4 units and stroked 8 units in the same colour with round joins. That gives every piece the same 4-unit corner radius without drawing it, and keeps the visual bounds equal to the `viewBox`.
- Pattern tiles must repeat cleanly: anything crossing an edge has to re-enter at the opposite edge.
- To add a piece, drop a file in the right folder and rebuild. The composer picks pieces by file name, so a new piece only appears in compositions once it is added to a list in `src/compose.ts`.

## Using the pieces directly

Inline a source SVG and set `color`, or use a pattern tile as a mask so CSS decides the colour:

```css
.dotted {
  background-color: var(--colors-accent-solid);
  mask: url("@civilian-dev/brand-graphics/src/patterns/dots.svg") repeat;
}
```

The fluid examples (`callout-*.svg`, `texture-*.svg`) have no `viewBox`, so they fill any box:

```css
.callout {
  background: url("callout-salmon.svg") right / 100% 100% no-repeat;
}
```

## Composer

```ts
import { compose } from "./src/compose";

const svg = compose(kit, hex, {
  width: 1200,
  height: 630,
  recipe: "totem", // totem | scatter | band | field
  palette: "sunrise", // sunrise | dusk | harbour | signal
  ground: "paper", // paper | ink
  seed: 7,
  text: {
    kicker: "Field notes",
    title: ["Software for", "the rest of us"],
    footer: true,
  },
});
```

- `kit` is the parsed sources (`parsePiece`), `hex` looks up a primitive token such as `salmon.300`. See `scripts/build.ts`.
- The same options always return the same SVG. Change the seed for a new arrangement; do not edit the output.
- Also exported: `avatar`, `calloutBackground`, `texture`, `stippleFilter`, `grainFilter`.

## Known gaps

- Titles are wrapped by the caller; the composer does not measure text.
- Text uses Poppins and Monaspace Xenon by name. Rasterising to PNG for social cards needs the fonts embedded (stage 4 of [`docs/brand-plan.md`](../../docs/brand-plan.md)).
- No tests yet. The density and clear-zone rules in `DESIGN.md` are followed by construction, not checked.
