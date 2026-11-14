package com.agentic.app.core.navigation

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.snapshots.SnapshotStateList
import com.agentic.app.core.services.Item

/** Every screen you can navigate to. Add a case here and map it in `RootScreen`. */
sealed interface Route {
    data object SignIn : Route
    data object SignUp : Route
    data object Home : Route
    data class ItemDetail(val item: Item) : Route
    data object Profile : Route
    data object Settings : Route
}

/**
 * Owns a navigation back stack, so screens navigate without knowing about each other.
 * `NavDisplay` (Navigation 3) renders the last route; system back and the top bar back arrow call [pop].
 */
class Router(private val root: Route) {
    val backStack: SnapshotStateList<Route> = mutableStateListOf(root)

    val current: Route get() = backStack.last()

    /** How many screens are above the root. */
    val depth: Int get() = backStack.size - 1

    fun push(route: Route) {
        backStack.add(route)
    }

    /** Returns false when already at the root, so the system can close the app. */
    fun pop(): Boolean {
        if (backStack.size <= 1) return false
        backStack.removeAt(backStack.lastIndex)
        return true
    }

    fun popToRoot() {
        if (backStack.size == 1 && backStack.first() == root) return
        backStack.clear()
        backStack.add(root)
    }
}
