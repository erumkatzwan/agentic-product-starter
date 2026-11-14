import SwiftUI

/// Design-system loading and error states, so every screen looks the same while waiting or failing.
struct DSLoadingView: View {
    var body: some View {
        ProgressView()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .accessibilityIdentifier("ds.loading")
    }
}

struct DSErrorView: View {
    @Environment(\.theme) private var theme
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: theme.spacing.m) {
            Text(message)
                .font(theme.typography.body)
                .foregroundStyle(theme.colors.error)
                .multilineTextAlignment(.center)
            Button("Try again", action: retry)
                .buttonStyle(.ds(.secondary))
        }
        .padding(theme.spacing.l)
        .accessibilityIdentifier("ds.error")
    }
}
