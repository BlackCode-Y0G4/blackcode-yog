# Reframed.online Recovery Log

Source site: https://www.reframed.online/
Started: 2026-06-30 10:51 +08:00
Workspace: C:\Users\yoga\Documents\YOG\reframed-recovery

## Goal
Recover the currently deployed production website into a local, runnable project, preserving visual expression, interactions, routing, assets, and animation behavior as closely as practical.

## Constraints / Notes
- Original source code is unavailable due to disk loss.
- Production website is the source of truth.
- Chrome DevTools MCP is not currently available in this session; exact WebGL shader interception is marked as blocked unless that MCP is installed. Browser/Playwright and static resource analysis can still proceed.

## Running Findings

## 2026-06-30 11:xx +08:00 - First Recovery Pass

- Captured production HTML, JS/CSS chunks, font, noise texture, and runtime screenshots.
- Confirmed stack: Vite static build + React + GSAP/SplitText/Draggable-like production bundles.
- No runtime canvas/WebGL detected on inspected routes; shader extraction is not currently required.
- Extracted business data from `data-12f5e080.js` to `analysis/extracted-site-data.json`.
- Built local v0 in `rebuild/` using plain HTML/CSS/JS and the extracted data.
- Started local server at `http://127.0.0.1:8768/` and verified root/examples/about/monoform routes.
- Known gaps: exact SVG background, GSAP inertia, detail lightbox/enlarge, and pixel-level layout still need iteration.

