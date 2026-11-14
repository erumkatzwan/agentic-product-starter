package com.agentic.app

import com.agentic.app.core.flags.FeatureFlag
import com.agentic.app.core.flags.FeatureFlagService
import com.agentic.app.core.flags.InMemoryFlagOverrideStore
import com.agentic.app.core.network.ApiError
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FeatureFlagServiceTest {
    private val remote = FakeApiClient(
        mapOf("GET /api/feature-flags" to """{ "flags": { "settings": false, "google_sign_in": true } }""")
    )

    @Test
    fun usesDefaultsBeforeTheBackendAnswers() {
        val service = FeatureFlagService(remote, InMemoryFlagOverrideStore())

        assertTrue(service.isEnabled(FeatureFlag.SETTINGS))
        assertFalse(service.isEnabled(FeatureFlag.GOOGLE_SIGN_IN))
    }

    @Test
    fun backendValuesReplaceDefaults() = runTest {
        val service = FeatureFlagService(remote, InMemoryFlagOverrideStore())

        service.refresh()

        assertFalse(service.isEnabled(FeatureFlag.SETTINGS))
        assertTrue(service.isEnabled(FeatureFlag.GOOGLE_SIGN_IN))
        assertTrue(service.isEnabled(FeatureFlag.PROFILE))
    }

    @Test
    fun localToggleWinsOverBackendAndCanBeReset() = runTest {
        val store = InMemoryFlagOverrideStore()
        val service = FeatureFlagService(remote, store)
        service.refresh()

        service.setOverride(FeatureFlag.SETTINGS, true)
        assertTrue(service.isEnabled(FeatureFlag.SETTINGS))
        assertEquals(mapOf("settings" to true), store.readAll())

        service.resetOverrides()
        assertFalse(service.isEnabled(FeatureFlag.SETTINGS))
        assertEquals(emptyMap<String, Boolean>(), store.readAll())
    }

    @Test
    fun launchOverridesWinOverSavedToggles() {
        val store = InMemoryFlagOverrideStore(mapOf("settings" to true))

        val service = FeatureFlagService(remote, store, launchOverrides = mapOf("settings" to false))

        assertFalse(service.isEnabled(FeatureFlag.SETTINGS))
    }

    @Test
    fun keepsLastKnownValuesWhenTheBackendFails() = runTest {
        val service = FeatureFlagService(FakeApiClient(failure = ApiError.Transport("offline")), InMemoryFlagOverrideStore())

        service.refresh()

        assertTrue(service.isEnabled(FeatureFlag.SETTINGS))
    }
}
