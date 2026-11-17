# @civilian-dev/brand-fonts

The three Civilian typefaces, so a page, a PDF or a rendered image needs no font CDN.

| Family          | Token           | Used for                    |
| --------------- | --------------- | --------------------------- |
| Poppins         | `fonts.heading` | Headings and the card title |
| Instrument Sans | `fonts.body`    | Body text and labels        |
| Monaspace Xenon | `fonts.mono`    | Code and file paths         |

Each comes in weights 400, 500, 600 and 700, latin subset, as:

- **woff2** for pages, loaded by `fonts.css`.
- **OpenType** for renderers that cannot read woff2 (resvg, PDF tools): `.ttf` for Poppins and Instrument Sans, `.otf` for Monaspace Xenon.

All three are licensed under the SIL Open Font License 1.1; each licence is in `licences/`. The package's own code is MIT.

## Use

On a page, load the fonts next to the tokens:

```css
@import "@civilian-dev/design-tokens/css";
@import "@civilian-dev/brand-fonts/fonts.css";
```

In a renderer, read the files from disk:

```ts
import { fontPath, fonts } from "@civilian-dev/brand-fonts";

const files = fonts.map((face) => fontPath(face.opentype));
```

## Build

`pnpm build` copies the woff2 files and licences from the pinned `@fontsource` packages and decodes each woff2 to OpenType with `wawoff2`. `dist/` is committed and CI fails if a rebuild changes it. To update a font, change the `@fontsource` version and rebuild.
