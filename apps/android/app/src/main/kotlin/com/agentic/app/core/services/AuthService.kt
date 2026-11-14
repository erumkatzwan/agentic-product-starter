package com.agentic.app.core.services

import com.agentic.app.core.network.ApiClient
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.network.Endpoints
import com.agentic.app.core.network.UserProfile

/** A signed-in user: the access token for the backend and their profile. */
data class UserSession(val token: String, val profile: UserProfile)

sealed class AuthError(message: String) : Exception(message) {
    class NotImplemented : AuthError("Not implemented")

    class Cancelled : AuthError("Cancelled")
}

/** Account operations against the backend. Same flow as the iOS and web apps: sign up, sign in, profile, sign out. */
interface AuthService {
    suspend fun signIn(email: String, password: String): UserSession

    suspend fun signUp(email: String, password: String, displayName: String): UserSession

    suspend fun restore(token: String): UserSession

    suspend fun signOut(token: String)

    suspend fun updateProfile(token: String, displayName: String): UserProfile

    suspend fun deleteAccount(token: String)

    /**
     * Skeleton: use Credential Manager with Sign in with Google (`androidx.credentials` and
     * `com.google.android.libraries.identity.googleid`) to get a Google ID token, then exchange it
     * with a backend endpoint for an access token.
     */
    suspend fun signInWithGoogle(): UserSession
}

class RemoteAuthService(private val apiClient: ApiClient) : AuthService {
    override suspend fun signIn(email: String, password: String): UserSession =
        restore(apiClient.send(Endpoints.signIn(email, password)).accessToken)

    override suspend fun signUp(email: String, password: String, displayName: String): UserSession =
        restore(apiClient.send(Endpoints.signUp(email, password, displayName)).accessToken)

    override suspend fun restore(token: String): UserSession = UserSession(token, apiClient.send(Endpoints.profile(token)))

    override suspend fun signOut(token: String) {
        try {
            apiClient.send(Endpoints.signOut(token))
        } catch (error: ApiError) {
            // Signing out locally always succeeds, even when the backend cannot be reached.
        }
    }

    override suspend fun updateProfile(token: String, displayName: String): UserProfile =
        apiClient.send(Endpoints.updateProfile(token, displayName))

    override suspend fun deleteAccount(token: String) {
        apiClient.send(Endpoints.deleteAccount(token))
    }

    override suspend fun signInWithGoogle(): UserSession = throw AuthError.NotImplemented()
}
