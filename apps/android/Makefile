# Run `make help` to see all commands. UI and end-to-end tests need a running emulator or a connected device.
GRADLE = sh ./gradlew
COVERAGE_MIN ?= 70
APK = app/build/outputs/apk/syst/debug/app-syst-debug.apk
OUT ?= build/screenshots
DEMO = adb shell am broadcast -a com.android.systemui.demo -e command

.PHONY: help bootstrap build lint typos test-unit test-ui test e2e screenshots ci run clean

help: ## Show this help
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

bootstrap: ## Install tools (ktlint, typos, Maestro). Android Studio provides the SDK and an emulator.
	brew install ktlint typos-cli
	curl -Ls "https://get.maestro.mobile.dev" | bash

build: ## Build every environment: Dev and SYST debug, Prod release
	$(GRADLE) assembleDevDebug assembleSystDebug assembleProdRelease

lint: ## ktlint and Android Lint, warnings fail
	ktlint "app/src/**/*.kt" "*.kts" "app/*.kts"
	$(GRADLE) lintSystDebug

typos: ## Spell check code and docs
	typos

test-unit: ## Unit tests with coverage check
	$(GRADLE) testSystDebugUnitTest createSystDebugUnitTestCoverageReport
	python3 scripts/check-coverage.py $(COVERAGE_MIN)

test-ui: ## UI tests on the running emulator
	$(GRADLE) connectedSystDebugAndroidTest

test: test-unit test-ui ## Unit and UI tests

e2e: ## End-to-end tests with Maestro on the running emulator
	$(GRADLE) assembleSystDebug
	adb install -r $(APK)
	maestro test e2e/flows

screenshots: ## Screenshots of the main screens (SYST, fixture data) into OUT, on the running emulator
	$(GRADLE) assembleSystDebug
	adb install -r $(APK)
	adb shell settings put global sysui_demo_allowed 1
	$(DEMO) enter
	$(DEMO) clock -e hhmm 0941
	$(DEMO) battery -e level 100 -e plugged false
	$(DEMO) network -e wifi show -e level 4
	$(DEMO) notifications -e visible false
	mkdir -p $(OUT)
	maestro test -e OUT=$(abspath $(OUT)) e2e/screenshots
	$(DEMO) exit

ci: lint typos build test e2e ## Everything the pull request checks run

run: ## Install and start the Dev app on the running emulator
	$(GRADLE) installDevDebug
	adb shell am start -n com.agentic.app.dev/com.agentic.app.MainActivity

clean: ## Remove build output
	$(GRADLE) clean
