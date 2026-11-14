---
# MADR 4 template, adapted for this repo. Copy to docs/adr/NNNN-short-title.md.
status: proposed # proposed | accepted | rejected | deprecated | superseded by ADR-NNNN
date: YYYY-MM-DD # when the decision was last updated
decision-makers: Name
# consulted: who gave input (two-way)
# informed: who is kept up to date (one-way)
---

# {Short title: the problem and the chosen solution}

## Context and Problem Statement

{2-4 sentences. What forces this decision now? Which part of the system does it touch? Link the spec or issue.}

## Decision Drivers

* {quality, constraint or force, for example "same flow on every app" or "runs locally without a database"}

## Considered Options

* {option 1}
* {option 2}

## Decision Outcome

Chosen option: "{option}", because {why it best meets the drivers}.

### Consequences

* Good, because {positive effect}
* Bad, because {cost or limitation we accept}

### Confirmation

{How we know the decision is followed: a CI check, a test, a lint rule or a review step. Prefer something automated.}

## Pros and Cons of the Options

### {option 1}

* Good, because {argument}
* Bad, because {argument}

### {option 2}

* Good, because {argument}
* Bad, because {argument}

## More Information

{Links: architecture overview section, related ADRs, specs, docs. When to revisit.}

<!-- Based on MADR 4 (https://adr.github.io/madr/), MIT or CC0. Optional sections can be removed. -->
