import Foundation
import Observation

@MainActor
@Observable
final class SignInViewModel {
    var email = ""
    var password = ""
    private(set) var errorMessage: String?
    private(set) var isBusy = false

    private let session: SessionStore

    init(session: SessionStore) {
        self.session = session
    }

    func signIn() async {
        isBusy = true
        errorMessage = nil
        defer { isBusy = false }
        do {
            try await session.signIn(email: email, password: password)
        } catch {
            errorMessage = Self.message(for: error)
        }
    }

    func signInWithGoogle() async {
        errorMessage = nil
        do {
            try await session.signInWithGoogle()
        } catch AuthError.notImplemented {
            errorMessage = "Google sign-in is not implemented yet."
        } catch {
            errorMessage = Self.message(for: error)
        }
    }

    static func message(for error: Error) -> String {
        (error as? APIError)?.userMessage ?? "Something went wrong. Please try again."
    }
}

@MainActor
@Observable
final class SignUpViewModel {
    var displayName = ""
    var email = ""
    var password = ""
    private(set) var fieldErrors: [String: String] = [:]
    private(set) var errorMessage: String?
    private(set) var isBusy = false

    private let session: SessionStore

    init(session: SessionStore) {
        self.session = session
    }

    func signUp() async {
        isBusy = true
        errorMessage = nil
        fieldErrors = [:]
        defer { isBusy = false }
        do {
            try await session.signUp(email: email, password: password, displayName: displayName)
        } catch let error as APIError where !error.fieldErrors.isEmpty {
            fieldErrors = error.fieldErrors
        } catch {
            errorMessage = SignInViewModel.message(for: error)
        }
    }
}
