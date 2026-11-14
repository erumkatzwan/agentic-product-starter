import SwiftUI

/// Design-system button. Use `.buttonStyle(.ds(.primary))` instead of styling buttons by hand.
struct DSButtonStyle: ButtonStyle {
    enum Kind {
        case primary
        case secondary
    }

    let kind: Kind

    func makeBody(configuration: Configuration) -> some View {
        DSButtonBody(configuration: configuration, kind: kind)
    }
}

private struct DSButtonBody: View {
    @Environment(\.theme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    let configuration: ButtonStyleConfiguration
    let kind: DSButtonStyle.Kind

    var body: some View {
        configuration.label
            .font(theme.typography.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, theme.spacing.m)
            .foregroundStyle(kind == .primary ? theme.colors.onPrimary : theme.colors.primary)
            .background(
                RoundedRectangle(cornerRadius: theme.radius.m)
                    .fill(kind == .primary ? theme.colors.primary : theme.colors.surface)
            )
            .opacity(isEnabled ? (configuration.isPressed ? 0.8 : 1) : 0.4)
    }
}

extension ButtonStyle where Self == DSButtonStyle {
    static func ds(_ kind: DSButtonStyle.Kind) -> DSButtonStyle {
        DSButtonStyle(kind: kind)
    }
}
