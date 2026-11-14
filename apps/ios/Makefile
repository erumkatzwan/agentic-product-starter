# Run `make help` to see all commands.
# Uses the newest installed iPhone simulator. Override with: make test-ui SIM_ID=<udid>
SIM_ID ?= $(shell xcrun simctl list devices available --json | python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; print(next(x["udid"] for r in sorted(d, reverse=True) for x in d[r] if x["name"].startswith("iPhone")))')
DESTINATION ?= platform=iOS Simulator,id=$(SIM_ID)
COVERAGE_MIN ?= 70
XCODEBUILD = xcodebuild -project AgenticApp.xcodeproj -scheme AgenticApp -destination '$(DESTINATION)'

.PHONY: help bootstrap generate open lint typos test-unit test-ui test e2e ci clean

help: ## Show this help
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

bootstrap: ## Install tools (XcodeGen, SwiftLint, typos, Maestro)
	brew install xcodegen swiftlint typos-cli
	curl -Ls "https://get.maestro.mobile.dev" | bash

generate: ## Generate AgenticApp.xcodeproj from project.yml
	xcodegen generate

open: generate ## Generate and open in Xcode
	open AgenticApp.xcodeproj

lint: ## SwiftLint, warnings fail
	swiftlint --strict

typos: ## Spell check code and docs
	typos

test-unit: generate ## Unit tests with coverage check
	rm -rf build/Unit.xcresult
	$(XCODEBUILD) -only-testing:AgenticAppTests -enableCodeCoverage YES -resultBundlePath build/Unit.xcresult test
	bash scripts/check-coverage.sh build/Unit.xcresult $(COVERAGE_MIN)

test-ui: generate ## UI tests on the simulator
	rm -rf build/UI.xcresult
	$(XCODEBUILD) -only-testing:AgenticAppUITests -resultBundlePath build/UI.xcresult test

test: test-unit test-ui ## Unit and UI tests

e2e: generate ## End-to-end tests with Maestro on a booted simulator
	$(XCODEBUILD) -configuration Syst -derivedDataPath build/DerivedData build
	xcrun simctl boot $(SIM_ID) || true
	xcrun simctl install $(SIM_ID) build/DerivedData/Build/Products/Syst-iphonesimulator/AgenticApp.app
	maestro test e2e/flows

ci: lint typos test e2e ## Everything the pull request checks run

clean: ## Remove generated project and build output
	rm -rf AgenticApp.xcodeproj build
