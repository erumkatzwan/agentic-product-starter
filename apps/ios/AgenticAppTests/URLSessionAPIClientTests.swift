@testable import AgenticApp
import XCTest

final class URLSessionAPIClientTests: XCTestCase {
    private var client: URLSessionAPIClient?

    override func setUpWithError() throws {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [StubURLProtocol.self]
        let baseURL = try XCTUnwrap(URL(string: "https://api.example.com"))
        client = URLSessionAPIClient(baseURL: baseURL, session: URLSession(configuration: configuration))
    }

    override func tearDown() {
        StubURLProtocol.handler = nil
        client = nil
    }

    private static func response(for request: URLRequest, status: Int) throws -> HTTPURLResponse {
        let url = try XCTUnwrap(request.url)
        return try XCTUnwrap(HTTPURLResponse(url: url, statusCode: status, httpVersion: nil, headerFields: nil))
    }

    func testDecodesSuccessfulResponse() async throws {
        let client = try XCTUnwrap(client)
        StubURLProtocol.handler = { request in
            let response = try Self.response(for: request, status: 200)
            return (response, Data(#"[{"id":"1","title":"Title","subtitle":"Subtitle"}]"#.utf8))
        }

        let items = try await client.send(Endpoints.items)

        XCTAssertEqual(items, [.sample])
    }

    func testThrowsServerErrorForNon2xxStatus() async throws {
        let client = try XCTUnwrap(client)
        StubURLProtocol.handler = { request in
            let response = try Self.response(for: request, status: 500)
            return (response, Data())
        }

        do {
            _ = try await client.send(Endpoints.items)
            XCTFail("Expected an error")
        } catch {
            XCTAssertEqual(error as? APIError, .server(statusCode: 500))
        }
    }

    func testThrowsDecodingErrorForInvalidJSON() async throws {
        let client = try XCTUnwrap(client)
        StubURLProtocol.handler = { request in
            let response = try Self.response(for: request, status: 200)
            return (response, Data("not json".utf8))
        }

        do {
            _ = try await client.send(Endpoints.items)
            XCTFail("Expected an error")
        } catch {
            guard case .decoding = error as? APIError else {
                return XCTFail("Expected a decoding error, got \(error)")
            }
        }
    }

    func testBuildsRequestWithPathMethodQueryAndHeaders() throws {
        let client = try XCTUnwrap(client)
        let endpoint = Endpoint<[Item]>(
            path: "/items",
            method: .post,
            query: [URLQueryItem(name: "page", value: "2")],
            headers: ["X-Trace": "abc"],
            body: Data("{}".utf8)
        )

        let request = try client.makeRequest(for: endpoint)

        XCTAssertEqual(request.url?.absoluteString, "https://api.example.com/items?page=2")
        XCTAssertEqual(request.httpMethod, "POST")
        XCTAssertEqual(request.value(forHTTPHeaderField: "X-Trace"), "abc")
        XCTAssertEqual(request.value(forHTTPHeaderField: "Content-Type"), "application/json")
    }
}
