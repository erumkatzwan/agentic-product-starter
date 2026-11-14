package com.agentic.app.features.settings

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.core.flags.FeatureFlag
import com.agentic.app.core.flags.FeatureGate
import com.agentic.app.core.flags.LocalFeatureFlags
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSButton
import com.agentic.app.designsystem.DSButtonKind
import com.agentic.app.designsystem.DSCard
import com.agentic.app.designsystem.DSScreen

@Composable
fun SettingsScreen(viewModel: SettingsViewModel, onBack: () -> Unit, modifier: Modifier = Modifier) {
    val flags = LocalFeatureFlags.current
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        viewModel.onPermissionResult(granted)
    }
    DSScreen(title = "Settings", modifier = modifier, onBack = onBack) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(AppTheme.spacing.m),
            verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.l)
        ) {
            Section("App") {
                LabeledValue("Environment", viewModel.environmentName, tag = "settings.environment")
            }
            FeatureGate(FeatureFlag.PUSH_PROMPT) {
                Section("Notifications") {
                    LabeledValue("Status", viewModel.pushStatus, tag = "settings.pushStatus")
                    DSButton(
                        "Enable notifications",
                        onClick = { viewModel.permissionToRequest()?.let { permissionLauncher.launch(it) } },
                        kind = DSButtonKind.SECONDARY,
                        modifier = Modifier.testTag("settings.enablePush")
                    )
                }
            }
            if (viewModel.canEditFeatureFlags) {
                Section("Feature flags (this device)") {
                    FeatureFlag.entries.forEach { flag ->
                        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Text(flag.key, style = AppTheme.typography.body, modifier = Modifier.weight(1f))
                            Switch(
                                checked = flags.isEnabled(flag),
                                onCheckedChange = { flags.setOverride(flag, it) },
                                modifier = Modifier.testTag("settings.flag.${flag.key}")
                            )
                        }
                    }
                    DSButton("Reset to backend values", onClick = flags::resetOverrides, kind = DSButtonKind.SECONDARY)
                }
            }
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.s)) {
        Text(title, style = AppTheme.typography.caption, color = AppTheme.colors.textSecondary)
        DSCard { content() }
    }
}

@Composable
private fun LabeledValue(label: String, value: String, tag: String) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Text(label, style = AppTheme.typography.body, color = AppTheme.colors.textPrimary, modifier = Modifier.weight(1f))
        Text(value, style = AppTheme.typography.body, color = AppTheme.colors.textSecondary, modifier = Modifier.testTag(tag))
    }
}
