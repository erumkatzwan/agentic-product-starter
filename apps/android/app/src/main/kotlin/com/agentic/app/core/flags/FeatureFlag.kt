package com.agentic.app.core.flags

import kotlinx.serialization.Serializable

/**
 * Every toggleable feature, screen or component. [key] is the name used by the backend, the iOS app and the web app.
 * [defaultValue] is used when the backend has not answered (offline, first launch) or does not know the flag.
 */
enum class FeatureFlag(val key: String, val defaultValue: Boolean) {
    SETTINGS("settings", true),
    ITEM_DETAIL("item_detail", true),
    PROFILE("profile", true),
    SIGN_UP("sign_up", true),
    PUSH_PROMPT("push_prompt", false),
    GOOGLE_SIGN_IN("google_sign_in", false)
}

/** Response of `GET /api/feature-flags`, for example `{ "flags": { "settings": true } }`. */
@Serializable
data class RemoteFeatureFlags(val flags: Map<String, Boolean>)
