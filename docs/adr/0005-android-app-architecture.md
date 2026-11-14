---
status: accepted
date: 2026-11-14
decision-makers: Erum Awan
---

# Android app: Jetpack Compose mirroring the iOS architecture

## Context and Problem Statement

The Android app must match the iOS app screen for screen (same flow, flags, fixtures and test IDs), be easy for agents to extend, and pass the same quality gates. It should follow what Google currently recommends so Google's official Android agent skills apply directly. Which stack and architecture?

## Decision Drivers

* One story is built the same way on iOS and Android
* Current Google recommendations (Compose, Navigation 3, AGP 9)
* Tests never need a running backend

## Considered Options

* Kotlin, Jetpack Compose, Material 3, Navigation 3, MVVM with a composition root, no DI framework
* The same with Hilt for dependency injection
* Kotlin Multiplatform or Compose Multiplatform shared with iOS

## Decision Outcome

Chosen option: "Kotlin, Jetpack Compose, Material 3, Navigation 3, MVVM with a composition root", because it mirrors the iOS design one to one (`AppContainer`, `Router`, interface-based services) and adds no framework an agent must learn first.

### Consequences

* Good, because product flavors `dev`, `syst`, `prod` mirror the iOS configurations, with values in `src/<flavor>/`.
* Good, because `Router` owns the Navigation 3 back stack and view models are scoped to navigation entries.
* Good, because the token is encrypted with an Android Keystore key, the counterpart of the iOS Keychain.
* Good, because UI and end-to-end tests run on Linux emulators, which is cheaper than iOS CI.
* Bad, because there is no DI framework; if the app grows large, revisit with an ADR (Hilt or Metro).
* Bad, because real push needs Firebase and real Google sign-in needs Credential Manager; both are skeletons.

### Confirmation

CI runs ktlint and Android Lint with warnings as errors, builds every flavor, unit tests with a 70% logic coverage gate, Compose UI tests and Maestro flows on an emulator.

## Pros and Cons of the Options

### Hilt

* Good, because it is Google's standard DI
* Bad, because annotation processing (KSP) and more setup for a small app

### Kotlin or Compose Multiplatform

* Good, because shared code with iOS
* Bad, because the iOS app is already native SwiftUI, and sharing would add a second toolchain to both apps

## More Information

minSdk 26, all versions in `gradle/libs.versions.toml`. See [ADR-0002](0002-ios-app-architecture.md) and [Architecture overview](../architecture/README.md#53-inside-the-mobile-apps).
