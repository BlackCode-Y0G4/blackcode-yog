# 11 Meny-Style 3D Sidebar Feasibility And Implementation

Date: 2026-06-30

## Feasibility
- Feasible in the current recovered static build.
- Reference: `https://lab.hakim.se/meny/` uses a `meny` menu element plus a `contents` element. The core effect is not a full 3D scene; it is a 3D transform/perspective interaction where the content panel rotates and moves away to reveal a side menu.
- Current rebuild already has a single app root and fixed visual layers, so the lowest-risk implementation is CSS 3D transform plus small vanilla JS controls. This avoids adding external dependencies or requiring network/CDN at runtime.
- A real Three.js version is possible, but would be heavier and unnecessary for this specific Meny-style panel because the visual contract is DOM 3D plane movement, not mesh rendering or shader work.

## Implementation
- Updated `rebuild/index.html`:
  - Added `<aside class="meny-sidebar">` with site links.
  - Added `.meny-edge` trigger button.
  - Wrapped `#app` inside `.meny-stage > .meny-contents` so the whole site can rotate as a single 3D panel.
- Updated `rebuild/styles.css`:
  - Added perspective stage and 3D content transform.
  - Added dark left sidebar styling in the Reframed visual language.
  - Added Meny-like open state: `translate3d(260px, 0, 0) rotateY(-22deg)` on desktop, `220px / -24deg` on mobile.
  - Added overlay dimming via `.meny-contents::after`.
  - Added responsive mobile sidebar width and text sizes.
- Updated `rebuild/app.js`:
  - Added `initSidebar()` and `setSidebar()`.
  - Left-edge hover opens the sidebar on pointer devices.
  - Click pins/toggles the sidebar.
  - `Escape` closes it.
  - `M` toggles it from keyboard.
  - Internal sidebar links use existing `routeTo()` so SPA-style navigation is preserved.
  - External links open normally.

## Verification
- `node --check rebuild/app.js` passed.
- Local server `http://127.0.0.1:8768/` returned HTTP 200.
- Desktop 1280x720 browser verification passed:
  - Sidebar DOM and edge trigger exist.
  - Click opens sidebar and sets `body.meny-open`.
  - ARIA state updates: `aria-expanded=true`, sidebar `aria-hidden=false`.
  - `.meny-contents` receives a `matrix3d(...)` transform while open.
  - Sidebar opacity becomes `1`.
  - `Escape` closes sidebar.
  - `M` key opens sidebar.
  - Clicking About inside sidebar routes to `/about/` and closes sidebar.
- Mobile 390x844 browser verification passed:
  - Sidebar opens.
  - Sidebar width is `220px`.
  - `.meny-contents` receives a `matrix3d(...)` transform.
  - All five sidebar links are present.

## Captures
- `captures/11-meny-sidebar-open.png`
- `captures/11-meny-sidebar-mobile.png`
