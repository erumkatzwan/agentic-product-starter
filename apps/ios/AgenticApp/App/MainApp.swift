import SwiftUI

@main
struct MainApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var container = AppContainer.make()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(container)
                .environment(container.featureFlags)
                .environment(\.theme, container.theme)
                .task { await container.featureFlags.refresh() }
        }
    }
}
