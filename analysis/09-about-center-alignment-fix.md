# 09 About Center Alignment Fix

Date: 2026-06-30

## Problem
- Clicking the main title or the `About` nav opened the About text panel off-center.
- The copy and its action buttons were visually anchored toward the lower-right instead of the viewport center.

## Fix
- Changed `.about-panel` from `right: 4vw; bottom: 18vh` positioning to centered fixed positioning:
  - `top: 50%`
  - `left: 50%`
  - `transform: translate(-50%, -50%)`
- Updated the `panel-in` animation so it preserves the centering transform during entrance motion.
- Updated the mobile override to keep the panel centered with a safe viewport width.

## Verification
- `node --check rebuild/app.js` passed.
- Local rebuild `/about/` returned HTTP 200.
- Headless Edge + Playwright verified desktop 1280x720:
  - slide 1 panel center delta: `dx=0`, `dy=0`
  - slide 2 panel center delta: `dx=0`, `dy=0`
  - action button row center aligned with panel center at `x=640`
- Mobile viewport 390x844 verified panel center delta: `dx=0`, `dy=0`.

## Captures
- `captures/09-about-centered-slide1.png`
- `captures/09-about-centered-slide2.png`
- `captures/09-about-centered-mobile.png`
