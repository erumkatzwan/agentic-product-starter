import Foundation

/// Every toggleable feature, screen or component. The raw value is the key used by the backend.
enum FeatureFlag: String, CaseIterable, Identifiable {
    case settings
    case itemDetail = "item_detail"
    case pushPrompt = "push_prompt"
    case googleSignIn = "google_sign_in"

    var id: String { rawValue }

    /// Used when the backend has not answered (offline, first launch) or does not know the flag.
    var defaultValue: Bool {
        switch self {
        case .settings, .itemDetail:
            return true
        case .pushPrompt, .googleSignIn:
            return false
        }
    }

    /// Key for local overrides and launch arguments, for example `-FF_settings NO`.
    var overrideKey: String { "FF_\(rawValue)" }
}

/// Response of `GET /feature-flags`, for example `{ "flags": { "settings": true } }`.
struct RemoteFeatureFlags: Decodable, Equatable {
    let flags: [String: Bool]
}
