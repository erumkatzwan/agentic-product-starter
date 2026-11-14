"""Fails when line coverage of the API is below the minimum. Usage: check-coverage.py <TestResults dir> <min %>"""
import glob
import sys
import xml.etree.ElementTree as ET

results, minimum = sys.argv[1], float(sys.argv[2])
files = glob.glob(f"{results}/**/coverage.cobertura.xml", recursive=True)
if not files:
    sys.exit("No coverage report found.")
root = ET.parse(files[0]).getroot()
package = next(p for p in root.iter("package") if p.get("name") == "AgenticProduct.Api")
coverage = float(package.get("line-rate")) * 100
print(f"API line coverage: {coverage:.1f}% (minimum {minimum:.0f}%)")
if coverage < minimum:
    print(f"::error::Coverage {coverage:.1f}% is below {minimum:.0f}%")
    sys.exit(1)
