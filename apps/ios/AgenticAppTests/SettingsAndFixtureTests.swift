@testable import AgenticApp
import XCTest

@MainActor
final class SettingsViewModelTests: XCTestCase {
    func testShowsEnvironmentAndAllowsFlagEditingOutsideProd() {
        let viewModel = SettingsViewModel(pushService: .shared)

        XCTAssertFalse(viewModel.environmentName.isEmpty)
        XCTAssertEqual(viewModel.pushStatus, "Not requested")
        XCTAssertEqual(viewModel.canEditFeatureFlags, AppEnvironment.current != .prod)
    }
}

final class FixtureAPIClientTests: XCTestCase {
    func testLoadsBundledFixtures() async throws {
        let client = FixtureAPIClient()

        let items = try await client.send(Endpoints.items)
        let flags = try await client.send(Endpoints.featureFlags)
        let token = try await client.send(Endpoints.signIn(email: "a@b.c", password: "x"))
        let profile = try await client.send(Endpoints.profile(token: token.accessToken))

        XCTAssertFalse(items.isEmpty)
        XCTAssertEqual(flags.flags["settings"], true)
        XCTAssertEqual(token.accessToken, "fixture-token")
        XCTAssertEqual(profile.displayName, "Demo Customer")
    }

    func testReturnsEmptyResponseWithoutFixture() async throws {
        let result = try await FixtureAPIClient().send(Endpoints.signOut(token: "t"))

        XCTAssertEqual(result, EmptyResponse())
    }

    func testMapsPathsToFixtureNames() {
        XCTAssertEqual(FixtureAPIClient.fixtureName(for: "/api/auth/signin"), "auth-signin")
        XCTAssertEqual(FixtureAPIClient.fixtureName(for: "/api/me"), "me")
        XCTAssertEqual(FixtureAPIClient.fixtureName(for: "/other/path"), "other-path")
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
