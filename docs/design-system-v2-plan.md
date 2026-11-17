# Design system v2: plan

Plan for the next version of the Civilian design system packages. Written 17 Nov 2026. It replaces stages 4 to 7 of [`brand-plan.md`](brand-plan.md); stages 0 to 3 there stay as the record of how the system got here.

Status key: `[x]` done, `[~]` started, `[ ]` not started. Update the boxes as PRs land.

## Goal

One focus: **an agent given the guide, the tokens and the packages can build a derivative theme that stays on-brand without being corrected.**

A derivative theme is a new expression of the system for a new surface: an article site, a docs site, a slide deck, a PDF. Version 1 was tested this way twice (an article rendered to HTML and PDF, and the live article theme on `civilian-site`), and both drifted. The drift was not carelessness. In every case the agent hit one of four gaps and filled it by guessing.

| Gap                                                                                                           | What the agent did                                                                                                      | Fix in v2                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Two styles to choose from** (`sign`, `ledger`) and three schemes                                            | Mixed them: a `sign` header with its own footer contents, and a `night` band on a page whose ground is a different dark | One style, one layout grammar, grounds that follow the page                        |
| **The guide and the tokens disagree** (heading weight, label style, violet)                                   | Followed whichever it read last                                                                                         | Settle each in Figma or the guide, then check them against each other in the build |
| **Elements the guide never mentions** (index, lists, attachments, pull quote, table, diagram, print)          | Invented them                                                                                                           | An element catalogue with a seed for each                                          |
| **Values and patterns that exist only as prose or as private code** (rule widths, the weave, the callout art) | Hardcoded the values and rebuilt the patterns                                                                           | Tokens for the values; an exported pattern library with CSS                        |

Everything below serves one of those four fixes.

## Evidence

### The live article theme

Reviewed at `localhost:5173/articles/architecture-research-skill/` in both themes, by reading computed styles from the rendered page. The site's source was not read, so the causes are inferred from the page.

| What the page does                                                                                     | Rule it departs from                                                                                               | Why it happened                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Labels (overline, facts, table heads, "On this page", "Attachments") are Instrument Sans 600 uppercase | Typography: labels are Monaspace Xenon 500, the only uppercase text                                                | The `label.*` token text styles are Instrument Sans, so following the tokens gives the wrong label |
| Title is 44px at weight 500, small beside the feature block                                            | T3 (the title is big), Typography (600)                                                                            | `heading.display` and `heading.h1` tokens are 500                                                  |
| The header is `sign`, but its footer row holds the standfirst, not the wordmark and metadata           | Layout, `sign` step 6                                                                                              | The guide describes a card, not a page header, so the page had to adapt it                         |
| Gold band above a neutral dark page                                                                    | C3 allows the gold band only with the `night` scheme, whose ground is a different colour from the dark page ground | `night` is built from primitives, the dark theme from semantic tokens                              |
| The weave is rebuilt in the page as elements with their own CSS                                        | G5; nothing exported produces a weave for HTML                                                                     | `brand-graphics` only emits whole SVG compositions                                                 |
| Pull quotes are styled as callouts (tint, 4px edge, stipple art)                                       | No pull-quote element exists                                                                                       | Missing element                                                                                    |
| Tables use filled alternate rows                                                                       | L6 (hairlines between items, space doing the work)                                                                 | No table element in the guide                                                                      |
| An "Attachments" index with hairlines and mono paths                                                   | Nothing: it is invented, and it is good                                                                            | Missing element. Worth adopting                                                                    |
| Callout art differs between light and dark, and the same art repeats down the page                     | A4; `calloutBackground` varies only by hue                                                                         | Light-only art, and the seed does not change the composition                                       |

The same weave now has three separate implementations: the composer, the site's CSS, and the Design System cover in `claude-design-system`. That is the clearest sign a shared pattern library is missing.

### Feedback from the article build

The numbered feedback (items 1 to 19) from the session that built an article theme is addressed item by item in [Traceability](#traceability). What it said worked is kept as is: semantic roles per theme, `resolved.json`, determinism with inputs in the file name, the scheme table mapping to custom properties, and `sizes.prose`.

## The v2 design

Settled in review on 17 Nov 2026. Open questions are not listed here: they are on the decisions page (see [Decisions](#decisions)).

### Three layers

| Layer      | What it is                                                                                                                                                                            | Its job       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Window** | The site header and footer. They span the screen on the page ground. The footer ends with a pattern strip running edge to edge.                                                       | Where you are |
| **Card**   | The one framed component: a 2px ink frame of cells, on its own ground (concrete in light, a lighter dark in dark). The same markup is the Open Graph image and the top of every page. | What this is  |
| **Body**   | Reading space at prose measure, left-aligned with the card. Separated by space; the only rules are in tables.                                                                         | The content   |

Structure is concentrated in the window and the card so the body can be open. Hierarchy comes from the contrast between the three, not from rules everywhere.

The card takes its layout and colour from `ledger` (frame, cells, concrete, ink doing the work) and its highlights from `sign` (bullet, key, weave feature, wordmark). There is no top band. One cell changes with context: on its own the top-right cell carries the wordmark; on a page, where the window already has it, the section.

### Patterns are one idea with a few dials

A pattern is always the same construction:

> one tile, repeated on a square grid in the colour of the surface it sits on, over a two-colour noise gradient, so the noise shows only through the gaps.

| Dial     | Options                                                                               |
| -------- | ------------------------------------------------------------------------------------- |
| Tile     | none (grain, with one anchored piece), triangle, quarter-disc, half-disc, check, disc |
| Turn     | quarter turns only                                                                    |
| Scale    | fine, regular, coarse (whole tiles across the region)                                 |
| Gradient | down, diagonal, from one edge                                                         |
| Pair     | from the theme's list of allowed colour pairs                                         |
| Noise    | crisp in artwork (card, footer strip); soft on interface surfaces (callouts)          |

The seed chooses among allowed settings, never a position or a size. Patterns ship as a function for rasters and PDFs, and as CSS driven by custom properties for pages, so dark mode needs no second set of art. The seeds already work this way with inline SVG; PR 6 checks whether CSS masks render the noise in all three browser engines and in print.

### Where patterns go

This table goes at the top of the Graphics section of `DESIGN.md`, in the package README and in the Claude skill, word for word.

| Element                   | Pattern                                                                          | Extent                                                         | Never                 |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------- |
| Card                      | One feature cell: a tiled pattern, or grain with one anchored piece. Crisp noise | The feature cell, whole tiles                                  | A pattern behind text |
| Footer                    | One strip. Crisp noise                                                           | Three tile rows, edge to edge                                  | Content over it       |
| Callout                   | A fine tile in the tint over a soft noise fade from the right edge               | At most 240px and a third of the callout, gone before the text | Pieces                |
| Anything else in the body | None                                                                             |                                                                | Any pattern or piece  |

### A theme contract

`DESIGN.md` sorts every choice a derivative theme can face into three groups, so an agent knows what it may change. The same contract becomes a typed `defineTheme()` in `brand-graphics`.

| Group       | Meaning                   | Examples                                                                                                 |
| ----------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Fixed**   | Never changes             | The three layers, type roles, ink on ground, rule widths, square artwork, label style, where patterns go |
| **Bounded** | Choose from a stated list | Theme, pattern dials, callout hue, bullet letter                                                         |
| **Free**    | Yours                     | Content, wordmark text, section names, which elements a page uses                                        |

### Specimens, not descriptions

Every element a page can contain has a built specimen in `docs/brand-seeds`, previewed on every PR, and each element carries a `data-seed` name. The specimen is the reference for appearance: the guide states intent and limits and links to it, rather than describing it in words.

## Decisions

**Design questions live in one list:** `decisions.html` in the seeds, with the options side by side, previewed on every PR. Its source is `OPEN` and `DECIDED` in `packages/brand-graphics/scripts/seeds.ts`. Do not copy the list into this file or a PR description; link to it.

Technical calls, made without asking:

- **Fonts:** a new published package, `brand-fonts`, with the files, their licences and an `@font-face` stylesheet. `claude-design-system` uses it instead of its own copies.
- **Element CSS:** stays the seeds' reference stylesheet until a second site needs it as a package.
- **Dark grounds:** no `night` scheme. Artwork reads the dark semantic tokens.
- **`src/reserve`:** all five pattern tiles are already in `src/shapes`, so the folder is deleted in PR 6.

## Review, round 4

The first unified seeds (17 Nov) were judged against the brand's intent: simple, spacious, professional, not nerdy. Some problems were the direction; others were rules that stopped the right direction.

| Problem                                         | Cause                                                                               | Change                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Article headers less striking than the card     | The frame was "opened out" into rules for pages, losing the card                    | The card is the header, everywhere                                                                |
| Pages read like a table                         | The guide required full-width rules on pages too (P3, L6)                           | Rules live in the card and tables; the body uses space                                            |
| Callouts noisy and the shapes looked accidental | The guide allowed one loose piece in a callout; noise only came crisp and saturated | No pieces in callouts; a fine tile in the tint over soft noise; dark callouts on a neutral ground |
| No clear hierarchy                              | Header, sections and footer were all made the same way                              | Three layers, each made differently                                                               |
| Decisions hard to judge                         | The same list in three places, with ids and abstract wording                        | One decisions page with the options side by side                                                  |

What stays: the brutalist card, ink and paper doing the work, rationed warmth, square artwork. The tension between "verging on brutalist" and "spacious and calm" is resolved by giving each to a different layer rather than averaging them everywhere.

## Token changes (Figma)

Only you can make these; the sync PR follows. Until then `brand-graphics` exports constants with the same names.

- Text styles: `heading.display` and `heading.h1` to weight 600. Labels need no change: `label.overline` is already Instrument Sans 600 with `0.1em` tracking, and CSS sets the uppercase.
- `borderWidths`: `hairline` 1px, `rule` 2px, `edge` 4px.
- `sizes.art`: the callout art cap (240px today).
- A description on every semantic role, so the skill stops falling back to naming hints.

Graphics constants that are not design tokens (the module divisor, the margin as a share of width, tile counts) are exported from `brand-graphics` and listed in the guide.

## Work plan

One concern per PR, squash-merged, in this order. Each is sized for one session and can be picked up from this file plus the files it names. All published packages share one version, so v2 is `0.2.0` for the group.

### Phase 1: settle the style

**PR 1. `docs(brand-seeds)`: unified style seeds** `[x]`

- Specimen pages built by `packages/brand-graphics/scripts/seeds.ts`, in light and dark: contents, decisions, card, article, index page, patterns. Previewed on every PR; no rendered images.
- Round 4 review applied (see above).
- Done when: the decisions page has no open questions.

**PR 2. `docs`: `DESIGN.md` v2** `[x]`

The aim is a shorter guide that is easier to follow. The current one has about 330 lines and 50 numbered rules, and several of them pulled against each other (structure everywhere against space; rationed colour against a callout piece). An agent weighing that many rules guesses.

- **Budget:** about 150 lines of prose and at most 12 numbered rules. A rule earns a number only if a test or a review cites it.
- **Order:** how to read the guide (tokens for values, the guide for intent and limits, the seeds for appearance; when something is not covered, use the nearest specimen and report the gap); the three layers; colour; type; patterns (the dials and the placement table); the theme contract; artefact sizes.
- **One place per fact:** no values in prose (the front matter is generated, PR 9); no description of what a specimen shows; the README, the skill and this plan link to the guide instead of restating it.
- **Remove:** `sign`, `ledger`, the band, schemes, `src/reserve`, the banned-motif list beyond one line, and rules that only restate a token.
- Done when: it is within budget, every rule a seed shows exists in it, and no rule contradicts a token, a specimen or the composer.

### Phase 2: tokens

**PR 3. `feat(design-tokens)`: heading weights and border widths** `[ ]`

- The Token Forge sync after the Figma changes above. Needs a changeset.
- Done when: `resolved.json` carries the new values and `panda-design-preset` rebuilds.

### Phase 3: packages

**PR 4. `feat(brand-fonts)`: new package** `[x]`

- Poppins, Instrument Sans and Monaspace Xenon as woff2 (pages) and OpenType (renderers), each licence beside its files, one `fonts.css`.
- `claude-design-system` reads its fonts from here.
- Done when: a page that imports only `tokens.css` and `fonts.css` renders all three faces offline. Checked in Chromium: every face loaded from the package, with no other font requests.
- Changed from the plan: Monaspace Xenon decodes to CFF outlines, so its renderer files are `.otf`; the folder is `opentype/`, not `ttf/`.

**PR 5. `build(brand-graphics)`: publishable build** `[x]`

- Compile to `dist/` with types; an `exports` map (`.`, `./css`, `./masks/*`, `./shapes/*`); the kit pre-parsed and the token lookup built in, so `compose(options)` needs no setup. Join the fixed version group; changeset.
- No behaviour change in this PR.
- Done when: a scratch project installs the packed tarball and composes a card with one import.

**PR 6. `feat(brand-graphics)`: pattern library** `[ ]`

- Start with the mask rendering check (three engines and print). Record the result here.
- `pattern(options)` with the dials above; pattern CSS and mask assets; `texture()` and the header feature both built on it, with the seed choosing the pair in both.
- `calloutArt({ hue, piece, corner, seed, theme })`, the seed choosing among allowed pieces and corners when none is given, so several callouts on a page differ.
- Delete `src/reserve`; the five tiles are in `src/shapes`.
- Replace the weave in `claude-design-system`'s cover with the library.
- Done when: the three weave implementations are one, and the callout and header seeds are rendered by these functions.

**PR 7. `feat(brand-graphics)`: one layout, exported geometry** `[ ]`

- The unified frame replaces `sign` and `ledger`; themes replace schemes. Breaking; regenerate examples.
- `layout(options)` returns every zone and type size. The same values go on the SVG as `data-` attributes and are available as custom properties, so a page can set its title in HTML on the composer's grid.
- Export `put`, `rect`, `Box` and the constants. A `wordmark` option.
- `defineTheme()` with the bounded choices typed.
- Done when: the text-free header seed has its HTML title aligned using only `layout()`.

**PR 8. `feat(brand-graphics)`: rasters and diagram theme** `[ ]`

- PNG output for Open Graph images with fonts from `brand-fonts`.
- `mermaidTheme(theme)`: ink on ground, 2px rules, square corners, cluster labels in the label style, one inverse node for the output. The Diagrams section of the guide says to keep graphs to one spine with a single fan-out.
- Done when: the diagram seed is produced by the exported theme.

### Phase 4: agent surfaces

**PR 9. `feat(claude-design-system)`: skill v2** `[ ]`

- Ship `DESIGN.md`, the pattern placement table, the theme contract, the seed specimen pages and a short `brand-graphics` API summary. Remove the "coming" line and say where each bundled reference comes from in the repo.
- Generate the `DESIGN.md` front matter from the tokens between markers, and fail the build if it drifts.
- Done when: a fresh session using only the installed skill can name the allowed patterns for a callout and find the specimen for an attachments list.

**PR 10. `test`: conformance audit** `[ ]`

- A script that loads a page and checks computed styles against the fixed part of the contract: label face and case, heading weight, rule widths, no radius in artwork, no fills in tables, at most one feature in the first screen, ground continuity between header and page.
- Runs on the seeds in CI, and against any URL by hand.
- Done when: it passes on every seed and fails on the current article page for the reasons in the evidence table.

### Phase 5: prove it

**Acceptance.** Rebuild the `civilian-site` article theme using only the published packages and the skill, in a fresh session at low effort, with no access to this repository. v2 is done when the audit passes and you would not ask for a correction. Then repeat once with a different surface (a docs page or a slide) as the real test of "derivative".

## Traceability

Feedback items from the article build, and where each is handled.

| Item | Summary                                    | Handled in                               |
| ---- | ------------------------------------------ | ---------------------------------------- |
| 1    | `brand-graphics` unpublished, no `exports` | PR 5                                     |
| 2    | Fonts not distributed                      | PR 4                                     |
| 3    | Skill behind the repo                      | PR 9                                     |
| 4    | No exported geometry                       | PR 7                                     |
| 5    | `put()` private                            | PR 7                                     |
| 6    | Callout art varies only by hue             | PR 6                                     |
| 7    | `texture()` ignores the seed for colour    | PR 6                                     |
| 8    | Callout art light-only                     | PR 6 (pattern CSS reads semantic tokens) |
| 9    | `night` ground is not the dark page ground | PR 7                                     |
| 10   | Wordmark baked in                          | PR 7                                     |
| 11   | Heading weight                             | PR 3                                     |
| 12   | Label styles                               | Decided: Instrument Sans, as the tokens  |
| 13   | Violet                                     | Decided: a callout hue like the others   |
| 14   | `src/reserve`                              | PR 6                                     |
| 15   | No rule-width or art-size tokens           | PR 3, with interim constants in PR 5     |
| 16   | No pull quote                              | PR 1, PR 2                               |
| 17   | No print rules                             | PR 1, PR 2                               |
| 18   | No diagram guidance                        | PR 2, PR 8                               |
| 19   | No `article` artefact                      | PR 2                                     |

## Not in v2

- The component library and Storybook (stages 5 and 6 of the old plan). They should follow v2, built on the element catalogue.
- A published element stylesheet.
- A final wordmark lock-up, and any new shapes beyond the pattern tiles.
