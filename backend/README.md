# Backend (.NET)

ASP.NET Core API for every app: accounts, profiles, customer administration and feature flags. Part of the [Agentic Product Starter](../README.md).

## Run it

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd backend
dotnet run --project src/AgenticProduct.Api --launch-profile Dev   # http://localhost:5080
dotnet test                                                          # unit + integration tests
```

In Dev and SYST two accounts are created at start-up:

| Account | Email | Password |
|---|---|---|
| Admin (back office) | `admin@example.com` | `Admin123!` |
| Demo customer | `customer@example.com` | `Customer123!` |

## API

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/api/auth/signup` | anyone | Create an account, returns a token |
| POST | `/api/auth/signin` | anyone | Sign in, returns a token |
| POST | `/api/auth/signout` | signed in | Invalidates every token for the user |
| GET / PUT / DELETE | `/api/me` | signed in | Read, update or delete your profile |
| GET | `/api/items` | anyone | Sample content for the home screens |
| GET | `/api/feature-flags` | anyone | `{ "flags": { "profile": true } }` |
| GET | `/api/admin/users?search=` | admin | Find customers |
| GET / PUT / DELETE | `/api/admin/users/{id}` | admin | View, edit (name, role, disabled) or delete a customer |
| GET / PUT | `/api/admin/feature-flags[/{key}]` | admin | List or switch feature flags |
| GET | `/health` | anyone | Health check |

Tokens: send `Authorization: Bearer <accessToken>`. Errors use standard problem details; validation errors list each field.

## Structure

```
backend/
├── src/AgenticProduct.Api/
│   ├── Program.cs        # Wiring: services, auth, CORS, endpoints
│   ├── Domain/           # User, FeatureFlag, Item
│   ├── Data/             # Repository interfaces + in-memory implementations, seed data
│   ├── Auth/             # AccountService (rules), tokens, current-user filter
│   ├── Endpoints/        # Auth, Profile, Admin, Public
│   └── Contracts/        # Request and response records
└── tests/AgenticProduct.Api.Tests/   # xUnit: unit tests + in-memory API integration tests
```

## Observability

Traces, metrics and logs go out through OpenTelemetry (`src/AgenticProduct.Api/Observability/`). The Dev launch profile sends them to the local Grafana stack; SYST and Prod send them wherever `OTEL_EXPORTER_OTLP_ENDPOINT` points. Without an endpoint nothing is exported. Product metrics live in `AppMetrics`. See [observability/README.md](../observability/README.md).

## Environments

`Dev`, `Syst` and `Prod`, set with `ASPNETCORE_ENVIRONMENT`. Each has its own `appsettings.<Env>.json` (CORS origins, seeding). Prod never seeds accounts.

## Storage

Data is kept in memory behind `IUserRepository` and `IFeatureFlagRepository`, so it resets on restart. To use a database, implement those two interfaces (for example with EF Core and PostgreSQL) and change the two registrations in `Program.cs`. See `docs/adr/0004-backend-and-web-stack.md`.
