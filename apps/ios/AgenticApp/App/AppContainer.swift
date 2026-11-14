import Foundation
import Observation

/// Composition root: the one place where concrete implementations are chosen and wired together.
@MainActor
@Observable
final class AppContainer {
    let apiClient: APIClient
    let itemsRepository: ItemsRepository
    let featureFlags: FeatureFlagService
    let authService: AuthService
    let pushService: PushNotificationService
    let theme: Theme

    init(
        apiClient: APIClient,
        featureFlags: FeatureFlagService,
        authService: AuthService,
        pushService: PushNotificationService,
        theme: Theme
    ) {
        self.apiClient = apiClient
        self.itemsRepository = RemoteItemsRepository(apiClient: apiClient)
        self.featureFlags = featureFlags
        self.authService = authService
        self.pushService = pushService
        self.theme = theme
    }

    static func make() -> AppContainer {
        let apiClient: APIClient = LaunchArguments.isUITesting
            ? FixtureAPIClient()
            : URLSessionAPIClient(baseURL: AppEnvironment.apiBaseURL)
        return AppContainer(
            apiClient: apiClient,
            featureFlags: FeatureFlagService(apiClient: apiClient),
            authService: PlaceholderAuthService(),
            pushService: .shared,
            theme: .standard
        )
    }
}
