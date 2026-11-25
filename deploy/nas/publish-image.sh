#!/usr/bin/env bash
# Builds the Actual Budget image (web app + sync server) from this checkout
# and publishes it to GitHub Container Registry as
#   ghcr.io/filosnet74/actual:latest  and  :<git short sha>
# The NAS then pulls it like any other image.
#
# Needs: `gh auth refresh -h github.com -s write:packages` done once.
# Usage: deploy/nas/publish-image.sh [platforms]   (default linux/amd64)
set -euo pipefail

PLATFORMS="${1:-linux/amd64}"
IMAGE="ghcr.io/filosnet74/actual"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REV="$(git -C "$ROOT" rev-parse --short HEAD)"

gh auth token | docker login ghcr.io -u "$(gh api user --jq .login)" --password-stdin

docker buildx build \
  --platform "$PLATFORMS" \
  --provenance=false \
  --sbom=false \
  -f "$ROOT/sync-server.Dockerfile" \
  --label "org.opencontainers.image.source=https://github.com/filosnet74/actual" \
  --label "org.opencontainers.image.revision=$REV" \
  -t "$IMAGE:latest" \
  -t "$IMAGE:$REV" \
  --push \
  "$ROOT"

echo "Published $IMAGE:latest and $IMAGE:$REV"
