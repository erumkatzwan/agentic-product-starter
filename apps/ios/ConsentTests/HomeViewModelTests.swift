@testable import Consent
import XCTest

@MainActor
final class HomeViewModelTests: XCTestCase {
    func testStartsIdle() {
        let viewModel = HomeViewModel(repository: StubItemsRepository(result: .success([])))

        XCTAssertEqual(viewModel.state, .idle)
    }

    func testLoadShowsItems() async {
        let viewModel = HomeViewModel(repository: StubItemsRepository(result: .success([.sample])))

        await viewModel.load()

        XCTAssertEqual(viewModel.state, .loaded([.sample]))
    }

    func testLoadShowsErrorWhenRepositoryFails() async {
        let viewModel = HomeViewModel(repository: StubItemsRepository(result: .failure(APIError.server(statusCode: 500))))

        await viewModel.load()

        XCTAssertEqual(viewModel.state, .failed("Something went wrong. Please try again."))
    }
}
