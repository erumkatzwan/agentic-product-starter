# Design tokens

One colour palette and one set of spacing, type and radius values for every app in the starter: iOS, Android, web app, back office and website.

## The palette

| Token | Light | Dark | Use for |
|---|---|---|---|
| `background` | `#FFFFFF` | `#0C0E13` | Page and screen background |
| `surface` | `#F7F8FA` | `#14171F` | Cards, inputs, panels |
| `border` | `#DDE1E8` | `#262B36` | Dividers and outlines |
| `textPrimary` | `#14171F` | `#F7F8FA` | Main text |
| `textSecondary` | `#5B6475` | `#9AA3B2` | Labels, captions, hints |
| `primary` | `#3F5BD9` | `#7C93FF` | Buttons, links, focus |
| `primaryHover` | `#3249B8` | `#9DB0FF` | Hover and pressed states |
| `onPrimary` | `#FFFFFF` | `#0C0E13` | Text on primary |
| `success` | `#1F8A4C` | `#4CC487` | Confirmations |
| `warning` | `#B86E00` | `#F2B84B` | Warnings |
| `error` | `#C93636` | `#F27474` | Errors, destructive actions |

Spacing: 4, 8, 16, 24, 32, 48. Radius: 8, 12, 20, pill. Font: Inter with system fallbacks.

## How it works

`tokens.json` is the single source of truth. `build.mjs` turns it into a file per platform:

| Generated file | Used by |
|---|---|
| `apps/web-app/src/styles/tokens.css` | Web app (CSS variables) |
| `apps/back-office/src/styles/tokens.css` | Back office (CSS variables) |
| `apps/website/tokens.css` | Landing website (CSS variables) |
| `apps/ios/AgenticApp/DesignSystem/DesignTokens.swift` | iOS `Theme` |
| `apps/android/app/src/main/kotlin/com/agentic/app/designsystem/DesignTokens.kt` | Android `AppTheme` |

## Change a colour

1. Edit `tokens.json`.
2. Run `node design/build.mjs`.
3. Commit `tokens.json` and the generated files together.

CI runs `node design/build.mjs --check` and fails if a generated file is out of date, so the apps can never drift apart.

## Figma later

`tokens.json` follows the W3C Design Tokens format. Import it into Figma with the Tokens Studio plugin to get the same palette as Figma variables, and export back to this file when designs change.
