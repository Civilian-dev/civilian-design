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
  magnet-red: "#f25855"
  magnet-gold: "#fede8f"
  magnet-salmon: "#fea993"
  magnet-violet: "#7366bd"
  magnet-teal-deep: "#1c6b69"
  magnet-violet-light: "#c9c4fe"
  ground-salmon: "#fea993"
  ground-gold: "#fede8f"
  ground-mint: "#a8d6d8"
  ground-plum: "#2e215d"
  tone-salmon: "#fea993"
  tone-terracotta: "#d3765f"
  tone-mustard: "#b68e0a"
  tone-teal: "#54a2a6"
  tone-violet: "#7366bd"
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
- **P4 Few inks, strong pairs.** A composition uses one flat ground, the ink and at most three accent colours. Pair a warm with a cool and a light with a dark so the colours hold each other up; pastel on pastel looks washed out. Colour is printed, not lit: no glow, no gloss, no neon.
- **P5 Plain speech.** Say it in everyday words, at a readable size, once. Labels tell people where they are; headings tell them what they get.
- **P6 Bold line, light touch.** Line marks have one weight and round ends. Use at most one burst of energy (a spark, a squiggle) per composition, next to the thing that matters.
- **P7 Ordered, not scattered.** Pieces sit on a grid and follow one rule a viewer could name: a repeat, a quarter turn, a mirror, a sequence. Nothing is placed at random. A seed only chooses which rule and which colours, and the same recipe, scheme and seed always give the same result.

### Not nerdy

Banned motifs, in any medium: code brackets and `</>` glyphs, terminal windows and prompts, binary, circuit boards, node-and-edge "network" art, robots, glowing gradients on black, isometric server racks, matrix rain, hexagon grids, 3D blobs. Code appears only as actual code in a code block.

## Colors

Everything maps to an existing token. Names in brackets are the token paths in `packages/design-tokens`.

- **Paper** `#fdfbf8` (`bg.canvas`): the default ground for pages and artwork.
- **Ink** `#01343a` (`fg.default`, `bg.inverse`): all text on light grounds, all line marks, the inverse ground, and the darkest magnet ink.
- **Primary** `#1c6b69` (`brand.solid`): links and the main action.
- **Magnet inks** (the accent colours): red `#f25855` (`red.500`), gold `#fede8f` (`gold.300`), salmon `#fea993` (`salmon.300`), violet `#7366bd` (`violet.500`), deep teal `#1c6b69` (`teal.700`) and the ink. Light violet `#c9c4fe` (`violet.300`) is for dark grounds.
- **Colour grounds** (artwork only, never page backgrounds): salmon `#fea993`, gold `#fede8f`, mint `#a8d6d8` (`teal.300`), plum `#2e215d` (`violet.900`) and the ink.
- **Tones** (textures and halos): the ground's own hue one step along, so texture reads as print, not as another colour. Salmon on paper, terracotta `#d3765f` (`salmon.500`) on salmon, mustard `#b68e0a` (`gold.500`) on gold, teal `#54a2a6` (`teal.500`) on mint and ink, violet on plum.
- **Tints** (`*.subtle`): callout and section grounds only.

Rules:

- **C1** Body and heading text is the scheme's ink on its ground: ink on paper, tint, salmon, gold or mint; paper on ink or plum. No coloured text except links (primary) and status messages.
- **C2** A composition uses exactly one scheme from the table below: a flat ground, the ink, three magnet inks, a block colour and a tone (P4). Do not mix by hand.
- **C3** Gradients exist only as ground textures (G7). Never on text, magnets, buttons or borders.
- **C4** Text never sits on a magnet, a pattern, a block or a textured area. Keep it on plain ground, or put a solid plate under it.
- **C5** Text contrast is at least 4.5:1 (3:1 for display sizes). Every ground in the table passes with its ink. Red is never a text ground (ink on red is about 4:1); it is a block or a magnet only.
- **C6** Dark theme uses the dark token set. Artwork for dark pages uses the `night` or `plum` schemes, not inverted light artwork.
- **C7** The first magnet ink in a scheme has the most contrast with the ground and carries the main shape. Never let the main shape be the ink closest to the ground in lightness.

Schemes for graphics (each pairs warm with cool and light with dark):

| Scheme | Ground | Ink | Magnet inks, most contrast first | Block | On the block | Tone |
| --- | --- | --- | --- | --- | --- | --- |
| `paper` | paper | ink | red, deep teal, gold | ink | gold, red | salmon |
| `press` | salmon | ink | ink, red, gold | red | ink, gold | terracotta |
| `sun` | gold | ink | violet, ink, red | violet | gold, ink | mustard |
| `mint` | mint | ink | ink, red, gold | ink | mint, gold | teal |
| `night` | ink | paper | salmon, gold, red | deep teal | gold, salmon | teal |
| `plum` | plum | paper | gold, salmon, light violet | violet | gold, plum | violet |

The block is the flat colour behind a tile panel or a band. `paper` is the everyday default; use a colour ground when the artefact is a cover (Open Graph image, banner, avatar).

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
- **Callout**: a tint ground with a 4px left edge in the matching magnet ink, `radii.lg`, padding `6`. Default is salmon; note is violet; tip is gold. It may carry a callout background from `brand-graphics` at the right edge (A4), never behind its text. Callout artwork stays in one hue: the tint (step 50) as ground, step 300 for the texture and step 500 for the motif.
- **Banner**: one scheme ground with its ink for text and one composed graphic. One per page, at the top.
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

Shapes are used the way a transit sign uses them: few, large, aligned and repeated on purpose. Playful shapes do not mean a haphazard layout.

Rules:

- **G1 Module.** Every composition has a module `u` (the short side divided by 6 unless a recipe says otherwise). Pieces are sized in modules and sit on a grid of square cells. Margins are `u / 2` or more.
- **G2 Transforms.** A piece may be moved, uniformly scaled, mirrored, and turned in quarter turns. Never tilt, stretch, skew, outline, or round it differently.
- **G3 On the grid.** Every piece fills a cell or is anchored exactly to a corner or edge of the canvas. Neighbours sit edge to edge with a gap of one thirtieth of the cell. Nothing floats, tilts or half-overlaps.
- **G4 Anchor and bleed.** A motif may run off the canvas only from an anchor: a quarter-disc's centre sits exactly on the corner, a panel is flush with the edge, a band is centred so both ends crop the same.
- **G5 One motif.** A composition has one graphic idea: a corner, a row, a panel or a band. Graphics cover at most 40% of a canvas, and an artefact with text keeps at least half its area plain. At most one mark, one pattern and one texture.
- **G6 Marks.** Stroke weight is `u / 10`, in the scheme's ink. A spark sits next to exactly one piece, and is the only mark in the composition.
- **G7 Textures.** A texture belongs to the ground: it uses the scheme's tone, starts from an edge or corner, and fades to plain ground before it reaches the text zone. Grain is fine, static and monochrome.
- **G8 Patterns.** A pattern fills a simple region (a halo behind a corner motif, a cell, a band) in one colour, usually the tone. Prefer the regular tiles (dots, plus); keep tile scale constant within a composition.
- **G9 The civilian.** The figure is the brand mark. It is always upright and always the same proportions: head, body, two legs. Other pieces never attach to it.
- **G10 Reproducible.** Generated assets record `recipe`, `scheme` and `seed` (in the file name or metadata). Do not hand-tweak generated output; change the recipe or the seed.
- **G11 One rule.** A repeat follows one rule that can be said in a sentence: the same piece turning a quarter each step; two pieces alternating; four cells meeting to make one figure; a row of discs like route bullets. Colour follows the same rule (alternate, or one colour per figure). If the rule cannot be said, simplify.

Recipes in the composer:

- `corner`: one motif anchored exactly in a corner (a quarter-disc, nested rings, an arc, a stair or a wedge) over a halo of stipple or dots in the tone. The default for Open Graph images, and the same idea as the callout background.
- `row`: four or five pieces of one size on one baseline, following one rule: discs in different inks, one piece turning a quarter each step, two pieces alternating, or half-discs making a wave.
- `tile`: a full-height panel on the right edge in the block colour, filled with one symmetric repeat in two inks, like the cover of a paperback. For covers, banners and the profile banner.
- `band`: a frieze along the bottom edge in the block colour: one two-cell figure repeated and centred. For section headers, footers and the profile banner.

## Artefacts

| Id  | Artefact           | Size                  | Notes                                                                                                                                    |
| --- | ------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Open Graph image   | 1200 by 630           | Kicker, title of up to three lines, `civilian.dev` footer with the mark. Graphics zone is the right 40%. Keep text inside a 60px margin. |
| A2  | Article banner     | 1600 by 600, scalable | No text baked in; the page sets the title in HTML.                                                                                       |
| A3 | Profile banner | 1500 by 500 | Wordmark and the civilian with a `tile` panel or a `band`; keep the bottom-left 200px clear for the avatar overlap. |
| A4  | Callout background | fluid                 | Anchored to the right edge, at most 240px wide, fades to the tint before the text.                                                       |
| A5  | Avatar             | 400 by 400            | The civilian on a flat ground; survives a circular crop.                                                                                 |
| A6  | Section texture    | fluid                 | A texture with no pieces, for wide page sections.                                                                                        |

## Do's and Don'ts

- Do start with paper, ink and space, then add one composed graphic.
- Do pick a named scheme and a recipe, and vary the seed for variety.
- Do keep text on plain ground with a clear left edge.
- Do use the kicker pattern to say where the reader is.
- Do anchor a motif to a corner or an edge and let it run off; it makes the page feel larger.
- Do pair a warm with a cool and a light with a dark.
- Don't use more than three magnet inks, or any colour that is not a token.
- Don't scatter, tilt or stack pieces without a rule. Playful shapes still line up.
- Don't put pastel on pastel; if the main shape does not stand out from the ground at a glance, change scheme.
- Don't put gradients, shadows, outlines or transparency on magnets or type.
- Don't stretch, skew or redraw pieces, or invent a one-off illustration.
- Don't decorate with icons, code glyphs or anything on the banned list.
- Don't fill space because it is empty.
- Don't centre body text, set headings in capitals, or use more than three text levels in an artefact.
