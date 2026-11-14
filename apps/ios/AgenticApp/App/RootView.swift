import SwiftUI

/// Hosts the navigation stack and maps every `Route` to its screen.
struct RootView: View {
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
        case .settings:
            SettingsView(viewModel: SettingsViewModel(
                authService: container.authService,
                pushService: container.pushService
            ))
        }
    }
}
