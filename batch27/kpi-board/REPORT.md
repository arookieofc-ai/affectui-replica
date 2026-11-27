# KPI Board — replica report

## What was built
Standalone `index.html` (43KB, no external deps, system fonts) replicating the affectUI **KPI Board** (`kpi-board`, Analytics): dashboard top with three trend cards, comparison chart, focus card, rolling numbers.

- Top bar: `Dashboard` heading + `Last 7/30/90 days` range picker + sun/moon theme toggle (top-right).
- Three trend cards: `Total revenue` (money), `Emails sent` (count), `Refunds` (count, lower-is-better) with sparkline, animated total, `▲/▼ % vs. last period`.
- Comparison card: `Sales overview` with `All items / Pro / Team` segment picker, current-vs-previous area chart (190px), legend `Last period $ / This period $`, date ticks (`… Today`).
- Focus card: `Pro license / One-time`, `Licenses sold`, big rolling figure + `% vs. last period` (or day label on hover), interactive sparkline (pointer hover/click + ←/→/Home/End/Esc keyboard), legend, `Set up` and `See full analytics` buttons with demo status toast.
- Rolling numbers: easeOutQuart 760ms lerp on every range/segment change, `tabular-nums`, `prefers-reduced-motion` disables animation.
- Auto-loop: cycles `30d → 7d → 90d …` every 3.6s until first pointer/key/focus interaction (matches original `N` demo wrapper).

## Demo data (verbatim)
Numbers are the exact seeded series from `demo-original.js` (seeded PRNG `T`, labels `O`, series `k`, assembly `A`/`j`, anchor `12 Oct 2026`):
- Ranges `7d (21 pts, step 1/3)`, `30d (30 pts, step 1)`, `90d (45 pts, step 2)`; segments `all/pro/team` (pro = 0.64×, team = 0.36× overview variants).
- Stats previous, overview previous, focus previous all use the original `×0.83 / ×0.89` factors. Verified spot values: 7d revenue total `1387`, 30d revenue total `6061`, focus 30d head `[23,21,23,25,26]`.
- Code is clean-room (own DOM/SVG, own class names); only the numeric datasets match the original. No compiled source copied.

## What matches / what was simplified
- Matches: layout (6-col grid, 3×span-2 + span-4 overview + span-2 focus), card style (1px border + soft shadow, hover lift, focus-visible ring, 150–200ms transitions), pickers (combobox + listbox keyboard: Up/Down/Home/End/Enter/Space/Esc/Tab), change badges with direction triangles, money/count formatting (`−$`, `—`, `en-US`), tokens + dark theme.
- Simplified: charts are hand-drawn SVG polylines (no external chart lib); x-axis reduced to 3 tick labels (first/mid/`Today`) instead of full tick row; auto-scale wrapper (`ResizeObserver` zoom) omitted — page is natively responsive via media queries (≤820px/≤600px stack).

## Spec compliance (v2–v5)
- Tokens via CSS vars for every color; light (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`) and dark (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`); amber kept for waiting states; pills 999px; card padding 16px, gaps 8px.
- Dark toggle on `<html data-theme>` + `localStorage ui-kb-theme`, default follows `prefers-color-scheme`.
- v4: `<head>` starts with `/*noflash*/` guard + `html{background}` + `meta color-scheme`; DOM built once, timers/hover update only text/attrs/`d` in place; harness asserts node identity across a full loop + zero `innerHTML` writes.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (card 20 / inner 8–10); shadows for elevation, borders for structure; icon optical nudge (`margin-right:-2px`).

## What could not be verified
- Pixel-exact match to the original hosted screenshot (no browser available in this environment).
- Real pointer hit-testing on SVG (stub has no layout; `getBoundingClientRect` path guarded).
- `prefers-color-scheme` media and `localStorage` persistence across reloads (covered by unit logic, not a live browser).

## How to test
- Open `index.html` in a browser. Switch ranges, segments, hover/click the focus sparkline, toggle sun/moon, narrow the window.
- Node-only (no browser): `node --check verify.js && node verify.js` — DOM-stub harness asserts visible painted text, full-loop node identity (24 key nodes), value changes across ranges, segment/focus interactions, zero `innerHTML` writes, and light + dark themes.
- Checked 2026-11-27: `node --check` clean, `ALL CHECKS PASSED`, light AND dark verified in-harness (visible text intact in both).
