# 15 Collection Motion Refinement

## Reference
- Original production bundle `source-snapshot/assets/ExamplePage-c7d67b2d.js` uses GSAP ScrollTrigger for each image wrapper.
- Core behavior found in bundle:
  - image slots animate from `y: +=100%`.
  - easing: `power4.easeInOut`.
  - trigger range: `start: top bottom`, `end: bottom center`.
  - scrubbed animation: `scrub: 2`.

## Implementation
- Added per-image motion metadata in `rebuild/app.js`:
  - `data-scroll-motion="slide"`
  - `data-motion-strength="100"`
- Added `updateImageSlideMotion(view, revealRest)` to compute scroll-driven slide progress without adding GSAP.
- Added `easeInOutQuart()` as a native approximation of the original `power4.easeInOut` feel.
- Existing initial title/reveal shift now blends with scroll reveal by taking the stronger of the two offsets, avoiding over-stacking transforms.
- Disabled scroll-slide calculation on compact widths (`<= 1140px`) so mobile/flex layout keeps the original simpler behavior.
- Added CSS `will-change` and short transform transition for smoother frame-to-frame visual response.

## Verification
- Syntax checks passed:
  - `node --check rebuild/app.js`
  - `node --check rebuild/collection-data.js`
- Local server route check passed:
  - `http://127.0.0.1:8768/collection/2023.smallcard/` -> HTTP 200
- Browser motion audit showed scroll-dependent transforms:
  - at page top, upcoming images sit at roughly `translate3d(..., 100%, ...)`.
  - as images enter viewport, transforms reduce toward `none`.
  - later images retain `100%` until they approach viewport, matching original staggered scrub reveal.
- Captures:
  - `captures/15-collection-motion-dense.png`
  - `captures/15-collection-motion-sparse.png`

## Notes
- This is intentionally a native JS approximation instead of pulling GSAP back in, keeping the recovered project lightweight.
- The visual target is the original `/examples/***` slide-up scrub feeling, applied to current `/collection/***` artwork pages.
