package com.agentic.app

import com.agentic.app.core.auth.InMemoryTokenStore
import com.agentic.app.core.auth.SessionStore
import com.agentic.app.core.network.ApiError
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionStoreTest {
    @Test
    fun startsSignedOutWithoutAToken() {
        val store = SessionStore(FakeAuthService(), InMemoryTokenStore())

        assertEquals(SessionStore.State.SignedOut, store.state)
    }

    @Test
    fun signInSavesTheTokenAndSignOutClearsIt() = runTest {
        val tokens = InMemoryTokenStore()
        val auth = FakeAuthService()
        val store = SessionStore(auth, tokens)

        store.signIn("customer@example.com", "Customer123!")
        assertEquals("token", tokens.read())
        assertEquals("customer@example.com", store.profile?.email)

        store.signOut()
        assertEquals(SessionStore.State.SignedOut, store.state)
        assertNull(tokens.read())
        assertEquals("token", auth.signedOutToken)
    }

    @Test
    fun restoresASavedSession() = runTest {
        val store = SessionStore(FakeAuthService(), InMemoryTokenStore("saved"))
        assertEquals(SessionStore.State.Restoring, store.state)

        store.restore()

        assertEquals("saved", store.session?.token)
    }

    @Test
    fun dropsATokenTheBackendNoLongerAccepts() = runTest {
        val tokens = InMemoryTokenStore("expired")
        val store = SessionStore(FakeAuthService(failure = ApiError.Server(401)), tokens)

        store.restore()

        assertEquals(SessionStore.State.SignedOut, store.state)
        assertNull(tokens.read())
    }

    @Test
    fun signUpUpdateProfileAndDeleteAccount() = runTest {
        val auth = FakeAuthService()
        val store = SessionStore(auth, InMemoryTokenStore())

        store.signUp("new@example.com", "Password123!", "New Person")
        assertEquals("New Person", store.profile?.displayName)

        store.updateProfile("Renamed")
        assertEquals("Renamed", store.profile?.displayName)

        store.deleteAccount()
        assertEquals("token", auth.deletedToken)
        assertTrue(store.state is SessionStore.State.SignedOut)
    }
}
