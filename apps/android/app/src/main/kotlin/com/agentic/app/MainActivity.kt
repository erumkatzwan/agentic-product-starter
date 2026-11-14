package com.agentic.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.agentic.app.core.navigation.Route
import com.agentic.app.core.navigation.Router
import com.agentic.app.designsystem.AppTheme

class MainActivity : ComponentActivity() {
    private val app: AppViewModel by viewModels {
        viewModelFactory {
            initializer { AppViewModel(AppContainer.create(applicationContext, launchOptions())) }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                RootScreen(app)
            }
        }
    }

    private fun launchOptions(): LaunchOptions {
        val extras = intent.extras ?: return LaunchOptions()
        val values = extras.keySet().associateWith { key -> extras.getString(key) ?: extras.getBoolean(key) }
        return LaunchOptions.from(values)
    }
}

/** Keeps the container and the navigation back stacks alive across rotation. */
class AppViewModel(val container: AppContainer) : ViewModel() {
    val signedOutRouter = Router(Route.SignIn)
    private var signedInRouter: Pair<String, Router>? = null

    /** A fresh back stack for every signed-in user, kept while they stay signed in. */
    fun signedInRouter(userId: String): Router {
        signedInRouter?.takeIf { it.first == userId }?.let { return it.second }
        return Router(Route.Home).also { signedInRouter = userId to it }
    }
}
