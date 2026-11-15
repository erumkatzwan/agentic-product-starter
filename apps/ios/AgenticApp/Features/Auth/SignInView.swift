import SwiftUI

struct SignInView: View {
    @Environment(\.theme) private var theme
    @Environment(AppContainer.self) private var container
    @State private var viewModel: SignInViewModel

    init(viewModel: SignInViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: theme.spacing.l) {
                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(theme.colors.error)
                        .accessibilityIdentifier("signIn.error")
                }
                DSTextField(label: "Email", text: $viewModel.email, identifier: "signIn.email")
                DSTextField(label: "Password", text: $viewModel.password, isSecure: true, identifier: "signIn.password")
                Button(viewModel.isBusy ? "Signing in…" : "Sign in") {
                    Task { await viewModel.signIn() }
                }
                .buttonStyle(.ds(.primary))
                .disabled(viewModel.isBusy)
                .accessibilityIdentifier("signIn.submit")

                FeatureGate(.googleSignIn) {
                    Button("Sign in with Google") {
                        Task { await viewModel.signInWithGoogle() }
                    }
                    .buttonStyle(.ds(.secondary))
                    .accessibilityIdentifier("signIn.google")
                }

                FeatureGate(.signUp) {
                    NavigationLink("New here? Create an account") {
                        SignUpView(viewModel: SignUpViewModel(session: container.session))
                    }
                    .font(theme.typography.body)
                    .foregroundStyle(theme.colors.primary)
                    .accessibilityIdentifier("signIn.createAccount")
                }
            }
            .padding(theme.spacing.l)
        }
        .background(theme.colors.background)
        .navigationTitle("Sign in")
    }
}
