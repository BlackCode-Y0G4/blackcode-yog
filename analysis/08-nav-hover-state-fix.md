# 08 Nav Hover State Fix

Date: 2026-06-30

## Problem
- Hovering the four corner navigation links on the home page only revealed the large hover title after the cursor left the button.
- After a hover title appeared, the home page could get stuck and fail to return to the main `REFRAMED` title.

## Root Cause
- `mouseenter` and `mouseleave` on each nav link called the full `render()` function.
- Full render replaced the nav link currently under the cursor, which destabilized native hover event ordering and could leave `currentHover` stale.

## Fix
- Added `homeTitleSection(hoverKey)` to build either the hover title or the main hero title.
- Added `setHomeHover(hoverKey)` to swap only `.hero` / `.hover-title` in the current home DOM.
- Nav DOM now remains stable during hover; hover events no longer call full page `render()`.

## Verification
- `node --check rebuild/app.js` passed.
- Local rebuild server `http://127.0.0.1:8768/` returned HTTP 200.
- Headless Edge + Playwright moved over all four nav links and back to center.
- For each of `Examples`, `About`, `SAVEE`, and `Instagram`:
  - hover state showed `.hover-title` immediately,
  - leave state restored `.hero`,
  - `.hover-title` disappeared,
  - `body.is-dark` returned to false,
  - nav count stayed 4.

## Captures
- `captures/08-nav-hover-examples.png`: hover on Examples shows the large title immediately.
- `captures/08-nav-hover-restored.png`: moving away restores the main home title.
