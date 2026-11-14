# Back office

Internal admin tool for the team: users, content, feature flags and support.

**Status:** planned. This folder holds the agent setup; the project itself is added later.

## Planned setup

- Web app with role-based access
- Manages feature flags used by all apps

Like the iOS app, it will have:

- Dev, SYST and Prod environments
- A swappable design system or shared conventions
- A REST API layer and feature flags
- Unit, UI and end-to-end tests that must pass before merging

## Agents

- `AGENTS.md` – rules for agents working in this folder
- `.agents/skills/` – skills for this component
- Shared rules and skills live at the repository root.

See the [iOS app](../ios/README.md) for a working example.
