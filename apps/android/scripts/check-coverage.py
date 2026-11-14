#!/usr/bin/env python3
"""Fails when unit-test line coverage of app logic is below the minimum.

Reads the JaCoCo XML report that AGP writes for the SYST debug unit tests. Compose screens,
design-system components and Android-only glue are covered by UI and end-to-end tests instead,
so they are left out here (same rule as the iOS coverage gate).

Usage: python3 scripts/check-coverage.py [minimum-percent]
"""
import glob
import re
import sys
import xml.etree.ElementTree as ET

MINIMUM = float(sys.argv[1]) if len(sys.argv) > 1 else 70.0
EXCLUDED = [
    r"Screen\.kt$",
    r"^RootScreen\.kt$",
    r"^MainActivity\.kt$",
    r"^AppContainer\.kt$",
    r"^FlavorConfig\.kt$",
    r"^FeatureGate\.kt$",
    r"^KeystoreTokenStore\.kt$",
    r"^SharedPreferencesFlagOverrideStore\.kt$",
    r"^PushNotificationService\.kt$",
]
EXCLUDED_PACKAGES = ["com/agentic/app/designsystem"]

reports = glob.glob("app/build/reports/coverage/test/**/report.xml", recursive=True)
if not reports:
    sys.exit("No coverage report found. Run: ./gradlew createSystDebugUnitTestCoverageReport")

root = ET.parse(reports[0]).getroot()
covered = missed = 0
rows = []
for package in root.iter("package"):
    if any(package.get("name", "").startswith(p) for p in EXCLUDED_PACKAGES):
        continue
    for source in package.iter("sourcefile"):
        name = source.get("name", "")
        if any(re.search(p, name) for p in EXCLUDED):
            continue
        for counter in source.findall("counter"):
            if counter.get("type") == "LINE":
                c, m = int(counter.get("covered")), int(counter.get("missed"))
                covered += c
                missed += m
                rows.append((name, c, m))

total = covered + missed
percent = 100.0 * covered / total if total else 0.0
for name, c, m in sorted(rows):
    print(f"  {name:45} {100.0 * c / (c + m) if c + m else 100:6.1f}%")
print(f"Logic coverage: {percent:.1f}% (minimum {MINIMUM:.0f}%)")
if percent < MINIMUM:
    sys.exit(1)
