# 16 Scroll Peek Cue

## Request
- Match the original example page behavior where, after the title font/random blur animation settles, the first displayed image pops slightly up from the bottom of the page as a visual hint that the user should scroll down.

## Implementation
- Added `scrollPeek(img)` in `rebuild/app.js` to render a fixed, non-interactive duplicate of the first work image.
- The peek layer is appended after the title/container and before social links.
- After 2450ms, if the user has not scrolled, the detail view receives:
  - `title-settled`
  - `is-scroll-peek-ready`
- Collection scroll update now toggles `has-scrolled` when `scrollY > 12`; this hides the peek immediately once the user starts scrolling.
- Added CSS:
  - `.scroll-peek`
  - `.scroll-peek-inner`
  - `@keyframes scroll-peek-cue`
  - compact/mobile widths hide `.scroll-peek`.
- Used `top: 100vh` instead of `bottom: 0` because the Meny 3D wrapper/perspective caused fixed bottom positioning to resolve against page height in the local browser check.

## Verification
- Syntax checks passed:
  - `node --check rebuild/app.js`
  - `node --check rebuild/collection-data.js`
- Local route returned HTTP 200:
  - `http://127.0.0.1:8768/collection/2023.smallcard/`
- Playwright check at 1280x720:
  - after ~2.9s: class `title-settled is-scroll-peek-ready`, opacity about `0.96`, image visible by about 99px from bottom.
  - after scrolling to 180px: class includes `has-scrolled`, opacity becomes `0`.
- Capture:
  - `captures/16-scroll-peek-cue.png`

## Notes
- The title blur animation is still visually active at the screenshot moment because the existing title style uses alternate blur; the cue starts after the requested delay and can be tuned if the user wants a later or stronger peek.
