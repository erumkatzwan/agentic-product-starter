# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them privately through GitHub: go to the **Security** tab of this repository and choose **Report a vulnerability**. You will get an answer within a few days.

Include what you found, where (app, file or endpoint), and how to reproduce it.

## What is checked automatically

| Check | When | What it does |
|---|---|---|
| Dependabot alerts and security updates | Continuously | Alerts on vulnerable dependencies in every app and opens fix pull requests |
| Dependency review | Every pull request | Blocks pull requests that add a dependency with a high or critical vulnerability |
| CodeQL | Every pull request and weekly | Static analysis of Swift, Kotlin, C#, TypeScript, Python and the workflows |
| Secret scanning with push protection | Every push | Blocks commits that contain keys or tokens |
| Vulnerability report (`scripts/security-audit.mjs`) | Weekly and on demand | One report across all apps with the version that fixes each finding, published to the [security dashboard](https://erumkatzwan.github.io/agentic-product-starter/security/) and the README badge (turn off with the `SECURITY_DASHBOARD` variable) |

How to triage and fix findings: `.agents/skills/security-audit/SKILL.md`.

## Supported versions

This is a starter template. Fixes go into `main`; products built from it should pull them in or apply the same updates.
