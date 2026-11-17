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

## The v2 design in brief

These are proposals until the seeds in PR 1 have been reviewed by eye.

### One style

`sign` and `ledger` merge into one. There is no layout option and no layout name: there is just the frame.

- **From `ledger` (layout and colour):** a 2px ink frame divided by rules into cells; label cells top and bottom; the title in the large cell; the feature filling its cell edge to edge; concrete as the standalone ground; ink doing almost all the work.
- **From `sign` (highlights):** the route bullet in the first label cell; the key in the last cell, replacing the single red square; the weave as the default feature; the wordmark set in the heading face.
- **Dropped:** the top band, the `layout` input, and the names `sign` and `ledger` everywhere (guide, composer, file names, seeds).

On a page, the same frame opens out: rules above and below, cells becoming rows. The seeds show exactly how, so a page header is specified rather than adapted from a card.

### Grounds follow the page

A piece of artwork takes the ground it sits on.

- **Embedded** (page header, callout art, section texture): the page's `bg.canvas`, in either theme. The header reads as the top of the page.
- **Standalone** (Open Graph image, profile banner, avatar): concrete in light, the dark canvas in dark.

Schemes shrink to a theme (`light` or `dark`) plus a placement (`page` or `standalone`), resolved from semantic tokens. This removes the mismatch between `night` and the dark page, and the README's note that the dark scheme reads the light token set.

### Patterns are one idea with a few dials

Today `weave`, `grain` and `stipple` are three separate things. In v2 a pattern is always the same construction:

> one tile, repeated on a square grid in the ground colour, over a two-colour noise gradient.

| Dial     | Options                                                                            |
| -------- | ---------------------------------------------------------------------------------- |
| Tile     | none (plain grain), triangle, quarter-disc, half-disc, square (check), disc (dots) |
| Turn     | quarter turns only                                                                 |
| Scale    | fine, regular, coarse (whole tiles across the region)                              |
| Gradient | down, diagonal, from one edge (fade to ground)                                     |
| Pair     | from the theme's list of allowed colour pairs                                      |

That gives real variety from one rule (P7). The seed chooses among allowed dial settings, never a position or a size.

Patterns ship two ways:

- **A function** for anything rendered without a browser (Open Graph rasters, PDFs): returns SVG with resolved colours.
- **CSS** for pages: colour-free mask assets plus a small stylesheet driven by custom properties (`from`, `to`, `ground`, `tile`). Because the colours come from semantic tokens, dark mode needs no second set of art.

The mask approach depends on SVG filters rendering inside CSS masks in Chromium, Firefox and WebKit, and in print. PR 6 starts with that check; the fallback is pre-rendered noise masks.

### Where patterns go

This table is the "clear and prominent guideline". It goes at the top of the Graphics section of `DESIGN.md`, in the package README and in the Claude skill, word for word.

| Element                                                    | Pattern allowed                                                              | Extent                                                                       | Never                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Page header, card                                          | One feature cell: any tiled pattern, or grain with one anchored piece        | The feature cell only: at most 30% of the width, the full height of its cell | A second feature; a pattern behind text        |
| Callout                                                    | An edge fade from the right, optionally one small piece anchored in a corner | At most the art-width token (240px today), gone before the text              | A tiled pattern; art on a callout with no tint |
| Section texture                                            | Any pattern, no pieces                                                       | Full width, a fixed number of tile rows                                      | Text over it                                   |
| Pull quote, table, list, index, attachments, code, diagram | None                                                                         |                                                                              | Any pattern or piece                           |

One feature per view still holds (L5): a page with a patterned header does not also get a section texture in the first screen.

### A theme contract

`DESIGN.md` gains a short section that sorts every decision a derivative theme can face into three groups, so an agent knows what it may change.

| Group       | Meaning                   | Examples                                                                                                                |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Fixed**   | Never changes             | Type roles, ink on ground, rule widths, square corners in artwork, label style, one feature per view, where patterns go |
| **Bounded** | Choose from a stated list | Theme, pattern dials, callout hue, corner piece, bullet letter                                                          |
| **Free**    | Yours                     | Content, wordmark text, section names, which elements a page uses                                                       |

The same contract becomes a typed `defineTheme()` in `brand-graphics`, so bounded choices are checked by the compiler and a theme is a small object, not a stylesheet written from scratch.

### An element catalogue with seeds

Every element a page can contain gets an entry in the guide (anatomy, tokens, rules) and a seed. New in v2: page header, standfirst, index (list of articles), ordered, unordered and definition lists, attachments, table, pull quote, figure, diagram, footnotes, and print.

Seeds change from hand-made images to **built specimens**: HTML written against `tokens.css` and the pattern CSS, generated by a script, with a rendered image beside each. The image is for judging by eye; the HTML is what an agent copies from. Each seed lists the rule ids it shows.

## Decisions needed

Each has a recommendation so work can start; the seeds in PR 1 exist to confirm or overturn them.

| Id  | Decision                                                                          | Recommendation                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Heading weight: tokens say 500 for display and h1, the guide and composer say 600 | 600. Change the text styles in Figma                                                                                                                           |
| D2  | Does the top band survive anywhere?                                               | No. The frame replaces it. Show one seed with it for comparison                                                                                                |
| D3  | Dark ground for artwork                                                           | The dark `bg.canvas`, so headers join the page. Drop the `night` teal ground                                                                                   |
| D4  | Label style in tokens                                                             | Change `label.overline` in Figma to Monaspace Xenon 500 with `0.1em` tracking. If Token Forge cannot carry uppercase, the pattern CSS sets it                  |
| D5  | Violet                                                                            | Interface only, which includes the info callout's tint and edge. No violet in artwork: remove it from the composer's hues, and the info callout carries no art |
| D6  | `src/reserve`                                                                     | Promote disc (dots) and half-disc as tiles, redrawn square-cornered. Delete the rest; git history keeps it                                                     |
| D7  | Fonts                                                                             | A new published package `brand-fonts` (files, licences, `@font-face` CSS), which `claude-design-system` then consumes instead of its own copies                |
| D8  | Element CSS                                                                       | Not a package yet. The seed stylesheet is the reference to copy. Publish it once a second consumer needs it                                                    |
| D9  | Default standalone ground in light                                                | Concrete, as in `ledger`. Paper only when embedded in a paper page                                                                                             |

## Token changes (Figma)

Only you can make these; the sync PR follows. Until then `brand-graphics` exports constants with the same names.

- Text styles: `heading.display` and `heading.h1` weight (D1); `label.overline` family, weight and tracking (D4).
- `borderWidths`: `hairline` 1px, `rule` 2px, `edge` 4px.
- `sizes.art`: the callout art cap (240px today).
- A description on every semantic role, so the skill stops falling back to naming hints.

Graphics constants that are not design tokens (the module divisor, the margin as a share of width, tile counts) are exported from `brand-graphics` and listed in the guide.

## Work plan

One concern per PR, squash-merged, in this order. Each is sized for one session and can be picked up from this file plus the files it names. All published packages share one version, so v2 is `0.2.0` for the group.

### Phase 1: settle the style

**PR 1. `docs(brand-seeds)`: unified style seeds** `[ ]`

- Build specimens with a script (`docs/brand-seeds/build.ts`, output committed): card; page header (light and dark); index; lists; attachments; table; callouts in each hue and in dark; pull quote; code; diagram; a print page.
- Include the comparisons the decisions need: band or no band (D2), 500 or 600 (D1), concrete or paper (D9).
- Retire the round 1 to 3 images to an `archive/` folder; rewrite the README table.
- Done when: you have marked each of D1 to D9 in this file, and every catalogue element has a chosen seed.

**PR 2. `docs`: `DESIGN.md` v2** `[ ]`

- One style; the theme contract; the element catalogue; the pattern placement table; a Print section; a Diagrams section; an `article` artefact (A7) with the page margin tied to the header margin, so title and body share a left edge.
- Open with "How to read this guide": precedence (tokens for values, the guide for usage, seeds for appearance), and what to do when something is not covered (use the nearest element, do not invent, report the gap).
- Remove every mention of `sign`, `ledger`, the band and `src/reserve`.
- Done when: every seed's rule ids exist in the guide, and no rule contradicts a token or the composer.

### Phase 2: tokens

**PR 3. `feat(design-tokens)`: weights, label style, border widths** `[ ]`

- The Token Forge sync after the Figma changes above. Needs a changeset.
- Done when: `resolved.json` carries the new values and `panda-design-preset` rebuilds.

### Phase 3: packages

**PR 4. `feat(brand-fonts)`: new package** `[ ]`

- Poppins, Instrument Sans and Monaspace Xenon as woff2 (pages) and ttf (rasterisers), each licence beside its files, one `fonts.css`.
- `claude-design-system` reads its fonts from here.
- Done when: a page that imports only `tokens.css` and `fonts.css` renders all three faces offline.

**PR 5. `build(brand-graphics)`: publishable build** `[ ]`

- Compile to `dist/` with types; an `exports` map (`.`, `./css`, `./masks/*`, `./shapes/*`); the kit pre-parsed and the token lookup built in, so `compose(options)` needs no setup. Join the fixed version group; changeset.
- No behaviour change in this PR.
- Done when: a scratch project installs the packed tarball and composes a card with one import.

**PR 6. `feat(brand-graphics)`: pattern library** `[ ]`

- Start with the mask rendering check (three engines and print). Record the result here.
- `pattern(options)` with the dials above; pattern CSS and mask assets; `texture()` and the header feature both built on it, with the seed choosing the pair in both.
- `calloutArt({ hue, piece, corner, seed, theme })`, the seed choosing among allowed pieces and corners when none is given, so several callouts on a page differ.
- Promote the D6 tiles; delete `src/reserve`.
- Replace the weave in `claude-design-system`'s cover with the library.
- Done when: the three weave implementations are one, and the callout and header seeds are rendered by these functions.

**PR 7. `feat(brand-graphics)`: one layout, exported geometry** `[ ]`

- The unified frame replaces `sign` and `ledger`; themes replace schemes (D3, D9). Breaking; regenerate examples.
- `layout(options)` returns every zone and type size. The same values go on the SVG as `data-` attributes and are available as custom properties, so a page can set its title in HTML on the composer's grid.
- Export `put`, `rect`, `Box` and the constants. A `wordmark` option.
- `defineTheme()` with the bounded choices typed.
- Done when: the text-free header seed has its HTML title aligned using only `layout()`.

**PR 8. `feat(brand-graphics)`: rasters and diagram theme** `[ ]`

- PNG output for Open Graph images with fonts from `brand-fonts`.
- `mermaidTheme(theme)`: ink on ground, 2px rules, square corners, mono uppercase cluster labels, one inverse node for the output. The Diagrams section of the guide says to keep graphs to one spine with a single fan-out.
- Done when: the diagram seed is produced by the exported theme.

### Phase 4: agent surfaces

**PR 9. `feat(claude-design-system)`: skill v2** `[ ]`

- Ship `DESIGN.md`, the pattern placement table, the theme contract, the seeds (images and specimen HTML) and a short `brand-graphics` API summary. Remove the "coming" line and say where each bundled reference comes from in the repo.
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
| 2    | Fonts not distributed                      | PR 4 (D7)                                |
| 3    | Skill behind the repo                      | PR 9                                     |
| 4    | No exported geometry                       | PR 7                                     |
| 5    | `put()` private                            | PR 7                                     |
| 6    | Callout art varies only by hue             | PR 6                                     |
| 7    | `texture()` ignores the seed for colour    | PR 6                                     |
| 8    | Callout art light-only                     | PR 6 (pattern CSS reads semantic tokens) |
| 9    | `night` ground is not the dark page ground | D3, PR 7                                 |
| 10   | Wordmark baked in                          | PR 7                                     |
| 11   | Heading weight                             | D1, PR 3                                 |
| 12   | Label styles                               | D4, PR 3                                 |
| 13   | Violet                                     | D5, PR 2 and PR 6                        |
| 14   | `src/reserve`                              | D6, PR 6                                 |
| 15   | No rule-width or art-size tokens           | PR 3, with interim constants in PR 5     |
| 16   | No pull quote                              | PR 1, PR 2                               |
| 17   | No print rules                             | PR 1, PR 2                               |
| 18   | No diagram guidance                        | PR 2, PR 8                               |
| 19   | No `article` artefact                      | PR 2                                     |

## Not in v2

- The component library and Storybook (stages 5 and 6 of the old plan). They should follow v2, built on the element catalogue.
- A published element stylesheet (D8).
- A final wordmark lock-up, and any new shapes beyond the D6 tiles.
