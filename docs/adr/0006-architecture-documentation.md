---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# Document architecture with MADR, arc42 and C4

## Context and Problem Statement

Agents and people need the same picture of the system before they change it: what exists, why it was built that way, and which decisions must not be broken. Decisions were recorded in a short free-form format with no single overview. How do we document architecture so it stays consistent across the repo?

## Decision Drivers

* Every agent reads the same architecture context before coding
* Industry-standard formats that people already know
* Plain Markdown that GitHub renders, no extra tools required

## Considered Options

* MADR 4 for decisions + an arc42-lite overview with C4 diagrams in Mermaid
* Keep the minimal ADR format and add no overview
* A wiki or external tool (Confluence, Structurizr)

## Decision Outcome

Chosen option: "MADR 4 + arc42-lite + C4 in Mermaid", because all three are widely used standards, live next to the code, render on GitHub, and give agents one place to start (`docs/architecture/README.md`).

### Consequences

* Good, because every ADR has a status, date, options and a **Confirmation** that names the check enforcing it.
* Good, because the overview links every ADR, so context stays consistent across components.
* Good, because Mermaid diagrams are reviewed in pull requests like code.
* Bad, because the overview must be updated in the same pull request as an architecture change.

### Confirmation

The `architecture-decisions` skill and `AGENTS.md` require reading the overview and relevant ADRs before coding, and an ADR plus an overview update for any change that alters a decision. `code-review` checks this.

## More Information

* MADR: <https://adr.github.io/madr/> · arc42: <https://arc42.org> · C4: <https://c4model.com>
* Interactive diagrams: the optional [Archify](https://github.com/tt-a1i/archify) skill (see the `architecture-decisions` skill).
