# Backend

ASP.NET Core (.NET 10) API used by the iOS app, web app and back office.

## Skills

- Follow the root `AGENTS.md` first. Work arrives as a ticket from the shared SDLC; build it with the shared `implement` and `tdd` skills.
- Backend skills live in `backend/.agents/skills/`:
  - `backend-architecture` – layers, endpoints, auth, adding a feature
  - `backend-testing` – unit and integration tests, coverage

## Commands

Run from `backend`: `dotnet run --project src/AgenticProduct.Api --launch-profile Dev`, `dotnet format`, `dotnet build`, `dotnet test`.

## Environments

`Dev`, `Syst`, `Prod` (`ASPNETCORE_ENVIRONMENT`). Tests run as `Syst`.

## Definition of done

- `dotnet format --verify-no-changes`, `dotnet build` (warnings fail) and `dotnet test` pass; API line coverage stays at or above 70%.
- New endpoints have integration tests; new rules have unit tests.
- Every app that calls a changed endpoint is updated in the same pull request.
