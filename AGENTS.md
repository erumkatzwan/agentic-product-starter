# Agent guide

Read this first, then the `AGENTS.md` in the component you are working on.

## Context

- Product context: `docs/product/`. Domain language: `GLOSSARY.md` (created when terms get settled). Decisions: `docs/adr/`.
- Shared skills: `.agents/skills/` (see its README for which skill to use at each stage).
- Platform skills: `<component>/.agents/skills/`.

## The agentic SDLC

1. **Shape** – `grill-me`, `wayfinder`, `research`, `prototype`
2. **Refine** – `grill-with-docs`, `domain-modeling`
3. **Specify** – `to-spec` (a GitHub issue)
4. **Plan** – `to-tickets`, `triage`
5. **Build** – `implement` / `implement-spec` + `tdd`, plus the component's platform skills
6. **Review** – `code-review`, `pr`; all CI checks must be green
7. **Fix and improve** – `diagnosing-bugs`, `improve-codebase-architecture`
8. **Learn** – `retro`, `handoff`

When a shared skill and a platform skill disagree on *how to build*, the platform skill wins. On *what to build*, the spec and ADRs win.

## Components

| Folder | What it is | Agent guide |
|---|---|---|
| `apps/ios` | Native iOS app (ready) | `apps/ios/AGENTS.md` |
| `apps/android` | Native Android app (planned) | `apps/android/AGENTS.md` |
| `apps/web-app` | Signed-in web app (planned) | `apps/web-app/AGENTS.md` |
| `apps/website` | One-page marketing website (planned) | `apps/website/AGENTS.md` |
| `apps/back-office` | Internal admin tool (planned) | `apps/back-office/AGENTS.md` |
| `backend` | Cloud setup and APIs (planned) | `backend/AGENTS.md` |

## Shared rules

- One branch per ticket. Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Every feature works end to end before it ships: unit, UI and end-to-end tests.
- Unfinished work is merged behind a feature flag that defaults to off.
- Environments: Dev, SYST, Prod. Never point local work at Prod.
- Never commit secrets, keys or customer data. This repository is public.

## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
