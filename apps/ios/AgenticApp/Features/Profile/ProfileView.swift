import SwiftUI

struct ProfileView: View {
    @Environment(\.theme) private var theme
    @State private var viewModel: ProfileViewModel
    @State private var confirmDelete = false

    init(viewModel: ProfileViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: theme.spacing.l) {
                switch viewModel.message {
                case .saved:
                    Text("Profile saved.")
                        .foregroundStyle(theme.colors.success)
                        .accessibilityIdentifier("profile.message")
                case .error(let text):
                    Text(text)
                        .foregroundStyle(theme.colors.error)
                        .accessibilityIdentifier("profile.message")
                case nil:
                    EmptyView()
                }
                DSCard {
                    Text(viewModel.email)
                        .font(theme.typography.body)
                        .foregroundStyle(theme.colors.textSecondary)
                        .accessibilityIdentifier("profile.email")
                }
                DSTextField(label: "Name", text: $viewModel.displayName, error: viewModel.fieldError, identifier: "profile.name")
                Button("Save") {
                    Task { await viewModel.save() }
                }
                .buttonStyle(.ds(.primary))
                .accessibilityIdentifier("profile.save")

                Button("Sign out") {
                    Task { await viewModel.signOut() }
                }
                .buttonStyle(.ds(.secondary))
                .accessibilityIdentifier("profile.signOut")

                Button("Delete account", role: .destructive) {
                    confirmDelete = true
                }
                .foregroundStyle(theme.colors.error)
                .accessibilityIdentifier("profile.delete")
            }
            .padding(theme.spacing.l)
        }
        .background(theme.colors.background)
        .navigationTitle("Profile")
        .confirmationDialog("Delete your account? This cannot be undone.", isPresented: $confirmDelete, titleVisibility: .visible) {
            Button("Delete account", role: .destructive) {
                Task { await viewModel.deleteAccount() }
            }
        }
    }
}
