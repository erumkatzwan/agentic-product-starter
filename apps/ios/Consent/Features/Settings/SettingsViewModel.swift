import Foundation
import Observation

@MainActor
@Observable
final class SettingsViewModel {
    private(set) var pushStatus = "Not requested"
    private(set) var signInMessage: String?

    private let authService: AuthService
    private let pushService: PushNotificationService

    init(authService: AuthService, pushService: PushNotificationService) {
        self.authService = authService
        self.pushService = pushService
    }

    var environmentName: String { AppEnvironment.current.rawValue.uppercased() }
    var canEditFeatureFlags: Bool { AppEnvironment.current != .prod }

    func enablePush() async {
        let granted = await pushService.requestPermissionAndRegister()
        pushStatus = granted ? "Enabled" : "Not allowed"
    }

    func signInWithGoogle() async {
        do {
            let session = try await authService.signInWithGoogle()
            signInMessage = "Signed in as \(session.displayName)"
        } catch AuthError.notImplemented {
            signInMessage = "Google sign-in is not implemented yet."
        } catch {
            signInMessage = "Sign-in failed. Please try again."
        }
    }
}
