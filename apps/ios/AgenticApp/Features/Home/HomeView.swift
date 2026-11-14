import SwiftUI

struct HomeView: View {
    @Environment(\.theme) private var theme
    @Environment(Router.self) private var router
    @Environment(FeatureFlagService.self) private var featureFlags
    @State private var viewModel: HomeViewModel

    init(viewModel: HomeViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        content
            .navigationTitle("Home")
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    FeatureGate(.profile) {
                        Button {
                            router.push(.profile)
                        } label: {
                            Image(systemName: "person.crop.circle")
                        }
                        .accessibilityLabel("Profile")
                        .accessibilityIdentifier("home.profileButton")
                    }
                    FeatureGate(.settings) {
                        Button {
                            router.push(.settings)
                        } label: {
                            Image(systemName: "gearshape")
                        }
                        .accessibilityLabel("Settings")
                        .accessibilityIdentifier("home.settingsButton")
                    }
                }
            }
            .task {
                if viewModel.state == .idle {
                    await viewModel.load()
                }
            }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .idle, .loading:
            DSLoadingView()
        case .failed(let message):
            DSErrorView(message: message) {
                Task { await viewModel.load() }
            }
        case .loaded(let items):
            list(items)
        }
    }

    private func list(_ items: [Item]) -> some View {
        List(items) { item in
            Button {
                router.push(.itemDetail(item))
            } label: {
                VStack(alignment: .leading, spacing: theme.spacing.xs) {
                    Text(item.title)
                        .font(theme.typography.headline)
                        .foregroundStyle(theme.colors.textPrimary)
                    Text(item.subtitle)
                        .font(theme.typography.caption)
                        .foregroundStyle(theme.colors.textSecondary)
                }
            }
            .disabled(!featureFlags.isEnabled(.itemDetail))
            .accessibilityIdentifier("home.item.\(item.id)")
        }
        .accessibilityIdentifier("home.list")
    }
}
