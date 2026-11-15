import Foundation
import Sentry

/// Sends crashes and captured errors to Sentry. Sentry sends no personal data by default; keep it that way.
struct SentryCrashReporter: CrashReporter {
    let dsn: String
    let environment: String

    func start() {
        SentrySDK.start { options in
            options.dsn = dsn
            options.environment = environment
            options.tracesSampleRate = 0.2
        }
    }

    func capture(_ error: Error) {
        SentrySDK.capture(error: error)
    }
}
