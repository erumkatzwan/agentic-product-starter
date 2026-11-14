package com.agentic.app.core.network

import com.agentic.app.core.flags.RemoteFeatureFlags
import com.agentic.app.core.services.Item
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

enum class HttpMethod { GET, POST, PUT, PATCH, DELETE }

/** Shared JSON settings: the backend may add fields, the app ignores what it does not know. */
val apiJson = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
}

/**
 * Describes one REST call and the type it decodes to. Set [token] for endpoints that need a signed-in user.
 * Use `Unit.serializer()` for endpoints that return no body (HTTP 204).
 */
data class Endpoint<T>(
    val path: String,
    val responseSerializer: KSerializer<T>,
    val method: HttpMethod = HttpMethod.GET,
    val query: Map<String, String> = emptyMap(),
    val body: String? = null,
    val token: String? = null
) {
    val hasResponseBody: Boolean get() = responseSerializer != Unit.serializer()
}

/** Response of sign in and sign up: `{ "accessToken": "...", "expiresIn": 3600 }`. */
@Serializable
data class AccessToken(val accessToken: String, val expiresIn: Int)

/** The signed-in user's profile from `GET /api/me`. */
@Serializable
data class UserProfile(val id: String, val email: String, val displayName: String, val role: String)

/** All REST endpoints in one place, matching the .NET backend and the iOS app. Add new endpoints here. */
object Endpoints {
    val items = Endpoint("/api/items", ListSerializer(Item.serializer()))
    val featureFlags = Endpoint("/api/feature-flags", RemoteFeatureFlags.serializer())

    fun signIn(email: String, password: String) = Endpoint(
        path = "/api/auth/signin",
        responseSerializer = AccessToken.serializer(),
        method = HttpMethod.POST,
        body = json("email" to email, "password" to password)
    )

    fun signUp(email: String, password: String, displayName: String) = Endpoint(
        path = "/api/auth/signup",
        responseSerializer = AccessToken.serializer(),
        method = HttpMethod.POST,
        body = json("email" to email, "password" to password, "displayName" to displayName)
    )

    fun signOut(token: String) = Endpoint("/api/auth/signout", Unit.serializer(), method = HttpMethod.POST, token = token)

    fun profile(token: String) = Endpoint("/api/me", UserProfile.serializer(), token = token)

    fun updateProfile(token: String, displayName: String) = Endpoint(
        path = "/api/me",
        responseSerializer = UserProfile.serializer(),
        method = HttpMethod.PUT,
        body = json("displayName" to displayName),
        token = token
    )

    fun deleteAccount(token: String) = Endpoint("/api/me", Unit.serializer(), method = HttpMethod.DELETE, token = token)

    private val stringMap = MapSerializer(String.serializer(), String.serializer())

    private fun json(vararg fields: Pair<String, String>): String = apiJson.encodeToString(stringMap, mapOf(*fields))
}
