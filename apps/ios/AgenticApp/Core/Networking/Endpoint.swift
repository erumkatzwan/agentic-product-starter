import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

/// Describes one REST call and the type it decodes to.
struct Endpoint<Response: Decodable> {
    var path: String
    var method: HTTPMethod = .get
    var query: [URLQueryItem] = []
    var headers: [String: String] = [:]
    var body: Data?
}

/// All REST endpoints in one place. Add new endpoints here.
enum Endpoints {
    static let items = Endpoint<[Item]>(path: "/items")
    static let featureFlags = Endpoint<RemoteFeatureFlags>(path: "/feature-flags")
}
