package com.agentic.app.core.network

import java.io.IOException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/** The REST API layer. Features depend on this interface, never on OkHttp directly. */
interface ApiClient {
    suspend fun <T> send(endpoint: Endpoint<T>): T
}

sealed class ApiError(message: String) : Exception(message) {
    class Transport(detail: String) : ApiError(detail)

    class Server(val statusCode: Int) : ApiError("HTTP $statusCode")

    /** A problem response from the backend, with validation errors per field (`email`, `password`, `displayName`). */
    class Problem(val statusCode: Int, val text: String, val fields: Map<String, String>) : ApiError(text)

    class Decoding(detail: String) : ApiError(detail)

    class MissingFixture(val name: String) : ApiError("Missing fixture $name.json")

    /** A message that can be shown to the user. */
    val userMessage: String
        get() = when (this) {
            is Problem -> text
            is Transport -> "Cannot reach the server. Check your connection and try again."
            else -> "Something went wrong. Please try again."
        }

    val fieldErrors: Map<String, String> get() = (this as? Problem)?.fields.orEmpty()
}

/** Production client that talks to the backend for the current environment. */
class OkHttpApiClient(
    private val baseUrl: String,
    private val client: OkHttpClient = OkHttpClient(),
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO
) : ApiClient {
    override suspend fun <T> send(endpoint: Endpoint<T>): T = withContext(dispatcher) {
        val request = makeRequest(endpoint)
        val (code, text) = try {
            client.newCall(request).execute().use { response -> response.code to response.body.string() }
        } catch (error: IOException) {
            throw ApiError.Transport(error.message ?: "Network error")
        }
        if (code !in 200..299) throw errorFor(code, text)
        decode(endpoint, if (endpoint.hasResponseBody) text else EMPTY_OBJECT)
    }

    fun makeRequest(endpoint: Endpoint<*>): Request {
        val url = baseUrl.toHttpUrl().newBuilder()
            .addPathSegments(endpoint.path.trimStart('/'))
            .apply { endpoint.query.forEach { (name, value) -> addQueryParameter(name, value) } }
            .build()
        val body = when {
            endpoint.body != null -> endpoint.body.toRequestBody(JSON)
            endpoint.method == HttpMethod.GET || endpoint.method == HttpMethod.DELETE -> null
            else -> ByteArray(0).toRequestBody(null)
        }
        return Request.Builder()
            .url(url)
            .method(endpoint.method.name, body)
            .header("Accept", "application/json")
            .apply { endpoint.token?.let { header("Authorization", "Bearer $it") } }
            .build()
    }

    companion object {
        private val JSON = "application/json".toMediaType()
        private const val EMPTY_OBJECT = "{}"

        /** Turns an error response into [ApiError], reading ASP.NET Core problem details when present. */
        fun errorFor(statusCode: Int, body: String): ApiError {
            val problem = try {
                apiJson.decodeFromString(ProblemDetails.serializer(), body)
            } catch (error: SerializationException) {
                null
            } catch (error: IllegalArgumentException) {
                null
            }
            val message = problem?.detail ?: problem?.title ?: return ApiError.Server(statusCode)
            val fields = problem.errors.orEmpty().mapNotNull { (key, values) -> values.firstOrNull()?.let { key to it } }.toMap()
            return ApiError.Problem(statusCode, message, fields)
        }
    }
}

/** Decodes a response body, turning any JSON problem into [ApiError.Decoding]. */
internal fun <T> decode(endpoint: Endpoint<T>, text: String): T = try {
    apiJson.decodeFromString(endpoint.responseSerializer, text)
} catch (error: SerializationException) {
    throw ApiError.Decoding(error.message ?: "Invalid JSON")
} catch (error: IllegalArgumentException) {
    throw ApiError.Decoding(error.message ?: "Invalid JSON")
}

@Serializable
private data class ProblemDetails(
    val title: String? = null,
    val detail: String? = null,
    val errors: Map<String, List<String>>? = null
)
