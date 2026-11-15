package com.agentic.app

/** SYST: system testing. Used by CI, UI tests and end-to-end tests. Set the URL when the backend is deployed. */
object FlavorConfig {
    val environment = AppEnvironment.SYST
    const val API_BASE_URL = "https://api-syst.agentic.example"
}
