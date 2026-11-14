@testable import Consent
import XCTest

@MainActor
final class RouterTests: XCTestCase {
    func testPushPopAndPopToRoot() {
        let router = Router()

        router.push(.itemDetail(.sample))
        router.push(.settings)
        XCTAssertEqual(router.depth, 2)

        router.pop()
        XCTAssertEqual(router.depth, 1)

        router.popToRoot()
        XCTAssertEqual(router.depth, 0)
    }

    func testPopOnEmptyStackDoesNothing() {
        let router = Router()

        router.pop()

        XCTAssertEqual(router.depth, 0)
    }
}
