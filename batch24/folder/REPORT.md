# Folder / Detail (slug `folder`) — replica report

## What was built
- Standalone `index.html` in this directory (26 KB, inline CSS + JS, system fonts only, no deps).
- Replicates affectUI **Folders / Detail** (inside a folder): sticky breadcrumbs (`Files / <name>`), back button, blue folder mark + title header, actions (More menu, Share, Upload files + hidden multi-file input), preview file-card grid, skeleton loading grid, and empty state.
- Demo data used **verbatim** from `demo-original.js`: `Q3 Campaign` (Campaign-Brief/DOC/2 hours ago, Launch-Plan/PDF/Yesterday, Media-Budget/XLS/Yesterday, Ad-Copy/DOC/3 days ago, Results-Q2/XLS/Last week), `Brand assets` (3 files), `Hiring` (4 files), `Research` (2 files). Upload classification matches original (`xlsx/csv/numbers→XLS`, `pdf→PDF`, else `DOC`, `edited: Just now`, prepended, toast `N file(s) uploaded`).
- Interactions: folder tabs to switch folders, More → Rename (`Rename is coming soon`), Copy link (`Link copied`), Delete (`Folder deleted`), Share (`Link copied`), Upload (real file picker + `addUploads` API), file click/Enter opens (`Opened <name>` + selected ring), Empty toggle, Loading toggle, theme toggle, Esc closes menu, toasts.

## What matches the original
- Structure/classes from the `k` CSS string: crumbs (sticky, 48px, 13px muted), back link, `folder-head` (mark 26px, title, actions right), `folder-files/file-grid` (flex wrap, 12px gap, 20px top margin), meta `TYPE · edited` single-line ellipsis, skeleton widths `[112,92,120,76,104]`, empty (`No files yet` + `Start a chat…` + `Work in folder`).
- Tokens: light `surface #ffffff/page #fafaf9/ink #171717/muted #78716c/subtle #f5f5f4/border #e7e5e4`, radii 16/10/6, `999px` pills, soft shadow, 150–200 ms transitions, hover lift, focus-visible outline; dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`, amber dark `#fbbf24/#451a03/#fde68a`.
- v4: `/*noflash*/` guard first in `<head>` (theme from `affectui-folder-theme` or `prefers-color-scheme` before paint) + `html{background}` + `meta color-scheme`; **in-place updates only** — DOM built once, folder/loading/empty/upload/toast/theme all mutate existing nodes (`textContent`/classes/`hidden`/styles), pooled file cards are never removed (pool only grows/hides), zero `innerHTML` writes.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (card 16 / preview 6 + 10 padding), shadow for elevation + border for structure, preview `inset 0 0 0 1px` outline (black 10 % / white 10 %), icon-side `margin-left:-2px` optical nudge.

## What could not be verified
- No browser was used (per task: node only). Visual pixel-match vs. the original screenshots, real clipboard writes, and native file-picker UX were not eyeballed — covered by DOM/text + token asserts instead.
- The original `component-DjUu9PLY.js` file-card preview internals (`f`, `a[type]`) are minified away; preview treatment (badge + large type glyph on subtle surface) is a faithful approximation, noted here.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Switch folders via tabs, try Upload/Share/More/Empty/Loading, toggle theme (top-right), narrow the window for stacked layout.
- Node-only verification (no browser, in-dir):
  - `node --check harness.js`
  - `node harness.js` — asserts visible painted text (all verbatim file names per folder), full-loop node identity (same card objects across Q3→Brand→Hiring→Research→Q3 + upload + empty), zero `innerHTML` writes after init, and light AND dark themes keep files painted.

## Verification
- `node --check harness.js`: OK.
- `node harness.js`: **HARNESS PASSED** (all asserts above pass).
- Checked light (`data-theme="light"`) and dark (`data-theme="dark"`) — files, empty state, and chrome stay legible in both; no grey-on-grey, borders visible.
- Clean-room: written from the public description/demo behaviour; no verbatim copy from any fetched bundle.
