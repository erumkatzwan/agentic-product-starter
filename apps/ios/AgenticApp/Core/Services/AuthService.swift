import Foundation

/// A signed-in user: the access token for the backend and their profile.
struct UserSession: Equatable {
    let token: String
    let profile: UserProfile
}

enum AuthError: Error, Equatable {
    case notImplemented
    case cancelled
}

/// Account operations against the backend. Same flow as the web app: sign up, sign in, profile, sign out.
protocol AuthService {
    func signIn(email: String, password: String) async throws -> UserSession
    func signUp(email: String, password: String, displayName: String) async throws -> UserSession
    func restore(token: String) async throws -> UserSession
    func signOut(token: String) async
    func updateProfile(token: String, displayName: String) async throws -> UserProfile
    func deleteAccount(token: String) async throws
    /// Skeleton: plug in the GoogleSignIn SDK here, then exchange the Google token with the backend.
    func signInWithGoogle() async throws -> UserSession
}

final class RemoteAuthService: AuthService {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func signIn(email: String, password: String) async throws -> UserSession {
        let token = try await apiClient.send(Endpoints.signIn(email: email, password: password))
        return try await restore(token: token.accessToken)
    }

    func signUp(email: String, password: String, displayName: String) async throws -> UserSession {
        let token = try await apiClient.send(Endpoints.signUp(email: email, password: password, displayName: displayName))
        return try await restore(token: token.accessToken)
    }

    func restore(token: String) async throws -> UserSession {
        UserSession(token: token, profile: try await apiClient.send(Endpoints.profile(token: token)))
    }

    func signOut(token: String) async {
        _ = try? await apiClient.send(Endpoints.signOut(token: token))
    }

    func updateProfile(token: String, displayName: String) async throws -> UserProfile {
        try await apiClient.send(Endpoints.updateProfile(token: token, displayName: displayName))
    }

    func deleteAccount(token: String) async throws {
        _ = try await apiClient.send(Endpoints.deleteAccount(token: token))
    }

    func signInWithGoogle() async throws -> UserSession {
        throw AuthError.notImplemented
    }
}
