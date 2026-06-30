# 10 Hover Title Typography And Blur Effect

Date: 2026-06-30

## Problem
- The large title shown while hovering the four corner navigation links used a Helvetica-like display style instead of the production Title component look.
- It lacked the reference site's SplitText-style per-character rolling/random reveal and continuous per-character blur effect.

## Production Reference
- Source snapshot `assets/Title-6147f743.js` shows hover titles use the shared Title component:
  - Unhuman font via `u-a1`.
  - SplitText chars.
  - `gsap.from(... scale: .9, duration: 3.5, ease: circ.out)` entrance.
  - Random A-Z character cycling before settling to original letters.
  - Per-character repeating blur animation from `blur(0px)` to `blur(5px)` with staggered delay.
- Home main title uses `u-a2`; nav hover title uses `u-a1`, so hover should match the Title component behavior and font family, not Helvetica.

## Fix
- Changed hover title DOM from plain text to the same `.char` split structure used by the main title implementation.
- Hover title now calls `scramble()` so it gets the A-Z rolling reveal effect.
- Kept hover title single-line by disabling the `REFRAMED` mid-word `<br>` split for hover labels.
- Removed the Helvetica override from `.hover-word`.
- Set `.hover-word` to Unhuman Title-component sizing equivalent to production `u-a1`.
- Added `.hover-word .char` animation `title-char-blur` for the staggered continuous blur roll.
- Kept the main title's original pointer-distance blur behavior separate; the new constant blur animation is only on hover titles.

## Verification
- `node --check rebuild/app.js` passed.
- Local rebuild home returned HTTP 200.
- Headless Edge + Playwright verified all four nav hover titles:
  - `Examples`, `About`, `SAVEE`, `Instagram` all render `.hover-title`.
  - Font family is `Unhuman, sans-serif`.
  - Title entrance animation is `hero-in`.
  - Character animation is `title-char-blur`.
  - Hover titles are split into `.char` nodes and stay single-line (`brCount=0`).
  - Body dark state is enabled during hover.
- Main title remains `Unhuman` and does not receive constant `.char` animation; it keeps its pointer-distance blur logic.

## Captures
- `captures/10-hover-title-examples-unhuman-blur.png`
