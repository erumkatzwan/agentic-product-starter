import SwiftUI

struct DetailView: View {
    @Environment(\.theme) private var theme
    @Environment(Router.self) private var router
    let item: Item

    var body: some View {
        ScrollView {
            VStack(spacing: theme.spacing.l) {
                DSCard {
                    Text(item.title)
                        .font(theme.typography.title)
                        .foregroundStyle(theme.colors.textPrimary)
                        .accessibilityIdentifier("detail.title")
                    Text(item.subtitle)
                        .font(theme.typography.body)
                        .foregroundStyle(theme.colors.textSecondary)
                }
                Button("Back to home") {
                    router.popToRoot()
                }
                .buttonStyle(.ds(.primary))
                .accessibilityIdentifier("detail.backToHome")
            }
            .padding(theme.spacing.m)
        }
        .background(theme.colors.background)
        .navigationTitle("Detail")
        .navigationBarTitleDisplayMode(.inline)
    }
}
