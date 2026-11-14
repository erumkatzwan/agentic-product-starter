import Foundation
import Observation

/// Decides whether a feature is on.
/// Order of precedence: launch argument or local override, then the backend value, then the default.
@MainActor
@Observable
final class FeatureFlagService {
    private(set) var remoteFlags: [String: Bool] = [:]
    /// Bumped on every local change so SwiftUI re-renders gated views.
    private(set) var revision = 0

    private let apiClient: APIClient
    private let defaults: UserDefaults

    init(apiClient: APIClient, defaults: UserDefaults = .standard) {
        self.apiClient = apiClient
        self.defaults = defaults
    }

    func isEnabled(_ flag: FeatureFlag) -> Bool {
        _ = revision
        if defaults.object(forKey: flag.overrideKey) != nil {
            return defaults.bool(forKey: flag.overrideKey)
        }
        return remoteFlags[flag.rawValue] ?? flag.defaultValue
    }

    /// Front-end toggle: set `true`/`false` to force a flag on this device, `nil` to follow the backend.
    func setOverride(_ value: Bool?, for flag: FeatureFlag) {
        if let value {
            defaults.set(value, forKey: flag.overrideKey)
        } else {
            defaults.removeObject(forKey: flag.overrideKey)
        }
        revision += 1
    }

    /// Back-end toggle: fetches the current flags. On failure the last known values stay in place.
    func refresh() async {
        do {
            remoteFlags = try await apiClient.send(Endpoints.featureFlags).flags
        } catch {
            // Keep last known values and defaults.
        }
    }
}
