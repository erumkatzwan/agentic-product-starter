---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# One set of design tokens generated for every app

## Context and Problem Statement

Every app (iOS, Android, web app, back office, website) must look like one product, and the palette must be changeable at any time without editing each app. Figma is not used yet but may be later. Where do colours, spacing and type come from?

## Decision Drivers

* One edit changes the look everywhere
* Apps must not drift apart
* Ready for Figma later

## Considered Options

* `design/tokens.json` (W3C Design Tokens format) with a generator for each platform
* Hand-maintained theme files per app
* Style Dictionary or another token build tool

## Decision Outcome

Chosen option: "`design/tokens.json` with our own small generator (`design/build.mjs`)", because it needs no dependencies, outputs exactly what each app uses (`tokens.css`, `DesignTokens.swift`, `DesignTokens.kt`), and the format syncs with Figma through Tokens Studio.

### Consequences

* Good, because one edit to `tokens.json` restyles every app.
* Good, because apps style only with generated tokens, never hard-coded values.
* Bad, because a new platform means adding a few lines to the generator.

### Confirmation

The **Design tokens in sync** check runs `node design/build.mjs --check` and fails when a generated file is out of date.

## More Information

See [`design/README.md`](../../design/README.md) for the palette and [Architecture overview](../architecture/README.md#83-design-tokens).
