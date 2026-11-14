import Foundation
import Observation

@MainActor
@Observable
final class SettingsViewModel {
    private(set) var pushStatus = "Not requested"

    private let pushService: PushNotificationService

    init(pushService: PushNotificationService) {
        self.pushService = pushService
    }

    var environmentName: String { AppEnvironment.current.rawValue.uppercased() }
    var canEditFeatureFlags: Bool { AppEnvironment.current != .prod }

    func enablePush() async {
        let granted = await pushService.requestPermissionAndRegister()
        pushStatus = granted ? "Enabled" : "Not allowed"
    }
}
