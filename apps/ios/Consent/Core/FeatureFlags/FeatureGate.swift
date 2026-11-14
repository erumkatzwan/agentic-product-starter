import SwiftUI

/// Shows its content only when the flag is on: `FeatureGate(.settings) { SettingsButton() }`.
struct FeatureGate<Content: View>: View {
    @Environment(FeatureFlagService.self) private var featureFlags
    private let flag: FeatureFlag
    private let content: Content

    init(_ flag: FeatureFlag, @ViewBuilder content: () -> Content) {
        self.flag = flag
        self.content = content()
    }

    var body: some View {
        if featureFlags.isEnabled(flag) {
            content
        }
    }
}
