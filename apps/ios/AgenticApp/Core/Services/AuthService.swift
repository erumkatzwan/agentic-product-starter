import Foundation

struct UserSession: Equatable {
    let userID: String
    let displayName: String
}

enum AuthError: Error, Equatable {
    case notImplemented
    case cancelled
}

/// Sign-in skeleton. Google sign-in plugs in behind this protocol later (GoogleSignIn SDK).
protocol AuthService {
    func signInWithGoogle() async throws -> UserSession
    func signOut() async
}

/// Placeholder until Google sign-in is implemented. Gated by `FeatureFlag.googleSignIn`.
final class PlaceholderAuthService: AuthService {
    func signInWithGoogle() async throws -> UserSession {
        throw AuthError.notImplemented
    }

    func signOut() async {}
}
