@testable import Consent
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
