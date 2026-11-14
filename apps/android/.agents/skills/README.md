# Android skills

Skills for building the Android app (AgenticApp). Shared skills (refinement, planning, task definition, code review) live in the root `.agents/skills/`.

| Skill | Use it when |
|---|---|
| `android-architecture` | Adding a screen, feature, service or route |
| `android-design-system` | Styling anything or changing the look of the app |
| `android-rest-api` | Adding or changing a backend call |
| `android-feature-flags` | Shipping something that must be switchable on or off |
| `android-testing` | Writing unit, UI or end-to-end tests, or fixing a red check |

## Google's Android skills (Apache 2.0, by Google)

Official skills from [android/skills](https://github.com/android/skills), copied unchanged. Each folder keeps its `LICENSE.txt`.

| Skill | Use it when |
|---|---|
| `navigation-3` | Navigation 3 patterns: back stacks, deep links, scenes, conditional navigation |
| `edge-to-edge` | Insets, system bars, keyboard (IME) overlap |
| `jetpack-compose-performance` | Recomposition, lists, stability, dropped frames |
| `testing-setup` | Test strategy and harnesses, screenshot tests |
| `agp-9-upgrade` | Android Gradle Plugin 9 and built-in Kotlin |
| `r8-analyzer` | Turning on code shrinking for release builds |
| `restore-credentials` | Credential Manager and keeping users signed in across devices |
| `android-permissions-security` | Runtime permissions and manifest component security |
| `android-intent-security` | Intents, deep links and exported components |

To update them, copy the newer version from the source repo, or run `android skills update --all` with the [Android CLI](https://developer.android.com/tools/agents/android-cli).

Our own `android-*` skills win when they disagree with a Google skill, because they describe how this app is built.
