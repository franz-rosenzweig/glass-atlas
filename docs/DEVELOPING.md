<sub>[Glass Atlas docs](README.md) › Under the hood</sub>

# Developing Glass Atlas

The working notes for running Glass Atlas from the repository, finding your way around the code, and checking a change before it goes anywhere. Most of this was the README until the README became the front page. The ground rules for changing the app itself (the colour tokens, light and dark, the medical-content rules) are in [CLAUDE.md](../CLAUDE.md), so read that before you change anything in `app/`.

## Run it

Glass Atlas is a static app with no build step: `app/index.html` plus ES modules, with three.js and the fonts bundled in `app/vendor/`. It uses ES modules and loads its data with `fetch`, so it needs to be served over HTTP rather than opened as a file. From the `app/` folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/index.html>. Any static web server works (Caddy, nginx and so on), so it can sit on a homelab box as it is. Everything it loads comes from its own folder, so it works without an internet connection too.

A few things only work through a link:

- `#pots`, `#ra` or any other condition id at the end of the address opens that condition straight away, and `#sources` opens the sources.
- The theme you pick is saved in the browser under `glass-atlas-theme`, the notes under `glass-atlas-notes`, and the field guide from the dives under `glass-atlas-guide`. Nothing else is stored.

## What's in this repository

| Folder | Contents |
|---|---|
| `app/` | The complete app. `index.html` is a self-contained, fully offline copy (three.js and fonts are bundled in `vendor/`). `atlas.html` is the source exactly as published to claude.ai (dark only, before light mode), which loads three.js from a CDN. |
| `app/tour/` | Narration audio for the 13 tour stops (MP3), and `tour-script.json` holds the text and camera positions. |
| `app/anatomy.txt` | The anatomy meshes, gzip-compressed and base64-encoded; decoded in `core.js`. |
| `research/references.md` | All 87 references, with links. |
| `research/model-checks/` | Node scripts used to check the iron, thyroid, hand and gastric-emptying models against published data. |
| `build-pipeline/` | Python scripts and manifests that turned BodyParts3D STL files into `anatomy.txt` (decimate, adapt the skin surface, pack). The raw BodyParts3D download (~500 MB) isn't included; the scripts expect it at `bp3d/assets/BodyParts3D_data/stl/`. |
| `tools/check.py` | Checks that imports resolve and walks every screen in light and dark in headless Chrome. Run it before pushing. |
| `tools/` | Headless-browser screenshot and test scripts (Playwright) and the Piper text-to-speech script used for the narration. Paths inside them point at the original build machine and need adjusting. |
| `notes/` | Export of the app's shared notes (empty) and where local notes live, see [notes/README.md](../notes/README.md). |
| `screenshots/` | Older screens from the offline copy, dark and light. The pictures in these docs are in `docs/images/`. |
| `docs/` | These pages. |

Glass Atlas started as a published claude.ai artifact. This copy was exported on 13 October 2026 from version 12 of that artifact, and light mode was added on 17 October 2026. Notes in the self-hosted copy are saved to the browser only; the shared notes database and viewer names exist only in the claude.ai version.

## The files in `app/`

- `core.js`: renderer, camera, anatomy loading, picking
- `data.js`: conditions, medicines, alerts, emergency cards
- `refs.js`: the references
- `stations.js` to `stations4.js`: the instruments (tilt table, Beighton, neck, hand, stomach, thyroid, MCAS, iron, seizure threshold, lumbar, cervix, endometriosis, medicines planner)
- `dive.js` and `dive-*.js`: the cell- and molecule-level dives and the field guide
- `web.js`, `day.js`, `notes.js`, `tour.js`, `kit.js`: connections, the day view, notes, the tour, shared helpers
- `theme.js`: light and dark. CSS tokens for the panels, `light-dark()` pairs for inline colours, and a remap for every 2D canvas (lightness turned over in OKLCH, hue kept), so the drawing code doesn't need to know which theme is on

## Light and dark

Dark is the original look, and light is the same specimen in daylight: paper instead of the dark case, ink instead of bone, and the microscope switches from darkfield to brightfield. `theme.js` does it in three ways, so the drawing code never has to know which theme is on:

- **The panels** use the CSS tokens in `index.html` (`var(--bone)`, `var(--line)`, `rgb(var(--hi) / .05)` and so on), which `<html data-theme="light">` swaps.
- **Colours written into inline styles** go through `cc(hex)`, a `light-dark()` pair that follows the theme by itself.
- **Every 2D canvas** has its colours remapped while the theme is light: lightness turned over in OKLCH and the hue kept. A scene drawn in true colours, like a stained slide or bone, runs inside `natural()`, where only the dark ground and the lettering flip, and a picture of real tissue opts out with `data-raw`.

The 3D scene has its own light setup (`A.setTheme` in `core.js`), and light-coloured 3D overlay materials are made with `A.tm(...)` so they flip with the theme too.

## Walking the screens from the console

Once the app has loaded, `window.__ready` is true and `window.__atlas` lets a script (or you, in the browser's console) walk every screen:

| Call | Opens |
|---|---|
| `__atlas.open('pots')` | a condition, on its Instrument tab |
| `__atlas.openMed('levothyroxine')`, `__atlas.openMed(null)` | one medicine, or the planner for the whole day |
| `__atlas.openSources()` | the sources and review |
| `__atlas.startDive('ra')` | a dive, and then `__atlas.dive.api.go('lining')` moves to a level |
| `__atlas.tour.start()` | the guided tour |
| `__atlas.closeAll()` | back to the body |

The condition ids are `pots`, `heds`, `mcas`, `hashi`, `enceph`, `iron`, `gastro`, `carth`, `c67`, `lspurs`, `lsil`, `ra` and `endo`. The dives and their levels are `ra` (`joint`, `lining`, `molecule`), `hashi` (`slide`, `follicle`), `mcas` (`skin`, `mast`), `pots` (`circuit`, `rhythm`) and `iron` (`villi`, `cell`).

## Checking a change

`tools/check.py` is the check to run before pushing anything:

```sh
python3 tools/check.py              # both checks; screenshots go to /tmp/glass-atlas-check/
python3 tools/check.py --static     # only the import check (no browser needed)
```

The first part checks that every import in `index.html` and the modules resolves to a real file. The second serves `app/` on a free local port, drives headless Chrome over DevTools through `window.__atlas`, and walks every screen in light and then in dark: the home view, all thirteen conditions, the medicines, the sources, the connections, the day, the notes, the emergency card, the medicines list, every level of every dive with its field guide, and the tour. It fails on any page error, and it saves a screenshot of each screen, which you should look at too, since a screen can load and still look wrong.

It needs Chrome (set `CHROME=/path/to/chrome`; the default is Chrome for Testing in `~/.local/opt`) and the Python package `websocket-client`. `CHECK_OUT=` puts the screenshots somewhere else, and `CHECK_EXTRA=shots.json` also shoots screens the standard walk doesn't reach: a JSON list of `{"name", "js", "wait"}` steps, saved as `<theme>-extra-<name>.png`.

Every screen has to work in light and dark, on a phone (390 px wide) and on a desktop, so check all four when you change one.

## The anatomy

The meshes come from BodyParts3D, and `build-pipeline/` is how they became `app/anatomy.txt`: `decimate.py` brings each part down to a budget of triangles (with more detail kept where the case needs it, like the neck vertebrae and the C6 disc), `adapt.py` adapts the skin surface, and `pack.py` packs everything into one quantized binary, which is then gzip-compressed and base64-encoded. `manifest.json`, `names.tsv`, `paths.txt` and the STL lists say which BodyParts3D parts went in and what they're called. The meshes stay under CC BY-SA 2.1 Japan, see [NOTICE](../NOTICE).

## The research

[research/references.md](../research/references.md) lists all 87 references the app cites, grouped as in the app's Sources panel, and `research/model-checks/` has the small Node scripts that checked the iron, thyroid, hand and gastric-emptying models against published data. A new clinical claim or number needs a real source in `refs.js`, shown with `srcLine([...])`.
