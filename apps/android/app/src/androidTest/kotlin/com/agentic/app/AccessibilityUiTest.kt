package com.agentic.app

import android.content.Intent
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.junit4.accessibility.enableAccessibilityChecks
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.tryPerformAccessibilityChecks
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Google's Accessibility Test Framework on every screen: missing labels, contrast, touch target size and
 * traversal order (WCAG 2.2 AA is the target, ADR-0011). Every click also runs the checks. Add new screens here.
 */
@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class AccessibilityUiTest {
    @get:Rule
    val compose = createEmptyComposeRule()

    private var scenario: ActivityScenario<MainActivity>? = null

    @Before
    fun setUp() {
        compose.enableAccessibilityChecks()
        val intent = Intent(ApplicationProvider.getApplicationContext(), MainActivity::class.java)
            .putExtra(LaunchOptions.UI_TESTING, true)
        scenario = ActivityScenario.launch(intent)
    }

    @After
    fun tearDown() {
        scenario?.close()
    }

    private fun showsThenCheck(tag: String) {
        compose.waitUntilAtLeastOneExists(hasTestTag(tag), timeoutMillis = 10_000)
        compose.onRoot().tryPerformAccessibilityChecks()
    }

    @Test
    fun signedOutScreensAreAccessible() {
        showsThenCheck("signIn.submit")
        compose.onNodeWithTag("signIn.createAccount").performClick()
        showsThenCheck("signUp.submit")
    }

    @Test
    fun signedInScreensAreAccessible() {
        showsThenCheck("signIn.submit")
        compose.onNodeWithTag("signIn.submit").performClick()
        showsThenCheck("home.item.1")

        compose.onNodeWithTag("home.item.1").performClick()
        showsThenCheck("detail.title")
        compose.onNodeWithTag("detail.backToHome").performClick()

        compose.onNodeWithTag("home.profileButton").performClick()
        showsThenCheck("profile.save")
        compose.onNodeWithTag("nav.back").performClick()

        compose.onNodeWithTag("home.settingsButton").performClick()
        showsThenCheck("settings.environment")
    }
}
