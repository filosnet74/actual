#!/usr/bin/env bash
# Builds the Actual Budget image (web app + sync server) from this checkout
# and saves it as a .tar archive that the NAS can import.
#
# Usage: deploy/nas/build-image.sh [platform]
#   platform defaults to linux/amd64 (Intel/AMD NAS). Use linux/arm64 for an
#   ARM NAS.
set -euo pipefail

PLATFORM="${1:-linux/amd64}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT/deploy/nas/dist"
REV="$(git -C "$ROOT" rev-parse --short HEAD)"
ARCH="${PLATFORM#linux/}"

mkdir -p "$OUT_DIR"

echo "Building actual-custom:$REV for $PLATFORM ..."
# No provenance/SBOM attestations: NAS image importers (e.g. UGREEN's Docker
# app) expect a plain single-platform image.
docker buildx build \
  --platform "$PLATFORM" \
  --provenance=false \
  --sbom=false \
  -f "$ROOT/sync-server.Dockerfile" \
  -t actual-custom:latest \
  -t "actual-custom:$REV" \
  --load \
  "$ROOT"

# Plain, uncompressed .tar: the format NAS Docker apps import.
ARCHIVE="$OUT_DIR/actual-custom-$REV-$ARCH.tar"
echo "Saving image to $ARCHIVE ..."
rm -f "$OUT_DIR"/actual-custom-*.tar "$OUT_DIR"/actual-custom-*.tar.gz
docker save -o "$ARCHIVE" actual-custom:latest
chmod 644 "$ARCHIVE"
cp "$ROOT/deploy/nas/docker-compose.yml" "$ROOT/deploy/nas/README.md" "$OUT_DIR/"

echo "Done:"
ls -lh "$OUT_DIR"
