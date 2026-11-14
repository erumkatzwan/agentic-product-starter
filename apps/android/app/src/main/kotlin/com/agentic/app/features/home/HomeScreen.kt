package com.agentic.app.features.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.agentic.app.core.flags.FeatureFlag
import com.agentic.app.core.flags.FeatureGate
import com.agentic.app.core.flags.LocalFeatureFlags
import com.agentic.app.core.services.Item
import com.agentic.app.designsystem.AppTheme
import com.agentic.app.designsystem.DSErrorView
import com.agentic.app.designsystem.DSLoadingView
import com.agentic.app.designsystem.DSScreen
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onOpenItem: (Item) -> Unit,
    onOpenProfile: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scope = rememberCoroutineScope()
    LaunchedEffect(viewModel) {
        if (viewModel.state == HomeViewModel.State.Idle) viewModel.load()
    }
    DSScreen(
        title = "Home",
        modifier = modifier,
        actions = {
            FeatureGate(FeatureFlag.PROFILE) {
                IconButton(onClick = onOpenProfile, modifier = Modifier.testTag("home.profileButton")) {
                    Icon(Icons.Filled.AccountCircle, contentDescription = "Profile")
                }
            }
            FeatureGate(FeatureFlag.SETTINGS) {
                IconButton(onClick = onOpenSettings, modifier = Modifier.testTag("home.settingsButton")) {
                    Icon(Icons.Filled.Settings, contentDescription = "Settings")
                }
            }
        }
    ) { padding ->
        when (val state = viewModel.state) {
            HomeViewModel.State.Idle, HomeViewModel.State.Loading -> DSLoadingView(Modifier.padding(padding))
            is HomeViewModel.State.Failed -> DSErrorView(
                message = state.message,
                onRetry = { scope.launch { viewModel.load() } },
                modifier = Modifier.padding(padding)
            )
            is HomeViewModel.State.Loaded -> ItemList(state.items, onOpenItem, padding)
        }
    }
}

@Composable
private fun ItemList(items: List<Item>, onOpenItem: (Item) -> Unit, padding: PaddingValues) {
    val detailEnabled = LocalFeatureFlags.current.isEnabled(FeatureFlag.ITEM_DETAIL)
    LazyColumn(modifier = Modifier.fillMaxSize().testTag("home.list"), contentPadding = padding) {
        items(items, key = { it.id }) { item ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(enabled = detailEnabled) { onOpenItem(item) }
                    .testTag("home.item.${item.id}")
                    .padding(horizontal = AppTheme.spacing.m, vertical = AppTheme.spacing.m),
                verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.xs)
            ) {
                Text(item.title, style = AppTheme.typography.headline, color = AppTheme.colors.textPrimary)
                Text(item.subtitle, style = AppTheme.typography.caption, color = AppTheme.colors.textSecondary)
            }
            HorizontalDivider(color = AppTheme.colors.border)
        }
    }
}
