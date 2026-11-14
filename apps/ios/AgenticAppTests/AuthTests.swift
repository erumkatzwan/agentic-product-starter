@testable import AgenticApp
import XCTest

@MainActor
final class SessionStoreTests: XCTestCase {
    private let auth = StubAuthService()

    func testStartsSignedOutWithoutToken() {
        let store = SessionStore(authService: auth, tokenStore: InMemoryTokenStore())

        XCTAssertEqual(store.state, .signedOut)
        XCTAssertNil(store.session)
    }

    func testSignInStoresTokenAndSession() async throws {
        let tokens = InMemoryTokenStore()
        let store = SessionStore(authService: auth, tokenStore: tokens)

        try await store.signIn(email: "ada@example.com", password: "Password1!")

        XCTAssertEqual(store.session?.profile, .sample)
        XCTAssertEqual(tokens.read(), "token")
    }

    func testSignUpStartsSession() async throws {
        let store = SessionStore(authService: auth, tokenStore: InMemoryTokenStore())

        try await store.signUp(email: "ada@example.com", password: "Password1!", displayName: "Ada")

        XCTAssertNotNil(store.session)
    }

    func testRestoresStoredToken() async {
        let store = SessionStore(authService: auth, tokenStore: InMemoryTokenStore(token: "token"))
        XCTAssertEqual(store.state, .restoring)

        await store.restore()

        XCTAssertEqual(store.session?.token, "token")
    }

    func testDropsTokenTheBackendRejects() async {
        auth.restoreResult = .failure(APIError.server(statusCode: 401))
        let tokens = InMemoryTokenStore(token: "expired")
        let store = SessionStore(authService: auth, tokenStore: tokens)

        await store.restore()

        XCTAssertEqual(store.state, .signedOut)
        XCTAssertNil(tokens.read())
    }

    func testSignOutClearsTokenAndTellsBackend() async throws {
        let tokens = InMemoryTokenStore()
        let store = SessionStore(authService: auth, tokenStore: tokens)
        try await store.signIn(email: "a", password: "b")

        await store.signOut()

        XCTAssertEqual(store.state, .signedOut)
        XCTAssertNil(tokens.read())
        XCTAssertEqual(auth.signedOutTokens, ["token"])
    }

    func testUpdateProfileReplacesProfile() async throws {
        let store = SessionStore(authService: auth, tokenStore: InMemoryTokenStore())
        try await store.signIn(email: "a", password: "b")

        try await store.updateProfile(displayName: "Ada Lovelace")

        XCTAssertEqual(store.session?.profile.displayName, "Ada Lovelace")
    }

    func testDeleteAccountSignsOut() async throws {
        let store = SessionStore(authService: auth, tokenStore: InMemoryTokenStore())
        try await store.signIn(email: "a", password: "b")

        try await store.deleteAccount()

        XCTAssertEqual(store.state, .signedOut)
    }
}

@MainActor
final class AuthViewModelTests: XCTestCase {
    private let auth = StubAuthService()

    private func makeSession() -> SessionStore {
        SessionStore(authService: auth, tokenStore: InMemoryTokenStore())
    }

    func testSignInSuccess() async {
        let session = makeSession()
        let viewModel = SignInViewModel(session: session)

        await viewModel.signIn()

        XCTAssertNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.isBusy)
        XCTAssertNotNil(session.session)
    }

    func testSignInShowsBackendMessage() async {
        auth.signInResult = .failure(APIError.problem(statusCode: 401, message: "Email or password is incorrect.", fieldErrors: [:]))
        let viewModel = SignInViewModel(session: makeSession())

        await viewModel.signIn()

        XCTAssertEqual(viewModel.errorMessage, "Email or password is incorrect.")
    }

    func testSignInShowsGenericMessageForUnknownErrors() async {
        auth.signInResult = .failure(URLError(.badURL))
        let viewModel = SignInViewModel(session: makeSession())

        await viewModel.signIn()

        XCTAssertEqual(viewModel.errorMessage, "Something went wrong. Please try again.")
    }

    func testGoogleSignInIsNotImplementedYet() async {
        let viewModel = SignInViewModel(session: makeSession())

        await viewModel.signInWithGoogle()

        XCTAssertEqual(viewModel.errorMessage, "Google sign-in is not implemented yet.")
    }

    func testSignUpShowsFieldErrors() async {
        auth.signUpResult = .failure(APIError.invalid(["email": "Enter a valid email address."]))
        let viewModel = SignUpViewModel(session: makeSession())

        await viewModel.signUp()

        XCTAssertEqual(viewModel.fieldErrors["email"], "Enter a valid email address.")
        XCTAssertNil(viewModel.errorMessage)
    }

    func testSignUpShowsConflictMessage() async {
        let conflict = APIError.problem(statusCode: 409, message: "An account with this email already exists.", fieldErrors: [:])
        auth.signUpResult = .failure(conflict)
        let viewModel = SignUpViewModel(session: makeSession())

        await viewModel.signUp()

        XCTAssertEqual(viewModel.errorMessage, "An account with this email already exists.")
    }

    func testProfileSaveAndErrors() async throws {
        let session = makeSession()
        try await session.signIn(email: "a", password: "b")
        let viewModel = ProfileViewModel(session: session)
        XCTAssertEqual(viewModel.displayName, "Ada")
        XCTAssertEqual(viewModel.email, "ada@example.com")

        viewModel.displayName = "Ada Lovelace"
        await viewModel.save()
        XCTAssertEqual(viewModel.message, .saved)

        auth.updateResult = .failure(APIError.invalid(["displayName": "Enter your name."]))
        await viewModel.save()
        XCTAssertEqual(viewModel.fieldError, "Enter your name.")

        auth.updateResult = .failure(URLError(.notConnectedToInternet))
        await viewModel.save()
        XCTAssertEqual(viewModel.message, .error("Could not save. Please try again."))
    }

    func testProfileSignOutAndDelete() async throws {
        let session = makeSession()
        try await session.signIn(email: "a", password: "b")
        let viewModel = ProfileViewModel(session: session)

        auth.deleteError = APIError.server(statusCode: 500)
        await viewModel.deleteAccount()
        XCTAssertEqual(viewModel.message, .error("Could not delete your account. Please try again."))

        await viewModel.signOut()
        XCTAssertEqual(session.state, .signedOut)
    }
}

final class RemoteAuthServiceTests: XCTestCase {
    func testSignInFetchesProfile() async throws {
        let api = MockAPIClient()
        api.responses["/api/auth/signin"] = AccessToken(accessToken: "t", expiresIn: 3600)
        api.responses["/api/me"] = UserProfile.sample
        let service = RemoteAuthService(apiClient: api)

        let session = try await service.signIn(email: "a", password: "b")

        XCTAssertEqual(session, UserSession(token: "t", profile: .sample))
        XCTAssertEqual(api.requestedPaths, ["/api/auth/signin", "/api/me"])
    }

    func testSignUpUpdateDeleteAndSignOut() async throws {
        let api = MockAPIClient()
        api.responses["/api/auth/signup"] = AccessToken(accessToken: "t", expiresIn: 3600)
        api.responses["/api/me"] = UserProfile.sample
        api.responses["/api/auth/signout"] = EmptyResponse()
        let service = RemoteAuthService(apiClient: api)

        _ = try await service.signUp(email: "a", password: "b", displayName: "Ada")
        _ = try await service.updateProfile(token: "t", displayName: "Ada")
        api.responses["/api/me"] = EmptyResponse()
        try await service.deleteAccount(token: "t")
        await service.signOut(token: "t")

        XCTAssertEqual(api.requestedPaths, ["/api/auth/signup", "/api/me", "/api/me", "/api/me", "/api/auth/signout"])
    }

    func testGoogleSignInIsASkeleton() async {
        do {
            _ = try await RemoteAuthService(apiClient: MockAPIClient()).signInWithGoogle()
            XCTFail("Expected an error")
        } catch {
            XCTAssertEqual(error as? AuthError, .notImplemented)
        }
    }
}

final class TokenStoreTests: XCTestCase {
    func testKeychainStoreSavesReadsAndClears() {
        let store = KeychainTokenStore(service: "AgenticAppTests-\(UUID().uuidString)")
        XCTAssertNil(store.read())

        store.save("secret")
        XCTAssertEqual(store.read(), "secret")

        store.save("rotated")
        XCTAssertEqual(store.read(), "rotated")

        store.save(nil)
        XCTAssertNil(store.read())
    }
}
