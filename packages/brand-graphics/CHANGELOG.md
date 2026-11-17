# @civilian-dev/brand-graphics

## 0.2.0

### Minor Changes

- eb16772: Breaking: the composer draws the one card from DESIGN.md. `layout` and `scheme` are replaced by `theme: "light" | "dark"`, which reads semantic tokens, and `hex()` takes a theme. `calloutBackground()` now takes `{ hue, theme, seed }` and has a dark version; `texture()` takes `{ theme, seed }`. The feature, callouts and textures are drawn by the pattern library. New: `layout()` and `layoutVars()` for setting text in HTML over a composed card, `defineTheme()`, `put()`, `rect()`, `THEMES` and a `wordmark` option. Removed: `SCHEMES` and `stippleFilter`.
- 623cad9: Publish the package. `compose`, `avatar`, `calloutBackground` and `texture` now work from one import with the shape kit and token colours built in; the versions that take a kit and colour lookup are at `/compose`, and the source SVGs at `/shapes/*` and `/mark/*`. Adds `BORDER_WIDTHS` and `ART_WIDTH` until those exist as tokens.
- f4c2593: Add the pattern library: `pattern()` and `calloutArt()` return inline SVG coloured by custom properties, with defaults in `@civilian-dev/brand-graphics/patterns.css`, or by resolved colours through `paint`. `texture()` now lets the seed choose the colour pair, as `compose()` does.
- 3aede52: Add `toPng()` at `@civilian-dev/brand-graphics/raster`, which renders any SVG from the package as a PNG with the brand fonts, and `mermaidTheme()`, which returns Mermaid options for a light or dark diagram in the brand style.

### Patch Changes

- Updated dependencies [f71cbb7]
  - @civilian-dev/brand-fonts@0.2.0
  - @civilian-dev/design-tokens@0.2.0
