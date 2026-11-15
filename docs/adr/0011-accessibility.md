---
status: accepted
date: 2026-11-15
decision-makers: Erum Awan
---

# Meet WCAG 2.2 AA in every app, checked automatically

## Context and Problem Statement

Products built from the starter will be used by people with low vision, colour blindness, motor impairments, screen readers and large text settings. In many markets accessibility is also a legal requirement (for example the European Accessibility Act since June 2025). Agents write most of the UI code, so the standard has to be written down and enforced by checks, not left to review.

## Decision Drivers

* One standard for every platform that is widely used in law and procurement
* Problems are caught in the pull request that introduces them, by the same pipelines that already gate `main`
* Uses each platform's own tools, free and open source, no accounts
* Colour contrast is solved once, in the design tokens, for light and dark mode

## Considered Options

* WCAG 2.2 level AA, enforced by automated checks on every platform
* WCAG 2.2 level AAA
* Manual audits before each release only

## Decision Outcome

Chosen option: "WCAG 2.2 AA with automated checks", because it is the level laws and customers ask for, and automated checks catch the most common failures (contrast, missing labels, touch target size, missing names, heading and landmark structure) on every change. AAA is too strict for every screen (for example 7:1 contrast for all text). Manual audits stay useful for what tools cannot judge, but are not enough on their own.

| Where | Tool | When |
|---|---|---|
| Design tokens | Contrast check in `design/build.mjs`: text and brand colours 4.5:1, control borders 3:1, light and dark | Every pull request (**Design tokens in sync**) and the **Accessibility** workflow |
| Web app, back office | [axe-core](https://github.com/dequelabs/axe-core) on every screen in unit tests, and [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm) in end-to-end tests in light and dark mode | Every pull request |
| Website and DORA dashboard | @axe-core/playwright in a real browser, light and dark | Every pull request |
| iOS | Apple's `performAccessibilityAudit()` in `AccessibilityUITests` | Every pull request (**iOS UI tests**) |
| Android | Google's Accessibility Test Framework through Compose `enableAccessibilityChecks()` in `AccessibilityUiTest` | Every pull request (**Android UI tests**) |

Every check reads one switch, the repository variable `ACCESSIBILITY_CHECKS`. It is `on` by default (set by `node scripts/setup.mjs repo`); a product that cannot meet the standard yet sets it to `off`, and the checks skip instead of failing. **Accessibility checks** is a required check on `main`, and a skipped check does not block merging.

### Consequences

* Good, because a pull request that makes a screen inaccessible fails like any other bug.
* Good, because new screens inherit accessible colours, labels and sizes from the design system.
* Bad, because automated tools find roughly a third to a half of WCAG issues; screen reader flows, focus order and plain language still need a person with VoiceOver, TalkBack or a keyboard.
* Bad, because the checks only cover screens the tests visit; every new screen must be added to the accessibility tests.

### Confirmation

* The **Accessibility** workflow (badge in the README) runs the token contrast check, the axe unit tests and the website scan on every change and every Monday.
* The checks in the table above run inside each app's required pipeline.
* The `accessibility` skill tells agents what to check by hand before a release.

## More Information

Skill: `accessibility`. [Architecture overview](../architecture/README.md#810-accessibility). [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
