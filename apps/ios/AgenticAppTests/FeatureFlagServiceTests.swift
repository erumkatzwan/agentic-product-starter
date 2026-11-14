@testable import AgenticApp
import XCTest

@MainActor
final class FeatureFlagServiceTests: XCTestCase {
    private var defaults = UserDefaults()
    private var suiteName = ""
    private let api = MockAPIClient()

    override func setUpWithError() throws {
        suiteName = "FeatureFlagServiceTests-\(UUID().uuidString)"
        defaults = try XCTUnwrap(UserDefaults(suiteName: suiteName))
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
    }

    func testUsesDefaultValueBeforeBackendAnswers() {
        let service = FeatureFlagService(apiClient: api, defaults: defaults)

        XCTAssertTrue(service.isEnabled(.settings))
        XCTAssertFalse(service.isEnabled(.googleSignIn))
    }

    func testBackendValueOverridesDefault() async {
        api.responses["/feature-flags"] = RemoteFeatureFlags(flags: ["settings": false, "google_sign_in": true])
        let service = FeatureFlagService(apiClient: api, defaults: defaults)

        await service.refresh()

        XCTAssertFalse(service.isEnabled(.settings))
        XCTAssertTrue(service.isEnabled(.googleSignIn))
    }

    func testLocalOverrideWinsOverBackend() async {
        api.responses["/feature-flags"] = RemoteFeatureFlags(flags: ["settings": true])
        let service = FeatureFlagService(apiClient: api, defaults: defaults)
        await service.refresh()

        service.setOverride(false, for: .settings)
        XCTAssertFalse(service.isEnabled(.settings))

        service.setOverride(nil, for: .settings)
        XCTAssertTrue(service.isEnabled(.settings))
    }

    func testKeepsDefaultsWhenBackendFails() async {
        api.error = APIError.server(statusCode: 503)
        let service = FeatureFlagService(apiClient: api, defaults: defaults)

        await service.refresh()

        XCTAssertTrue(service.isEnabled(.itemDetail))
        XCTAssertEqual(api.requestedPaths, ["/feature-flags"])
    }
}
