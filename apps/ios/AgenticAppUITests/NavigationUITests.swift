import XCTest

/// UI tests run the real app on the simulator with fixture data (`-uiTesting`), no backend needed.
final class NavigationUITests: XCTestCase {
    private let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launchArguments = ["-uiTesting"]
    }

    func testHomeShowsFixtureItems() {
        app.launch()

        XCTAssertTrue(app.buttons["home.item.1"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["home.item.3"].exists)
    }

    func testNavigatesToDetailAndBackWithNavigationBar() {
        app.launch()
        let item = app.buttons["home.item.1"]
        XCTAssertTrue(item.waitForExistence(timeout: 10))

        item.tap()
        XCTAssertTrue(app.staticTexts["detail.title"].waitForExistence(timeout: 5))

        app.navigationBars.buttons.element(boundBy: 0).tap()
        XCTAssertTrue(item.waitForExistence(timeout: 5))
    }

    func testBackToHomeButtonPopsToRoot() {
        app.launch()
        app.buttons["home.item.2"].tap()

        let backToHome = app.buttons["detail.backToHome"]
        XCTAssertTrue(backToHome.waitForExistence(timeout: 5))
        backToHome.tap()

        XCTAssertTrue(app.buttons["home.item.2"].waitForExistence(timeout: 5))
    }

    func testOpensSettingsWhenFlagIsOn() {
        app.launch()
        let settings = app.buttons["home.settingsButton"]
        XCTAssertTrue(settings.waitForExistence(timeout: 10))

        settings.tap()

        XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 5))
    }

    func testHidesSettingsWhenFlagIsOff() {
        app.launchArguments += ["-FF_settings", "NO"]
        app.launch()

        XCTAssertTrue(app.buttons["home.item.1"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["home.settingsButton"].exists)
    }
}
