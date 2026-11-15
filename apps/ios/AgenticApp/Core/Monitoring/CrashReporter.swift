import Foundation

/// Reports crashes and unexpected errors (ADR-0008). Off when no DSN is set for the configuration.
protocol CrashReporter: Sendable {
    func start()
    func capture(_ error: Error)
}

/// Used when reporting is off: no DSN, or UI and end-to-end tests.
struct NoOpCrashReporter: CrashReporter {
    func start() {}
    func capture(_ error: Error) {}
}

enum CrashReporting {
    /// Sentry only when a DSN is configured and the app is not under test.
    static func isEnabled(dsn: String, isUITesting: Bool) -> Bool {
        !dsn.trimmingCharacters(in: .whitespaces).isEmpty && !isUITesting
    }

    static func make(dsn: String, environment: AppEnvironment, isUITesting: Bool) -> CrashReporter {
        isEnabled(dsn: dsn, isUITesting: isUITesting)
            ? SentryCrashReporter(dsn: dsn, environment: environment.rawValue)
            : NoOpCrashReporter()
    }
}
