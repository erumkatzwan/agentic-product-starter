# Agentic Product Starter

Starter monorepo for building a product with AI agents. Copy it for each new product. The root holds the shared context (product, stories, decisions) and the shared agent skills. Each app or service has its own folder with its own agent rules and skills.

```
/
├── AGENTS.md              # Shared agent rules; points to each component's AGENTS.md
├── CLAUDE.md              # Loads AGENTS.md for Claude Code
├── .agents/skills/        # Shared skills: refinement, planning, task definition, code review
├── docs/
│   ├── product/           # Vision, roadmap, personas
│   ├── stories/           # Epics and user stories
│   └── decisions/         # Architecture decision records (ADRs)
├── apps/
│   ├── ios/               # Native iOS app (Swift, SwiftUI)
│   ├── android/           # Native Android app (Kotlin, Jetpack Compose)
│   ├── web-app/           # Signed-in web app for users
│   ├── website/           # One-page marketing website
│   └── back-office/       # Internal admin tool
└── backend/               # Cloud setup, APIs, infrastructure as code
```

Each component folder has its own `AGENTS.md` and `.agents/skills/`.

## How the skills fit together

- Work is refined and defined once, using the shared skills in `.agents/skills/` and the context in `docs/`.
- Component skills in `<component>/.agents/skills/` cover how to design and build that work for that platform.

## Environments

All components deploy to three environments: `dev`, `syst` and `prod`.
