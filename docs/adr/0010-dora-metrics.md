---
status: accepted
date: 2026-11-15
decision-makers: Erum Awan
---

# Measure delivery with DORA metrics from GitHub data

## Context and Problem Statement

The starter promises that agents and people ship small, safe changes quickly. We need a way to see whether that is true over time, for this repository and for every product built from it, without extra tools or accounts.

## Decision Drivers

* The four DORA keys are the industry standard for delivery performance and are easy to explain
* Free and self-contained for a public starter: no external service, no secrets
* Works from day one, before any app deploys automatically
* Visible to anyone, next to the product, and kept as history

## Considered Options

* A weekly GitHub Actions workflow that computes the four keys from pull requests, workflow runs and `incident` issues, and a static dashboard on GitHub Pages
* [Apache DevLake](https://devlake.apache.org) with its DORA dashboards in Grafana
* A commercial engineering-metrics product (for example LinearB, Sleuth or Swarmia)

## Decision Outcome

Chosen option: "weekly workflow + static dashboard", because it needs nothing beyond GitHub, keeps the definition in one small tested script (`scripts/dora-metrics.mjs`), and publishes a page anyone can open. DevLake is the upgrade path when a product has several repositories, real deployment pipelines and an incident tool to connect.

Definitions:

* **Deployment:** a pull request merged into `main` (trunk-based: `main` is always releasable). When production deploy workflows exist, list them in `DEPLOY_WORKFLOWS` and their successful runs count instead.
* **Lead time for changes:** median time from a pull request's first commit to its merge.
* **Change failure rate:** (issues labelled `incident` + merged pull requests titled "Revert …") ÷ deployments.
* **Time to restore service:** median time from opening an `incident` issue to closing it.
* Levels (Elite, High, Medium, Low) follow the bands in the DORA State of DevOps reports.

### Consequences

* Good, because the numbers are reproducible from public GitHub data and the calculation is unit tested.
* Good, because opening an issue from the **Incident** template is all it takes to feed the failure and restore metrics.
* Bad, because counting merges as deployments flatters deployment frequency and lead time until real deployments are wired in.
* Bad, because incidents only count if someone opens the issue; an incident tool integration (DevLake) would be more complete.

### Confirmation

* The **DORA metrics** workflow runs the unit tests and a dry run against this repository on every change to the script.
* The website's end-to-end tests check that the dashboard renders all four keys and its empty state.

## More Information

Dashboard: `apps/website/dora/`. Script: `scripts/dora-metrics.mjs`. Skill: `dora-metrics`. [Architecture overview](../architecture/README.md#88-delivery-metrics-dora).
