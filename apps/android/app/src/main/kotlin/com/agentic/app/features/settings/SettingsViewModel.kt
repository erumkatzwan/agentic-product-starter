package com.agentic.app.features.settings

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.agentic.app.AppEnvironment
import com.agentic.app.core.services.PushNotificationService

class SettingsViewModel(private val push: PushNotificationService, private val environment: AppEnvironment) : ViewModel() {
    var pushStatus by mutableStateOf(if (push.areEnabled() && push.permission == null) ENABLED else NOT_REQUESTED)
        private set

    val environmentName: String get() = environment.displayName
    val canEditFeatureFlags: Boolean get() = environment.canEditFeatureFlags

    /** The permission to request from the screen, or `null` when none is needed and push is registered directly. */
    fun permissionToRequest(): String? {
        val permission = push.permission
        if (permission == null) onPermissionResult(push.areEnabled())
        return permission
    }

    fun onPermissionResult(granted: Boolean) {
        if (granted) push.register()
        pushStatus = if (granted) ENABLED else NOT_ALLOWED
    }

    companion object {
        const val NOT_REQUESTED = "Not requested"
        const val ENABLED = "Enabled"
        const val NOT_ALLOWED = "Not allowed"
    }
}
