---
status: accepted
date: 2026-11-15
decision-makers: Erum Awan
---

# Observability with OpenTelemetry, Grafana and Sentry

## Context and Problem Statement

Once real customers use the product, we need to know when something breaks, how fast it is, and how features are used, in every environment, across the backend and four apps. Which tools give us traces, metrics, logs and crash reports without locking the starter to one vendor or putting keys in a public repository?

## Decision Drivers

* Vendor-neutral instrumentation, so the backend can send data anywhere
* Free to start for a public starter, with a local stack for Dev
* Crash reports with stack traces from iOS, Android and the browser, similar to Firebase Crashlytics
* Off by default: no data leaves a machine unless an environment is configured for it
* Provable in CI, like every other part of the starter

## Considered Options

* **Backend:** OpenTelemetry exporting over OTLP to Grafana (local LGTM stack for Dev, Grafana Cloud for SYST and Prod)
* **Backend:** a vendor SDK (Application Insights, Datadog) directly
* **Apps:** Sentry for crash and error reporting on iOS, Android, web app and back office
* **Apps:** Firebase Crashlytics (mobile only) plus something else for the web

## Decision Outcome

Chosen options: "OpenTelemetry to Grafana" for the backend, because OTLP is a standard every major vendor accepts and Grafana's open-source stack runs locally in one container; and "Sentry" for the apps, because one tool covers iOS, Android and the browser with the same issue view, it has a free tier, and it can be self-hosted.

### Consequences

* Good, because changing backend vendor is a configuration change (`OTEL_EXPORTER_OTLP_*`), not a code change.
* Good, because Dev gets the same dashboards as Prod with `docker compose up`, and CI proves that telemetry arrives and every dashboard query returns data.
* Good, because nothing is exported unless an endpoint (backend) or DSN (apps) is set, so tests and forks stay quiet.
* Bad, because there are two tools (Grafana and Sentry) to look at; Sentry can also receive OpenTelemetry traces later if we want one view.
* Bad, because Grafana Cloud's free tier has retention and volume limits; production traffic may need a paid plan or self-hosting.

### Confirmation

* The **Observability** workflow starts the local stack, sends traffic to the API and fails if metrics, traces or any dashboard query are empty.
* Unit tests in every app check that crash reporting stays off without a DSN and in UI tests, and backend tests check the product metrics and that export stays off without an endpoint.
* Reviews check that telemetry carries no personal data (the `observability` skill has the checklist).

## More Information

`observability/README.md` (how to run and connect Grafana Cloud), the `observability` skill, and [Architecture overview](../architecture/README.md#87-observability).
