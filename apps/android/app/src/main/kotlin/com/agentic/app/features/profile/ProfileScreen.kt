package com.agentic.app.features.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSButton
import com.agentic.app.designsystem.DSButtonKind
import com.agentic.app.designsystem.DSCard
import com.agentic.app.designsystem.DSScreen
import com.agentic.app.designsystem.DSTextField
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(viewModel: ProfileViewModel, onBack: () -> Unit, modifier: Modifier = Modifier) {
    val scope = rememberCoroutineScope()
    var confirmDelete by rememberSaveable { mutableStateOf(false) }
    DSScreen(title = "Profile", modifier = modifier, onBack = onBack) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(AppTheme.spacing.l),
            verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.l)
        ) {
            when (val message = viewModel.message) {
                ProfileViewModel.Message.Saved -> Text(
                    "Profile saved.",
                    color = AppTheme.colors.success,
                    style = AppTheme.typography.body,
                    modifier = Modifier.testTag("profile.message")
                )
                is ProfileViewModel.Message.Error -> Text(
                    message.text,
                    color = AppTheme.colors.error,
                    style = AppTheme.typography.body,
                    modifier = Modifier.testTag("profile.message")
                )
                null -> Unit
            }
            DSCard {
                Text(
                    viewModel.email,
                    style = AppTheme.typography.body,
                    color = AppTheme.colors.textSecondary,
                    modifier = Modifier.testTag("profile.email")
                )
            }
            DSTextField(
                "Name",
                viewModel.displayName,
                { viewModel.displayName = it },
                tag = "profile.name",
                error = viewModel.fieldError
            )
            DSButton("Save", onClick = { scope.launch { viewModel.save() } }, modifier = Modifier.testTag("profile.save"))
            DSButton(
                "Sign out",
                onClick = { scope.launch { viewModel.signOut() } },
                kind = DSButtonKind.SECONDARY,
                modifier = Modifier.testTag("profile.signOut")
            )
            TextButton(onClick = { confirmDelete = true }, modifier = Modifier.testTag("profile.delete")) {
                Text("Delete account", color = AppTheme.colors.error, style = AppTheme.typography.body)
            }
        }
    }
    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete your account?") },
            text = { Text("This cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirmDelete = false
                        scope.launch { viewModel.deleteAccount() }
                    },
                    modifier = Modifier.testTag("profile.confirmDelete")
                ) {
                    Text("Delete account", color = AppTheme.colors.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { confirmDelete = false }) { Text("Cancel") }
            }
        )
    }
}
