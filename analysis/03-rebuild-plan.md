# Reframed Recovery - Rebuild Plan

## Completed In This Pass

- Captured production HTML for all known routes.
- Downloaded core local assets referenced by production CSS.
- Captured production runtime screenshots and DOM/runtime JSON.
- Extracted the production data model into editable JSON/JS.
- Built local no-dependency v0 in `rebuild/`.
- Added route `index.html` files so static hosting supports direct deep links.
- Verified local v0 with browser automation.

## Current Local Project

Entry:

- `rebuild/index.html`

Runtime:

- `rebuild/app.js`
- `rebuild/site-data.js`
- `rebuild/styles.css`

Local assets:

- `rebuild/Unhuman.woff2`
- `rebuild/noise.png`

Preview:

- `http://127.0.0.1:8768/`

## Next High-Impact Tasks

1. Replace approximate background geometry with SVG paths extracted from `Stars-55eb5a44.js`.
2. Port production navigation SVG icons and barcode exactly.
3. Implement GSAP-like draggable carousel inertia instead of native horizontal scroll.
4. Tune desktop positions against `captures/*-1280x720.png`.
5. Add image enlarge/lightbox overlay on detail pages.
6. Download and rewrite Cloudinary images to local paths for offline resilience.
7. Split `app.js` into maintainable modules once behavior is closer to production:
   - `data.js`
   - `router.js`
   - `components/nav.js`
   - `components/background.js`
   - `pages/home.js`
   - `pages/examples.js`
   - `pages/about.js`
   - `pages/detail.js`

## Known v0 Gaps

- The v0 rebuild is not yet pixel-matched; it is a functional visual reconstruction.
- It intentionally avoids React/GSAP dependencies for now to stay runnable without network package installation.
- Production exact source maps were not available in the deployed assets.
- The production bundles are preserved in `source-snapshot/assets/` for continued reverse engineering.

## Verification Method

For each iteration:

1. Serve `rebuild/` locally.
2. Capture local screenshots for `/`, `/examples/`, `/about/`, and one or more detail pages.
3. Compare against production screenshots in `captures/`.
4. Record deltas in this file or a new iteration note.

## Production Mirror

A compiled production-equivalent baseline was generated at:

- `production-mirror/`

This folder preserves the deployed Vite HTML/chunk structure as closely as possible from downloaded production assets. It is useful for:

- validating exact production behavior locally,
- serving as a fallback if the clean rebuild diverges,
- continuing reverse engineering from the deployed bundles.

The editable rebuild remains in:

- `rebuild/`

