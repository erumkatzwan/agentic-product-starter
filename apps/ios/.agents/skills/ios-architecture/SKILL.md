---
name: ios-architecture
description: Use when adding or changing a screen, feature, route, service or dependency in the Consent iOS app (apps/ios). Explains the layers, where code goes and the checklist for a new feature.
---

# iOS architecture

MVVM with a composition root, a router and protocol-based services. SwiftUI + Observation, iOS 17+.

## Layers (folder = layer)

| Folder | Holds | May depend on |
|---|---|---|
| `Consent/App` | App entry, `AppContainer` (composition root), `RootView`, environments | everything |
| `Consent/Features/<Name>` | `<Name>View` + `<Name>ViewModel` | Core, DesignSystem |
| `Consent/Core/Networking` | `APIClient`, `Endpoint`, `Endpoints` | Foundation only |
| `Consent/Core/FeatureFlags` | `FeatureFlag`, `FeatureFlagService`, `FeatureGate` | Networking |
| `Consent/Core/Navigation` | `Route`, `Router` | Models |
| `Consent/Core/Services` | Repositories, auth, push | Networking |
| `Consent/DesignSystem` | `Theme` tokens and `DS*` components | SwiftUI only |

## Rules

- Views are thin: layout and bindings only. Logic lives in an `@MainActor @Observable` view model.
- View models depend on protocols (`ItemsRepository`, `AuthService`), never on `URLSession` or concrete clients.
- Only `AppContainer` creates concrete implementations.
- Navigate only through `Router` (`router.push(.route)`, `pop()`, `popToRoot()`). Add new screens as a `Route` case and map it in `RootView`.
- Every tappable or asserted element gets an `accessibilityIdentifier` named `<screen>.<element>`.
- No force unwrapping, no hard-coded colors or fonts, no `print`.

## Checklist: new feature or screen

1. Add `Consent/Features/<Name>/<Name>View.swift` and `<Name>ViewModel.swift`.
2. If it needs data: add an endpoint (see `ios-rest-api`), a repository protocol + implementation in `Core/Services`, wire it in `AppContainer`.
3. Add a `Route` case and map it in `RootView`.
4. Add a `FeatureFlag` if it should be switchable (see `ios-feature-flags`).
5. Style only with `Theme` tokens and `DS*` components (see `ios-design-system`).
6. Tests: view-model unit tests, a UI test for the navigation, a Maestro flow for the user journey (see `ios-testing`).
7. Run `make ci` before opening the pull request.
