# Consent iOS – tutorial

A plain, production-ready starter: SwiftUI, a swappable design system, navigation, a REST API layer, feature flags, push notifications, a Google sign-in skeleton, and unit, UI and end-to-end tests gated by CI.

## 1. One-time setup (Mac)

1. Install Xcode 16 or newer from the App Store and open it once.
2. Install Homebrew if you don't have it: https://brew.sh
3. From the repo, go to the iOS folder and install the tools:

```bash
cd apps/ios
make bootstrap   # XcodeGen, SwiftLint, typos, Maestro
make open        # generates Consent.xcodeproj and opens Xcode
```

The Xcode project is generated from `project.yml` and is not committed. Run `make generate` after pulling changes that add or move files.

## 2. Run the app

- In Xcode pick the `Consent` scheme and an iPhone simulator, then press Run.
- `Run` uses the **Dev** environment. Tests use **SYST**. Archives use **Prod**.
- To try it with test data, edit the scheme → Run → Arguments → add `-uiTesting`.

## 3. What's inside

```
apps/ios/
├── project.yml              # Xcode project definition (XcodeGen)
├── Config/                  # Dev.xcconfig, Syst.xcconfig, Prod.xcconfig
├── Consent/
│   ├── App/                 # Entry point, AppContainer (wiring), RootView, environments
│   ├── DesignSystem/        # Theme tokens + DS components
│   ├── Core/
│   │   ├── Networking/      # APIClient, Endpoint, Endpoints, FixtureAPIClient
│   │   ├── FeatureFlags/    # FeatureFlag, FeatureFlagService, FeatureGate
│   │   ├── Navigation/      # Route, Router
│   │   └── Services/        # Repositories, AuthService (Google skeleton), push notifications
│   ├── Features/            # Home, Detail, Settings (View + ViewModel)
│   └── Resources/Fixtures/  # Test data JSON
├── ConsentTests/            # Unit tests
├── ConsentUITests/          # UI tests (XCUITest)
├── e2e/flows/               # End-to-end tests (Maestro)
├── scripts/                 # Coverage gate
├── Makefile                 # All commands
└── .agents/skills/          # iOS skills for AI agents
```

### Environments

Each environment has its own app name, bundle ID, API URL and push setting in `Config/*.xcconfig`, so Dev, SYST and Prod apps can sit side by side on one phone. Change `API_BASE_URL` there when the backend exists.

### Design system

Change colors, fonts, spacing and corner radius in `Consent/DesignSystem/Theme.swift` and the whole app follows. Screens never hard-code styles.

### Navigation

`Router` owns the navigation stack. Screens call `router.push(.settings)`, `router.pop()` or `router.popToRoot()`. New screens get a `Route` case and are mapped in `RootView`.

### REST API

Add endpoints to `Endpoints` and call them from a repository. The app uses the real backend normally and bundled JSON fixtures when launched with `-uiTesting`.

### Feature flags

Every feature can be switched on or off:

- **Backend:** `GET /feature-flags` returns `{ "flags": { "settings": true } }`.
- **Device:** in Dev and SYST builds, Settings has a toggle per flag.
- **Tests:** launch with `-FF_settings NO`.
- **In code:** wrap UI in `FeatureGate(.settings) { … }`.

### Push notifications

Settings → Enable notifications asks for permission and registers for push. To receive real pushes you need an Apple Developer account, the Push Notifications capability on the App ID, and the device token sent to the backend (see the note in `PushNotificationService`).

### Google sign-in

`AuthService` and a disabled-by-default `google_sign_in` flag are in place. `PlaceholderAuthService` returns "not implemented". Later: add the GoogleSignIn package, implement `AuthService`, swap it in `AppContainer`.

## 4. Run the tests

```bash
make lint        # SwiftLint, warnings fail
make typos       # spelling in code and docs
make test-unit   # unit tests + coverage gate (70% of logic)
make test-ui     # UI tests on the simulator
make e2e         # Maestro end-to-end flows on the simulator
make ci          # all of the above
```

If your Mac has a different simulator: `make test-ui SIMULATOR="iPhone 15"`.

## 5. Daily workflow for a story

1. Create a branch from `main`: `feature/<story-id>-short-name`.
2. Ask the agent to implement the story. It follows `AGENTS.md` and the skills in `.agents/skills/`.
3. Add or update unit tests, a UI test and a Maestro flow.
4. Run `make ci`.
5. Push and open a pull request. CI runs: **iOS lint**, **iOS spelling**, **iOS unit tests and coverage**, **iOS UI tests**, **iOS end-to-end tests**.
6. Merge only when everything is green.

## 6. Block merging until checks pass (one-time, on GitHub)

1. Repo → Settings → Rules → Rulesets → New branch ruleset.
2. Target: the default branch (`main`).
3. Turn on: *Require a pull request before merging*, *Require status checks to pass* (add the five iOS checks after they have run once), *Block force pushes*.
4. Save as **Active**.

Note: on a free GitHub plan, rulesets and branch protection are only enforced on **public** repos. For a private repo you need GitHub Pro or Team.

Also note: macOS CI runners use GitHub Actions minutes at a higher rate than Linux, so watch usage on a private repo.
