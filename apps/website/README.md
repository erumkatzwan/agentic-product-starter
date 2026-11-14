# Website

One-page landing site for the Agentic Product Starter. Plain HTML and CSS, no build step. Part of the [Agentic Product Starter](../../README.md).

## Run it

Open `index.html` in a browser, or serve the folder with any static server.

## Commands

| Command | What it does |
|---|---|
| `npm run validate` | HTML validation |
| `npm run e2e` | Smoke tests (Playwright): sections, call to action, shared tokens |

## Design

`tokens.css` is generated from `design/tokens.json`; `styles.css` uses only those tokens, so the site matches every app.
