# Shared skills

Skills used across every app and service, from idea to retro.

**Credit:** these skills are written by [Matt Pocock](https://github.com/mattpocock) and come from [mattpocock/skills](https://github.com/mattpocock/skills) (browse them at [aihero.dev/skills](https://www.aihero.dev/skills)). They are used unchanged under the MIT licence; see `LICENSE-mattpocock-skills`. How they are wired into this starter (`docs/agents/`, `AGENTS.md`, the platform skills) is part of the Agentic Product Starter.

Platform skills (how to build for iOS, Android, web…) live in each component's own `.agents/skills/`.

## Our own shared skills

These are part of the Agentic Product Starter, not Matt Pocock's set:

| Skill | Use it when |
|---|---|
| `architecture-decisions` | Before building; when a decision is hard to reverse. Keeps `docs/architecture/` (arc42 + C4) and `docs/adr/` ([MADR 4](https://adr.github.io/madr/)) consistent. Explains how to add [Archify](https://github.com/tt-a1i/archify) by tt-a1i (Apache 2.0) for interactive diagrams |
| `security-audit` | Setting up a new product, before a release, when a security check is red, or for a vulnerability overview across all apps |
| `update-dependencies` | Major updates, toolchains, or a failing Dependabot pull request |
| `rename-product` | Turning the starter into your own named product (name, app ID, repository) |
| `setup-integrations` | Setting up a new copy: GitHub settings, and turning on Sentry, Grafana Cloud or store accounts |
| `observability` | Adding metrics, logs or traces to a feature, debugging in any environment, or connecting Grafana Cloud and Sentry |

## The agentic SDLC, stage by stage

| Stage | Skills | Output |
|---|---|---|
| 0. Set up (once per repo) | `setup-matt-pocock-skills` | `docs/agents/*.md` (already done for this repo) |
| 1. Shape the idea | `grill-me`, `wayfinder`, `research`, `prototype` | Decisions, a map of open questions, throwaway prototypes |
| 2. Refine | `grill-with-docs`, `domain-modeling`, `to-questionnaire`, `architecture-decisions` | `GLOSSARY.md`, MADR ADRs in `docs/adr/`, `docs/architecture/` kept current |
| 3. Specify | `to-spec` | A spec as a GitHub issue |
| 4. Plan | `to-tickets`, `triage` | Small, agent-ready tickets with labels |
| 5. Build | `architecture-decisions` (read first), `implement` or `implement-spec`, `tdd` + the component's platform skills | Code and tests on a branch |
| 6. Review | `code-review`, `pr`, `architecture-decisions` checklist | A reviewed pull request; CI checks must be green |
| 7. Fix and improve | `diagnosing-bugs`, `improve-codebase-architecture`, `codebase-design` | Bug fixes, refactor proposals |
| 8. Learn | `retro`, `handoff` | Improvements to skills, checks and `AGENTS.md`; hand-over notes |

Helpers: `ask-matt` (which skill fits?), `grilling` (the interview other skills use), `wait-what` (explain it plainly), `teach`, `wizard`, `writing-for-agents`.

## Updating

Copy the newer version of a skill folder from the source repo. Keep our own changes in `AGENTS.md` and `docs/agents/`, not inside these folders, so updates stay a simple copy.
