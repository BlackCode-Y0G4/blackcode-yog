# Priority Feature Rebuild Pass - 2026-06-30

## Scope
- Rebuilt production-priority visual/interaction details in `rebuild/` after the initial v0:
  - production SVG background/stars/barcode fragments
  - four-corner navigation and external-link arrow SVG
  - GSAP-like horizontal examples drag with inertia
  - project image enlarge/lightbox
  - production-like detail page scroll structure

## Production Evidence Added
- Downloaded missing detail-page production chunks that were referenced by captured HTML but absent from the first asset pass:
  - `source-snapshot/assets/monoform-e2a1cd6f.js`
  - `source-snapshot/assets/ExamplePage-c7d67b2d.js`
  - `source-snapshot/assets/ExamplePage-c5409c4d.css`
- Synced those chunks into `production-mirror/assets/` so local production baseline detail pages can run.
- `ExamplePage-c5409c4d.css` and `ExamplePage-c7d67b2d.js` show the real detail page contract:
  - white initial background with fixed `Inspo` title/subtitle
  - two 5-column grids, first for inspiration and second for output
  - second grid starts after `padding-top: 100vh`
  - grids are positioned upward by `top: -20vh`
  - scroll transition switches title from `Inspo` to `Output` and toggles dark body state
  - enlarge cursor is active only around images, not always visible

## Local Changes
- `rebuild/app.js`
  - split homepage `REFRAMED` into per-character spans and restored two-line Unhuman layout
  - added production arrow-left SVG for close controls
  - added route-specific document titles
  - added pointer-drag inertia for examples carousel
  - reworked detail pages to the production scroll narrative model
  - preserved local lightbox enlarge interaction
  - hid custom cursor by default and activates it on carousel/image hover
- `rebuild/styles.css`
  - aligned production typography, nav spacing, close button sizing, examples card spacing, and detail grid CSS
  - added production-like 5-column detail placement classes from item `position`

## Verification Artifacts
- `analysis/priority-feature-verification.json`
  - background SVG true, 5 example cards, drag changes transform, Monoform has 14 images, lightbox opens, 0 console errors
- `analysis/priority-feature-verification-tuned.json`
  - homepage hero matches production-mirror dimensions around 790x250
  - examples first card aligns to production-mirror around x=112 y=210
  - close button aligned to production after follow-up CSS adjustment
- `analysis/detail-scroll-verification.json`
  - top state: white background, `Inspo`, 14 images, no broken images
  - scrolled state: `Output`, dark body state
  - lightbox still opens, 0 console errors
- `analysis/final-smoke-verification.json`
  - final detail top smoke: cursor opacity 0, phase `Inspo`, 14 images, 0 broken images, 0 console errors

## Key Screenshots
- Production/mirror references:
  - `captures/mirror-stable-home-1280x720.png`
  - `captures/mirror-stable-examples-1280x720.png`
  - `captures/mirror-fixed-detail-monoform-top-1280x720.png`
- Local current outputs:
  - `captures/local-tuned-home-1280x720.png`
  - `captures/local-tuned-examples-1280x720.png`
  - `captures/local-detail-scroll-top-1280x720.png`
  - `captures/local-detail-scroll-output-1280x720.png`
  - `captures/local-detail-scroll-lightbox-1280x720.png`
  - `captures/local-final-detail-top-1280x720.png`

## Remaining Deltas / Next Work
- Detail page title rendering is now structurally close but still not exact:
  - production `Inspo` appears with stronger blur/scramble state and slightly smaller/farther placement at the captured moment
  - local detail currently reveals first image slightly higher than production; tune `top:-20vh`, title scale, and initial scroll/animation wait if pursuing tighter visual match
- Production uses GSAP ScrollTrigger scrubbing for per-image entrance; local uses CSS entrance and scroll-state thresholds. Rebuild exact scrub behavior if 1:1 motion is required.
- About page remains v0 approximation and has not yet received the same production-fragment/component-level reconstruction.
