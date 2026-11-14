import SwiftUI

struct SignUpView: View {
    @Environment(\.theme) private var theme
    @State private var viewModel: SignUpViewModel

    init(viewModel: SignUpViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: theme.spacing.l) {
                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(theme.colors.error)
                        .accessibilityIdentifier("signUp.error")
                }
                DSTextField(
                    label: "Name",
                    text: $viewModel.displayName,
                    error: viewModel.fieldErrors["displayName"],
                    identifier: "signUp.name"
                )
                DSTextField(label: "Email", text: $viewModel.email, error: viewModel.fieldErrors["email"], identifier: "signUp.email")
                DSTextField(
                    label: "Password",
                    text: $viewModel.password,
                    isSecure: true,
                    error: viewModel.fieldErrors["password"],
                    identifier: "signUp.password"
                )
                Button(viewModel.isBusy ? "Creating account…" : "Create account") {
                    Task { await viewModel.signUp() }
                }
                .buttonStyle(.ds(.primary))
                .disabled(viewModel.isBusy)
                .accessibilityIdentifier("signUp.submit")
            }
            .padding(theme.spacing.l)
        }
        .background(theme.colors.background)
        .navigationTitle("Create an account")
    }
}
