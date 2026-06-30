# BLACKCODE.YOG

Recovered static rebuild of the BLACKCODE.YOG personal website.

## Project Structure

- `rebuild/` - deployable static website files.
- `analysis/` - recovery notes and verification records.
- `captures/` - local visual QA screenshots.
- `production-mirror/` - mirrored production assets used during recovery.
- `source-snapshot/` - original production HTML/assets snapshots.
- `YOG114/` - preserved backup checkpoint.

## Local Preview

Serve the deployable site from `rebuild/`:

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory rebuild
```

Then open `http://127.0.0.1:8768/`.

## Deploy Target

Tencent CloudBase static hosting should publish the contents of `rebuild/` as the site root.
