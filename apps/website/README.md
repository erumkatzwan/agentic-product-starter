# Website

Landing site and delivery dashboard for the Agentic Product Starter. Plain HTML, CSS and a little JavaScript, no build step. Part of the [Agentic Product Starter](../../README.md).

## Live site

https://erumkatzwan.github.io/agentic-product-starter/ — deployed to GitHub Pages by `.github/workflows/pages.yml` on every change to `main`.

## Delivery dashboard

`dora/` shows the four DORA metrics (live at https://erumkatzwan.github.io/agentic-product-starter/dora/). It reads `dora.json` from the `metrics` branch, which the **DORA metrics** workflow updates every Monday. Preview another file with `dora/?data=<url>`. See [ADR-0010](../../docs/adr/0010-dora-metrics.md) and the `dora-metrics` skill.

## Run it

Open `index.html` in a browser, or serve the folder with any static server.

## Commands

| Command | What it does |
|---|---|
| `npm run validate` | HTML validation |
| `npm run e2e` | Smoke tests (Playwright): sections, call to action, shared tokens, dashboard |

## Design

`tokens.css` is generated from `design/tokens.json`; `styles.css` uses only those tokens, so the site matches every app.
