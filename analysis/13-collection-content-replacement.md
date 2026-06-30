# 13 Collection Content Replacement

## Request
Use `C:/Users/yoga/Desktop/2023.yog/` as the source artwork archive. Group the website by source folders, use image filenames as work names, rename the Examples entry to Collection, and keep the original `/examples/monoform/`-style detail layout and interactions while replacing images/text.

## Source Groups
- `2023.small card` -> `/collection/2023.smallcard/` with 10 images.
- `draw` -> `/collection/draw/` with 3 images.
- `PAD.draw` -> `/collection/pad.draw/` with 4 images.
- `photograph` -> `/collection/photograph/` with 2 images.

## Implementation
- Copied artwork into `rebuild/assets/collection/` using URL-safe filenames.
- Generated `rebuild/collection-data.js` with folder groups and image metadata.
- Added `collection-data.js` to `index.html` and all generated route `index.html` files.
- Replaced the main navigation/side menu `Examples` entry with `Collection`.
- Changed main route from `/examples/` to `/collection/` while preserving compatibility redirects for existing `/examples/` app routes.
- Added static direct entry files for:
  - `/collection/`
  - `/collection/2023.smallcard/`
  - `/collection/draw/`
  - `/collection/pad.draw/`
  - `/collection/photograph/`
- Detail pages reuse the original Reframed detail structure: fixed phase title, scroll-reactive title layer, image grid, cursor-enlarge behavior, and lightbox.
- Detail phase title is now `WORKS`; subtitle is the folder/group name.
- Social links on collection detail pages point to BILIBILI and STEAM.

## Verification
- `node --check rebuild/app.js`: passed.
- `node --check rebuild/collection-data.js`: passed.
- Local server `http://127.0.0.1:8768/collection/`: returned 200.
- Direct route checks returned 200 for all collection routes.
- Browser audit for `/collection/` found 4 cards with correct collection links and local image assets.
- Browser audit for `/collection/draw/` found 3 work images with filenames preserved as titles:
  - `核战废土场景设计`
  - `基础写生`
  - `精微素描`
- Screenshots:
  - `captures/13-collection-index.png`
  - `captures/13-collection-draw-detail.png`

## Notes
Internal CSS class names still include `examples-*` because they preserve the recovered page's existing carousel/detail styling. User-facing navigation and routes now use Collection.
