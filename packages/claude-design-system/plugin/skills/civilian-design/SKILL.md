---
name: civilian-design
description: Civilian visual design system - brand guide, tokens, colour roles, type, the card, patterns, diagrams and page specimens. Use for ANY visual output - web pages, React components, slides, documents, charts, images, OG images, banners - so it matches the Civilian look.
---

# Civilian design system

## Before you start

1. Read `references/DESIGN.md`, the brand guide. It sets the three layers of a page, twelve rules in priority order, colour, type, components, patterns and what a new theme may change.
2. Find the nearest element in `references/specimens/index.md` and copy its markup from the specimen page with `references/specimens/seeds.css`. Do not rebuild a component from a description.
3. Take every value from the tokens. Never write a hex value.

When something is not covered, use the nearest specimen and say what was missing. Do not invent an element, colour, size or pattern.

## Aesthetic

Plain, exact and calm, with a little warmth: ink on paper, one framed card at the top of each page, and open space for reading. Warm accents (salmon and gold) are rationed against the cool teal and neutral base.

## Usage rules

- Use semantic roles (`bg.canvas`, `fg.default`, `brand.solid`), never primitives (`teal.700`) or raw hex values.
- Support light and dark. Roles resolve per theme, so a role-based design adapts automatically.
- Corners: artwork, cards, callouts and code blocks are square; controls use `radii.sm`; pills and avatars use `radii.full`.
- Type: Poppins 600 for headings, Instrument Sans for body text and labels, Monaspace Xenon for code and file paths only.
- Text contrast must be at least 4.5:1 against its background. Pair `*.solid` with `*.contrast`, and use `fg.*` on `bg.*` surfaces.
- In the body, separate things with space. Rules belong to the card frame and tables only.

## Patterns

**Where patterns go.** Nowhere else.

| Element | Pattern | Extent |
| --- | --- | --- |
| Card | One feature cell: a tiled pattern or grain, crisp noise | The feature cell, whole tiles |
| Footer | One strip, crisp noise | Three tile rows, edge to edge |
| Callout | A fine tile in the tint over a soft fade from the right edge | At most 240px and a third of the callout, gone before the text |
| Everything else | None | |

Make patterns with `pattern()` and `calloutArt()` from `@civilian-dev/brand-graphics`, never by hand. How to size and colour each one is in `references/brand-graphics.md`.

## How to consume the system

### CSS variables (any web output)

Include `references/tokens.css` (also published as `@civilian-dev/design-tokens/css`) and use the variables:

```css
body { background: var(--colors-bg-canvas); color: var(--colors-fg-default); font-family: var(--fonts-body); }
```

Dark mode follows the OS, and can be forced with `<html data-theme="dark">` or `<html data-theme="light">`.

### Panda CSS

```ts
presets: ["@pandacss/preset-base", "@civilian-dev/panda-design-preset"]
```

Then use roles in styles: `css({ bg: "bg.canvas", color: "fg.default", textStyle: "body.medium" })`.

### Raster, canvas, slides, OG images

CSS variables are unavailable here. Read `references/tokens.resolved.json`: per-theme final values, with `hex` and `oklch` for each colour (`resolved.light.colors.bg.canvas.hex`). Never hardcode colours. For a card or banner image, use `compose()` and `toPng()` from `@civilian-dev/brand-graphics`.

### Fonts, patterns, cards and diagrams

- **Fonts:** `@civilian-dev/brand-fonts` (`fonts.css` for pages, OpenType files for renderers). Never load fonts from a CDN.
- **Graphics:** `@civilian-dev/brand-graphics` draws the card (`compose`), patterns (`pattern`, `calloutArt`), PNGs (`toPng`) and diagrams (`mermaidTheme`). Never draw a pattern or the card by hand.

## Reference

Each file is copied from the repo at build time; the source is in brackets.

- `references/DESIGN.md`: the brand guide (`DESIGN.md`).
- `references/specimens/`: a page for every element, in light and dark, with `index.md` listing which page holds each one (`docs/brand-seeds`).
- `references/brand-graphics.md`: the card, patterns, PNG output and diagrams in code (`packages/brand-graphics/README.md`).
- `references/patterns.css`: pattern colour defaults (`packages/brand-graphics/src/patterns.css`).
- `references/roles.md`: every semantic colour role with light and dark values and usage (built from the tokens).
- `references/tokens.css`: all CSS variables, with light and dark (`@civilian-dev/design-tokens/css`).
- `references/tokens.resolved.json`: final values per theme, hex and oklch (`@civilian-dev/design-tokens/resolved`).
