# Detail Production Alignment Pass

Date: 2026-06-30

## Scope

- Continued from the priority feature pass and focused on `/examples/monoform/`.
- Compared the local rebuild at `http://127.0.0.1:8768/` with the captured production mirror at `http://127.0.0.1:8769/`.
- No WebGL/Canvas shader layer was found on the inspected routes, so this pass stayed on DOM/CSS/scroll animation reconstruction.

## Changes Applied

- Added the production-style Glass layer on detail pages:
  - white phase: `rgba(255,255,255,.8)` plus `backdrop-filter: blur(3px)`.
  - dark/output phase: transparent blur layer, matching the production `Glass` component on desktop.
- Moved detail navigation below the glass layer so corner labels blur like production.
- Restored production detail grid sizing:
  - image wrappers now use per-image `max-width` from extracted data.
  - grid image IDs are no longer rendered in the page grid.
  - grid captions now match `u-b0`-like 12px, line-height 1, margin reset.
- Removed the local detail flex gap and added a scroll/reveal transform for the first inspiration row to match GSAP `from(y:"+=100%")` top-state placement.
- Added character-level detail title blur animation and uppercase `INSPO` / `OUTPUT`.
- Added scroll-linked title opacity so the detail title fades to about `0.22` during grid scrolling.
- Corrected production stars horizontal padding to match `calc(5vw + 48px)` at desktop widths.

## Verification

- Syntax check passed:
  - `node --check rebuild/app.js`
- Local server:
  - `http://127.0.0.1:8768/`
- Production mirror:
  - `http://127.0.0.1:8769/`
- Console errors in local lightbox smoke test: none.

## Metric Highlights

- Detail top image placement now matches mirror:
  - production first image y: about `701.9`
  - local first image y: about `700.5`
  - production second visible image y: about `822.2`
  - local second visible image y: about `822.0`
- Detail scroll 900 image placement now matches mirror:
  - production first image y: about `-323.7`
  - local first image y: about `-324.0`
- Detail scroll 2200 output placement now matches mirror:
  - production first output image y: about `22.7`
  - local first output image y: about `22.0`
- Stars at 1280-ish viewport now match production x positions:
  - left star x: `112`
  - right star x: about `1107.7`

## Artifacts

- `analysis/detail-after-glass-reveal-compare.json`
- `analysis/final-local-smoke-2026-06-30.json`
- `captures/local-detail-after-reveal-blur-top-1280x720.png`
- `captures/local-final-home-1280x720.png`
- `captures/local-final-examples-1280x720.png`
- `captures/local-final-detail-top-1280x720.png`
- `captures/local-final-detail-scroll900-1280x720.png`
- `captures/local-final-detail-scroll2200-1280x720.png`
- `captures/local-final-detail-lightbox-1280x720.png`

## Remaining Risks

- The detail title scramble is approximated with CSS blur waves; production uses GSAP/SplitText with randomized character cycling.
- The first-row reveal is a tuned approximation of the production ScrollTrigger state rather than a full GSAP port.
- Cloudinary images are still loaded from production URLs; a complete offline recovery would need bundling or proxying those media assets.
- This pass verified desktop 1280x720 behavior. Mobile-specific verification remains a separate pass.
