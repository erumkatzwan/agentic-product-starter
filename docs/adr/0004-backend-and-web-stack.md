---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# .NET backend and React web apps

## Context and Problem Statement

The product needs a backend for accounts, profiles, customer support and feature flags, a customer web app with the same flow as the mobile apps, and a back office. Which stacks do we use?

## Decision Drivers

* The whole stack runs locally with no database or cloud account
* Strong typing end to end
* End-to-end tests against the real backend

## Considered Options

* ASP.NET Core minimal APIs (.NET 10) + React, TypeScript and Vite
* Node.js (NestJS) + React
* A backend-as-a-service (for example Supabase or Firebase) + React

## Decision Outcome

Chosen option: "ASP.NET Core minimal APIs (.NET 10) + React, TypeScript and Vite", because .NET gives a fast, typed API with built-in auth and testing, and React with Vite is the most common web stack for agents to work in.

### Consequences

* Good, because bearer-token auth, problem details and Dev/SYST/Prod (`ASPNETCORE_ENVIRONMENT`) come with the framework.
* Good, because storage sits behind repository interfaces (`IUserRepository`, `IFeatureFlagRepository`), so a database can be added later without touching endpoints.
* Good, because the web app and back office share one structure and design system.
* Bad, because data lives in memory and resets on restart until a database is added (see Risks in the architecture overview).

### Confirmation

CI runs `dotnet format`, a build with warnings as errors, xUnit tests with 70% coverage, and Playwright end-to-end tests of both web apps against the backend in SYST.

## Pros and Cons of the Options

### Node.js (NestJS)

* Good, because one language across backend and web
* Bad, because more choices to make for auth, validation and testing

### Backend-as-a-service

* Good, because fastest to start
* Bad, because vendor lock-in and harder to run tests locally

## More Information

See [`backend/README.md`](../../backend/README.md) and [Architecture overview](../architecture/README.md#52-containers). Adding a database deserves its own ADR.
