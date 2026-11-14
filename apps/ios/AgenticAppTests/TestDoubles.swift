@testable import AgenticApp
import Foundation

/// API client whose responses are set per test.
final class MockAPIClient: APIClient {
    var responses: [String: Any] = [:]
    var error: Error?
    private(set) var requestedPaths: [String] = []

    func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response {
        requestedPaths.append(endpoint.path)
        if let error {
            throw error
        }
        guard let response = responses[endpoint.path] as? Response else {
            throw APIError.missingFixture(endpoint.path)
        }
        return response
    }
}

final class StubItemsRepository: ItemsRepository {
    var result: Result<[Item], Error>

    init(result: Result<[Item], Error>) {
        self.result = result
    }

    func fetchItems() async throws -> [Item] {
        try result.get()
    }
}

/// Intercepts URLSession requests so the real API client can be tested without a network.
final class StubURLProtocol: URLProtocol {
    static var handler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

    override static func canInit(with request: URLRequest) -> Bool { true }
    override static func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.handler else {
            client?.urlProtocol(self, didFailWithError: URLError(.unknown))
            return
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

extension Item {
    static let sample = Item(id: "1", title: "Title", subtitle: "Subtitle")
}

extension UserProfile {
    static let sample = UserProfile(id: "1", email: "ada@example.com", displayName: "Ada", role: "Customer")
}

/// Auth service whose results are set per test.
final class StubAuthService: AuthService {
    var signInResult: Result<UserSession, Error> = .success(UserSession(token: "token", profile: .sample))
    var signUpResult: Result<UserSession, Error> = .success(UserSession(token: "token", profile: .sample))
    var restoreResult: Result<UserSession, Error> = .success(UserSession(token: "token", profile: .sample))
    var updateResult: Result<UserProfile, Error>?
    var deleteError: Error?
    private(set) var signedOutTokens: [String] = []

    func signIn(email: String, password: String) async throws -> UserSession { try signInResult.get() }

    func signUp(email: String, password: String, displayName: String) async throws -> UserSession { try signUpResult.get() }

    func restore(token: String) async throws -> UserSession { try restoreResult.get() }

    func signOut(token: String) async { signedOutTokens.append(token) }

    func updateProfile(token: String, displayName: String) async throws -> UserProfile {
        if let updateResult {
            return try updateResult.get()
        }
        return UserProfile(id: "1", email: "ada@example.com", displayName: displayName, role: "Customer")
    }

    func deleteAccount(token: String) async throws {
        if let deleteError {
            throw deleteError
        }
    }

    func signInWithGoogle() async throws -> UserSession { throw AuthError.notImplemented }
}

extension APIError {
    static func invalid(_ fields: [String: String]) -> APIError {
        .problem(statusCode: 400, message: "Invalid", fieldErrors: fields)
    }
}
