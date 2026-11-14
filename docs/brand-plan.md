# Civilian Dev brand: plan

Staged plan for the Civilian Dev brand guide and the work that follows it. Each stage is sized to be picked up in one session, from this file plus the files it names, without the conversation that produced it.

Status key: `[x]` done, `[~]` started, `[ ]` not started. Update the boxes as stages land.

## Brief

Civilian Dev is a personal profile and a home for coding libraries, articles and other projects. The brand is simple, clean and spacious, professional and utilitarian. It is made by someone who makes technology, but it must not look nerdy.

The seed idea is **fridge magnets**: a few plain, solid pieces on a clean white surface that can be rearranged into something new each time.

## Research summary

| Source                                         | What we take from it                                                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe Press, _Working in Public_              | One flat ground colour per page, one dark ink for all type, a cover built from a repeating module in three flat inks. Colour is printed, not lit.                 |
| Increment                                      | Light neutral ground, one accent per issue, hairline rules, a short accent bar over a tracked uppercase byline, generous gaps between cards.                      |
| NYCTA Graphic Standards Manual (Unimark, 1970) | A fixed module, a small kit of parts, strict hierarchy, one typeface doing one job per size, information only where a decision is made.                           |
| Keith Haring                                   | One uniform bold line with round ends, flat fills, radiating "action" ticks around the subject, dash and dot fields as texture.                                   |
| Memphis                                        | Squiggles, zigzags, confetti and terrazzo as seamless pattern; unexpected pairings of simple solids.                                                              |
| First attempt (profile banner)                 | Disc, square, bars, triangle, arc and half-disc as magnets; the disc + square + two bars snap into a person: the civilian. Rounded geometric sans, lots of white. |

Format research: Google Labs' [DESIGN.md](https://github.com/google-labs-code/design.md) (alpha, Apache-2.0) is the closest thing to a common, agent-readable design guide: YAML tokens in front matter plus fixed-order prose sections, with a linter (`@google/design.md lint`). Tokens themselves already follow DTCG in `packages/design-tokens`. The agent harness file convention is `AGENTS.md` (plural), which `CLAUDE.md` can import.

## Decisions

1. **`DESIGN.md` at the repo root is the brand guide.** It follows the DESIGN.md format so agents and the linter can read it. Prose is hand-written. Token values in its front matter mirror `packages/design-tokens/dist/resolved.json` and are never the source of truth: Figma is.
2. **No new colours or fonts.** The brand is expressed with the tokens that already exist (teal ink, paper, salmon, gold, violet; Poppins, Instrument Sans, Monaspace Xenon). Anything the brand needs that tokens lack is listed under "Token requests" below, to be added in Figma.
3. **`packages/brand-graphics` owns the artwork.** Hand-authored sources in `src/` (single-colour SVG, `currentColor`), a dependency-free composer in `scripts/`, and committed generated output in `examples/`.
4. **Variety comes from recombination, not new art.** Every composed asset is reproducible from `(recipe, scheme, seed)`.
5. **`DESIGN.md` is excluded from Biome.** Its markdown formatter flattens the YAML front matter, which breaks the format.

## Feedback log

**Round 1 (2026-11-14).** The first examples were good but the colour combinations were washed out and not complementary, and the stacked and scattered shapes looked arbitrary. The corner shapes in the callout backgrounds worked best. Changes made:

- Colour: went back to the Stripe Press book pages, where each page is one saturated flat ground with a single contrasting ink and a cover in two or three strong inks. Replaced the pastel palettes with six schemes that each pair warm with cool and light with dark, and added colour grounds (salmon, gold, mint, plum) alongside paper and ink. All values are still existing tokens.
- Shapes: removed the `totem` and `scatter` recipes and all random placement and tilt. The recipes are now `corner` (the callout idea, generalised), `row` (same-size pieces on a baseline, like route bullets), `tile` (a symmetric repeat on a panel) and `band` (a frieze). Each follows one rule; the seed only picks the motif and colour order.
- Not re-read: the NYCTA manual link is a PDF download, so that part of the rework is from memory of the manual (route discs, modular panels, strict alignment and repetition), not a fresh look.

## Stages

### Stage 0: research and plan `[x]`

This file.

### Stage 1: brand guide `[x]`

- `DESIGN.md` at the root: principles (with rule ids), colour roles, typography, layout, shapes, components, graphics system, artefact specs, do's and don'ts.
- Done when: the file follows the DESIGN.md section order and every colour, font and size in it exists in `packages/design-tokens/dist/tokens.css`.

### Stage 2: source graphics and examples `[x]`

- `packages/brand-graphics/src/shapes/` magnets (solids), `src/lines/` marks (strokes), `src/patterns/` seamless tiles, `src/mark/` the civilian figure.
- `packages/brand-graphics/scripts/compose.ts` composer and texture generators (grain gradient, stipple fade).
- `packages/brand-graphics/examples/` generated variations: Open Graph images, article banners, profile banner, callout backgrounds, textures, avatar.
- Done when: examples regenerate byte-identically from the script and `examples/index.html` shows them.
- Not done: `DESIGN.md` has not been run through `@google/design.md lint` (only checked by script against the tokens and the section order).

Left for a follow-up session (refine and expand):

- Review the shape set by eye in Figma; add or drop pieces; consider a second figure pose.
- More recipes (for example a full-bleed pattern cover and a two-panel diptych), and more motifs per recipe.
- Review the six schemes in Figma next to real pages; consider promoting them to a `graphic` token group (see token requests).
- A proper wordmark lock-up (the mark here is provisional and redrawn from the first attempt).

### Stage 3: `AGENTS.md` harness `[ ]`

Goal: a lower-reasoning model can work on one package without reading the others.

- Write `AGENTS.md` at the root: package responsibilities, the dependency direction (`design-tokens` → `panda-design-preset`, `claude-design-system`, `brand-graphics` → apps), what is generated vs hand-written, commands, commit and changeset rules, the release workflow (Changesets fixed group, Version PR, GitHub Packages, the claude.ai routine).
- Reduce `CLAUDE.md` to `@AGENTS.md` plus anything Claude-specific.
- Add a short `AGENTS.md` (or README section) per package covering only its inputs, outputs and tests.
- Done when: each package's notes name its inputs, outputs, build command and test command, and the root file links to `DESIGN.md` and this plan.

### Stage 4: harden `brand-graphics` into a package `[ ]`

- Wire `build` (`tsx scripts/build.ts`) to write `dist/`: the SVG sources, a typed manifest (`shapes`, `lines`, `patterns` with viewBox and path data) and the `compose()` function as an importable module.
- Read colours from `@civilian-dev/design-tokens/resolved` only (already the case in the composer); add the workspace dependency.
- Tests (vitest): every source SVG uses only `currentColor`; every example is deterministic for its seed; magnets never intersect the text zone; ink count per composition ≤ 3.
- Add `examples/` to the CI drift check and to `biome.json` ignores if needed.
- Rasterise Open Graph images to PNG with embedded fonts (resvg plus the Poppins and Instrument Sans files) since most social crawlers do not accept SVG.
- Changeset, publish config, README. Decide whether the package is published or private.

### Stage 5: component library `[ ]`

- New package (suggested name `chakra-components`): Chakra UI v3 system built from `@civilian-dev/design-tokens`, Lucide icons.
- Start with the components specified in `DESIGN.md`: Button, Link, Kicker (label), Callout, Card, Banner, Code block, Menu, basic form controls.
- Icons: Lucide at 1.5 stroke for 16 to 20px, 2 for 24px and up; never mixed with magnets in one cluster.
- Open question: Chakra's own Panda-based system overlaps with `panda-design-preset`. Decide whether the preset feeds Chakra's `createSystem` or stays for non-Chakra consumers.

### Stage 6: Storybook documentation `[ ]`

- `apps/storybook`: MDX pages for principles, colour use, typography, layout, graphics system (live composer with seed, scheme and recipe controls), then stories for each component, article layouts, callouts, banners, menus and controls.
- MDX pages quote `DESIGN.md` sections rather than restating them.

### Stage 7: Claude plugin and skill `[ ]`

- Extend `packages/claude-design-system/scripts` to ship `DESIGN.md` and the brand-graphics manifest and sources in the plugin's `references/` and in the Design System artifact bundle.
- Update the generated `SKILL.md` text so agents load `DESIGN.md` rules before producing any visual.
- Add a build check that the `DESIGN.md` front matter matches `resolved.json` (fail on drift).

## Token requests (for Figma)

Nothing here blocks the stages above; the composer carries these as local constants until they exist as tokens.

- `borderWidths`: `hairline` 1px, `rule` 2px, `bold` 4px.
- A `graphic` colour group holding the schemes (ground, ink, three magnet inks, block, tone), so they are not hard-coded by primitive name in the composer.
- A true blue hue. Stripe Press leans on deep royal blues and the first banner used blue; the closest tokens today are `violet.900` and `teal.700`.
- A stronger orange and yellow (the `500` steps of salmon and gold are muted: terracotta and mustard). They work as texture tones but not as bright highlights.
- Variable descriptions for every semantic role (already noted in the `claude-design-system` README).
