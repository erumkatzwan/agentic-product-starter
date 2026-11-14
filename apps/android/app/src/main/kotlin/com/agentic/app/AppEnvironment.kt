package com.agentic.app

/** The build environment, chosen by product flavor (src/dev, src/syst, src/prod). */
enum class AppEnvironment(val displayName: String) {
    DEV("DEV"),
    SYST("SYST"),
    PROD("PROD");

    /** Local feature-flag toggles are for testing only, never in Prod. */
    val canEditFeatureFlags: Boolean get() = this != PROD

    companion object {
        val current: AppEnvironment get() = FlavorConfig.environment
        val apiBaseUrl: String get() = FlavorConfig.API_BASE_URL
    }
}

/**
 * Options passed when the app is launched by UI tests and end-to-end tests, as intent extras.
 * `uiTesting=true` runs the app on bundled fixture data. `FF_<flag>=false` forces a feature flag.
 * Values can be booleans or strings ("true", "false", "yes", "no", "1", "0").
 */
data class LaunchOptions(
    val isUiTesting: Boolean = false,
    val flagOverrides: Map<String, Boolean> = emptyMap()
) {
    companion object {
        const val UI_TESTING = "uiTesting"
        const val FLAG_PREFIX = "FF_"

        fun from(extras: Map<String, Any?>): LaunchOptions {
            val overrides = extras
                .filterKeys { it.startsWith(FLAG_PREFIX) }
                .mapNotNull { (key, value) -> parseFlag(value)?.let { key.removePrefix(FLAG_PREFIX) to it } }
                .toMap()
            return LaunchOptions(
                isUiTesting = parseFlag(extras[UI_TESTING]) ?: false,
                flagOverrides = overrides
            )
        }

        fun parseFlag(value: Any?): Boolean? = when (value) {
            is Boolean -> value
            is String -> when (value.lowercase()) {
                "true", "yes", "1" -> true
                "false", "no", "0" -> false
                else -> null
            }
            else -> null
        }
    }
}
