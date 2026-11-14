import SwiftUI

struct SettingsView: View {
    @Environment(FeatureFlagService.self) private var featureFlags
    @State private var viewModel: SettingsViewModel

    init(viewModel: SettingsViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        Form {
            Section("App") {
                LabeledContent("Environment", value: viewModel.environmentName)
            }

            FeatureGate(.pushPrompt) {
                Section("Notifications") {
                    LabeledContent("Status", value: viewModel.pushStatus)
                    Button("Enable notifications") {
                        Task { await viewModel.enablePush() }
                    }
                    .accessibilityIdentifier("settings.enablePush")
                }
            }

            if viewModel.canEditFeatureFlags {
                Section("Feature flags (this device)") {
                    ForEach(FeatureFlag.allCases) { flag in
                        Toggle(flag.rawValue, isOn: Binding(
                            get: { featureFlags.isEnabled(flag) },
                            set: { featureFlags.setOverride($0, for: flag) }
                        ))
                        .accessibilityIdentifier("settings.flag.\(flag.rawValue)")
                    }
                    Button("Reset to backend values") {
                        FeatureFlag.allCases.forEach { featureFlags.setOverride(nil, for: $0) }
                    }
                }
            }
        }
        .navigationTitle("Settings")
    }
}
