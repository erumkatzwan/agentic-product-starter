import XCTest

/// UI tests run the real app on the simulator with fixture data (`-uiTesting`), no backend needed.
/// Each launch starts signed out, like a fresh install.
final class NavigationUITests: XCTestCase {
    private let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launchArguments = ["-uiTesting"]
    }

    private func signIn() {
        let submit = app.buttons["signIn.submit"]
        XCTAssertTrue(submit.waitForExistence(timeout: 10))
        submit.tap()
        XCTAssertTrue(app.buttons["home.item.1"].waitForExistence(timeout: 10))
    }

    func testSignInShowsHomeWithFixtureItems() {
        app.launch()
        signIn()

        XCTAssertTrue(app.buttons["home.item.3"].exists)
    }

    func testNavigatesToDetailAndBackWithNavigationBar() {
        app.launch()
        signIn()
        let item = app.buttons["home.item.1"]

        item.tap()
        XCTAssertTrue(app.staticTexts["detail.title"].waitForExistence(timeout: 5))

        app.navigationBars.buttons.element(boundBy: 0).tap()
        XCTAssertTrue(item.waitForExistence(timeout: 5))
    }

    func testBackToHomeButtonPopsToRoot() {
        app.launch()
        signIn()
        app.buttons["home.item.2"].tap()

        let backToHome = app.buttons["detail.backToHome"]
        XCTAssertTrue(backToHome.waitForExistence(timeout: 5))
        backToHome.tap()

        XCTAssertTrue(app.buttons["home.item.2"].waitForExistence(timeout: 5))
    }

    func testOpensSettingsWhenFlagIsOn() {
        app.launch()
        signIn()

        app.buttons["home.settingsButton"].tap()

        XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 5))
    }

    func testHidesSettingsWhenFlagIsOff() {
        app.launchArguments += ["-FF_settings", "NO"]
        app.launch()
        signIn()

        XCTAssertFalse(app.buttons["home.settingsButton"].exists)
    }

    func testProfileSaveAndSignOut() {
        app.launch()
        signIn()

        app.buttons["home.profileButton"].tap()
        let save = app.buttons["profile.save"]
        XCTAssertTrue(save.waitForExistence(timeout: 5))
        save.tap()
        XCTAssertTrue(app.staticTexts["profile.message"].waitForExistence(timeout: 5))

        app.buttons["profile.signOut"].tap()
        XCTAssertTrue(app.buttons["signIn.submit"].waitForExistence(timeout: 5))
    }

    func testSignUpOpensTheApp() {
        app.launch()
        let createAccount = app.buttons["signIn.createAccount"]
        XCTAssertTrue(createAccount.waitForExistence(timeout: 10))

        createAccount.tap()
        let submit = app.buttons["signUp.submit"]
        XCTAssertTrue(submit.waitForExistence(timeout: 5))
        submit.tap()

        XCTAssertTrue(app.buttons["home.item.1"].waitForExistence(timeout: 10))
    }

    func testGoogleSignInShowsPlaceholderMessage() {
        app.launch()
        let google = app.buttons["signIn.google"]
        XCTAssertTrue(google.waitForExistence(timeout: 10))

        google.tap()

        XCTAssertTrue(app.staticTexts["signIn.error"].waitForExistence(timeout: 5))
    }
}
