# civilian-design

Workspace for the Civilian design system: tokens, Panda preset, and the Claude design system (plugin + artifact bundle).

## Ground rules

- **Figma is the source of truth.** Never hand-edit token values. `packages/design-tokens/src/tokens.json` is written only by the Token Forge sync.
- **Generated files are never edited by hand.** They are rebuilt by `pnpm build` and checked by CI. This covers `dist/`, `packages/claude-design-system/plugin/` and `packages/claude-design-system/design-system/`.
- **One concern per commit**, with Conventional Commit messages. Merge PRs with rebase so each commit survives on `main`.
- **Package names say what they are without the scope:** `design-tokens`, `panda-design-preset`, `claude-design-system`, `brand-graphics`. Folder names match package names. Use the package name as the commit scope.
- Pin exact dependency versions. Node and pnpm come from `mise.toml`.

## Layout

- `packages/design-tokens` (`@civilian-dev/design-tokens`, published): Token Forge source, normalise + build scripts, `dist/`.
- `packages/panda-design-preset` (`@civilian-dev/panda-design-preset`, published): Panda CSS preset generated from tokens.
- `packages/claude-design-system` (private): generates the committed Claude plugin/skill and Design System artifact bundle.
- `packages/brand-graphics`, `apps/*`: reserved for later.
- `.github/`: workflows, ruleset (`rulesets/main.json`), CODEOWNERS.

## Commands

- `pnpm install`
- `pnpm build` (topological), `pnpm test`, `pnpm lint`, `pnpm typecheck`
- `pnpm check` runs lint, typecheck and test
- `scripts/apply-github-settings.sh` applies the ruleset and repo options
