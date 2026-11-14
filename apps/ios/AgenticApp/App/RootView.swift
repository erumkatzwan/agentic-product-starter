import SwiftUI

/// Shows the sign-in flow or the signed-in app, and maps every `Route` to its screen.
struct RootView: View {
    @Environment(AppContainer.self) private var container

    var body: some View {
        switch container.session.state {
        case .restoring:
            DSLoadingView()
                .task { await container.session.restore() }
        case .signedOut:
            NavigationStack {
                SignInView(viewModel: SignInViewModel(session: container.session))
            }
        case .signedIn:
            SignedInRootView()
        }
    }
}

private struct SignedInRootView: View {
    @Environment(AppContainer.self) private var container
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView(viewModel: HomeViewModel(repository: container.itemsRepository))
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                }
        }
        .environment(router)
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .itemDetail(let item):
            DetailView(item: item)
        case .profile:
            ProfileView(viewModel: ProfileViewModel(session: container.session))
        case .settings:
            SettingsView(viewModel: SettingsViewModel(pushService: container.pushService))
        }
    }
}
