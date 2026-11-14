---
name: civilian-design
description: Civilian visual design system (tokens, colour roles, type, spacing, radii). Use for ANY visual output - web pages, React components, slides, documents, charts, images, OG images, banners - so it matches the Civilian look.
---

# Civilian design system

## Aesthetic

Clean, professional, roomy, verging on cold. Warm accents (salmon and gold) are used sparingly, as a hint of warmth against the cool teal and neutral base. Use generous whitespace; let the layout breathe.

## Usage rules

- Use semantic roles (`bg.canvas`, `fg.default`, `brand.solid`), never primitives (`teal.700`) or raw hex values.
- Support light and dark. Roles resolve per theme, so a role-based design adapts automatically.
- Radius: `sm` for controls (buttons, inputs), `md` for surfaces (cards, panels); `lg` / `xl` only for rare emphasis.
- Type: Poppins for headings, Instrument Sans for body text, Monaspace Xenon for code.
- Text contrast must be at least 4.5:1 against its background. Pair `*.solid` with `*.contrast`, and use `fg.*` on `bg.*` surfaces.
- Use warm accents (`accent`, `highlight`) sparingly: one accent per view is usually plenty.

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

CSS variables are unavailable here. Read `references/tokens.resolved.json`: per-theme final values, with `hex` and `oklch` for each colour (`resolved.light.colors.bg.canvas.hex`). Never hardcode colours.

## Reference

- `references/roles.md`: every semantic colour role with light and dark values and usage.
- `references/tokens.css`: all CSS variables, with light and dark.
- `references/tokens.resolved.json`: final values per theme (hex and oklch).

## Generative assets

Generative patterns and gradients (`@civilian-dev/brand-graphics`) are coming. Until then, build backgrounds from flat role colours and simple gradients between role colours; do not invent decorative illustration styles.
