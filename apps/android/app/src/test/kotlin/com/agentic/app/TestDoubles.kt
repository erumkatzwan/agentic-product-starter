package com.agentic.app

import com.agentic.app.core.network.ApiClient
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.network.Endpoint
import com.agentic.app.core.network.UserProfile
import com.agentic.app.core.network.apiJson
import com.agentic.app.core.services.AuthError
import com.agentic.app.core.services.AuthService
import com.agentic.app.core.services.Item
import com.agentic.app.core.services.ItemsRepository
import com.agentic.app.core.services.PushNotificationService
import com.agentic.app.core.services.UserSession

val customer = UserProfile(id = "1", email = "customer@example.com", displayName = "Demo Customer", role = "Customer")

/** Answers requests with JSON per "METHOD /path", or fails with the given error. Records every request. */
class FakeApiClient(
    private val responses: Map<String, String> = emptyMap(),
    private val failure: ApiError? = null
) : ApiClient {
    val requests = mutableListOf<Endpoint<*>>()

    override suspend fun <T> send(endpoint: Endpoint<T>): T {
        requests += endpoint
        failure?.let { throw it }
        val body = if (endpoint.hasResponseBody) {
            responses["${endpoint.method} ${endpoint.path}"] ?: throw ApiError.MissingFixture(endpoint.path)
        } else {
            "{}"
        }
        return apiJson.decodeFromString(endpoint.responseSerializer, body)
    }
}

class FakeAuthService(var failure: Exception? = null) : AuthService {
    var signedOutToken: String? = null
    var deletedToken: String? = null

    private fun session(profile: UserProfile = customer) = UserSession("token", profile)

    private fun failIfNeeded() {
        failure?.let { throw it }
    }

    override suspend fun signIn(email: String, password: String): UserSession {
        failIfNeeded()
        return session(customer.copy(email = email))
    }

    override suspend fun signUp(email: String, password: String, displayName: String): UserSession {
        failIfNeeded()
        return session(customer.copy(email = email, displayName = displayName))
    }

    override suspend fun restore(token: String): UserSession {
        failIfNeeded()
        return UserSession(token, customer)
    }

    override suspend fun signOut(token: String) {
        signedOutToken = token
    }

    override suspend fun updateProfile(token: String, displayName: String): UserProfile {
        failIfNeeded()
        return customer.copy(displayName = displayName)
    }

    override suspend fun deleteAccount(token: String) {
        failIfNeeded()
        deletedToken = token
    }

    override suspend fun signInWithGoogle(): UserSession = throw AuthError.NotImplemented()
}

class FakeItemsRepository(private val result: Result<List<Item>>) : ItemsRepository {
    override suspend fun fetchItems(): List<Item> = result.getOrThrow()
}

class FakePush(override val permission: String?, private val enabled: Boolean = false) : PushNotificationService {
    var registered = false

    override fun areEnabled(): Boolean = enabled

    override fun register() {
        registered = true
    }
}
