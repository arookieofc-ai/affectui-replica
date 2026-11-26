# Data Table — replica report

## What was built
`index.html` (45 KB, self-contained, no network, system fonts only) — a clean-room
replica of the **Data Table** component: a spreadsheet-style table with cell selection,
editing, copy-paste, undo/redo, and sorting, presented as the original demo does
(title header + card + footer summary).

Original demo identity reproduced: header title **"Design Stack"** with the blue
list-mark icon, Undo/Redo tools, and footer hint **"Double-click a cell to edit"**.

## Original data used verbatim
- Columns: **Tool** (title, 30%), **Category** (tag, 26%), **Website** (link),
  **Renews** (text, 18%) — same keys, labels, types, widths, and column icons
  (rows / grid / link / calendar glyphs).
- Rows (exact strings): Figma / Design / https://figma.com / Mar 12, 2026;
  Linear / Issue tracking / https://linear.app / Jan 4, 2026;
  Vercel / Hosting / https://vercel.com / Aug 21, 2026;
  Framer / Website / https://framer.com / May 2, 2026;
  Loom / Video / https://loom.com / Nov 18, 2026.
- Tag tones: Design→violet, Issue tracking→blue, Hosting→gray, Website→pink,
  Video→green. Link cells strip `https://` for display; title cells show logo +
  name with "Untitled" fallback; empty state "No rows yet".
- Behaviour matched: click/shift-click/drag selection, Ctrl/Cmd+A select-all,
  arrows/Home/End/Tab navigation with Shift-extend and Ctrl-jump, header click
  cycles asc→desc→unsorted, double-click/Enter/single-key editing (text input +
  fixed tag picker), number parsing with `−` (U+2212) display, TSV copy/cut/paste
  with single-value fill over a range, Delete/Backspace clears range, undo/redo
  stacks (cap 100, header buttons with Ctrl/Cmd+Z / Shift+Z labels, disabled when
  empty), row checkboxes + header mixed state, footer bulk bar ("N selected",
  Delete, Clear) vs "Add row", live summary ("A1" cell ref, "N values · Sum X",
  polite aria-live), `Ctrl` vs `⌘` per platform.

## Spec compliance
- Design tokens as CSS custom properties; light default (matches the original
  demo's light appearance); dark theme via `html[data-theme]` with adjusted
  surfaces, tag tones, and focus ring; visible sun/moon toggle top-right.
- `/*noflash*/` early-theme guard first in `<head>` + matching inline
  `html{background}` + `meta color-scheme`. No agent identities exist in this
  component, so no pixel-marks apply (correctly omitted).
- IN-PLACE UPDATES ONLY: DOM built once at init; selection/hover/focus never
  rebuild — paint functions only toggle attributes/text on existing nodes.
  Data changes (edit/sort/add/delete/undo/paste) rebuild only `<tbody>` via DOM
  APIs, never `innerHTML` (zero `innerHTML` writes anywhere in the page script).
- Clean-room: all markup/CSS/JS rewritten from observed behaviour; brand logos
  and icons redrawn as simplified originals; no compiled-source copying.
- Hard-won rules: tag picker closes via document `pointerdown` capture;
  `[hidden]{display:none}` guard present (sole `display:none` in CSS); SVG
  classes set via `setAttribute`; no `className` assignment; no
  `visibility:hidden` / `color:transparent` / `font-size:0` in CSS.

## Verification (node only — no browser available, none installed)
- `node --check` on the extracted page script: **passes**.
- In-dir stub-DOM harness `verify-harness.js` (loads the real page script,
  advances timers 5 rounds, simulates pointer/keyboard/click events):
  **ALL CHECKS PASSED (light AND dark)** — 100+ assertions, including:
  - all verbatim strings present as *visible* text (33 text nodes, none hidden
    by display/visibility/transparent/zero-size rules);
  - default theme light under `prefers-light` (= original demo appearance),
    dark under `prefers-dark`; toggle flips both ways with text still visible;
  - cell count stable across timer advancement; every `td` keeps object
    identity across the loop **and** across selection updates;
  - zero `innerHTML` writes total, including after selection + editor-open
    interactions; selection paints `A1` summary in place; Enter opens the
    editor prefilled with `Figma`; undo disabled at init; `No rows yet`
    correctly hidden while rows exist.
- Rerun: `node verify-harness.js` in this directory.

## How to test
Open `index.html` in a browser. Click/drag cells, Shift-click to extend,
double-click to edit, try Ctrl+C/V, Ctrl+Z, header sorting, row checkboxes,
Add row/Delete, and the Dark/Light toggle (check both themes).
