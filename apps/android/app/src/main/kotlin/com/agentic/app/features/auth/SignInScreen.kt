package com.agentic.app.features.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.core.flags.FeatureFlag
import com.agentic.app.core.flags.FeatureGate
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSButton
import com.agentic.app.designsystem.DSButtonKind
import com.agentic.app.designsystem.DSScreen
import com.agentic.app.designsystem.DSTextField
import kotlinx.coroutines.launch

@Composable
fun SignInScreen(viewModel: SignInViewModel, onCreateAccount: () -> Unit, modifier: Modifier = Modifier) {
    val scope = rememberCoroutineScope()
    DSScreen(title = "Sign in", modifier = modifier) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(AppTheme.spacing.l),
            verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.l)
        ) {
            viewModel.errorMessage?.let {
                Text(it, color = AppTheme.colors.error, style = AppTheme.typography.body, modifier = Modifier.testTag("signIn.error"))
            }
            DSTextField("Email", viewModel.email, { viewModel.email = it }, tag = "signIn.email")
            DSTextField("Password", viewModel.password, { viewModel.password = it }, tag = "signIn.password", isSecure = true)
            DSButton(
                text = if (viewModel.isBusy) "Signing in…" else "Sign in",
                onClick = { scope.launch { viewModel.signIn() } },
                enabled = !viewModel.isBusy,
                modifier = Modifier.testTag("signIn.submit")
            )
            FeatureGate(FeatureFlag.GOOGLE_SIGN_IN) {
                DSButton(
                    text = "Sign in with Google",
                    onClick = { scope.launch { viewModel.signInWithGoogle() } },
                    kind = DSButtonKind.SECONDARY,
                    modifier = Modifier.testTag("signIn.google")
                )
            }
            FeatureGate(FeatureFlag.SIGN_UP) {
                TextButton(onClick = onCreateAccount, modifier = Modifier.testTag("signIn.createAccount")) {
                    Text("New here? Create an account", style = AppTheme.typography.body, color = AppTheme.colors.primary)
                }
            }
        }
    }
}
