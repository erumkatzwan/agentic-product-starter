import SwiftUI

/// Every screen you can navigate to. Add a case here and map it in `RootView`.
enum Route: Hashable {
    case itemDetail(Item)
    case settings
}

/// Owns the navigation stack, so view models and views navigate without knowing about each other.
@MainActor
@Observable
final class Router {
    var path = NavigationPath()

    var depth: Int { path.count }

    func push(_ route: Route) {
        path.append(route)
    }

    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func popToRoot() {
        path = NavigationPath()
    }
}
