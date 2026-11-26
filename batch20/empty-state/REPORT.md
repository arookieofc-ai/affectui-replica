# Empty State — replica report

## What was built
- Single self-contained `index.html` (19.9KB, inline CSS+JS, system fonts only) replicating affectUI `Empty State` (slug `empty-state`, component, Feedback, Free).
- Public description: Placeholder for empty lists or panels with icon, title, line, and first-step button.
- Layout mirrors `demo-original.js` verbatim structure:
  - `section[aria-label="Schedules"]` with `Schedules 0` label + framed empty state (`No schedules yet` / `Runs you ask an agent to repeat show up here, with their next time.` / `New schedule` with plus icon, calendar tile icon).
  - `aside[aria-label="Run details"]` with `Run details` head + bare+tall empty state (`Nothing open` / `Pick a run to see its steps, tokens and cost.`, activity tile icon).
- Clean-room: all CSS/SVG hand-written. No copied bundle source. Icons are original calendar / pulse / plus drawings (same meaning, not the compiled path data). Styles reproduce the original values (44px tile, 12px tile radius, 16px frame radius, 48/24/52 padding, 1px dashed frame, 430px text cap, 13.5px/20px helper text) via own code + CSS tokens.
- Interactive (in-place only): `New schedule` / `Simulate incoming schedule` reveals prebuilt rows (0→3), row click selects run and swaps panel empty→detail, `Reset to empty` restores. Auto-refresh timer updates `Live · updated Xs ago in loop` every 2s + subtle tile pulse. Count pill, `44k / 200k` context bar, meta line all update via `textContent`/attributes only.

## What matches the original
- Dashed frame vs bare variants, centered column, icon tile with shadow, title 14px/500, helper 13.5px balanced, action row with 20px top margin, 560px narrow tightening.
- Theming via ancestor `data-theme="dark"` + same token names (`--aui-*` mapped to local tokens).
- Verbatim demo copy (7 strings above + `0`) present as painted text.

## In-place / v4 / v5 compliance
- DOM built once at init (3 schedule rows prebuilt hidden); ticks/loop/clicks only mutate `textContent`, `hidden`, `attributes`, `style`, `classList`. No `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere in shipped JS.
- `<head>` starts with `/*noflash*/` setter (storage key `est-theme` → `prefers-color-scheme`), inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}`, `<meta name="color-scheme" content="light dark">`.
- v5: all `:hover` inside `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (12px tile → 16px frame); borders for structure + shadows for elevation; `img` inset outline rule; button icon optical nudge (`padding-left 11px` vs 13px).
- v3 notes: token bar is static `44k / 200k` + 3px bar (no percentages); no agent pixel-marks — N/A (empty-state demo has no agents); dimmed/ellipsis/single-line rules applied to schedule rows; panel `min-height` preserves bottom padding.

## What could not be verified
- No browser available per task constraints; verified with node stub only. Real paint, focus ring rendering, `text-wrap: balance` support, and exact Hugeicons glyph shapes not pixel-compared.
- Original `est-demo` container CSS beyond `ui-est` was not in the chunk; classic two-column page+panel layout inferred from class names.

## How to test
- `open index.html in a browser` (double-click `index.html`).
- Click `New schedule` 1–3× → list appears, count pill increments, panel shows run detail on row click. `Reset to empty` restores both empties.
- Toggle sun/moon (top-right): checked finished in **light AND dark** — no grey-on-grey, borders visible, amber live pill adjusted for dark.
- Node-only verification (no browser/tools outside this dir):
  - `node --check ./harness.js`
  - `node ./harness.js` → 51/51 PASS (visible text, full-loop (6 ticks) node identity, zero markup rewrites after init, light+dark themes).
