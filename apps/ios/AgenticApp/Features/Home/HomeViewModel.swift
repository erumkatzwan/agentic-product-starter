import Foundation
import Observation

@MainActor
@Observable
final class HomeViewModel {
    enum State: Equatable {
        case idle
        case loading
        case loaded([Item])
        case failed(String)
    }

    private(set) var state: State = .idle
    private let repository: ItemsRepository

    init(repository: ItemsRepository) {
        self.repository = repository
    }

    func load() async {
        state = .loading
        do {
            state = .loaded(try await repository.fetchItems())
        } catch {
            state = .failed("Something went wrong. Please try again.")
        }
    }
}
