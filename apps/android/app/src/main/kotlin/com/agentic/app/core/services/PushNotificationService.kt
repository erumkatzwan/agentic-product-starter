package com.agentic.app.core.services

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationManagerCompat

/**
 * Push notification skeleton: notification channel and runtime permission.
 * Next step: add Firebase Cloud Messaging (google-services.json per flavor), receive the device token
 * in a `FirebaseMessagingService` and send it to the backend once the endpoint exists.
 */
interface PushNotificationService {
    /** The runtime permission to ask for, or `null` when the OS does not need one (Android 12 and older). */
    val permission: String?

    fun areEnabled(): Boolean

    /** Call after the permission is granted. */
    fun register()
}

class AndroidPushNotificationService(private val context: Context) : PushNotificationService {
    override val permission: String?
        get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) Manifest.permission.POST_NOTIFICATIONS else null

    override fun areEnabled(): Boolean = NotificationManagerCompat.from(context).areNotificationsEnabled()

    override fun register() {
        val channel = NotificationChannel(CHANNEL_ID, "General", NotificationManager.IMPORTANCE_DEFAULT)
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    companion object {
        const val CHANNEL_ID = "general"
    }
}
