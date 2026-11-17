# Brand seeds

Specimens for the merged Civilian style: the ledger's frame and colour, with the sign's bullet, key, weave and wordmark. This is round 4 of the brand review and PR 1 of the [v2 plan](../design-system-v2-plan.md). The seeds are proposals until the decisions below are marked.

Each specimen is a page you can open and a picture of it. The page is what to copy from; the picture is for judging by eye.

| Specimen   | Light                                                | Dark                                                           | What it shows                                                                                                 |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Card       | [page](card.html) · [image](images/card.jpg)         | [page](card-dark.html) · [image](images/card-dark.jpg)         | The frame, closed, at Open Graph size. Weave, grain and no feature, then the comparisons for D1, D2 and D9.   |
| Article    | [page](article.html) · [image](images/article.jpg)   | [page](article-dark.html) · [image](images/article-dark.jpg)   | The frame, open, as a page header, then every element an article uses. Print the page to see the print rules. |
| Index page | [page](listing.html) · [image](images/listing.jpg)   | [page](listing-dark.html) · [image](images/listing-dark.jpg)   | A header with no feature, an index of articles, a section texture.                                            |
| Patterns   | [page](patterns.html) · [image](images/patterns.jpg) | [page](patterns-dark.html) · [image](images/patterns-dark.jpg) | Every dial of the one pattern construction: tile, turn, scale, gradient, pair.                                |

The pages need a web server because they load the tokens and fonts by relative path. From the repo root, run `python3 -m http.server 4311` and open `http://localhost:4311/docs/brand-seeds/`.

## Elements

Every element carries a `data-seed` attribute with the name below, so it can be found in the page source.

| Element                           | `data-seed`                                              | Page                |
| --------------------------------- | -------------------------------------------------------- | ------------------- |
| Page header                       | `page-header`                                            | Article, Index page |
| Standfirst                        | `standfirst`                                             | Article             |
| Section opener                    | `section`                                                | Article             |
| Unordered, ordered and term lists | `list-unordered`, `list-ordered`, `list-terms`           | Article             |
| Pull quote                        | `pull-quote`                                             | Article             |
| Table                             | `table`                                                  | Article             |
| Code block                        | `code`                                                   | Article             |
| Callouts                          | `callout`, `callout-tip`, `callout-note`, `callout-info` | Article             |
| Diagram                           | `diagram`                                                | Article             |
| Attachments                       | `attachments`                                            | Article             |
| Footnotes                         | `footnotes`                                              | Article             |
| Index                             | `index`                                                  | Index page          |
| Section texture                   | `section-texture`                                        | Index page          |
| Footer                            | `footer`                                                 | Article, Index page |

## Decisions to mark

The ids match the table in the [v2 plan](../design-system-v2-plan.md#decisions-needed). Mark each one there.

| Id  | Question                                      | Where to look                                                   |
| --- | --------------------------------------------- | --------------------------------------------------------------- |
| D1  | Heading weight 500 or 600                     | Card: "Proposed" (600) against "D1" (500)                       |
| D2  | Keep the top band                             | Card: "D2"                                                      |
| D3  | Dark artwork on the dark page ground          | Any dark page: the header should read as the top of the page    |
| D4  | Mono uppercase labels                         | Every label on every page                                       |
| D5  | Violet for the info callout only, with no art | Article: the four callouts                                      |
| D6  | Disc and half-disc as pattern tiles           | Patterns: "Tile"                                                |
| D9  | Concrete or paper for standalone cards        | Card: "Proposed" against "D9"                                   |
| D10 | Square or rounded callouts and code blocks    | Article: the specimens are square; "D10" at the foot is rounded |

D7 (fonts) and D8 (element CSS) are packaging questions with nothing to look at.

## How they are made

| File           | What                                                                                                      | Edited by                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `seeds.css`    | The reference stylesheet. Every value is a token; the custom properties at the top are what a theme sets. | hand                                                           |
| `*.html`       | The specimen pages                                                                                        | `pnpm build` only (`packages/brand-graphics/scripts/seeds.ts`) |
| `images/*.jpg` | Pictures of the pages                                                                                     | `docs/brand-seeds/render.sh`, by hand, after a build           |
| `archive/`     | Rounds 1 to 3: the separate sign and ledger images                                                        | not edited                                                     |

- The pages are generated so that the pattern markup is exact and identical everywhere. CI rebuilds them and fails if they differ from what is committed.
- The images are not checked by CI, because a render depends on the browser. Re-run `render.sh` whenever a page changes, and commit the images with that change.
- `pattern()` in the generator is a prototype. It becomes the exported pattern library in PR 6 of the plan, and the pages will then call that.

## Known gaps

- Patterns use inline SVG, so the tile size is fixed in the markup, not set by CSS. The pattern library is meant to lift that.
- The header's feature keeps whole tiles only while the title fits on two lines.
- There is no slide or document specimen yet, only web pages and a card.
- Print is shown by printing the Article page. There is no picture of a printed page.
