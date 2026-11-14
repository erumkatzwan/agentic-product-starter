---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# Dependency security and updates with GitHub, OSV and Dependabot

## Context and Problem Statement

Every app depends on open-source packages from four ecosystems (npm, NuGet, Gradle, Swift) plus GitHub Actions and toolchains. Vulnerabilities appear in them every week and versions drift. How do we see vulnerabilities across the whole repo in one place and keep dependencies current without slowing work down?

## Decision Drivers

* One overview for every app, not one tool per platform
* Block new vulnerabilities before they merge
* Updates should mostly happen on their own, with CI deciding what is safe
* Free for a public repository, no extra accounts

## Considered Options

* GitHub's built-in security (Dependabot, dependency review, CodeQL, secret scanning) + an OSV-based report script + Dependabot version updates
* Renovate instead of Dependabot for version updates
* A commercial scanner (for example Snyk)

## Decision Outcome

Chosen option: "GitHub's built-in security + OSV report + Dependabot", because it covers every ecosystem in the repo, needs no app installs or accounts, and puts alerts, pull requests and checks in the same place the team already works.

### Consequences

* Good, because dependency review blocks pull requests that add high or critical vulnerabilities, and secret scanning blocks leaked keys at push time.
* Good, because `scripts/security-audit.mjs` gives one report across all apps with the version that fixes each finding, weekly and on demand.
* Good, because patch and minor updates are grouped per app, wait a few days after release, and merge automatically when CI is green.
* Bad, because Dependabot groups less flexibly than Renovate and has no dashboard issue; revisit if update volume grows.
* Bad, because toolchains (Xcode, JDK, .NET SDK, Node, Android SDK levels) are not covered by Dependabot and need the `update-dependencies` skill each quarter.

### Confirmation

* **Dependency review** is a required check on every pull request.
* The weekly **Security** workflow fails when a high or critical vulnerability is found.
* CodeQL default setup and secret push protection are on in the repository settings.

## More Information

See `SECURITY.md`, the `security-audit` and `update-dependencies` skills, and [Architecture overview](../architecture/README.md#86-security-and-dependencies). OSV: <https://osv.dev>.
