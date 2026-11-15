// Generated from design/tokens.json by design/build.mjs. Do not edit by hand.
import UIKit

enum DesignTokens {
    static let background = UIColor(light: 0xFFFFFF, dark: 0x0C0E13)
    static let surface = UIColor(light: 0xF7F8FA, dark: 0x14171F)
    static let border = UIColor(light: 0xDDE1E8, dark: 0x262B36)
    static let controlBorder = UIColor(light: 0x7D8698, dark: 0x5B6475)
    static let textPrimary = UIColor(light: 0x14171F, dark: 0xF7F8FA)
    static let textSecondary = UIColor(light: 0x5B6475, dark: 0x9AA3B2)
    static let primary = UIColor(light: 0x3F5BD9, dark: 0x7C93FF)
    static let primaryHover = UIColor(light: 0x3249B8, dark: 0x9DB0FF)
    static let onPrimary = UIColor(light: 0xFFFFFF, dark: 0x0C0E13)
    static let success = UIColor(light: 0x1A7F45, dark: 0x4CC487)
    static let warning = UIColor(light: 0x9A5C00, dark: 0xF2B84B)
    static let error = UIColor(light: 0xC93636, dark: 0xF27474)

    enum Space {
        static let xs: CGFloat = 4
        static let s: CGFloat = 8
        static let m: CGFloat = 16
        static let l: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    enum Radius {
        static let s: CGFloat = 8
        static let m: CGFloat = 12
        static let l: CGFloat = 20
    }
}

extension UIColor {
    convenience init(light: UInt32, dark: UInt32) {
        self.init { traits in
            let value = traits.userInterfaceStyle == .dark ? dark : light
            return UIColor(
                red: CGFloat((value >> 16) & 0xFF) / 255,
                green: CGFloat((value >> 8) & 0xFF) / 255,
                blue: CGFloat(value & 0xFF) / 255,
                alpha: 1
            )
        }
    }
}
