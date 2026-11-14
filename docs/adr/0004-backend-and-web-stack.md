# 4. Backend and web stack

## Status

Accepted

## Context

The product needs a backend for accounts, profiles, customer support and feature flags, a customer web app with the same flow as iOS, and a back office.

## Decision

- Backend: ASP.NET Core minimal APIs on .NET 10, bearer-token auth, Dev/SYST/Prod via `ASPNETCORE_ENVIRONMENT`.
- Storage starts in memory behind repository interfaces, so the starter runs with no database. A database (for example EF Core with PostgreSQL) is added by implementing the interfaces.
- Web app and back office: React + TypeScript + Vite, each a separate app with the same structure and design system.
- Tests: xUnit for the backend; Vitest and Playwright for the web apps, with end-to-end tests against the real backend in SYST.

## Consequences

- The whole stack runs locally with `dotnet run` and `npm run dev`.
- Data resets on backend restart until a database is added.
