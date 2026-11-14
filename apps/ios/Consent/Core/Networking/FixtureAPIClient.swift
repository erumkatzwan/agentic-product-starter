import Foundation

/// Test-data client used by UI tests and end-to-end tests (launch argument `-uiTesting`).
/// Maps an endpoint path such as `/feature-flags` to `Resources/Fixtures/feature-flags.json`.
final class FixtureAPIClient: APIClient {
    private let bundle: Bundle
    private let decoder = JSONDecoder()

    init(bundle: Bundle = .main) {
        self.bundle = bundle
    }

    func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response {
        let name = endpoint.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
            .replacingOccurrences(of: "/", with: "-")
        guard let url = bundle.url(forResource: name, withExtension: "json") else {
            throw APIError.missingFixture(name)
        }
        do {
            return try decoder.decode(Response.self, from: Data(contentsOf: url))
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }
}
