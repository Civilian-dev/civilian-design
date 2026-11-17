---
version: alpha
name: Civilian Dev
description: Plain, spacious and useful. Ink on paper, one framed card at the top of each page, and open space for reading.
colors:
  primary: "#1c6b69"
  primary-hover: "#01343a"
  ink: "#01343a"
  paper: "#fdfbf8"
  surface: "#ffffff"
  concrete: "#e0e6e7"
  secondary: "#7366bd"
  tertiary: "#fea993"
  highlight: "#fede8f"
  signal: "#f25855"
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
typography:
  display:
    fontFamily: Poppins
    fontSize: 2.75rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading-xl:
    fontFamily: Poppins
    fontSize: 1.75rem
    fontWeight: 500
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
    fontFamily: Instrument Sans
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.1em
  code:
    fontFamily: Monaspace Xenon
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  sm: 4px
  md: 8px
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
  prose: 672px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
  label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.concrete}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: 24px
  callout:
    backgroundColor: "{colors.tint-salmon}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 24px
  callout-tip:
    backgroundColor: "{colors.tint-gold}"
    textColor: "{colors.ink}"
  callout-note:
    backgroundColor: "{colors.tint-teal}"
    textColor: "{colors.ink}"
  callout-info:
    backgroundColor: "{colors.tint-violet}"
    textColor: "{colors.ink}"
  code-block:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: 16px
---

# Civilian Dev

The brand guide for the Civilian Dev site, articles, profile and generated assets, in the [DESIGN.md format](https://github.com/google-labs-code/design.md).

**How to read it.** Three sources, one job each:

- **Tokens** (`packages/design-tokens`, built from Figma) hold every value. This guide names tokens and never gives a value; the YAML above is generated from the tokens by `pnpm build` for tools that read this format, and is never edited by hand.
- **This guide** holds intent and limits: what each thing is for, and how far it may go.
- **The specimens** (`docs/brand-seeds`) show how everything looks, in light and dark. Copy markup and `seeds.css` from them instead of rebuilding from this text. Open them in any PR preview, or locally with `python3 -m http.server` at the repo root.

When something is not covered, use the nearest specimen and report the gap. Do not invent a new element, colour, size or pattern.

## Overview

Civilian Dev makes technology for people who would rather get on with their day. It should feel like a well-made public sign or a good paperback: plain, exact and calm, with a little warmth. It should never feel like a terminal, and never like a party.

Every page has three layers, and each is made differently. Hierarchy comes from that contrast, not from decoration.

| Layer      | What it is                                                                                                                                                    | Its job      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Window** | The site header and footer. They span the screen on the page ground. The footer ends with a pattern strip running edge to edge.                               | Where you are |
| **Card**   | The one framed component: a 2px ink frame of cells on its own ground. The same component is the Open Graph image and the top of every page.                   | What this is |
| **Body**   | Reading space at prose measure, left-aligned with the card. Separated by space.                                                                               | The content  |

Structure belongs to the window and the card, so the body can be open.

### Rules

When two rules pull against each other, the lower number wins.

1. **Tokens only.** Every colour, size, font and radius is a token. No hex values, no in-between sizes.
2. **Text stays readable.** Contrast at least 4.5:1 (3:1 at display sizes). Text never sits on a pattern, a shape or noise.
3. **One card, at the top.** The card is the only framed thing on a page.
4. **Space, not rules.** In the body, separate things with space. The only rules are in the card frame and in tables.
5. **Ink does the work.** Text and structure are ink on the ground. Colour is rationed to the bullet, the key, patterns and callouts.
6. **Red is the signal.** Red appears in the bullet, at most one piece of the key, the pull-quote mark and inside patterns. Nowhere else.
7. **Patterns only where the placement table allows.** One feature per view.
8. **Square artwork.** Frames, cells, tiles and blocks have square corners. A disc is a circle.
9. **One rule per repeat.** Anything that repeats follows one rule you could say in a sentence. A seed chooses among allowed options, never a position or a size.
10. **Labels are the only uppercase text.**
11. **Plain speech.** Everyday words, said once. Labels carry facts, not slogans.
12. **Nothing nerdy.** No code brackets, terminals, circuit boards, network graphs, robots or glowing gradients. Code appears only as code.

## Colors

Names are token paths. Use semantic roles on pages; the primitives below appear only where a role does not exist yet.

- **Ground:** `bg.canvas`. Paper in light, a deep neutral in dark.
- **Card ground:** `bg.emphasized` (concrete) in light, `bg.default` in dark. Always different from the page, so the card sits apart.
- **Ink:** `fg.default` for text, rules and the card frame; `fg.subtle` for secondary facts.
- **Interface:** `brand.*` for links and the main action; `border.*` for hairlines; `info.*`, `success.*`, `warning.*`, `danger.*` for status.
- **Signal:** `red.500` (rule 6).
- **Warmth:** `accent.solid` (salmon) and `highlight.solid` (gold), in the key, patterns and callouts.
- **Callouts:** in light, the hue's step 50 as the tint and step 300 for the edge and the noise. In dark, the ground is `bg.default` and the edge and noise use step 700.

Dark mode uses the dark token set through the same roles. Artwork reads the same roles, so it needs no separate dark version.

## Typography

Three faces, one job each.

- **Poppins**, weight 600 (`fonts.heading`): headings and the card title. Tight tracking at `xl` and above. Sentence case.
- **Instrument Sans** (`fonts.body`): everything people read, at 400 with 600 for emphasis. Labels use the `label.overline` text style (600, wide tracking) set in uppercase.
- **Monaspace Xenon** (`fonts.mono`): code and file paths only.

An artefact has at most three text levels: label, title, facts. Pages add body text. Prose measure is `sizes.prose`. Type is left-aligned. No outlines, shadows or gradients on text.

## Layout

- Space comes from the token scale. Related items sit `2` to `4` apart, blocks `8` to `12`, sections `16` to `24`.
- The window header and footer span the screen, with a side margin of `6` on small screens rising to `16`. The card and body sit in a centred container of `sizes.6xl` with the same margin.
- The body is `sizes.prose` wide and shares the card's left edge.
- Below about 40rem the card stacks its cells in one column and drops its feature.

## Elevation & Depth

Flat. No shadows on the card, callouts, code or buttons. Token shadows are for things that float over the page: menus, popovers, dialogs and toasts.

## Shapes

- Artwork is square (rule 8). Callouts and code blocks are square too.
- Controls (buttons, inputs, menus) use `radii.sm`. Pills and avatars use `radii.full`.
- Rules are 1px hairlines in `border.default`, 2px in ink for the card frame and table heads, 4px for a callout's edge.
- The pieces are disc, quarter-disc, half-disc, triangle and square, in `packages/brand-graphics/src/shapes`. They may be moved, scaled, mirrored and turned in quarter turns. Never tilted, stretched or outlined.
- Icons are Lucide, in the text colour, stroke 1.5 up to 20px and 2 above. Icons are interface, not illustration.

## Components

Each has a specimen with a `data-seed` name in `docs/brand-seeds`.

- **Card** (`card`): a frame of six cells. Top row: the bullet (a red disc with one letter for the content type) and the kind; then the section, or the wordmark when the card stands alone. Middle: the title, and an optional feature cell on the right. Bottom row: facts, and the key (three pieces, ink first). No band above it.
- **Window header** (`window-header`): wordmark left, navigation labels right.
- **Window footer** (`window-footer`): the pattern strip, then the wordmark, links and a quiet line, aligned with the header.
- **Callout** (`callout`, `callout-tip`, `callout-note`, `callout-info`): an aside on a tint with a 4px edge in its hue, and soft pattern art at the right. Salmon is the default; gold for tips, teal for notes, violet for information.
- **Pull quote** (`pull-quote`): the author's own words, in the heading face after a small red square. No tint and no art, so it never reads as a callout.
- **Lists** (`list-unordered`, `list-ordered`, `list-terms`): a small ink square; a two-digit numeral in the label style; terms as labels beside their meaning.
- **Index and attachments** (`index`, `attachments`): a label, then rows separated by space. Paths in the code face.
- **Table** (`table`): label heads over a 2px rule, hairlines between rows, figures in tabular numerals. No fills.
- **Code block** (`code`): `bg.subtle` with a hairline border.
- **Diagram** (`diagram`): ink boxes with 2px strokes on the ground, square corners, one filled box for the output. Keep to one line of steps with a single place where it fans out. Draw it with Mermaid and `mermaidTheme()` from `@civilian-dev/brand-graphics`, and mark the output `:::output`.
- **Buttons and controls:** the primary is `brand.solid` with its contrast text, one per view; the secondary is ink text with a hairline.

## Patterns

A pattern is always the same thing: one tile repeated on a square grid in the colour of the surface it sits on, over a two-colour noise gradient, so the noise shows only through the gaps. See `patterns.html`. Make patterns with `pattern()` and `calloutArt()` from `@civilian-dev/brand-graphics` and load its `patterns.css`; never draw one by hand. Its README says how to size and colour each one.

| Dial     | Options                                                                     |
| -------- | --------------------------------------------------------------------------- |
| Tile     | triangle, quarter-disc, half-disc, disc, check; or none, for grain           |
| Turn     | quarter turns                                                               |
| Scale    | whole tiles across the region: fine, regular or coarse                      |
| Gradient | down, diagonal, or from one edge                                            |
| Pair     | ink into red (default), ink into teal (beside other warm colour), salmon into red |
| Noise    | crisp in artwork; soft on interface surfaces                                |

Grain is the gradient with no tile and one ink quarter-disc anchored in the corner.

**Where patterns go.** Nowhere else.

| Element | Pattern | Extent |
| --- | --- | --- |
| Card | One feature cell: a tiled pattern or grain, crisp noise | The feature cell, whole tiles |
| Footer | One strip, crisp noise | Three tile rows, edge to edge |
| Callout | A fine tile in the tint over a soft fade from the right edge | At most 240px and a third of the callout, gone before the text |
| Everything else | None | |

## Theme contract

What a derivative theme (a new site, a deck, a PDF) may change.

| Fixed | Bounded: choose from the stated options | Free |
| --- | --- | --- |
| The three layers, the rules above, type roles, rule widths, the card's cells, where patterns go | Light or dark; pattern dials; callout hue; bullet letter; whether the card has a feature | Content, wordmark text, section names, navigation, which components a page uses |

## Artefacts

All are the card or a part of it.

- **Open Graph image:** the card at 1200 by 630, with the wordmark in the top-right cell.
- **Article header:** the card at page width, with the section in the top-right cell.
- **Profile banner:** 1500 by 500, the card with the wordmark as the title. Keep the bottom-left 200px clear for the avatar.
- **Avatar:** the civilian (`src/mark`) on the ground, 400 by 400, safe for a circular crop.
- **Print:** A4. The card prints; the window navigation and footer strip do not. Callouts, figures, table rows and code never split across pages.

## Do's and Don'ts

- Do start from a specimen and change only what the theme contract allows.
- Do let the title be big and the space around it bigger.
- Don't add a second framed box, a band, or rules between sections.
- Don't put shapes in callouts or anywhere outside the card's key and feature.
- Don't use colour grounds for pages, or more than two warm colours together.
- Don't fill space because it is empty.
