---
name: ios-design-system
description: Use when styling any SwiftUI view or changing the look and feel of the Consent iOS app. Covers Theme tokens, DS components and how to restyle the whole app.
---

# iOS design system

All styling comes from `Consent/DesignSystem/Theme.swift`, read through `@Environment(\.theme)`.

## Tokens

- `theme.colors` – primary, onPrimary, background, surface, textPrimary, textSecondary, error (light and dark mode)
- `theme.typography` – title, headline, body, caption
- `theme.spacing` – xs 4, s 8, m 16, l 24, xl 32
- `theme.radius` – s, m, l

## Components

- `Button("…") {}.buttonStyle(.ds(.primary))` or `.ds(.secondary)`
- `DSCard { … }` for grouped content
- `DSLoadingView()` and `DSErrorView(message:retry:)` for loading and error states

## Rules

- Never hard-code colors (`Color.blue`, hex), font sizes or paddings in features. Use tokens.
- Need something new? Add a token or a `DS*` component first, then use it.
- To restyle the app: change values in `Theme.standard`, or create another `Theme` and inject it in `AppContainer`.
- Keep Dynamic Type working: build fonts from text styles (`.body`, `.headline`), not fixed sizes.
