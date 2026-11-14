import SwiftUI

/// Design-system card: a padded surface with rounded corners.
struct DSCard<Content: View>: View {
    @Environment(\.theme) private var theme
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.s) {
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(theme.spacing.m)
        .background(
            RoundedRectangle(cornerRadius: theme.radius.l)
                .fill(theme.colors.surface)
        )
    }
}
