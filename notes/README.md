# Notes

`notes-export.json` is an export of the app's shared notes database (the "Notes on the body" panel) taken on 13 October 2026. It was empty: no notes had been saved to the shared database.

If notes were written while the panel was in local mode (shown when the shared database isn't available), they live only in that browser's localStorage under the key the app uses, and can't be exported from here. The field guide from the dives is stored the same way, under `glass-atlas-guide`.

In the self-hosted copy (`app/index.html`), the shared database doesn't exist, so the Notes panel always runs in local mode.
