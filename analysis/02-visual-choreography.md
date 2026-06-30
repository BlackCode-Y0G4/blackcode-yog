# Reframed Recovery - Visual Choreography Notes

## Global Motifs

- High-contrast black/white editorial system.
- Persistent animated noise overlay.
- Thin geometric background lines and star/cross symbols.
- Four-corner navigation, uppercase labels, hover blur/inversion behavior.
- Center top close button on subpages.
- `Unhuman` display typeface for the homepage `REFRAMED` wordmark.

## Home

Observed production behavior:

- White background with low-opacity technical line drawing.
- Main wordmark is oversized and partially cropped by the viewport.
- `GETTING` sits above the hero wordmark.
- The wordmark scrambles random letters on load, then resolves to `REFRAMED`.
- Mouse distance drives blur on the split characters.
- Clicking the wordmark navigates to `/about/`.
- Hovering nav labels switches the page into dark mode and replaces hero with contextual title/subtitle:
  - Examples / Design Inspiration influences and outputs
  - About / Reframed manifesto
  - SAVEE / Reframed Presence on savee
  - Instagram / Reframed Presence on Instagram

v0 status:

- Recreated wordmark, scramble, mouse blur, dark hover titles, noise, and basic technical background.
- Background SVG/star composition is approximate, not 1:1.
- Hero crop/position still needs tighter matching to production screenshots.

## Examples List

Observed production behavior:

- Horizontal draggable carousel with 5 project thumbnails.
- Custom circular `DRAG` cursor appears over carousel.
- Cards animate in from the right.
- Close arrow returns to `/`.
- Original carousel uses GSAP Draggable + Inertia.

v0 status:

- Recreated horizontal scroll list, project cards, image data, close control, and cursor label.
- Inertia/drag physics are not yet matched; browser native horizontal scrolling is used.
- Card spacing is close but needs screenshot-based tuning.

## About

Observed production behavior:

- Black background.
- Text panel sits right/lower on desktop.
- About content advances by clicking outlined action buttons.
- First slide offers two branches.
- Subsequent actions route to `/examples/`.

v0 status:

- Recreated slide data and branching controls.
- Layout and motion are approximate.
- Button disabled/animated states from production are not yet 1:1.

## Example Detail

Observed production behavior:

- Black detail pages.
- Fixed global nav and close arrow.
- Case-study grid separates inspiration references and design outputs.
- Images are arranged in a sparse 7-column rhythm with deliberate empty slots.
- Custom cursor label changes to `ENLARGE`.
- Social links appear at the bottom.

v0 status:

- Recreated all 5 detail routes, title, inspiration/output grids, image IDs, captions, and social links.
- Grid placement keeps empty slots from the extracted data, but spacing/scale differs from production.
- Enlarge overlay/lightbox behavior is not yet implemented.

## Shader / Canvas Assessment

No `canvas` elements were found in runtime DOM for inspected pages, and no WebGL context was observed. Current evidence suggests this project does not require shader extraction. The unavailable Chrome DevTools MCP is therefore not blocking v0, but would be needed if later inspection reveals hidden WebGL effects.
