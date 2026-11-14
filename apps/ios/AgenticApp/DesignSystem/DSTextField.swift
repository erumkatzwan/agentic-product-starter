import SwiftUI

/// Design-system text input with a label and an optional error, matching the web `TextField`.
struct DSTextField: View {
    @Environment(\.theme) private var theme
    let label: String
    @Binding var text: String
    var isSecure = false
    var error: String?
    var identifier: String

    var body: some View {
        VStack(alignment: .leading, spacing: theme.spacing.xs) {
            Text(label)
                .font(theme.typography.caption)
                .foregroundStyle(theme.colors.textSecondary)
            Group {
                if isSecure {
                    SecureField(label, text: $text)
                } else {
                    TextField(label, text: $text)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
            }
            .font(theme.typography.body)
            .padding(theme.spacing.m)
            .background(
                RoundedRectangle(cornerRadius: theme.radius.m)
                    .stroke(error == nil ? theme.colors.border : theme.colors.error)
            )
            .accessibilityIdentifier(identifier)
            if let error {
                Text(error)
                    .font(theme.typography.caption)
                    .foregroundStyle(theme.colors.error)
                    .accessibilityIdentifier("\(identifier).error")
            }
        }
    }
}
