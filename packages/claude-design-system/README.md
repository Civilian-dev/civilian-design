# @civilian-dev/claude-design-system

Private package. `pnpm build` generates **committed** outputs from `@civilian-dev/design-tokens`; never edit them by hand (CI's drift check enforces this):

| Output | Purpose |
|---|---|
| `plugin/` | Claude plugin with the `civilian-design` skill (`SKILL.md`, `references/`) |
| `../../.claude-plugin/marketplace.json` | Marketplace pointer to `./packages/claude-design-system/plugin` (read from the default branch, so it has to be in git) |
| `design-system/project/` | Bundle for the claude.ai **Design System** artifact (`editing: "code"`, so the page is read-only) |

Usage text for each colour role comes from the Figma variable descriptions. Figma doesn't have them yet, so the build falls back to naming hints and warns. Once every semantic role has a description, run builds with `STRICT_DESCRIPTIONS=1` (CI) to make a missing description fail the build.

## One-off setup

1. **Create the Design System artifact** (once, by hand). In a Claude session, start from the **Design System** type using the files in `design-system/project/`. Mark it as your default design system, then record its URL in [`config.json`](config.json) (`designSystemArtifactUrl`).
2. **Add the marketplace.**
   - claude.ai: Customize > Plugins > Add marketplace > `Civilian-dev/civilian-design`.
   - Claude Code: `/plugin marketplace add Civilian-dev/civilian-design`, then `/plugin install civilian-design --marketplace Civilian-dev/civilian-design`.
   - Check whether personal-account marketplaces refresh on push. If they don't, update with `/plugin marketplace update civilian-design`.
3. **Cloud scheduled task** at claude.ai/code/routines:
   - Repository: `Civilian-dev/civilian-design`. GitHub trigger: `release.published`.
   - Prompt:
     > Clone the repo at the release tag. Read `packages/claude-design-system/design-system/project/` and the artifact URL in `packages/claude-design-system/config.json`. Republish only the files that changed to that artifact (everything under `project/`), writing `project/design-system.json` last and setting its `lastChange` (`via`: `CI <release tag>`, `at`: now). If nothing changed, stop.
   - Check the first run: runs started by a GitHub trigger may pause to ask before publishing.
4. **Optional:** push `plugin/skills/civilian-design` to the API Skills endpoint (`POST /v1/skills/{id}/versions`) from `release.yml`, for your own API tooling.

## Notes

- `design-system.json` carries a build-stable placeholder `lastChange.at`; the routine above overwrites it with the real time and release tag.
- `components/Cover/preview.html` is a best-effort cover: the type's `cover.md` can only be read from an existing artifact, so check it after the first publish.
- Fonts: Monaspace Xenon (SIL OFL 1.1) is copied from the pinned `@fontsource/monaspace-xenon` with its licence at `design-system/project/fonts/OFL.txt`. Poppins and Instrument Sans are referenced as Google Fonts.
