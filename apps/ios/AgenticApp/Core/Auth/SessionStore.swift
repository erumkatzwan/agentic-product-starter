import Foundation
import Observation

/// Who is signed in, for the whole app. `RootView` shows the sign-in flow or the app based on `state`.
@MainActor
@Observable
final class SessionStore {
    enum State: Equatable {
        case restoring
        case signedOut
        case signedIn(UserSession)
    }

    private(set) var state: State
    private let authService: AuthService
    private let tokenStore: TokenStore

    init(authService: AuthService, tokenStore: TokenStore) {
        self.authService = authService
        self.tokenStore = tokenStore
        state = tokenStore.read() == nil ? .signedOut : .restoring
    }

    var session: UserSession? {
        if case .signedIn(let session) = state {
            return session
        }
        return nil
    }

    /// Signs back in with the stored token on launch; drops it if the backend no longer accepts it.
    func restore() async {
        guard state == .restoring, let token = tokenStore.read() else { return }
        do {
            state = .signedIn(try await authService.restore(token: token))
        } catch {
            end()
        }
    }

    func signIn(email: String, password: String) async throws {
        start(try await authService.signIn(email: email, password: password))
    }

    func signUp(email: String, password: String, displayName: String) async throws {
        start(try await authService.signUp(email: email, password: password, displayName: displayName))
    }

    func signInWithGoogle() async throws {
        start(try await authService.signInWithGoogle())
    }

    func signOut() async {
        if let session {
            await authService.signOut(token: session.token)
        }
        end()
    }

    func updateProfile(displayName: String) async throws {
        guard let session else { return }
        let profile = try await authService.updateProfile(token: session.token, displayName: displayName)
        state = .signedIn(UserSession(token: session.token, profile: profile))
    }

    func deleteAccount() async throws {
        guard let session else { return }
        try await authService.deleteAccount(token: session.token)
        end()
    }

    private func start(_ session: UserSession) {
        tokenStore.save(session.token)
        state = .signedIn(session)
    }

    private func end() {
        tokenStore.save(nil)
        state = .signedOut
    }
}
