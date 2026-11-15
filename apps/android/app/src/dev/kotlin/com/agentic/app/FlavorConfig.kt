package com.agentic.app

/** Dev: the local backend. 10.0.2.2 is the computer running the emulator. */
object FlavorConfig {
    val environment = AppEnvironment.DEV
    const val API_BASE_URL = "http://10.0.2.2:5080"

    /** Crash reporting (Sentry). Empty means off; see observability/README.md. */
    const val SENTRY_DSN = ""
}
