package com.agentic.app

/** Prod: the live backend. Set the URL when the backend is deployed. */
object FlavorConfig {
    val environment = AppEnvironment.PROD
    const val API_BASE_URL = "https://api.agentic.example"

    /** Crash reporting (Sentry). Empty means off; see observability/README.md. */
    const val SENTRY_DSN = ""
}
