package com.agentic.app.core.monitoring

import android.content.Context
import com.agentic.app.AppEnvironment

/** Reports crashes and unexpected errors (ADR-0008). Off when no DSN is set for the flavor. */
interface CrashReporter {
    fun start()

    fun capture(error: Throwable)
}

/** Used when reporting is off: no DSN, or UI and end-to-end tests. */
object NoOpCrashReporter : CrashReporter {
    override fun start() = Unit

    override fun capture(error: Throwable) = Unit
}

object CrashReporting {
    /** Sentry only when a DSN is configured and the app is not under test. */
    fun isEnabled(dsn: String, isUiTesting: Boolean): Boolean = dsn.isNotBlank() && !isUiTesting

    fun create(context: Context, dsn: String, environment: AppEnvironment, isUiTesting: Boolean): CrashReporter =
        if (isEnabled(dsn, isUiTesting)) {
            SentryCrashReporter(context.applicationContext, dsn, environment.name.lowercase())
        } else {
            NoOpCrashReporter
        }
}
