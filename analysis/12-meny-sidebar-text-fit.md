# 12 Meny Sidebar Text Fit

## Request
Sidebar labels were too long for the Meny-style side panel. The fix should either shrink text or increase the panel width.

## Implementation
- Added `--meny-width` so the panel width and 3D content offset always stay in sync.
- Desktop panel increased from `260px` to `320px`.
- Desktop link size reduced from `24px` to a responsive `clamp(19px, 2vw, 21px)`.
- Header size reduced to `clamp(36px, 3.7vw, 40px)` and kept on one line.
- Mobile panel changed to `min(300px, 76vw)` with smaller responsive link text.
- Added `max-width: 100%`, `white-space: nowrap`, and tighter letter spacing for menu links.

## Verification
- `node --check rebuild/app.js`: passed.
- Local server `http://127.0.0.1:8768/`: returned 200.
- Playwright desktop audit at 1280x720:
  - sidebar width: 320px
  - content bounds: 30px to 290px
  - `Navigation`, `Home`, `Examples`, `About`, `SAVEE`, `Instagram`, and note all fit.
- Playwright mobile audit at 390x844:
  - sidebar width: 296.39px (`76vw`)
  - content bounds: 24px to 272.39px
  - all labels and note fit.

## Captures
- `captures/12-meny-sidebar-fit-desktop.png`
- `captures/12-meny-sidebar-fit-mobile.png`
