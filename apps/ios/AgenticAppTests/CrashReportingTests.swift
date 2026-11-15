@testable import AgenticApp
import XCTest

final class CrashReportingTests: XCTestCase {
    private let dsn = "https://key@example.ingest.sentry.io/1"

    func testIsOffWithoutADSN() {
        XCTAssertFalse(CrashReporting.isEnabled(dsn: "", isUITesting: false))
        XCTAssertFalse(CrashReporting.isEnabled(dsn: "   ", isUITesting: false))
        XCTAssertTrue(CrashReporting.make(dsn: "", environment: .syst, isUITesting: false) is NoOpCrashReporter)
    }

    func testIsOffInUIAndEndToEndTests() {
        XCTAssertFalse(CrashReporting.isEnabled(dsn: dsn, isUITesting: true))
        XCTAssertTrue(CrashReporting.make(dsn: dsn, environment: .syst, isUITesting: true) is NoOpCrashReporter)
    }

    func testUsesSentryWithADSNOutsideTests() {
        let reporter = CrashReporting.make(dsn: dsn, environment: .prod, isUITesting: false)

        XCTAssertEqual((reporter as? SentryCrashReporter)?.environment, "prod")
    }

    func testTheNoOpReporterIgnoresEverything() {
        let reporter = NoOpCrashReporter()
        reporter.start()
        reporter.capture(URLError(.badURL))
    }
}
