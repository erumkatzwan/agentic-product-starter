package com.agentic.app.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.sp

/**
 * The design system. Screens only read tokens through [AppTheme]; change the values here
 * (or pass a different [Theme]) to restyle the whole app. Colours and spacing come from
 * [DesignTokens], generated from `design/tokens.json`: the same palette as every other app.
 */
@Immutable
data class Theme(
    val colors: ColorTokens,
    val typography: TypographyTokens,
    val spacing: SpacingTokens,
    val radius: RadiusTokens
) {
    companion object {
        val typography = TypographyTokens(
            title = TextStyle(fontSize = 28.sp, lineHeight = 34.sp, fontWeight = FontWeight.Bold),
            headline = TextStyle(fontSize = 17.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold),
            body = TextStyle(fontSize = 16.sp, lineHeight = 22.sp),
            caption = TextStyle(fontSize = 13.sp, lineHeight = 18.sp)
        )
        val spacing = SpacingTokens(
            xs = DesignTokens.Space.xs,
            s = DesignTokens.Space.s,
            m = DesignTokens.Space.m,
            l = DesignTokens.Space.l,
            xl = DesignTokens.Space.xl
        )
        val radius = RadiusTokens(s = DesignTokens.Radius.s, m = DesignTokens.Radius.m, l = DesignTokens.Radius.l)

        val light = Theme(
            colors = ColorTokens(
                primary = DesignTokens.Light.primary,
                onPrimary = DesignTokens.Light.onPrimary,
                background = DesignTokens.Light.background,
                surface = DesignTokens.Light.surface,
                border = DesignTokens.Light.border,
                textPrimary = DesignTokens.Light.textPrimary,
                textSecondary = DesignTokens.Light.textSecondary,
                success = DesignTokens.Light.success,
                error = DesignTokens.Light.error
            ),
            typography = typography,
            spacing = spacing,
            radius = radius
        )

        val dark = Theme(
            colors = ColorTokens(
                primary = DesignTokens.Dark.primary,
                onPrimary = DesignTokens.Dark.onPrimary,
                background = DesignTokens.Dark.background,
                surface = DesignTokens.Dark.surface,
                border = DesignTokens.Dark.border,
                textPrimary = DesignTokens.Dark.textPrimary,
                textSecondary = DesignTokens.Dark.textSecondary,
                success = DesignTokens.Dark.success,
                error = DesignTokens.Dark.error
            ),
            typography = typography,
            spacing = spacing,
            radius = radius
        )
    }
}

@Immutable
data class ColorTokens(
    val primary: Color,
    val onPrimary: Color,
    val background: Color,
    val surface: Color,
    val border: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val success: Color,
    val error: Color
)

@Immutable
data class TypographyTokens(val title: TextStyle, val headline: TextStyle, val body: TextStyle, val caption: TextStyle)

@Immutable
data class SpacingTokens(val xs: Dp, val s: Dp, val m: Dp, val l: Dp, val xl: Dp)

@Immutable
data class RadiusTokens(val s: Dp, val m: Dp, val l: Dp)

private val LocalTheme = staticCompositionLocalOf { Theme.light }

/** Read tokens in any composable: `AppTheme.colors.primary`, `AppTheme.spacing.m`. */
object AppTheme {
    val colors: ColorTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalTheme.current.colors

    val typography: TypographyTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalTheme.current.typography

    val spacing: SpacingTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalTheme.current.spacing

    val radius: RadiusTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalTheme.current.radius
}

/** Applies the theme, light or dark from the system setting, and maps it onto Material 3 components. */
@Composable
fun AppTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val theme = if (darkTheme) Theme.dark else Theme.light
    val colors = theme.colors
    val scheme = if (darkTheme) {
        darkColorScheme(
            primary = colors.primary,
            onPrimary = colors.onPrimary,
            background = colors.background,
            onBackground = colors.textPrimary,
            surface = colors.background,
            onSurface = colors.textPrimary,
            surfaceVariant = colors.surface,
            onSurfaceVariant = colors.textSecondary,
            outline = colors.border,
            error = colors.error
        )
    } else {
        lightColorScheme(
            primary = colors.primary,
            onPrimary = colors.onPrimary,
            background = colors.background,
            onBackground = colors.textPrimary,
            surface = colors.background,
            onSurface = colors.textPrimary,
            surfaceVariant = colors.surface,
            onSurfaceVariant = colors.textSecondary,
            outline = colors.border,
            error = colors.error
        )
    }
    val typography = Typography(
        headlineMedium = theme.typography.title,
        titleLarge = theme.typography.headline,
        titleMedium = theme.typography.headline,
        bodyLarge = theme.typography.body,
        bodyMedium = theme.typography.body,
        labelLarge = theme.typography.headline,
        bodySmall = theme.typography.caption
    )
    CompositionLocalProvider(LocalTheme provides theme) {
        MaterialTheme(colorScheme = scheme, typography = typography, content = content)
    }
}
