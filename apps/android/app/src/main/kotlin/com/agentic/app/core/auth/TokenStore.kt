package com.agentic.app.core.auth

/** Keeps the access token between launches. */
interface TokenStore {
    fun read(): String?

    fun save(token: String?)
}

/** Used by tests and UI tests: every launch starts signed out. */
class InMemoryTokenStore(private var token: String? = null) : TokenStore {
    override fun read(): String? = token

    override fun save(token: String?) {
        this.token = token
    }
}
