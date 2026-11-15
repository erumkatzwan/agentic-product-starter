package com.agentic.app

/** Prod: the live backend. Set the URL when the backend is deployed. */
object FlavorConfig {
    val environment = AppEnvironment.PROD
    const val API_BASE_URL = "https://api.agentic.example"
}
