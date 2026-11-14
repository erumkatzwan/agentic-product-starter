package com.agentic.app.core.flags

/** Keeps front-end toggles (Settings → Feature flags) on this device. */
interface FlagOverrideStore {
    fun readAll(): Map<String, Boolean>

    /** `null` removes the override, so the flag follows the backend again. */
    fun write(key: String, value: Boolean?)
}

/** Used by tests and UI tests: every launch starts with no local toggles. */
class InMemoryFlagOverrideStore(initial: Map<String, Boolean> = emptyMap()) : FlagOverrideStore {
    private val values = initial.toMutableMap()

    override fun readAll(): Map<String, Boolean> = values.toMap()

    override fun write(key: String, value: Boolean?) {
        if (value == null) values.remove(key) else values[key] = value
    }
}
