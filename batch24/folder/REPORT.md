# Folders / Overview (slug `files`) + Folder Detail — replica report

## What was built
- Standalone `index.html` in this directory (32 KB, inline CSS + JS, system fonts only, no deps).
- Replicates affectUI **Folders / Overview (slug `files`, App screens, Pro)** as interactive folder overview: folder tabs (Q3 Campaign / Brand assets / Hiring / Research), search, sort, grid/list toggle, templates filter, plus detail view inside a folder.
- Detail chrome kept from `demo-original.js`: sticky breadcrumbs (`Files / <name>`), back button, blue folder mark + title, actions (More menu, Share, Upload files + hidden multi-file input), preview file-card grid, skeleton loading, empty state.
- Overview toolbar added:
  - Tabs: switch folders in place, `aria-selected`.
  - Search: `Search files` input, case-insensitive substring, hides non-matches in place.
  - Sort: `Default / Name A-Z / Type` select, rebinds text in place, no rebuild.
  - Grid/List toggle: `Grid` / `List` segmented buttons, toggles `.list` class on grid (full-width cards, short preview).
  - Templates: `Templates: All / DOC / PDF / XLS` pills filter by type.
- Demo data used **verbatim** from `./demo-original.js`: `Q3 Campaign` (Campaign-Brief/DOC/2 hours ago, Launch-Plan/PDF/Yesterday, Media-Budget/XLS/Yesterday, Ad-Copy/DOC/3 days ago, Results-Q2/XLS/Last week), `Brand assets` (3 files), `Hiring` (4 files), `Research` (2 files). Upload classification matches original (`xlsx/csv/numbers→XLS`, `pdf→PDF`, else `DOC`, `edited: Just now`, prepended).
- Interactions: tabs, search/sort/view/templates (in-place), More → Rename (`Rename is coming soon`), Copy link / Share (`Link copied`), Delete (`Folder deleted`), Upload (real picker + `addUploads`), file click/Enter (`Opened <name>` + selected ring), Empty/Loading demo pills, theme toggle, Esc closes menu, toasts.

## What matches the original
- Structure from `k` CSS string: crumbs (sticky 48px 13px muted), back link, folder-head (mark 26px, title, actions), file-grid (flex wrap 12px gap 20px top), meta `TYPE · edited` ellipsis, skeleton widths `[112,92,120,76,104]`, empty (`No files yet` + `Start a chat…` + `Work in folder`).
- Tokens: light `surface #ffffff/page #fafaf9/ink #171717/muted #78716c/subtle #f5f5f4/border #e7e5e4`, radii 16/10/6, `999px` pills, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`, 150–200ms transitions, hover lift, focus-visible; dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`, amber dark `#fbbf24/#451a03/#fde68a`.
- v4: `/*noflash*/` guard first in `<head>` (theme from `affectui-folder-theme` or `prefers-color-scheme` before paint) + `html{background}` + `meta color-scheme`; **in-place updates only** — DOM built once, folder/search/sort/view/loading/empty/upload/toast/theme all mutate `textContent`/class/`hidden`/styles on existing nodes, pooled cards never removed (pool only grows/hides), zero `innerHTML` writes.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radius (card 16 / preview 6 + 10 padding), shadow for elevation + border for structure, preview `inset 0 0 0 1px` outline (black 10% / white 10%), icon-side `margin-left:-2px` optical nudge.

## What could not be verified
- No browser used (per task: node only). Visual pixel-match vs original screenshots, real clipboard writes, native file-picker UX not eyeballed — covered by DOM/text + token asserts.
- Original `component-DjUu9PLY.js` file-card preview internals (`f`, `a[type]`) minified away; preview (badge + large type glyph on subtle surface) is faithful approximation. Overview sort order for `edited` strings not defined in demo, so sort offers Default/Name/Type only.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Switch folder tabs, type in Search, change Sort, toggle Grid/List, filter Templates, try Upload/Share/More/Empty/Loading, toggle theme (top-right), narrow window for stacked layout.
- Node-only verification (no browser, in-dir):
  - `node --check harness.js`
  - `node harness.js` — asserts VISIBLE painted text (all verbatim file names + Grid/List + Templates + Search/Sort + Files/Share/Upload), full-loop node identity (same card objects across Q3→Brand→Hiring→Research→Q3 + search/sort/view/templates + upload + empty), zero `innerHTML` writes after init, and light AND dark themes keep files painted.

## Verification
- `node --check harness.js`: OK.
- `node harness.js`: **HARNESS PASSED**.
- Checked light (`data-theme="light"`) and dark (`data-theme="dark"`) — files, toolbar, empty state, chrome legible in both; no grey-on-grey, borders visible.
- Clean-room: written from public description/demo behaviour; no verbatim copy from fetched bundle.
