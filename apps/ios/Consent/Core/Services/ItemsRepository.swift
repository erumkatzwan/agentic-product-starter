import Foundation

struct Item: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
}

/// Data access for items. View models depend on the protocol so tests can swap it.
protocol ItemsRepository {
    func fetchItems() async throws -> [Item]
}

final class RemoteItemsRepository: ItemsRepository {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func fetchItems() async throws -> [Item] {
        try await apiClient.send(Endpoints.items)
    }
}
