package com.agentic.app.core.flags

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf

/** The app's [FeatureFlagService], provided once in `RootScreen`. */
val LocalFeatureFlags = staticCompositionLocalOf<FeatureFlagService> {
    error("FeatureFlagService not provided")
}

/** Shows its content only when the flag is on: `FeatureGate(FeatureFlag.SETTINGS) { SettingsButton() }`. */
@Composable
fun FeatureGate(flag: FeatureFlag, content: @Composable () -> Unit) {
    if (LocalFeatureFlags.current.isEnabled(flag)) {
        content()
    }
}
