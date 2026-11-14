#!/usr/bin/env bash
# Fails when unit-test line coverage of the app's logic is below the minimum.
# SwiftUI views, the design system and app wiring are excluded: UI tests and end-to-end tests cover those.
# Usage: scripts/check-coverage.sh build/Unit.xcresult 70
set -euo pipefail
RESULT="${1:?path to .xcresult}"
MINIMUM="${2:-70}"
xcrun xccov view --report --json "$RESULT" | python3 -c '
import json, re, sys
minimum = float(sys.argv[1])
report = json.load(sys.stdin)
target = next(t for t in report["targets"] if t["name"].startswith("Consent.app"))
excluded = re.compile(r"(View\.swift$|/DesignSystem/|/App/|FeatureGate\.swift$)")
covered = executable = 0
for f in target["files"]:
    if excluded.search(f["path"]):
        continue
    covered += f["coveredLines"]
    executable += f["executableLines"]
coverage = 100.0 * covered / executable if executable else 100.0
print(f"Logic line coverage: {coverage:.1f}% (minimum {minimum:.0f}%)")
if coverage < minimum:
    print(f"::error::Coverage {coverage:.1f}% is below {minimum:.0f}%")
    sys.exit(1)
' "$MINIMUM"
