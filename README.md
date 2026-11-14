# civilian-design

Design system assets for Civilian Dev and Tim Kinnane personal site

## Token sync

Token Forge writes the raw Figma export to `packages/design-tokens/src/tokens.json`. Never edit it by hand.

## Licence

Code and tokens are released under the [MIT licence](LICENSE). Any bundled fonts are licensed separately under the SIL Open Font License (OFL); each font's licence file is kept next to the font.

## Packages

| Package                             | Description                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `@civilian-dev/design-tokens`       | Canonical DTCG tokens, CSS variables, typed JS helper, resolved per-theme values |
| `@civilian-dev/panda-design-preset` | Panda CSS preset generated from the tokens                                       |

All published packages share one version (Changesets fixed group).

## Consuming the packages

Packages are published to GitHub Packages, which needs a token to **install** as well as publish, even for public packages. Create a classic personal access token with `read:packages` (fine-grained tokens don't work), then in the consumer's `.npmrc`:

```ini
@civilian-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Set `GITHUB_PACKAGES_TOKEN` locally, in the consumer's CI and in hosting builds (e.g. Vercel). In a consumer repo's GitHub Actions, `GITHUB_TOKEN` works only if the package grants that repo read access under **Manage Actions access**.

## Releasing

Add a changeset (`pnpm changeset`) to any PR that changes a published package. On `main`, the release workflow opens a "Version packages" PR; merging it publishes to GitHub Packages and creates GitHub releases.

One-off setup:

1. Create a GitHub App with contents and pull-requests write access, install it on this repo, then set repo variable `RELEASE_APP_ID` and secret `RELEASE_APP_PRIVATE_KEY`. Until it is configured the release workflow is skipped (a `GITHUB_TOKEN` Version PR cannot run the required `ci` check).
2. After the first publish, in each package's settings check visibility is **Public**, it's linked to this repo with **Inherit access from repository** on, and the repo has Actions write access.
