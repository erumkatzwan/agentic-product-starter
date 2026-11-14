# Agentic Product Starter

A starter monorepo for building a product with AI coding agents. It gives you one place for the product context, shared agent skills, and an app per platform, with quality gates that keep every change tested before it reaches `main`.

Copy it for each new product, rename it, and start writing stories.

## What's inside

| Folder | What it is | Status |
|---|---|---|
| `docs/` | Product context: vision, stories, decisions | Structure ready |
| `.agents/skills/` | Shared agent skills: refinement, planning, task definition, code review | Structure ready |
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
├── .agents/skills/        # Shared skills
├── docs/
│   ├── product/           # Vision, roadmap, personas
│   ├── stories/           # Epics and user stories
│   └── decisions/         # Architecture decision records (ADRs)
├── apps/
│   ├── ios/  android/  web-app/  website/  back-office/
└── backend/
```

Each component has its own `README.md`, `AGENTS.md` and `.agents/skills/`.

## How the agents work here

1. **Define once, at the root.** Stories and context live in `docs/`. Shared skills in `.agents/skills/` are used to refine stories, plan, break work into tasks and review code.
2. **Build per platform.** Each component's `AGENTS.md` and skills tell the agent how to design, build and test for that platform.
3. **Ship only when green.** Every pull request runs the component's checks. Nothing merges into `main` unless all checks pass.

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
- Daily workflow: branch from `main` per story, let the agent implement it, run the checks, open a pull request, merge when green.

## Contributions

This repository is public to read, but it does not accept contributions. Only the owner can open pull requests and issues.
