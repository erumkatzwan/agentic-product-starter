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
}

/// Launch arguments used by UI tests and end-to-end tests.
enum LaunchArguments {
    /// Runs the app against bundled fixture data instead of the real backend.
    static let uiTesting = "uiTesting"

    static var isUITesting: Bool {
        ProcessInfo.processInfo.arguments.contains("-\(uiTesting)") || UserDefaults.standard.bool(forKey: uiTesting)
    }
}
