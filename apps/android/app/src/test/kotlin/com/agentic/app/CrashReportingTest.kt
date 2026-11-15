package com.agentic.app

import com.agentic.app.core.monitoring.CrashReporting
import com.agentic.app.core.monitoring.NoOpCrashReporter
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CrashReportingTest {
    @Test
    fun isOffWithoutADsn() {
        assertFalse(CrashReporting.isEnabled(dsn = "", isUiTesting = false))
        assertFalse(CrashReporting.isEnabled(dsn = "   ", isUiTesting = false))
    }

    @Test
    fun isOffInUiAndEndToEndTests() {
        assertFalse(CrashReporting.isEnabled(dsn = "https://key@example.ingest.sentry.io/1", isUiTesting = true))
    }

    @Test
    fun isOnWithADsnOutsideTests() {
        assertTrue(CrashReporting.isEnabled(dsn = "https://key@example.ingest.sentry.io/1", isUiTesting = false))
    }

    @Test
    fun theNoOpReporterIgnoresEverything() {
        NoOpCrashReporter.start()
        NoOpCrashReporter.capture(IllegalStateException("ignored"))
    }
}
