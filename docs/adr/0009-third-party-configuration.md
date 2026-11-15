---
status: accepted
date: 2026-11-15
decision-makers: Erum Awan
---

# Third-party settings in .env.local and GitHub Environments

## Context and Problem Statement

The starter can use outside services (Sentry, Grafana Cloud) and will need store and hosting accounts when a product is published. Everyone who copies the template needs their own accounts and keys, the repository is public, and four platforms read settings in four different ways (xcconfig, Gradle, Vite, .NET). How does someone find out what can be connected, and where do the values go?

## Decision Drivers

* The product must build, run and pass CI with no accounts at all
* No keys in a public repository, not even placeholders that look real
* One list a person or an agent can read to see what exists and what is still off
* The same mechanism locally, in CI and in deploy workflows
* Template copies should get the repository settings (quality gates, security) too

## Considered Options

* One registry (`config/integrations.json`), values in a git-ignored `.env.local` locally and in GitHub Environments for SYST and Prod, read by every build as environment variables
* Values in each platform's own files (xcconfig, `FlavorConfig.kt`, `.env` per web app)
* A secrets manager (1Password, Doppler, Azure Key Vault) from the start

## Decision Outcome

Chosen option: "registry + `.env.local` + GitHub Environments", because it needs nothing beyond GitHub, keeps every value out of the code, and gives all four platforms one name per setting (`SENTRY_DSN_IOS`, `OTEL_EXPORTER_OTLP_ENDPOINT`…). `node scripts/setup.mjs` shows what is on, explains how to get each value, saves values in the right place, and applies the GitHub settings in `config/repo-settings.json` that a template copy does not inherit.

How each build reads a value: Vite `define` (web app, back office), a Gradle `BuildConfig` field (Android), a generated, git-ignored `Config/Secrets.xcconfig` (iOS, `make generate`), and the standard OpenTelemetry variables (backend).

### Consequences

* Good, because forks, tests and CI send nothing anywhere until someone adds a value on purpose.
* Good, because a new integration is one entry in the registry and one in `.env.example`, and the **Setup check** fails if code reads a setting that is not listed.
* Good, because a team can move to a secrets manager later by having it fill the same environment variables.
* Bad, because GitHub Environment secrets reach builds only through workflows; there are no deploy workflows yet, so SYST and Prod values are stored ahead of time.
* Bad, because `setup.mjs repo` needs an admin token and some settings (code scanning on private repositories) need a paid plan.

### Confirmation

* The **Setup check** workflow runs the tests in `scripts/setup.test.mjs`: the registry, `.env.example`, the code and the required checks in `config/repo-settings.json` must agree.
* Secret push protection blocks known key formats if one is committed by mistake.

## More Information

README section "Make it yours", the `setup-integrations` skill, and [Architecture overview](../architecture/README.md#89-third-party-settings).
