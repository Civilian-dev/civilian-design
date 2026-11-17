---
"@civilian-dev/brand-graphics": minor
---

Breaking: the composer draws the one card from DESIGN.md. `layout` and `scheme` are replaced by `theme: "light" | "dark"`, which reads semantic tokens, and `hex()` takes a theme. `calloutBackground()` now takes `{ hue, theme, seed }` and has a dark version; `texture()` takes `{ theme, seed }`. The feature, callouts and textures are drawn by the pattern library. New: `layout()` and `layoutVars()` for setting text in HTML over a composed card, `defineTheme()`, `put()`, `rect()`, `THEMES` and a `wordmark` option. Removed: `SCHEMES` and `stippleFilter`.
