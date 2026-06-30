#!/usr/bin/env bash
# Archive + upload The Clubhouse to App Store Connect WITHOUT the
# "Upload Symbols Failed" warnings (uploadSymbols=false in ExportOptions.plist).
#
# Usage:
#   ./scripts/ios-release.sh
#
# Auth: uses the Apple ID you're signed into in Xcode (Settings → Accounts).
# For CI / non-interactive, export an App Store Connect API key first:
#   export ASC_KEY_ID=XXXX ASC_ISSUER_ID=xxxx-... ASC_KEY_PATH=/path/AuthKey_XXXX.p8
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
ARCHIVE="$ROOT/build/TheClubhouse.xcarchive"
EXPORT_DIR="$ROOT/build/export"
WORKSPACE="ios/TheClubhouse.xcworkspace"
SCHEME="TheClubhouse"

echo "▸ Archiving (Release)…"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE" \
  -destination 'generic/platform=iOS' \
  clean archive

echo "▸ Exporting + uploading to App Store Connect (no symbol upload)…"
AUTH_ARGS=()
if [[ -n "${ASC_KEY_ID:-}" && -n "${ASC_ISSUER_ID:-}" && -n "${ASC_KEY_PATH:-}" ]]; then
  AUTH_ARGS=(-authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID" -authenticationKeyPath "$ASC_KEY_PATH")
fi

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportOptionsPlist "ios/ExportOptions.plist" \
  -exportPath "$EXPORT_DIR" \
  ${AUTH_ARGS[@]+"${AUTH_ARGS[@]}"}

echo "✓ Done. Uploaded build is in App Store Connect → TestFlight (processing)."
