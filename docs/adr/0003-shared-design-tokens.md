# 3. Shared design tokens

## Status

Accepted

## Context

Every app (iOS, web app, back office, website) must look like one product, and the palette must be changeable at any time without editing each app. Figma is not used yet but may be later.

## Decision

- `design/tokens.json` is the single source of truth, in the W3C Design Tokens format.
- `design/build.mjs` generates `tokens.css` for the web apps and website, and `DesignTokens.swift` for iOS.
- Apps style only with the generated tokens. CI fails if generated files are out of date.

## Consequences

- One edit changes the palette everywhere.
- The file can be synced with Figma through Tokens Studio when designs move there.
