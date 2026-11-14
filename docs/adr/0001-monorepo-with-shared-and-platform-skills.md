# 1. Monorepo with shared and platform skills

## Status

Accepted

## Context

The product has several apps (iOS, Android, web app, website, back office) and a backend. Agents need one place for product context and the way work is defined, and platform-specific guidance for how it is built.

## Decision

- One monorepo. Product context, glossary, ADRs and shared skills live at the root.
- Each app or service has its own folder with its own `AGENTS.md` and `.agents/skills/`.
- Specs and tickets live in GitHub Issues. Code merges into `main` only through a pull request with all checks green.
- Every component uses the Dev, SYST and Prod environments.

## Consequences

- Work is shaped, specified and ticketed once, then built per platform.
- Shared skills can be updated by copying from their source repo without touching platform skills.
