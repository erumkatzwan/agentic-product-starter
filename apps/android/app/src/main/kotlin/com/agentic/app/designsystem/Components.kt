package com.agentic.app.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign

/** Design-system screen: top bar with title, optional back arrow and actions, on the theme background. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DSScreen(
    title: String,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = modifier,
        containerColor = AppTheme.colors.background,
        topBar = {
            TopAppBar(
                title = { Text(title, style = AppTheme.typography.headline) },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack, modifier = Modifier.testTag("nav.back")) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                actions = actions,
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AppTheme.colors.background,
                    titleContentColor = AppTheme.colors.textPrimary,
                    navigationIconContentColor = AppTheme.colors.primary,
                    actionIconContentColor = AppTheme.colors.primary
                )
            )
        },
        content = content
    )
}

enum class DSButtonKind { PRIMARY, SECONDARY }

/** Design-system button. Use it instead of styling buttons by hand. */
@Composable
fun DSButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    kind: DSButtonKind = DSButtonKind.PRIMARY,
    enabled: Boolean = true
) {
    val primary = kind == DSButtonKind.PRIMARY
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        shape = RoundedCornerShape(AppTheme.radius.m),
        contentPadding = PaddingValues(vertical = AppTheme.spacing.m),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (primary) AppTheme.colors.primary else AppTheme.colors.surface,
            contentColor = if (primary) AppTheme.colors.onPrimary else AppTheme.colors.primary
        )
    ) {
        Text(text, style = AppTheme.typography.headline)
    }
}

/** Design-system card: a padded surface with rounded corners. */
@Composable
fun DSCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = AppTheme.colors.surface,
        shape = RoundedCornerShape(AppTheme.radius.l)
    ) {
        Column(
            modifier = Modifier.padding(AppTheme.spacing.m),
            verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.s),
            content = content
        )
    }
}

/** Design-system text input with a label and an optional error, matching the iOS `DSTextField` and web `TextField`. */
@Composable
fun DSTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    tag: String,
    modifier: Modifier = Modifier,
    isSecure: Boolean = false,
    error: String? = null
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.xs)) {
        Text(label, style = AppTheme.typography.caption, color = AppTheme.colors.textSecondary)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().testTag(tag),
            textStyle = AppTheme.typography.body,
            singleLine = true,
            isError = error != null,
            placeholder = { Text(label, style = AppTheme.typography.body) },
            visualTransformation = if (isSecure) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(
                keyboardType = if (isSecure) KeyboardType.Password else KeyboardType.Email,
                autoCorrectEnabled = false
            ),
            shape = RoundedCornerShape(AppTheme.radius.m),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = AppTheme.colors.border,
                focusedBorderColor = AppTheme.colors.primary,
                errorBorderColor = AppTheme.colors.error
            )
        )
        if (error != null) {
            Text(
                error,
                style = AppTheme.typography.caption,
                color = AppTheme.colors.error,
                modifier = Modifier.testTag("$tag.error")
            )
        }
    }
}

/** Design-system loading state, so every screen looks the same while waiting. */
@Composable
fun DSLoadingView(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize().testTag("ds.loading"), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = AppTheme.colors.primary)
    }
}

/** Design-system error state with a retry button. */
@Composable
fun DSErrorView(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(AppTheme.spacing.l).testTag("ds.error"),
        verticalArrangement = Arrangement.spacedBy(AppTheme.spacing.m, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(message, style = AppTheme.typography.body, color = AppTheme.colors.error, textAlign = TextAlign.Center)
        DSButton("Try again", onClick = onRetry, kind = DSButtonKind.SECONDARY)
    }
}
