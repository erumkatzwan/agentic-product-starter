package com.agentic.app.core.monitoring

import android.content.Context
import io.sentry.Sentry
import io.sentry.android.core.SentryAndroid

/** Sends crashes and captured errors to Sentry. No personal data: user IDs only, never emails or names. */
class SentryCrashReporter(
    private val context: Context,
    private val dsn: String,
    private val environment: String
) : CrashReporter {
    override fun start() {
        SentryAndroid.init(context) { options ->
            options.dsn = dsn
            options.environment = environment
            options.isSendDefaultPii = false
            options.tracesSampleRate = TRACES_SAMPLE_RATE
        }
    }

    override fun capture(error: Throwable) {
        Sentry.captureException(error)
    }

    private companion object {
        const val TRACES_SAMPLE_RATE = 0.2
    }
}
