package com.agentic.app.features.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSButton
import com.agentic.app.designsystem.DSScreen
import com.agentic.app.designsystem.DSTextField
import kotlinx.coroutines.launch

@Composable
fun SignUpScreen(viewModel: SignUpViewModel, onBack: () -> Unit, modifier: Modifier = Modifier) {
    val scope = rememberCoroutineScope()
    DSScreen(title = "Create an account", modifier = modifier, onBack = onBack) { padding ->
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
                Text(it, color = AppTheme.colors.error, style = AppTheme.typography.body, modifier = Modifier.testTag("signUp.error"))
            }
            DSTextField(
                "Name",
                viewModel.displayName,
                { viewModel.displayName = it },
                tag = "signUp.name",
                error = viewModel.fieldErrors["displayName"]
            )
            DSTextField("Email", viewModel.email, { viewModel.email = it }, tag = "signUp.email", error = viewModel.fieldErrors["email"])
            DSTextField(
                "Password",
                viewModel.password,
                { viewModel.password = it },
                tag = "signUp.password",
                isSecure = true,
                error = viewModel.fieldErrors["password"]
            )
            DSButton(
                text = if (viewModel.isBusy) "Creating account…" else "Create account",
                onClick = { scope.launch { viewModel.signUp() } },
                enabled = !viewModel.isBusy,
                modifier = Modifier.testTag("signUp.submit")
            )
        }
    }
}
