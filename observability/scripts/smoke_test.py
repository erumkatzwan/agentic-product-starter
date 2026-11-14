"""Checks that the API's telemetry reaches the local stack and that every dashboard query returns data.

Run after `docker compose -f observability/docker-compose.yml up -d` and some traffic against the API in Dev.
"""
import json
import pathlib
import sys
import time
import urllib.parse
import urllib.request

PROMETHEUS = "http://localhost:9090"
GRAFANA = "http://localhost:3000"
DASHBOARDS = pathlib.Path(__file__).resolve().parent.parent / "grafana" / "dashboards"


def get(url, auth=None):
    request = urllib.request.Request(url)
    if auth:
        request.add_header("Authorization", auth)
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def promql(expr):
    return get(f"{PROMETHEUS}/api/v1/query?" + urllib.parse.urlencode({"query": expr}))["data"]["result"]


def wait_for(description, check, seconds=120):
    deadline = time.time() + seconds
    last_error = None
    while time.time() < deadline:
        try:
            if check():
                print(f"ok   {description}")
                return True
        except Exception as error:  # noqa: BLE001 - keep polling until the deadline
            last_error = error
        time.sleep(5)
    print(f"FAIL {description}" + (f" ({last_error})" if last_error else ""))
    return False


def main():
    ok = wait_for("HTTP server metrics in Prometheus", lambda: promql("http_server_request_duration_seconds_count"))
    series = promql("http_server_request_duration_seconds_count")
    service = series[0]["metric"].get("job", "") if series else ""
    print(f"     job label: {service!r}; labels: {sorted(series[0]['metric']) if series else []}")
    ok &= wait_for("product metrics (sign-ins by result)", lambda: promql('sum by (result) (app_sign_ins_total)'))

    for path in sorted(DASHBOARDS.glob("*.json")):
        dashboard = json.loads(path.read_text())
        for panel in dashboard["panels"]:
            for target in panel.get("targets", []):
                expr = target["expr"].replace("$service", service).replace("$environment", ".*").replace("[24h]", "[1h]")
                ok &= wait_for(f"{path.stem}: {panel['title']} ({target['refId']})", lambda e=expr: promql(e), 60)

    auth = "Basic YWRtaW46YWRtaW4="  # admin:admin, the image's local default
    ok &= wait_for("traces in Tempo", lambda: get(f"{GRAFANA}/api/datasources/proxy/uid/tempo/api/search?limit=5", auth).get("traces"))
    ok &= wait_for("dashboard provisioned in Grafana", lambda: get(f"{GRAFANA}/api/dashboards/uid/api-overview", auth))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
