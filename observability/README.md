# Observability

See what the product is doing in every environment: **traces, metrics and logs** from the backend through [OpenTelemetry](https://opentelemetry.io), shown in [Grafana](https://grafana.com), and **crash reports** from every app in [Sentry](https://sentry.io). See [ADR-0008](../docs/adr/0008-observability.md).

## Run it locally (Dev)

```bash
docker compose -f observability/docker-compose.yml up -d            # Grafana, Prometheus, Tempo, Loki
cd backend && dotnet run --project src/AgenticProduct.Api --launch-profile Dev
```

Open <http://localhost:3000> (admin / admin). The **API overview** dashboard opens first: requests, errors, latency, sign-ups and sign-ins. **Explore** shows traces (Tempo) and logs (Loki); every log line carries its trace ID.

The Dev launch profile sends data to `http://localhost:4318`. Without the stack running, nothing breaks; the data is simply dropped.

## What is collected

| Signal | Source | Examples |
|---|---|---|
| Traces | ASP.NET Core and `HttpClient` instrumentation | One trace per request, with route, status and timing (`/health` is skipped) |
| Metrics | ASP.NET Core, `HttpClient`, .NET runtime, `AppMetrics` | `http.server.request.duration`, GC and thread pool, `app.sign_ups`, `app.sign_ins{result}` |
| Logs | `ILogger` through OpenTelemetry | Structured logs linked to the trace they belong to |

Never put personal data (emails, names, tokens) in span attributes, metric tags or log messages. Use IDs.

## SYST and Prod: Grafana Cloud

The backend exports wherever the standard OpenTelemetry variables point. Nothing is hard-coded and no keys live in this repository.

1. Create a free [Grafana Cloud](https://grafana.com/products/cloud/) stack, then **Connections → OpenTelemetry (OTLP)** to get the endpoint and an access token.
2. Save them in the GitHub Environments with `node scripts/setup.mjs set OTEL_EXPORTER_OTLP_ENDPOINT --env Prod` (and the others below), and set them on the SYST and Prod hosts:

   | Variable | Value |
   |---|---|
   | `OTEL_EXPORTER_OTLP_ENDPOINT` | The OTLP endpoint from Grafana Cloud |
   | `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` |
   | `OTEL_EXPORTER_OTLP_HEADERS` | `Authorization=Basic <base64 of instance-id:token>` |

3. Import `grafana/dashboards/api-overview.json` in Grafana Cloud (**Dashboards → New → Import**).

Each data point carries `deployment.environment.name` (Dev, Syst, Prod), so one dashboard can switch between environments with its **Environment** filter.

## Crash reporting in the apps (Sentry)

iOS, Android, the web app and the back office report crashes and unexpected errors to Sentry, much like Firebase Crashlytics. Reporting is **off until you set a DSN**, and always off in UI and end-to-end tests.

1. Create a free [Sentry](https://sentry.io) organisation and one project per app (iOS, Android, React twice).
2. Save each project's DSN for SYST and Prod: `node scripts/setup.mjs set SENTRY_DSN_IOS --env Prod` (and `SENTRY_DSN_ANDROID`, `SENTRY_DSN_WEB_APP`, `SENTRY_DSN_BACK_OFFICE`). They go into GitHub Environments, never into the code.
3. To try it from your machine, put the same keys in `.env.local` at the repository root (copy `.env.example`). Leave them empty for everyday local work.

Each build reads its key from the environment or `.env.local`: the web apps through Vite, Android into `BuildConfig.SENTRY_DSN`, iOS through `Config/Secrets.xcconfig` (written by `make generate`). See [ADR-0009](../docs/adr/0009-third-party-configuration.md). The apps send no personal data: no emails, names or IP addresses.

Where it lives: `CrashReporter` in each app (`Core/Monitoring` on iOS, `core/monitoring` on Android, `src/monitoring` on the web). The web apps also wrap every screen in an `ErrorBoundary` that shows a calm message instead of a blank page. To report a handled error that should never happen, call `capture(error)` (`reportError(error)` on the web).

## Add your own

* **A product metric:** add a counter or histogram to `backend/src/AgenticProduct.Api/Observability/AppMetrics.cs`, call it where the event happens, and add a panel to the dashboard.
* **A dashboard:** build it in local Grafana, export it as JSON (**Share → Export**, without "external" mode) into `grafana/dashboards/`, and filter queries with `job=~"$service", deployment_environment_name=~"$environment"`.

The **Observability** workflow starts this stack in CI, sends traffic to the API and fails if metrics, traces or any dashboard query come back empty (`scripts/smoke_test.py`). The `observability` skill (`.agents/skills/observability/`) walks an agent through instrumenting a new feature.
