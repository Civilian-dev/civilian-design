# Brand seeds

Specimen pages for the Civilian style, in light and dark. The page is the reference: copy markup and `seeds.css` from it rather than describing it again.

**Open them in a PR preview.** Every pull request from this repository gets a preview at `https://civilian-dev.github.io/civilian-design/pr-preview/pr-<number>/`. Start at `decisions.html`: it is the one list of open and settled design decisions, with the options side by side.

Locally: run `python3 -m http.server` at the repo root and open `/docs/brand-seeds/`.

| File        | What                                                                                                      | Edited by                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `seeds.css` | The reference stylesheet. Values are tokens only; the custom properties at the top are what a theme sets. | hand                                                      |
| `*.html`    | Contents, decisions, card, article, index page, patterns                                                  | `pnpm build` (`packages/brand-graphics/scripts/seeds.ts`) |
| `archive/`  | Rounds 1 to 3, when `sign` and `ledger` were separate                                                     | not edited                                                |

- Every element in the pages has a `data-seed` attribute naming it, such as `card`, `callout-tip` or `attachments`.
- The decisions on `decisions.html` are data in `seeds.ts` (`OPEN` and `DECIDED`). Change them there, not in another document.
- `pattern()` in `seeds.ts` is a prototype for the pattern library (PR 6 of the [v2 plan](../design-system-v2-plan.md)).
