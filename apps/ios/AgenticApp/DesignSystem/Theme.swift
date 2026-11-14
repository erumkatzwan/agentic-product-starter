import SwiftUI

/// The design system. Screens only read tokens from `Theme`; change the values here
/// (or inject a different `Theme`) to restyle the whole app.
struct Theme {
    var colors: ColorTokens
    var typography: TypographyTokens
    var spacing: SpacingTokens
    var radius: RadiusTokens

    /// Built from `DesignTokens`, which is generated from `design/tokens.json`: the same palette as every other app.
    static let standard = Theme(
        colors: ColorTokens(
            primary: Color(uiColor: DesignTokens.primary),
            onPrimary: Color(uiColor: DesignTokens.onPrimary),
            background: Color(uiColor: DesignTokens.background),
            surface: Color(uiColor: DesignTokens.surface),
            border: Color(uiColor: DesignTokens.border),
            textPrimary: Color(uiColor: DesignTokens.textPrimary),
            textSecondary: Color(uiColor: DesignTokens.textSecondary),
            success: Color(uiColor: DesignTokens.success),
            error: Color(uiColor: DesignTokens.error)
        ),
        typography: TypographyTokens(
            title: .system(.largeTitle, design: .default).weight(.bold),
            headline: .system(.headline),
            body: .system(.body),
            caption: .system(.caption)
        ),
        spacing: SpacingTokens(
            xs: DesignTokens.Space.xs,
            s: DesignTokens.Space.s,
            m: DesignTokens.Space.m,
            l: DesignTokens.Space.l,
            xl: DesignTokens.Space.xl
        ),
        radius: RadiusTokens(s: DesignTokens.Radius.s, m: DesignTokens.Radius.m, l: DesignTokens.Radius.l)
    )
}

struct ColorTokens {
    var primary: Color
    var onPrimary: Color
    var background: Color
    var surface: Color
    var border: Color
    var textPrimary: Color
    var textSecondary: Color
    var success: Color
    var error: Color
}

struct TypographyTokens {
    var title: Font
    var headline: Font
    var body: Font
    var caption: Font
}

struct SpacingTokens {
    var xs: CGFloat
    var s: CGFloat
    var m: CGFloat
    var l: CGFloat
    var xl: CGFloat
}

struct RadiusTokens {
    var s: CGFloat
    var m: CGFloat
    var l: CGFloat
}

private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.standard
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}
