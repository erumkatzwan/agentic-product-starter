# Android app

Native Android app (AgenticApp) (Kotlin, Jetpack Compose, Material 3, Navigation 3, Android 8.0+). Same screens, flow, flags, fixtures and test IDs as the iOS app.

## Skills

- Follow the root `AGENTS.md` first. Shared skills in the root `.agents/skills/` are used for refinement, planning, defining tasks and code review.
- Work arrives as a ticket from the shared SDLC (`to-spec` → `to-tickets`). Build it with the shared `implement` and `tdd` skills, applying the Android skills below for how to build on Android.
- Android skills live in `apps/android/.agents/skills/`:
  - `android-architecture` – layers, where code goes, new-feature checklist
  - `android-design-system` – AppTheme tokens and DS components
  - `android-rest-api` – endpoints, repositories, fixtures
  - `android-feature-flags` – switching features on and off
  - `android-testing` – unit, UI and end-to-end tests
  - Google's official Android skills (Apache 2.0): `navigation-3`, `edge-to-edge`, `jetpack-compose-performance`, `testing-setup`, `agp-9-upgrade`, `r8-analyzer`, `restore-credentials`, `android-permissions-security`, `android-intent-security`. Our `android-*` skills take priority.

## Commands

Run from `apps/android`: `make build`, `make lint`, `make typos`, `make test-unit`, `make test-ui`, `make e2e`, `make ci`.

## Environments

Product flavors `dev`, `syst` (SYST), `prod`, with values in `app/src/<flavor>/`. Tests run against `syst`. Never point local work at `prod`.

## Definition of done

- `make ci` passes locally and all pull request checks are green.
- New logic has unit tests, new screens have a UI test, new journeys have a Maestro flow.
- New or unfinished features are behind a feature flag.
- The same story behaves the same on iOS.
