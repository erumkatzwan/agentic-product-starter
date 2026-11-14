package com.agentic.app.core.flags

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.agentic.app.core.network.ApiClient
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.network.Endpoints

/**
 * Decides whether a feature is on.
 * Order of precedence: launch extra or local toggle, then the backend value, then the default.
 * Values are Compose state, so gated UI updates as soon as a flag changes.
 */
class FeatureFlagService(
    private val apiClient: ApiClient,
    private val store: FlagOverrideStore,
    launchOverrides: Map<String, Boolean> = emptyMap()
) {
    private var remoteFlags by mutableStateOf<Map<String, Boolean>>(emptyMap())
    private val overrides = mutableStateMapOf<String, Boolean>().apply {
        putAll(store.readAll())
        putAll(launchOverrides)
    }

    fun isEnabled(flag: FeatureFlag): Boolean = overrides[flag.key] ?: remoteFlags[flag.key] ?: flag.defaultValue

    /** Front-end toggle: `true`/`false` forces a flag on this device, `null` follows the backend again. */
    fun setOverride(flag: FeatureFlag, value: Boolean?) {
        if (value == null) overrides.remove(flag.key) else overrides[flag.key] = value
        store.write(flag.key, value)
    }

    fun resetOverrides() {
        FeatureFlag.entries.forEach { setOverride(it, null) }
    }

    /** Back-end toggle: fetches the current flags. On failure the last known values stay in place. */
    suspend fun refresh() {
        try {
            remoteFlags = apiClient.send(Endpoints.featureFlags).flags
        } catch (error: ApiError) {
            // Offline or backend error: keep last known values and defaults.
        }
    }
}
