# civilian-design

Workspace for the Civilian design system: tokens, Panda preset, and the Claude design system (plugin + artifact bundle).

## Ground rules

- **Figma is the source of truth.** Never hand-edit token values. `packages/design-tokens/src/tokens.json` is written only by the Token Forge sync.
- **Generated files are never edited by hand.** They are rebuilt by `pnpm build` and checked by CI. This covers `dist/`, `packages/claude-design-system/plugin/` and `packages/claude-design-system/design-system/`.
- **One concern per PR.** PRs are squash-merged, so the PR becomes one commit on `main`. See [Git and PRs](#git-and-prs).
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

## Git and PRs

These rules apply to every agent and surface that commits here (Claude Code, Claude desktop, cloud sessions). Read this file before the first commit in a session.

### Merging

- PRs are **squash-merged**. The PR title becomes the commit subject and the PR body becomes the commit body.
- The PR title is a Conventional Commit with the package as scope, e.g. `feat(brand-graphics): sign and ledger layouts`. The body says what changed and why, in its final state. Update both when the scope of the PR changes.
- A PR holds one concern. Unrelated work (a process change, a fix in another package) goes in its own PR, even when it comes up mid-task.
- Changesets are files, so squashing does not affect them. Add one with `pnpm changeset` for any change to a published package.

### Commits on a branch

Branch commits are not kept, but they are how a reviewer or the next session reads the work. Keep them honest:

- **Commit as you go**, one commit per step, as each step is finished. Do not build up a large working tree and split it into commits afterwards; that is how a whole package ends up in a `style:` commit.
- **Stage explicit paths.** `git add <path>...`, never `git add -A`, `git add .` or `git commit -a`.
- **Check before every commit:** run `git status` and `git diff --cached --stat`, and make sure every staged file matches the message. New files and directories belong in the commit that introduces the feature, not in a docs, style or chore commit.
- **Format before committing**, not after: `pnpm exec biome check --write <paths>`, then stage. Done this way, no commit should need a formatting fix afterwards. If one does, amend it when it has not been pushed; once it has been pushed, add a fix commit.
- Rebuild generated files (`pnpm build`) and commit them with the source change that caused them.
- Run `pnpm check` before pushing.

### Picking up a branch

A branch may be started by one session and continued by another.

- Before changing anything, read the PR description and `git log --stat main..HEAD`, and check `git status` for uncommitted work you did not make. Ask before committing someone else's uncommitted changes.
- Add commits on top. Do not rebase, amend or force-push pushed commits unless asked; if asked, use `git push --force-with-lease`.
- Keep the PR body current so the next session (and the squash commit) describes the branch as it is now.

### Exploration

Design rounds and experiments can iterate freely on a branch, since squashing drops the intermediate commits. Before marking the PR ready, delete superseded files and outputs so the final tree holds only what is being merged.
