# Agentic Product Starter

A starter monorepo for building a product with AI coding agents. It gives you one place for the product context, shared agent skills, and an app per platform, with quality gates that keep every change tested before it reaches `main`.

Copy it for each new product, rename it, and start writing stories.

## What's inside

| Folder | What it is | Status |
|---|---|---|
| `docs/` | Product context, decisions (ADRs) and agent setup | Ready |
| `.agents/skills/` | 27 shared skills covering the whole SDLC, from idea to retro | Ready |
| `apps/ios/` | Native iOS app (Swift, SwiftUI) | **Ready** – see [apps/ios/README.md](apps/ios/README.md) |
| `apps/android/` | Native Android app (Kotlin, Jetpack Compose) | Planned |
| `apps/web-app/` | Signed-in web app for users | Planned |
| `apps/website/` | One-page marketing website | Planned |
| `apps/back-office/` | Internal admin tool | Planned |
| `backend/` | Cloud setup, APIs, infrastructure as code | Planned |

```
/
├── AGENTS.md              # Shared agent rules; points to each component's AGENTS.md
├── CLAUDE.md              # Loads AGENTS.md for Claude Code
├── .agents/skills/        # Shared skills (idea → spec → tickets → build → review → retro)
├── GLOSSARY.md            # Domain language (created by the agents when terms are settled)
├── docs/
│   ├── product/           # Vision, roadmap, personas
│   ├── adr/               # Architecture decision records
│   └── agents/            # How the skills use this repo: issue tracker, labels, domain docs
├── apps/
│   ├── ios/  android/  web-app/  website/  back-office/
└── backend/
```

Each component has its own `README.md`, `AGENTS.md` and `.agents/skills/`.

## The agentic SDLC

| Stage | Shared skills | Where it lands |
|---|---|---|
| 1. Shape the idea | `grill-me`, `wayfinder`, `research`, `prototype` | `docs/product/`, decision notes |
| 2. Refine | `grill-with-docs`, `domain-modeling` | `GLOSSARY.md`, `docs/adr/` |
| 3. Specify | `to-spec` | A spec in GitHub Issues |
| 4. Plan | `to-tickets`, `triage` | Agent-ready tickets with labels |
| 5. Build | `implement` / `implement-spec`, `tdd` + platform skills | A branch with code and tests |
| 6. Review | `code-review`, `pr` | A pull request; all checks must be green |
| 7. Fix and improve | `diagnosing-bugs`, `improve-codebase-architecture` | Fixes and refactor proposals |
| 8. Learn | `retro`, `handoff` | Better skills, checks and `AGENTS.md` |

Shared skills come from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Platform skills live in each app, for example `apps/ios/.agents/skills/`. Details: [.agents/skills/README.md](.agents/skills/README.md).

## Quality gates (iOS today, every app later)

| Check | What it guards |
|---|---|
| Lint | Code style and common mistakes; warnings fail |
| Spelling | Typos in code and docs |
| Unit tests + coverage | Logic is tested; coverage must stay at or above 70% |
| UI tests | Screens and navigation on the simulator |
| End-to-end tests | Full user journeys on the simulator with test data |

## Environments

Every component uses the same three environments: **Dev**, **SYST** (system test) and **Prod**.

## Feature flags

Features, screens and components can be switched on or off from the backend or on the device, so unfinished work can be merged safely behind a flag.

## Getting started

- iOS: follow the tutorial in [apps/ios/README.md](apps/ios/README.md).
- Daily workflow: shape and specify with the shared skills, create tickets, then one branch per ticket: implement, run the checks, open a pull request, merge when green, and run a retro now and then.

## Contributions

This repository is public to read, but it does not accept contributions. Only the owner can open pull requests and issues.
