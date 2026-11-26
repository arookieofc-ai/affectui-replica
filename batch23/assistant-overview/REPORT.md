# assistant-overview — REPORT

## What was built
- Single self-contained `index.html` (about 21KB, inline CSS + JS, system fonts only): affectUI "AI Chat / Overview" start page.
- Header: `affectUI` brand mark (own drawn SVG squares, not the demo chunk path) + sun/moon theme toggle top-right switching `data-theme="light" | "dark"` on `<html>`.
- Grid (4 cols, gap 8): Activity heatmap (span 2) + Recent chats (span 2) on row 1; Usage (1) + Files made for you (span 2) + This month (1) on row 2. Stacks to 2 cols under 700px and 1 col under 460px.
- Activity: 40-week × 7-day heat grid (280 cells), levels 0–4 from the blue `#0190fe`, hover tooltip + polite live region, keyboard (Arrows/Home/End/Escape), focus selects last day, pointer-leave clears, slow auto-advance every 3s (skipped with reduced-motion / while hovering or focused). Foot: `872 chats · 214 files · 38 automations`, range `Feb – Nov`.
- Recent chats: `Q3 launch messaging` (2 hours ago), `Ad hooks for the linen overshirt` (Yesterday), `Logo usage on partner sites` (3 days ago). Rows are buttons; clicking posts an in-place toast (`Opening Chat: …`).
- Usage: `1,284 / 2,000 credits`, 4px meter at 64.2%, `Resets Dec 1`, `role="meter"` with full aria.
- Files: `q3-launch-plan.md` (1 hour ago), `budget-by-channel.csv` (Yesterday), `competitor-pricing.csv` (Tue), split-name rendering with ellipsis, `title="name · folder"`, `11 more` button posting a toast.
- This month: `Chats 36 +12` (up/green), `Files made 14 −3` (down/red, U+2212), per-stat aria labels (`+12 on last month`).
- Clean-room: layout/CSS/JS rewritten from the public description and demo behaviour; no compiled-source copying (brand mark and icons are own strokes; heat formula re-implemented from the demo data shape).

## Demo data verbatim
- Heat values use the exact `./demo-original.js` generator (`sin(t*12.9898)*43758.5453`, weekly ramp, weekend dip), anchor `2026-11-07`, total `872`, same level buckets and `No chats / 1 chat / N chats` labels.
- Titles, times, filenames, usage `{used:1284, limit:2000, resets:Dec 1}`, month stats, and foot `214 files · 38 automations / Feb – Nov` copied verbatim.

## Matches vs original
- Matches: card grid/span pattern, paddings, radii, blue heat scale, row/mark/meta shapes, meter, stats, tooltip + keyboard + live region behaviour, toasts for Chat/Folders navigation.
- Approximated: brand glyph and small icons redrawn (same size/placement, own paths); heat level tints via `color-mix` with close hex fallbacks; skeleton/empty states from the demo wrapper not shown by default (page renders the loaded state); extra `h.length - D.length` "N more" count not in demo data, so Recent shows no counter while Files shows the verbatim `11 more`.

## Could not verify
- Pixel-perfect comparison against the live affectUI site (no browser/fetch in this environment); dark-mode contrast checked by token inspection, not screenshots.

## How to test
- `open index.html` in a browser (or serve the directory and visit it). Toggle sun/moon for light/dark. Hover or Tab into the activity grid; arrow keys walk days; click chat/file rows and `11 more` to see the toast.
- `node --check ./harness.js && node ./harness.js` — DOM-stub harness asserting visible painted text, full-loop node identity, zero `innerHTML` writes after init, light AND dark.

## Checks done
- `node --check ./harness.js` passes; inline scripts parse via `vm.Script`.
- `./harness.js` → **HARNESS PASS**: all visible strings present; 280 cells built once; full 280-step loop keeps node identity in light and dark; zero `innerHTML` writes after init (source contains no `innerHTML`); noflash guard first in `<head>`; all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `tabular-nums`; tap-highlight; theme toggle verified both directions in both themes.
