---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# One monorepo with shared and platform skills

## Context and Problem Statement

The product has several apps (iOS, Android, web app, back office, website) and a backend. AI agents need one place for product context and the way work is defined, plus platform-specific guidance for how each part is built. Where does all of this live?

## Decision Drivers

* One idea should be shaped, specified and ticketed once, then built on every platform
* Agents must find the right context without being told
* Shared skills must stay easy to update from their source

## Considered Options

* One monorepo with shared skills at the root and platform skills per component
* One repository per app, with shared docs copied into each
* One repository per app plus a separate docs repository

## Decision Outcome

Chosen option: "One monorepo with shared skills at the root and platform skills per component", because it is the only option where one pull request can change the backend and every app together, and every agent reads the same context.

### Consequences

* Good, because product context, `GLOSSARY.md`, ADRs and shared skills live once at the root and apply everywhere.
* Good, because each component has its own `AGENTS.md` and `.agents/skills/`, so platform rules stay local.
* Good, because specs and tickets live in GitHub Issues and code merges into `main` only through a pull request with every check green.
* Bad, because CI must use path filters so each pull request runs only the checks it needs.

### Confirmation

The `main` ruleset requires a pull request and the checks of every component. Each workflow's `changes` job decides which checks run.

## More Information

See [Architecture overview](../architecture/README.md#5-building-blocks) for the folder layout and [`.agents/skills/README.md`](../../.agents/skills/README.md) for the skill stages.
