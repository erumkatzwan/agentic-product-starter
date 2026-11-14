import Foundation

enum APIError: Error, Equatable {
    case invalidURL
    case transport(String)
    case server(statusCode: Int)
    /// A problem response from the backend, with validation errors per field (`email`, `password`, `displayName`).
    case problem(statusCode: Int, message: String, fieldErrors: [String: String])
    case decoding(String)
    case missingFixture(String)

    /// A message that can be shown to the user.
    var userMessage: String {
        switch self {
        case .problem(_, let message, _):
            return message
        case .transport:
            return "Cannot reach the server. Check your connection and try again."
        default:
            return "Something went wrong. Please try again."
        }
    }

    var fieldErrors: [String: String] {
        if case .problem(_, _, let fields) = self {
            return fields
        }
        return [:]
    }
}

/// The REST API layer. Features depend on this protocol, never on URLSession directly.
protocol APIClient {
    func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response
}

/// Production client that talks to the backend for the current environment.
final class URLSessionAPIClient: APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder

    init(baseURL: URL, session: URLSession = .shared, decoder: JSONDecoder = JSONDecoder()) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = decoder
    }

    func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response {
        let request = try makeRequest(for: endpoint)
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.transport(error.localizedDescription)
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError.transport("No HTTP response")
        }
        guard (200..<300).contains(http.statusCode) else {
            throw Self.error(statusCode: http.statusCode, data: data)
        }
        if let empty = EmptyResponse() as? Response {
            return empty
        }
        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }

    func makeRequest<Response>(for endpoint: Endpoint<Response>) throws -> URLRequest {
        guard var components = URLComponents(
            url: baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: false
        ) else {
            throw APIError.invalidURL
        }
        if !endpoint.query.isEmpty {
            components.queryItems = endpoint.query
        }
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.httpBody = endpoint.body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if endpoint.body != nil {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if let token = endpoint.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        endpoint.headers.forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        return request
    }

    /// Turns an error response into `APIError`, reading ASP.NET Core problem details when present.
    static func error(statusCode: Int, data: Data) -> APIError {
        struct ProblemDetails: Decodable {
            let title: String?
            let detail: String?
            let errors: [String: [String]]?
        }
        guard let problem = try? JSONDecoder().decode(ProblemDetails.self, from: data),
              let message = problem.detail ?? problem.title else {
            return .server(statusCode: statusCode)
        }
        let fields = (problem.errors ?? [:]).compactMapValues(\.first)
        return .problem(statusCode: statusCode, message: message, fieldErrors: fields)
    }
}
