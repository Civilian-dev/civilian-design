# brand-demo

A local page for making brand assets with `@civilian-dev/brand-cli`: choose a pattern, surface and size, preview it, and download SVG or PNG.

```bash
pnpm build
```

```bash
pnpm --filter @civilian-dev/brand-demo dev
```

It runs only in the Vite dev server. The page calls `/api/choices` and `/api/pattern`, which run the CLI; the files it writes go to `out/`, which git ignores. The page holds no drawing code: every change to what is drawn belongs in the CLI or in `brand-graphics`.
