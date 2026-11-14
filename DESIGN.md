---
version: alpha
name: Civilian Dev
description: Plain, spacious and useful. A calm printed page with a few solid pieces placed on it, like magnets on a fridge.
colors:
  primary: "#1c6b69"
  primary-hover: "#01343a"
  ink: "#01343a"
  paper: "#fdfbf8"
  surface: "#ffffff"
  secondary: "#7366bd"
  tertiary: "#fea993"
  highlight: "#fede8f"
  hot: "#f25855"
  neutral: "#f9fafb"
  neutral-muted: "#f0f3f4"
  border: "#e0e6e7"
  border-strong: "#aab7b9"
  text-muted: "#2c3536"
  text-subtle: "#404a4b"
  tint-salmon: "#fef4f2"
  tint-gold: "#fcf6e9"
  tint-violet: "#f6f6fe"
  tint-teal: "#f0f9f9"
  magnet-salmon: "#fea993"
  magnet-gold: "#fede8f"
  magnet-violet: "#7366bd"
  magnet-teal: "#54a2a6"
  magnet-teal-deep: "#1c6b69"
  magnet-violet-light: "#c9c4fe"
  magnet-teal-light: "#a8d6d8"
typography:
  display:
    fontFamily: Poppins
    fontSize: 2.75rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading-xl:
    fontFamily: Poppins
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading-lg:
    fontFamily: Poppins
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.375
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.625
  body-md:
    fontFamily: Instrument Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: Instrument Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Monaspace Xenon
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.1em
  code:
    fontFamily: Monaspace Xenon
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.625
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 32px
  full: 9999px
spacing:
  "1": 0.25rem
  "2": 0.5rem
  "3": 0.75rem
  "4": 1rem
  "6": 1.5rem
  "8": 2rem
  "12": 3rem
  "16": 4rem
  "24": 6rem
  "32": 8rem
  "48": 12rem
  prose: 672px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  kicker:
    textColor: "{colors.text-subtle}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  callout:
    backgroundColor: "{colors.tint-salmon}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  callout-note:
    backgroundColor: "{colors.tint-violet}"
    textColor: "{colors.ink}"
  callout-tip:
    backgroundColor: "{colors.tint-gold}"
    textColor: "{colors.ink}"
  banner:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.display}"
    padding: 48px
  code-block:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: 16px
---

# Civilian Dev

The brand guide for the Civilian Dev site, articles, profile and generated assets. It follows the [DESIGN.md format](https://github.com/google-labs-code/design.md). The YAML above mirrors `packages/design-tokens` (light theme); Figma is the source of truth, so change values there, never here. Rules have ids (`P1`, `C2`, `G4`) so reviews and agents can cite them.

## Overview

Civilian Dev makes technology for people who would rather get on with their day. The look is a calm printed page: warm paper, one dark ink, a lot of room. On that page sit a few solid, friendly pieces (a disc, a square, a bar, an arc) that can be rearranged like magnets on a fridge. The page is the professional part. The magnets are the human part.

It should feel like a well-run public service with a sense of humour: a transit map, a good manual, a paperback with a bright cover. It should never feel like a terminal.

### Principles

- **P1 Ground first.** Empty space is the main material. At least 60% of any composition is plain ground. When in doubt, remove a piece and widen a margin.
- **P2 One job each.** Every element is exactly one of: ground, text, rule, magnet, mark, pattern, texture. If you cannot name its job, delete it.
- **P3 Pieces, not pictures.** Illustration is assembled from the fixed kit in `packages/brand-graphics`. Pieces stay whole and solid. Nothing is drawn one-off for a single asset.
- **P4 Few inks.** A composition uses the ground, the ink and at most three accent colours, printed flat. Colour is printed, not lit: no glow, no gloss, no neon.
- **P5 Plain speech.** Say it in everyday words, at a readable size, once. Labels tell people where they are; headings tell them what they get.
- **P6 Bold line, light touch.** Line marks have one weight and round ends. Use at most one burst of energy (a spark, a squiggle) per composition, next to the thing that matters.
- **P7 Arranged, not random.** Variety comes from recombining the kit on a grid with a seed. The same recipe, palette and seed always give the same result.

### Not nerdy

Banned motifs, in any medium: code brackets and `</>` glyphs, terminal windows and prompts, binary, circuit boards, node-and-edge "network" art, robots, glowing gradients on black, isometric server racks, matrix rain, hexagon grids, 3D blobs. Code appears only as actual code in a code block.

## Colors

Everything maps to an existing token. Names in brackets are the token paths in `packages/design-tokens`.

- **Paper** `#fdfbf8` (`bg.canvas`): the default ground for pages and artwork.
- **Ink** `#01343a` (`fg.default`, `bg.inverse`): all text on light grounds, all line marks, and the inverse ground.
- **Primary** `#1c6b69` (`brand.solid`): links and the main action. Not a decorative colour.
- **Magnet inks** (the accent colours): salmon `#fea993` (`accent.solid`), gold `#fede8f` (`highlight.solid`), violet `#7366bd` (`secondary.solid`), teal `#54a2a6` (`teal.500`). On the ink ground use salmon, gold, light violet `#c9c4fe` and light teal `#a8d6d8`.
- **Hot** `#f25855` (`red.500`): a single small piece when a composition needs one point of heat. Never a ground.
- **Tints** (`*.subtle`): callout and section grounds only.

Rules:

- **C1** Body and heading text is ink on paper or tint, or paper on ink. No coloured text except links (primary) and status messages.
- **C2** At most three magnet inks per composition, plus ink for line marks (P4). Pick a named palette rather than mixing by hand.
- **C3** Gradients exist only as ground textures (G7). Never on text, magnets, buttons or borders.
- **C4** Text never sits on a magnet, a pattern or a textured area. Keep it on plain ground, or put a solid plate under it.
- **C5** Text contrast is at least 4.5:1 (3:1 for display sizes). Ink on salmon, gold, light violet and light teal passes; white on violet passes; nothing else is assumed.
- **C6** Dark theme uses the dark token set. Artwork for dark pages uses the ink ground variants, not inverted light artwork.

Named palettes for graphics (ground decides which column to read):

| Palette | On paper | On ink |
| --- | --- | --- |
| `sunrise` | salmon, gold, teal | salmon, gold, light teal |
| `dusk` | violet, salmon, deep teal `#1c6b69` | light violet, salmon, light teal |
| `harbour` | deep teal, light teal, gold | teal, light teal, gold |
| `signal` | violet, gold, hot | light violet, gold, hot |

## Typography

Three families, one job each (P2).

- **Poppins** (`fonts.heading`), weight 600: headings and display. Tracking `-0.025em` at `xl` and above. Sentence case. Never all caps, never italic.
- **Instrument Sans** (`fonts.body`), 400 with 600 for emphasis: everything people read at length. Line height 1.625.
- **Monaspace Xenon** (`fonts.mono`): code, and the small uppercase label (the kicker) at `xs`, weight 500, tracking `0.1em`. The kicker is the only uppercase text in the system.

Rules:

- **T1** At most three text levels per artefact: kicker, title, supporting line. Pages may add body and code.
- **T2** Type is left-aligned. Centred text only for a single line in a square format (avatar, sticker).
- **T3** Prose measure is `sizes.prose` (672px), about 65 to 75 characters.
- **T4** Use the type scale as given (`xs` to `display`). For artwork, scale display type so the cap height is close to one third of a module (G1); do not invent in-between sizes on pages.
- **T5** No text effects: no outlines, shadows, gradients or stretched letterforms.

## Layout

A spacious single-column editorial layout with a strict rhythm.

- **L1** Space comes from the token scale only (4px base). Related items sit `2` to `4` apart, blocks `8` to `12`, sections `16` to `32`.
- **L2** Page margins are generous: at least `6` on small screens and `16` from `lg` up. Content does not need to fill the width.
- **L3** Structure is shown with space first, then a hairline rule (`border.default`), then a tint. Boxes with borders on all four sides are a last resort.
- **L4** The kicker pattern: a short accent bar (32 by 4px, one magnet ink) above an uppercase mono label, above the title. Use it for article headers, cards and section openers.
- **L5** Every artefact has a text zone and a graphics zone, and they do not overlap. The text zone is at least half the area and sits top-left or left.
- **L6** One focal point per view. If a view has a composed graphic, it has no second illustration.

## Elevation & Depth

Flat. Depth is implied by placement and overlap of solid colour, the way magnets sit on a surface.

- **E1** No shadows on artwork, cards, callouts or buttons.
- **E2** Token shadows (`shadows.md` and up) are for things that float over the page: menus, popovers, dialogs, toasts.
- **E3** Layering in artwork is by flat overlap only, at most two pieces deep, with no transparency.

## Shapes

- **S1** Controls use `radii.md` (8px), cards and callouts `radii.lg` (16px), pills and avatars `radii.full`. One radius per component; nested radii shrink by the padding.
- **S2** Rules and borders are 1px hairlines, 2px for emphasis, 4px for the kicker bar and the callout edge.
- **S3** Icons are Lucide, stroke 1.5 at 16 to 20px and 2 at 24px and up, in the text colour. Icons are interface, not illustration: never enlarge one to decorate and never place one in a magnet cluster.

## Components

- **Button**: primary is solid `brand.solid` with white text; secondary is ink text with a hairline border; one primary per view.
- **Kicker**: see L4. Colour `fg.subtle`.
- **Card**: white on paper with a hairline border, `radii.lg`, padding `6`. No shadow (E1). Optional artwork fills the top edge to edge.
- **Callout**: a tint ground with a 4px left edge in the matching magnet ink, `radii.lg`, padding `6`. Default is salmon; note is violet; tip is gold. It may carry a callout background from `brand-graphics` at the right edge (A4), never behind its text.
- **Banner**: the inverse ground (ink) with paper text and a composed graphic. One per page, at the top.
- **Code block**: `bg.subtle`, hairline border, `radii.md`, mono at `sm`. Syntax colours come from the token hues at the 700 step; keep it quiet.
- **Menu and controls**: hairline borders, `radii.md`, `shadows.md` when floating. Focus ring is 2px `border.focus` with a 2px offset.

## Graphics

The kit lives in `packages/brand-graphics`. Sources are single-colour SVG using `currentColor`; the composer colours them from tokens.

| Group | Folder | Contents |
| --- | --- | --- |
| Magnets | `src/shapes` | Solid pieces: disc, half-disc, quarter-disc, square, bar, pill, triangle, wedge, arc, ring, arch, stair, cross. |
| Marks | `src/lines` | Line accents in one weight with round ends: squiggle, zigzag, spark, dashes, dots. |
| Patterns | `src/patterns` | Seamless tiles: dots, plus, hatch, zigzag, waves, confetti, terrazzo. |
| Mark | `src/mark` | The civilian: disc, square and two bars snapped into a person. |
| Textures | generated | Noise gradients: `grain` (soft gradient with print grain) and `stipple` (a colour dissolving into the ground in dots). |

Rules:

- **G1 Module.** Every composition has a module `u` (the short side divided by 6 unless a recipe says otherwise). Magnets are sized in whole or half modules. Margins are `u / 2` or more.
- **G2 Transforms.** A magnet may be moved, uniformly scaled, flipped, and rotated in 15° steps. Never stretch, skew, outline, or round it differently.
- **G3 Snap or float.** Magnets are either snapped (edge to edge on the grid with a gap of `u / 30`, rotation in 90° steps) or floating (clear of every other piece by at least `u / 2`, any 15° rotation). Nothing half-overlaps except a deliberate two-deep overlap (E3).
- **G4 Bleed.** Pieces may run off the canvas edge. A bleeding piece shows between a third and two thirds of itself.
- **G5 Density.** Magnets and patterns together cover at most 25% of a canvas (40% for a cover with no text). At most seven pieces, at most two marks, at most one pattern and one texture.
- **G6 Marks.** Stroke weight is `u / 10` everywhere in one composition, in ink (paper on the ink ground). A spark sits next to exactly one magnet.
- **G7 Textures.** A texture belongs to the ground: it uses one magnet ink, starts from an edge or corner, and fades to plain ground before it reaches the text zone. Grain is fine, static and monochrome.
- **G8 Patterns.** A pattern fills a simple region (a band, a cell, a magnet-shaped window) in one colour. Keep tile scale constant within a composition.
- **G9 The civilian.** The figure is the brand mark. It is always upright and always the same proportions: head, body, two legs. Other pieces may gather around it but never attach to it.
- **G10 Reproducible.** Generated assets record `recipe`, `palette`, `ground` and `seed` (in the file name or metadata). Do not hand-tweak generated output; change the recipe or the seed.

Recipes in the composer:

- `totem`: a snapped stack of magnets in the graphics zone with one or two floating pieces. The default for Open Graph images.
- `scatter`: floating pieces around the edges, some bleeding, text zone clear. For profile and article banners.
- `band`: a strip of square cells along one edge, each a flat colour holding one magnet or a pattern. For section headers and footers.
- `field`: a texture from one corner, one very large cropped magnet and one mark. For covers and callouts.

## Artefacts

| Id | Artefact | Size | Notes |
| --- | --- | --- | --- |
| A1 | Open Graph image | 1200 by 630 | Kicker, title of up to three lines, `civilian.dev` footer with the mark. Graphics zone is the right 40%. Keep text inside a 60px margin. |
| A2 | Article banner | 1600 by 600, scalable | No text baked in; the page sets the title in HTML. |
| A3 | Profile banner | 1500 by 500 | Wordmark and the civilian; keep the bottom-left 200px clear for the avatar overlap. |
| A4 | Callout background | fluid | Anchored to the right edge, at most 240px wide, fades to the tint before the text. |
| A5 | Avatar | 400 by 400 | The civilian on a flat ground; survives a circular crop. |
| A6 | Section texture | fluid | A texture with no pieces, for wide page sections. |

## Do's and Don'ts

- Do start with paper, ink and space, then add one composed graphic.
- Do pick a named palette and a recipe, and vary the seed for variety.
- Do keep text on plain ground with a clear left edge.
- Do use the kicker pattern to say where the reader is.
- Do let pieces bleed off the edge; it makes the page feel larger.
- Don't use more than three magnet inks, or any colour that is not a token.
- Don't put gradients, shadows, outlines or transparency on magnets or type.
- Don't stretch, skew or redraw pieces, or invent a one-off illustration.
- Don't decorate with icons, code glyphs or anything on the banned list.
- Don't fill space because it is empty.
- Don't centre body text, set headings in capitals, or use more than three text levels in an artefact.
