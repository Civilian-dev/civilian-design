---
version: alpha
name: Civilian Dev
description: Plain, spacious and useful. A public-service sign system in ink on paper, cool and exact, with a few warm solid shapes used as punctuation.
colors:
  primary: "#1c6b69"
  primary-hover: "#01343a"
  ink: "#01343a"
  paper: "#fdfbf8"
  surface: "#ffffff"
  secondary: "#7366bd"
  tertiary: "#fea993"
  highlight: "#fede8f"
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
  concrete: "#e0e6e7"
  accent-red: "#f25855"
  accent-salmon: "#fea993"
  accent-gold: "#fede8f"
  accent-teal: "#54a2a6"
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
    rounded: "{rounded.md}"
    padding: 24px
  callout:
    backgroundColor: "{colors.tint-salmon}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
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

The brand guide for the Civilian Dev site, articles, profile and generated assets. It follows the [DESIGN.md format](https://github.com/google-labs-code/design.md). Rules have ids (`P1`, `C2`, `G4`) so reviews and agents can cite them.

**Where values come from.** Figma is the source of truth. `packages/design-tokens` is built from it, and every colour, size and font in a generated asset is read from `@civilian-dev/design-tokens/resolved` at build time. The YAML above is a mirror of those tokens for tools that read this format; it is not a source, and it must be regenerated from the tokens, never edited by hand. The prose below names tokens (`fg.default`, `red.500`) and never gives a hex value, so there is nothing here to drift.

## Overview

Civilian Dev makes technology for people who would rather get on with their day. The look is a public-service sign system: ink on paper, a black band, a rule above and below, a label that says where you are. It is clean, professional and roomy. The temperature is cool, close to cold, and the warmth is rationed: one or two small warm accents, placed on purpose.

The reference is the 1970 New York City Transit Authority manual: a fixed module, a small kit of parts, strict hierarchy, information only where a decision is made. Push it towards brutalism: structure is shown, not hidden; edges are square; nothing is decoration. The friendly solid shapes (disc, quarter-disc, triangle) survive as punctuation, the way a route bullet does on a sign: small, few, and meaning something.

It should feel like a well-made manual or a transit sign. It should never feel like a terminal, and never like a party.

### Principles

- **P1 Ground first.** Empty space is the main material. At least 60% of any composition is plain ground. When in doubt, remove something and widen a margin.
- **P2 One job each.** Every element is exactly one of: ground, band, rule, text, bullet, key, feature block. If you cannot name its job, delete it.
- **P3 Structure shows.** Layout is made of bands and rules that run the full width of the content. The grid is visible and it is the design. Do not soften it.
- **P4 Cold first, warmth rationed.** Ink and paper (or ink and concrete) do almost all the work. A composition adds at most two accent colours, and warm colour covers no more than about 15% of the area. Colour is printed, not lit: no glow, no gloss, no neon.
- **P5 Shapes are punctuation.** A shape marks, labels or keys something. It is never scattered, never a backdrop, and never the largest thing in the composition except inside the one feature block.
- **P6 Plain speech.** Say it in everyday words, at a readable size, once. Labels tell people where they are; headings tell them what they get.
- **P7 One rule, said in a sentence.** Anything that repeats follows one rule a viewer could name. Nothing is placed at random. A seed only chooses among allowed options, and the same inputs always give the same result.
- **P8 Made to resize.** Assets are built from a module and anchored to edges, so they work at any size. Backgrounds carry no baked-in text.

### Not nerdy, not cheerful

Banned motifs, in any medium: code brackets and `</>` glyphs, terminal windows and prompts, binary, circuit boards, node-and-edge "network" art, robots, glowing gradients on black, isometric server racks, matrix rain, hexagon grids, 3D blobs. Code appears only as actual code in a code block.

Also banned: full-bleed colour grounds (salmon, gold, mint, plum pages), confetti, terrazzo, squiggles, more than two accent colours together, pastel on pastel, and any composition whose first impression is "colourful".

## Colors

Everything is a token. Names are paths in `packages/design-tokens`.

- **Paper** (`bg.canvas`): the default ground.
- **Concrete** (`neutral.200`): the alternative light ground, for the `ledger` layout.
- **Ink** (`fg.default`, `bg.inverse`): all text on light grounds, every band and rule, the dark ground, and the default shape colour.
- **Primary** (`brand.solid`): links and the main action. Interface only, not artwork.
- **Accents** (artwork): red (`red.500`), salmon (`salmon.300`), gold (`gold.300`). Cool alternative: teal (`teal.500`). Violet is for focus and info states in the interface only.
- **Tints** (`*.subtle`): callout and section grounds only.

Rules:

- **C1** Text is ink on paper or concrete, or paper on ink. No coloured text except links (primary), the muted metadata line (`fg.subtle`) and status messages.
- **C2** A composition uses one scheme from the table below. Do not mix by hand.
- **C3** Colour appears in exactly three places: the route bullet, the key, and the feature block. Nowhere else.
- **C4** Red is the signal colour: the bullet, or one piece in the key. One red element per composition outside the feature block.
- **C5** Gradients exist only as noise gradients inside the feature block or a section texture (G6). Never smooth, never on text, shapes, buttons or borders.
- **C6** Text never sits on a shape, a weave or a textured area. Keep it on plain ground.
- **C7** Text contrast is at least 4.5:1 (3:1 for display sizes).
- **C8** Dark theme uses the dark token set and the `night` scheme, not inverted light artwork.

Schemes for graphics:

| Scheme | Ground | Ink (text, rules) | Band | Accents | Feature gradient |
| --- | --- | --- | --- | --- | --- |
| `paper` | paper | ink | ink | red, gold | ink to red, or salmon to red |
| `concrete` | concrete | ink | none (outer frame) | red, salmon | salmon to red, or ink to teal |
| `night` | ink | paper | teal | red, gold, salmon | salmon to red |

`paper` is the everyday default. `concrete` is for `ledger` layouts. `night` is for dark pages. The cool gradient (ink to teal) is the choice when a page already has a warm element near the asset.

## Typography

Three families, one job each (P2).

- **Poppins** (`fonts.heading`), weight 600: headings and display. Tracking `-0.025em` at `xl` and above. Sentence case. Never all caps, never italic.
- **Instrument Sans** (`fonts.body`), 400 with 600 for emphasis: everything people read at length. Line height 1.625.
- **Monaspace Xenon** (`fonts.mono`): code, and the small uppercase label at `xs` to `sm`, weight 500, tracking `0.1em`. Labels are the only uppercase text in the system.

Rules:

- **T1** At most three text levels per artefact: label, title, metadata. Pages may add body and code.
- **T2** Type is left-aligned on the left margin. Centred text only for a single line in a square format (avatar).
- **T3** The title is the largest thing in the composition after the feature block, and it is big: on a 1200 by 630 card, 84 to 92px on two lines.
- **T4** Labels carry facts, not slogans: content type, number, section, date, reading time. Separate facts with a middle dot.
- **T5** Prose measure is `sizes.prose`, about 65 to 75 characters.
- **T6** No text effects: no outlines, shadows, gradients or stretched letterforms.

## Layout

Two layouts. Both are a strict stack of horizontal zones divided by rules.

**`sign`** (default). From the top:

1. A band: ink, full width, flush with the top edge, about 4% of the height.
2. A header row: one route bullet (a red disc with a single paper letter for the content type) followed by two label lines.
3. A rule.
4. The body: title on the left; optionally one feature block on the right, running exactly from the upper rule to the lower rule and flush with the right margin.
5. A rule.
6. A footer row: wordmark, then metadata, then the key at the right margin.

**`ledger`**. A 2px ink frame inset from the edges, divided by two horizontal rules and one vertical rule into six cells. Label cells top and bottom, the title in the large cell, the feature block filling the middle-right cell edge to edge, and one small red square as the only marker. Ground is concrete.

Rules:

- **L1** Space comes from the token scale only (4px base). Margins are generous: 6% of the width in artwork; on pages at least `6` on small screens and `16` from `lg` up.
- **L2** Rules are 2px in ink and run the full content width. Structure is rules first, then space. Do not use tints or shadows to separate zones in artwork.
- **L3** Everything aligns to the left margin, the right margin, or a rule. Nothing floats.
- **L4** The text zone is at least 60% of the width. The feature block is at most 30% and never touches text.
- **L5** One feature block per composition. A composition with no feature block is complete; do not add one to fill space.
- **L6** On pages, the same grammar applies at lower volume: a rule above a section label, hairlines (`border.default`) between items, space doing most of the work.

## Elevation & Depth

Flat.

- **E1** No shadows on artwork, cards, callouts or buttons.
- **E2** Token shadows (`shadows.md` and up) are for things that float over the page: menus, popovers, dialogs, toasts.
- **E3** In artwork, layering is flat overlap only, one piece over one ground, with no transparency.

## Shapes

- **S1** Artwork has square corners: bands, rules, blocks, tiles and pieces are not rounded. A disc is a circle; everything else has hard corners.
- **S2** In the interface, controls use `radii.sm` (4px) and cards, callouts and panels use `radii.md` (8px). `radii.lg` and `radii.xl` are for rare emphasis only. Pills and avatars use `radii.full`.
- **S3** Rules and borders: 1px hairlines on pages, 2px for rules and frames in artwork, 4px for a callout edge.
- **S4** Icons are Lucide, stroke 1.5 at 16 to 20px and 2 at 24px and up, in the text colour. Icons are interface, not illustration.

## Components

- **Button**: primary is solid `brand.solid` with white text; secondary is ink text with a hairline border; `radii.sm`; one primary per view.
- **Label**: uppercase mono, `fg.default` for the first fact and `fg.subtle` for the rest (T4).
- **Card**: white on paper with a hairline border, `radii.md`, padding `6`. No shadow (E1). Optional artwork fills the top, edge to edge, above a rule.
- **Callout**: a tint ground with a 4px left edge in the matching accent, `radii.md`, padding `6`. It may carry a noise gradient at the right edge that fades to the tint before the text (A4), with at most one small piece anchored in the corner.
- **Banner**: a `sign` or `ledger` composition with no baked-in text; the page sets the title in HTML. One per page, at the top.
- **Code block**: `bg.subtle`, hairline border, `radii.md`, mono at `sm`. Syntax colours come from the token hues at the 700 step; keep it quiet.
- **Menu and controls**: hairline borders, `radii.sm`, `shadows.md` when floating. Focus ring is 2px `border.focus` with a 2px offset.

## Graphics

The kit lives in `packages/brand-graphics`. Sources are single-colour SVG using `currentColor`; the composer colours them from tokens.

| Part | What it is |
| --- | --- |
| Pieces | Disc, quarter-disc, half-disc, triangle, square. Solid, flat, square-cornered. These are the working set; the other shapes in `src/shapes` are reserve. |
| Bullet | A disc carrying one letter. Marks the content type. |
| Key | Two or three pieces of one size on one baseline. |
| Weave | One piece, small, tiled on a square grid in the ground colour over a noise gradient. |
| Noise gradient | Two colours dissolving into each other through fine stipple. `grain` runs corner to corner; `stipple` runs from one edge. |
| The civilian | Disc, square and two bars snapped into a person. The brand mark. |

Rules:

- **G1 Module.** Every composition has a module `u` (the short side divided by 6). Pieces, tiles, margins and the band are sized in fractions of `u`.
- **G2 Transforms.** A piece may be moved, uniformly scaled, mirrored and turned in quarter turns. Never tilt, stretch, skew, outline or round it.
- **G3 The key.** Two or three different pieces, all `u / 2.6` high (40px on a 630px card), on the footer baseline, flush with the right margin, with a gap of a third of their size. First piece ink, then one or two accents. The key is the only place loose shapes appear.
- **G4 The bullet.** One per composition, in the header row, red with a paper letter. Diameter about `0.7u`.
- **G5 The feature block.** A rectangle bounded by rules or cell edges. It holds exactly one of:
  - **grain**: a noise gradient between two colours of one scheme, plus one large piece (a quarter-disc) in ink, anchored exactly in a corner of the block with its centre on that corner; or
  - **weave**: a noise gradient running top to bottom, covered by one small piece tiled edge to edge in the ground colour, so the gradient shows only through the gaps, like houndstooth. Tiles are a whole number across and down (8 to 12 across); right triangles by default.
- **G6 Noise gradients.** Always stippled, never smooth. Two colours only: ink into one accent, or a light accent into a darker one of the same family. The grain is fine, static and the same scale everywhere in a composition. Outside a feature block, a noise gradient may be used alone as a section texture or callout edge, starting from an edge and fading to plain ground before any text.
- **G7 No loose marks.** No squiggles, zigzags, sparks, confetti or terrazzo. The line marks and pattern tiles in the kit are not used in this direction.
- **G8 The civilian.** Always upright and the same proportions. It appears with the wordmark on profile artefacts and as the avatar. Other pieces never attach to it.
- **G9 Reproducible.** Generated assets record `layout`, `scheme`, `feature` and `seed` in the file name or metadata. Do not hand-tweak generated output; change the inputs.

Composer inputs:

- `layout`: `sign` or `ledger`.
- `scheme`: `paper`, `concrete` or `night`.
- `feature`: `none`, `grain` or `weave`.
- `seed`: chooses the gradient pair (from the scheme's list), the weave piece and quarter turn, and the order of the key. Never a position or a size.

## Artefacts

| Id | Artefact | Size | Notes |
| --- | --- | --- | --- |
| A1 | Open Graph image | 1200 by 630 | `sign` or `ledger` with label, title of up to two lines, wordmark and metadata. Feature block optional. Rasterised to PNG with embedded fonts. |
| A2 | Article banner | 1600 by 600, scalable | The same layout with no text: band, rules, feature block, key. The page sets the title in HTML. |
| A3 | Profile banner | 1500 by 500 | `sign` with the wordmark as the title and the civilian in place of the feature block. Keep the bottom-left 200px clear for the avatar. |
| A4 | Callout background | fluid | A `stipple` gradient from the right edge, at most 240px wide, fading to the tint before the text. |
| A5 | Avatar | 400 by 400 | The civilian on paper or ink; survives a circular crop. |
| A6 | Section texture | fluid | A noise gradient or a weave with no text and no pieces, for wide page sections. |

## Do's and Don'ts

- Do start with paper, ink, a band and two rules, then decide whether anything else is needed.
- Do let the title be large and the space around it larger.
- Do keep colour to the bullet, the key and one feature block.
- Do make every repeat exact: whole tiles, one size, one turn.
- Do read every value from the tokens.
- Don't use a colour ground, more than two accents, or anything that reads as cheerful first.
- Don't scatter, stack or enlarge shapes outside the feature block.
- Don't use smooth gradients, shadows, outlines, transparency or rounded corners in artwork.
- Don't put text on a shape, a weave or a gradient.
- Don't add squiggles, confetti, patterns or icons as decoration.
- Don't write a hex value in this file's prose, in a composer, or in an agent instruction file.
- Don't fill space because it is empty.
