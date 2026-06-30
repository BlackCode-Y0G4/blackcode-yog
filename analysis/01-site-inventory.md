# Reframed Recovery - Site Inventory

Date: 2026-06-30
Source: https://www.reframed.online/

## Current Production Stack

- Deployment style: Vite multi-page/static build.
- Runtime framework: React bundled into `style-403a1701.js`.
- Animation libraries found in production chunks: GSAP 3.11.4, SplitText, Draggable/Inertia-like plugins.
- No Canvas or WebGL elements were found on the inspected routes. The main effects are DOM/SVG/CSS/GSAP based.
- Core assets:
  - Local font: `/assets/fonts/Unhuman.woff2?1`
  - Noise texture: `/assets/images/noise.png`
  - Project imagery: Cloudinary URLs under `res.cloudinary.com/bornfight-studio/.../reframed/...`

## Production HTML Entrypoints Captured

- `/` -> `source-snapshot/index.html`, entry chunk `home-d31be3d2.js`
- `/examples/` -> `source-snapshot/examples.html`, entry chunk `examples-ceb7e1fb.js`
- `/about/` -> `source-snapshot/about.html`, entry chunk `about-13ba2173.js`
- `/examples/monoform/` -> `source-snapshot/examples-monoform.html`
- `/examples/new-normal/` -> `source-snapshot/examples-new-normal.html`
- `/examples/nothing/` -> `source-snapshot/examples-nothing.html`
- `/examples/space-walker/` -> `source-snapshot/examples-space-walker.html`
- `/examples/digidays/` -> `source-snapshot/examples-digidays.html`

## Business Data Extracted

The production data object was extracted from `source-snapshot/assets/data-12f5e080.js` into:

- `analysis/extracted-site-data.json`
- `rebuild/site-data.js`

Data includes:

- 4 about slides with action transitions.
- 5 examples:
  - `monoform`
  - `new-normal`
  - `nothing`
  - `space-walker`
  - `digidays`
- Per example:
  - thumbnail image
  - social links
  - inspiration grid items
  - output grid items

## Runtime Screenshots Captured

Original production screenshots:

- `captures/home-1280x720-initial.png`
- `captures/examples-1280x720.png`
- `captures/about-1280x720.png`
- `captures/detail-monoform-1280x720.png`
- `captures/detail-new-normal-1280x720.png`
- `captures/detail-nothing-1280x720.png`
- `captures/detail-space-walker-1280x720.png`
- `captures/detail-digidays-1280x720.png`

Local rebuild screenshots:

- `captures/local-home-1280x720.png`
- `captures/local-examples-1280x720.png`
- `captures/local-about-1280x720.png`
- `captures/local-monoform-1280x720.png`

## Verification State

Local v0 runs at:

- `http://127.0.0.1:8768/`

Verified routes:

- `/`
- `/examples/`
- `/about/`
- `/examples/monoform/`

Verification output:

- `analysis/local-v0-verification.json`

No broken image loads were detected on the verified local routes.
