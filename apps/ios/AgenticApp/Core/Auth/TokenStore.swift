import Foundation
import Security

/// Keeps the access token between launches.
protocol TokenStore: AnyObject {
    func read() -> String?
    func save(_ token: String?)
}

/// Used by tests and UI tests: every launch starts signed out.
final class InMemoryTokenStore: TokenStore {
    private var token: String?

    init(token: String? = nil) {
        self.token = token
    }

    func read() -> String? { token }

    func save(_ token: String?) { self.token = token }
}

/// Production store: the token lives in the Keychain, never in UserDefaults.
final class KeychainTokenStore: TokenStore {
    private let service: String
    private let account = "accessToken"

    init(service: String = Bundle.main.bundleIdentifier ?? "AgenticApp") {
        self.service = service
    }

    func read() -> String? {
        var query = baseQuery
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess, let data = result as? Data else {
            return nil
        }
        return String(bytes: data, encoding: .utf8)
    }

    func save(_ token: String?) {
        SecItemDelete(baseQuery as CFDictionary)
        guard let token else { return }
        var attributes = baseQuery
        attributes[kSecValueData as String] = Data(token.utf8)
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(attributes as CFDictionary, nil)
    }

    private var baseQuery: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
    }
}
