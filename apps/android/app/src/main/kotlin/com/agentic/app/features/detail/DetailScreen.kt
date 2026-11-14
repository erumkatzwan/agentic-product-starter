package com.agentic.app.features.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.core.services.Item
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSButton
import com.agentic.app.designsystem.DSCard
import com.agentic.app.designsystem.DSScreen

@Composable
fun DetailScreen(item: Item, onBack: () -> Unit, onBackToHome: () -> Unit, modifier: Modifier = Modifier) {
    DSScreen(title = "Detail", modifier = modifier, onBack = onBack) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(AppTheme.spacing.m),
            verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.l)
        ) {
            DSCard {
                Text(
                    item.title,
                    style = AppTheme.typography.title,
                    color = AppTheme.colors.textPrimary,
                    modifier = Modifier.testTag("detail.title")
                )
                Text(item.subtitle, style = AppTheme.typography.body, color = AppTheme.colors.textSecondary)
            }
            DSButton("Back to home", onClick = onBackToHome, modifier = Modifier.testTag("detail.backToHome"))
        }
    }
}
