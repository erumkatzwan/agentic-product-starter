@testable import Consent
import XCTest

@MainActor
final class SettingsViewModelTests: XCTestCase {
    func testGoogleSignInShowsNotImplementedMessage() async {
        let viewModel = SettingsViewModel(authService: PlaceholderAuthService(), pushService: .shared)

        await viewModel.signInWithGoogle()

        XCTAssertEqual(viewModel.signInMessage, "Google sign-in is not implemented yet.")
    }
}

final class FixtureAPIClientTests: XCTestCase {
    func testLoadsBundledFixtures() async throws {
        let client = FixtureAPIClient()

        let items = try await client.send(Endpoints.items)
        let flags = try await client.send(Endpoints.featureFlags)

        XCTAssertFalse(items.isEmpty)
        XCTAssertEqual(flags.flags["settings"], true)
    }

    func testThrowsForMissingFixture() async {
        do {
            _ = try await FixtureAPIClient().send(Endpoint<[Item]>(path: "/does-not-exist"))
            XCTFail("Expected an error")
        } catch {
            XCTAssertEqual(error as? APIError, .missingFixture("does-not-exist"))
        }
    }
}
