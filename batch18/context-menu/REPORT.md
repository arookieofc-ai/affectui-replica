# Context Menu — replica report

## What was built
ONE self-contained `index.html` (no network, system fonts, ~31KB) replicating the affectUI **Context Menu** demo: a `Files` card with 4 file rows, right-click menu at the pointer with icons, shortcuts, checks, danger item, separators and submenus.

Clean-room: all HTML/CSS/JS rewritten from observed behaviour. Original `ui-ctx` CSS and compiled menu logic were read only for behaviour/timings, never pasted verbatim.

## Matched data (verbatim from `demo-original.js`)
- Files: `export.ts` (code, #0190FE, 3180, at 5, `2m ago`, Agents), `cost-report-w45.csv` (csv, #5FC88A, 48200, at 4, `14m ago`, Evals), `Support tickets – weekly summary.pdf` (pdf, #F28A2E, 412e3, at 3, `1h ago`, Agents), `latency-by-model.png` (image, #A651F0, 96400, at 2, `Yesterday`, Experiments).
- Sizes via `J`: `3 KB`, `48 KB`, `412 KB`, `96 KB`; metas like `Agents · 3 KB · 2m ago`.
- Folders: `Evals, Agents, Experiments, Archive`. Sorts: `Newest, Name, Size`.
- File menu: `Open (⌘O)`, `Download`, `Copy link (⌘L)`, `Duplicate (⌘D)`, `Move to` (submenu, divider), `Pin to top` (checkbox), `Delete file` (danger, divider).
- Background menu: `New file (⌘N)`, `Upload…`, `Sort by` (submenu, divider).
- Messages: hint `Right-click a file or the space below – or Shift F10 on a file`; `Opened <name>`, `Downloading <name>`, `Link copied`, `<name> duplicated`, `<name> moved to <folder>`, `<name> would be deleted – kept for the demo`, `A new file would be created – kept for the demo`, `Upload – kept for the demo`.

## Matched behaviour / timings
- Open: `contextmenu` (600ms debounce), `Shift+F10` / `ContextMenu` key at `left+min(12,w/2), top+min(h,26)`, touch long-press 500ms with 10px move cancel. Close on outside `pointerdown`/`mousedown` capture, `Esc`, `Tab`, scroll/resize/blur.
- Keyboard: `ArrowUp/Down/Home/End/PageUp/PageDown`, `ArrowRight` opens submenu, `ArrowLeft` closes submenu, `Enter/Space` select, type-ahead with 700ms window.
- Submenus: open 90ms, close 220ms; glide highlight 180ms, open animation 220ms, tick draw 280ms.
- Auto-demo: on mount opens menu on second sorted row (export.ts) then blurs, mirroring original double-rAF demo.
- Tour loop (1800ms, in-place only): close+hint → file menu → Move submenu → `export.ts moved to Archive` (row meta updated in place) → bg Sort menu with sort=`name` reorder → reset to `newest`/Agents/hint. Full loop reversible.
- IN-PLACE ONLY: DOM built once at init (`buildRows`/`buildMenu`); ticks update `textContent`, `hidden`, `checked`, `style.transform/height` and reorder via `appendChild` — never `innerHTML` from timers/hover/focus. Node identity preserved.

## Design tokens / themes / header
- Tokens for light (`page #fafaf9`, `surface #ffffff`, `ink #171717`, `muted #78716c`, `subtle #f5f5f4`, `border #e7e5e4`) and dark (`page #101012`, `surface #1c1c1f`, `ink #ededed`, `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`), radius 16/10/6, shadows, 150–200ms transitions.
- `/*noflash*/` guard first in `<head>`, `meta color-scheme`, inline `html{background}` — no white first frame.
- Visible `◐ Theme` toggle top-right switches `data-theme="light"|"dark"` on `<html>`, persisted as `ctx-menu-theme`. Default = light (original demo appearance); follows `prefers-color-scheme` when unstored.
- Header pattern: `Files` + count pill (4), not generic component title. No agent pixel-marks (no agents in this component).
- Hard-won rules: `[hidden]{display:none!important}`, SVG classes only via `setAttribute`, no broad `svg{display:block}` beating hide (specific selectors only), popover close on capture so real clicks survive.

## Verification (node only, no browser)
- `node --check .main-extract.js` → `CHECK_OK`.
- `node harness.cjs` (in-dir DOM stub) → `ALL PASS`:
  - static: size, no-network, noflash, color-scheme, hidden rule, toggle, tokens light+dark, verbatim names/shortcuts/labels/messages/when, no `innerHTML` in main script.
  - runtime: script runs in stub; initial note = hint; sort = `summary,export,report,chart`; `fmt` checks; 6-tick full loop shows `export.ts moved to Archive` and `name` reorder then reset; row/note/menu node identity preserved; `innerHTMLWrites===0`; metas visible with verbatim sizes; dark `data-theme` switch works.
- Light AND dark checked: light default markup + tokens verified; dark tokens + `[data-theme="dark"]` selector + attr switch verified in harness. No grey-on-grey: muted/border pairs checked in both token sets.

## How to test
Open `index.html` in a browser. Right-click rows/background, try `Shift+F10`, long-press, hover submenus, toggle theme, watch 1.8s tour cycle.
