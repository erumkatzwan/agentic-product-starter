import SwiftUI
import UIKit

/// The design system. Screens only read tokens from `Theme`; change the values here
/// (or inject a different `Theme`) to restyle the whole app.
struct Theme {
    var colors: ColorTokens
    var typography: TypographyTokens
    var spacing: SpacingTokens
    var radius: RadiusTokens

    static let standard = Theme(
        colors: ColorTokens(
            primary: Color(light: UIColor(red: 0.18, green: 0.33, blue: 0.85, alpha: 1),
                           dark: UIColor(red: 0.45, green: 0.58, blue: 1.00, alpha: 1)),
            onPrimary: .white,
            background: Color(uiColor: .systemBackground),
            surface: Color(uiColor: .secondarySystemBackground),
            textPrimary: Color(uiColor: .label),
            textSecondary: Color(uiColor: .secondaryLabel),
            error: Color(uiColor: .systemRed)
        ),
        typography: TypographyTokens(
            title: .system(.largeTitle, design: .rounded).weight(.bold),
            headline: .system(.headline, design: .rounded),
            body: .system(.body),
            caption: .system(.caption)
        ),
        spacing: SpacingTokens(xs: 4, s: 8, m: 16, l: 24, xl: 32),
        radius: RadiusTokens(s: 8, m: 12, l: 20)
    )
}

struct ColorTokens {
    var primary: Color
    var onPrimary: Color
    var background: Color
    var surface: Color
    var textPrimary: Color
    var textSecondary: Color
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

extension Color {
    /// A color that adapts to light and dark mode.
    init(light: UIColor, dark: UIColor) {
        self.init(uiColor: UIColor { $0.userInterfaceStyle == .dark ? dark : light })
    }
}
