# 5. Android app architecture

## Status

Accepted

## Context

The Android app must match the iOS app screen for screen (same flow, flags, fixtures and test IDs), be easy for agents to extend safely, and pass the same quality gates. It should use what Google currently recommends, so Google's official Android agent skills apply directly.

## Decision

- Kotlin, Jetpack Compose and Material 3, Android 8.0+ (minSdk 26). Android Gradle Plugin 9 with built-in Kotlin; all versions in `gradle/libs.versions.toml`.
- Product flavors `dev`, `syst`, `prod`, mirroring the iOS build configurations. Per-flavor values in `src/<flavor>/`.
- Same architecture as iOS: MVVM with a composition root (`AppContainer`), a `Router` and interface-based services. No DI framework yet.
- Navigation 3: the app owns the back stack (`Router`), `NavDisplay` renders it, and view models are scoped to navigation entries.
- `ApiClient` interface with an OkHttp + kotlinx.serialization client for real backends and a fixture client reading the same JSON files as iOS.
- Token encrypted with an Android Keystore key, the counterpart of the iOS Keychain.
- Feature flags resolved as: launch extra or device toggle, then backend, then default.
- Unit tests (JUnit, JVM), UI tests (Compose UI test on an emulator) and end-to-end tests (Maestro, same flows as iOS), all run in CI on every pull request. ktlint and Android Lint with warnings as errors.
- Google's official Android skills ship next to our own `android-*` skills.

## Consequences

- One story can be built on both platforms with the same names, and Maestro flows look the same.
- Emulator tests run on Linux runners, so Android CI is cheaper than iOS CI.
- Real push needs Firebase and real Google sign-in needs Credential Manager; both are skeletons until a product needs them.
