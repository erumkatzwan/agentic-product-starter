import Foundation

/// Test-data client used by UI tests and end-to-end tests (launch argument `-uiTesting`).
/// Maps an endpoint path to a JSON file in `Resources/Fixtures`, dropping the `/api/` prefix:
/// `/api/feature-flags` → `feature-flags.json`, `/api/auth/signin` → `auth-signin.json`.
final class FixtureAPIClient: APIClient {
    private let bundle: Bundle
    private let decoder = JSONDecoder()

    init(bundle: Bundle = .main) {
        self.bundle = bundle
    }

    func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response {
        if let empty = EmptyResponse() as? Response {
            return empty
        }
        let name = Self.fixtureName(for: endpoint.path)
        guard let url = bundle.url(forResource: name, withExtension: "json") else {
            throw APIError.missingFixture(name)
        }
        do {
            return try decoder.decode(Response.self, from: Data(contentsOf: url))
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }

    static func fixtureName(for path: String) -> String {
        var trimmed = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if trimmed.hasPrefix("api/") {
            trimmed.removeFirst(4)
        }
        return trimmed.replacingOccurrences(of: "/", with: "-")
    }
}
