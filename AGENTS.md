# Agent guide

Read this first, then the `AGENTS.md` in the component you are working on.

## Context

- Product context, stories and decisions live in `docs/`. Read the relevant story before starting work.
- Shared skills live in `.agents/skills/`. Use them for refinement, planning, defining tasks and code review.

## Components

| Folder | What it is | Agent guide |
|---|---|---|
| `apps/ios` | Native iOS app | `apps/ios/AGENTS.md` |
| `apps/android` | Native Android app | `apps/android/AGENTS.md` |
| `apps/web-app` | Signed-in web app | `apps/web-app/AGENTS.md` |
| `apps/website` | One-page marketing website | `apps/website/AGENTS.md` |
| `apps/back-office` | Internal admin tool | `apps/back-office/AGENTS.md` |
| `backend` | Cloud setup and APIs | `backend/AGENTS.md` |

## Shared rules

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Every feature works end to end before it ships: unit, UI and end-to-end tests.
- Environments: `dev`, `test`, `prod`. Never point local work at `prod`.
