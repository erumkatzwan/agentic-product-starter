import Foundation

/// The build environment, set per configuration in `Config/*.xcconfig`.
enum AppEnvironment: String {
    case dev
    case syst
    case prod

    static var current: AppEnvironment {
        let value = Bundle.main.object(forInfoDictionaryKey: "APP_ENVIRONMENT") as? String ?? ""
        return AppEnvironment(rawValue: value) ?? .dev
    }

    static var apiBaseURL: URL {
        let value = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String ?? ""
        return URL(string: value) ?? URL(fileURLWithPath: "/")
    }

    /// Sentry DSN for crash reporting, set per configuration. Empty means off.
    static var sentryDSN: String {
        Bundle.main.object(forInfoDictionaryKey: "SENTRY_DSN") as? String ?? ""
    }
}

/// Launch arguments used by UI tests and end-to-end tests.
enum LaunchArguments {
    /// Runs the app against bundled fixture data instead of the real backend.
    static let uiTesting = "uiTesting"

    /// XCUITest passes `-uiTesting`; Maestro passes `uiTesting` with the value as a string ("true").
    static var isUITesting: Bool {
        let arguments = ProcessInfo.processInfo.arguments
        if arguments.contains("-\(uiTesting)") || arguments.contains(uiTesting) {
            return true
        }
        let value = UserDefaults.standard.object(forKey: uiTesting)
        if let flag = value as? Bool {
            return flag
        }
        return ["true", "yes", "1"].contains((value as? String)?.lowercased() ?? "")
    }
}
