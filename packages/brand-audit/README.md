# @civilian-dev/brand-audit

Loads pages in Chrome and checks what the browser actually shows against the fixed part of the theme contract in [`DESIGN.md`](../../DESIGN.md). It answers "does this theme still look like Civilian?" without a person checking by eye.

```sh
pnpm --filter @civilian-dev/brand-audit pages http://localhost:5173/articles/some-article/
pnpm --filter @civilian-dev/brand-audit test   # every specimen page in docs/brand-seeds
```

Each page prints `pass`, or `FAIL` with a count per check and one line per problem. The command exits 1 if anything fails. `pnpm check` runs it on the specimens, so CI fails if a specimen breaks the contract.

| Check         | Fails when                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `label-style` | Uppercase text is not Instrument Sans 600 with wide tracking (labels are the only uppercase text) |
| `heading`     | An `h1` to `h3` is not Poppins 600                                                                |
| `rule-width`  | A border is not 1, 2 or 4px                                                                       |
| `body-rule`   | A top-only or bottom-only border appears outside the card and tables (the body uses space)        |
| `square`      | The card, a callout, code, a quote, a table, a figure or a pattern has rounded corners            |
| `table-fill`  | A table row or cell has a background                                                              |
| `one-card`    | A page does not have exactly one `.cv-card`, or it is below the first screen                      |
| `one-feature` | More than one pattern is in the first screen (callout art aside)                                  |
| `grounds`     | The window header is not on the page ground, or the card is on the same ground as the page        |

The last three are page-level checks. Specimen sheets that show many cards side by side mark their `<main>` with `data-audit="sheet"` and skip them.

It uses the installed Google Chrome, which GitHub's runners already have; set `BRAND_AUDIT_CHROME` to a browser binary to use another. Nothing is downloaded.

## Known gaps

- It checks the fixed part of the contract only. Taste, spacing rhythm and contrast are not checked.
- Card and callout detection relies on the specimen class names (`cv-card`, `cv-callout`), so a theme should copy the specimen markup.
- One viewport, 1440 by 900. Narrow screens are not checked.
