# @civilian-dev/brand-cli

Makes brand assets from `@civilian-dev/brand-graphics` at a given size, as SVG or PNG. Private: run it inside this workspace. It runs on Node 24 directly, with no build step, after `pnpm build` has built `brand-graphics`.

```bash
pnpm --filter @civilian-dev/brand-cli brand pattern grain paper 1280x288 --format png --density 2 --out banner.png
```

## Commands

- `brand list` prints every dial and its choices as JSON.
- `brand pattern <tile> <surface> <WxH> [options]` writes a pattern image and prints its path. The name people use is tile then surface, such as "Grain Paper".

| Dial        | Choices                                               | Default                             |
| ----------- | ----------------------------------------------------- | ----------------------------------- |
| tile        | grain, triangle, quarter-disc, half-disc, disc, check | required                            |
| surface     | paper, concrete (light); dark, dark-card (dark)       | required                            |
| `--pair`    | ink-red, ink-teal, salmon-red                         | ink-red                             |
| `--scale`   | fine, regular, coarse (about 12, 24, 48px tiles)      | regular                             |
| `--turn`    | 0, 90, 180, 270                                       | 0                                   |
| `--dir`     | down, diagonal, edge                                  | down (diagonal for grain)           |
| `--noise`   | crisp, soft                                           | crisp                               |
| `--seed`    | any whole number; changes the grain only              | 1                                   |
| `--format`  | svg, png                                              | svg                                 |
| `--density` | PNG pixels per px, up to 4                            | 1                                   |
| `--out`     | file path                                             | `<tile>-<surface>-<W>x<H>.<format>` |

The tile size is fitted so the box holds whole tiles both ways where it can (DESIGN.md, Patterns). The SVG uses resolved token colours, so it renders without the page's CSS. PNG is rendered with `toPng()` from `@civilian-dev/brand-graphics/raster`.

`docs/brand-demo` is a page for choosing the dials and downloading the result.
