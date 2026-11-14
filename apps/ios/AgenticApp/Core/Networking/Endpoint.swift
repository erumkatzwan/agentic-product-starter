import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

/// Describes one REST call and the type it decodes to. Set `token` for endpoints that need a signed-in user.
struct Endpoint<Response: Decodable> {
    var path: String
    var method: HTTPMethod = .get
    var query: [URLQueryItem] = []
    var headers: [String: String] = [:]
    var body: Data?
    var token: String?
}

/// For endpoints that return no body (HTTP 204).
struct EmptyResponse: Decodable, Equatable {}

/// Response of sign in and sign up: `{ "accessToken": "...", "expiresIn": 3600 }`.
struct AccessToken: Decodable, Equatable {
    let accessToken: String
    let expiresIn: Int
}

/// The signed-in user's profile from `GET /api/me`.
struct UserProfile: Codable, Equatable {
    let id: String
    let email: String
    let displayName: String
    let role: String
}

/// All REST endpoints in one place, matching the .NET backend. Add new endpoints here.
enum Endpoints {
    static let items = Endpoint<[Item]>(path: "/api/items")
    static let featureFlags = Endpoint<RemoteFeatureFlags>(path: "/api/feature-flags")

    static func signIn(email: String, password: String) -> Endpoint<AccessToken> {
        Endpoint(path: "/api/auth/signin", method: .post, body: json(["email": email, "password": password]))
    }

    static func signUp(email: String, password: String, displayName: String) -> Endpoint<AccessToken> {
        Endpoint(
            path: "/api/auth/signup",
            method: .post,
            body: json(["email": email, "password": password, "displayName": displayName])
        )
    }

    static func signOut(token: String) -> Endpoint<EmptyResponse> {
        Endpoint(path: "/api/auth/signout", method: .post, token: token)
    }

    static func profile(token: String) -> Endpoint<UserProfile> {
        Endpoint(path: "/api/me", token: token)
    }

    static func updateProfile(token: String, displayName: String) -> Endpoint<UserProfile> {
        Endpoint(path: "/api/me", method: .put, body: json(["displayName": displayName]), token: token)
    }

    static func deleteAccount(token: String) -> Endpoint<EmptyResponse> {
        Endpoint(path: "/api/me", method: .delete, token: token)
    }

    private static func json(_ value: [String: String]) -> Data? {
        try? JSONEncoder().encode(value)
    }
}
