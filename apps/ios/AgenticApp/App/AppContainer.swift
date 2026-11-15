import Foundation
import Observation

/// Composition root: the one place where concrete implementations are chosen and wired together.
@MainActor
@Observable
final class AppContainer {
    let apiClient: APIClient
    let itemsRepository: ItemsRepository
    let featureFlags: FeatureFlagService
    let session: SessionStore
    let pushService: PushNotificationService
    let theme: Theme
    let crashReporter: CrashReporter

    init(
        apiClient: APIClient,
        featureFlags: FeatureFlagService,
        session: SessionStore,
        pushService: PushNotificationService,
        theme: Theme,
        crashReporter: CrashReporter = NoOpCrashReporter()
    ) {
        self.apiClient = apiClient
        self.itemsRepository = RemoteItemsRepository(apiClient: apiClient)
        self.featureFlags = featureFlags
        self.session = session
        self.pushService = pushService
        self.theme = theme
        self.crashReporter = crashReporter
    }

    static func make() -> AppContainer {
        let isUITesting = LaunchArguments.isUITesting
        let crashReporter = CrashReporting.make(
            dsn: AppEnvironment.sentryDSN,
            environment: AppEnvironment.current,
            isUITesting: isUITesting
        )
        crashReporter.start()
        let apiClient: APIClient = isUITesting
            ? FixtureAPIClient()
            : URLSessionAPIClient(baseURL: AppEnvironment.apiBaseURL)
        let tokenStore: TokenStore = isUITesting ? InMemoryTokenStore() : KeychainTokenStore()
        return AppContainer(
            apiClient: apiClient,
            featureFlags: FeatureFlagService(apiClient: apiClient),
            session: SessionStore(authService: RemoteAuthService(apiClient: apiClient), tokenStore: tokenStore),
            pushService: .shared,
            theme: .standard,
            crashReporter: crashReporter
        )
    }
}
