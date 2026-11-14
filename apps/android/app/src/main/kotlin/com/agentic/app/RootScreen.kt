package com.agentic.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.flags.LocalFeatureFlags
import com.agentic.app.core.navigation.Route
import com.agentic.app.core.navigation.Router
import com.agentic.app.designsystem.DSLoadingView
import com.agentic.app.features.auth.SignInScreen
import com.agentic.app.features.auth.SignInViewModel
import com.agentic.app.features.auth.SignUpScreen
import com.agentic.app.features.auth.SignUpViewModel
import com.agentic.app.features.detail.DetailScreen
import com.agentic.app.features.home.HomeScreen
import com.agentic.app.features.home.HomeViewModel
import com.agentic.app.features.profile.ProfileScreen
import com.agentic.app.features.profile.ProfileViewModel
import com.agentic.app.features.settings.SettingsScreen
import com.agentic.app.features.settings.SettingsViewModel

/** Shows the sign-in flow or the signed-in app, and maps every [Route] to its screen. */
@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun RootScreen(app: AppViewModel) {
    val container = app.container
    LaunchedEffect(Unit) { container.featureFlags.refresh() }
    // Test tags double as resource IDs, so Maestro and UI Automator find elements by the same IDs as the iOS app.
    val root = Modifier.semantics { testTagsAsResourceId = true }
    CompositionLocalProvider(LocalFeatureFlags provides container.featureFlags) {
        when (val state = container.session.state) {
            SessionStore.State.Restoring -> {
                LaunchedEffect(Unit) { container.session.restore() }
                DSLoadingView(root)
            }
            SessionStore.State.SignedOut -> AppNavigation(app.signedOutRouter, container, root)
            is SessionStore.State.SignedIn -> {
                LaunchedEffect(state.session.profile.id) { app.signedOutRouter.popToRoot() }
                AppNavigation(app.signedInRouter(state.session.profile.id), container, root)
            }
        }
    }
}

@Composable
private fun AppNavigation(router: Router, container: AppContainer, modifier: Modifier) {
    NavDisplay(
        backStack = router.backStack,
        modifier = modifier,
        onBack = { router.pop() },
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator()
        ),
        entryProvider = entryProvider {
            entry<Route.SignIn> {
                SignInScreen(
                    viewModel = viewModel { SignInViewModel(container.session) },
                    onCreateAccount = { router.push(Route.SignUp) }
                )
            }
            entry<Route.SignUp> {
                SignUpScreen(viewModel = viewModel { SignUpViewModel(container.session) }, onBack = { router.pop() })
            }
            entry<Route.Home> {
                HomeScreen(
                    viewModel = viewModel { HomeViewModel(container.itemsRepository) },
                    onOpenItem = { router.push(Route.ItemDetail(it)) },
                    onOpenProfile = { router.push(Route.Profile) },
                    onOpenSettings = { router.push(Route.Settings) }
                )
            }
            entry<Route.ItemDetail> { route ->
                DetailScreen(item = route.item, onBack = { router.pop() }, onBackToHome = { router.popToRoot() })
            }
            entry<Route.Profile> {
                ProfileScreen(viewModel = viewModel { ProfileViewModel(container.session) }, onBack = { router.pop() })
            }
            entry<Route.Settings> {
                SettingsScreen(
                    viewModel = viewModel { SettingsViewModel(container.push, container.environment) },
                    onBack = { router.pop() }
                )
            }
        }
    )
}
