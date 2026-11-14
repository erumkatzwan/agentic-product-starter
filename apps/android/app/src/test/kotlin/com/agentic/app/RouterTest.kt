package com.agentic.app

import com.agentic.app.core.navigation.Route
import com.agentic.app.core.navigation.Router
import com.agentic.app.core.services.Item
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RouterTest {
    private val item = Item("1", "Title", "Subtitle")

    @Test
    fun pushAddsScreensOnTop() {
        val router = Router(Route.Home)

        router.push(Route.ItemDetail(item))
        router.push(Route.Settings)

        assertEquals(2, router.depth)
        assertEquals(Route.Settings, router.current)
    }

    @Test
    fun popGoesBackOneScreenAndStopsAtRoot() {
        val router = Router(Route.Home)
        router.push(Route.Profile)

        assertTrue(router.pop())
        assertFalse(router.pop())
        assertEquals(Route.Home, router.current)
    }

    @Test
    fun popToRootClearsTheStack() {
        val router = Router(Route.Home)
        router.push(Route.ItemDetail(item))
        router.push(Route.Settings)

        router.popToRoot()

        assertEquals(0, router.depth)
        assertEquals(listOf<Route>(Route.Home), router.backStack.toList())
    }
}
