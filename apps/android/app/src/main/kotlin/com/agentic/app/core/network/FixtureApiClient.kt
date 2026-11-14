package com.agentic.app.core.network

import java.io.IOException

/**
 * Test-data client used by UI tests and end-to-end tests (launch extra `uiTesting=true`).
 * Maps an endpoint path to a JSON file in `assets/fixtures`, dropping the `/api/` prefix:
 * `/api/feature-flags` → `feature-flags.json`, `/api/auth/signin` → `auth-signin.json`.
 * The same fixture files are used by the iOS app.
 */
class FixtureApiClient(private val load: (name: String) -> String) : ApiClient {
    override suspend fun <T> send(endpoint: Endpoint<T>): T {
        if (!endpoint.hasResponseBody) return decode(endpoint, "{}")
        val name = fixtureName(endpoint.path)
        val text = try {
            load(name)
        } catch (error: IOException) {
            throw ApiError.MissingFixture(name)
        }
        return decode(endpoint, text)
    }

    companion object {
        fun fixtureName(path: String): String = path.trim('/').removePrefix("api/").replace('/', '-')
    }
}
