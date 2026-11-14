# Web app

Signed-in web app for customers (React, TypeScript, Vite).

## Skills

- Follow the root `AGENTS.md` first. Work arrives as a ticket from the shared SDLC; build it with the shared `implement` and `tdd` skills.
- Skills for this app live in `apps/web-app/.agents/skills/`:
  - `web-architecture` – structure, API layer, auth, feature flags, design system
  - `web-testing` – unit and end-to-end tests

## Commands

Run from `apps/web-app`: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run e2e`.

## Environments

Dev, SYST, Prod via `src/config/env.ts` (Vite `--mode`). End-to-end tests run against SYST.

## Definition of done

- Lint, typecheck, unit tests (70% line coverage) and end-to-end tests pass.
- Styles use only design tokens; colours come from `design/tokens.json`.
- New or unfinished features are behind a feature flag.
