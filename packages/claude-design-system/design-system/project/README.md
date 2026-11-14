# Civilian design system

Clean, professional, roomy, verging on cold. Warm accents (salmon and gold) are used sparingly, as a hint of warmth against the cool teal and neutral base. Use generous whitespace; let the layout breathe.

## Visual foundations

- **Colour:** teal and cool neutrals carry the interface; salmon and gold are warm accents, used sparingly. Always use semantic roles, which resolve per theme (light and dark).
- **Type:** Poppins for headings, Instrument Sans for body text, Monaspace Xenon for code. Text styles are defined in `tokens.json` (`heading-display` … `code-small`).
- **Space and shape:** a 4px-based spacing scale (`space-*`). Radius `radius-sm` for controls, `radius-md` for surfaces; `radius-lg` / `radius-xl` only for rare emphasis.
- **Elevation:** `shadow-sm` to `shadow-xl`; shadow colours are themed.

## Usage rules

- Use semantic roles (`bg.canvas`, `fg.default`, `brand.solid`), never primitives (`teal.700`) or raw hex values.
- Support light and dark. Roles resolve per theme, so a role-based design adapts automatically.
- Radius: `sm` for controls (buttons, inputs), `md` for surfaces (cards, panels); `lg` / `xl` only for rare emphasis.
- Type: Poppins for headings, Instrument Sans for body text, Monaspace Xenon for code.
- Text contrast must be at least 4.5:1 against its background. Pair `*.solid` with `*.contrast`, and use `fg.*` on `bg.*` surfaces.
- Use warm accents (`accent`, `highlight`) sparingly: one accent per view is usually plenty.

## Colour roles

| Role | Light | Dark | Usage |
|---|---|---|---|
| `bg.canvas` | `#fdfbf8` | `#1b2223` | Surface background: page background behind everything |
| `bg.default` | `#ffffff` | `#2c3536` | Surface background: default |
| `bg.subtle` | `#f9fafc` | `#404a4b` | Surface background: subtle tinted fill |
| `bg.muted` | `#f0f3f4` | `#404a4b` | Surface background: muted fill |
| `bg.emphasized` | `#e0e6e7` | `#566263` | Surface background: emphasised fill or stronger line |
| `bg.inverse` | `#01343a` | `#f9fafc` | Surface background: inverted surface or text on inverted surface |
| `fg.default` | `#01343a` | `#f9fafc` | Text and icons: default |
| `fg.muted` | `#2c3536` | `#e0e6e7` | Text and icons: muted fill |
| `fg.subtle` | `#404a4b` | `#aab7b9` | Text and icons: subtle tinted fill |
| `fg.disabled` | `#aab7b9` | `#566263` | Text and icons: disabled content |
| `fg.inverse` | `#fdfbf8` | `#01343a` | Text and icons: inverted surface or text on inverted surface |
| `border.default` | `#e0e6e7` | `#566263` | Borders and dividers: default |
| `border.subtle` | `#f0f3f4` | `#404a4b` | Borders and dividers: subtle tinted fill |
| `border.emphasized` | `#aab7b9` | `#aab7b9` | Borders and dividers: emphasised fill or stronger line |
| `border.focus` | `#7366bd` | `#c9c4fe` | Borders and dividers: focus ring |
| `brand.solid` | `#1c6b69` | `#54a2a6` | Primary brand (teal): solid fill |
| `brand.hover` | `#01343a` | `#a8d6d8` | Primary brand (teal): hover state of the solid fill |
| `brand.subtle` | `#f0f9f9` | `#01343a` | Primary brand (teal): subtle tinted fill |
| `brand.muted` | `#dff1f2` | `#01343a` | Primary brand (teal): muted fill |
| `brand.fg` | `#1c6b69` | `#a8d6d8` | Primary brand (teal): text or icons on neutral surfaces |
| `brand.contrast` | `#ffffff` | `#01343a` | Primary brand (teal): text or icons placed on the solid fill |
| `accent.solid` | `#fea993` | `#fea993` | Warm accent (salmon), used sparingly: solid fill |
| `accent.hover` | `#d3765f` | `#fee7e1` | Warm accent (salmon), used sparingly: hover state of the solid fill |
| `accent.subtle` | `#fef4f2` | `#521809` | Warm accent (salmon), used sparingly: subtle tinted fill |
| `accent.fg` | `#944430` | `#fea993` | Warm accent (salmon), used sparingly: text or icons on neutral surfaces |
| `accent.contrast` | `#01343a` | `#01343a` | Warm accent (salmon), used sparingly: text or icons placed on the solid fill |
| `highlight.solid` | `#fede8f` | `#fede8f` | Gold highlight, used sparingly: solid fill |
| `highlight.subtle` | `#fcf6e9` | `#3a2c01` | Gold highlight, used sparingly: subtle tinted fill |
| `highlight.fg` | `#765b01` | `#fede8f` | Gold highlight, used sparingly: text or icons on neutral surfaces |
| `highlight.contrast` | `#01343a` | `#01343a` | Gold highlight, used sparingly: text or icons placed on the solid fill |
| `secondary.solid` | `#7366bd` | `#c9c4fe` | Secondary (violet): solid fill |
| `secondary.hover` | `#5d50a2` | `#ebeafe` | Secondary (violet): hover state of the solid fill |
| `secondary.subtle` | `#f6f6fe` | `#2e215d` | Secondary (violet): subtle tinted fill |
| `secondary.fg` | `#5d50a2` | `#c9c4fe` | Secondary (violet): text or icons on neutral surfaces |
| `secondary.contrast` | `#ffffff` | `#2e215d` | Secondary (violet): text or icons placed on the solid fill |
| `success.solid` | `#097234` | `#a4ddae` | Success state: solid fill |
| `success.subtle` | `#effaf1` | `#013916` | Success state: subtle tinted fill |
| `success.fg` | `#097234` | `#a4ddae` | Success state: text or icons on neutral surfaces |
| `success.contrast` | `#ffffff` | `#013916` | Success state: text or icons placed on the solid fill |
| `warning.solid` | `#b68e0a` | `#b68e0a` | Warning state: solid fill |
| `warning.subtle` | `#fcf6e9` | `#3a2c01` | Warning state: subtle tinted fill |
| `warning.fg` | `#765b01` | `#fede8f` | Warning state: text or icons on neutral surfaces |
| `warning.contrast` | `#1b2223` | `#1b2223` | Warning state: text or icons placed on the solid fill |
| `danger.solid` | `#ad1f25` | `#f25855` | Danger / destructive state: solid fill |
| `danger.subtle` | `#fef4f3` | `#5c0109` | Danger / destructive state: subtle tinted fill |
| `danger.fg` | `#ad1f25` | `#feb7b1` | Danger / destructive state: text or icons on neutral surfaces |
| `danger.contrast` | `#ffffff` | `#1b2223` | Danger / destructive state: text or icons placed on the solid fill |
| `info.solid` | `#7366bd` | `#c9c4fe` | Informational state: solid fill |
| `info.subtle` | `#f6f6fe` | `#2e215d` | Informational state: subtle tinted fill |
| `info.fg` | `#5d50a2` | `#c9c4fe` | Informational state: text or icons on neutral surfaces |
| `info.contrast` | `#ffffff` | `#2e215d` | Informational state: text or icons placed on the solid fill |
| `shadow.faint` | `#022628` | `#000000` | Shadow colour: faint elevation |
| `shadow.default` | `#022628` | `#000000` | Shadow colour: default |
| `shadow.strong` | `#022628` | `#000000` | Shadow colour: strong elevation |
| `overlay.scrim` | `#022628` | `#000000` | Overlay: scrim behind modals and drawers |

## Using the system

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

---

*Generated from `@civilian-dev/design-tokens` by CI. Do not edit here; change the tokens in Figma.*
