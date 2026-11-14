package com.agentic.app

import com.agentic.app.core.auth.InMemoryTokenStore
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.network.ApiError
import com.agentic.app.core.services.Item
import com.agentic.app.features.auth.SignInViewModel
import com.agentic.app.features.auth.SignUpViewModel
import com.agentic.app.features.home.HomeViewModel
import com.agentic.app.features.profile.ProfileViewModel
import com.agentic.app.features.settings.SettingsViewModel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ViewModelTest {
    private val problem = ApiError.Problem(400, "Check the highlighted fields.", mapOf("displayName" to "Name is required."))

    @Test
    fun signInShowsTheBackendMessageOnFailure() = runTest {
        val auth = FakeAuthService(failure = ApiError.Problem(401, "Email or password is wrong.", emptyMap()))
        val viewModel = SignInViewModel(SessionStore(auth, InMemoryTokenStore()))

        viewModel.signIn()

        assertEquals("Email or password is wrong.", viewModel.errorMessage)
        assertFalse(viewModel.isBusy)
    }

    @Test
    fun signInSucceedsAndClearsThePassword() = runTest {
        val session = SessionStore(FakeAuthService(), InMemoryTokenStore())
        val viewModel = SignInViewModel(session).apply {
            email = "customer@example.com"
            password = "Customer123!"
        }

        viewModel.signIn()

        assertTrue(session.state is SessionStore.State.SignedIn)
        assertEquals("", viewModel.password)
        assertNull(viewModel.errorMessage)
    }

    @Test
    fun googleSignInExplainsItIsNotReadyYet() = runTest {
        val viewModel = SignInViewModel(SessionStore(FakeAuthService(), InMemoryTokenStore()))

        viewModel.signInWithGoogle()

        assertEquals("Google sign-in is not implemented yet.", viewModel.errorMessage)
    }

    @Test
    fun signUpShowsFieldErrorsOrAGeneralMessage() = runTest {
        val auth = FakeAuthService(failure = problem)
        val viewModel = SignUpViewModel(SessionStore(auth, InMemoryTokenStore()))

        viewModel.signUp()
        assertEquals("Name is required.", viewModel.fieldErrors["displayName"])
        assertNull(viewModel.errorMessage)

        auth.failure = ApiError.Transport("offline")
        viewModel.signUp()
        assertEquals("Cannot reach the server. Check your connection and try again.", viewModel.errorMessage)
        assertTrue(viewModel.fieldErrors.isEmpty())
    }

    @Test
    fun homeLoadsItemsOrShowsAnError() = runTest {
        val items = listOf(Item("1", "First", "One"))
        val loaded = HomeViewModel(FakeItemsRepository(Result.success(items)))
        loaded.load()
        assertEquals(HomeViewModel.State.Loaded(items), loaded.state)

        val failed = HomeViewModel(FakeItemsRepository(Result.failure(ApiError.Server(500))))
        failed.load()
        assertTrue(failed.state is HomeViewModel.State.Failed)
    }

    @Test
    fun profileSavesAndReportsErrors() = runTest {
        val auth = FakeAuthService()
        val session = SessionStore(auth, InMemoryTokenStore()).apply { signIn("customer@example.com", "x") }
        val viewModel = ProfileViewModel(session)
        assertEquals("Demo Customer", viewModel.displayName)
        assertEquals("customer@example.com", viewModel.email)

        viewModel.displayName = "Renamed"
        viewModel.save()
        assertEquals(ProfileViewModel.Message.Saved, viewModel.message)

        auth.failure = problem
        viewModel.save()
        assertEquals("Name is required.", viewModel.fieldError)

        auth.failure = ApiError.Server(500)
        viewModel.save()
        assertEquals(ProfileViewModel.Message.Error("Could not save. Please try again."), viewModel.message)

        viewModel.deleteAccount()
        assertEquals(ProfileViewModel.Message.Error("Could not delete your account. Please try again."), viewModel.message)

        auth.failure = null
        viewModel.signOut()
        assertEquals(SessionStore.State.SignedOut, session.state)
    }

    @Test
    fun settingsAsksForPermissionOnNewerAndroid() {
        val push = FakePush(permission = "android.permission.POST_NOTIFICATIONS")
        val viewModel = SettingsViewModel(push, AppEnvironment.SYST)
        assertEquals(SettingsViewModel.NOT_REQUESTED, viewModel.pushStatus)
        assertEquals("SYST", viewModel.environmentName)
        assertTrue(viewModel.canEditFeatureFlags)

        assertEquals("android.permission.POST_NOTIFICATIONS", viewModel.permissionToRequest())
        viewModel.onPermissionResult(false)
        assertEquals(SettingsViewModel.NOT_ALLOWED, viewModel.pushStatus)

        viewModel.onPermissionResult(true)
        assertEquals(SettingsViewModel.ENABLED, viewModel.pushStatus)
        assertTrue(push.registered)
    }

    @Test
    fun settingsRegistersDirectlyOnOlderAndroid() {
        val push = FakePush(permission = null, enabled = true)
        val viewModel = SettingsViewModel(push, AppEnvironment.PROD)
        assertEquals(SettingsViewModel.ENABLED, viewModel.pushStatus)
        assertFalse(viewModel.canEditFeatureFlags)

        assertNull(viewModel.permissionToRequest())
        assertTrue(push.registered)
    }
}
