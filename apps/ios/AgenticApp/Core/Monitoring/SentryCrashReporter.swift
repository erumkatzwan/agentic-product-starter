import Foundation
import Sentry

/// Sends crashes and captured errors to Sentry. No personal data: user IDs only, never emails or names.
struct SentryCrashReporter: CrashReporter {
    let dsn: String
    let environment: String

    func start() {
        SentrySDK.start { options in
            options.dsn = dsn
            options.environment = environment
            options.sendDefaultPii = false
            options.tracesSampleRate = 0.2
        }
    }

    func capture(_ error: Error) {
        SentrySDK.capture(error: error)
    }
}
