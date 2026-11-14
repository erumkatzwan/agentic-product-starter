package com.agentic.app.core.flags

import android.content.Context
import androidx.core.content.edit

/** Production store for local feature-flag toggles. */
class SharedPreferencesFlagOverrideStore(context: Context) : FlagOverrideStore {
    private val preferences = context.getSharedPreferences("feature_flags", Context.MODE_PRIVATE)

    override fun readAll(): Map<String, Boolean> = FeatureFlag.entries
        .filter { preferences.contains(it.key) }
        .associate { it.key to preferences.getBoolean(it.key, it.defaultValue) }

    override fun write(key: String, value: Boolean?) {
        preferences.edit {
            if (value == null) remove(key) else putBoolean(key, value)
        }
    }
}
