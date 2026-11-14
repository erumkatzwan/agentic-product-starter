# Agent guide

Read this first, then the `AGENTS.md` in the component you are working on.

## Context

- Product context: `docs/product/`. Domain language: `GLOSSARY.md` (created when terms get settled).
- Architecture: `docs/architecture/README.md` (arc42 + C4 diagrams). Decisions: `docs/adr/` (MADR 4, indexed in `docs/adr/README.md`).
- Shared skills: `.agents/skills/` (see its README for which skill to use at each stage).
- Platform skills: `<component>/.agents/skills/`.

## The agentic SDLC

1. **Shape** – `grill-me`, `wayfinder`, `research`, `prototype`
2. **Refine** – `grill-with-docs`, `domain-modeling`, `architecture-decisions`
3. **Specify** – `to-spec` (a GitHub issue)
4. **Plan** – `to-tickets`, `triage`
5. **Build** – read the architecture overview and ADRs (`architecture-decisions`), then `implement` / `implement-spec` + `tdd`, plus the component's platform skills
6. **Review** – `code-review`, `pr` and the `architecture-decisions` checklist; all CI checks must be green
7. **Fix and improve** – `diagnosing-bugs`, `improve-codebase-architecture`
8. **Learn** – `retro`, `handoff`

When a shared skill and a platform skill disagree on *how to build*, the platform skill wins. On *what to build*, the spec and ADRs win.

## Components

| Folder | What it is | Agent guide |
|---|---|---|
| `apps/ios` | Native iOS app (SwiftUI) | `apps/ios/AGENTS.md` |
| `apps/android` | Native Android app (Jetpack Compose) | `apps/android/AGENTS.md` |
| `apps/web-app` | Customer web app (React) | `apps/web-app/AGENTS.md` |
| `apps/back-office` | Admin and support tool (React) | `apps/back-office/AGENTS.md` |
| `apps/website` | One-page landing website | `apps/website/AGENTS.md` |
| `backend` | .NET API for every app | `backend/AGENTS.md` |
| `design` | Design tokens for every app | `design/README.md` |

## Shared rules

- One branch per ticket. Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Every feature works end to end before it ships: unit, UI and end-to-end tests.
- Unfinished work is merged behind a feature flag that defaults to off.
- Environments: Dev, SYST, Prod. Never point local work at Prod.
- Architecture first: before coding, read `docs/architecture/README.md` and the accepted ADRs in the area. Never silently work around an ADR; a change that alters a decision adds a new ADR (superseding the old one) and updates the overview and diagrams in the same pull request.
- Colours, spacing and type come only from `design/tokens.json`. Change it there and run `node design/build.mjs`.
- One flow across apps: a change to accounts, profile or feature flags updates the backend and every app that uses it in the same pull request.
- Never commit secrets, keys or customer data. This repository is public.

## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. ADRs use MADR 4 (`docs/adr/template.md`) and the architecture overview is `docs/architecture/README.md`. See `docs/agents/domain.md` and the `architecture-decisions` skill.
