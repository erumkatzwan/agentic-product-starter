import SwiftUI

struct SettingsView: View {
    @Environment(FeatureFlagService.self) private var featureFlags
    @Environment(\.theme) private var theme
    @State private var viewModel: SettingsViewModel

    init(viewModel: SettingsViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        Form {
            Section {
                LabeledContent("Environment", value: viewModel.environmentName)
            } header: {
                header("App")
            }

            FeatureGate(.pushPrompt) {
                Section {
                    LabeledContent("Status", value: viewModel.pushStatus)
                    Button("Enable notifications") {
                        Task { await viewModel.enablePush() }
                    }
                    .font(theme.typography.body)
                    .accessibilityIdentifier("settings.enablePush")
                } header: {
                    header("Notifications")
                }
            }

            if viewModel.canEditFeatureFlags {
                Section {
                    ForEach(FeatureFlag.allCases) { flag in
                        Toggle(flag.rawValue, isOn: Binding(
                            get: { featureFlags.isEnabled(flag) },
                            set: { featureFlags.setOverride($0, for: flag) }
                        ))
                        .accessibilityIdentifier("settings.flag.\(flag.rawValue)")
                    }
                    Button {
                        FeatureFlag.allCases.forEach { featureFlags.setOverride(nil, for: $0) }
                    } label: {
                        Text("Reset to backend values")
                            .font(theme.typography.body)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                } header: {
                    header("Feature flags (this device)")
                }
            }
        }
        .scrollContentBackground(.hidden)
        .background(theme.colors.background)
        .navigationTitle("Settings")
    }

    /// Section headers use the design system's secondary text colour, which passes WCAG AA contrast.
    private func header(_ title: String) -> some View {
        Text(title)
            .font(theme.typography.caption)
            .foregroundStyle(theme.colors.textSecondary)
            .accessibilityAddTraits(.isHeader)
    }
}
