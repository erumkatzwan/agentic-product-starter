package com.agentic.app

import com.agentic.app.core.network.ApiError
import com.agentic.app.core.network.Endpoints
import com.agentic.app.core.network.FixtureApiClient
import com.agentic.app.core.network.OkHttpApiClient
import com.agentic.app.core.services.RemoteAuthService
import com.agentic.app.core.services.RemoteItemsRepository
import java.io.File
import java.io.IOException
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okio.Buffer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class ApiClientTest {
    private val requests = mutableListOf<Request>()

    /** An OkHttp client that never touches the network: every call gets [code] and [body]. */
    private fun client(code: Int = 200, body: String = "{}", failWith: IOException? = null): OkHttpApiClient {
        val interceptor = Interceptor { chain ->
            requests += chain.request()
            failWith?.let { throw it }
            Response.Builder()
                .request(chain.request())
                .protocol(Protocol.HTTP_1_1)
                .code(code)
                .message("Test")
                .body(body.toResponseBody())
                .build()
        }
        return OkHttpApiClient(
            baseUrl = "https://api.test",
            client = OkHttpClient.Builder().addInterceptor(interceptor).build(),
            dispatcher = UnconfinedTestDispatcher()
        )
    }

    @Test
    fun sendsJsonWithTheTokenAndDecodesTheResponse() = runTest {
        val api = client(body = """{ "id": "1", "email": "a@b.c", "displayName": "New", "role": "Customer", "extra": 1 }""")

        val profile = api.send(Endpoints.updateProfile("abc", "New"))

        val request = requests.single()
        assertEquals("https://api.test/api/me", request.url.toString())
        assertEquals("PUT", request.method)
        assertEquals("Bearer abc", request.header("Authorization"))
        val body = Buffer().also { request.body?.writeTo(it) }.readUtf8()
        assertEquals("""{"displayName":"New"}""", body)
        assertEquals("New", profile.displayName)
    }

    @Test
    fun postWithoutBodyAndEmptyResponse() = runTest {
        val api = client(code = 204, body = "")

        api.send(Endpoints.signOut("abc"))

        assertEquals("POST", requests.single().method)
        assertEquals(0L, requests.single().body?.contentLength())
    }

    @Test
    fun readsProblemDetailsWithFieldErrors() = runTest {
        val api = client(
            code = 400,
            body = """{ "title": "One or more validation errors occurred.", "errors": { "email": ["Email is taken."] } }"""
        )

        val error = expectError { api.send(Endpoints.signUp("a@b.c", "x", "A")) }

        assertTrue(error is ApiError.Problem)
        assertEquals("One or more validation errors occurred.", error.userMessage)
        assertEquals(mapOf("email" to "Email is taken."), error.fieldErrors)
    }

    @Test
    fun mapsOtherFailures() = runTest {
        assertTrue(expectError { client(code = 500, body = "oops").send(Endpoints.items) } is ApiError.Server)
        assertTrue(expectError { client(body = "not json").send(Endpoints.items) } is ApiError.Decoding)
        val offline = expectError { client(failWith = IOException("offline")).send(Endpoints.items) }
        assertEquals("Cannot reach the server. Check your connection and try again.", offline.userMessage)
        assertEquals("Something went wrong. Please try again.", ApiError.Server(500).userMessage)
    }

    @Test
    fun addsQueryParameters() {
        val request = client().makeRequest(Endpoints.items.copy(query = mapOf("page" to "2")))

        assertEquals("https://api.test/api/items?page=2", request.url.toString())
        assertNull(request.header("Authorization"))
    }

    @Test
    fun fixtureNamesMatchTheIosApp() {
        assertEquals("feature-flags", FixtureApiClient.fixtureName("/api/feature-flags"))
        assertEquals("auth-signin", FixtureApiClient.fixtureName("/api/auth/signin"))
        assertEquals("me", FixtureApiClient.fixtureName("/api/me"))
    }

    @Test
    fun bundledFixturesDecode() = runTest {
        val fixtures = FixtureApiClient { name -> File("src/main/assets/fixtures/$name.json").readText() }

        val session = RemoteAuthService(fixtures).signIn("any", "any")
        val items = RemoteItemsRepository(fixtures).fetchItems()
        val flags = fixtures.send(Endpoints.featureFlags)
        fixtures.send(Endpoints.deleteAccount("x"))

        assertEquals("fixture-token", session.token)
        assertEquals("customer@example.com", session.profile.email)
        assertEquals(3, items.size)
        assertEquals(true, flags.flags["settings"])
    }

    @Test
    fun missingFixtureIsReported() = runTest {
        val fixtures = FixtureApiClient { throw IOException("not found") }

        val error = expectError { fixtures.send(Endpoints.items) }

        assertTrue(error is ApiError.MissingFixture)
    }

    @Test
    fun signOutIgnoresBackendErrors() = runTest {
        RemoteAuthService(FakeApiClient(failure = ApiError.Server(500))).signOut("abc")
    }

    private suspend fun expectError(block: suspend () -> Unit): ApiError {
        try {
            block()
        } catch (error: ApiError) {
            return error
        }
        fail("Expected an ApiError")
        throw AssertionError()
    }
}
