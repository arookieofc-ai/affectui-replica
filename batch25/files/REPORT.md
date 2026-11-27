# Files — Folders / Overview (`files`)

Self-contained replica of the affectUI **Files / Folders overview** screen (slug `files`).

## What was built
- Single file `index.html` (inline CSS + JS, no external deps, system fonts only).
- Page header `Files` + sub `See files you recently used in chats and manage files saved in folders. Learn more`.
- **Folders** section: title + live count, tabs `All / Shared / Private`, sort `A–Z / Z–A`, grid/list toggle, `Search folders...` (172px), `Create folder` (primary). Folder cards show a two-tone folder mark, name (single-line ellipsis) and meta `Shared · 5 files` with a small access icon.
- **File templates** section: title + live count, tabs `All / Mine / Shared with me`, `Type` multi-filter (`Document / PDF / Spreadsheet`), sort, `Search templates...`, `Add template` (secondary). Template cards show a preview badge (`DOC / PDF / XLS` with per-type tint), name, meta `Document · Alex Morgan` + `· Shared/Private`.
- Demo data used **verbatim** from `demo-original.js` (no invented names):
  - Folders: `Q3 Campaign` (Shared, 5), `Brand assets` (Shared, 3), `Hiring` (Private, 4), `Research` (Private, 2) with the same file/file-type/edited values in the data model.
  - Templates: `Design-Book` DOC Alex Morgan, `Brand-Guidelines` PDF Jonas Weber shared, `Campaign-Budget` XLS Jonas Weber shared, `Weekly-Report` XLS Alex Morgan.
  - Current user `Alex Morgan` (so `Mine` = 2, `Shared with me` = 2).
- Behaviours matching the original: case-insensitive trimmed substring search, `localeCompare` name sort, `Untitled folder` / `Untitled folder 2…` and `Untitled` / `Untitled-2…` creation that resets tab/search (and type filter for templates), empty states (`No folders found` / `Nothing matches “q”.` / `There are no shared folders yet.` / `No folders yet…`; `No templates found` / `Try another tab, type or search.` / `No templates yet…`), hidden skeleton markup, folder click toast, keyboard tabs (arrow keys), Escape clears search / closes popover.
- Clean-room: all markup/CSS/JS written from the behaviour description. Folder artwork and icons are original drawings; no compiled source copied.

## What matches the original
- Layout: page → two panels; folder grid 4 cols / gap 11px / mt 16px; folder card 56px (48px in list), list = single column; templates wrap with 12px gap; responsive 4→2→1 columns.
- In-place updates only: DOM is built once at init; filters/sort/search/view/counts/empty-states mutate existing nodes (`textContent`, `hidden`, `appendChild` reorder). No full re-render from any handler.
- Design tokens via CSS custom properties for every colour; radius-lg 16 / radius 10 / radius-sm 6; shadow tokens; system sans, base 14px, titles 15–16px semibold, meta 12–13px muted; pills fully rounded.
- v5 polish: all `:hover` gated behind `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii; shadows for elevation / borders for structure; preview gets inset outline in black/white at 10%; icon-side padding nudged 2px.

## What could not be verified
- Pixel-exact comparison with the production screenshot (no browser in this environment). Verified via node DOM-stub harness instead.
- Exact file-type label map and file-card internals of the host `component` library; approximated as `DOC→Document, PDF→PDF, XLS→Spreadsheet` from the `groups` data.
- Real navigation target of folder click (`onNavigate`); approximated with a toast.

## How to test
- `open index.html` in a browser (or any static server). No build step.
- Toggle theme (top-right) → light/dark both finished. Try tabs, Type filter, sort, grid/list, searches (`q3`, `brand`), `Create folder`, `Add template`, Escape, narrow viewport.
- Node-only verification (no browser):
  - `node --check ./harness.js`
  - `node ./harness.js` — DOM-stub harness asserts visible painted text, full-loop node identity, zero writes after init, light + dark.

## Theme check
- Light and dark both checked in the harness (theme toggle flips `data-theme`, visible text persists, dark tokens present, noflash guard sets theme before paint).
