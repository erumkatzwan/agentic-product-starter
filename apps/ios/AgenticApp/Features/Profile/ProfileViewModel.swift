import Foundation
import Observation

@MainActor
@Observable
final class ProfileViewModel {
    enum Message: Equatable {
        case saved
        case error(String)
    }

    var displayName: String
    private(set) var message: Message?
    private(set) var fieldError: String?

    private let session: SessionStore

    init(session: SessionStore) {
        self.session = session
        displayName = session.session?.profile.displayName ?? ""
    }

    var email: String { session.session?.profile.email ?? "" }

    func save() async {
        message = nil
        fieldError = nil
        do {
            try await session.updateProfile(displayName: displayName)
            message = .saved
        } catch let error as APIError where error.fieldErrors["displayName"] != nil {
            fieldError = error.fieldErrors["displayName"]
        } catch {
            message = .error("Could not save. Please try again.")
        }
    }

    func signOut() async {
        await session.signOut()
    }

    func deleteAccount() async {
        do {
            try await session.deleteAccount()
        } catch {
            message = .error("Could not delete your account. Please try again.")
        }
    }
}
