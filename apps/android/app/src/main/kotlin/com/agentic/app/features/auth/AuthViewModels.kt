package com.agentic.app.features.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.services.AuthError

internal const val GENERIC_ERROR = "Something went wrong. Please try again."

class SignInViewModel(private val session: SessionStore) : ViewModel() {
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var errorMessage by mutableStateOf<String?>(null)
        private set
    var isBusy by mutableStateOf(false)
        private set

    suspend fun signIn() {
        isBusy = true
        errorMessage = null
        try {
            session.signIn(email, password)
            password = ""
        } catch (error: ApiError) {
            errorMessage = error.userMessage
        } finally {
            isBusy = false
        }
    }

    suspend fun signInWithGoogle() {
        errorMessage = null
        try {
            session.signInWithGoogle()
        } catch (error: AuthError.NotImplemented) {
            errorMessage = "Google sign-in is not implemented yet."
        } catch (error: AuthError) {
            errorMessage = GENERIC_ERROR
        } catch (error: ApiError) {
            errorMessage = error.userMessage
        }
    }
}

class SignUpViewModel(private val session: SessionStore) : ViewModel() {
    var displayName by mutableStateOf("")
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var fieldErrors by mutableStateOf<Map<String, String>>(emptyMap())
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set
    var isBusy by mutableStateOf(false)
        private set

    suspend fun signUp() {
        isBusy = true
        errorMessage = null
        fieldErrors = emptyMap()
        try {
            session.signUp(email, password, displayName)
        } catch (error: ApiError) {
            if (error.fieldErrors.isEmpty()) errorMessage = error.userMessage else fieldErrors = error.fieldErrors
        } finally {
            isBusy = false
        }
    }
}
