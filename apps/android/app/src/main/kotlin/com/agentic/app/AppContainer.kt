package com.agentic.app

import android.content.Context
import com.agentic.app.core.auth.InMemoryTokenStore
import com.agentic.app.core.auth.KeystoreTokenStore
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.flags.FeatureFlagService
import com.agentic.app.core.flags.InMemoryFlagOverrideStore
import com.agentic.app.core.flags.SharedPreferencesFlagOverrideStore
import com.agentic.app.core.monitoring.CrashReporter
import com.agentic.app.core.monitoring.CrashReporting
import com.agentic.app.core.network.ApiClient
import com.agentic.app.core.network.FixtureApiClient
import com.agentic.app.core.network.OkHttpApiClient
import com.agentic.app.core.services.AndroidPushNotificationService
import com.agentic.app.core.services.ItemsRepository
import com.agentic.app.core.services.PushNotificationService
import com.agentic.app.core.services.RemoteAuthService
import com.agentic.app.core.services.RemoteItemsRepository

/** Composition root: the one place where concrete implementations are chosen and wired together. */
class AppContainer(
    val apiClient: ApiClient,
    val featureFlags: FeatureFlagService,
    val session: SessionStore,
    val itemsRepository: ItemsRepository,
    val push: PushNotificationService,
    val environment: AppEnvironment,
    val crashReporter: CrashReporter
) {
    companion object {
        fun create(context: Context, options: LaunchOptions): AppContainer {
            val appContext = context.applicationContext
            val crashReporter = CrashReporting.create(appContext, AppEnvironment.sentryDsn, AppEnvironment.current, options.isUiTesting)
            crashReporter.start()
            val apiClient: ApiClient = if (options.isUiTesting) {
                FixtureApiClient { name -> appContext.assets.open("fixtures/$name.json").bufferedReader().use { it.readText() } }
            } else {
                OkHttpApiClient(baseUrl = AppEnvironment.apiBaseUrl)
            }
            // UI tests start every launch signed out with no saved flag toggles, like a fresh install.
            val tokenStore = if (options.isUiTesting) InMemoryTokenStore() else KeystoreTokenStore(appContext)
            val overrideStore = if (options.isUiTesting) InMemoryFlagOverrideStore() else SharedPreferencesFlagOverrideStore(appContext)
            return AppContainer(
                apiClient = apiClient,
                featureFlags = FeatureFlagService(apiClient, overrideStore, options.flagOverrides),
                session = SessionStore(RemoteAuthService(apiClient), tokenStore),
                itemsRepository = RemoteItemsRepository(apiClient),
                push = AndroidPushNotificationService(appContext),
                environment = AppEnvironment.current,
                crashReporter = crashReporter
            )
        }
    }
}
