#!/usr/bin/env bash
# Idempotently apply the repo ruleset and merge options. Requires `gh` with admin rights.
set -euo pipefail

repo="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
root="$(cd "$(dirname "$0")/.." && pwd)"
ruleset="$root/.github/rulesets/main.json"
name="$(jq -r .name "$ruleset")"

gh api -X PATCH "repos/$repo" \
  -F allow_rebase_merge=true -F allow_merge_commit=false -F allow_squash_merge=false \
  -F allow_auto_merge=true -F delete_branch_on_merge=true >/dev/null

id="$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name==\"$name\") | .id")"
if [ -n "$id" ]; then
  gh api -X PUT "repos/$repo/rulesets/$id" --input "$ruleset" >/dev/null
  echo "Updated ruleset $name ($id)"
else
  gh api -X POST "repos/$repo/rulesets" --input "$ruleset" >/dev/null
  echo "Created ruleset $name"
fi
