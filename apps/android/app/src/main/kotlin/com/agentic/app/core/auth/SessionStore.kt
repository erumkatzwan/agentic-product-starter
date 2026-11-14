package com.agentic.app.core.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.network.UserProfile
import com.agentic.app.core.services.AuthService
import com.agentic.app.core.services.UserSession

/** Who is signed in, for the whole app. `RootScreen` shows the sign-in flow or the app based on [state]. */
class SessionStore(private val authService: AuthService, private val tokenStore: TokenStore) {
    sealed interface State {
        data object Restoring : State

        data object SignedOut : State

        data class SignedIn(val session: UserSession) : State
    }

    var state: State by mutableStateOf(if (tokenStore.read() == null) State.SignedOut else State.Restoring)
        private set

    val session: UserSession? get() = (state as? State.SignedIn)?.session

    val profile: UserProfile? get() = session?.profile

    /** Signs back in with the stored token on launch; drops it if the backend no longer accepts it. */
    suspend fun restore() {
        val token = tokenStore.read()
        if (state != State.Restoring || token == null) return
        state = try {
            State.SignedIn(authService.restore(token))
        } catch (error: ApiError) {
            tokenStore.save(null)
            State.SignedOut
        }
    }

    suspend fun signIn(email: String, password: String) {
        start(authService.signIn(email, password))
    }

    suspend fun signUp(email: String, password: String, displayName: String) {
        start(authService.signUp(email, password, displayName))
    }

    suspend fun signInWithGoogle() {
        start(authService.signInWithGoogle())
    }

    suspend fun signOut() {
        session?.let { authService.signOut(it.token) }
        end()
    }

    suspend fun updateProfile(displayName: String) {
        val current = session ?: return
        val profile = authService.updateProfile(current.token, displayName)
        state = State.SignedIn(current.copy(profile = profile))
    }

    suspend fun deleteAccount() {
        val current = session ?: return
        authService.deleteAccount(current.token)
        end()
    }

    private fun start(session: UserSession) {
        tokenStore.save(session.token)
        state = State.SignedIn(session)
    }

    private fun end() {
        tokenStore.save(null)
        state = State.SignedOut
    }
}
