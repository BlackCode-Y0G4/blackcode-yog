# 14 Collection Detail Spacing

## Issue
- Collection detail pages felt too dense after replacing examples with user artwork.
- Some works were too close to the viewport edge.
- Sparse folders (for example `photograph`) had too much vertical blank space after an initial spacing pass.

## Changes
- Added collection density classes in `app.js`: `collection-sparse`, `collection-medium`, `collection-dense`.
- Rebalanced generated empty slots so many-image pages still scroll long, while 2-4 image pages do not become excessively tall.
- Replaced inline collection image `maxWidth` with a CSS variable so CSS can consistently cap detail-page image width.
- Increased horizontal page padding for collection grids and centered edge-column slots to keep artwork away from the browser edge.
- Tuned sparse/medium top and bottom padding downward to reduce excess empty space.
- Changed `.detail-title-inner` from `top: 50%` to `top: 50vh` so the fixed WORKS title stays centered inside the Meny perspective wrapper.

## Verification
- Syntax checks passed:
  - `node --check rebuild/app.js`
  - `node --check rebuild/collection-data.js`
- Local server returned HTTP 200 on `http://127.0.0.1:8768/collection/`.
- Browser audit at 1280x720:
  - `/collection/2023.smallcard/`: 10 images, scrollHeight about 5408px, minimum horizontal image edge about 90px.
  - `/collection/draw/`: 3 images, scrollHeight about 3241px, minimum horizontal image edge about 90px.
  - `/collection/photograph/`: 2 images, scrollHeight about 2729px, minimum horizontal image edge about 90px.
- Captures:
  - `captures/14-collection-dense-spacing.png`
  - `captures/14-collection-dense-spacing-scrolled.png`
  - `captures/14-collection-sparse-spacing.png`
  - `captures/14-collection-sparse-spacing-scrolled.png`

## Notes
- The negative top-gap values in the audit can happen when different grid columns overlap vertically in the viewport; the works remain separated horizontally, matching the original staggered Reframed style.
- Sparse pages now keep breathing room between works without adding several screens of empty tail space.
