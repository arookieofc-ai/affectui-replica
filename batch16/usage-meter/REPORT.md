# Usage Meter — Replica Report

## What was built
ONE self-contained `index.html` (40.5 KB, no network, system fonts) replicating the affectUI `Usage Meter` component: Plan + AI credit usage meter with category stack, sparkline, limits, alerts.

Layout (matches original `demo-original.js` + CSS `ne`):
- Card in tray: `Acme AI` title + `Pro plan · Resets in 9 days` sub + period switch (`This month` / `Last month` / `7 days` with sliding pill).
- Figure: big animated used number + `of 10,000 credits` + pct badge with warn dot.
- Bar: stacked category segments (10px track), hover tooltip, keyboard arrows, `role=meter`.
- Legend: rows with swatch, label, value, share %; leaving rows collapse (Image hides in 7d).
- Daily: `Per day` head with `Avg N / day` or selected day, 30/30/7 spark bars, hover + keyboard.
- Limits: `Seats`, `Storage`, `Projects` grid with thin 4px bars, unlimited hatched for Projects, warn/limit dots.
- Foot: status (`X credits left` / `Running low` / `Limit reached` + over) + action button (`Upgrade` ↔ `Add credits` strong).
- Live region `aria-live=polite` with same strings as original (`Acme AI: limit reached…` etc).
- Visible theme toggle (top-right, sun/moon) switching `data-theme="light"|"dark"` on `<html>`.

Clean-room: wrote own HTML/CSS/JS from observed behaviour, did not copy compiled source verbatim (own class names `um__*`, own animation loop).

## Matched data / behaviour (verbatim from demo-original.js)
- Title `Acme AI`, plan `Pro plan`, total `10000`, unit `credits`, `warnAt 0.8`, `Upgrade` / `Add credits`.
- Periods: `month/This month`, `last/Last month`, `7d/7 days`.
- month used: Chat 3980, Search 1640, Image 1120, API 680 (sum 7420); limits Seats 8/10, Storage 3.2/5 GB, Projects 12/null; daily `y(start-21,22,7420,11,30)`.
- last used: Chat 5210, Search 2140, Image 1690, API 960 (sum 10000); limits Seats 10/10, Storage 2.9/5 GB, Projects 11/null; daily `y(start-51,30,10000,29)`.
- 7d used: Chat 1260, Search 540, API 340 (sum 2140, no Image); limits same as month; daily `y(start-6,7,2140,5)`.
- Daily generator replicated: weekend ×0.45, `(0.7+rnd*0.6)*(1+k/t/3)` with LCG `a=a*16807%2147483647`, rounding + fix-last, labels `MMM d`, `null` futures (8 futures in month).
- Reset: `todayMidnight+9d` → `Resets in 9 days` (same `u()` logic: today/tomorrow/>60 full date).
- Timings: first animate 1200ms, subsequent 650ms, `easeOutQuart`, leaving collapse; auto-loop `3600ms → last, +3200 → 7d, +3200 → month`, cancelled on `pointerdown/keydown` capture.
- Formatting: `Intl.NumberFormat en-US`, `<1` for 0<val<1, limits decimals (int+unlimited→0 else 1), `>999` pct cap, `Avg` = rounded mean of valued days (337/333/306).
- States: `ok` (month 74%, 7d 21%) → `Upgrade` + `2,580`/`7,860 left`; `limit` (last 100%) → `Limit reached` + `Add credits`.

## Design tokens / themes
- Light: page `#fafaf9`, surface `#ffffff`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg 16px, radius 10px, radius-sm 6px, shadow as spec; all colours via CSS vars.
- Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`; amber `#fbbf24` on `#451a03` text `#fde68a`.
- Default = original appearance (light); `/*noflash*/` guard in `<head>` (reads `usage-meter-theme` or `prefers-color-scheme` before paint) + `html{background…}` + `meta color-scheme`.
- Checked both: light default renders, toggle to dark keeps contrast (no grey-on-grey, borders visible), toggle back works (harness asserts).
- v3 notes: header is `Acme AI + plan·reset + period switch` (not generic title); no agent identities → no 3×3 pixel-marks (N/A); titles single-line ellipsis; `[hidden]{display:none}` present; no SVG (so no className-on-SVG); hover/focus only update classes/text, never full render.

## In-place updates
- DOM built once in `init()` (`build()`); timers/ticks only update `textContent/style/attrs` on existing nodes. Zero `innerHTML` in file (verified by grep + harness counter).
- Pill positioned via `offsetLeft/Width` + `ResizeObserver`; guarded for 0-width stub.
- Popover/tooltip opens on `pointerdown` (+ `pointermove` for mouse) per hard-won rule; user `pointerdown/keydown` on root cancels auto-loop via capture listener.

## Verification (node only, no browser)
- `node --check .main-extract.js` (extracted main `<script>`): PASS.
- In-dir harness `harness.cjs` (DOM stub, mock timers/rAF, `IntersectionObserver` immediate):
  - init exposes `window.__um`; pumps 1500ms animation.
  - VISIBLE text (skips `[hidden]`, `display:none`, `[data-leaving]`) asserts: `Acme AI`, `Pro plan`, `This month/Last month/7 days`, `Chat/Search/Image/API` (month), `Seats/Storage/Projects`, `Per day`, `of 10,000 credits`, `Resets`, `7,420` + `2,580 left` + `Upgrade` (month) → `10,000` + `Limit reached` + `Add credits` (last) → `2,140` + no `Image` + `7,860 left` + `Upgrade` (7d) → `7,420` + `Image` again (loop).
  - Node identity across full loop: `els` container + `title/big/rowChat/segChat/limSeats/day0` same objects: PASS.
  - Zero `innerHTML` writes after init: PASS.
  - Theme toggle light→dark→light: PASS (light AND dark checked).
  - Result: `ALL CHECKS PASSED`.

## How to test
- `node --check` extracted script + `node harness.cjs` in this dir, or open `index.html` in a browser, watch auto-rotation (3.6s/6.8s/10s), hover bar/legend/spark, arrow keys, period switch, theme toggle, resize to 360px.

## Gaps
- Leaving animation simplified to CSS grid collapse (no 460ms removal timer; nodes kept hidden to preserve identity — visually equivalent).
- Spark `dense/many` + `regrow` stagger + `nudge/pop` keyframes trimmed for size; core rise/hover kept.
- `onUpgrade` is noop in original; replica shows transient `…clicked` live text (button still works + hover).
