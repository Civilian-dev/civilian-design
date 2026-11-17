#!/usr/bin/env bash
# Renders the seed pages to images in docs/brand-seeds/images/.
# Run by hand from the repo root after `pnpm build`; not part of CI, because
# the result depends on the browser. Needs Google Chrome and a static server:
#
#   python3 -m http.server 4311 &
#   docs/brand-seeds/render.sh
set -euo pipefail

chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
base="${SEEDS_URL:-http://localhost:4311/docs/brand-seeds}"
out="docs/brand-seeds/images"
mkdir -p "$out"

# name, width, height
pages=(
  "card 1320 4700"
  "card-dark 1320 4700"
  "article 1100 3300"
  "article-dark 1100 3300"
  "listing 1100 900"
  "listing-dark 1100 900"
  "patterns 1100 1750"
  "patterns-dark 1100 1750"
)

for page in "${pages[@]}"; do
  read -r name width height <<<"$page"
  "$chrome" --headless=new --hide-scrollbars --virtual-time-budget=4000 \
    --window-size="$width,$height" --screenshot="$out/$name.png" \
    "$base/$name.html" >/dev/null 2>&1
  # Noise does not compress as PNG; JPEG keeps the repository small.
  sips -s format jpeg -s formatOptions 82 "$out/$name.png" --out "$out/$name.jpg" >/dev/null
  rm "$out/$name.png"
  echo "rendered $out/$name.jpg"
done
