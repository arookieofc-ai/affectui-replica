# Integration Grid — targeted fix REPORT

## Target
`./index.html` (standalone replica, honeycomb wall 7/9/7 + centre tile, 22 app tiles, tour 1600ms, Prev/Next, theme toggle).

## demo-original.js check (original behaviour)
`./demo-original.js` is:
`import{t as e}from"./jsx-runtime-CTsRTJUX.js";import{IntegrationGrid as t}from"./component-WEwHkvy1.js";...children:(0,n.jsx)(t,{})...`
i.e. it renders `IntegrationGrid` with **no props / defaults**. No custom gating, no hidden phase. The blank wall (single top row, no centre tile) and counter-vs-inspector desync are **not** original behaviour — they are replica bugs, so fixing is correct (not preserving a quirk).

## Defects (real-browser QA)
1. **Logo wall paints BLANK in light AND dark**: only a top row of 9 small white rectangles — no logos, no centre product tile, even after waiting.
2. **Tour counter desyncs from inspector**: counter `Spotlight 6 / 22 — Dropbox` while inspector still `Notion / Tile 1`.

## Root cause — exact stalling transition
**Transition `tick: spot -> spot+1` stalled `picked`.**

- `setSpot(n)` advances `spot` + `spotLabel` (counter).
- `selectApp(n)` advances `picked` + `detailName/detailMeta` (inspector).
- `tick()` was `setSpot(spot+1,false)` **only** — never `selectApp`. So every 1600ms `spot` advanced, `picked` stayed `0`.
  - After 5 ticks: `spot=5` (Dropbox, `Spotlight 6/22 — Dropbox`), `picked=0` (`Notion / Tile 1`). Exact QA symptom.
  - `focus` handler did the same direct `spot=my` mutation without `picked`.
  - `click/Prev/Next/keyboard` called both, so they stayed synced; only the auto-tour (and Tab-focus) diverged. A DOM-stub harness that set classes directly passed, because it never drove the page's own timer.
- **Wall gating**: `.tile{ ... top:calc((var(--py) - var(--sz)/2) * var(--unit);` was **missing `)`**. Real browsers drop the invalid `top` declaration → `top:auto` → all 22 tiles collapse to `y=0` single row. Unique `x` positions collapse from 23 slots to **9** (`120,280,440,600,760,920,1080,1240,1400`), i.e. the observed “top row of 9”. Centre tile (`--sz:168`) also collapses to top row, so no mid-field product tile. Edge radial mask then fades the top strip → blank/white rectangles, logos clipped/masked.

## Fix (targeted, no rebuild)
- `top:calc(... * var(--unit));` — added missing `)`. 3 rows restore: `y=33,138,243` (stage 1000px), centre `y=138.2` mid-field.
- Single-source tour state:
  ```js
  function show(n,focusIt){setSpot(n,focusIt);selectApp(spot);}
  function tick(){show(spot+1,false);}
  ```
  `click/focus/keydown/Prev/Next` now all go through `show()`. Counter (`spotLabel` via `setSpot`) + inspector (`detail*` via `selectApp`) both derive from the same normalized `spot` — they **cannot desync**.
- Preserved: `/*noflash*/` first in `<head>` + paint style + `color-scheme` meta; DOM built once, timers update only `textContent/class/style` in place; `zero innerHTML`; demo data verbatim (22 names/order/tints); `@media (hover:hover)`; `tabular-nums`; radii/shadows.

## Proof — md5 BEFORE/AFTER (must differ)
```
BEFORE: dcd515f16ffd15220412d38279b091a4  ./index.html  (saved as ./original-backup.html)
AFTER:  be3576b7ae64de54798cc0c6a388603e  ./index.html
```
`md5sum ./index.html ./original-backup.html`:
```
be3576b7ae64de54798cc0c6a388603e  ./index.html
dcd515f16ffd15220412d38279b091a4  ./original-backup.html
```

## Proof — harness FAIL (original) vs PASS (fixed)
Harness `./harness.js` rules (per spec):
- drives **page's OWN timeline from load**: `buildOnce+startTour` on load, then **fake clock** through captured `setInterval(1600)` callbacks — never `__ig.setSpot/__ig.select/__ig.tick`, never direct class/attribute sets.
- only page handlers: timer callbacks + `.click()` on Prev/Next/Theme/tile.
- asserts **PAINTED state**: `getBoundingClientRect()` geometry (3 rows, centre mid-field, size>40) + `getComputedStyle()` opacity>=0.22/visibility + `is-spot/is-picked` classes + counter-vs-inspector text at `t0..t5`, in **light AND dark**.

### Original (`node ./harness.js ./original-backup.html`, exit 1)
```
== static [./original-backup.html] ==
  info: .tile top calc balanced=false
== theme light [./original-backup.html] ==
  FAIL: 3 painted rows (found 1 y=0) — single row means top:calc dropped
  phase t0: Spotlight 1 / 22 — Notion | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  phase t1: Spotlight 2 / 22 — Stripe | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t1 inspector name Stripe, got "Notion" (desync if Notion)
  FAIL: t1 inspector Tile 2, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t1 single-source spot==picked (1 vs 0)
  phase t2: Spotlight 3 / 22 — Figma | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t2 inspector name Figma, got "Notion" (desync if Notion)
  FAIL: t2 inspector Tile 3, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t2 single-source spot==picked (2 vs 0)
  phase t3: Spotlight 4 / 22 — Linear | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t3 inspector name Linear, got "Notion" (desync if Notion)
  FAIL: t3 inspector Tile 4, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t3 single-source spot==picked (3 vs 0)
  phase t4: Spotlight 5 / 22 — HubSpot | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t4 inspector name HubSpot, got "Notion" (desync if Notion)
  FAIL: t4 inspector Tile 5, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t4 single-source spot==picked (4 vs 0)
  phase t5: Spotlight 6 / 22 — Dropbox | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t5 inspector name Dropbox, got "Notion" (desync if Notion)
  FAIL: t5 inspector Tile 6, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t5 single-source spot==picked (5 vs 0)
== theme dark [./original-backup.html] ==
  FAIL: 3 painted rows (found 1 y=0) — single row means top:calc dropped
  phase t0: Spotlight 1 / 22 — Notion | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  phase t1: Spotlight 2 / 22 — Stripe | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t1 inspector name Stripe, got "Notion" (desync if Notion)
  FAIL: t1 inspector Tile 2, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t1 single-source spot==picked (1 vs 0)
  phase t2: Spotlight 3 / 22 — Figma | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t2 inspector name Figma, got "Notion" (desync if Notion)
  FAIL: t2 inspector Tile 3, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t2 single-source spot==picked (2 vs 0)
  phase t3: Spotlight 4 / 22 — Linear | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t3 inspector name Linear, got "Notion" (desync if Notion)
  FAIL: t3 inspector Tile 4, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t3 single-source spot==picked (3 vs 0)
  phase t4: Spotlight 5 / 22 — HubSpot | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t4 inspector name HubSpot, got "Notion" (desync if Notion)
  FAIL: t4 inspector Tile 5, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t4 single-source spot==picked (4 vs 0)
  phase t5: Spotlight 6 / 22 — Dropbox | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  FAIL: t5 inspector name Dropbox, got "Notion" (desync if Notion)
  FAIL: t5 inspector Tile 6, got "Tile 1 · edge fade 0.340 · press Enter on any tile"
  FAIL: t5 single-source spot==picked (5 vs 0)
RESULT FAIL [./original-backup.html] 32 failures
EXIT:1
```

### Fixed (`node ./harness.js ./index.html`, exit 0)
```
== static [./index.html] ==
  info: .tile top calc balanced=true
== theme light [./index.html] ==
  ok: 3 painted rows (found 3 y=33,138,243) — single row means top:calc dropped
  phase t0: Spotlight 1 / 22 — Notion | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  phase t1: Spotlight 2 / 22 — Stripe | inspector=Stripe Tile 2 · edge fade 0.428 · press Enter on any tile
  phase t2: Spotlight 3 / 22 — Figma | inspector=Figma Tile 3 · edge fade 0.506 · press Enter on any tile
  phase t3: Spotlight 4 / 22 — Linear | inspector=Linear Tile 4 · edge fade 0.545 · press Enter on any tile
  phase t4: Spotlight 5 / 22 — HubSpot | inspector=HubSpot Tile 5 · edge fade 0.506 · press Enter on any tile
  phase t5: Spotlight 6 / 22 — Dropbox | inspector=Dropbox Tile 6 · edge fade 0.428 · press Enter on any tile
== theme dark [./index.html] ==
  ok: 3 painted rows (found 3 y=33,138,243) — single row means top:calc dropped
  phase t0: Spotlight 1 / 22 — Notion | inspector=Notion Tile 1 · edge fade 0.340 · press Enter on any tile
  phase t1: Spotlight 2 / 22 — Stripe | inspector=Stripe Tile 2 · edge fade 0.428 · press Enter on any tile
  phase t2: Spotlight 3 / 22 — Figma | inspector=Figma Tile 3 · edge fade 0.506 · press Enter on any tile
  phase t3: Spotlight 4 / 22 — Linear | inspector=Linear Tile 4 · edge fade 0.545 · press Enter on any tile
  phase t4: Spotlight 5 / 22 — HubSpot | inspector=HubSpot Tile 5 · edge fade 0.506 · press Enter on any tile
  phase t5: Spotlight 6 / 22 — Dropbox | inspector=Dropbox Tile 6 · edge fade 0.428 · press Enter on any tile
RESULT PASS [./index.html]
EXIT:0
```
Full harness also asserts (both themes): 22 tiles, glyph painted, centre tile mid-field `y=138.2`, `opacity>=0.22 visible`, node identity across 22-tick loop, `Next/Prev` sync, theme-button toggle still painted+synced, `zero innerHTML`, demo data verbatim, `/*noflash*/`.

## Theme confirmation
Checked light (`--page #fafaf9`, white tiles) + dark (`--page #101012`, `#1c1c1f`) via harness `light` + `dark` scenarios — both paint 3 rows, centre tile, 22 glyphs, counter==inspector at every phase. Manual browser check still recommended for final contrast.

## How to test
1. `md5sum ./index.html ./original-backup.html` (hashes above, must differ).
2. `node ./harness.js ./original-backup.html` → FAIL (exit 1, 32 failures: single row + desync).
3. `node ./harness.js ./index.html` → PASS (exit 0).
4. Open `./index.html` in browser, wait 5×1600ms → counter + inspector both reach `Spotlight 6 / 22 — Dropbox / Tile 6`; wall shows 3 honeycomb rows + bright centre tile in light and dark.
