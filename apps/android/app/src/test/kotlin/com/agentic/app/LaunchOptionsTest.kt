package com.agentic.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LaunchOptionsTest {
    @Test
    fun readsUiTestingAndFlagOverridesFromBooleansOrStrings() {
        val options = LaunchOptions.from(mapOf("uiTesting" to "true", "FF_settings" to false, "FF_profile" to "NO", "other" to "x"))

        assertTrue(options.isUiTesting)
        assertEquals(mapOf("settings" to false, "profile" to false), options.flagOverrides)
    }

    @Test
    fun defaultsToTheRealBackend() {
        assertFalse(LaunchOptions.from(emptyMap()).isUiTesting)
    }

    @Test
    fun ignoresValuesItCannotRead() {
        assertNull(LaunchOptions.parseFlag("maybe"))
        assertNull(LaunchOptions.parseFlag(3))
        assertTrue(LaunchOptions.parseFlag("1") == true)
    }

    @Test
    fun onlyProdHidesLocalFlagToggles() {
        assertTrue(AppEnvironment.DEV.canEditFeatureFlags)
        assertTrue(AppEnvironment.SYST.canEditFeatureFlags)
        assertFalse(AppEnvironment.PROD.canEditFeatureFlags)
    }
}
