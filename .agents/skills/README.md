# Shared skills

Skills used across every app and service, from idea to retro.

**Credit:** these skills are written by [Matt Pocock](https://github.com/mattpocock) and come from [mattpocock/skills](https://github.com/mattpocock/skills) (browse them at [aihero.dev/skills](https://www.aihero.dev/skills)). They are used unchanged under the MIT licence; see `LICENSE-mattpocock-skills`. How they are wired into this starter (`docs/agents/`, `AGENTS.md`, the platform skills) is part of the Agentic Product Starter.

Platform skills (how to build for iOS, Android, web…) live in each component's own `.agents/skills/`.

## The agentic SDLC, stage by stage

| Stage | Skills | Output |
|---|---|---|
| 0. Set up (once per repo) | `setup-matt-pocock-skills` | `docs/agents/*.md` (already done for this repo) |
| 1. Shape the idea | `grill-me`, `wayfinder`, `research`, `prototype` | Decisions, a map of open questions, throwaway prototypes |
| 2. Refine | `grill-with-docs`, `domain-modeling`, `to-questionnaire` | `GLOSSARY.md`, ADRs in `docs/adr/` |
| 3. Specify | `to-spec` | A spec as a GitHub issue |
| 4. Plan | `to-tickets`, `triage` | Small, agent-ready tickets with labels |
| 5. Build | `implement` or `implement-spec`, `tdd` + the component's platform skills | Code and tests on a branch |
| 6. Review | `code-review`, `pr` | A reviewed pull request; CI checks must be green |
| 7. Fix and improve | `diagnosing-bugs`, `improve-codebase-architecture`, `codebase-design` | Bug fixes, refactor proposals |
| 8. Learn | `retro`, `handoff` | Improvements to skills, checks and `AGENTS.md`; hand-over notes |

Helpers: `ask-matt` (which skill fits?), `grilling` (the interview other skills use), `wait-what` (explain it plainly), `teach`, `wizard`, `writing-for-agents`.

## Updating

Copy the newer version of a skill folder from the source repo. Keep our own changes in `AGENTS.md` and `docs/agents/`, not inside these folders, so updates stay a simple copy.
