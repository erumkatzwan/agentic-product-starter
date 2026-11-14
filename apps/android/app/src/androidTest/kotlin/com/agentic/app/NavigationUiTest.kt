package com.agentic.app

import android.content.Intent
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * UI tests run the real app on the emulator with fixture data (`uiTesting=true`), no backend needed.
 * Each launch starts signed out, like a fresh install. Same scenarios as the iOS `NavigationUITests`.
 */
@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class NavigationUiTest {
    @get:Rule
    val compose = createEmptyComposeRule()

    private var scenario: ActivityScenario<MainActivity>? = null

    private fun launch(vararg extras: Pair<String, Boolean>) {
        val intent = Intent(ApplicationProvider.getApplicationContext(), MainActivity::class.java)
            .putExtra(LaunchOptions.UI_TESTING, true)
        extras.forEach { (key, value) -> intent.putExtra(key, value) }
        scenario = ActivityScenario.launch(intent)
    }

    @After
    fun tearDown() {
        scenario?.close()
    }

    private fun waitFor(tag: String) {
        compose.waitUntilAtLeastOneExists(hasTestTag(tag), timeoutMillis = 10_000)
    }

    private fun signIn() {
        waitFor("signIn.submit")
        compose.onNodeWithTag("signIn.submit").performClick()
        waitFor("home.item.1")
    }

    @Test
    fun signInShowsHomeWithFixtureItems() {
        launch()
        signIn()

        compose.onNodeWithTag("home.item.3").assertIsDisplayed()
    }

    @Test
    fun navigatesToDetailAndBackWithTheTopBar() {
        launch()
        signIn()

        compose.onNodeWithTag("home.item.1").performClick()
        waitFor("detail.title")

        compose.onNodeWithTag("nav.back").performClick()
        waitFor("home.item.1")
    }

    @Test
    fun systemBackReturnsToHome() {
        launch()
        signIn()
        compose.onNodeWithTag("home.item.2").performClick()
        waitFor("detail.title")

        Espresso.pressBack()

        waitFor("home.item.2")
    }

    @Test
    fun backToHomeButtonPopsToRoot() {
        launch()
        signIn()
        compose.onNodeWithTag("home.item.2").performClick()
        waitFor("detail.backToHome")

        compose.onNodeWithTag("detail.backToHome").performClick()

        waitFor("home.item.2")
    }

    @Test
    fun opensSettingsWhenFlagIsOn() {
        launch()
        signIn()

        compose.onNodeWithTag("home.settingsButton").performClick()

        waitFor("settings.environment")
        compose.onNodeWithText("SYST").assertIsDisplayed()
    }

    @Test
    fun hidesSettingsWhenFlagIsOff() {
        launch("FF_settings" to false)
        signIn()

        compose.onNodeWithTag("home.settingsButton").assertDoesNotExist()
    }

    @Test
    fun profileSaveAndSignOut() {
        launch()
        signIn()

        compose.onNodeWithTag("home.profileButton").performClick()
        waitFor("profile.save")
        compose.onNodeWithTag("profile.save").performClick()
        waitFor("profile.message")

        compose.onNodeWithTag("profile.signOut").performClick()
        waitFor("signIn.submit")
    }

    @Test
    fun signUpOpensTheApp() {
        launch()
        waitFor("signIn.createAccount")

        compose.onNodeWithTag("signIn.createAccount").performClick()
        waitFor("signUp.submit")
        compose.onNodeWithTag("signUp.submit").performClick()

        waitFor("home.item.1")
    }

    @Test
    fun googleSignInShowsPlaceholderMessage() {
        launch()
        waitFor("signIn.google")

        compose.onNodeWithTag("signIn.google").performClick()

        waitFor("signIn.error")
    }
}
