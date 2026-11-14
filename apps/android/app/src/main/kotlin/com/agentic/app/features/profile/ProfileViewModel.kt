package com.agentic.app.features.profile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.network.ApiError

class ProfileViewModel(private val session: SessionStore) : ViewModel() {
    sealed interface Message {
        data object Saved : Message

        data class Error(val text: String) : Message
    }

    var displayName by mutableStateOf(session.profile?.displayName.orEmpty())
    var message by mutableStateOf<Message?>(null)
        private set
    var fieldError by mutableStateOf<String?>(null)
        private set

    val email: String get() = session.profile?.email.orEmpty()

    suspend fun save() {
        message = null
        fieldError = null
        try {
            session.updateProfile(displayName)
            message = Message.Saved
        } catch (error: ApiError) {
            val field = error.fieldErrors["displayName"]
            if (field != null) fieldError = field else message = Message.Error("Could not save. Please try again.")
        }
    }

    suspend fun signOut() {
        session.signOut()
    }

    suspend fun deleteAccount() {
        try {
            session.deleteAccount()
        } catch (error: ApiError) {
            message = Message.Error("Could not delete your account. Please try again.")
        }
    }
}
