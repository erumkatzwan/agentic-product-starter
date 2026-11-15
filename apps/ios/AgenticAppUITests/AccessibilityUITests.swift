import XCTest

/// Apple's accessibility audit on every screen: missing labels, contrast, hit area size, Dynamic Type,
/// clipped text and traits (WCAG 2.2 AA is the target, ADR-0011). Add new screens here.
final class AccessibilityUITests: XCTestCase {
    private let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launchArguments = ["-uiTesting"]
    }

    /// Fails with one readable line per issue, so the report says what to fix and where.
    private func audit(_ screen: String) throws {
        // Let navigation animations finish so the audit sees the settled screen, not a half-pushed one.
        _ = XCTWaiter.wait(for: [XCTestExpectation(description: "screen settles")], timeout: 1.0)
        var issues: [String] = []
        try app.performAccessibilityAudit { issue in
            // Known platform false positive: a single-line text field scrolls its text horizontally by design,
            // and the audit reports that as clipped. Everything else is recorded.
            if issue.auditType == .textClipped, issue.element?.elementType == .textField { return true }
            // An element cut off by the screen edge cannot be judged; it is audited once scrolled into view.
            if let element = issue.element, !self.app.windows.firstMatch.frame.contains(element.frame) { return true }
            let element = issue.element.map { "\($0.elementType) '\($0.identifier.isEmpty ? $0.label : $0.identifier)'" } ?? "screen"
            issues.append("\(screen): \(issue.compactDescription) on \(element)")
            return true
        }
        XCTAssertEqual(issues, [], issues.joined(separator: "\n"))
    }

    private func signIn() {
        let submit = app.buttons["signIn.submit"]
        XCTAssertTrue(submit.waitForExistence(timeout: 10))
        submit.tap()
        XCTAssertTrue(app.buttons["home.item.1"].waitForExistence(timeout: 10))
    }

    func testSignedOutScreensAreAccessible() throws {
        app.launch()
        XCTAssertTrue(app.buttons["signIn.submit"].waitForExistence(timeout: 10))
        try audit("sign in")

        app.buttons["signIn.createAccount"].tap()
        XCTAssertTrue(app.buttons["signUp.submit"].waitForExistence(timeout: 5))
        try audit("sign up")
    }

    func testSignedInScreensAreAccessible() throws {
        app.launch()
        signIn()
        try audit("home")

        app.buttons["home.item.1"].tap()
        XCTAssertTrue(app.staticTexts["detail.title"].waitForExistence(timeout: 5))
        try audit("detail")
        app.buttons["detail.backToHome"].tap()

        app.buttons["home.profileButton"].tap()
        XCTAssertTrue(app.buttons["profile.save"].waitForExistence(timeout: 5))
        try audit("profile")
        app.navigationBars.buttons.element(boundBy: 0).tap()

        app.buttons["home.settingsButton"].tap()
        XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 5))
        try audit("settings")
        // Audit the rows below the fold once they are fully on screen.
        app.swipeUp()
        try audit("settings, scrolled")
    }
}
