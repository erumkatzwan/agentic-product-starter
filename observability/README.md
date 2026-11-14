# Observability

See what the product is doing in every environment: **traces, metrics and logs** from the backend through [OpenTelemetry](https://opentelemetry.io), shown in [Grafana](https://grafana.com). Crash and error reporting for the apps follows in the next step (see [ADR-0008](../docs/adr/0008-observability.md)).

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
2. Set these on the SYST and Prod hosts (as secrets):

   | Variable | Value |
   |---|---|
   | `OTEL_EXPORTER_OTLP_ENDPOINT` | The OTLP endpoint from Grafana Cloud |
   | `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` |
   | `OTEL_EXPORTER_OTLP_HEADERS` | `Authorization=Basic <base64 of instance-id:token>` |

3. Import `grafana/dashboards/api-overview.json` in Grafana Cloud (**Dashboards → New → Import**).

Each data point carries `deployment.environment.name` (Dev, Syst, Prod) as a resource attribute.

## Add your own

* **A product metric:** add a counter or histogram to `backend/src/AgenticProduct.Api/Observability/AppMetrics.cs`, call it where the event happens, and add a panel to the dashboard.
* **A dashboard:** build it in local Grafana, export it as JSON (**Share → Export**, without "external" mode) into `grafana/dashboards/`, and use `job=~"$service"` in queries.

The **Observability** workflow starts this stack in CI, sends traffic to the API and fails if metrics, traces or any dashboard query come back empty (`scripts/smoke_test.py`). The `observability` skill (`.agents/skills/observability/`) walks an agent through instrumenting a new feature.
