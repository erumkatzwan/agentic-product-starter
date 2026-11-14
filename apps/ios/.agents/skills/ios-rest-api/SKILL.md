---
name: ios-rest-api
description: Use when adding or changing a backend REST call in the Consent iOS app, including fixtures for tests.
---

# iOS REST API layer

## Adding an endpoint

1. Define the response model as `Decodable` (and `Equatable` for tests).
2. Add it to `Endpoints` in `Core/Networking/Endpoint.swift`:
   `static let profile = Endpoint<Profile>(path: "/profile")`
3. Call it from a repository in `Core/Services`, never from a view or view model:
   `try await apiClient.send(Endpoints.profile)`
4. Add a fixture `Consent/Resources/Fixtures/profile.json` (path `/a/b` becomes `a-b.json`). UI and end-to-end tests use it.
5. Unit test the repository with `MockAPIClient`, and request building with `StubURLProtocol`.

## Rules

- Base URL comes from the environment (`Config/*.xcconfig`, `API_BASE_URL`). Never hard-code URLs.
- Errors surface as `APIError`; view models turn them into user-friendly messages.
- Auth headers, retries and token refresh belong in `URLSessionAPIClient`, not in features.
